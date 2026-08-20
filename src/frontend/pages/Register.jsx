import { useState } from 'react';
import { Mail, ShieldAlert, KeyRound, User as UserIcon, Eye, EyeOff } from 'lucide-react';
import { useLanguage } from '../controllers/LanguageContext.jsx';
import universityLogo from '../../assets/images/hariwa_logo_1783225791176.jpg';
import EmailVerificationModal from '../components/EmailVerificationModal.jsx';
import AuthTopNav from '../components/AuthTopNav.jsx';

export default function Register({ onRegisterSuccess, onNavigate, apiService }) {
  const { t, lang } = useLanguage();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  // Email verification state
  const [showVerification, setShowVerification] = useState(false);

  const validateEmailFormat = (emailStr) => {
    const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return regex.test(emailStr.trim());
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!name || !email || !password || !confirmPassword) {
      setError(lang === 'fa' ? 'لطفاً تمام خانه‌های فورم را خانه پوری کنید.' : 'Please fully complete all user registry fields.');
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

    if (password !== confirmPassword) {
      setError(lang === 'fa' ? 'رمزهای عبور وارد شده همخوانی ندارند.' : 'Verification passwords do not match. Please retype carefully.');
      return;
    }

    if (password.length < 5) {
      setError(lang === 'fa' ? 'رمز عبور باید حداقل ۵ کرکتر باشد.' : 'Required security limit: Passwords must be at least 5 characters long.');
      return;
    }

    setLoading(true);

    try {
      const data = await apiService.auth.register({
        name,
        email,
        password,
        role: 'student', // self-registration defaults strictly to student
      });

      if (data.requireVerification) {
        setShowVerification(true);
      } else if (data.token && data.user) {
        onRegisterSuccess(data.token, data.user);
      }
    } catch (err) {
      setError(err.message || 'Registration failed unexpectedly. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (showVerification) {
    return (
      <EmailVerificationModal
        email={email}
        apiService={apiService}
        onVerified={(token, user) => onRegisterSuccess(token, user)}
        onCancel={() => setShowVerification(false)}
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
            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight leading-tight">{t('registerTitle')}</h2>
            <p className="text-slate-500 dark:text-slate-400 text-[11px] leading-snug">
              {t('registerDesc')}
            </p>
          </div>

          {error && (
            <div className="bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/80 p-2 rounded-xl text-rose-700 dark:text-rose-300 flex items-start gap-2 text-xs font-semibold leading-relaxed">
              <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5 text-rose-600 dark:text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-2 sm:space-y-2.5">
            <div className="space-y-1">
              <label className="text-[10px] font-bold tracking-wider text-slate-500 dark:text-slate-400 uppercase block">
                {t('fullName')}
              </label>
              <div className="relative">
                <UserIcon className={`absolute ${lang === 'fa' || lang === 'ps' ? 'right-3' : 'left-3'} top-2.5 text-slate-400 dark:text-slate-500 w-4 h-4`} />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Salim Noori"
                  className={`w-full ${lang === 'fa' || lang === 'ps' ? 'pr-9 pl-3' : 'pl-9 pr-3'} py-2 bg-slate-50/50 dark:bg-[#131b2e]/80 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white text-xs focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium placeholder-slate-400 dark:placeholder-slate-500`}
                />
              </div>
            </div>

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
                  placeholder="e.g. salim@university.edu"
                  className={`w-full ${lang === 'fa' || lang === 'ps' ? 'pr-9 pl-3' : 'pl-9 pr-3'} py-2 bg-slate-50/50 dark:bg-[#131b2e]/80 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white text-xs focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium placeholder-slate-400 dark:placeholder-slate-500`}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
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
                    placeholder="Min 5 chars"
                    className={`w-full ${lang === 'fa' || lang === 'ps' ? 'pr-9 pl-8' : 'pl-9 pr-8'} py-2 bg-slate-50/50 dark:bg-[#131b2e]/80 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white text-xs focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium placeholder-slate-400 dark:placeholder-slate-500`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className={`absolute ${lang === 'fa' || lang === 'ps' ? 'left-2' : 'right-2'} top-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer p-0.5 rounded`}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold tracking-wider text-slate-500 dark:text-slate-400 uppercase block">
                  {lang === 'fa' ? 'تکرار رمـز' : lang === 'ps' ? 'د پټنوم تکرار' : 'CONFIRM'}
                </label>
                <div className="relative">
                  <KeyRound className={`absolute ${lang === 'fa' || lang === 'ps' ? 'right-3' : 'left-3'} top-2.5 text-slate-400 dark:text-slate-500 w-4 h-4`} />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Retype password"
                    className={`w-full ${lang === 'fa' || lang === 'ps' ? 'pr-9 pl-8' : 'pl-9 pr-8'} py-2 bg-slate-50/50 dark:bg-[#131b2e]/80 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white text-xs focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium placeholder-slate-400 dark:placeholder-slate-500`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className={`absolute ${lang === 'fa' || lang === 'ps' ? 'left-2' : 'right-2'} top-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer p-0.5 rounded`}
                    aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                  >
                    {showConfirmPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-slate-300 dark:disabled:bg-slate-800 text-white font-bold py-2.5 px-4 rounded-xl text-xs transition-all shadow-md shadow-blue-600/15 active:scale-95 cursor-pointer block leading-none uppercase tracking-wide"
            >
              {loading ? (lang === 'fa' ? 'در حال راجستر...' : lang === 'ps' ? 'د راجستر په حال کې...' : 'Creating Profile...') : t('register')}
            </button>
          </form>

          <div className="text-center pt-1 border-t border-slate-100 dark:border-zinc-800/80">
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              {t('haveAccount')}{' '}
              <button
                onClick={() => onNavigate('/login')}
                className="text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors underline cursor-pointer inline bg-transparent p-0"
              >
                {t('logIn')}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
