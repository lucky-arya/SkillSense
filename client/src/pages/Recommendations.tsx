import { useState, useEffect } from 'react';
import {
  BookOpen,
  Video,
  FileText,
  Code,
  ExternalLink,
  Clock,
  Star,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  Brain,
  Target,
} from 'lucide-react';
import { Card, Button, Badge, ProgressBar, Alert } from '../components/ui';
import { recommendationService, SkillRecommendation } from '../services/api/recommendation.service';

interface SkillRec extends Omit<SkillRecommendation, 'reason'> {
  priority?: 'critical' | 'high' | 'medium' | 'low';
  reason?: string;
}

interface AIAssessmentResults {
  targetRole: string;
  experienceLevel: string;
  totalQuestions: number;
  correctAnswers: number;
  scorePercentage: number;
  skillBreakdown: { skill: string; correct: number; total: number; percentage: number }[];
  completedAt: string;
}

export default function Recommendations() {
  const [expandedSkill, setExpandedSkill] = useState<string | null>(null);
  const [completedResources, setCompletedResources] = useState<Set<string>>(new Set());
  const [recommendations, setRecommendations] = useState<SkillRec[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [aiResults, setAiResults] = useState<AIAssessmentResults | null>(null);

  useEffect(() => {
    loadRecommendations();
    try {
      const stored = localStorage.getItem('ai-assessment-results');
      if (stored) setAiResults(JSON.parse(stored));
    } catch { /* ignore */ }
  }, []);

  const loadRecommendations = async () => {
    try {
      const data = await recommendationService.getRecommendations();
      if (Array.isArray(data) && data.length > 0) {
        setRecommendations(data.map((r: any) => ({
          skillId: r.skillId || r.id || '',
          skillName: r.skillName || r.name || 'Unknown',
          currentLevel: r.currentLevel || 0,
          targetLevel: r.targetLevel || 80,
          resources: (r.resources || []).map((res: any) => ({
            id: res.id || res._id || '',
            title: res.title || '',
            type: res.type || 'course',
            url: res.url || '#',
            provider: res.provider || 'Unknown',
            duration: res.duration || res.estimatedDuration ? `${res.estimatedDuration}h` : 'N/A',
            difficulty: res.difficulty || 'intermediate',
            rating: res.rating || 0,
            relevanceScore: res.relevanceScore || 0,
          })),
          estimatedTime: r.estimatedTime || 'N/A',
          priority: r.priority || 'medium',
          reason: r.reason || `Improve your ${r.skillName || 'skill'} proficiency`,
        })));
      }
    } catch (error) {
      console.error('Failed to load recommendations:', error);
      setError('Unable to load recommendations. Please complete a gap analysis first, or try refreshing.');
    } finally {
      setIsLoading(false);
    }
  };

  const getResourceIcon = (type: string) => {
    switch (type) {
      case 'course':
        return BookOpen;
      case 'video':
        return Video;
      case 'documentation':
        return FileText;
      case 'tutorial':
        return FileText;
      case 'project':
        return Code;
      default:
        return BookOpen;
    }
  };

  const toggleResourceComplete = async (resourceId: string) => {
    const newCompleted = new Set(completedResources);
    if (newCompleted.has(resourceId)) {
      newCompleted.delete(resourceId);
    } else {
      newCompleted.add(resourceId);
      try {
        await recommendationService.markResourceComplete(resourceId);
      } catch {
        // Still toggle locally even if API fails
      }
    }
    setCompletedResources(newCompleted);
  };

  const totalResources = recommendations.reduce((acc, r) => acc + r.resources.length, 0);
  const completedCount = completedResources.size;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-100">Learning Recommendations</h1>
        <p className="text-gray-400 mt-1">
          Personalized resources to help you close your skill gaps
        </p>
      </div>

      {error && (
        <Alert type="error" message={error} dismissible onDismiss={() => setError('')} />
      )}

      {/* Progress Overview */}
      <Card className="bg-gradient-to-r from-primary-500 to-secondary-500 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">Learning Progress</h3>
            <p className="text-primary-100 mt-1">
              {completedCount} of {totalResources} resources completed
            </p>
          </div>
          <div className="text-4xl font-bold">
            {Math.round((completedCount / totalResources) * 100)}%
          </div>
        </div>
        <div className="mt-4">
          <ProgressBar
            value={(completedCount / totalResources) * 100}
            color="primary"
            size="lg"
          />
        </div>
      </Card>

      {/* AI Assessment-Based Recommendations */}
      {aiResults && (
        <Card className="bg-gradient-to-r from-purple-500/10 to-indigo-500/10 border-purple-500/30">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center">
              <Brain size={22} className="text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-100">AI Assessment Insights</h3>
              <p className="text-sm text-gray-400">{aiResults.targetRole} • Score: {aiResults.scorePercentage}%</p>
            </div>
          </div>
          <p className="text-sm text-gray-400 mb-3">Based on your AI assessment, focus on these areas:</p>
          <div className="space-y-2">
            {aiResults.skillBreakdown
              .filter(s => s.percentage < 80)
              .sort((a, b) => a.percentage - b.percentage)
              .map((s) => (
                <div key={s.skill} className="flex items-center justify-between bg-slate-800/50 rounded-lg px-4 py-2.5">
                  <div className="flex items-center gap-2">
                    <Target size={14} className={s.percentage < 40 ? 'text-red-400' : s.percentage < 60 ? 'text-yellow-400' : 'text-blue-400'} />
                    <span className="text-sm font-medium text-gray-300">{s.skill}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-20 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${
                        s.percentage < 40 ? 'bg-red-500' : s.percentage < 60 ? 'bg-yellow-500' : 'bg-blue-500'
                      }`} style={{ width: `${s.percentage}%` }} />
                    </div>
                    <Badge variant={s.percentage < 40 ? 'danger' : s.percentage < 60 ? 'warning' : 'default'} size="sm">
                      {s.percentage < 40 ? 'Critical' : s.percentage < 60 ? 'Improve' : 'Good'}
                    </Badge>
                  </div>
                </div>
              ))}
            {aiResults.skillBreakdown.filter(s => s.percentage < 80).length === 0 && (
              <p className="text-sm text-green-400 text-center py-2">Great job! You scored well across all assessed skills.</p>
            )}
          </div>
        </Card>
      )}

      {/* Recommendations List */}
      <div className="space-y-4">
        {recommendations.map((rec) => {
          const isExpanded = expandedSkill === rec.skillId;
          const completedInSkill = rec.resources.filter((r) =>
            completedResources.has(r.id)
          ).length;

          return (
            <Card key={rec.skillId} padding="none">
              {/* Skill Header */}
              <button
                onClick={() => setExpandedSkill(isExpanded ? null : rec.skillId)}
                className="w-full p-6 text-left hover:bg-slate-800 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                        rec.priority === 'critical'
                          ? 'bg-red-500/20'
                          : rec.priority === 'high'
                          ? 'bg-orange-500/20'
                          : 'bg-yellow-500/20'
                      }`}
                    >
                      <span className="text-xl font-bold text-gray-400">
                        {rec.skillName.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-semibold text-gray-100">
                          {rec.skillName}
                        </h3>
                        {rec.priority && (
                        <Badge
                          variant={
                            rec.priority === 'critical'
                              ? 'danger'
                              : rec.priority === 'high'
                              ? 'warning'
                              : 'default'
                          }
                        >
                          {rec.priority}
                        </Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-400">
                        {completedInSkill}/{rec.resources.length} resources completed
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right hidden sm:block">
                      <p className="text-sm text-gray-400">Est. time</p>
                      <p className="font-medium text-gray-200">{rec.estimatedTime}</p>
                    </div>
                    {isExpanded ? (
                      <ChevronUp className="text-gray-400" />
                    ) : (
                      <ChevronDown className="text-gray-400" />
                    )}
                  </div>
                </div>

                {/* Progress bar */}
                <div className="mt-4">
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-gray-400">
                      Level {rec.currentLevel} → {rec.targetLevel}
                    </span>
                    <span className="text-gray-300 font-medium">
                      +{rec.targetLevel - rec.currentLevel} points needed
                    </span>
                  </div>
                  <ProgressBar value={rec.currentLevel} max={rec.targetLevel} color="gradient" />
                </div>
              </button>

              {/* Expanded Content */}
              {isExpanded && (
                <div className="border-t border-slate-700 p-6 bg-slate-800/50">
                  <p className="text-gray-400 mb-4">{rec.reason}</p>

                  <h4 className="font-medium text-gray-100 mb-3">Recommended Resources</h4>
                  <div className="space-y-3">
                    {rec.resources.map((resource) => {
                      const Icon = getResourceIcon(resource.type);
                      const isCompleted = completedResources.has(resource.id);

                      return (
                        <div
                          key={resource.id}
                          className={`p-4 bg-slate-900 rounded-lg border ${
                            isCompleted ? 'border-green-800 bg-green-900/20' : 'border-slate-700'
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex items-start gap-3">
                              <div
                                className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                                  isCompleted ? 'bg-green-500/20' : 'bg-primary-500/20'
                                }`}
                              >
                                <Icon
                                  size={20}
                                  className={
                                    isCompleted ? 'text-green-600' : 'text-primary-600'
                                  }
                                />
                              </div>
                              <div>
                                <h5 className="font-medium text-gray-200">{resource.title}</h5>
                                <div className="flex items-center gap-3 mt-1 text-sm text-gray-400">
                                  <span className="flex items-center gap-1">
                                    <Clock size={14} />
                                    {resource.duration}
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <Star size={14} className="text-yellow-500" />
                                    {resource.rating}
                                  </span>
                                  <Badge size="sm">{resource.provider}</Badge>
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              <Button
                                variant={isCompleted ? 'outline' : 'ghost'}
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleResourceComplete(resource.id);
                                }}
                              >
                                <CheckCircle
                                  size={16}
                                  className={isCompleted ? 'text-green-600' : 'text-gray-400'}
                                />
                              </Button>
                              <a
                                href={resource.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <Button variant="outline" size="sm">
                                  <ExternalLink size={16} />
                                </Button>
                              </a>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}
