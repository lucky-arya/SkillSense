import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Card, Button, Input, Badge, ProgressBar } from '../components/ui';
import { Target, Calendar, Edit2, Save, X } from 'lucide-react';
import { skillService } from '../services/api/skill.service';
import { assessmentService } from '../services/api/assessment.service';

export default function Profile() {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [skills, setSkills] = useState<{ name: string; level: number; category: string }[]>([]);
  const [assessmentCount, setAssessmentCount] = useState(0);
  const [_isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadProfileData();
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
    } finally {
      setIsLoading(false);
    }
  };

  const overallProgress = skills.length > 0
    ? Math.round(skills.reduce((acc, s) => acc + s.level, 0) / skills.length)
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
        <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
        <p className="text-gray-600 mt-1">Manage your account and view your progress</p>
      </div>

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
                  <h2 className="text-xl font-semibold text-gray-900">{user?.name}</h2>
                  <p className="text-gray-500">{user?.email}</p>
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
                <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                  <Target size={20} className="text-primary-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Target Role</p>
                  <p className="font-medium text-gray-900">Set via Gap Analysis</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-secondary-100 rounded-lg flex items-center justify-center">
                  <Calendar size={20} className="text-secondary-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Member Since</p>
                  <p className="font-medium text-gray-900">Recently Joined</p>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Stats and Skills */}
        <div className="lg:col-span-2 space-y-6">
          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="text-center">
              <p className="text-3xl font-bold text-primary-600">
                {assessmentCount}
              </p>
              <p className="text-sm text-gray-500">Assessments</p>
            </Card>
            <Card className="text-center">
              <p className="text-3xl font-bold text-secondary-600">
                {skills.length}
              </p>
              <p className="text-sm text-gray-500">Skills Tracked</p>
            </Card>
            <Card className="text-center">
              <p className="text-3xl font-bold text-green-600">
                {overallProgress}%
              </p>
              <p className="text-sm text-gray-500">Avg. Proficiency</p>
            </Card>
            <Card className="text-center">
              <p className="text-3xl font-bold text-orange-600">{skills.filter(s => s.level < 50).length}</p>
              <p className="text-sm text-gray-500">Skills to Improve</p>
            </Card>
          </div>

          {/* Skills Overview */}
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Skills</h3>
            <div className="space-y-4">
              {skills.map((skill) => {
                const badge = getLevelBadge(skill.level);
                return (
                  <div key={skill.name}>
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-900">{skill.name}</span>
                        <Badge variant={badge.variant} size="sm">
                          {badge.label}
                        </Badge>
                      </div>
                      <span className="text-sm text-gray-500">{skill.level}%</span>
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
          </Card>

          {/* Recent Activity */}
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Settings</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">Email Notifications</p>
                  <p className="text-sm text-gray-500">
                    Receive updates about your progress
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" defaultChecked className="sr-only peer" />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">Weekly Progress Reports</p>
                  <p className="text-sm text-gray-500">Get a summary of your weekly learning</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" defaultChecked className="sr-only peer" />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                </label>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
