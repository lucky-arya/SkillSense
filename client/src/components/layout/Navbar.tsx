import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, User, LogOut } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="fixed top-0 left-0 right-0 bg-slate-900 border-b border-slate-800 z-50">
      <div className="px-4 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/dashboard" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">SS</span>
            </div>
            <span className="text-xl font-bold text-gray-100">SkillSense</span>
          </Link>

          {/* Desktop User Menu */}
          <div className="hidden lg:flex items-center space-x-4">
            <span className="text-sm text-gray-400">Welcome, {user?.name}</span>
            <Link
              to="/profile"
              className="p-2 text-gray-400 hover:text-gray-200 hover:bg-slate-800 rounded-lg transition-colors"
            >
              <User size={20} />
            </Link>
            <button
              onClick={handleLogout}
              className="p-2 text-gray-400 hover:text-red-400 hover:bg-slate-800 rounded-lg transition-colors"
            >
              <LogOut size={20} />
            </button>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="lg:hidden p-2 text-gray-400 hover:text-gray-200 hover:bg-slate-800 rounded-lg"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="lg:hidden bg-slate-900 border-t border-slate-800 py-4 px-4">
          <div className="flex flex-col space-y-2">
            <Link
              to="/dashboard"
              className="px-4 py-2 text-gray-300 hover:bg-slate-800 rounded-lg"
              onClick={() => setIsMenuOpen(false)}
            >
              Dashboard
            </Link>
            <Link
              to="/assessment"
              className="px-4 py-2 text-gray-300 hover:bg-slate-800 rounded-lg"
              onClick={() => setIsMenuOpen(false)}
            >
              Assessment
            </Link>
            <Link
              to="/gap-analysis"
              className="px-4 py-2 text-gray-300 hover:bg-slate-800 rounded-lg"
              onClick={() => setIsMenuOpen(false)}
            >
              Gap Analysis
            </Link>
            <Link
              to="/recommendations"
              className="px-4 py-2 text-gray-300 hover:bg-slate-800 rounded-lg"
              onClick={() => setIsMenuOpen(false)}
            >
              Recommendations
            </Link>
            <hr className="my-2 border-slate-700" />
            <p className="px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">AI Tools</p>
            <Link
              to="/resume-analyzer"
              className="px-4 py-2 text-gray-300 hover:bg-slate-800 rounded-lg"
              onClick={() => setIsMenuOpen(false)}
            >
              Resume Analyzer
            </Link>
            <Link
              to="/mock-interview"
              className="px-4 py-2 text-gray-300 hover:bg-slate-800 rounded-lg"
              onClick={() => setIsMenuOpen(false)}
            >
              Mock Interview
            </Link>
            <Link
              to="/career-roadmap"
              className="px-4 py-2 text-gray-300 hover:bg-slate-800 rounded-lg"
              onClick={() => setIsMenuOpen(false)}
            >
              Career Roadmap
            </Link>
            <Link
              to="/ai-chat"
              className="px-4 py-2 text-gray-300 hover:bg-slate-800 rounded-lg"
              onClick={() => setIsMenuOpen(false)}
            >
              AI Chat
            </Link>
            <hr className="my-2 border-slate-700" />
            <p className="px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Discover</p>
            <Link
              to="/explore"
              className="px-4 py-2 text-gray-300 hover:bg-slate-800 rounded-lg"
              onClick={() => setIsMenuOpen(false)}
            >
              Explore & Grow
            </Link>
            <hr className="my-2 border-slate-700" />
            <Link
              to="/profile"
              className="px-4 py-2 text-gray-300 hover:bg-slate-800 rounded-lg"
              onClick={() => setIsMenuOpen(false)}
            >
              Profile
            </Link>
            <button
              onClick={() => {
                handleLogout();
                setIsMenuOpen(false);
              }}
              className="px-4 py-2 text-red-400 hover:bg-slate-800 rounded-lg text-left"
            >
              Logout
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}
