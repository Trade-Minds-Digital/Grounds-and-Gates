import React, { useState } from 'react';
import { LanguageCode, UserRole } from '../types/property';
import { translations } from '../i18n/translations';
import { Logo } from '../components/common/Logo';
import {
  X,
  User,
  Building,
  KeyRound,
  ShieldCheck,
  CheckCircle,
  Sparkles,
  ArrowRight
} from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: LanguageCode;
  initialMode?: 'login' | 'register';
  onLoginSuccess: (role: UserRole, name: string) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  lang,
  initialMode = 'login',
  onLoginSuccess
}) => {
  const t = translations[lang];
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [role, setRole] = useState<UserRole>('buyer');
  const [fullName, setFullName] = useState('Mohanraj S.');
  const [email, setEmail] = useState('mohanrajs0410@gmail.com');
  const [phone, setPhone] = useState('+91 98422 71000');
  const [password, setPassword] = useState('demo123456');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLoginSuccess(role, fullName);
    onClose();
  };

  const fillAsBuyer = () => {
    setRole('buyer');
    setFullName('Mohanraj S. (Buyer)');
    setEmail('mohanrajs0410@gmail.com');
    setPhone('+91 98422 71000');
  };

  const fillAsSeller = () => {
    setRole('owner');
    setFullName('Senthil Nathan (Owner)');
    setEmail('senthil.nathan@example.com');
    setPhone('+91 98422 15300');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-stone-200 overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-[#013E18] text-white p-6 text-center relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <Logo variant="light" size="sm" showTagline={false} className="justify-center mb-2" />
          <h2 className="text-xl font-bold">
            {mode === 'login' ? t.auth.loginTitle : t.auth.registerTitle}
          </h2>
          <p className="text-xs text-stone-200 mt-1 max-w-xs mx-auto">
            {mode === 'login' ? t.auth.loginSub : t.auth.registerSub}
          </p>
        </div>

        {/* Quick Demo Pre-Fill Helpers */}
        <div className="p-3 bg-[#FAF8F2] border-b border-stone-200 flex items-center justify-center gap-2 text-xs">
          <span className="text-[11px] font-bold text-stone-500 uppercase">One-Click Demo:</span>
          <button
            type="button"
            onClick={fillAsBuyer}
            className="px-2.5 py-1 rounded-lg bg-white border border-stone-300 hover:border-[#013E18] font-bold text-[11px] text-[#013E18] transition-colors cursor-pointer"
          >
            {t.auth.quickFillBuyer}
          </button>
          <button
            type="button"
            onClick={fillAsSeller}
            className="px-2.5 py-1 rounded-lg bg-white border border-stone-300 hover:border-[#C99325] font-bold text-[11px] text-[#C99325] transition-colors cursor-pointer"
          >
            {t.auth.quickFillSeller}
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          {/* Role Selection when Registering */}
          {mode === 'register' && (
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1.5">
                Select Your Role
              </label>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setRole('buyer')}
                  className={`p-2.5 rounded-xl border font-bold text-left cursor-pointer transition-all ${
                    role === 'buyer'
                      ? 'bg-[#013E18] text-white border-[#013E18]'
                      : 'bg-white border-stone-200 text-stone-700 hover:bg-stone-50'
                  }`}
                >
                  <User className="w-4 h-4 mb-1" />
                  <div>Property Buyer</div>
                </button>
                <button
                  type="button"
                  onClick={() => setRole('owner')}
                  className={`p-2.5 rounded-xl border font-bold text-left cursor-pointer transition-all ${
                    role === 'owner'
                      ? 'bg-[#C99325] text-white border-[#C99325]'
                      : 'bg-white border-stone-200 text-stone-700 hover:bg-stone-50'
                  }`}
                >
                  <Building className="w-4 h-4 mb-1" />
                  <div>Property Owner</div>
                </button>
              </div>
            </div>
          )}

          {mode === 'register' && (
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">{t.auth.fullName}</label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-stone-300 focus:border-[#013E18] outline-hidden"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">{t.auth.email}</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-stone-300 focus:border-[#013E18] outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">{t.auth.password}</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-stone-300 focus:border-[#013E18] outline-hidden"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-[#013E18] text-[#F5F2E9] hover:bg-[#00280f] font-bold text-xs sm:text-sm shadow-md transition-all cursor-pointer mt-2"
          >
            {mode === 'login' ? t.auth.loginBtn : t.auth.registerBtn}
          </button>

          <div className="text-center pt-2">
            <button
              type="button"
              onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
              className="text-xs font-bold text-[#013E18] hover:text-[#C99325] transition-colors cursor-pointer"
            >
              {mode === 'login' ? t.auth.switchToRegister : t.auth.switchToLogin}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
