/**
 * SkillSense AI - Optimized Groq AI Service
 *
 * Optimizations:
 * 1. Tiered models — fast 8b for chat/simple, 70b for complex analysis
 * 2. JSON mode (response_format) — guaranteed valid JSON, fewer tokens
 * 3. Tuned max_tokens per endpoint — no wasted tokens
 * 4. Lower temperature for structured output (0.3) vs creative (0.7)
 * 5. In-memory response cache for duplicate prompts (5 min TTL)
 * 6. Retry with exponential backoff on 429
 */

import Groq from 'groq-sdk';

// ─── Config ─────────────────────────────────────
const GROQ_API_KEY = process.env.GROQ_API_KEY || '';
let groqClient: Groq | null = null;

// Tiered models
const FAST_MODEL = 'llama-3.1-8b-instant';     // Chat, quick evals — blazing fast
const SMART_MODEL = 'llama-3.3-70b-versatile';  // Resume analysis, roadmaps, deep evals

function getClient(): Groq {
  if (!groqClient) {
    if (!GROQ_API_KEY) throw new Error('GROQ_API_KEY is not set in environment variables');
    groqClient = new Groq({ apiKey: GROQ_API_KEY });
  }
  return groqClient;
}

// ─── Simple LRU Cache (5 min TTL) ──────────────
const cache = new Map<string, { data: string; exp: number }>();
const CACHE_TTL = 5 * 60 * 1000;

function getCached(key: string): string | null {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() > entry.exp) { cache.delete(key); return null; }
  return entry.data;
}

function setCache(key: string, data: string): void {
  // Evict oldest if cache grows too big
  if (cache.size > 100) {
    const oldest = cache.keys().next().value;
    if (oldest) cache.delete(oldest);
  }
  cache.set(key, { data, exp: Date.now() + CACHE_TTL });
}

// ─── Core Generation ────────────────────────────
interface GenerateOpts {
  system: string;
  user: string;
  model?: string;
  maxTokens?: number;
  temperature?: number;
  jsonMode?: boolean;
  cacheKey?: string;
}

async function generate(opts: GenerateOpts): Promise<string> {
  const {
    system,
    user,
    model = SMART_MODEL,
    maxTokens = 2048,
    temperature = 0.4,
    jsonMode = false,
    cacheKey,
  } = opts;

  // Check cache
  if (cacheKey) {
    const hit = getCached(cacheKey);
    if (hit) return hit;
  }

  const client = getClient();
  const maxRetries = 2;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const params: any = {
        model,
        messages: [
          { role: 'system', content: system },
          { role: 'user', content: user },
        ],
        temperature,
        max_tokens: maxTokens,
      };
      if (jsonMode) {
        params.response_format = { type: 'json_object' };
      }

      const completion = await client.chat.completions.create(params);
      const text = completion.choices[0]?.message?.content || '';

      if (cacheKey) setCache(cacheKey, text);
      return text;
    } catch (error: any) {
      const status = error?.status || error?.statusCode;
      const msg = error?.message || '';
      if (status === 429 || msg.includes('429') || msg.includes('rate_limit')) {
        if (attempt < maxRetries) {
          const waitMs = (attempt + 1) * 3000; // 3s, 6s
          console.log(`Rate limited, retrying in ${waitMs / 1000}s (attempt ${attempt + 1}/${maxRetries})...`);
          await new Promise(r => setTimeout(r, waitMs));
          continue;
        }
        throw new Error('AI service is temporarily unavailable due to API rate limits. Please wait a minute and try again.');
      }
      throw error;
    }
  }
  throw new Error('AI generation failed after retries');
}

// Multi-turn chat generation
async function generateChat(
  messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>,
  model = FAST_MODEL,
  maxTokens = 1024,
): Promise<string> {
  const client = getClient();
  const maxRetries = 2;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const completion = await client.chat.completions.create({
        model,
        messages,
        temperature: 0.7,
        max_tokens: maxTokens,
      });
      return completion.choices[0]?.message?.content || '';
    } catch (error: any) {
      const status = error?.status || error?.statusCode;
      const msg = error?.message || '';
      if (status === 429 || msg.includes('429') || msg.includes('rate_limit')) {
        if (attempt < maxRetries) {
          await new Promise(r => setTimeout(r, (attempt + 1) * 3000));
          continue;
        }
        throw new Error('AI service is temporarily unavailable due to API rate limits. Please wait a minute and try again.');
      }
      throw error;
    }
  }
  throw new Error('AI generation failed after retries');
}

// ─── JSON Extractor ─────────────────────────────
function extractJSON<T>(text: string): T {
  const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  const jsonStr = jsonMatch ? jsonMatch[1].trim() : text.trim();
  return JSON.parse(jsonStr) as T;
}

// ==========================================
// Resume Analysis
// ==========================================
export interface ResumeAnalysisResult {
  overallScore: number;
  atsScore: number;
  strengths: string[];
  weaknesses: string[];
  missingKeywords: string[];
  suggestions: string[];
  experienceLevel: string;
  summary: string;
}

export interface ResumeRoastResult {
  roastComments: string[];
  improvementTips: string[];
  memeVerdict: string;
}

export async function analyzeResume(
  resumeText: string,
  targetRole: string,
  targetField: string,
): Promise<ResumeAnalysisResult> {
  const text = await generate({
    model: SMART_MODEL,
    system: 'You are an expert ATS and career coach. Respond with ONLY valid JSON.',
    user: `Analyze this resume for "${targetRole}" in ${targetField}.\n\nRESUME:\n${resumeText}\n\nReturn JSON: {"overallScore":0-100,"atsScore":0-100,"strengths":["..."],"weaknesses":["..."],"missingKeywords":["..."],"suggestions":["..."],"experienceLevel":"entry|mid|senior","summary":"2-3 sentences"}`,
    jsonMode: true,
    maxTokens: 1500,
    temperature: 0.3,
  });
  return extractJSON<ResumeAnalysisResult>(text);
}

export async function roastResume(
  resumeText: string,
  targetRole: string,
): Promise<ResumeRoastResult> {
  const text = await generate({
    model: FAST_MODEL,
    system: 'You are a witty resume critic. Respond with ONLY valid JSON.',
    user: `Roast this resume for "${targetRole}".\n\nRESUME:\n${resumeText}\n\nReturn JSON: {"roastComments":["5-7 sarcastic observations"],"improvementTips":["3-5 useful tips"],"memeVerdict":"funny one-liner"}`,
    jsonMode: true,
    maxTokens: 1024,
    temperature: 0.8,
  });
  return extractJSON<ResumeRoastResult>(text);
}

// ==========================================
// Mock Interview
// ==========================================
export interface InterviewQuestion {
  question: string;
  category: string;
  difficulty: string;
  tips: string;
}

export interface InterviewEvaluation {
  overallScore: number;
  softSkillScore: number;
  technicalScore: number;
  communicationScore: number;
  feedback: string;
  questionEvaluations: Array<{
    question: string;
    score: number;
    evaluation: string;
    idealAnswer: string;
    areasToImprove: string;
  }>;
}

export async function generateInterviewQuestions(
  targetRole: string,
  difficulty: 'easy' | 'intermediate' | 'hard',
  resumeText?: string,
  focusArea?: string,
): Promise<InterviewQuestion[]> {
  const cacheKey = `iq:${targetRole}:${difficulty}:${focusArea || ''}`;
  const text = await generate({
    model: FAST_MODEL,
    system: `You are an expert interviewer for ${targetRole}. Respond with ONLY valid JSON.`,
    user: `${resumeText ? `CANDIDATE BACKGROUND:\n${resumeText}\n` : ''}${focusArea ? `FOCUS: ${focusArea}\n` : ''}DIFFICULTY: ${difficulty}\n\nGenerate 5 questions. Return JSON array: [{"question":"...","category":"technical|behavioral|situational","difficulty":"${difficulty}","tips":"..."}]`,
    jsonMode: true,
    maxTokens: 1500,
    temperature: 0.6,
    cacheKey,
  });
  const parsed = extractJSON<any>(text);
  // Groq JSON mode may wrap array in an object like { questions: [...] }
  const questions: InterviewQuestion[] = Array.isArray(parsed) ? parsed : (parsed.questions || parsed.data || []);
  return questions;
}

export async function evaluateInterviewAnswer(
  question: string,
  answer: string,
  targetRole: string,
  conversationHistory: Array<{ role: string; content: string }>,
): Promise<{ feedback: string; score: number; followUp?: string }> {
  const historyStr = conversationHistory.slice(-6).map(h => `${h.role}: ${h.content}`).join('\n');
  const text = await generate({
    model: FAST_MODEL,
    system: `You are an interviewer for ${targetRole}. Respond with ONLY valid JSON.`,
    user: `HISTORY:\n${historyStr}\n\nQUESTION: ${question}\nANSWER: ${answer}\n\nReturn JSON: {"feedback":"brief note","score":1-10,"followUp":"next question or null"}`,
    jsonMode: true,
    maxTokens: 512,
    temperature: 0.4,
  });
  return extractJSON<{ feedback: string; score: number; followUp?: string }>(text);
}

export async function generateInterviewEvaluation(
  targetRole: string,
  conversationHistory: Array<{ role: string; content: string }>,
): Promise<InterviewEvaluation> {
  const historyStr = conversationHistory.map(h => `${h.role}: ${h.content}`).join('\n');
  const text = await generate({
    model: SMART_MODEL,
    system: 'You are an expert interview evaluator. Respond with ONLY valid JSON.',
    user: `Evaluate mock interview for ${targetRole}.\n\nTRANSCRIPT:\n${historyStr}\n\nReturn JSON: {"overallScore":0-100,"softSkillScore":0-100,"technicalScore":0-100,"communicationScore":0-100,"feedback":"3-4 sentences","questionEvaluations":[{"question":"...","score":0-10,"evaluation":"...","idealAnswer":"...","areasToImprove":"..."}]}`,
    jsonMode: true,
    maxTokens: 2500,
    temperature: 0.3,
  });
  return extractJSON<InterviewEvaluation>(text);
}

// ==========================================
// Career Roadmap
// ==========================================
export interface CareerRoadmap {
  introduction: string;
  currentLevel: string;
  targetLevel: string;
  estimatedDuration: string;
  timelineSteps: Array<{
    phase: string;
    duration: string;
    title: string;
    description: string;
    skills: string[];
    projects: string[];
    resources: string[];
    milestones: string[];
  }>;
  finalAdvice: string;
}

export async function generateCareerRoadmap(
  currentSkills: Array<{ name: string; level: number }>,
  targetRole: string,
  experienceLevel?: string,
): Promise<CareerRoadmap> {
  const skillsStr = currentSkills.map(s => `${s.name}:${s.level}/5`).join(', ');
  const cacheKey = `road:${targetRole}:${skillsStr}:${experienceLevel || ''}`;

  const text = await generate({
    model: SMART_MODEL,
    system: 'You are an expert career coach. Respond with ONLY valid JSON.',
    user: `SKILLS: ${skillsStr}\nTARGET: ${targetRole}\n${experienceLevel ? `LEVEL: ${experienceLevel}` : ''}\n\nCreate career roadmap. Return JSON: {"introduction":"2-3 sentences","currentLevel":"entry|junior|mid|senior","targetLevel":"...","estimatedDuration":"e.g. 6-12 months","timelineSteps":[{"phase":"Phase 1","duration":"Months 0-2","title":"...","description":"...","skills":["..."],"projects":["..."],"resources":["real course/book names"],"milestones":["..."]}],"finalAdvice":"motivational advice"}\n\nInclude 4-6 steps with SPECIFIC real resources.`,
    jsonMode: true,
    maxTokens: 3000,
    temperature: 0.5,
    cacheKey,
  });
  return extractJSON<CareerRoadmap>(text);
}

// ==========================================
// AI Chat (uses fast model, multi-turn)
// ==========================================
export async function chatWithAI(
  message: string,
  conversationHistory: Array<{ role: string; content: string }>,
  userContext?: { skills?: string[]; targetRole?: string; name?: string },
): Promise<string> {
  const ctx = userContext
    ? `\nUser: ${userContext.name || 'User'}, Skills: ${userContext.skills?.join(', ') || 'N/A'}, Target: ${userContext.targetRole || 'N/A'}`
    : '';

  const messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [
    {
      role: 'system',
      content: `You are SkillSense AI, an expert career advisor.${ctx}\nBe concise, actionable. Use markdown. Under 250 words.`,
    },
  ];

  // Keep last 8 messages to save tokens
  for (const h of conversationHistory.slice(-8)) {
    messages.push({
      role: h.role === 'assistant' ? 'assistant' as const : 'user' as const,
      content: h.content,
    });
  }
  messages.push({ role: 'user', content: message });

  return generateChat(messages, FAST_MODEL, 1024);
}

// ==========================================
// Skill Extraction
// ==========================================
export async function extractSkillsFromResume(
  resumeText: string,
): Promise<{ skills: Array<{ name: string; level: string; category: string }> }> {
  const text = await generate({
    model: FAST_MODEL,
    system: 'You are an expert skill extractor. Respond with ONLY valid JSON.',
    user: `Extract skills from resume.\n\nRESUME:\n${resumeText}\n\nReturn JSON: {"skills":[{"name":"...","level":"beginner|intermediate|advanced|expert","category":"technical|soft|domain"}]}`,
    jsonMode: true,
    maxTokens: 1024,
    temperature: 0.2,
  });
  return extractJSON<{ skills: Array<{ name: string; level: string; category: string }> }>(text);
}

// ==========================================
// AI Assessment Generation
// ==========================================
export async function generatePersonalizedAssessment(params: {
  targetRole: string;
  experienceLevel: string;
  currentSkills: string[];
  focusAreas: string[];
}): Promise<{
  title: string;
  description: string;
  questions: Array<{
    id: string;
    text: string;
    type: 'multiple_choice' | 'self_rating' | 'scenario_based';
    options?: Array<{ id: string; text: string; isCorrect: boolean }>;
    skillArea: string;
    difficulty: string;
  }>;
}> {
  const text = await generate({
    model: SMART_MODEL,
    system: `You are an expert skill assessment designer. You create personalized, adaptive assessments to accurately evaluate a candidate's skill level. Design questions that range from foundational to advanced based on experience level. Respond with ONLY valid JSON.`,
    user: `Create a personalized skill assessment for:
- Target Role: ${params.targetRole}
- Experience Level: ${params.experienceLevel}
- Current Skills: ${params.currentSkills.join(', ') || 'Not specified'}
- Focus Areas: ${params.focusAreas.join(', ') || 'General'}

Generate exactly 10 questions with a mix of:
- 6 multiple_choice questions (test practical knowledge relevant to the role)
- 2 scenario_based questions (test real-world problem solving with options)
- 2 self_rating questions (self-assessment of specific skills)

For ${params.experienceLevel} level, calibrate difficulty:
- Beginner: fundamentals + basic concepts
- Junior: applied knowledge + common patterns  
- Mid-Level: design decisions + optimization + best practices
- Senior: architecture + trade-offs + leadership scenarios

Return JSON:
{
  "title": "Personalized [Role] Assessment",
  "description": "Brief description of what this assessment evaluates",
  "questions": [
    {
      "id": "q1",
      "text": "Question text?",
      "type": "multiple_choice",
      "options": [
        {"id": "a", "text": "Option A", "isCorrect": false},
        {"id": "b", "text": "Option B", "isCorrect": true},
        {"id": "c", "text": "Option C", "isCorrect": false},
        {"id": "d", "text": "Option D", "isCorrect": false}
      ],
      "skillArea": "React",
      "difficulty": "intermediate"
    },
    {
      "id": "q7",
      "text": "Rate your proficiency with [specific skill]",
      "type": "self_rating",
      "skillArea": "TypeScript",
      "difficulty": "self-assess"
    }
  ]
}`,
    jsonMode: true,
    maxTokens: 3000,
    temperature: 0.4,
  });
  return extractJSON<any>(text);
}

export const aiService = {
  analyzeResume,
  roastResume,
  generateInterviewQuestions,
  evaluateInterviewAnswer,
  generateInterviewEvaluation,
  generateCareerRoadmap,
  chatWithAI,
  extractSkillsFromResume,
  generatePersonalizedAssessment,
};
