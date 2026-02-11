import { NavLink } from 'react-router-dom';
import { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  ClipboardList,
  GitCompare,
  Lightbulb,
  User,
  FileSearch,
  Mic,
  Map,
  Bot,
} from 'lucide-react';
import clsx from 'clsx';
import { gapAnalysisService } from '../../services/api/gapAnalysis.service';

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/assessment', label: 'Assessment', icon: ClipboardList },
  { path: '/gap-analysis', label: 'Gap Analysis', icon: GitCompare },
  { path: '/recommendations', label: 'Recommendations', icon: Lightbulb },
];

const aiNavItems = [
  { path: '/resume-analyzer', label: 'Resume Analyzer', icon: FileSearch },
  { path: '/mock-interview', label: 'Mock Interview', icon: Mic },
  { path: '/career-roadmap', label: 'Career Roadmap', icon: Map },
  { path: '/ai-chat', label: 'AI Chat', icon: Bot },
];

const bottomNavItems = [
  { path: '/profile', label: 'Profile', icon: User },
];

export default function Sidebar() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    gapAnalysisService.getLatestAnalysis().then((data) => {
      if (data) setProgress(data.overallReadiness);
    }).catch(() => {});
  }, []);
  return (
    <aside className="hidden lg:flex flex-col fixed left-0 top-16 bottom-0 w-64 bg-slate-900 border-r border-slate-800 p-4">
      <nav className="flex-1 space-y-1 overflow-y-auto">
        {navItems.map(({ path, label, icon: Icon }) => (
          <NavLink
            key={path}
            to={path}
            className={({ isActive }) =>
              clsx(
                'flex items-center space-x-3 px-4 py-3 rounded-lg font-medium transition-colors',
                {
                  'bg-primary-600/20 text-primary-400': isActive,
                  'text-gray-400 hover:bg-slate-800 hover:text-gray-200': !isActive,
                }
              )
            }
          >
            <Icon size={20} />
            <span>{label}</span>
          </NavLink>
        ))}

        {/* AI Features section */}
        <div className="pt-4 pb-2">
          <p className="px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">AI Tools</p>
        </div>
        {aiNavItems.map(({ path, label, icon: Icon }) => (
          <NavLink
            key={path}
            to={path}
            className={({ isActive }) =>
              clsx(
                'flex items-center space-x-3 px-4 py-3 rounded-lg font-medium transition-colors',
                {
                  'bg-indigo-600/20 text-indigo-400': isActive,
                  'text-gray-400 hover:bg-slate-800 hover:text-gray-200': !isActive,
                }
              )
            }
          >
            <Icon size={20} />
            <span>{label}</span>
          </NavLink>
        ))}

        <div className="pt-4"></div>
        {bottomNavItems.map(({ path, label, icon: Icon }) => (
          <NavLink
            key={path}
            to={path}
            className={({ isActive }) =>
              clsx(
                'flex items-center space-x-3 px-4 py-3 rounded-lg font-medium transition-colors',
                {
                  'bg-primary-600/20 text-primary-400': isActive,
                  'text-gray-400 hover:bg-slate-800 hover:text-gray-200': !isActive,
                }
              )
            }
          >
            <Icon size={20} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Progress indicator */}
      <div className="mt-auto pt-4 border-t border-slate-800">
        <div className="bg-gradient-to-br from-primary-900/50 to-secondary-900/50 rounded-xl border border-slate-700 p-4">
          <h4 className="font-semibold text-gray-200 mb-2">Skill Progress</h4>
          <div className="w-full bg-slate-700 rounded-full h-2 mb-2">
            <div
              className="bg-gradient-to-r from-primary-500 to-secondary-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <p className="text-xs text-gray-400">{progress}% towards your goal</p>
        </div>
      </div>
    </aside>
  );
}
