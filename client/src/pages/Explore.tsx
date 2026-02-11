import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  TrendingUp, Youtube, Headphones, MessageCircle, ExternalLink,
  Flame, BookOpen, Star, Zap, Globe, Briefcase
} from 'lucide-react';
import { Card, Badge } from '../components/ui';

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

const stagger = {
  visible: { transition: { staggerChildren: 0.08 } },
};

type Tab = 'trending' | 'courses' | 'podcasts' | 'realtalk';

const TRENDING_SKILLS_2026 = [
  { name: 'AI / Prompt Engineering', growth: '+320%', category: 'AI & ML', hot: true },
  { name: 'LLM Fine-Tuning', growth: '+280%', category: 'AI & ML', hot: true },
  { name: 'Rust', growth: '+145%', category: 'Languages', hot: true },
  { name: 'Kubernetes & Cloud Native', growth: '+95%', category: 'DevOps', hot: false },
  { name: 'TypeScript', growth: '+85%', category: 'Languages', hot: false },
  { name: 'System Design', growth: '+120%', category: 'Architecture', hot: true },
  { name: 'Cybersecurity', growth: '+110%', category: 'Security', hot: true },
  { name: 'Data Engineering', growth: '+90%', category: 'Data', hot: false },
  { name: 'React / Next.js', growth: '+75%', category: 'Frontend', hot: false },
  { name: 'Go (Golang)', growth: '+88%', category: 'Languages', hot: false },
  { name: 'MLOps', growth: '+160%', category: 'AI & ML', hot: true },
  { name: 'Web3 / Blockchain', growth: '+65%', category: 'Emerging', hot: false },
  { name: 'GraphQL', growth: '+55%', category: 'Backend', hot: false },
  { name: 'Edge Computing', growth: '+100%', category: 'Infrastructure', hot: false },
  { name: 'Agentic AI', growth: '+400%', category: 'AI & ML', hot: true },
];

const FREE_COURSES = [
  {
    title: 'CS50: Introduction to Computer Science',
    channel: 'Harvard / freeCodeCamp',
    url: 'https://www.youtube.com/watch?v=8mAITcNt710',
    duration: '25+ hours',
    level: 'Beginner',
    tags: ['CS Fundamentals', 'C', 'Python'],
    rating: 4.9,
  },
  {
    title: 'Full Stack Web Development Bootcamp',
    channel: 'freeCodeCamp',
    url: 'https://www.youtube.com/watch?v=nu_pCVPKzTk',
    duration: '18 hours',
    level: 'Beginner',
    tags: ['HTML', 'CSS', 'JavaScript', 'Node.js'],
    rating: 4.8,
  },
  {
    title: 'Python for Everybody',
    channel: 'freeCodeCamp / Dr. Chuck',
    url: 'https://www.youtube.com/watch?v=8DvywoWv6fI',
    duration: '13 hours',
    level: 'Beginner',
    tags: ['Python', 'Data Structures'],
    rating: 4.9,
  },
  {
    title: 'React Full Course 2025',
    channel: 'Bro Code',
    url: 'https://www.youtube.com/watch?v=CgkZ7MvWUAA',
    duration: '9 hours',
    level: 'Intermediate',
    tags: ['React', 'Hooks', 'TypeScript'],
    rating: 4.7,
  },
  {
    title: 'Machine Learning with Python',
    channel: 'freeCodeCamp',
    url: 'https://www.youtube.com/watch?v=i_LwzRVP7bg',
    duration: '10 hours',
    level: 'Intermediate',
    tags: ['ML', 'Scikit-learn', 'TensorFlow'],
    rating: 4.8,
  },
  {
    title: 'Docker & Kubernetes Full Course',
    channel: 'TechWorld with Nana',
    url: 'https://www.youtube.com/watch?v=pg19Z8LL06w',
    duration: '4 hours',
    level: 'Intermediate',
    tags: ['Docker', 'K8s', 'DevOps'],
    rating: 4.8,
  },
  {
    title: 'System Design for Beginners',
    channel: 'NeetCode',
    url: 'https://www.youtube.com/watch?v=F2FmTdLtb_4',
    duration: '2 hours',
    level: 'Intermediate',
    tags: ['System Design', 'Architecture'],
    rating: 4.7,
  },
  {
    title: 'DSA Full Course in JavaScript',
    channel: 'Codevolution',
    url: 'https://www.youtube.com/watch?v=coqQwbDezUA',
    duration: '8 hours',
    level: 'Beginner',
    tags: ['DSA', 'JavaScript', 'Algorithms'],
    rating: 4.6,
  },
  {
    title: 'AWS Certified Cloud Practitioner',
    channel: 'freeCodeCamp / Andrew Brown',
    url: 'https://www.youtube.com/watch?v=SOTamWNgDKc',
    duration: '14 hours',
    level: 'Beginner',
    tags: ['AWS', 'Cloud', 'Certification'],
    rating: 4.9,
  },
];

const PODCASTS = [
  {
    title: 'Syntax.fm',
    host: 'Wes Bos & Scott Tolinski',
    desc: 'Weekly discussions on web development, with tasty tips & tricks for frontend and full-stack devs.',
    tags: ['Web Dev', 'JavaScript', 'CSS'],
    url: 'https://syntax.fm',
    frequency: 'Weekly',
  },
  {
    title: 'The Changelog',
    host: 'Adam Stacoviak & Jerod Santo',
    desc: 'Conversations with the hackers, leaders, and innovators of open source software & community.',
    tags: ['Open Source', 'Tech Culture', 'Engineering'],
    url: 'https://changelog.com/podcast',
    frequency: 'Weekly',
  },
  {
    title: 'CodeNewbie',
    host: 'Saron Yitbarek',
    desc: 'Stories from people on their coding journey. Perfect for beginners feeling imposter syndrome.',
    tags: ['Beginner', 'Career', 'Motivation'],
    url: 'https://www.codenewbie.org/podcast',
    frequency: 'Weekly',
  },
  {
    title: 'Software Engineering Daily',
    host: 'Various',
    desc: 'Technical deep-dives with founders, engineers, and CTOs on architecture, AI, DevOps and more.',
    tags: ['Architecture', 'AI', 'Interviews'],
    url: 'https://softwareengineeringdaily.com',
    frequency: 'Daily',
  },
  {
    title: 'Lex Fridman Podcast',
    host: 'Lex Fridman',
    desc: 'Long-form deep conversations on AI, science, technology, and the nature of intelligence.',
    tags: ['AI', 'Deep Learning', 'Philosophy'],
    url: 'https://lexfridman.com/podcast',
    frequency: 'Weekly',
  },
  {
    title: 'The Primeagen',
    host: 'ThePrimeagen',
    desc: 'Hot takes on programming, VIM, performance, and software culture from a Netflix engineer.',
    tags: ['Performance', 'Opinions', 'Rust'],
    url: 'https://www.youtube.com/@ThePrimeagen',
    frequency: 'Daily',
  },
];

const REAL_TALK = [
  {
    title: 'Your resume doesn\'t matter as much as you think',
    insight: 'After reviewing 1000+ resumes, what actually gets interviews is demonstrated projects + clear communication. Build in public, write about what you learn, contribute to open source.',
    category: 'Job Search',
    icon: Briefcase,
  },
  {
    title: 'The "T-shaped developer" advantage',
    insight: 'Go deep in one area (e.g., React) but broad across many (databases, DevOps, design). Companies love devs who can own a feature end-to-end. Specialists get hired; generalists get promoted.',
    category: 'Career Growth',
    icon: TrendingUp,
  },
  {
    title: 'Don\'t chase every new framework',
    insight: 'JavaScript fatigue is real. Master fundamentals (HTTP, data structures, design patterns) — they transfer across any framework. React, Vue, or Angular? The one your target company uses.',
    category: 'Learning',
    icon: BookOpen,
  },
  {
    title: 'Side projects > LeetCode alone',
    insight: 'LeetCode is important for interviews, but a deployed project with real users shows initiative. Even small projects (a CLI tool, a Chrome extension, a Discord bot) make you stand out.',
    category: 'Portfolio',
    icon: Star,
  },
  {
    title: 'Networking isn\'t just LinkedIn requests',
    insight: 'Attend meetups, contribute to Discord/Slack communities, review others\' PRs, share what you learn on Twitter/X. Your next job will likely come through someone you know.',
    category: 'Networking',
    icon: Globe,
  },
  {
    title: 'AI won\'t replace developers — but devs using AI will replace those who don\'t',
    insight: 'Learn to use GitHub Copilot, Claude, ChatGPT as coding partners. Prompt engineering for code, AI-assisted debugging, and AI code review are becoming essential resume skills in 2026.',
    category: 'AI Era',
    icon: Zap,
  },
];

const categoryColors: Record<string, string> = {
  'AI & ML': 'text-purple-400 bg-purple-500/20 border-purple-500/30',
  'Languages': 'text-blue-400 bg-blue-500/20 border-blue-500/30',
  'DevOps': 'text-orange-400 bg-orange-500/20 border-orange-500/30',
  'Architecture': 'text-cyan-400 bg-cyan-500/20 border-cyan-500/30',
  'Security': 'text-red-400 bg-red-500/20 border-red-500/30',
  'Data': 'text-green-400 bg-green-500/20 border-green-500/30',
  'Frontend': 'text-sky-400 bg-sky-500/20 border-sky-500/30',
  'Backend': 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30',
  'Emerging': 'text-pink-400 bg-pink-500/20 border-pink-500/30',
  'Infrastructure': 'text-teal-400 bg-teal-500/20 border-teal-500/30',
};

const tabs: { id: Tab; label: string; icon: typeof TrendingUp }[] = [
  { id: 'trending', label: 'Trending Skills', icon: TrendingUp },
  { id: 'courses', label: 'Free Courses', icon: Youtube },
  { id: 'podcasts', label: 'Podcasts', icon: Headphones },
  { id: 'realtalk', label: 'Real Talk', icon: MessageCircle },
];

export default function Explore() {
  const [activeTab, setActiveTab] = useState<Tab>('trending');

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-100 flex items-center gap-2">
          <Flame size={24} className="text-orange-500" /> Explore & Grow
        </h1>
        <p className="text-gray-400 mt-1">
          Trending skills, free courses, podcasts, and career advice for 2026
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
              activeTab === tab.id
                ? 'bg-primary-600/20 text-primary-400 border border-primary-500/30'
                : 'bg-slate-800/50 text-gray-400 border border-slate-700 hover:text-gray-200 hover:bg-slate-800'
            }`}
          >
            <tab.icon size={16} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* ═══ Trending Skills ═══ */}
      {activeTab === 'trending' && (
        <motion.div initial="hidden" animate="visible" variants={stagger} className="space-y-4">
          <Card className="bg-gradient-to-r from-orange-500/5 to-red-500/5 border-orange-500/20">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center">
                <TrendingUp size={20} className="text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-100">Most In-Demand Skills in 2026</h3>
                <p className="text-sm text-gray-400">Based on job postings, GitHub trends, and industry reports</p>
              </div>
            </div>
          </Card>

          <div className="grid gap-3">
            {TRENDING_SKILLS_2026.map((skill, i) => (
              <motion.div key={skill.name} variants={fadeIn}>
                <Card className="hover:border-slate-700 transition-all">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-mono text-gray-500 w-6">#{i + 1}</span>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-gray-100">{skill.name}</span>
                          {skill.hot && <Flame size={14} className="text-orange-500" />}
                        </div>
                        <span className={`inline-block mt-1 text-xs px-2 py-0.5 rounded-full border ${categoryColors[skill.category] || 'text-gray-400 bg-gray-500/20 border-gray-500/30'}`}>
                          {skill.category}
                        </span>
                      </div>
                    </div>
                    <span className="text-green-400 font-semibold text-sm">{skill.growth}</span>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* ═══ Free Courses ═══ */}
      {activeTab === 'courses' && (
        <motion.div initial="hidden" animate="visible" variants={stagger} className="space-y-4">
          <Card className="bg-gradient-to-r from-red-500/5 to-pink-500/5 border-red-500/20">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-pink-500 rounded-xl flex items-center justify-center">
                <Youtube size={20} className="text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-100">Top Free Courses on YouTube</h3>
                <p className="text-sm text-gray-400">High-quality, full-length courses — completely free</p>
              </div>
            </div>
          </Card>

          <div className="grid md:grid-cols-2 gap-4">
            {FREE_COURSES.map((course) => (
              <motion.div key={course.title} variants={fadeIn}>
                <a href={course.url} target="_blank" rel="noopener noreferrer" className="block h-full">
                  <Card className="h-full hover:border-red-500/30 transition-all group" hover>
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-100 group-hover:text-red-300 transition-colors flex items-center gap-1.5">
                          {course.title}
                          <ExternalLink size={14} className="text-gray-500 group-hover:text-red-400 flex-shrink-0" />
                        </h3>
                        <p className="text-sm text-gray-500 mt-0.5">{course.channel}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-gray-400 mb-3">
                      <span className="flex items-center gap-1"><Star size={12} className="text-yellow-500" /> {course.rating}</span>
                      <span>{course.duration}</span>
                      <Badge variant="secondary">{course.level}</Badge>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {course.tags.map(tag => (
                        <span key={tag} className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-gray-400 border border-slate-700">{tag}</span>
                      ))}
                    </div>
                  </Card>
                </a>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* ═══ Podcasts ═══ */}
      {activeTab === 'podcasts' && (
        <motion.div initial="hidden" animate="visible" variants={stagger} className="space-y-4">
          <Card className="bg-gradient-to-r from-violet-500/5 to-purple-500/5 border-violet-500/20">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-purple-500 rounded-xl flex items-center justify-center">
                <Headphones size={20} className="text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-100">Must-Listen Tech Podcasts</h3>
                <p className="text-sm text-gray-400">Learn while commuting, exercising, or unwinding</p>
              </div>
            </div>
          </Card>

          <div className="grid md:grid-cols-2 gap-4">
            {PODCASTS.map((pod) => (
              <motion.div key={pod.title} variants={fadeIn}>
                <a href={pod.url} target="_blank" rel="noopener noreferrer" className="block h-full">
                  <Card className="h-full hover:border-violet-500/30 transition-all group" hover>
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-gray-100 group-hover:text-violet-300 transition-colors flex items-center gap-1.5">
                        <Headphones size={16} className="text-violet-400 flex-shrink-0" />
                        {pod.title}
                        <ExternalLink size={14} className="text-gray-500 group-hover:text-violet-400 flex-shrink-0" />
                      </h3>
                      <Badge variant="secondary">{pod.frequency}</Badge>
                    </div>
                    <p className="text-xs text-gray-500 mb-2">Hosted by {pod.host}</p>
                    <p className="text-sm text-gray-400 mb-3">{pod.desc}</p>
                    <div className="flex flex-wrap gap-1.5">
                      {pod.tags.map(tag => (
                        <span key={tag} className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-gray-400 border border-slate-700">{tag}</span>
                      ))}
                    </div>
                  </Card>
                </a>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* ═══ Real Talk ═══ */}
      {activeTab === 'realtalk' && (
        <motion.div initial="hidden" animate="visible" variants={stagger} className="space-y-4">
          <Card className="bg-gradient-to-r from-emerald-500/5 to-teal-500/5 border-emerald-500/20">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center">
                <MessageCircle size={20} className="text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-100">Real Talk: Career Advice That Actually Works</h3>
                <p className="text-sm text-gray-400">No fluff — honest insights from the industry</p>
              </div>
            </div>
          </Card>

          <div className="grid gap-4">
            {REAL_TALK.map((item) => (
              <motion.div key={item.title} variants={fadeIn}>
                <Card className="hover:border-emerald-500/20 transition-all">
                  <div className="flex gap-4">
                    <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5">
                      <item.icon size={20} className="text-emerald-400" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-gray-100">{item.title}</h3>
                        <Badge variant="secondary">{item.category}</Badge>
                      </div>
                      <p className="text-sm text-gray-400 leading-relaxed">{item.insight}</p>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}
