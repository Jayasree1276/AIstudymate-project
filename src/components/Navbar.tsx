import React, { useState } from 'react';
import { 
  GraduationCap, 
  LayoutDashboard, 
  BookOpen, 
  CheckSquare, 
  FileText, 
  Sparkles, 
  HelpCircle, 
  Calendar, 
  BarChart3, 
  Timer, 
  Wifi, 
  WifiOff, 
  RefreshCw, 
  Bot, 
  User as UserIcon,
  LogOut,
  ChevronDown,
  Moon,
  Sun
} from 'lucide-react';
import { ActiveTab, SyncStatus, User } from '../types';

interface NavbarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  syncStatus: SyncStatus;
  onManualSync: () => void;
  onOpenTimer: () => void;
  onOpenTutor: () => void;
  onOpenAuth: () => void;
  user: User | null;
  onLogout: () => void;
  isTimerRunning: boolean;
  timerSecondsRemaining: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  syncStatus,
  onManualSync,
  onOpenTimer,
  onOpenTutor,
  onOpenAuth,
  user,
  onLogout,
  isTimerRunning,
  timerSecondsRemaining,
}) => {
  const [showUserMenu, setShowUserMenu] = useState(false);

  const formatTimer = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const navItems: Array<{ id: ActiveTab; label: string; icon: React.ElementType; badge?: string }> = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'subjects', label: 'Subjects', icon: BookOpen },
    { id: 'tasks', label: 'Tasks', icon: CheckSquare },
    { id: 'notes', label: 'Notes', icon: FileText },
    { id: 'planner', label: 'AI Planner', icon: Sparkles, badge: 'AI' },
    { id: 'quizzes', label: 'Quizzes', icon: HelpCircle, badge: 'AI' },
    { id: 'scheduler', label: 'Schedule', icon: Calendar },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  ];

  return (
    <header className="sticky top-0 z-40 w-full bg-white border-b border-slate-200 shadow-xs transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-3">
          
          {/* Logo & Brand matching Professional Polish */}
          <div className="flex items-center gap-3 shrink-0 cursor-pointer" onClick={() => setActiveTab('dashboard')}>
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold shadow-xs">
              <GraduationCap className="w-4 h-4" />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold tracking-tight text-slate-900">StudyMate</span>
              <span className="px-1.5 py-0.5 text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-100 rounded-md">PRO</span>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  id={`nav-tab-${item.id}`}
                  onClick={() => setActiveTab(item.id)}
                  className={`relative flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg transition-all ${
                    isActive
                      ? 'bg-indigo-50 text-indigo-700 font-bold'
                      : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-600' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className="px-1 py-0.2 text-[9px] font-extrabold uppercase bg-violet-100 text-violet-700 rounded tracking-wider">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Action Toolbar */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* Real-time Sync Status Pill */}
            <div 
              onClick={onManualSync} 
              title="Click to manually synchronize with cloud database"
              className="hidden sm:flex items-center gap-2 px-3 py-1 bg-slate-100 rounded-full text-xs font-medium text-slate-600 hover:bg-slate-200/70 cursor-pointer transition-colors"
            >
              {syncStatus === 'online-synced' && (
                <>
                  <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                  <span className="text-[11px] font-medium text-slate-700">Live Sync Active</span>
                </>
              )}
              {syncStatus === 'syncing' && (
                <>
                  <RefreshCw className="w-3 h-3 animate-spin text-amber-600" />
                  <span className="text-[11px] font-medium text-amber-800">Syncing...</span>
                </>
              )}
              {syncStatus === 'offline' && (
                <>
                  <WifiOff className="w-3 h-3 text-slate-500" />
                  <span className="text-[11px] font-medium text-slate-600">Offline Mode</span>
                </>
              )}
              {syncStatus === 'error' && (
                <>
                  <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                  <span className="text-[11px] font-medium text-rose-700">Sync Retry</span>
                </>
              )}
            </div>

            {/* Quick Launch Focus Timer */}
            <button
              id="btn-open-focus-timer"
              onClick={onOpenTimer}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                isTimerRunning 
                  ? 'bg-amber-500 text-white border-amber-600 shadow-xs animate-pulse' 
                  : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
              }`}
            >
              <Timer className={`w-4 h-4 ${isTimerRunning ? 'text-white' : 'text-slate-500'}`} />
              <span className="hidden md:inline">{isTimerRunning ? 'Focusing' : 'Focus Timer'}</span>
              {isTimerRunning && (
                <span className="font-mono font-bold bg-amber-600/40 px-1.5 py-0.5 rounded text-[11px]">
                  {formatTimer(timerSecondsRemaining)}
                </span>
              )}
            </button>

            {/* AI Tutor Shortcut */}
            <button
              id="btn-open-ai-tutor"
              onClick={onOpenTutor}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs transition-all cursor-pointer"
            >
              <Bot className="w-4 h-4" />
              <span className="hidden sm:inline">AI Tutor</span>
            </button>

            {/* User Profile / Auth */}
            <div className="relative">
              {user ? (
                <div>
                  <button
                    id="btn-user-menu"
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center gap-2 p-1 rounded-lg hover:bg-slate-100 border border-slate-200 transition-colors"
                  >
                    <img
                      src={user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'}
                      alt={user.name}
                      className="w-7 h-7 rounded-md object-cover"
                    />
                    <span className="text-xs font-semibold text-slate-800 hidden md:block max-w-[100px] truncate">
                      {user.name}
                    </span>
                    <ChevronDown className="w-3 h-3 text-slate-500" />
                  </button>

                  {showUserMenu && (
                    <div 
                      className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-slate-200 py-2 z-50 text-xs"
                      onMouseLeave={() => setShowUserMenu(false)}
                    >
                      <div className="px-4 py-2 border-b border-slate-100">
                        <p className="font-semibold text-slate-900">{user.name}</p>
                        <p className="text-slate-500 truncate text-[11px]">{user.email}</p>
                      </div>
                      <button
                        onClick={() => {
                          setShowUserMenu(false);
                          setActiveTab('analytics');
                        }}
                        className="w-full text-left px-4 py-2 text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                      >
                        <BarChart3 className="w-3.5 h-3.5 text-slate-500" />
                        My Learning Analytics
                      </button>
                      <button
                        onClick={() => {
                          setShowUserMenu(false);
                          onManualSync();
                        }}
                        className="w-full text-left px-4 py-2 text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                      >
                        <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
                        Force Cloud Sync Now
                      </button>
                      <div className="border-t border-slate-100 my-1"></div>
                      <button
                        onClick={() => {
                          setShowUserMenu(false);
                          onLogout();
                        }}
                        className="w-full text-left px-4 py-2 text-rose-600 hover:bg-rose-50 flex items-center gap-2"
                      >
                        <LogOut className="w-3.5 h-3.5 text-rose-500" />
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  onClick={onOpenAuth}
                  className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-900 text-white hover:bg-slate-800 transition-colors"
                >
                  Sign In
                </button>
              )}
            </div>

          </div>
        </div>

        {/* Mobile Sub-Navigation Bar */}
        <div className="lg:hidden flex items-center gap-1.5 overflow-x-auto py-2.5 border-t border-slate-100 scrollbar-none">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg shrink-0 transition-colors ${
                  isActive
                    ? 'bg-indigo-50 text-indigo-700 font-bold'
                    : 'text-slate-500 hover:bg-slate-100'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

      </div>
    </header>
  );
};
