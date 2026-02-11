import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, TrendingUp, Target, ChevronRight, Brain } from 'lucide-react';
import { Card, Button, ProgressBar, Badge, Alert } from '../components/ui';
import { gapAnalysisService, SkillGap, GapAnalysisResult } from '../services/api/gapAnalysis.service';
import { roleService, Role } from '../services/api/role.service';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

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

export default function GapAnalysis() {
  const [isLoading, setIsLoading] = useState(true);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [roles, setRoles] = useState<(Role & { match?: number })[]>([]);
  const [gaps, setGaps] = useState<(SkillGap & { category: string })[]>([]);
  const [analysis, setAnalysis] = useState<GapAnalysisResult | null>(null);
  const [error, setError] = useState('');
  const [aiResults, setAiResults] = useState<AIAssessmentResults | null>(null);

  useEffect(() => {
    loadInitialData();
    // Load AI assessment results from localStorage
    try {
      const stored = localStorage.getItem('ai-assessment-results');
      if (stored) setAiResults(JSON.parse(stored));
    } catch { /* ignore */ }
  }, []);

  const loadInitialData = async () => {
    try {
      const [rolesData, latestAnalysis] = await Promise.allSettled([
        roleService.getAllRoles(),
        gapAnalysisService.getLatestAnalysis(),
      ]);

      if (rolesData.status === 'fulfilled' && Array.isArray(rolesData.value)) {
        setRoles(rolesData.value.map((r: any) => ({
          ...r,
          _id: r._id || r.id,
          match: 0,
        })));
        if (rolesData.value.length > 0) {
          const firstId = (rolesData.value[0] as any)._id || (rolesData.value[0] as any).id;
          setSelectedRole(firstId);
        }
      }

      if (latestAnalysis.status === 'fulfilled' && latestAnalysis.value) {
        applyAnalysis(latestAnalysis.value);
      }
    } catch (error) {
      console.error('Failed to load data:', error);
      setError('Unable to load gap analysis data. Please refresh the page.');
    } finally {
      setIsLoading(false);
    }
  };

  const applyAnalysis = (result: GapAnalysisResult) => {
    setAnalysis(result);
    setGaps(
      result.gaps.map((g) => ({
        ...g,
        category: g.importance === 'essential' ? 'Core' : g.importance === 'preferred' ? 'Recommended' : 'Optional',
      }))
    );
  };

  const analyzeForRole = async (roleId: string) => {
    setSelectedRole(roleId);
    setIsAnalyzing(true);
    try {
      const result = await gapAnalysisService.analyzeGaps(roleId);
      applyAnalysis(result);
    } catch (error) {
      console.error('Gap analysis failed:', error);
      setError('Gap analysis failed for this role. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const chartData = gaps.length > 0
    ? gaps.map((gap) => ({
        name: gap.skillName,
        current: gap.currentLevel,
        required: gap.requiredLevel,
        gap: gap.gapSize,
      }))
    : aiResults
      ? aiResults.skillBreakdown.map((s) => ({
          name: s.skill,
          current: s.percentage,
          required: 80,
          gap: Math.max(0, 80 - s.percentage),
        }))
      : [];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical':
        return '#ef4444';
      case 'high':
        return '#f97316';
      case 'medium':
        return '#eab308';
      case 'low':
        return '#22c55e';
      default:
        return '#6b7280';
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'critical':
        return 'danger';
      case 'high':
        return 'warning';
      case 'medium':
        return 'default';
      default:
        return 'success';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  const selectedRoleData = roles.find((r) => (r._id || (r as any).id) === selectedRole);
  const roleReadiness = analysis?.overallReadiness ?? 0;
  const estWeeks = analysis?.estimatedTimeToClose ?? 0;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-100">Gap Analysis</h1>
          <p className="text-gray-400 mt-1">
            Compare your skills against role requirements
          </p>
        </div>
        <Link to="/recommendations">
          <Button>
            Get Recommendations
            <ChevronRight className="ml-2" size={18} />
          </Button>
        </Link>
      </div>

      {error && (
        <Alert type="error" message={error} dismissible onDismiss={() => setError('')} />
      )}

      {/* AI Assessment Results */}
      {aiResults && (
        <Card className="bg-gradient-to-r from-purple-500/10 to-indigo-500/10 border-purple-500/30">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center">
              <Brain size={22} className="text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-100 flex items-center gap-2">
                AI Assessment Results
                <Badge variant="primary">AI</Badge>
              </h3>
              <p className="text-sm text-gray-400">
                {aiResults.targetRole} • {aiResults.experienceLevel} • Completed {new Date(aiResults.completedAt).toLocaleDateString()}
              </p>
            </div>
            <div className="ml-auto text-right">
              <p className={`text-3xl font-bold ${
                aiResults.scorePercentage >= 80 ? 'text-green-400' : aiResults.scorePercentage >= 60 ? 'text-blue-400' : aiResults.scorePercentage >= 40 ? 'text-yellow-400' : 'text-red-400'
              }`}>{aiResults.scorePercentage}%</p>
              <p className="text-xs text-gray-500">{aiResults.correctAnswers}/{aiResults.totalQuestions} correct</p>
            </div>
          </div>

          {/* AI Skill Breakdown as Gaps */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {aiResults.skillBreakdown.map((s) => {
              const level = s.percentage;
              const priority = level >= 80 ? 'Strong' : level >= 60 ? 'Moderate' : level >= 40 ? 'Needs Work' : 'Critical Gap';
              const color = level >= 80 ? 'text-green-400' : level >= 60 ? 'text-blue-400' : level >= 40 ? 'text-yellow-400' : 'text-red-400';
              const barColor = level >= 80 ? 'bg-green-500' : level >= 60 ? 'bg-blue-500' : level >= 40 ? 'bg-yellow-500' : 'bg-red-500';
              return (
                <div key={s.skill} className="bg-slate-800/50 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-300">{s.skill}</span>
                    <span className={`text-xs font-medium ${color}`}>{priority}</span>
                  </div>
                  <div className="relative h-2 bg-slate-700 rounded-full overflow-hidden mb-1">
                    <div className={`h-full rounded-full ${barColor}`} style={{ width: `${level}%` }} />
                  </div>
                  <p className="text-xs text-gray-500">{s.correct}/{s.total} correct ({level}%)</p>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* Role Selection */}
      <Card>
        <h3 className="text-lg font-semibold text-gray-100 mb-4">Select Target Role</h3>
        <div className="grid md:grid-cols-3 gap-4">
          {roles.map((role) => {
            const roleId = role._id || (role as any).id;
            return (
            <button
              key={roleId}
              onClick={() => analyzeForRole(roleId)}
              disabled={isAnalyzing}
              className={`p-4 rounded-lg border-2 text-left transition-all ${
                selectedRole === roleId
                  ? 'border-primary-500 bg-primary-900/30'
                  : 'border-slate-700 hover:border-slate-600'
              } ${isAnalyzing ? 'opacity-50 cursor-wait' : ''}`}
            >
              <div className="flex items-center justify-between">
                <span className="font-medium text-gray-200">{role.title}</span>
                <Target
                  size={18}
                  className={selectedRole === roleId ? 'text-primary-600' : 'text-gray-400'}
                />
              </div>
              {selectedRole === roleId && analysis && (
              <div className="mt-2">
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-gray-400">Match</span>
                  <span className="font-medium text-gray-300">{roleReadiness}%</span>
                </div>
                <ProgressBar
                  value={roleReadiness}
                  size="sm"
                  color={roleReadiness >= 70 ? 'success' : roleReadiness >= 50 ? 'warning' : 'danger'}
                />
              </div>
              )}
            </button>
            );
          })}
        </div>
      </Card>

      {/* Overall Stats */}
      {selectedRoleData && analysis && (
        <div className="grid md:grid-cols-3 gap-4">
          <Card className="bg-gradient-to-br from-blue-600/20 to-blue-700/10 border-blue-500/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-300 text-sm font-medium">Role Readiness</p>
                <p className="text-3xl font-bold text-gray-100 mt-1">{roleReadiness}%</p>
                <p className="text-xs text-gray-500 mt-1">{roleReadiness >= 70 ? 'Well prepared' : roleReadiness >= 50 ? 'Getting there' : 'Needs work'}</p>
              </div>
              <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
                <TrendingUp size={24} className="text-blue-400" />
              </div>
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-orange-600/20 to-orange-700/10 border-orange-500/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-300 text-sm font-medium">Skills Gaps</p>
                <p className="text-3xl font-bold text-gray-100 mt-1">{gaps.length}</p>
                <p className="text-xs text-gray-500 mt-1">{gaps.filter(g => g.priority === 'critical').length} critical</p>
              </div>
              <div className="w-12 h-12 bg-orange-500/20 rounded-xl flex items-center justify-center">
                <AlertTriangle size={24} className="text-orange-400" />
              </div>
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-purple-600/20 to-purple-700/10 border-purple-500/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-300 text-sm font-medium">Est. Time to Close</p>
                <p className="text-3xl font-bold text-gray-100 mt-1">{estWeeks} weeks</p>
                <p className="text-xs text-gray-500 mt-1">Estimated study time</p>
              </div>
              <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center">
                <Target size={24} className="text-purple-400" />
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Gap Visualization */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Bar Chart */}
        <Card>
          <h3 className="text-lg font-semibold text-gray-100 mb-4">Skill Comparison</h3>
          {chartData.length > 0 ? (
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis type="number" domain={[0, 100]} tick={{ fill: '#94a3b8' }} />
                <YAxis dataKey="name" type="category" width={100} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: '#e2e8f0', fontSize: '12px' }} />
                <Legend wrapperStyle={{ color: '#94a3b8', fontSize: '12px', paddingTop: '8px' }} />
                <Bar dataKey="current" fill="#3b82f6" name="Current Level" radius={[0, 4, 4, 0]} />
                <Bar
                  dataKey="required"
                  fill="#a78bfa"
                  name="Required Level"
                  radius={[0, 4, 4, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-80 text-center">
              <AlertTriangle size={40} className="text-gray-600 mb-3" />
              <p className="text-gray-400 text-sm">Select a role above and run analysis to see skill comparison</p>
            </div>
          )}
        </Card>

        {/* Gap List */}
        <Card>
          <h3 className="text-lg font-semibold text-gray-100 mb-4">Priority Gaps</h3>
          {(gaps.length > 0 || (aiResults && gaps.length === 0)) ? (
          <div className="space-y-4">
            {gaps.length > 0 ? gaps
              .sort((a, b) => {
                const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
                return priorityOrder[a.priority] - priorityOrder[b.priority];
              })
              .map((gap) => (
                <div
                  key={gap.skillId}
                  className="p-4 rounded-lg border border-slate-700 hover:border-slate-600 transition-colors"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: getPriorityColor(gap.priority) }}
                      />
                      <span className="font-medium text-gray-200">{gap.skillName}</span>
                    </div>
                    <Badge variant={getPriorityBadge(gap.priority) as any}>{gap.priority}</Badge>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">Current: {gap.currentLevel}%</span>
                      <span className="text-gray-400">Required: {gap.requiredLevel}%</span>
                    </div>
                    <div className="relative h-2 bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className="absolute left-0 top-0 h-full bg-primary-500 rounded-full"
                        style={{ width: `${gap.currentLevel}%` }}
                      />
                      <div
                        className="absolute top-0 h-full w-0.5 bg-gray-400"
                        style={{ left: `${gap.requiredLevel}%` }}
                      />
                    </div>
                    <p className="text-xs text-gray-400">
                      <Badge variant="secondary" size="sm">
                        {gap.importance}
                      </Badge>
                      <span className="ml-2">{gap.category}</span>
                    </p>
                  </div>
                </div>
              ))
            : aiResults && aiResults.skillBreakdown
                .filter(s => s.percentage < 80)
                .sort((a, b) => a.percentage - b.percentage)
                .map((s) => {
                  const priority = s.percentage < 40 ? 'critical' : s.percentage < 60 ? 'high' : 'medium';
                  return (
                    <div
                      key={s.skill}
                      className="p-4 rounded-lg border border-slate-700 hover:border-slate-600 transition-colors"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: getPriorityColor(priority) }}
                          />
                          <span className="font-medium text-gray-200">{s.skill}</span>
                        </div>
                        <Badge variant={getPriorityBadge(priority) as any}>{priority}</Badge>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-400">Current: {s.percentage}%</span>
                          <span className="text-gray-400">Target: 80%</span>
                        </div>
                        <div className="relative h-2 bg-slate-700 rounded-full overflow-hidden">
                          <div
                            className={`absolute left-0 top-0 h-full rounded-full ${s.percentage >= 60 ? 'bg-blue-500' : s.percentage >= 40 ? 'bg-amber-500' : 'bg-red-500'}`}
                            style={{ width: `${s.percentage}%` }}
                          />
                          <div
                            className="absolute top-0 h-full w-0.5 bg-gray-400"
                            style={{ left: '80%' }}
                          />
                        </div>
                        <p className="text-xs text-gray-500">From AI Assessment • {s.correct}/{s.total} correct</p>
                      </div>
                    </div>
                  );
                })}
          </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Target size={40} className="text-gray-600 mb-3" />
              <p className="text-gray-400 text-sm">Run a gap analysis to see priority gaps</p>
              <p className="text-gray-500 text-xs mt-1">Select a target role above to get started</p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
