import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Map, Loader2, Rocket, BookOpen, Code2, Trophy, Clock,
  ArrowRight, ChevronDown, ChevronUp, Sparkles, Target
} from 'lucide-react';
import { aiService, CareerRoadmap as RoadmapType } from '../services/api/ai.service';

export default function CareerRoadmap() {
  const [targetRole, setTargetRole] = useState('');
  const [experienceLevel, setExperienceLevel] = useState('');
  const [skills, setSkills] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [roadmap, setRoadmap] = useState<RoadmapType | null>(null);
  const [expandedPhase, setExpandedPhase] = useState<number | null>(0);
  const [error, setError] = useState('');

  const handleGenerate = async () => {
    if (!targetRole) {
      setError('Please enter a target role');
      return;
    }
    setError('');
    setIsLoading(true);
    try {
      const currentSkills = skills
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean)
        .map((s) => ({ name: s, level: 2 }));

      const result = await aiService.generateRoadmap({
        targetRole,
        currentSkills,
        experienceLevel: experienceLevel || undefined,
      });
      setRoadmap(result);
      setExpandedPhase(0);
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Unable to generate your roadmap. The AI service may be busy — please try again shortly.');
    } finally {
      setIsLoading(false);
    }
  };

  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  const phaseColors = [
    'from-blue-500 to-cyan-500',
    'from-purple-500 to-pink-500',
    'from-orange-500 to-amber-500',
    'from-green-500 to-emerald-500',
    'from-red-500 to-rose-500',
    'from-indigo-500 to-violet-500',
  ];

  const phaseIcons = [BookOpen, Code2, Target, Rocket, Trophy, Sparkles];

  return (
    <div className="space-y-6">
      <motion.div initial="hidden" animate="visible" variants={fadeIn}>
        <div className="flex items-center space-x-3 mb-2">
          <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
            <Map className="text-white" size={22} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-100">AI Career Roadmap</h1>
            <p className="text-sm text-gray-500">Personalized learning path • Powered by Groq AI</p>
          </div>
        </div>
      </motion.div>

      {/* Input Section */}
      {!roadmap && (
        <motion.div initial="hidden" animate="visible" variants={fadeIn}>
          <div className="card max-w-2xl mx-auto">
            <h3 className="text-lg font-semibold mb-4">Generate Your Roadmap</h3>
            <div className="space-y-4">
              <div>
                <label className="label">Target Role *</label>
                <input className="input" placeholder="e.g., Full Stack Developer, Data Scientist"
                       value={targetRole} onChange={(e) => setTargetRole(e.target.value)} />
              </div>
              <div>
                <label className="label">Your Current Skills (comma-separated)</label>
                <input className="input" placeholder="e.g., HTML, CSS, JavaScript, React"
                       value={skills} onChange={(e) => setSkills(e.target.value)} />
              </div>
              <div>
                <label className="label">Experience Level</label>
                <div className="grid grid-cols-4 gap-2">
                  {['Beginner', 'Junior', 'Mid-Level', 'Career Switcher'].map((level) => (
                    <button key={level} onClick={() => setExperienceLevel(level)}
                      className={`py-2 px-3 rounded-lg text-sm font-medium border transition-all ${
                        experienceLevel === level
                          ? 'bg-green-500/10 border-green-500/50 text-green-400'
                          : 'border-slate-700 text-gray-400 hover:bg-slate-800'
                      }`}>
                      {level}
                    </button>
                  ))}
                </div>
              </div>

              {error && (
                <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-sm text-red-400">{error}</div>
              )}

              <button onClick={handleGenerate} disabled={isLoading}
                className="w-full btn-primary flex items-center justify-center space-x-2 disabled:opacity-50 py-3">
                {isLoading ? (
                  <><Loader2 size={18} className="animate-spin" /><span>Generating Roadmap...</span></>
                ) : (
                  <><Rocket size={18} /><span>Generate My Roadmap</span></>
                )}
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Loading */}
      {isLoading && (
        <motion.div initial="hidden" animate="visible" variants={fadeIn}
          className="card flex flex-col items-center justify-center py-16">
          <Loader2 size={48} className="animate-spin text-green-500 mb-4" />
          <p className="font-semibold text-lg">Building Your Personalized Roadmap...</p>
          <p className="text-sm text-gray-500 mt-1">AI is crafting a detailed learning path</p>
        </motion.div>
      )}

      {/* Roadmap Display */}
      {roadmap && !isLoading && (
        <motion.div initial="hidden" animate="visible" variants={fadeIn} className="space-y-6">
          {/* Header */}
          <div className="card bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-500/30">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-xl font-bold text-green-300 mb-2">Your Roadmap to {targetRole}</h2>
                <p className="text-sm text-green-300 mb-3">{roadmap.introduction}</p>
                <div className="flex flex-wrap gap-3 text-xs">
                  <span className="bg-green-500/20 text-green-300 px-3 py-1 rounded-full flex items-center gap-1">
                    <Clock size={12} /> {roadmap.estimatedDuration}
                  </span>
                  <span className="bg-blue-500/20 text-blue-300 px-3 py-1 rounded-full">
                    {roadmap.currentLevel} → {roadmap.targetLevel}
                  </span>
                </div>
              </div>
              <button onClick={() => { setRoadmap(null); }} className="text-sm text-green-400 hover:underline">
                New Roadmap
              </button>
            </div>
          </div>

          {/* Timeline */}
          <div className="relative">
            {/* Vertical line */}
            <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-300 via-purple-300 to-green-300 hidden lg:block" />

            <div className="space-y-4">
              {roadmap.timelineSteps.map((step, i) => {
                const IconComp = phaseIcons[i % phaseIcons.length];
                const color = phaseColors[i % phaseColors.length];
                const isExpanded = expandedPhase === i;

                return (
                  <motion.div key={i}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="relative lg:pl-16"
                  >
                    {/* Timeline dot */}
                    <div className={`hidden lg:flex absolute left-0 top-4 w-12 h-12 rounded-full bg-gradient-to-br ${color} items-center justify-center shadow-lg z-10`}>
                      <IconComp size={20} className="text-white" />
                    </div>

                    <div className={`card border-l-4 cursor-pointer transition-all hover:shadow-md ${
                      isExpanded ? 'shadow-md' : ''
                    }`} style={{ borderLeftColor: `var(--tw-gradient-from)` }}
                      onClick={() => setExpandedPhase(isExpanded ? null : i)}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`lg:hidden w-8 h-8 rounded-full bg-gradient-to-br ${color} flex items-center justify-center`}>
                              <IconComp size={14} className="text-white" />
                            </span>
                            <span className="text-xs font-medium text-gray-500 uppercase">{step.duration}</span>
                          </div>
                          <h3 className="text-lg font-semibold text-gray-100">{step.title}</h3>
                          <p className="text-sm text-gray-400 mt-1">{step.description}</p>
                        </div>
                        {isExpanded ? <ChevronUp size={20} className="text-gray-400" /> : <ChevronDown size={20} className="text-gray-400" />}
                      </div>

                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className="overflow-hidden"
                          >
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 pt-4 border-t">
                              {/* Skills */}
                              <div>
                                <h4 className="text-sm font-semibold text-blue-400 flex items-center gap-1 mb-2">
                                  <Target size={14} /> Skills to Learn
                                </h4>
                                <div className="flex flex-wrap gap-1.5">
                                  {step.skills.map((s, j) => (
                                    <span key={j} className="px-2.5 py-1 bg-blue-500/10 text-blue-400 rounded-full text-xs border border-blue-500/30">
                                      {s}
                                    </span>
                                  ))}
                                </div>
                              </div>

                              {/* Projects */}
                              <div>
                                <h4 className="text-sm font-semibold text-purple-400 flex items-center gap-1 mb-2">
                                  <Code2 size={14} /> Projects to Build
                                </h4>
                                <ul className="space-y-1.5">
                                  {step.projects.map((p, j) => (
                                    <li key={j} className="text-xs text-gray-300 flex items-start gap-1.5">
                                      <ArrowRight size={12} className="text-purple-400 mt-0.5 shrink-0" /> {p}
                                    </li>
                                  ))}
                                </ul>
                              </div>

                              {/* Resources */}
                              <div>
                                <h4 className="text-sm font-semibold text-green-400 flex items-center gap-1 mb-2">
                                  <BookOpen size={14} /> Resources
                                </h4>
                                <ul className="space-y-1.5">
                                  {step.resources.map((r, j) => (
                                    <li key={j} className="text-xs text-gray-300 flex items-start gap-1.5">
                                      <span className="text-green-500">📚</span> {r}
                                    </li>
                                  ))}
                                </ul>
                              </div>

                              {/* Milestones */}
                              <div>
                                <h4 className="text-sm font-semibold text-amber-400 flex items-center gap-1 mb-2">
                                  <Trophy size={14} /> Milestones
                                </h4>
                                <ul className="space-y-1.5">
                                  {step.milestones.map((m, j) => (
                                    <li key={j} className="text-xs text-gray-300 flex items-start gap-1.5">
                                      <span className="text-amber-500">🎯</span> {m}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Final Advice */}
          <motion.div variants={fadeIn} className="card bg-gradient-to-r from-primary-500/10 to-secondary-500/10 border-primary-500/30 text-center">
            <Sparkles size={24} className="mx-auto text-primary-500 mb-2" />
            <p className="text-sm text-primary-300 font-medium italic">"{roadmap.finalAdvice}"</p>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
