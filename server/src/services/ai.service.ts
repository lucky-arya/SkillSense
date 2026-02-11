/**
 * SkillSense AI - Gemini AI Service
 * 
 * Wraps Google Generative AI SDK for all AI-powered features:
 * - Resume analysis & scoring
 * - Mock interview generation
 * - Career roadmap generation
 * - AI chat assistant
 */

import { GoogleGenerativeAI, GenerativeModel } from '@google/generative-ai';

// Initialize Gemini
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';
let genAI: GoogleGenerativeAI | null = null;
let flashModel: GenerativeModel | null = null;
let proModel: GenerativeModel | null = null;

function getGenAI(): GoogleGenerativeAI {
  if (!genAI) {
    if (!GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY is not set in environment variables');
    }
    genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
  }
  return genAI;
}

function getFlashModel(): GenerativeModel {
  if (!flashModel) {
    flashModel = getGenAI().getGenerativeModel({ model: 'gemini-2.0-flash' });
  }
  return flashModel;
}

function getProModel(): GenerativeModel {
  if (!proModel) {
    proModel = getGenAI().getGenerativeModel({ model: 'gemini-2.0-flash' });
  }
  return proModel;
}

// ==========================================
// Helper: Parse JSON from AI response
// ==========================================
function extractJSON<T>(text: string): T {
  // Try to extract JSON from markdown code blocks first
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
  targetField: string
): Promise<ResumeAnalysisResult> {
  const model = getFlashModel();
  
  const prompt = `You are an expert ATS (Applicant Tracking System) and career coach. Analyze this resume against the target role.

TARGET ROLE: ${targetRole}
TARGET FIELD: ${targetField}

RESUME:
${resumeText}

TASK: Provide a comprehensive analysis. Return ONLY a valid JSON object with this exact structure:
{
  "overallScore": <number 0-100>,
  "atsScore": <number 0-100>,
  "strengths": ["strength1", "strength2", "strength3"],
  "weaknesses": ["weakness1", "weakness2", "weakness3"],
  "missingKeywords": ["keyword1", "keyword2", "keyword3"],
  "suggestions": ["actionable suggestion 1", "actionable suggestion 2", "actionable suggestion 3"],
  "experienceLevel": "entry|mid|senior",
  "summary": "2-3 sentence overall assessment"
}

Be specific and actionable. Score honestly.`;

  const result = await model.generateContent(prompt);
  const text = result.response.text();
  return extractJSON<ResumeAnalysisResult>(text);
}

export async function roastResume(
  resumeText: string,
  targetRole: string
): Promise<ResumeRoastResult> {
  const model = getFlashModel();
  
  const prompt = `You are a brutally honest but helpful resume critic known for your witty, sarcastic commentary. Roast this resume.

TARGET ROLE: ${targetRole}

RESUME:
${resumeText}

Return ONLY a valid JSON object:
{
  "roastComments": ["5-7 sarcastic but professional observations about the resume's flaws"],
  "improvementTips": ["3-5 actually useful tips to fix the roasted parts"],
  "memeVerdict": "A single funny one-liner verdict (e.g., 'This resume commits more crimes than it solves.')"
}

Be funny but keep it professional. The goal is to entertain while providing real value.`;

  const result = await model.generateContent(prompt);
  const text = result.response.text();
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
  focusArea?: string
): Promise<InterviewQuestion[]> {
  const model = getFlashModel();
  
  const prompt = `You are an expert interviewer for ${targetRole} positions.
${resumeText ? `\nCANDIDATE BACKGROUND:\n${resumeText}\n` : ''}
${focusArea ? `FOCUS AREA: ${focusArea}\n` : ''}
DIFFICULTY: ${difficulty}

Generate 5 interview questions. Mix behavioral and technical questions.
For ${difficulty} difficulty:
- easy: foundational concepts, basic behavioral
- intermediate: practical scenarios, system design basics
- hard: complex architecture, advanced behavioral, edge cases

Return ONLY a valid JSON array:
[
  {
    "question": "The question text",
    "category": "technical|behavioral|situational",
    "difficulty": "${difficulty}",
    "tips": "Brief tip on what the interviewer is looking for"
  }
]`;

  const result = await model.generateContent(prompt);
  const text = result.response.text();
  return extractJSON<InterviewQuestion[]>(text);
}

export async function evaluateInterviewAnswer(
  question: string,
  answer: string,
  targetRole: string,
  conversationHistory: Array<{ role: string; content: string }>
): Promise<{ feedback: string; score: number; followUp?: string }> {
  const model = getFlashModel();
  
  const historyStr = conversationHistory
    .map(h => `${h.role}: ${h.content}`)
    .join('\n');
  
  const prompt = `You are interviewing a candidate for ${targetRole}.

CONVERSATION SO FAR:
${historyStr}

CURRENT QUESTION: ${question}
CANDIDATE'S ANSWER: ${answer}

Evaluate the answer and provide a follow-up question if appropriate.
Return ONLY a valid JSON object:
{
  "feedback": "Brief internal note about answer quality",
  "score": <1-10>,
  "followUp": "Next question or follow-up (null if interview should move to next topic)"
}`;

  const result = await model.generateContent(prompt);
  const text = result.response.text();
  return extractJSON<{ feedback: string; score: number; followUp?: string }>(text);
}

export async function generateInterviewEvaluation(
  targetRole: string,
  conversationHistory: Array<{ role: string; content: string }>
): Promise<InterviewEvaluation> {
  const model = getFlashModel();
  
  const historyStr = conversationHistory
    .map(h => `${h.role}: ${h.content}`)
    .join('\n');
  
  const prompt = `You are evaluating a mock interview for ${targetRole}.

FULL INTERVIEW TRANSCRIPT:
${historyStr}

Provide a comprehensive evaluation. Return ONLY a valid JSON object:
{
  "overallScore": <0-100>,
  "softSkillScore": <0-100>,
  "technicalScore": <0-100>,
  "communicationScore": <0-100>,
  "feedback": "3-4 sentence overall assessment",
  "questionEvaluations": [
    {
      "question": "The question asked",
      "score": <0-10>,
      "evaluation": "How well they answered",
      "idealAnswer": "What a strong answer would include",
      "areasToImprove": "Specific improvement suggestion"
    }
  ]
}

Be constructive but honest.`;

  const result = await model.generateContent(prompt);
  const text = result.response.text();
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
  experienceLevel?: string
): Promise<CareerRoadmap> {
  const model = getFlashModel();
  
  const skillsStr = currentSkills
    .map(s => `${s.name}: ${s.level}/5`)
    .join(', ');
  
  const prompt = `You are an expert career coach creating a personalized learning roadmap.

CURRENT SKILLS: ${skillsStr}
TARGET ROLE: ${targetRole}
${experienceLevel ? `EXPERIENCE LEVEL: ${experienceLevel}` : ''}

Create a detailed, actionable career roadmap to bridge the skill gaps. Return ONLY a valid JSON object:
{
  "introduction": "Encouraging 2-3 sentence intro personalized to their situation",
  "currentLevel": "entry|junior|mid|senior",
  "targetLevel": "The level of the target role",
  "estimatedDuration": "e.g., '6-12 months'",
  "timelineSteps": [
    {
      "phase": "Phase 1",
      "duration": "Months 0-2",
      "title": "Build Foundations",
      "description": "What this phase focuses on",
      "skills": ["Specific skill 1", "Specific skill 2"],
      "projects": ["Concrete project idea 1"],
      "resources": ["Specific course/book/tutorial with real names"],
      "milestones": ["Measurable milestone 1"]
    }
  ],
  "finalAdvice": "Motivational closing advice"
}

Include 4-6 timeline steps. Be SPECIFIC about resources (use real course names, books, websites). Projects should be concrete and portfolio-worthy.`;

  const result = await model.generateContent(prompt);
  const text = result.response.text();
  return extractJSON<CareerRoadmap>(text);
}

// ==========================================
// AI Chat Assistant
// ==========================================
export async function chatWithAI(
  message: string,
  conversationHistory: Array<{ role: string; content: string }>,
  userContext?: { skills?: string[]; targetRole?: string; name?: string }
): Promise<string> {
  const model = getFlashModel();
  
  const systemContext = userContext
    ? `\nUSER CONTEXT: Name: ${userContext.name || 'User'}, Skills: ${userContext.skills?.join(', ') || 'Unknown'}, Target Role: ${userContext.targetRole || 'Not specified'}\n`
    : '';
  
  const historyStr = conversationHistory
    .slice(-10) // Keep last 10 messages for context
    .map(h => `${h.role}: ${h.content}`)
    .join('\n');
  
  const prompt = `You are SkillSense AI, an expert career advisor and skill development coach. You help students and professionals identify skill gaps and plan their career growth.
${systemContext}
CONVERSATION HISTORY:
${historyStr}

USER: ${message}

Respond helpfully and concisely. If asked about career advice, be specific and actionable. Use markdown formatting for readability when appropriate. Keep responses focused and under 300 words unless the user asks for detailed explanations.`;

  const result = await model.generateContent(prompt);
  return result.response.text();
}

// ==========================================
// Skill Extraction from Resume
// ==========================================
export async function extractSkillsFromResume(
  resumeText: string
): Promise<{ skills: Array<{ name: string; level: string; category: string }> }> {
  const model = getFlashModel();
  
  const prompt = `Extract all professional skills from this resume and estimate proficiency levels.

RESUME:
${resumeText}

Return ONLY a valid JSON object:
{
  "skills": [
    {
      "name": "Skill Name",
      "level": "beginner|intermediate|advanced|expert",
      "category": "technical|soft|domain"
    }
  ]
}

Be thorough - extract programming languages, frameworks, tools, soft skills, methodologies, etc.`;

  const result = await model.generateContent(prompt);
  const text = result.response.text();
  return extractJSON<{ skills: Array<{ name: string; level: string; category: string }> }>(text);
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
};
