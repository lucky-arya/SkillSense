import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  TrendingUp,
  Target,
  Award,
  ArrowRight,
  AlertTriangle,
  CheckCircle,
} from 'lucide-react';
import { Card, Button, ProgressBar, Badge } from '../components/ui';
import { gapAnalysisService, GapAnalysisResult, SkillGap } from '../services/api/gapAnalysis.service';
import { assessmentService } from '../services/api/assessment.service';
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
} from 'recharts';

export default function Dashboard() {
  const [analysis, setAnalysis] = useState<GapAnalysisResult | null>(null);
  const [assessmentCount, setAssessmentCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
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
    } finally {
      setIsLoading(false);
    }
  };

  // Derive radar chart data from analysis
  const skillRadarData = analysis?.gaps
    ? analysis.gaps.slice(0, 6).map((gap: SkillGap) => ({
        skill: gap.skillName,
        current: gap.currentLevel,
        required: gap.requiredLevel,
      }))
    : [
        { skill: 'JavaScript', current: 0, required: 80 },
        { skill: 'React', current: 0, required: 80 },
        { skill: 'Node.js', current: 0, required: 70 },
        { skill: 'TypeScript', current: 0, required: 75 },
        { skill: 'SQL', current: 0, required: 60 },
        { skill: 'Git', current: 0, required: 70 },
      ];

  // Derive top gaps from analysis
  const topGaps = analysis?.gaps
    ? analysis.gaps
        .sort((a, b) => b.gapSize - a.gapSize)
        .slice(0, 3)
        .map((g) => ({ skill: g.skillName, gap: g.gapSize, priority: g.priority }))
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
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Track your skill development progress</p>
        </div>
        <Link to="/assessment">
          <Button>
            Take Assessment
            <ArrowRight className="ml-2" size={18} />
          </Button>
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-primary-500 to-primary-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-primary-100 text-sm">Overall Readiness</p>
              <p className="text-3xl font-bold mt-1">{overallReadiness}%</p>
            </div>
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <TrendingUp size={24} />
            </div>
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-secondary-500 to-secondary-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-secondary-100 text-sm">Assessments Taken</p>
              <p className="text-3xl font-bold mt-1">{assessmentCount}</p>
            </div>
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <Award size={24} />
            </div>
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-sm">Active Gaps</p>
              <p className="text-3xl font-bold mt-1">{activeGaps}</p>
            </div>
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <AlertTriangle size={24} />
            </div>
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm">Target Role</p>
              <p className="text-lg font-bold mt-1">{analysis ? 'Set' : 'Not Set'}</p>
            </div>
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <Target size={24} />
            </div>
          </div>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Skill Radar Chart */}
        <Card>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Skill Overview</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={skillRadarData}>
                <PolarGrid stroke="#e5e7eb" />
                <PolarAngleAxis dataKey="skill" tick={{ fill: '#6b7280', fontSize: 12 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 10 }} />
                <Radar
                  name="Current Level"
                  dataKey="current"
                  stroke="#3b82f6"
                  fill="#3b82f6"
                  fillOpacity={0.4}
                />
                <Radar
                  name="Required Level"
                  dataKey="required"
                  stroke="#8b5cf6"
                  fill="#8b5cf6"
                  fillOpacity={0.2}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
          <div className="flex items-center justify-center gap-6 mt-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-primary-500 rounded-full"></div>
              <span className="text-sm text-gray-600">Current</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-secondary-500 rounded-full"></div>
              <span className="text-sm text-gray-600">Required</span>
            </div>
          </div>
        </Card>

        {/* Top Skills Gaps */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Priority Gaps</h3>
            <Link to="/gap-analysis" className="text-sm text-primary-600 hover:text-primary-700">
              View All
            </Link>
          </div>
          <div className="space-y-4">
            {topGaps.map((gap) => (
              <div key={gap.skill} className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-gray-900">{gap.skill}</span>
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
                <ProgressBar value={100 - gap.gap} color="danger" size="sm" />
                <p className="text-sm text-gray-500 mt-2">Gap: {gap.gap} points to close</p>
              </div>
            ))}
          </div>
          <Link to="/recommendations">
            <Button variant="outline" className="w-full mt-4">
              Get Learning Recommendations
            </Button>
          </Link>
        </Card>
      </div>

      {/* Recent Activity / Empty State */}
      <Card>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          {analysis ? 'Analysis Summary' : 'Get Started'}
        </h3>
        {analysis ? (
          <div className="space-y-3">
            {analysis.strengths && analysis.strengths.length > 0 && (
              <div className="p-3 bg-green-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center bg-green-100">
                    <CheckCircle size={16} className="text-green-600" />
                  </div>
                  <span className="text-gray-900">
                    <strong>{analysis.strengths.length}</strong> skills exceed role requirements
                  </span>
                </div>
              </div>
            )}
            {analysis.recommendations && analysis.recommendations.map((rec, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center bg-primary-100">
                    <ArrowRight size={16} className="text-primary-600" />
                  </div>
                  <span className="text-gray-900 text-sm">{rec}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500 mb-4">
              Take an assessment to see your skill analysis here
            </p>
            <Link to="/assessment">
              <Button>
                Start Your First Assessment
                <ArrowRight className="ml-2" size={18} />
              </Button>
            </Link>
          </div>
        )}
      </Card>
    </div>
  );
}
