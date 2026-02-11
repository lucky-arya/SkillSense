import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Card, Button, Input, Badge, ProgressBar, Alert } from '../components/ui';
import { Target, Calendar, Edit2, Save, X, Brain, Award, TrendingUp, AlertTriangle } from 'lucide-react';
import { skillService } from '../services/api/skill.service';
import { assessmentService } from '../services/api/assessment.service';

interface AIAssessmentResults {
  targetRole: string;
  experienceLevel: string;
  totalQuestions: number;
  correctAnswers: number;
  scorePercentage: number;
  skillBreakdown: { skill: string; correct: number; total: number; percentage: number }[];
  completedAt: string;
}

export default function Profile() {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [skills, setSkills] = useState<{ name: string; level: number; category: string }[]>([]);
  const [assessmentCount, setAssessmentCount] = useState(0);
  const [_isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [aiResults, setAiResults] = useState<AIAssessmentResults | null>(null);

  useEffect(() => {
    loadProfileData();
    try {
      const stored = localStorage.getItem('ai-assessment-results');
      if (stored) setAiResults(JSON.parse(stored));
    } catch { /* ignore */ }
  }, []);

  const loadProfileData = async () => {
    try {
      const [skillsData, results] = await Promise.allSettled([
        skillService.getUserSkillProfile(),
        assessmentService.getPastResults(),
      ]);

      if (skillsData.status === 'fulfilled' && Array.isArray(skillsData.value)) {
        setSkills(skillsData.value.map((s: any) => ({
          name: s.name || 'Unknown',
          level: s.currentLevel || 0,
          category: s.category || 'General',
        })));
      }
      if (results.status === 'fulfilled' && Array.isArray(results.value)) {
        setAssessmentCount(results.value.length);
      }
    } catch (error) {
      console.error('Failed to load profile data:', error);
      setError('Unable to load your profile data. Please try refreshing the page.');
    } finally {
      setIsLoading(false);
    }
  };

  // Merge API skills with AI assessment skills as fallback
  const displaySkills = skills.length > 0
    ? skills
    : aiResults
      ? aiResults.skillBreakdown.map(s => ({
          name: s.skill,
          level: s.percentage,
          category: 'AI Assessed',
        }))
      : [];

  const totalAssessments = assessmentCount + (aiResults ? 1 : 0);

  const overallProgress = displaySkills.length > 0
    ? Math.round(displaySkills.reduce((acc, s) => acc + s.level, 0) / displaySkills.length)
    : 0;

  const handleSave = async () => {
    // TODO: Wire to user update API when available
    setIsEditing(false);
  };

  const getLevelBadge = (level: number) => {
    if (level >= 80) return { label: 'Expert', variant: 'success' as const };
    if (level >= 60) return { label: 'Advanced', variant: 'primary' as const };
    if (level >= 40) return { label: 'Intermediate', variant: 'warning' as const };
    return { label: 'Beginner', variant: 'danger' as const };
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-gray-100">Profile</h1>
        <p className="text-gray-400 mt-1">Manage your account and view your progress</p>
      </div>

      {error && (
        <Alert type="error" message={error} dismissible onDismiss={() => setError('')} />
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="lg:col-span-1">
          <Card>
            <div className="text-center">
              <div className="w-24 h-24 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl font-bold text-white">
                  {user?.name?.charAt(0).toUpperCase() || 'U'}
                </span>
              </div>

              {isEditing ? (
                <div className="space-y-4">
                  <Input
                    label="Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                  <Input
                    label="Email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                  <div className="flex gap-2">
                    <Button onClick={handleSave} className="flex-1">
                      <Save size={16} className="mr-1" />
                      Save
                    </Button>
                    <Button variant="outline" onClick={() => setIsEditing(false)}>
                      <X size={16} />
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  <h2 className="text-xl font-semibold text-gray-100">{user?.name}</h2>
                  <p className="text-gray-400">{user?.email}</p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-4"
                    onClick={() => setIsEditing(true)}
                  >
                    <Edit2 size={14} className="mr-1" />
                    Edit Profile
                  </Button>
                </>
              )}
            </div>

            <hr className="my-6" />

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary-500/20 rounded-lg flex items-center justify-center">
                  <Target size={20} className="text-primary-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-400">Target Role</p>
                  <p className="font-medium text-gray-200">Set via Gap Analysis</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-secondary-500/20 rounded-lg flex items-center justify-center">
                  <Calendar size={20} className="text-secondary-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-400">Member Since</p>
                  <p className="font-medium text-gray-200">Recently Joined</p>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Stats and Skills */}
        <div className="lg:col-span-2 space-y-6">
          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="bg-gradient-to-br from-blue-600/20 to-blue-700/10 border-blue-500/20">
              <div className="flex flex-col items-center">
                <div className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center mb-2">
                  <Award size={20} className="text-blue-400" />
                </div>
                <p className="text-3xl font-bold text-gray-100">{totalAssessments}</p>
                <p className="text-sm text-gray-400 mt-1">Assessments</p>
              </div>
            </Card>
            <Card className="bg-gradient-to-br from-purple-600/20 to-purple-700/10 border-purple-500/20">
              <div className="flex flex-col items-center">
                <div className="w-10 h-10 bg-purple-500/20 rounded-xl flex items-center justify-center mb-2">
                  <Brain size={20} className="text-purple-400" />
                </div>
                <p className="text-3xl font-bold text-gray-100">{displaySkills.length}</p>
                <p className="text-sm text-gray-400 mt-1">Skills Tracked</p>
              </div>
            </Card>
            <Card className="bg-gradient-to-br from-emerald-600/20 to-emerald-700/10 border-emerald-500/20">
              <div className="flex flex-col items-center">
                <div className="w-10 h-10 bg-emerald-500/20 rounded-xl flex items-center justify-center mb-2">
                  <TrendingUp size={20} className="text-emerald-400" />
                </div>
                <p className="text-3xl font-bold text-gray-100">{overallProgress}%</p>
                <p className="text-sm text-gray-400 mt-1">Avg. Proficiency</p>
              </div>
            </Card>
            <Card className="bg-gradient-to-br from-orange-600/20 to-orange-700/10 border-orange-500/20">
              <div className="flex flex-col items-center">
                <div className="w-10 h-10 bg-orange-500/20 rounded-xl flex items-center justify-center mb-2">
                  <AlertTriangle size={20} className="text-orange-400" />
                </div>
                <p className="text-3xl font-bold text-gray-100">{displaySkills.filter(s => s.level < 50).length}</p>
                <p className="text-sm text-gray-400 mt-1">Skills to Improve</p>
              </div>
            </Card>
          </div>

          {/* Skills Overview */}
          <Card>
            <h3 className="text-lg font-semibold text-gray-100 mb-4">Your Skills</h3>
            {displaySkills.length > 0 ? (
            <div className="space-y-4">
              {displaySkills.map((skill) => {
                const badge = getLevelBadge(skill.level);
                return (
                  <div key={skill.name}>
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-200">{skill.name}</span>
                        <Badge variant={badge.variant} size="sm">
                          {badge.label}
                        </Badge>
                      </div>
                      <span className="text-sm text-gray-400">{skill.level}%</span>
                    </div>
                    <ProgressBar
                      value={skill.level}
                      color={
                        skill.level >= 80
                          ? 'success'
                          : skill.level >= 60
                          ? 'primary'
                          : skill.level >= 40
                          ? 'warning'
                          : 'danger'
                      }
                      size="sm"
                    />
                  </div>
                );
              })}
            </div>
            ) : (
              <div className="text-center py-8">
                <Brain size={40} className="mx-auto text-gray-600 mb-3" />
                <p className="text-gray-400 text-sm">Take an AI Assessment to see your skills here</p>
              </div>
            )}
          </Card>

          {/* Recent Activity */}
          <Card>
            <h3 className="text-lg font-semibold text-gray-100 mb-4">Account Settings</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg border border-slate-700/50">
                <div>
                  <p className="font-medium text-gray-200">Email Notifications</p>
                  <p className="text-sm text-gray-400">
                    Receive updates about your progress
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" defaultChecked className="sr-only peer" />
                  <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-900 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-slate-900 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-slate-300 after:border-slate-600 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg border border-slate-700/50">
                <div>
                  <p className="font-medium text-gray-200">Weekly Progress Reports</p>
                  <p className="text-sm text-gray-400">Get a summary of your weekly learning</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" defaultChecked className="sr-only peer" />
                  <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-900 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-slate-900 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-slate-300 after:border-slate-600 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                </label>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
