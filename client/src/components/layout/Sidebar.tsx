import { NavLink } from 'react-router-dom';
import { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  ClipboardList,
  GitCompare,
  Lightbulb,
  User,
} from 'lucide-react';
import clsx from 'clsx';
import { gapAnalysisService } from '../../services/api/gapAnalysis.service';

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/assessment', label: 'Assessment', icon: ClipboardList },
  { path: '/gap-analysis', label: 'Gap Analysis', icon: GitCompare },
  { path: '/recommendations', label: 'Recommendations', icon: Lightbulb },
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
    <aside className="hidden lg:flex flex-col fixed left-0 top-16 bottom-0 w-64 bg-white border-r border-gray-200 p-4">
      <nav className="flex-1 space-y-1">
        {navItems.map(({ path, label, icon: Icon }) => (
          <NavLink
            key={path}
            to={path}
            className={({ isActive }) =>
              clsx(
                'flex items-center space-x-3 px-4 py-3 rounded-lg font-medium transition-colors',
                {
                  'bg-primary-50 text-primary-700': isActive,
                  'text-gray-600 hover:bg-gray-50 hover:text-gray-900': !isActive,
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
      <div className="mt-auto pt-4 border-t border-gray-200">
        <div className="card bg-gradient-to-br from-primary-50 to-secondary-50 p-4">
          <h4 className="font-semibold text-gray-900 mb-2">Skill Progress</h4>
          <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
            <div
              className="bg-gradient-to-r from-primary-500 to-secondary-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <p className="text-xs text-gray-600">{progress}% towards your goal</p>
        </div>
      </div>
    </aside>
  );
}
