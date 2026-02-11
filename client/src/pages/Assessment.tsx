import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  CheckCircle, Clock, ArrowRight, ArrowLeft, Sparkles, Target,
  Loader2, Brain, User, BookOpen, Zap, XCircle,
  Award, BarChart3, TrendingUp
} from 'lucide-react';
import { Card, Button, ProgressBar, Badge, Alert } from '../components/ui';
import { assessmentService, Assessment as AssessmentType } from '../services/api/assessment.service';
import { aiService } from '../services/api/ai.service';

type QuestionAnswer = {
  questionId: string;
  answer: string | number;
};

type Stage = 'selection' | 'setup' | 'generating' | 'assessment' | 'submitting' | 'results';

// Store the original option objects (with isCorrect) separately for AI assessments
type AIOption = { id: string; text: string; isCorrect: boolean };
type AIQuestionMeta = { questionId: string; options: AIOption[]; skillArea: string; difficulty: string };

interface AIAssessmentResults {
  targetRole: string;
  experienceLevel: string;
  totalQuestions: number;
  correctAnswers: number;
  scorePercentage: number;
  skillBreakdown: { skill: string; correct: number; total: number; percentage: number }[];
  completedAt: string;
  questionDetails: { question: string; skill: string; userAnswer: string; correctAnswer: string; isCorrect: boolean }[];
}

const EXPERIENCE_LEVELS = ['Beginner', 'Junior', 'Mid-Level', 'Senior'];

const FOCUS_AREAS = [
  'Frontend Development', 'Backend Development', 'Full Stack',
  'Data Structures & Algorithms', 'System Design', 'Databases',
  'DevOps & CI/CD', 'Testing & QA', 'Security', 'Cloud & Infrastructure',
  'Machine Learning', 'Mobile Development',
];

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export default function Assessment() {
  // Assessment list (static from DB)
  const [assessments, setAssessments] = useState<AssessmentType[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Stage management
  const [stage, setStage] = useState<Stage>('selection');
  const [error, setError] = useState('');

  // Setup form (for AI assessment)
  const [targetRole, setTargetRole] = useState('');
  const [experienceLevel, setExperienceLevel] = useState('');
  const [currentSkills, setCurrentSkills] = useState('');
  const [selectedFocusAreas, setSelectedFocusAreas] = useState<string[]>([]);

  // Active assessment
  const [selectedAssessment, setSelectedAssessment] = useState<AssessmentType | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<QuestionAnswer[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAIAssessment, setIsAIAssessment] = useState(false);
  const [aiQuestionMeta, setAiQuestionMeta] = useState<AIQuestionMeta[]>([]);
  const [aiResults, setAiResults] = useState<AIAssessmentResults | null>(null);

  const navigate = useNavigate();

  useEffect(() => {
    loadAssessments();
  }, []);

  const loadAssessments = async () => {
    try {
      const data = await assessmentService.getAvailableAssessments();
      if (Array.isArray(data) && data.length > 0) {
        const transformed: AssessmentType[] = data.map((a: any) => ({
          _id: a.id || a._id,
          title: a.title,
          description: a.description,
          estimatedTime: a.estimatedDuration || a.estimatedTime || 20,
          skillsAssessed: a.targetSkills?.map((s: any) =>
            typeof s === 'string' ? s : s.name || s
          ) || [],
          questions: (a.questions || []).map((q: any) => ({
            id: q.id || q._id,
            text: q.text,
            type: q.type === 'multiple_choice' ? 'multiple-choice'
              : q.type === 'self_rating' ? 'rating'
              : q.type === 'scenario_based' ? 'multiple-choice'
              : q.type,
            options: q.options?.map((o: any) => o.text || o) || [],
            skillId: q.skillId || '',
          })),
        }));
        setAssessments(transformed);
      } else {
        setAssessments([]);
      }
    } catch (error) {
      console.error('Failed to load assessments:', error);
      setError('Unable to load assessments. Please refresh the page or try again later.');
      setAssessments([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Start a static (pre-built) assessment
  const startStaticAssessment = (assessment: AssessmentType) => {
    setSelectedAssessment(assessment);
    setIsAIAssessment(false);
    setStage('assessment');
    setCurrentQuestionIndex(0);
    setAnswers([]);
    setError('');
  };

  // Start AI assessment setup
  const startAISetup = () => {
    setStage('setup');
    setError('');
  };

  // Generate AI assessment
  const generateAIAssessment = async () => {
    if (!targetRole) {
      setError('Please enter a target role');
      return;
    }
    if (!experienceLevel) {
      setError('Please select your experience level');
      return;
    }

    setError('');
    setStage('generating');

    try {
      const skills = currentSkills.split(',').map(s => s.trim()).filter(Boolean);
      const result = await aiService.generateAssessment({
        targetRole,
        experienceLevel,
        currentSkills: skills,
        focusAreas: selectedFocusAreas,
      });

      // Transform AI questions to frontend format
      // Preserve isCorrect in separate metadata for scoring later
      const meta: AIQuestionMeta[] = result.questions.map((q: any) => ({
        questionId: q.id,
        options: (q.options || []).map((o: any) => ({
          id: o.id || '',
          text: typeof o === 'string' ? o : o.text,
          isCorrect: typeof o === 'string' ? false : !!o.isCorrect,
        })),
        skillArea: q.skillArea || '',
        difficulty: q.difficulty || 'medium',
      }));
      setAiQuestionMeta(meta);

      const transformed: AssessmentType = {
        _id: 'ai-generated-' + Date.now(),
        title: result.title || `Personalized ${targetRole} Assessment`,
        description: result.description || `AI-generated assessment tailored for ${experienceLevel} ${targetRole}`,
        estimatedTime: 15,
        skillsAssessed: [...new Set(result.questions.map((q: any) => q.skillArea))],
        questions: result.questions.map((q: any) => ({
          id: q.id,
          text: q.text,
          type: q.type === 'multiple_choice' || q.type === 'scenario_based' ? 'multiple-choice' : 'rating',
          options: q.options?.map((o: any) => typeof o === 'string' ? o : o.text) || [],
          skillId: q.skillArea || '',
        })),
      };

      setSelectedAssessment(transformed);
      setIsAIAssessment(true);
      setStage('assessment');
      setCurrentQuestionIndex(0);
      setAnswers([]);
    } catch (err: any) {
      console.error('Failed to generate assessment:', err);
      setError(err.response?.data?.error?.message || 'Unable to generate your personalized assessment. The AI service may be busy — please try again shortly.');
      setStage('setup');
    }
  };

  const toggleFocusArea = (area: string) => {
    setSelectedFocusAreas(prev =>
      prev.includes(area)
        ? prev.filter(a => a !== area)
        : prev.length < 4 ? [...prev, area] : prev
    );
  };

  // Question handling
  const handleAnswer = (answer: string | number) => {
    if (!selectedAssessment) return;
    const question = selectedAssessment.questions[currentQuestionIndex];
    const existingIndex = answers.findIndex((a) => a.questionId === question.id);
    if (existingIndex >= 0) {
      const newAnswers = [...answers];
      newAnswers[existingIndex] = { questionId: question.id, answer };
      setAnswers(newAnswers);
    } else {
      setAnswers([...answers, { questionId: question.id, answer }]);
    }
  };

  const getCurrentAnswer = () => {
    if (!selectedAssessment) return null;
    const question = selectedAssessment.questions[currentQuestionIndex];
    return answers.find((a) => a.questionId === question.id)?.answer;
  };

  const goToNextQuestion = () => {
    if (selectedAssessment && currentQuestionIndex < selectedAssessment.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const goToPreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const submitAssessment = async () => {
    if (!selectedAssessment) return;
    setIsSubmitting(true);
    setError('');
    try {
      if (isAIAssessment) {
        // Score the AI assessment
        const questionDetails: AIAssessmentResults['questionDetails'] = [];
        let correctCount = 0;
        const skillMap: Record<string, { correct: number; total: number }> = {};

        selectedAssessment.questions.forEach((question) => {
          const userAnswer = answers.find(a => a.questionId === question.id);
          const meta = aiQuestionMeta.find(m => m.questionId === question.id);
          const skill = question.skillId || meta?.skillArea || 'General';

          if (!skillMap[skill]) skillMap[skill] = { correct: 0, total: 0 };
          skillMap[skill].total++;

          if (question.type === 'multiple-choice' && meta?.options) {
            const correctOption = meta.options.find(o => o.isCorrect);
            const isCorrect = userAnswer?.answer === correctOption?.text;
            if (isCorrect) {
              correctCount++;
              skillMap[skill].correct++;
            }
            questionDetails.push({
              question: question.text,
              skill,
              userAnswer: String(userAnswer?.answer || 'No answer'),
              correctAnswer: correctOption?.text || 'N/A',
              isCorrect,
            });
          } else if (question.type === 'rating') {
            // Rating questions: 4-5 = good, 3 = partial, 1-2 = low
            const rating = Number(userAnswer?.answer || 0);
            const isGood = rating >= 4;
            if (isGood) {
              correctCount++;
              skillMap[skill].correct++;
            }
            questionDetails.push({
              question: question.text,
              skill,
              userAnswer: `Rating: ${rating}/5`,
              correctAnswer: 'Self-rated (4-5 = proficient)',
              isCorrect: isGood,
            });
          }
        });

        const scorePercentage = Math.round((correctCount / selectedAssessment.questions.length) * 100);
        const skillBreakdown = Object.entries(skillMap).map(([skill, data]) => ({
          skill,
          correct: data.correct,
          total: data.total,
          percentage: Math.round((data.correct / data.total) * 100),
        }));

        const results: AIAssessmentResults = {
          targetRole,
          experienceLevel,
          totalQuestions: selectedAssessment.questions.length,
          correctAnswers: correctCount,
          scorePercentage,
          skillBreakdown,
          completedAt: new Date().toISOString(),
          questionDetails,
        };

        // Save to localStorage for gap analysis and recommendations
        localStorage.setItem('ai-assessment-results', JSON.stringify(results));
        setAiResults(results);
        setStage('results');
      } else {
        await assessmentService.submitAssessment(selectedAssessment._id, answers);
        navigate('/gap-analysis');
      }
    } catch (error) {
      console.error('Failed to submit assessment:', error);
      setError('Failed to submit your assessment. Your answers are saved locally — please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // ═══════════════════════════════════════════
  // RENDER: Loading
  // ═══════════════════════════════════════════
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  // ═══════════════════════════════════════════
  // RENDER: AI Generating
  // ═══════════════════════════════════════════
  if (stage === 'generating') {
    return (
      <motion.div initial="hidden" animate="visible" variants={fadeIn}
        className="flex flex-col items-center justify-center min-h-[400px] text-center">
        <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl flex items-center justify-center mb-6 animate-pulse">
          <Brain size={40} className="text-white" />
        </div>
        <Loader2 size={32} className="animate-spin text-primary-500 mb-4" />
        <h2 className="text-xl font-bold text-gray-100 mb-2">Generating Your Personalized Assessment</h2>
        <p className="text-gray-400 max-w-md">
          AI is crafting questions tailored to your experience as a {experienceLevel} {targetRole}...
        </p>
      </motion.div>
    );
  }

  // ═══════════════════════════════════════════
  // RENDER: AI Assessment Results / Feedback
  // ═══════════════════════════════════════════
  if (stage === 'results' && aiResults) {
    const { scorePercentage, correctAnswers, totalQuestions, skillBreakdown, questionDetails } = aiResults;
    const grade = scorePercentage >= 80 ? 'Excellent' : scorePercentage >= 60 ? 'Good' : scorePercentage >= 40 ? 'Needs Improvement' : 'Beginner Level';
    const gradeColor = scorePercentage >= 80 ? 'text-green-400' : scorePercentage >= 60 ? 'text-blue-400' : scorePercentage >= 40 ? 'text-yellow-400' : 'text-red-400';
    const gradeBg = scorePercentage >= 80 ? 'from-green-500/20 to-emerald-500/20' : scorePercentage >= 60 ? 'from-blue-500/20 to-cyan-500/20' : scorePercentage >= 40 ? 'from-yellow-500/20 to-orange-500/20' : 'from-red-500/20 to-pink-500/20';

    return (
      <motion.div initial="hidden" animate="visible" variants={fadeIn} className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center">
          <div className={`w-20 h-20 mx-auto bg-gradient-to-br ${gradeBg} rounded-2xl flex items-center justify-center mb-4`}>
            <Award size={40} className={gradeColor} />
          </div>
          <h1 className="text-2xl font-bold text-gray-100 mb-1">Assessment Complete!</h1>
          <p className="text-gray-400">Here's how you performed as a {aiResults.experienceLevel} {aiResults.targetRole}</p>
        </div>

        {/* Score Cards */}
        <div className="grid sm:grid-cols-3 gap-4">
          <Card className={`bg-gradient-to-br ${gradeBg} border-none text-center`}>
            <p className="text-sm text-gray-400 mb-1">Overall Score</p>
            <p className={`text-4xl font-bold ${gradeColor}`}>{scorePercentage}%</p>
            <p className={`text-sm font-medium mt-1 ${gradeColor}`}>{grade}</p>
          </Card>
          <Card className="text-center">
            <p className="text-sm text-gray-400 mb-1">Correct Answers</p>
            <p className="text-4xl font-bold text-gray-100">{correctAnswers}<span className="text-lg text-gray-500">/{totalQuestions}</span></p>
            <p className="text-sm text-gray-500 mt-1">questions answered correctly</p>
          </Card>
          <Card className="text-center">
            <p className="text-sm text-gray-400 mb-1">Skills Assessed</p>
            <p className="text-4xl font-bold text-gray-100">{skillBreakdown.length}</p>
            <p className="text-sm text-gray-500 mt-1">unique skill areas</p>
          </Card>
        </div>

        {/* Skill Breakdown */}
        <Card>
          <h3 className="text-lg font-semibold text-gray-100 mb-4 flex items-center gap-2">
            <BarChart3 size={20} className="text-primary-400" /> Skill Breakdown
          </h3>
          <div className="space-y-4">
            {skillBreakdown.map((s) => (
              <div key={s.skill}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm font-medium text-gray-300">{s.skill}</span>
                  <span className="text-sm text-gray-400">{s.correct}/{s.total} correct ({s.percentage}%)</span>
                </div>
                <div className="relative h-2.5 bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      s.percentage >= 80 ? 'bg-green-500' : s.percentage >= 60 ? 'bg-blue-500' : s.percentage >= 40 ? 'bg-yellow-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${s.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Question Review */}
        <Card>
          <h3 className="text-lg font-semibold text-gray-100 mb-4 flex items-center gap-2">
            <BookOpen size={20} className="text-primary-400" /> Question Review
          </h3>
          <div className="space-y-3">
            {questionDetails.map((qd, i) => (
              <div key={i} className={`p-4 rounded-lg border ${qd.isCorrect ? 'border-green-500/30 bg-green-500/5' : 'border-red-500/30 bg-red-500/5'}`}>
                <div className="flex items-start gap-3">
                  <div className="mt-0.5">
                    {qd.isCorrect ? <CheckCircle size={18} className="text-green-400" /> : <XCircle size={18} className="text-red-400" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-200 mb-1">{qd.question}</p>
                    <div className="flex items-center gap-1 mb-1">
                      <Badge variant="secondary" size="sm">{qd.skill}</Badge>
                    </div>
                    <p className="text-xs text-gray-400">
                      Your answer: <span className={qd.isCorrect ? 'text-green-400' : 'text-red-400'}>{qd.userAnswer}</span>
                    </p>
                    {!qd.isCorrect && (
                      <p className="text-xs text-gray-500 mt-0.5">
                        Correct: <span className="text-green-400">{qd.correctAnswer}</span>
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Button onClick={() => navigate('/gap-analysis')} className="flex-1">
            <TrendingUp size={18} className="mr-2" /> View Gap Analysis
          </Button>
          <Button variant="outline" onClick={() => navigate('/recommendations')} className="flex-1">
            <BookOpen size={18} className="mr-2" /> Get Recommendations
          </Button>
          <Button variant="ghost" onClick={() => { setStage('selection'); setAiResults(null); }}>
            Take Another Assessment
          </Button>
        </div>
      </motion.div>
    );
  }

  // ═══════════════════════════════════════════
  // RENDER: Assessment in progress
  // ═══════════════════════════════════════════
  if (stage === 'assessment' && selectedAssessment) {
    const question = selectedAssessment.questions[currentQuestionIndex];
    const progress = ((currentQuestionIndex + 1) / selectedAssessment.questions.length) * 100;
    const currentAnswer = getCurrentAnswer();

    return (
      <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
        <Card>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              {isAIAssessment && <Sparkles size={18} className="text-purple-400" />}
              <h2 className="text-lg font-semibold text-gray-100">{selectedAssessment.title}</h2>
            </div>
            <Badge variant="primary">
              Question {currentQuestionIndex + 1} of {selectedAssessment.questions.length}
            </Badge>
          </div>
          <ProgressBar value={progress} color="gradient" showLabel />
          {isAIAssessment && question.skillId && (
            <div className="mt-2">
              <Badge variant="secondary">{question.skillId}</Badge>
            </div>
          )}
        </Card>

        {error && <Alert type="error" message={error} dismissible onDismiss={() => setError('')} />}

        <Card className="min-h-[300px]">
          <h3 className="text-xl font-medium text-gray-100 mb-6">{question.text}</h3>

          {question.type === 'multiple-choice' && question.options && (
            <div className="space-y-3">
              {question.options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => handleAnswer(option)}
                  className={`w-full p-4 text-left rounded-lg border-2 transition-all ${
                    currentAnswer === option
                      ? 'border-primary-500 bg-primary-900/30 text-primary-300'
                      : 'border-slate-700 hover:border-slate-600 hover:bg-slate-800 text-gray-300'
                  }`}
                >
                  <span className="font-medium">{String.fromCharCode(65 + index)}.</span> {option}
                </button>
              ))}
            </div>
          )}

          {question.type === 'rating' && (
            <div className="space-y-4">
              <p className="text-gray-400">Select your proficiency level:</p>
              <div className="flex justify-between gap-2">
                {[1, 2, 3, 4, 5].map((level) => (
                  <button
                    key={level}
                    onClick={() => handleAnswer(level)}
                    className={`flex-1 py-4 px-2 rounded-lg border-2 transition-all ${
                      currentAnswer === level
                        ? 'border-primary-500 bg-primary-900/30 text-primary-300'
                        : 'border-slate-700 hover:border-slate-600 hover:bg-slate-800 text-gray-300'
                    }`}
                  >
                    <div className="text-2xl font-bold">{level}</div>
                    <div className="text-xs text-gray-400 mt-1">
                      {level === 1 ? 'Beginner' : level === 2 ? 'Basic' : level === 3 ? 'Intermediate' : level === 4 ? 'Advanced' : 'Expert'}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </Card>

        <div className="flex items-center justify-between">
          <Button variant="outline" onClick={goToPreviousQuestion} disabled={currentQuestionIndex === 0}>
            <ArrowLeft className="mr-2" size={18} /> Previous
          </Button>
          {currentQuestionIndex === selectedAssessment.questions.length - 1 ? (
            <Button onClick={submitAssessment} isLoading={isSubmitting}
              disabled={answers.length < selectedAssessment.questions.length}>
              Submit Assessment <CheckCircle className="ml-2" size={18} />
            </Button>
          ) : (
            <Button onClick={goToNextQuestion} disabled={!currentAnswer}>
              Next <ArrowRight className="ml-2" size={18} />
            </Button>
          )}
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════
  // RENDER: AI Assessment Setup
  // ═══════════════════════════════════════════
  if (stage === 'setup') {
    return (
      <motion.div initial="hidden" animate="visible" variants={fadeIn} className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center space-x-3 mb-2">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center">
            <Brain className="text-white" size={22} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-100">AI-Powered Assessment</h1>
            <p className="text-sm text-gray-400">Tell us about yourself and we'll create a personalized assessment</p>
          </div>
        </div>

        {error && <Alert type="error" message={error} dismissible onDismiss={() => setError('')} />}

        <Card>
          <div className="space-y-5">
            {/* Target Role */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">
                <Target size={14} className="inline mr-1" /> Target Role *
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="e.g., Frontend Developer, Data Scientist, DevOps Engineer"
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
              />
            </div>

            {/* Experience Level */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">
                <User size={14} className="inline mr-1" /> Experience Level *
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {EXPERIENCE_LEVELS.map((level) => (
                  <button
                    key={level}
                    onClick={() => setExperienceLevel(level)}
                    className={`py-2.5 px-3 rounded-lg text-sm font-medium border transition-all ${
                      experienceLevel === level
                        ? 'bg-purple-500/20 border-purple-500/50 text-purple-300'
                        : 'border-slate-700 text-gray-400 hover:bg-slate-800'
                    }`}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>

            {/* Current Skills */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">
                <Zap size={14} className="inline mr-1" /> Your Current Skills (comma-separated)
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="e.g., JavaScript, React, Node.js, Python, SQL"
                value={currentSkills}
                onChange={(e) => setCurrentSkills(e.target.value)}
              />
              <p className="text-xs text-gray-500 mt-1">This helps the AI calibrate question difficulty</p>
            </div>

            {/* Focus Areas */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">
                <BookOpen size={14} className="inline mr-1" /> Focus Areas (select up to 4)
              </label>
              <div className="flex flex-wrap gap-2">
                {FOCUS_AREAS.map((area) => (
                  <button
                    key={area}
                    onClick={() => toggleFocusArea(area)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                      selectedFocusAreas.includes(area)
                        ? 'bg-indigo-500/20 border-indigo-500/50 text-indigo-300'
                        : 'border-slate-700 text-gray-400 hover:border-slate-600'
                    }`}
                  >
                    {area}
                  </button>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <Button variant="outline" onClick={() => setStage('selection')} className="flex-shrink-0">
                <ArrowLeft size={16} className="mr-1" /> Back
              </Button>
              <Button onClick={generateAIAssessment} className="flex-1">
                <Sparkles size={16} className="mr-2" /> Generate Personalized Assessment
              </Button>
            </div>
          </div>
        </Card>

        {/* What to expect */}
        <Card className="bg-slate-800/50 border-slate-700">
          <h4 className="text-sm font-semibold text-gray-300 mb-3">What to Expect</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="flex items-start gap-2">
              <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs text-blue-400 font-bold">10</span>
              </div>
              <div>
                <p className="text-gray-300 font-medium">Tailored Questions</p>
                <p className="text-gray-500">Mix of MCQ, scenario-based, and self-rating</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-6 h-6 rounded-full bg-purple-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Target size={12} className="text-purple-400" />
              </div>
              <div>
                <p className="text-gray-300 font-medium">Adaptive Difficulty</p>
                <p className="text-gray-500">Calibrated to your experience level</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Clock size={12} className="text-green-400" />
              </div>
              <div>
                <p className="text-gray-300 font-medium">~15 Minutes</p>
                <p className="text-gray-500">Quick but comprehensive evaluation</p>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>
    );
  }

  // ═══════════════════════════════════════════
  // RENDER: Assessment Selection
  // ═══════════════════════════════════════════
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-gray-100">Skill Assessments</h1>
        <p className="text-gray-400 mt-1">
          Choose a pre-built assessment or create a personalized one with AI
        </p>
      </div>

      {error && <Alert type="error" message={error} dismissible onDismiss={() => setError('')} />}

      {/* AI Assessment Hero Card */}
      <motion.div initial="hidden" animate="visible" variants={fadeIn}>
        <Card className="bg-gradient-to-r from-purple-500/10 to-indigo-500/10 border-purple-500/30 cursor-pointer hover:border-purple-500/50 transition-all"
          onClick={startAISetup}>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center flex-shrink-0">
              <Brain size={28} className="text-white" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-lg font-semibold text-gray-100">AI-Powered Personalized Assessment</h3>
                <Badge variant="primary">NEW</Badge>
              </div>
              <p className="text-gray-400 text-sm">
                Tell us your target role, experience, and skills — our AI creates a custom assessment
                tailored specifically for you with adaptive difficulty
              </p>
            </div>
            <ArrowRight size={24} className="text-purple-400 flex-shrink-0" />
          </div>
        </Card>
      </motion.div>

      {/* Divider */}
      {assessments.length > 0 && (
        <div className="flex items-center gap-4">
          <div className="flex-1 h-px bg-slate-700"></div>
          <span className="text-sm text-gray-500 font-medium">Or choose a pre-built assessment</span>
          <div className="flex-1 h-px bg-slate-700"></div>
        </div>
      )}

      {/* Static Assessments */}
      <div className="grid md:grid-cols-2 gap-6">
        {assessments.map((assessment) => (
          <Card key={assessment._id} hover>
            <div className="flex items-start justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-100">{assessment.title}</h3>
              <div className="flex items-center text-gray-400 text-sm">
                <Clock size={16} className="mr-1" />
                {assessment.estimatedTime} min
              </div>
            </div>

            <p className="text-gray-400 mb-4">{assessment.description}</p>

            <div className="flex flex-wrap gap-2 mb-6">
              {assessment.skillsAssessed.map((skill) => (
                <Badge key={skill} variant="secondary">{skill}</Badge>
              ))}
            </div>

            <Button onClick={() => startStaticAssessment(assessment)} className="w-full">
              Start Assessment <ArrowRight className="ml-2" size={18} />
            </Button>
          </Card>
        ))}
      </div>
    </div>
  );
}
