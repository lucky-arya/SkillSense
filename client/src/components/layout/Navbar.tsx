import { Link } from 'react-router-dom';
import { Menu, X, User, LogOut } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, logout } = useAuth();

  return (
    <nav className="fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-50">
      <div className="px-4 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/dashboard" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">SS</span>
            </div>
            <span className="text-xl font-bold text-gray-900">SkillSense</span>
          </Link>

          {/* Desktop User Menu */}
          <div className="hidden lg:flex items-center space-x-4">
            <span className="text-sm text-gray-600">Welcome, {user?.name}</span>
            <Link
              to="/profile"
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <User size={20} />
            </Link>
            <button
              onClick={logout}
              className="p-2 text-gray-500 hover:text-danger-500 hover:bg-red-50 rounded-lg transition-colors"
            >
              <LogOut size={20} />
            </button>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="lg:hidden p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="lg:hidden bg-white border-t border-gray-200 py-4 px-4">
          <div className="flex flex-col space-y-2">
            <Link
              to="/dashboard"
              className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
              onClick={() => setIsMenuOpen(false)}
            >
              Dashboard
            </Link>
            <Link
              to="/assessment"
              className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
              onClick={() => setIsMenuOpen(false)}
            >
              Assessment
            </Link>
            <Link
              to="/gap-analysis"
              className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
              onClick={() => setIsMenuOpen(false)}
            >
              Gap Analysis
            </Link>
            <Link
              to="/recommendations"
              className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
              onClick={() => setIsMenuOpen(false)}
            >
              Recommendations
            </Link>
            <hr className="my-2" />
            <Link
              to="/profile"
              className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
              onClick={() => setIsMenuOpen(false)}
            >
              Profile
            </Link>
            <button
              onClick={() => {
                logout();
                setIsMenuOpen(false);
              }}
              className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg text-left"
            >
              Logout
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}
