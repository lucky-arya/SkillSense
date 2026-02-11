import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  TrendingUp,
  Target,
  Award,
  ArrowRight,
  AlertTriangle,
  CheckCircle,
  Brain,
  Sparkles,
  FileText,
  Mic,
  Map,
  Bot,
  Zap,
} from 'lucide-react';
import { Card, Button, ProgressBar, Badge, Alert } from '../components/ui';
import { gapAnalysisService, GapAnalysisResult, SkillGap } from '../services/api/gapAnalysis.service';
import { assessmentService } from '../services/api/assessment.service';
import { useAuth } from '../context/AuthContext';
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';

interface AIAssessmentResults {
  targetRole: string;
  experienceLevel: string;
  totalQuestions: number;
  correctAnswers: number;
  scorePercentage: number;
  skillBreakdown: { skill: string; correct: number; total: number; percentage: number }[];
  completedAt: string;
}

export default function Dashboard() {
  const { user } = useAuth();
  const [analysis, setAnalysis] = useState<GapAnalysisResult | null>(null);
  const [assessmentCount, setAssessmentCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [aiResults, setAiResults] = useState<AIAssessmentResults | null>(null);
  useEffect(() => {
    loadDashboardData();
    try {
      const stored = localStorage.getItem('ai-assessment-results');
      if (stored) setAiResults(JSON.parse(stored));
    } catch { /* ignore */ }
  }, []);

  const loadDashboardData = async () => {
    try {
      const [analysisData, pastResults] = await Promise.allSettled([
        gapAnalysisService.getLatestAnalysis(),
        assessmentService.getPastResults(),
      ]);

      if (analysisData.status === 'fulfilled' && analysisData.value) {
        setAnalysis(analysisData.value);
      }
      if (pastResults.status === 'fulfilled') {
        setAssessmentCount(Array.isArray(pastResults.value) ? pastResults.value.length : 0);
      }
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      setError('Some dashboard data couldn\'t be loaded. Please refresh to try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Derive radar chart data from analysis, falling back to AI results
  const skillRadarData = analysis?.gaps
    ? analysis.gaps.slice(0, 6).map((gap: SkillGap) => ({
        skill: gap.skillName,
        current: gap.currentLevel,
        required: gap.requiredLevel,
      }))
    : aiResults?.skillBreakdown
      ? aiResults.skillBreakdown.slice(0, 6).map((s) => ({
          skill: s.skill,
          current: s.percentage,
          required: 80,
        }))
      : [
          { skill: 'JavaScript', current: 0, required: 80 },
          { skill: 'React', current: 0, required: 80 },
          { skill: 'Node.js', current: 0, required: 70 },
          { skill: 'TypeScript', current: 0, required: 75 },
          { skill: 'SQL', current: 0, required: 60 },
          { skill: 'Git', current: 0, required: 70 },
        ];

  // Derive top gaps from analysis, falling back to AI results
  const topGaps = analysis?.gaps
    ? analysis.gaps
        .sort((a, b) => b.gapSize - a.gapSize)
        .slice(0, 3)
        .map((g) => ({ skill: g.skillName, gap: g.gapSize, priority: g.priority }))
    : aiResults?.skillBreakdown
      ? aiResults.skillBreakdown
          .filter(s => s.percentage < 80)
          .sort((a, b) => a.percentage - b.percentage)
          .slice(0, 3)
          .map(s => ({
            skill: s.skill,
            gap: Math.max(0, 80 - s.percentage),
            priority: (s.percentage < 40 ? 'critical' : s.percentage < 60 ? 'high' : 'medium') as 'critical' | 'high' | 'medium',
          }))
      : [];

  const overallReadiness = analysis?.overallReadiness ?? 0;
  const activeGaps = analysis?.gaps?.length ?? 0;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-primary-600/20 via-indigo-600/20 to-secondary-600/20 border border-primary-500/20 rounded-2xl p-6">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="relative flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-100">
              Welcome back, {user?.name?.split(' ')[0] || 'there'} <span className="inline-block animate-bounce">👋</span>
            </h1>
            <p className="text-gray-400 mt-1">Track your skill development and career progress</p>
          </div>
          <Link to="/assessment">
            <Button>
              <Sparkles size={16} className="mr-2" />
              Take Assessment
              <ArrowRight className="ml-2" size={16} />
            </Button>
          </Link>
        </div>
      </div>

      {error && (
        <Alert type="error" message={error} dismissible onDismiss={() => setError('')} />
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-600/20 to-blue-700/10 border-blue-500/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-300 text-sm font-medium">Overall Readiness</p>
              <p className="text-3xl font-bold text-gray-100 mt-1">{overallReadiness}%</p>
              <p className="text-xs text-gray-500 mt-1">{overallReadiness >= 70 ? 'On track' : overallReadiness > 0 ? 'Keep going' : 'Start assessing'}</p>
            </div>
            <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
              <TrendingUp size={24} className="text-blue-400" />
            </div>
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-purple-600/20 to-purple-700/10 border-purple-500/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-300 text-sm font-medium">Assessments Taken</p>
              <p className="text-3xl font-bold text-gray-100 mt-1">{assessmentCount + (aiResults ? 1 : 0)}</p>
              <p className="text-xs text-gray-500 mt-1">{aiResults ? 'Including AI assessment' : 'Take your first one'}</p>
            </div>
            <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center">
              <Award size={24} className="text-purple-400" />
            </div>
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-orange-600/20 to-orange-700/10 border-orange-500/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-300 text-sm font-medium">Active Gaps</p>
              <p className="text-3xl font-bold text-gray-100 mt-1">{activeGaps}</p>
              <p className="text-xs text-gray-500 mt-1">{activeGaps > 0 ? `${topGaps.filter(g => g.priority === 'critical').length} critical` : 'No gaps found yet'}</p>
            </div>
            <div className="w-12 h-12 bg-orange-500/20 rounded-xl flex items-center justify-center">
              <AlertTriangle size={24} className="text-orange-400" />
            </div>
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-emerald-600/20 to-emerald-700/10 border-emerald-500/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-emerald-300 text-sm font-medium">AI Score</p>
              <p className="text-3xl font-bold text-gray-100 mt-1">{aiResults ? `${aiResults.scorePercentage}%` : '—'}</p>
              <p className="text-xs text-gray-500 mt-1">{aiResults ? aiResults.targetRole : 'Take AI assessment'}</p>
            </div>
            <div className="w-12 h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center">
              <Brain size={24} className="text-emerald-400" />
            </div>
          </div>
        </Card>
      </div>

      {/* AI Assessment Summary (if exists) */}
      {aiResults && (
        <Card className="bg-gradient-to-r from-purple-500/10 to-indigo-500/10 border-purple-500/20">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center">
                <Brain size={20} className="text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-100">AI Assessment: {aiResults.targetRole}</h3>
                <p className="text-sm text-gray-400">{aiResults.experienceLevel} • {new Date(aiResults.completedAt).toLocaleDateString()}</p>
              </div>
            </div>
            <Link to="/assessment" className="text-sm text-purple-400 hover:text-purple-300">Retake →</Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {aiResults.skillBreakdown.slice(0, 4).map((s) => (
              <div key={s.skill} className="bg-slate-800/50 rounded-lg p-3">
                <p className="text-xs text-gray-400 truncate">{s.skill}</p>
                <p className={`text-lg font-bold mt-0.5 ${s.percentage >= 80 ? 'text-emerald-400' : s.percentage >= 60 ? 'text-blue-400' : s.percentage >= 40 ? 'text-amber-400' : 'text-red-400'}`}>{s.percentage}%</p>
                <div className="w-full bg-slate-700/50 rounded-full h-1 mt-1">
                  <div className={`h-full rounded-full ${s.percentage >= 80 ? 'bg-emerald-500' : s.percentage >= 60 ? 'bg-blue-500' : s.percentage >= 40 ? 'bg-amber-500' : 'bg-red-500'}`} style={{ width: `${s.percentage}%` }} />
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Skill Radar Chart */}
        <Card>
          <h3 className="text-lg font-semibold text-gray-100 mb-4">Skill Overview</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={skillRadarData}>
                <PolarGrid stroke="#334155" strokeDasharray="3 3" />
                <PolarAngleAxis dataKey="skill" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 10, fill: '#64748b' }} />
                <Radar
                  name="Current Level"
                  dataKey="current"
                  stroke="#3b82f6"
                  fill="#3b82f6"
                  fillOpacity={0.35}
                  strokeWidth={2}
                />
                <Radar
                  name="Required Level"
                  dataKey="required"
                  stroke="#8b5cf6"
                  fill="#8b5cf6"
                  fillOpacity={0.15}
                  strokeWidth={2}
                  strokeDasharray="4 4"
                />
                <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: '#e2e8f0', fontSize: '12px' }} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
          <div className="flex items-center justify-center gap-6 mt-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span className="text-sm text-gray-400">Current</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-purple-500 rounded-full opacity-60"></div>
              <span className="text-sm text-gray-400">Required</span>
            </div>
          </div>
        </Card>

        {/* Top Skills Gaps */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-100">Priority Gaps</h3>
            <Link to="/gap-analysis" className="text-sm text-primary-400 hover:text-primary-300">
              View All →
            </Link>
          </div>
          {topGaps.length > 0 ? (
            <div className="space-y-4">
              {topGaps.map((gap) => (
                <div key={gap.skill} className="p-4 bg-slate-800/50 rounded-lg border border-slate-700/50">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-gray-200">{gap.skill}</span>
                    <Badge
                      variant={
                        gap.priority === 'critical'
                          ? 'danger'
                          : gap.priority === 'high'
                          ? 'warning'
                          : 'default'
                      }
                    >
                      {gap.priority}
                    </Badge>
                  </div>
                  <ProgressBar value={100 - gap.gap} color={gap.priority === 'critical' ? 'danger' : gap.priority === 'high' ? 'warning' : 'primary'} size="sm" />
                  <p className="text-sm text-gray-400 mt-2">Gap: {gap.gap} points to close</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Target size={40} className="mx-auto text-gray-600 mb-3" />
              <p className="text-gray-400 text-sm">Complete a gap analysis to see priority gaps</p>
              <Link to="/gap-analysis">
                <Button variant="outline" size="sm" className="mt-3">
                  Run Gap Analysis <ArrowRight size={14} className="ml-1" />
                </Button>
              </Link>
            </div>
          )}
          <Link to="/recommendations">
            <Button variant="outline" className="w-full mt-4">
              Get Learning Recommendations
            </Button>
          </Link>
        </Card>
      </div>

      {/* Quick Actions */}
      <div>
        <h3 className="text-lg font-semibold text-gray-100 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { icon: FileText, label: 'Analyze Resume', path: '/resume-analyzer', color: 'from-orange-500/20 to-red-500/20 border-orange-500/20', iconColor: 'text-orange-400' },
            { icon: Mic, label: 'Mock Interview', path: '/mock-interview', color: 'from-indigo-500/20 to-violet-500/20 border-indigo-500/20', iconColor: 'text-indigo-400' },
            { icon: Map, label: 'Career Roadmap', path: '/career-roadmap', color: 'from-emerald-500/20 to-green-500/20 border-emerald-500/20', iconColor: 'text-emerald-400' },
            { icon: Bot, label: 'AI Chat', path: '/ai-chat', color: 'from-cyan-500/20 to-blue-500/20 border-cyan-500/20', iconColor: 'text-cyan-400' },
          ].map(({ icon: Icon, label, path, color, iconColor }) => (
            <Link key={path} to={path}>
              <Card className={`bg-gradient-to-br ${color} hover:scale-[1.02] transition-transform cursor-pointer`}>
                <div className="flex flex-col items-center text-center py-2">
                  <Icon size={24} className={`${iconColor} mb-2`} />
                  <span className="text-sm font-medium text-gray-300">{label}</span>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* Analysis Summary */}
      <Card>
        <h3 className="text-lg font-semibold text-gray-100 mb-4">
          {analysis ? 'Analysis Summary' : 'Get Started'}
        </h3>
        {analysis ? (
          <div className="space-y-3">
            {analysis.strengths && analysis.strengths.length > 0 && (
              <div className="p-3 bg-emerald-900/20 border border-emerald-500/10 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center bg-emerald-500/20">
                    <CheckCircle size={16} className="text-emerald-400" />
                  </div>
                  <span className="text-gray-200">
                    <strong className="text-emerald-400">{analysis.strengths.length}</strong> skills exceed role requirements
                  </span>
                </div>
              </div>
            )}
            {analysis.recommendations && analysis.recommendations.map((rec, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg border border-slate-700/30">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center bg-primary-500/20">
                    <Zap size={16} className="text-primary-400" />
                  </div>
                  <span className="text-gray-300 text-sm">{rec}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-gradient-to-br from-primary-500/20 to-secondary-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Sparkles size={28} className="text-primary-400" />
            </div>
            <p className="text-gray-300 font-medium mb-1">Start your career intelligence journey</p>
            <p className="text-gray-500 text-sm mb-4">
              Take an assessment to unlock personalized skill analysis, gap insights, and AI-powered recommendations.
            </p>
            <Link to="/assessment">
              <Button>
                Start Your First Assessment
                <ArrowRight className="ml-2" size={16} />
              </Button>
            </Link>
          </div>
        )}
      </Card>
    </div>
  );
}
