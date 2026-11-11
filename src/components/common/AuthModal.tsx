import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Loader2, Mail, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { authApi } from '../../api/auth';

const GOOGLE_CLIENT_ID =
  import.meta.env.VITE_GOOGLE_CLIENT_ID ||
  '189151077426-h2vef3qi6j0apoqa6g59bvl8s78rmse8.apps.googleusercontent.com';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const OTP_LENGTH = 6;

const apiError = (err: any, fallback: string) => err?.response?.data?.message || fallback;

/** Waits briefly for the async Google Identity Services script to load. */
const waitForGoogle = (timeoutMs = 4000): Promise<any> =>
  new Promise((resolve, reject) => {
    const started = Date.now();
    const check = () => {
      const g = (window as any).google;
      if (g?.accounts?.oauth2) return resolve(g);
      if (Date.now() - started > timeoutMs) return reject(new Error('Google sign-in is still loading. Please try again.'));
      setTimeout(check, 150);
    };
    check();
  });

const GoogleIcon = () => (
  <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
  </svg>
);

/** Six single-digit boxes with auto-advance, backspace and paste support. */
const OtpInput: React.FC<{ value: string; onChange: (v: string) => void; disabled?: boolean }> = ({
  value,
  onChange,
  disabled,
}) => {
  const refs = useRef<Array<HTMLInputElement | null>>([]);
  const digits = Array.from({ length: OTP_LENGTH }, (_, i) => value[i] || '');

  useEffect(() => {
    refs.current[Math.min(value.length, OTP_LENGTH - 1)]?.focus();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const setAt = (index: number, char: string) => {
    const next = digits.slice();
    next[index] = char;
    onChange(next.join('').slice(0, OTP_LENGTH));
  };

  return (
    <div className="flex justify-between gap-2" onPaste={(e) => {
      const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, OTP_LENGTH);
      if (pasted) {
        e.preventDefault();
        onChange(pasted);
        refs.current[Math.min(pasted.length, OTP_LENGTH - 1)]?.focus();
      }
    }}>
      {digits.map((d, i) => (
        <input
          key={i}
          ref={(el) => (refs.current[i] = el)}
          type="text"
          inputMode="numeric"
          autoComplete={i === 0 ? 'one-time-code' : 'off'}
          aria-label={`Digit ${i + 1}`}
          maxLength={1}
          disabled={disabled}
          value={d}
          onChange={(e) => {
            const char = e.target.value.replace(/\D/g, '').slice(-1);
            setAt(i, char);
            if (char && i < OTP_LENGTH - 1) refs.current[i + 1]?.focus();
          }}
          onKeyDown={(e) => {
            if (e.key === 'Backspace' && !digits[i] && i > 0) {
              setAt(i - 1, '');
              refs.current[i - 1]?.focus();
            } else if (e.key === 'ArrowLeft' && i > 0) refs.current[i - 1]?.focus();
            else if (e.key === 'ArrowRight' && i < OTP_LENGTH - 1) refs.current[i + 1]?.focus();
          }}
          className="h-14 w-full min-w-0 rounded-2xl border border-slate-200 bg-slate-50 text-center font-mono text-xl font-bold text-ink outline-none transition focus:border-amber-400 focus:bg-white focus:ring-4 focus:ring-amber-300/30 dark:border-neutral-800 dark:bg-neutral-900 dark:text-white dark:focus:bg-neutral-900"
        />
      ))}
    </div>
  );
};

export const AuthModal: React.FC = () => {
  const { isAuthModalOpen, closeAuthModal, loginWithAuthData } = useAuth();

  const [step, setStep] = useState<'start' | 'code'>('start');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [devOtp, setDevOtp] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);
  const [isSending, setIsSending] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [infoMsg, setInfoMsg] = useState<string | null>(null);

  // Reset when the modal opens
  useEffect(() => {
    if (!isAuthModalOpen) return;
    setStep('start');
    setOtp('');
    setDevOtp(null);
    setErrorMsg(null);
    setInfoMsg(null);
  }, [isAuthModalOpen]);

  // Lock background scroll + Escape to close
  useEffect(() => {
    if (!isAuthModalOpen) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && closeAuthModal();
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', onKey);
    };
  }, [isAuthModalOpen, closeAuthModal]);

  // Resend countdown
  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  if (!isAuthModalOpen) return null;

  const handleGoogle = async () => {
    setErrorMsg(null);
    setIsGoogleLoading(true);
    try {
      const google = await waitForGoogle();
      const client = google.accounts.oauth2.initTokenClient({
        client_id: GOOGLE_CLIENT_ID,
        scope: 'openid email profile',
        prompt: 'select_account',
        callback: async (tokenResponse: any) => {
          if (!tokenResponse?.access_token) {
            setIsGoogleLoading(false);
            setErrorMsg(tokenResponse?.error === 'access_denied' ? 'Google sign-in was cancelled.' : 'Google sign-in failed. Please try again.');
            return;
          }
          try {
            const auth = await authApi.googleAuth({ accessToken: tokenResponse.access_token });
            if (!auth.accessToken) throw new Error('empty session');
            loginWithAuthData(auth.accessToken, auth.refreshToken, auth.user);
          } catch (err) {
            setErrorMsg(apiError(err, 'We could not sign you in with Google. Please try again.'));
          } finally {
            setIsGoogleLoading(false);
          }
        },
        error_callback: (err: any) => {
          setIsGoogleLoading(false);
          if (err?.type !== 'popup_closed') {
            setErrorMsg(err?.type === 'popup_failed_to_open' ? 'Please allow pop-ups to sign in with Google.' : 'Google sign-in failed. Please try again.');
          }
        },
      });
      client.requestAccessToken();
    } catch (err: any) {
      setIsGoogleLoading(false);
      setErrorMsg(err?.message || 'Google sign-in is unavailable right now.');
    }
  };

  const sendCode = async (e?: React.FormEvent) => {
    e?.preventDefault();
    const clean = email.trim().toLowerCase();
    if (!EMAIL_PATTERN.test(clean)) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }
    setErrorMsg(null);
    setIsSending(true);
    try {
      const res = await authApi.requestEmailOtp(clean);
      setEmail(clean);
      setStep('code');
      setOtp(res.devOtp || '');
      setDevOtp(res.devOtp || null);
      setCooldown(res.resendCooldownSeconds || 60);
      setInfoMsg(`We've sent a 6-digit code to ${clean}`);
    } catch (err) {
      setErrorMsg(apiError(err, 'We could not send the code. Please try again.'));
    } finally {
      setIsSending(false);
    }
  };

  const verifyCode = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (otp.length !== OTP_LENGTH) {
      setErrorMsg('Enter the 6-digit code from your email.');
      return;
    }
    setErrorMsg(null);
    setIsVerifying(true);
    try {
      const auth = await authApi.verifyEmailOtp(email, otp);
      loginWithAuthData(auth.accessToken, auth.refreshToken, auth.user);
    } catch (err) {
      setErrorMsg(apiError(err, 'That code did not work. Please try again.'));
      setOtp('');
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[70] flex items-end justify-center overflow-y-auto bg-black/55 backdrop-blur-[2px] sm:items-center sm:p-4 animate-fade-in"
      onClick={(e) => e.target === e.currentTarget && closeAuthModal()}
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-title"
    >
      <div className="relative w-full max-h-[94vh] overflow-y-auto rounded-t-3xl border border-slate-200 bg-white shadow-2xl animate-slide-up dark:border-neutral-800 dark:bg-neutral-950 sm:max-w-[420px] sm:rounded-3xl safe-area-bottom">
        <button
          type="button"
          onClick={closeAuthModal}
          className="absolute right-3 top-3 z-10 rounded-full p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-neutral-900 dark:hover:text-neutral-200"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="px-6 pb-2 pt-7 text-center sm:px-8">
          <img src="/genie_emblem.png" alt="" aria-hidden="true" className="mx-auto h-14 w-auto" draggable={false} />
          <h2 id="auth-title" className="mt-3 text-xl font-bold tracking-tight text-ink dark:text-white">
            {step === 'start' ? 'Log in or sign up' : 'Check your email'}
          </h2>
          <p className="mt-1 text-[13px] text-slate-500 dark:text-neutral-400">
            {step === 'start'
              ? 'See your exact price and book a free doorstep pickup.'
              : infoMsg}
          </p>
        </div>

        <div className="px-6 pb-7 pt-4 sm:px-8">
          {errorMsg && (
            <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-xs font-medium text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-300" role="alert">
              {errorMsg}
            </div>
          )}

          {step === 'start' ? (
            <>
              <button
                type="button"
                onClick={handleGoogle}
                disabled={isGoogleLoading}
                className="flex h-12 w-full items-center justify-center gap-3 rounded-2xl border border-slate-300 bg-white text-sm font-semibold text-slate-800 transition hover:bg-slate-50 hover:shadow-soft disabled:opacity-70 dark:border-neutral-700 dark:bg-neutral-900 dark:text-white dark:hover:bg-neutral-800"
              >
                {isGoogleLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <GoogleIcon />}
                Continue with Google
              </button>

              <div className="my-5 flex items-center gap-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-neutral-500">
                <span className="h-px flex-1 bg-slate-200 dark:bg-neutral-800" />
                or continue with email
                <span className="h-px flex-1 bg-slate-200 dark:bg-neutral-800" />
              </div>

              <form onSubmit={sendCode} className="space-y-3" noValidate>
                <label htmlFor="auth-email" className="sr-only">Email address</label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-4 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-slate-400 dark:text-neutral-500" />
                  <input
                    id="auth-email"
                    type="email"
                    autoComplete="email"
                    inputMode="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 pl-11 pr-4 text-sm font-medium text-ink outline-none transition focus:border-amber-400 focus:bg-white focus:ring-4 focus:ring-amber-300/30 dark:border-neutral-800 dark:bg-neutral-900 dark:text-white"
                  />
                </div>
                <button type="submit" disabled={isSending} className="btn-genie w-full">
                  {isSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <>Send code <ArrowRight className="h-4 w-4" /></>}
                </button>
              </form>
            </>
          ) : (
            <form onSubmit={verifyCode} className="space-y-4">
              <OtpInput value={otp} onChange={setOtp} disabled={isVerifying} />

              {devOtp && (
                <p className="rounded-xl bg-amber-50 px-3 py-2 text-center text-xs text-amber-800 dark:bg-amber-400/10 dark:text-amber-200">
                  Development mode: email delivery isn't configured, code <strong>{devOtp}</strong> was filled in.
                </p>
              )}

              <button type="submit" disabled={isVerifying || otp.length !== OTP_LENGTH} className="btn-genie w-full">
                {isVerifying ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Verify & continue'}
              </button>

              <div className="flex items-center justify-between text-xs">
                <button
                  type="button"
                  onClick={() => {
                    setStep('start');
                    setErrorMsg(null);
                    setOtp('');
                  }}
                  className="inline-flex items-center gap-1 font-semibold text-slate-500 hover:text-ink dark:text-neutral-400 dark:hover:text-white"
                >
                  <ArrowLeft className="h-3.5 w-3.5" /> Change email
                </button>
                <button
                  type="button"
                  disabled={cooldown > 0 || isSending}
                  onClick={() => sendCode()}
                  className="font-semibold text-amber-600 hover:text-amber-700 disabled:cursor-not-allowed disabled:text-slate-400 dark:text-amber-400 dark:disabled:text-neutral-600"
                >
                  {cooldown > 0 ? `Resend in ${cooldown}s` : 'Resend code'}
                </button>
              </div>
              <p className="text-center text-[11px] text-slate-400 dark:text-neutral-500">
                Can't find it? Check your spam or promotions folder.
              </p>
            </form>
          )}

          <p className="mt-6 text-center text-[11px] leading-relaxed text-slate-400 dark:text-neutral-500">
            By continuing, you agree to Genie's{' '}
            <Link to="/terms" onClick={closeAuthModal} className="font-semibold text-slate-600 underline-offset-2 hover:underline dark:text-neutral-300">
              Terms
            </Link>{' '}
            and{' '}
            <Link to="/privacy" onClick={closeAuthModal} className="font-semibold text-slate-600 underline-offset-2 hover:underline dark:text-neutral-300">
              Privacy Policy
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  );
};
