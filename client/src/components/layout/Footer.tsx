import { Heart, Github, Sparkles } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="mt-auto border-t border-slate-800 bg-slate-900/50 py-4 px-6">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-gray-500">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 bg-gradient-to-br from-primary-500 to-secondary-500 rounded flex items-center justify-center">
            <Sparkles size={10} className="text-white" />
          </div>
          <span className="text-gray-400">SkillSense AI</span>
          <span className="text-gray-600">•</span>
          <span>Powered by Groq AI</span>
        </div>
        <div className="flex items-center gap-3">
          <a
            href="https://github.com/lucky-arya/SkillSense"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 hover:text-gray-300 transition-colors"
          >
            <Github size={13} />
            <span>GitHub</span>
          </a>
          <span className="text-gray-600">•</span>
          <span className="flex items-center gap-1">
            Built with <Heart size={11} className="text-red-500" /> for learners
          </span>
          <span className="text-gray-600">•</span>
          <span>&copy; {new Date().getFullYear()}</span>
        </div>
      </div>
    </footer>
  );
}
