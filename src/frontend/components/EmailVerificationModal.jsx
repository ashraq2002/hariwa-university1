import { useState, useEffect, useRef } from 'react';
import { Mail, KeyRound, ShieldAlert, CheckCircle2, RefreshCw, Clock, ArrowLeft, Send } from 'lucide-react';
import { useLanguage } from '../controllers/LanguageContext.jsx';

export default function EmailVerificationModal({ email, onVerified, onCancel, apiService }) {
  const { t, lang } = useLanguage();
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  // 2-minute timer for OTP expiry (120 seconds)
  const [timeLeft, setTimeLeft] = useState(120);
  // 30-second cooldown for resend button
  const [resendCooldown, setResendCooldown] = useState(0);

  const inputRefs = [
    useRef(null),
    useRef(null),
    useRef(null),
    useRef(null),
    useRef(null),
    useRef(null),
  ];

  useEffect(() => {
    // Focus first slot on mount
    if (inputRefs[0].current) {
      inputRefs[0].current.focus();
    }
  }, []);

  // OTP Countdown timer effect
  useEffect(() => {
    if (timeLeft <= 0) return;
    const interval = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [timeLeft]);

  // Resend cooldown timer effect
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const interval = setInterval(() => {
      setResendCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [resendCooldown]);

  const handleDigitChange = (index, value) => {
    if (value.length > 1) {
      // Handle paste of full 6-digit code
      const pastedDigits = value.replace(/\D/g, '').slice(0, 6).split('');
      const newDigits = [...otpDigits];
      pastedDigits.forEach((digit, i) => {
        if (i < 6) newDigits[i] = digit;
      });
      setOtpDigits(newDigits);
      const nextIndex = Math.min(pastedDigits.length, 5);
      if (inputRefs[nextIndex].current) {
        inputRefs[nextIndex].current.focus();
      }
      return;
    }

    const digit = value.replace(/\D/g, '');
    const newDigits = [...otpDigits];
    newDigits[index] = digit;
    setOtpDigits(newDigits);
    setError(null);

    // Auto-advance to next input slot
    if (digit && index < 5 && inputRefs[index + 1].current) {
      inputRefs[index + 1].current.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      if (inputRefs[index - 1].current) {
        inputRefs[index - 1].current.focus();
      }
    }
  };

  const handleVerify = async (e) => {
    if (e) e.preventDefault();
    const fullCode = otpDigits.join('');

    if (fullCode.length !== 6) {
      setError(lang === 'fa' ? 'لطفاً کد ۶ رقمی کامل را وارد نمایید.' : 'Please enter all 6 digits of your verification code.');
      return;
    }

    if (timeLeft <= 0) {
      setError(lang === 'fa' ? 'کد تایید منقضی شده است. لطفاً کد جدید درخوست کنید.' : 'Verification code expired. Please click Resend Code to receive a new OTP.');
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const data = await apiService.auth.verifyOTP({
        email,
        otpCode: fullCode,
      });

      setSuccessMsg(data.message || (lang === 'fa' ? 'ایمیل شما با موفقیت تایید گردید!' : 'Email successfully verified!'));
      
      setTimeout(() => {
        if (onVerified) {
          onVerified(data.token, data.user);
        }
      }, 1000);
    } catch (err) {
      setError(err.message || 'Invalid or expired verification code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0 || resending) return;

    setError(null);
    setSuccessMsg(null);
    setResending(true);

    try {
      const data = await apiService.auth.resendOTP({ email });
      setTimeLeft(120); // Reset 2 minute timer
      setResendCooldown(30); // 30 second cooldown
      setOtpDigits(['', '', '', '', '', '']);
      setSuccessMsg(data.message || (lang === 'fa' ? 'کد جدید ۶ رقمی به ایمیل شما ارسال شد.' : 'A new 6-digit verification code has been dispatched to your email.'));

      setTimeout(() => setSuccessMsg(null), 3500);
    } catch (err) {
      setError(err.message || 'Failed to resend verification email.');
    } finally {
      setResending(false);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="max-w-sm mx-auto my-1 sm:my-3 p-2 shrink-0 w-full animate-fade-in">
      <div className="glass-panel shadow-2xl rounded-2xl p-4 sm:p-5 space-y-3 relative overflow-hidden text-slate-800 dark:text-slate-100">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-indigo-500 to-blue-600"></div>

        {onCancel && (
          <button
            onClick={onCancel}
            className="flex items-center gap-1 text-[11px] text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors font-medium cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>{lang === 'fa' ? 'بازگشت' : 'Back to Register'}</span>
          </button>
        )}

        <div className="text-center space-y-1">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-blue-600 text-white flex items-center justify-center mx-auto shadow-sm shadow-indigo-500/20">
            <Mail className="w-5 h-5" />
          </div>
          <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight">
            {t('emailVerification')}
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-[11px] leading-tight max-w-xs mx-auto">
            {t('enterOtpDesc')}
          </p>
          <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-[11px] font-mono font-bold mt-0.5">
            <Send className="w-3 h-3 text-indigo-500" />
            <span className="truncate max-w-[200px]">{email}</span>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/80 p-2 rounded-lg text-rose-700 dark:text-rose-300 flex items-start gap-1.5 text-[11px] font-semibold leading-normal">
            <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5 text-rose-600 dark:text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        {/* Success Alert */}
        {successMsg && (
          <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/80 p-2 rounded-lg text-emerald-700 dark:text-emerald-300 flex items-start gap-1.5 text-[11px] font-semibold leading-normal">
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600 dark:text-emerald-400" />
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleVerify} className="space-y-3">
          {/* 6-Digit Code Slots */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-[10.5px] font-bold text-slate-500 dark:text-slate-400">
              <span className="uppercase tracking-wider flex items-center gap-1">
                <KeyRound className="w-3 h-3 text-indigo-500" />
                {t('otpLabel')}
              </span>
              <span className={`font-mono flex items-center gap-1 ${timeLeft < 30 ? 'text-rose-500 font-extrabold animate-pulse' : 'text-slate-400'}`}>
                <Clock className="w-3 h-3" />
                {formatTime(timeLeft)}
              </span>
            </div>

            <div className="flex items-center justify-between gap-1 dir-ltr" dir="ltr">
              {otpDigits.map((digit, index) => (
                <input
                  key={index}
                  ref={inputRefs[index]}
                  type="text"
                  maxLength={6}
                  value={digit}
                  onChange={(e) => handleDigitChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  disabled={loading}
                  className="w-9 h-11 sm:w-10 sm:h-12 text-center text-lg font-bold font-mono bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-white focus:border-indigo-500 dark:focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all shadow-xs"
                />
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || otpDigits.join('').length !== 6}
            className="w-full py-2.5 px-3 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-bold rounded-lg text-xs shadow-sm shadow-indigo-500/20 transition-all flex items-center justify-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{t('verifyButton')}</span>
              </>
            )}
          </button>
        </form>

        {/* Resend OTP Footer */}
        <div className="border-t border-slate-100 dark:border-slate-800/80 pt-2 flex items-center justify-between gap-2 text-[10.5px]">
          <span className="text-slate-500 dark:text-slate-400 font-medium">
            {lang === 'fa' ? 'کدی دریافت نکردید؟' : "Didn't receive code?"}
          </span>
          <button
            type="button"
            onClick={handleResend}
            disabled={resendCooldown > 0 || resending}
            className="flex items-center gap-1 font-bold text-indigo-600 dark:text-indigo-400 hover:underline disabled:opacity-40 disabled:no-underline cursor-pointer disabled:cursor-not-allowed text-[10.5px]"
          >
            <RefreshCw className={`w-3 h-3 ${resending ? 'animate-spin' : ''}`} />
            <span>
              {resendCooldown > 0
                ? (lang === 'fa' ? `ارسال مجدد (${resendCooldown}s)` : `Resend in ${resendCooldown}s`)
                : t('resendOtp')}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
