import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, TrendingUp, Target, ChevronRight } from 'lucide-react';
import { Card, Button, ProgressBar, Badge } from '../components/ui';
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
} from 'recharts';

export default function GapAnalysis() {
  const [isLoading, setIsLoading] = useState(true);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [roles, setRoles] = useState<(Role & { match?: number })[]>([]);
  const [gaps, setGaps] = useState<(SkillGap & { category: string })[]>([]);
  const [analysis, setAnalysis] = useState<GapAnalysisResult | null>(null);

  useEffect(() => {
    loadInitialData();
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
    } finally {
      setIsAnalyzing(false);
    }
  };

  const chartData = gaps.map((gap) => ({
    name: gap.skillName,
    current: gap.currentLevel,
    required: gap.requiredLevel,
    gap: gap.gapSize,
  }));

  useEffect(() => {
    loadInitialData();
  }, []);

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
          <Card className="bg-gradient-to-br from-primary-500 to-primary-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-primary-100 text-sm">Role Readiness</p>
                <p className="text-3xl font-bold mt-1">{roleReadiness}%</p>
              </div>
              <TrendingUp size={32} className="text-white/50" />
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm">Skills Gaps</p>
                <p className="text-3xl font-bold mt-1">{gaps.length}</p>
              </div>
              <AlertTriangle size={32} className="text-white/50" />
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-secondary-500 to-secondary-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-secondary-100 text-sm">Est. Time to Close</p>
                <p className="text-3xl font-bold mt-1">{estWeeks} weeks</p>
              </div>
              <Target size={32} className="text-white/50" />
            </div>
          </Card>
        </div>
      )}

      {/* Gap Visualization */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Bar Chart */}
        <Card>
          <h3 className="text-lg font-semibold text-gray-100 mb-4">Skill Comparison</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis type="number" domain={[0, 100]} tick={{ fill: '#94a3b8' }} />
                <YAxis dataKey="name" type="category" width={100} tick={{ fill: '#94a3b8' }} />
                <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: '#e2e8f0' }} />
                <Bar dataKey="current" fill="#3b82f6" name="Current Level" radius={[0, 4, 4, 0]} />
                <Bar
                  dataKey="required"
                  fill="#475569"
                  name="Required Level"
                  radius={[0, 4, 4, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Gap List */}
        <Card>
          <h3 className="text-lg font-semibold text-gray-100 mb-4">Priority Gaps</h3>
          <div className="space-y-4">
            {gaps
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
              ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
