import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowRight, Brain, Target, TrendingUp, Sparkles, FileText, Mic,
  Map, Bot, Shield, Zap, Code2, BarChart3, Users, Star, ChevronRight,
  Flame, Youtube, ExternalLink
} from 'lucide-react';
import { Button } from '../components/ui';

const fadeIn = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

const stagger = {
  visible: { transition: { staggerChildren: 0.15 } },
};

const features = [
  {
    icon: Brain,
    title: 'AI Skill Assessment',
    desc: 'ML-powered assessments that adapt to your level and accurately map your proficiency.',
    color: 'from-blue-500 to-cyan-500',
    bg: 'bg-blue-500/20',
  },
  {
    icon: Target,
    title: 'Gap Analysis Engine',
    desc: 'See exactly where you stand vs your dream role with priority-weighted insights.',
    color: 'from-purple-500 to-pink-500',
    bg: 'bg-purple-500/20',
  },
  {
    icon: FileText,
    title: 'Resume Analyzer',
    desc: 'Upload your resume for ATS scoring, missing keyword detection, and roast mode 🔥.',
    color: 'from-orange-500 to-red-500',
    bg: 'bg-orange-500/20',
  },
  {
    icon: Mic,
    title: 'Mock Interview',
    desc: 'Voice-enabled AI interviews with real-time feedback and detailed evaluation reports.',
    color: 'from-indigo-500 to-violet-500',
    bg: 'bg-indigo-500/20',
  },
  {
    icon: Map,
    title: 'Career Roadmap',
    desc: 'Get a personalized timeline with phases, projects, resources, and milestones.',
    color: 'from-green-500 to-emerald-500',
    bg: 'bg-green-500/20',
  },
  {
    icon: Bot,
    title: 'AI Career Coach',
    desc: 'Chat with an AI assistant for real-time career advice, study plans, and guidance.',
    color: 'from-cyan-500 to-blue-500',
    bg: 'bg-cyan-500/20',
  },
];

const techStack = [
  { name: 'React', icon: Code2 },
  { name: 'Express', icon: Zap },
  { name: 'FastAPI', icon: Zap },
  { name: 'MongoDB', icon: BarChart3 },
  { name: 'Groq AI', icon: Sparkles },
  { name: 'Docker', icon: Shield },
];

const stats = [
  { value: '6+', label: 'AI Features' },
  { value: 'Groq AI', label: 'Powered By' },
  { value: '3', label: 'Microservices' },
  { value: '∞', label: 'Possibilities' },
];

const trendingSkills = [
  { name: 'AI / Prompt Engineering', growth: '+320%', hot: true },
  { name: 'Agentic AI', growth: '+400%', hot: true },
  { name: 'LLM Fine-Tuning', growth: '+280%', hot: true },
  { name: 'Rust', growth: '+145%', hot: true },
  { name: 'System Design', growth: '+120%', hot: true },
  { name: 'Cybersecurity', growth: '+110%', hot: true },
  { name: 'MLOps', growth: '+160%', hot: true },
  { name: 'Kubernetes & Cloud Native', growth: '+95%', hot: false },
];

const topCourses = [
  { title: 'CS50: Introduction to Computer Science', channel: 'Harvard / freeCodeCamp', url: 'https://www.youtube.com/watch?v=8mAITcNt710', level: 'Beginner' },
  { title: 'Full Stack Web Development Bootcamp', channel: 'freeCodeCamp', url: 'https://www.youtube.com/watch?v=nu_pCVPKzTk', level: 'Beginner' },
  { title: 'React Full Course 2025', channel: 'Bro Code', url: 'https://www.youtube.com/watch?v=CgkZ7MvWUAA', level: 'Intermediate' },
  { title: 'Machine Learning with Python', channel: 'freeCodeCamp', url: 'https://www.youtube.com/watch?v=i_LwzRVP7bg', level: 'Intermediate' },
  { title: 'Docker & Kubernetes Full Course', channel: 'TechWorld with Nana', url: 'https://www.youtube.com/watch?v=pg19Z8LL06w', level: 'Intermediate' },
  { title: 'System Design for Beginners', channel: 'NeetCode', url: 'https://www.youtube.com/watch?v=F2FmTdLtb_4', level: 'Intermediate' },
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-white overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute top-1/4 -left-20 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-500/5 rounded-full blur-3xl" />
      </div>

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-slate-950/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-2">
              <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Sparkles size={18} className="text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">SkillSense AI</span>
            </div>
            <div className="flex items-center space-x-3">
              <Link to="/login">
                <Button variant="ghost" className="text-gray-300 hover:text-white">Sign In</Button>
              </Link>
              <Link to="/register">
                <button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white px-5 py-2 rounded-lg text-sm font-medium transition-all shadow-lg shadow-blue-500/25">
                  Get Started
                </button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="relative z-10">
        {/* Hero */}
        <section className="pt-32 pb-24 px-4 sm:px-6 lg:px-8">
          <motion.div initial="hidden" animate="visible" variants={stagger} className="max-w-7xl mx-auto text-center">
            <motion.div variants={fadeIn} className="inline-flex items-center space-x-2 bg-white/5 backdrop-blur-sm border border-white/10 text-blue-300 px-5 py-2 rounded-full mb-8">
              <Sparkles size={16} className="text-blue-400" />
              <span className="text-sm font-medium">AI-Powered Career Intelligence Platform</span>
            </motion.div>

            <motion.h1 variants={fadeIn} className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
              Your Career Growth,
              <br />
              <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                Supercharged by AI
              </span>
            </motion.h1>

            <motion.p variants={fadeIn} className="text-lg sm:text-xl text-gray-400 max-w-3xl mx-auto mb-10">
              SkillSense analyzes your skills, scores your resume, conducts mock interviews,
              and builds personalized career roadmaps — all powered by Groq AI.
            </motion.p>

            <motion.div variants={fadeIn} className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/register">
                <button className="group w-full sm:w-auto bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white px-8 py-3.5 rounded-xl font-medium transition-all shadow-xl shadow-blue-500/25 flex items-center justify-center">
                  Start Free Assessment
                  <ArrowRight size={18} className="ml-2 group-hover:translate-x-1 transition-transform" />
                </button>
              </Link>
              <Link to="/login">
                <button className="w-full sm:w-auto bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 px-8 py-3.5 rounded-xl font-medium transition-all">
                  I Have an Account
                </button>
              </Link>
            </motion.div>

            {/* Stats */}
            <motion.div variants={fadeIn} className="mt-16 grid grid-cols-2 sm:grid-cols-4 gap-6 max-w-2xl mx-auto">
              {stats.map((s) => (
                <div key={s.label} className="text-center">
                  <div className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                    {s.value}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">{s.label}</div>
                </div>
              ))}
            </motion.div>
          </motion.div>
        </section>

        {/* Features Grid */}
        <section className="py-24 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeIn} className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                Everything You Need to
                <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent"> Advance Your Career</span>
              </h2>
              <p className="text-gray-400 max-w-2xl mx-auto">
                Six powerful AI-driven tools, one platform. From skill assessment to interview prep.
              </p>
            </motion.div>

            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}
              className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map((f) => (
                <motion.div key={f.title} variants={fadeIn}
                  className="group relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:bg-white/10 hover:border-white/20 transition-all duration-300">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${f.color} flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform`}>
                    <f.icon size={22} className="text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">{f.title}</h3>
                  <p className="text-sm text-gray-400">{f.desc}</p>
                  <ChevronRight size={16} className="absolute top-6 right-6 text-gray-600 group-hover:text-white transition-colors" />
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-24 px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeIn} className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">How It Works</h2>
              <p className="text-gray-400">Three simple steps to accelerate your career</p>
            </motion.div>

            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}
              className="grid md:grid-cols-3 gap-8">
              {[
                { step: '01', title: 'Assess', desc: 'Take AI-powered assessments and upload your resume for analysis', icon: Brain },
                { step: '02', title: 'Analyze', desc: 'Get detailed gap analysis with ATS scoring and skill mapping', icon: BarChart3 },
                { step: '03', title: 'Advance', desc: 'Follow your personalized roadmap, practice interviews, grow', icon: TrendingUp },
              ].map((item) => (
                <motion.div key={item.step} variants={fadeIn} className="text-center">
                  <div className="relative inline-block mb-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-600/20 to-purple-600/20 rounded-2xl flex items-center justify-center border border-white/10">
                      <item.icon size={28} className="text-blue-400" />
                    </div>
                    <span className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full text-xs flex items-center justify-center font-bold">
                      {item.step}
                    </span>
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                  <p className="text-sm text-gray-400">{item.desc}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Tech Stack */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 border-y border-white/5">
          <div className="max-w-5xl mx-auto">
            <p className="text-center text-sm text-gray-500 mb-8 uppercase tracking-widest">Built With Modern Technology</p>
            <div className="flex flex-wrap justify-center gap-6">
              {techStack.map((t) => (
                <div key={t.name} className="flex items-center gap-2 bg-white/5 px-5 py-2.5 rounded-lg border border-white/5">
                  <t.icon size={16} className="text-gray-400" />
                  <span className="text-sm text-gray-300">{t.name}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Architecture Advantages */}
        <section className="py-24 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeIn} className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">Production-Grade Architecture</h2>
              <p className="text-gray-400 max-w-2xl mx-auto">Not just a demo — a real, deployable, scalable platform</p>
            </motion.div>

            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}
              className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { icon: Code2, title: 'Microservices', desc: '3 independent services: React, Express, FastAPI' },
                { icon: Shield, title: 'Docker Ready', desc: 'Full docker-compose with multi-stage builds' },
                { icon: Star, title: 'Test Coverage', desc: 'Jest + pytest with 34+ automated tests' },
                { icon: Users, title: 'Type-Safe', desc: 'Shared TypeScript types across all services' },
              ].map((a) => (
                <motion.div key={a.title} variants={fadeIn}
                  className="bg-gradient-to-br from-white/5 to-white/0 border border-white/10 rounded-xl p-5">
                  <a.icon size={20} className="text-blue-400 mb-3" />
                  <h4 className="font-semibold text-sm mb-1">{a.title}</h4>
                  <p className="text-xs text-gray-500">{a.desc}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Explore: Trending Skills & Free Courses */}
        <section className="py-24 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeIn} className="text-center mb-16">
              <div className="inline-flex items-center gap-2 bg-orange-500/10 border border-orange-500/20 text-orange-300 px-4 py-1.5 rounded-full text-sm font-medium mb-4">
                <Flame size={14} /> Trending in 2026
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                Stay Ahead with
                <span className="bg-gradient-to-r from-orange-400 to-pink-400 bg-clip-text text-transparent"> In-Demand Skills</span>
              </h2>
              <p className="text-gray-400 max-w-2xl mx-auto">
                Discover what's hot in the tech industry and start learning for free today.
              </p>
            </motion.div>

            {/* Trending Skills Grid */}
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}
              className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-16">
              {trendingSkills.map((skill) => (
                <motion.div key={skill.name} variants={fadeIn}
                  className="group bg-white/5 border border-white/10 rounded-xl p-4 hover:bg-white/10 hover:border-orange-500/30 transition-all">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-green-400 text-xs font-bold">{skill.growth}</span>
                    {skill.hot && <Flame size={14} className="text-orange-400" />}
                  </div>
                  <p className="text-sm font-medium text-gray-200">{skill.name}</p>
                </motion.div>
              ))}
            </motion.div>

            {/* Free Courses */}
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeIn} className="text-center mb-8">
              <h3 className="text-2xl font-bold mb-2">Free Courses to Get Started</h3>
              <p className="text-gray-400 text-sm">Top-rated YouTube courses — completely free, no strings attached</p>
            </motion.div>

            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}
              className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
              {topCourses.map((course) => (
                <motion.a key={course.title} variants={fadeIn} href={course.url} target="_blank" rel="noopener noreferrer"
                  className="group bg-white/5 border border-white/10 rounded-xl p-5 hover:bg-white/10 hover:border-red-500/30 transition-all block">
                  <div className="flex items-start justify-between mb-3">
                    <Youtube size={20} className="text-red-400 flex-shrink-0 mt-0.5" />
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      course.level === 'Beginner' ? 'bg-green-500/20 text-green-300' : 'bg-blue-500/20 text-blue-300'
                    }`}>
                      {course.level}
                    </span>
                  </div>
                  <h4 className="font-medium text-gray-200 text-sm mb-1 group-hover:text-white transition-colors">{course.title}</h4>
                  <p className="text-xs text-gray-500">{course.channel}</p>
                  <div className="mt-3 flex items-center gap-1 text-xs text-gray-500 group-hover:text-red-400 transition-colors">
                    <ExternalLink size={12} /> Watch Free
                  </div>
                </motion.a>
              ))}
            </motion.div>

            <div className="text-center">
              <Link to="/register">
                <button className="bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 hover:text-white px-6 py-2.5 rounded-lg text-sm font-medium transition-all">
                  Sign up to explore more courses, podcasts & career tips <ArrowRight size={14} className="inline ml-1" />
                </button>
              </Link>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-24 px-4 sm:px-6 lg:px-8">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeIn}
            className="max-w-4xl mx-auto text-center">
            <div className="relative bg-gradient-to-br from-blue-600/20 to-purple-600/20 backdrop-blur-sm border border-white/10 rounded-3xl p-12">
              <Sparkles size={40} className="mx-auto text-blue-400 mb-4" />
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                Ready to Discover Your Potential?
              </h2>
              <p className="text-gray-400 mb-8 max-w-xl mx-auto">
                Join SkillSense and let AI guide your career growth from assessment to achievement.
              </p>
              <Link to="/register">
                <button className="group bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white px-10 py-4 rounded-xl font-medium transition-all shadow-xl shadow-blue-500/25 text-lg">
                  Get Started for Free
                  <ArrowRight size={20} className="inline ml-2 group-hover:translate-x-1 transition-transform" />
                </button>
              </Link>
            </div>
          </motion.div>
        </section>

        {/* Footer */}
        <footer className="py-8 px-4 border-t border-white/5">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between text-xs text-gray-600">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 bg-gradient-to-br from-blue-500 to-purple-600 rounded flex items-center justify-center">
                <Sparkles size={10} className="text-white" />
              </div>
              <span>SkillSense AI</span>
            </div>
            <p className="mt-2 sm:mt-0">&copy; {new Date().getFullYear()} Built with ❤️ for learners everywhere.</p>
          </div>
        </footer>
      </div>
    </div>
  );
}
