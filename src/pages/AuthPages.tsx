import React, { useState } from 'react';
import { UserRole, LanguageCode } from '../types/property';
import {
  Lock,
  Mail,
  User,
  Eye,
  EyeOff,
  CheckCircle2,
  Building2,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  KeyRound
} from 'lucide-react';

interface AuthPagesProps {
  initialMode?: 'login' | 'register' | 'forgot-password';
  lang: LanguageCode;
  onLoginSuccess: (role: UserRole, userDetails: { name: string; email: string }) => void;
  onNavigate: (view: string, params?: any) => void;
  onShowToast?: (message: string, type: 'success' | 'info' | 'error') => void;
}

export const AuthPages: React.FC<AuthPagesProps> = ({
  initialMode = 'login',
  lang,
  onLoginSuccess,
  onNavigate,
  onShowToast
}) => {
  const [mode, setMode] = useState<'login' | 'register' | 'forgot-password'>(initialMode);
  const [role, setRole] = useState<UserRole>('buyer');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [resetSent, setResetSent] = useState(false);

  const handleQuickLogin = (demoRole: UserRole, demoName: string, demoEmail: string) => {
    onLoginSuccess(demoRole, { name: demoName, email: demoEmail });
    if (onShowToast) {
      onShowToast(`Signed in as ${demoName} (${demoRole.toUpperCase()})`, 'success');
    }
    if (demoRole === 'buyer') {
      onNavigate('buyer-dashboard');
    } else {
      onNavigate('seller-dashboard');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === 'forgot-password') {
      if (!email) {
        alert('Please enter your registered email address.');
        return;
      }
      setResetSent(true);
      if (onShowToast) {
        onShowToast('Simulated password reset link sent to your email.', 'info');
      }
      return;
    }

    // Default submit login / register
    const finalName = name || (email ? email.split('@')[0] : 'User');
    onLoginSuccess(role, { name: finalName, email: email || 'user@groundsandgates.com' });
    if (onShowToast) {
      onShowToast(`Welcome back, ${finalName}!`, 'success');
    }
    if (role === 'buyer') {
      onNavigate('buyer-dashboard');
    } else {
      onNavigate('seller-dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F2E9] py-16 sm:py-24 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
      <div className="w-full max-w-md bg-white rounded-3xl p-8 sm:p-10 border border-stone-200/90 shadow-2xl">
        
        {/* Brand Lockup */}
        <div className="text-center pb-6 border-b border-stone-100">
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#C99325] block mb-1">
            Grounds and Gates Portal
          </span>
          <h1 className="text-2xl font-black text-[#18241B] tracking-tight">
            {mode === 'login' && 'Sign In to Your Account'}
            {mode === 'register' && 'Create Your Free Account'}
            {mode === 'forgot-password' && 'Reset Your Password'}
          </h1>
          <p className="text-xs text-stone-500 mt-1">
            {mode === 'login' && 'Manage your shortlisted properties, site visit schedules, or listings.'}
            {mode === 'register' && 'Join thousands of buyers and property owners across Tamil Nadu.'}
            {mode === 'forgot-password' && 'Enter your email to receive a demo verification link.'}
          </p>
        </div>

        {/* 1-Click Demo Profiles (For live executive presentations) */}
        {mode !== 'forgot-password' && (
          <div className="py-4 border-b border-stone-100 mb-6">
            <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block mb-2">
              Instant 1-Click Demo Profiles:
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleQuickLogin('buyer', 'Mohanraj S.', 'mohanrajs0410@gmail.com')}
                className="p-2.5 rounded-xl border border-stone-200 bg-stone-50 hover:bg-[#013E18] hover:text-white text-stone-700 text-left transition-all cursor-pointer group"
              >
                <div className="text-[11px] font-bold truncate group-hover:text-white">Mohanraj (Buyer)</div>
                <div className="text-[9px] text-stone-400 group-hover:text-stone-300">Saved + Visits Portal</div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('owner', 'Kavitha Land Developers', 'kavitha@gatedproperties.in')}
                className="p-2.5 rounded-xl border border-[#C99325]/50 bg-[#F5F2E9] hover:bg-[#013E18] hover:text-white text-stone-800 text-left transition-all cursor-pointer group"
              >
                <div className="text-[11px] font-bold truncate text-[#013E18] group-hover:text-white">Kavitha (Seller CRM)</div>
                <div className="text-[9px] text-[#C99325] group-hover:text-stone-300">Listing + Leads CRM</div>
              </button>
            </div>
          </div>
        )}

        {/* Form */}
        {resetSent ? (
          <div className="p-6 text-center bg-[#F5F2E9] rounded-2xl border border-stone-200 space-y-3">
            <CheckCircle2 className="w-10 h-10 text-[#013E18] mx-auto" />
            <h4 className="text-sm font-bold text-[#013E18]">Recovery Email Dispatched</h4>
            <p className="text-xs text-stone-600">
              A demo recovery link has been simulated for <strong>{email}</strong>.
            </p>
            <button
              onClick={() => {
                setResetSent(false);
                setMode('login');
              }}
              className="mt-2 text-xs font-bold text-[#013E18] underline cursor-pointer"
            >
              Return to Login
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Role Selector (if Registering) */}
            {mode === 'register' && (
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1.5">
                  I am using Grounds & Gates as:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setRole('buyer')}
                    className={`py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                      role === 'buyer'
                        ? 'bg-[#013E18] text-white border-[#013E18]'
                        : 'bg-stone-50 text-stone-600 border-stone-200'
                    }`}
                  >
                    Property Buyer
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole('owner')}
                    className={`py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                      role === 'owner'
                        ? 'bg-[#013E18] text-white border-[#013E18]'
                        : 'bg-stone-50 text-stone-600 border-stone-200'
                    }`}
                  >
                    Owner / Seller
                  </button>
                </div>
              </div>
            )}

            {mode === 'register' && (
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your name"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-200 bg-stone-50 text-xs font-semibold text-[#18241B] focus:border-[#013E18] focus:bg-white outline-hidden"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-200 bg-stone-50 text-xs font-semibold text-[#18241B] focus:border-[#013E18] focus:bg-white outline-hidden"
                />
              </div>
            </div>

            {mode !== 'forgot-password' && (
              <div>
                <div className="flex items-center justify-between text-xs font-bold text-stone-700 mb-1">
                  <label htmlFor="auth-password-input">Password</label>
                  {mode === 'login' && (
                    <button
                      type="button"
                      onClick={() => setMode('forgot-password')}
                      className="text-[11px] font-semibold text-[#C99325] hover:underline cursor-pointer"
                    >
                      Forgot?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    id="auth-password-input"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-stone-200 bg-stone-50 text-xs font-semibold text-[#18241B] focus:border-[#013E18] focus:bg-white outline-hidden"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-stone-400 hover:text-stone-700 cursor-pointer"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            )}

            {mode === 'login' && (
              <div className="flex items-center justify-between text-xs text-stone-600 pt-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded accent-[#013E18]"
                  />
                  <span>Keep me signed in</span>
                </label>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3 px-4 rounded-xl bg-[#013E18] text-[#F5F2E9] hover:bg-[#00280f] font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all cursor-pointer mt-2"
            >
              <span>
                {mode === 'login' && 'Sign In'}
                {mode === 'register' && 'Complete Registration'}
                {mode === 'forgot-password' && 'Send Reset Instructions'}
              </span>
              <ArrowRight className="w-4 h-4 text-[#C99325]" />
            </button>
          </form>
        )}

        {/* Footer switch links */}
        <div className="mt-6 pt-4 border-t border-stone-100 text-center text-xs text-stone-500">
          {mode === 'login' && (
            <p>
              Don't have an account yet?{' '}
              <button
                onClick={() => setMode('register')}
                className="font-bold text-[#013E18] hover:text-[#C99325] hover:underline cursor-pointer"
              >
                Register Free
              </button>
            </p>
          )}

          {mode === 'register' && (
            <p>
              Already registered?{' '}
              <button
                onClick={() => setMode('login')}
                className="font-bold text-[#013E18] hover:text-[#C99325] hover:underline cursor-pointer"
              >
                Sign In
              </button>
            </p>
          )}

          {mode === 'forgot-password' && (
            <p>
              Remembered your password?{' '}
              <button
                onClick={() => setMode('login')}
                className="font-bold text-[#013E18] hover:text-[#C99325] hover:underline cursor-pointer"
              >
                Back to Sign In
              </button>
            </p>
          )}
        </div>

      </div>
    </div>
  );
};
