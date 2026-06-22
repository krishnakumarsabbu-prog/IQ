import React from 'react';
import { NavLink } from 'react-router-dom';
import { usePermissions } from '../hooks/useRedux';
import { 
  Home, 
  Settings,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  FormInput
} from 'lucide-react';

interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isCollapsed, onToggle }) => {
  const { hasPermission } = usePermissions();

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: Home, permission: 'read' },
    { path: '/messages/new', label: 'Create Message (Dynamic)', icon: FormInput, permission: 'read' },
    { path: '/settings', label: 'Settings', icon: Settings, permission: 'read' },
  ];

  const filteredNavItems = navItems.filter(item => hasPermission(item.permission));

  return (
    <div className={`bg-white dark:bg-slate-950 border-r border-slate-200/80 dark:border-slate-900 transition-all duration-300 ${
      isCollapsed ? 'w-20' : 'w-72'
    } flex flex-col h-full shadow-[1px_0_10px_rgba(0,0,0,0.02)] z-10`}>
      {/* Brand logo container */}
      <div className="p-5 border-b border-slate-100 dark:border-slate-900">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-wf-red to-red-700 rounded-xl flex items-center justify-center shadow-lg shadow-red-500/10 transition-transform hover:scale-105 duration-200">
                <AlertTriangle className="h-5.5 w-5.5 text-white" strokeWidth={2.2} />
              </div>
              <div>
                <h1 className="text-md font-bold text-slate-800 dark:text-white tracking-tight">
                  Alerts Studio
                </h1>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold uppercase tracking-wider">
                  Wells Fargo
                </p>
              </div>
            </div>
          )}
          {isCollapsed && (
            <div className="w-10 h-10 bg-gradient-to-br from-wf-red to-red-700 rounded-xl flex items-center justify-center shadow-md mx-auto">
              <AlertTriangle className="h-5 w-5 text-white" strokeWidth={2.2} />
            </div>
          )}
          {!isCollapsed && (
            <button
              onClick={onToggle}
              className="p-1.5 rounded-lg border border-slate-200/60 dark:border-slate-800 bg-slate-55 dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-all duration-200"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Nav items list */}
      <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-800">
        {isCollapsed && (
          <div className="flex justify-center mb-4">
            <button
              onClick={onToggle}
              className="p-2 rounded-lg border border-slate-200/60 dark:border-slate-800 bg-slate-55 dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-all duration-200"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        )}

        {filteredNavItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                isActive
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-950 shadow-md shadow-slate-900/10 dark:shadow-white/5 font-semibold scale-[1.02]'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900/50 hover:text-slate-900 dark:hover:text-slate-200'
              }`
            }
          >
            <item.icon className="h-5 w-5 flex-shrink-0" strokeWidth={1.8} />
            {!isCollapsed && <span className="ml-3.5 truncate">{item.label}</span>}
          </NavLink>
        ))}
      </nav>
    </div>
  );
};

export default Sidebar;