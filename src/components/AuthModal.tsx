import React, { useState } from 'react';
import { UserProfile } from '../types';
import { 
  X, 
  Lock, 
  Mail, 
  User as UserIcon, 
  Sparkles, 
  CheckCircle2, 
  Loader2, 
  ShieldCheck, 
  ArrowRight,
  Zap
} from 'lucide-react';
import { api } from '../services/api';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile | null;
  onLoginSuccess: (user: UserProfile) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onLoginSuccess,
}) => {
  const [tab, setTab] = useState<'login' | 'register'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [academicGoal, setAcademicGoal] = useState('Maintain 3.8+ GPA & Ace Finals');
  
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsLoading(true);

    try {
      if (tab === 'login') {
        const user = await api.login(email, password);
        onLoginSuccess(user);
        onClose();
      } else {
        const user = await api.register(email, name, password, academicGoal);
        onLoginSuccess(user);
        onClose();
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Authentication failed. Please check credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUseDemoAccount = async () => {
    setErrorMsg('');
    setIsLoading(true);
    try {
            const user = api.loginAsDemo();
      onLoginSuccess(user);
      onClose();
    } catch (e: any) {
      setErrorMsg(e.message || 'Demo sign in failed.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-6">
        
        {/* Top Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">
                {currentUser ? 'Student Profile & Security' : 'AI StudyMate Account'}
              </h3>
              <p className="text-xs text-slate-500">Cloud sync across all your devices</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switchers if not logged in */}
        {!currentUser && (
          <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-semibold">
            <button
              onClick={() => {
                setTab('login');
                setErrorMsg('');
              }}
              className={`flex-1 py-2 rounded-lg transition-all ${
                tab === 'login' ? 'bg-white text-indigo-700 font-bold shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Sign In (JWT)
            </button>
            <button
              onClick={() => {
                setTab('register');
                setErrorMsg('');
              }}
              className={`flex-1 py-2 rounded-lg transition-all ${
                tab === 'register' ? 'bg-white text-indigo-700 font-bold shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Create Account
            </button>
          </div>
        )}

        {errorMsg && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium">
            {errorMsg}
          </div>
        )}

        {currentUser ? (
          /* User Profile View */
          <div className="space-y-4 text-xs">
            <div className="p-4 rounded-2xl bg-indigo-50/60 border border-indigo-100 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-indigo-600 text-white font-bold text-lg flex items-center justify-center">
                  {currentUser.name.charAt(0)}
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">{currentUser.name}</h4>
                  <p className="text-slate-500">{currentUser.email}</p>
                </div>
              </div>

              <div className="pt-2 border-t border-indigo-100 space-y-1">
                <span className="text-[11px] text-indigo-900/80 font-bold block">Academic Goal:</span>
                <p className="text-slate-700 font-medium">{currentUser.academicGoal || 'None set'}</p>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>JWT Authentication Active • Offline-First Sync Enabled</span>
            </div>

            <button
              onClick={() => {
                api.logout();
                window.location.reload();
              }}
              className="w-full py-2.5 bg-slate-100 hover:bg-rose-50 text-slate-700 hover:text-rose-700 rounded-xl font-bold transition-colors"
            >
              Sign Out
            </button>
          </div>
        ) : (
          /* Sign In / Sign Up Form */
          <form onSubmit={handleSubmit} className="space-y-3 text-xs">
            {tab === 'register' && (
              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Full Name</label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Alex Morgan"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>
            )}

            <div className="space-y-1">
              <label className="font-semibold text-slate-700">Student Email</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  placeholder="student@university.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-700">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>
            </div>

            {tab === 'register' && (
              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Academic Target / Goal</label>
                <input
                  type="text"
                  placeholder="e.g. 4.0 GPA, Pass MCAT, Master Data Structures"
                  value={academicGoal}
                  onChange={(e) => setAcademicGoal(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-md shadow-indigo-500/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50 mt-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <span>{tab === 'login' ? 'Sign In to StudyMate' : 'Create Student Account'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            {/* Quick Demo Login Option */}
            <div className="pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={handleUseDemoAccount}
                disabled={isLoading}
                className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold flex items-center justify-center gap-1.5 transition-colors"
              >
                <Zap className="w-3.5 h-3.5 text-amber-500" />
                <span>Instant Demo Login (Pre-filled Data)</span>
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
};
