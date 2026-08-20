import { useState } from 'react';
import { KeyRound, Mail, ShieldAlert, User as UserIcon, MailCheck, Eye, EyeOff } from 'lucide-react';
import { useLanguage } from '../controllers/LanguageContext.jsx';
import universityLogo from '../../assets/images/hariwa_logo_1783225791176.jpg';
import EmailVerificationModal from '../components/EmailVerificationModal.jsx';
import AuthTopNav from '../components/AuthTopNav.jsx';

export default function Login({ onLoginSuccess, onNavigate, apiService }) {
  const { t, lang } = useLanguage();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  // Unverified email handling state
  const [unverifiedAccount, setUnverifiedAccount] = useState(null);

  const validateEmailFormat = (emailStr) => {
    const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return regex.test(emailStr.trim());
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError(lang === 'fa' ? 'لطفاً ایمیل و رمز عبور را وارد کنید.' : 'Please provide both email and password.');
      return;
    }

    if (!validateEmailFormat(email)) {
      setError(
        lang === 'fa'
          ? 'فرمت ایمیل نامعتبر است. لطفاً یک ایمیل معتبر وارد کنید (مثال: user@domain.com).'
          : 'Invalid email address format. Please enter a valid email address (e.g. user@domain.com).'
      );
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const data = await apiService.auth.login({ email, password });
      onLoginSuccess(data.token, data.user);
    } catch (err) {
      if (err.requireVerification) {
        setUnverifiedAccount({
          email: err.email || email,
        });
      } else {
        setError(err.message || 'Authentication error. Please double-check credentials.');
      }
    } finally {
      setLoading(false);
    }
  };

  const fillDemoCredentials = (emailStr, passStr) => {
    setEmail(emailStr);
    setPassword(passStr);
    setError(null);
    setUnverifiedAccount(null);
  };

  if (unverifiedAccount) {
    return (
      <EmailVerificationModal
        email={unverifiedAccount.email}
        apiService={apiService}
        onVerified={(token, user) => onLoginSuccess(token, user)}
        onCancel={() => setUnverifiedAccount(null)}
      />
    );
  }

  return (
    <div className="w-full h-full min-h-0 flex flex-col justify-start items-center px-3 sm:px-4 pt-2 sm:pt-3 pb-3 select-none overflow-hidden">
      <div className="max-w-md w-full mx-auto flex flex-col gap-1.5 shrink-0 animate-fade-in">
        <AuthTopNav onNavigate={onNavigate} />

        <div className="glass-panel shadow-xl rounded-2xl p-4 sm:p-5 space-y-2.5 sm:space-y-3 relative overflow-hidden text-slate-800 dark:text-slate-100">
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-500 to-indigo-600"></div>
          
          <div className="text-center space-y-1">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full overflow-hidden border border-slate-200 dark:border-slate-800 flex items-center justify-center mx-auto shadow-xs bg-white">
              <img 
                src={universityLogo} 
                alt="Hariwa University Logo" 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight leading-tight">{t('welcomeBack')}</h2>
            <p className="text-slate-500 dark:text-slate-400 text-[11px] leading-snug">
              {t('loginDesc')}
            </p>
          </div>

          {error && (
            <div className="bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 p-2 rounded-xl text-rose-700 dark:text-rose-300 flex items-start gap-2 text-xs font-semibold leading-relaxed">
              <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5 text-rose-600 dark:text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-2 sm:space-y-2.5">
            <div className="space-y-1">
              <label className="text-[10px] font-bold tracking-wider text-slate-500 dark:text-slate-400 uppercase block">
                {t('email')}
              </label>
              <div className="relative">
                <Mail className={`absolute ${lang === 'fa' || lang === 'ps' ? 'right-3' : 'left-3'} top-2.5 text-slate-400 dark:text-slate-500 w-4 h-4`} />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setError(null);
                  }}
                  placeholder="e.g. student@university.edu"
                  className={`w-full ${lang === 'fa' || lang === 'ps' ? 'pr-9 pl-3' : 'pl-9 pr-3'} py-2 bg-slate-50/50 dark:bg-[#131b2e]/80 border border-slate-200 dark:border-slate-800/80 rounded-xl text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium placeholder-slate-400 dark:placeholder-slate-500`}
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold tracking-wider text-slate-500 dark:text-slate-400 uppercase block">
                {t('password')}
              </label>
              <div className="relative">
                <KeyRound className={`absolute ${lang === 'fa' || lang === 'ps' ? 'right-3' : 'left-3'} top-2.5 text-slate-400 dark:text-slate-500 w-4 h-4`} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className={`w-full ${lang === 'fa' || lang === 'ps' ? 'pr-9 pl-9' : 'pl-9 pr-9'} py-2 bg-slate-50/50 dark:bg-[#131b2e]/80 border border-slate-200 dark:border-slate-800/80 rounded-xl text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium placeholder-slate-400 dark:placeholder-slate-500`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className={`absolute ${lang === 'fa' || lang === 'ps' ? 'left-2.5' : 'right-2.5'} top-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer p-0.5 rounded`}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-slate-300 dark:disabled:bg-slate-800 text-white font-bold py-2.5 px-4 rounded-xl text-xs transition-all shadow-md shadow-blue-600/15 active:scale-95 cursor-pointer block leading-none uppercase tracking-wide"
            >
              {loading ? (lang === 'fa' ? 'در حال بررسی...' : lang === 'ps' ? 'د چک کولو په حال کې...' : 'Authenticating...') : t('logIn')}
            </button>
          </form>

          <div className="text-center">
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              {lang === 'fa' ? 'حساب کاربری جدید ایجاد می‌کنید؟ ' : lang === 'ps' ? 'نوی حساب جوړول غواړئ؟ ' : 'New to the portal? '}
              <button
                 onClick={() => onNavigate('/register')}
                 className="text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors underline cursor-pointer inline bg-transparent p-0"
              >
                {t('register')}
              </button>
            </p>
          </div>

          {/* Demo Quick login controls */}
          <div className="pt-2 border-t border-slate-200 dark:border-zinc-800/80 space-y-1">
            <p className="text-[9px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider text-center select-none font-sans">
              DEMO QUICK FILL ACTIONS
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => fillDemoCredentials('student@university.edu', 'student123')}
                className="px-2 py-1.5 bg-slate-50 hover:bg-slate-100 dark:bg-[#131b2e] dark:hover:bg-[#18233c] border border-slate-200 dark:border-slate-800/80 rounded-xl flex items-center justify-center gap-1.5 cursor-pointer transition-all active:scale-95 text-center group"
              >
                <UserIcon className="w-3 h-3 text-slate-400 group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors shrink-0" />
                <div className="text-start min-w-0">
                  <span className="text-[10px] font-bold text-slate-700 dark:text-slate-200 leading-none block truncate">
                    {lang === 'fa' ? 'متقاضی' : lang === 'ps' ? 'محصل' : 'Student'}
                  </span>
                  <span className="text-[8px] text-slate-400 dark:text-slate-500 leading-none block truncate">
                    student@...
                  </span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => fillDemoCredentials('admin@university.edu', 'admin123')}
                className="px-2 py-1.5 bg-slate-50 hover:bg-slate-100 dark:bg-[#131b2e] dark:hover:bg-[#18233c] border border-slate-200 dark:border-slate-800/80 rounded-xl flex items-center justify-center gap-1.5 cursor-pointer transition-all active:scale-95 text-center group"
              >
                <KeyRound className="w-3 h-3 text-slate-400 group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors shrink-0" />
                <div className="text-start min-w-0">
                  <span className="text-[10px] font-bold text-slate-700 dark:text-slate-200 leading-none block truncate">
                    {lang === 'fa' ? 'اداره' : lang === 'ps' ? 'اداره' : 'Admin'}
                  </span>
                  <span className="text-[8px] text-slate-400 dark:text-slate-500 leading-none block truncate">
                    admin@...
                  </span>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
