import React, { useState, useEffect, useRef, useCallback } from 'react';
import { User } from '../types';
import {
  Lock,
  Mail,
  ArrowRight,
  ArrowLeft,
  ArrowUpRight,
  User as UserIcon,
  Phone,
  Eye,
  EyeOff,
  KeyRound,
  ShieldCheck,
  RotateCcw,
  CheckCircle2,
  Menu,
  X,
  Landmark,
  Activity,
  BookOpen,
  Camera,
  MessageCircle,
  MapPin,
} from 'lucide-react';
import { motion, AnimatePresence, useReducedMotion, useScroll, useTransform } from 'motion/react';
import Logo from '../components/Logo';
import Reveal from '../components/Reveal';
import { apiFetch } from '../api/client';
import { SHOWCASE_CONFIG } from '../config/showcaseConfig';

type AuthMode = 'login' | 'signup' | 'forgot_request' | 'forgot_reset';

interface LoginProps {
  onLogin: (user: User) => void;
}

const HERO_VIDEO = import.meta.env.VITE_HERO_VIDEO_URL || '';
const HERO_IMAGE =
  import.meta.env.VITE_HERO_POSTER_URL ||
  'https://images.unsplash.com/photo-1580041065738-e72023775cdc?auto=format&fit=crop&q=85&w=2200';
const EXPERIENCE_IMAGE =
  'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&q=85&w=1600';

const NAV_LINKS = [
  { id: 'developments', label: 'Developments' },
  { id: 'experience', label: 'Investor Experience' },
  { id: 'access', label: 'Investor Access' },
];

const iconCls = 'absolute left-3.5 top-1/2 -translate-y-1/2 text-redhill-muted w-[17px] h-[17px] pointer-events-none';
const toggleCls = 'absolute right-3 top-1/2 -translate-y-1/2 text-redhill-muted hover:text-redhill-charcoal transition-colors cursor-pointer p-1';
const errorCls = 'p-3.5 bg-red-50 border border-red-200 text-red-800 text-sm rounded-md font-medium';
const successCls = 'p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm rounded-md font-medium flex items-center gap-2';

const Spinner = () => (
  <span className="w-4 h-4 rounded-full border-2 border-white/40 border-t-white animate-spin" aria-hidden="true" />
);

export default function Login({ onLogin }: LoginProps) {
  const [authMode, setAuthMode] = useState<AuthMode>('login');

  // Login / Signup state
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Forgot password & reset state
  const [forgotIdentifier, setForgotIdentifier] = useState('');
  const [targetEmail, setTargetEmail] = useState('');
  const [maskedEmail, setMaskedEmail] = useState('');
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);

  // Status & feedback state
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);

  // Landing presentation state
  const reduceMotion = useReducedMotion();
  const [scrolled, setScrolled] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [accessDrawerOpen, setAccessDrawerOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [entering, setEntering] = useState(false);
  const [activeProjectIdx, setActiveProjectIdx] = useState(0);

  const inlineFormRef = useRef<HTMLDivElement>(null);
  const drawerFormRef = useRef<HTMLDivElement>(null);
  const activeSectionRef = useRef<string | null>(null);
  activeSectionRef.current = activeSection;

  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const { scrollY } = useScroll();
  const heroParallax = useTransform(scrollY, [0, 800], [0, reduceMotion ? 0 : 70]);

  const completeLogin = (user: User) => {
    setEntering(true);
    window.setTimeout(() => onLogin(user), reduceMotion ? 0 : 240);
  };

  // Countdown timer for resending OTP
  useEffect(() => {
    let interval: any;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer(prev => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Track which section is in view
  useEffect(() => {
    const els = NAV_LINKS.map(l => document.getElementById(l.id)).filter(Boolean) as HTMLElement[];
    if (!('IntersectionObserver' in window) || els.length === 0) return;
    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) setActiveSection(entry.target.id);
          else if (entry.target.id === activeSectionRef.current && entry.boundingClientRect.top > 0) setActiveSection(null);
        });
      },
      { rootMargin: '-40% 0px -45% 0px' }
    );
    els.forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  // Escape & scroll lock for mobile nav and access drawer
  useEffect(() => {
    if (!mobileNavOpen && !accessDrawerOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMobileNavOpen(false);
        setAccessDrawerOpen(false);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', onKey);
    };
  }, [mobileNavOpen, accessDrawerOpen]);

  // Focus first field when the slide-over access drawer opens
  useEffect(() => {
    if (!accessDrawerOpen) return;
    const t = window.setTimeout(() => {
      drawerFormRef.current?.querySelector<HTMLInputElement>('input')?.focus({ preventScroll: true });
    }, reduceMotion ? 0 : 220);
    return () => window.clearTimeout(t);
  }, [accessDrawerOpen, reduceMotion]);

  const openAccessDrawer = useCallback((mode?: 'login' | 'signup') => {
    setMobileNavOpen(false);
    if (mode) { setAuthMode(mode); setError(''); setSuccessMsg(''); }
    setAccessDrawerOpen(true);
  }, []);

  const scrollToAccessSection = useCallback(() => {
    setMobileNavOpen(false);
    const el = document.getElementById('access');
    el?.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
    window.setTimeout(() => {
      inlineFormRef.current?.querySelector<HTMLInputElement>('input')?.focus({ preventScroll: true });
    }, reduceMotion ? 0 : 500);
  }, [reduceMotion]);

  const scrollToSection = (id: string) => {
    setMobileNavOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
  };

  // =====================================================================
  // EXISTING AUTH HANDLERS (preserved verbatim)
  // =====================================================================
  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccessMsg('');

    try {
      const isLogin = authMode === 'login';
      const endpoint = isLogin ? '/api/login' : '/api/signup';
      const cleanEmail = email.trim();
      const cleanName = name.trim();
      const cleanPhone = phone.trim();

      const body = isLogin
        ? { email: cleanEmail, password }
        : { name: cleanName, email: cleanEmail, phone: cleanPhone, password };

      const res = await apiFetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        const user = await res.json();
        if (user.token) {
          localStorage.setItem('redhill_auth_token', user.token);
        }
        completeLogin(user);
      } else {
        const data = await res.json().catch(() => ({ error: `Server error (${res.status})` }));
        setError(data.error || (isLogin ? 'Login failed' : 'Sign up failed'));
      }
    } catch (err: any) {
      console.error('Auth request failed:', err);
      setError(err?.message || 'Something went wrong. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const handleRequestOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const identifier = forgotIdentifier.trim() || email.trim();
    if (!identifier) {
      setError('Please enter your email, Login ID, or phone number');
      return;
    }

    setLoading(true);
    setError('');
    setSuccessMsg('');

    try {
      const res = await apiFetch('/api/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: identifier }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setTargetEmail(data.email);
        setMaskedEmail(data.maskedEmail || data.email);
        setSuccessMsg(`Verification code sent to ${data.maskedEmail || data.email}`);
        setAuthMode('forgot_reset');
        setResendTimer(45);
        setOtpDigits(['', '', '', '', '', '']);
        setTimeout(() => {
          otpInputRefs.current[0]?.focus();
        }, 300);
      } else {
        setError(data.error || 'Failed to send verification code. Please check your details.');
      }
    } catch (err: any) {
      console.error('Forgot password request failed:', err);
      setError(err?.message || 'Unable to connect to server. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const otp = otpDigits.join('').trim();

    if (otp.length !== 6) {
      setError('Please enter the complete 6-digit OTP code');
      return;
    }

    if (!newPassword || newPassword.length < 4) {
      setError('Password must be at least 4 characters long');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match. Please re-enter.');
      return;
    }

    setLoading(true);
    setError('');
    setSuccessMsg('');

    try {
      const res = await apiFetch('/api/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: targetEmail,
          otp,
          newPassword,
        }),
      });

      const data = await res.json();
      if (res.ok && data.token) {
        localStorage.setItem('redhill_auth_token', data.token);
        setSuccessMsg('Password reset successfully! Logging you in...');
        setTimeout(() => {
          onLogin(data);
        }, 600);
      } else {
        setError(data.error || 'Failed to reset password. Please verify the OTP.');
      }
    } catch (err: any) {
      console.error('Password reset failed:', err);
      setError(err?.message || 'Network error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (index: number, val: string) => {
    const cleanVal = val.replace(/\D/g, '');
    if (cleanVal.length > 1) {
      const chars = cleanVal.slice(0, 6).split('');
      const newDigits = [...otpDigits];
      chars.forEach((c, i) => {
        if (i < 6) newDigits[i] = c;
      });
      setOtpDigits(newDigits);
      const nextIndex = Math.min(chars.length, 5);
      otpInputRefs.current[nextIndex]?.focus();
      return;
    }

    const newDigits = [...otpDigits];
    newDigits[index] = cleanVal;
    setOtpDigits(newDigits);

    if (cleanVal && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  const switchToForgot = () => {
    setForgotIdentifier(email || '');
    setError('');
    setSuccessMsg('');
    setAuthMode('forgot_request');
  };

  const switchToLogin = () => {
    setError('');
    setSuccessMsg('');
    setAuthMode('login');
  };

  const rise = (delay: number) =>
    reduceMotion
      ? {}
      : {
          initial: { opacity: 0, y: 20 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.75, delay, ease: [0.22, 1, 0.36, 1] as const },
        };

  const panelHeading =
    authMode === 'login' ? { title: 'Investor Access', sub: 'Sign in to your private portfolio.' } :
    authMode === 'signup' ? { title: 'Register Account', sub: 'Request onboarding to the Redhill portal.' } :
    authMode === 'forgot_request' ? { title: 'Reset Password', sub: 'We will send a 6-digit verification code.' } :
    { title: 'Verify & Set Password', sub: 'Confirm your code and choose a new password.' };

  // =====================================================================
  // Shared Authentication Form (rendered both in the inline #access
  // section and in the slide-over drawer; state is shared so entered
  // values are always preserved).
  // =====================================================================
  const renderAuthForm = (prefix: string) => (
    <div>
      {(authMode === 'login' || authMode === 'signup') && (
        <div role="tablist" aria-label="Authentication mode" className="grid grid-cols-2 border-b border-redhill-line mb-6">
          {(['login', 'signup'] as const).map(mode => (
            <button
              key={mode}
              type="button"
              role="tab"
              aria-selected={authMode === mode}
              onClick={() => { setAuthMode(mode); setError(''); setSuccessMsg(''); }}
              className={`relative pb-3 text-xs uppercase tracking-[0.18em] font-semibold transition-colors cursor-pointer ${
                authMode === mode ? 'text-redhill-charcoal' : 'text-redhill-muted hover:text-redhill-charcoal'
              }`}
            >
              {mode === 'login' ? 'Sign In' : 'Create Account'}
              {authMode === mode && (
                <span className="absolute inset-x-0 -bottom-px h-[2px] bg-redhill-red" />
              )}
            </button>
          ))}
        </div>
      )}

      {(authMode === 'login' || authMode === 'signup') && (
        <form onSubmit={handleAuthSubmit} className="space-y-5">
          {authMode === 'signup' && (
            <>
              <div>
                <label htmlFor={`${prefix}-name`} className="field-label">Full Name</label>
                <div className="relative">
                  <UserIcon className={iconCls} />
                  <input
                    id={`${prefix}-name`}
                    type="text"
                    autoComplete="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="field pl-11"
                    placeholder="Full legal name"
                    required
                  />
                </div>
              </div>
              <div>
                <label htmlFor={`${prefix}-phone`} className="field-label">Phone Number</label>
                <div className="relative">
                  <Phone className={iconCls} />
                  <input
                    id={`${prefix}-phone`}
                    type="tel"
                    autoComplete="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="field pl-11"
                    placeholder="+91 98765 43210"
                    required
                  />
                </div>
              </div>
            </>
          )}

          <div>
            <label htmlFor={`${prefix}-id`} className="field-label">
              {authMode === 'login' ? 'Email, Login ID or Phone Number' : 'Email Address'}
            </label>
            <div className="relative">
              <Mail className={iconCls} />
              <input
                id={`${prefix}-id`}
                type="text"
                autoComplete="username"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="field pl-11"
                placeholder={authMode === 'login' ? 'name@example.com, jo210 or +91…' : 'name@example.com'}
                required
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label htmlFor={`${prefix}-pwd`} className="field-label mb-0">Password</label>
              {authMode === 'login' && (
                <button
                  type="button"
                  onClick={switchToForgot}
                  className="text-xs font-medium text-redhill-red hover:text-redhill-crimson transition-colors cursor-pointer"
                >
                  Forgot password?
                </button>
              )}
            </div>
            <div className="relative">
              <Lock className={iconCls} />
              <input
                id={`${prefix}-pwd`}
                type={showPassword ? 'text' : 'password'}
                autoComplete={authMode === 'login' ? 'current-password' : 'new-password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="field pl-11 pr-11"
                placeholder="••••••••"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className={toggleCls}
                tabIndex={-1}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {error && <div role="alert" className={errorCls}>{error}</div>}
          {successMsg && (
            <div role="status" className={successCls}>
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          <button type="submit" disabled={loading} className="btn-primary w-full py-3.5 group">
            {loading ? (
              <><Spinner />{authMode === 'login' ? 'Authenticating…' : 'Registering…'}</>
            ) : (
              <>
                {authMode === 'login' ? 'Enter Investor Portal' : 'Create Account'}
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </>
            )}
          </button>

          <p className="flex items-center justify-center gap-1.5 text-[11px] text-redhill-muted pt-1">
            <ShieldCheck className="w-3.5 h-3.5 text-redhill-gold" />
            256-bit encrypted private investor session
          </p>
        </form>
      )}

      {authMode === 'forgot_request' && (
        <div className="space-y-5">
          <div className="flex items-start gap-3 p-3.5 bg-redhill-ivory border border-redhill-line rounded-md">
            <KeyRound className="w-4 h-4 text-redhill-gold shrink-0 mt-0.5" />
            <p className="text-xs text-redhill-muted leading-relaxed">
              Enter your registered email, Login ID or phone number to receive a 6-digit verification code.
            </p>
          </div>
          <form onSubmit={handleRequestOtp} className="space-y-4">
            <div>
              <label htmlFor={`${prefix}-forgot`} className="field-label">Account Identifier</label>
              <div className="relative">
                <Mail className={iconCls} />
                <input
                  id={`${prefix}-forgot`}
                  type="text"
                  autoComplete="username"
                  value={forgotIdentifier}
                  onChange={(e) => setForgotIdentifier(e.target.value)}
                  className="field pl-11"
                  placeholder="Email, Login ID or phone number"
                  required
                />
              </div>
            </div>
            {error && <div role="alert" className={errorCls}>{error}</div>}
            <button type="submit" disabled={loading} className="btn-primary w-full py-3.5">
              {loading ? <><Spinner />Sending Code…</> : <>Send Verification Code<ArrowRight className="w-4 h-4" /></>}
            </button>
            <button
              type="button"
              onClick={switchToLogin}
              className="w-full py-2 text-xs text-redhill-muted hover:text-redhill-charcoal inline-flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Sign In
            </button>
          </form>
        </div>
      )}

      {authMode === 'forgot_reset' && (
        <div className="space-y-5">
          <div className="flex items-start gap-3 p-3.5 bg-redhill-ivory border border-redhill-line rounded-md">
            <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
            <p className="text-xs text-redhill-muted leading-relaxed">
              Enter the 6-digit code sent to <strong className="text-redhill-charcoal">{maskedEmail || targetEmail}</strong>.
            </p>
          </div>

          <form onSubmit={handleResetPasswordSubmit} className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="field-label mb-0">6-Digit Verification Code</span>
                <button
                  type="button"
                  disabled={resendTimer > 0 || loading}
                  onClick={() => handleRequestOtp()}
                  className="text-xs font-medium text-redhill-red hover:text-redhill-crimson disabled:opacity-50 cursor-pointer inline-flex items-center gap-1"
                >
                  <RotateCcw className="w-3 h-3" />
                  {resendTimer > 0 ? `Resend in ${resendTimer}s` : 'Resend Code'}
                </button>
              </div>
              <div className="grid grid-cols-6 gap-2" role="group" aria-label="Verification code">
                {otpDigits.map((digit, idx) => (
                  <input
                    key={idx}
                    ref={(el) => { if (prefix === 'inline' || accessDrawerOpen) otpInputRefs.current[idx] = el; }}
                    type="text"
                    inputMode="numeric"
                    autoComplete={idx === 0 ? 'one-time-code' : 'off'}
                    aria-label={`Digit ${idx + 1}`}
                    maxLength={6}
                    value={digit}
                    onChange={(e) => handleOtpChange(idx, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                    className="field px-0 h-12 text-center text-lg font-semibold tabular"
                  />
                ))}
              </div>
            </div>

            <div>
              <label htmlFor={`${prefix}-newpwd`} className="field-label">New Password</label>
              <div className="relative">
                <Lock className={iconCls} />
                <input
                  id={`${prefix}-newpwd`}
                  type={showNewPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="field pl-11 pr-11"
                  placeholder="At least 4 characters"
                  required
                />
                <button type="button" onClick={() => setShowNewPassword(!showNewPassword)} className={toggleCls} tabIndex={-1} aria-label={showNewPassword ? 'Hide password' : 'Show password'}>
                  {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label htmlFor={`${prefix}-cfmpwd`} className="field-label">Confirm New Password</label>
              <div className="relative">
                <Lock className={iconCls} />
                <input
                  id={`${prefix}-cfmpwd`}
                  type={showConfirmPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="field pl-11 pr-11"
                  placeholder="Re-type new password"
                  required
                />
                <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className={toggleCls} tabIndex={-1} aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}>
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && <div role="alert" className={errorCls}>{error}</div>}
            {successMsg && (
              <div role="status" className={successCls}>
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            <button type="submit" disabled={loading} className="btn-primary w-full py-3.5">
              {loading ? <><Spinner />Updating Password…</> : <>Reset Password &amp; Sign In<ArrowRight className="w-4 h-4" /></>}
            </button>

            <div className="flex items-center justify-between text-xs pt-1">
              <button type="button" onClick={() => { setAuthMode('forgot_request'); setError(''); }} className="text-redhill-muted hover:text-redhill-charcoal cursor-pointer">
                ← Change Identifier
              </button>
              <button type="button" onClick={switchToLogin} className="text-redhill-red hover:text-redhill-crimson cursor-pointer">
                Back to Sign In
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );

  const featured = SHOWCASE_CONFIG.featuredProjects;
  const activeProject = featured[activeProjectIdx] || featured[0];

  return (
    <div className="min-h-screen bg-redhill-ivory text-redhill-charcoal">

      {/* ================================================================ */}
      {/* EDITORIAL HEADER                                                  */}
      {/* ================================================================ */}
      <header
        className={`fixed top-0 inset-x-0 z-40 transition-[background-color,border-color,backdrop-filter] duration-300 border-b ${
          scrolled ? 'bg-white/95 backdrop-blur-md border-redhill-line' : 'bg-redhill-ivory/85 backdrop-blur-sm border-transparent'
        }`}
      >
        <div className="max-w-[1440px] mx-auto px-5 sm:px-8 lg:px-12 h-20 flex items-center justify-between gap-6">
          <a
            href="#top"
            onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' }); }}
            aria-label="Redhill Infra — home"
          >
            <Logo />
          </a>

          <nav aria-label="Primary" className="hidden md:flex items-center gap-10">
            {NAV_LINKS.map(link => (
              <a
                key={link.id}
                href={`#${link.id}`}
                onClick={(e) => { e.preventDefault(); scrollToSection(link.id); }}
                aria-current={activeSection === link.id ? 'true' : undefined}
                className={`nav-link text-[13px] tracking-[0.1em] uppercase transition-colors duration-300 ${
                  activeSection === link.id ? 'text-redhill-charcoal font-semibold' : 'text-redhill-muted hover:text-redhill-charcoal'
                }`}
              >
                {link.label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <span className="hidden sm:inline-flex">
              <button
                type="button"
                onClick={() => openAccessDrawer('login')}
                className="btn-dark py-2.5 px-5 text-xs uppercase tracking-[0.14em]"
              >
                <Lock className="w-3.5 h-3.5 text-redhill-gold-soft" />
                Investor Access
              </button>
            </span>
            <button
              type="button"
              onClick={() => setMobileNavOpen(true)}
              aria-label="Open navigation menu"
              aria-expanded={mobileNavOpen}
              aria-controls="mobile-nav"
              className="md:hidden w-11 h-11 inline-flex items-center justify-center rounded-md text-redhill-charcoal hover:bg-redhill-sand transition-colors cursor-pointer"
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile navigation drawer */}
      <AnimatePresence>
        {mobileNavOpen && (
          <div className="md:hidden fixed inset-0 z-50" id="mobile-nav" role="dialog" aria-modal="true" aria-label="Navigation">
            <motion.div
              className="absolute inset-0 bg-redhill-ink/40"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setMobileNavOpen(false)}
            />
            <motion.div
              className="absolute right-0 top-0 h-full w-[86%] max-w-sm bg-white border-l border-redhill-line flex flex-col"
              initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
              transition={{ duration: reduceMotion ? 0 : 0.35, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="h-20 px-5 flex items-center justify-between border-b border-redhill-line">
                <Logo />
                <button
                  type="button"
                  onClick={() => setMobileNavOpen(false)}
                  aria-label="Close navigation menu"
                  autoFocus
                  className="w-11 h-11 inline-flex items-center justify-center rounded-md text-redhill-charcoal hover:bg-redhill-sand transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <nav aria-label="Mobile" className="flex-1 px-5 py-6 flex flex-col">
                {NAV_LINKS.map((link, i) => (
                  <button
                    key={link.id}
                    type="button"
                    onClick={() => scrollToSection(link.id)}
                    className="text-left min-h-[56px] border-b border-redhill-line flex items-center justify-between text-lg font-serif text-redhill-charcoal cursor-pointer"
                  >
                    <span><span className="text-redhill-gold text-xs font-sans tracking-[0.2em] mr-3">0{i + 1}</span>{link.label}</span>
                    <ArrowRight className="w-4 h-4 text-redhill-muted" />
                  </button>
                ))}
              </nav>
              <div className="p-5 border-t border-redhill-line bg-redhill-ivory">
                <button type="button" onClick={() => openAccessDrawer('login')} className="btn-primary w-full py-3.5">
                  <Lock className="w-4 h-4" />
                  Investor Access
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ================================================================ */}
      {/* SLIDE-OVER INVESTOR ACCESS DRAWER                                 */}
      {/* ================================================================ */}
      <AnimatePresence>
        {accessDrawerOpen && (
          <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label="Investor Access">
            <motion.div
              className="absolute inset-0 bg-redhill-ink/45 backdrop-blur-[2px]"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              onClick={() => setAccessDrawerOpen(false)}
            />
            <motion.div
              ref={drawerFormRef}
              className="absolute right-0 top-0 h-full w-full max-w-[460px] bg-white border-l border-redhill-line shadow-2xl flex flex-col overflow-y-auto"
              initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
              transition={{ duration: reduceMotion ? 0 : 0.38, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="h-20 px-6 sm:px-8 border-b border-redhill-line flex items-center justify-between shrink-0">
                <span className="eyebrow text-redhill-gold">Redhill Investor Portal</span>
                <button
                  type="button"
                  onClick={() => setAccessDrawerOpen(false)}
                  aria-label="Close Investor Access"
                  className="w-10 h-10 inline-flex items-center justify-center rounded-md text-redhill-muted hover:text-redhill-charcoal hover:bg-redhill-sand transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 sm:p-8 flex-1">
                <h2 className="font-serif text-3xl text-redhill-charcoal">{panelHeading.title}</h2>
                <p className="text-sm text-redhill-muted mt-1 mb-7">{panelHeading.sub}</p>
                {renderAuthForm('drawer')}
              </div>

              <div className="px-6 sm:px-8 py-4 border-t border-redhill-line bg-redhill-ivory text-xs text-redhill-muted flex items-center justify-between">
                <span>Need assistance?</span>
                <span className="font-mono text-redhill-charcoal">invest@redhillinfra.com</span>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ================================================================ */}
      {/* EDITORIAL HERO — Warm Ivory composition with framed architecture  */}
      {/* ================================================================ */}
      <section id="top" className="pt-28 sm:pt-32 lg:pt-36 pb-16 sm:pb-24 border-b border-redhill-line">
        <div className="max-w-[1440px] mx-auto px-5 sm:px-8 lg:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-12 items-center">
            {/* Editorial copy */}
            <div className="lg:col-span-5 space-y-7">
              <motion.div {...rise(0.05)} className="flex items-center gap-3">
                <span className="w-10 h-px bg-redhill-red" />
                <span className="eyebrow text-redhill-gold">Redhill Infrastructure · Bengaluru</span>
              </motion.div>

              <motion.h1
                {...rise(0.15)}
                className="display text-4xl sm:text-5xl xl:text-[3.25rem] font-semibold text-redhill-charcoal"
              >
                Beyond buildings.{' '}
                <span className="block text-redhill-gold mt-1">We build enduring value.</span>
              </motion.h1>

              <motion.p {...rise(0.25)} className="text-base sm:text-lg text-redhill-muted leading-relaxed max-w-md">
                A private real-estate platform connecting discerning investors with residential and commercial developments across Bengaluru’s high-growth corridors.
              </motion.p>

              <motion.div {...rise(0.35)} className="flex flex-wrap items-center gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => openAccessDrawer('login')}
                  className="btn-primary py-3.5 px-6 text-xs uppercase tracking-[0.14em]"
                >
                  Investor Sign In
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => scrollToSection('developments')}
                  className="btn-secondary py-3.5 px-6 text-xs uppercase tracking-[0.14em]"
                >
                  View Developments
                </button>
              </motion.div>

              <motion.dl {...rise(0.45)} className="grid grid-cols-3 gap-6 pt-8 border-t border-redhill-line">
                <div>
                  <dt className="eyebrow text-redhill-muted">Corridors</dt>
                  <dd className="font-serif text-2xl sm:text-3xl text-redhill-charcoal mt-1 tabular">04</dd>
                </div>
                <div>
                  <dt className="eyebrow text-redhill-muted">Compliance</dt>
                  <dd className="font-serif text-2xl sm:text-3xl text-redhill-charcoal mt-1">RERA</dd>
                </div>
                <div>
                  <dt className="eyebrow text-redhill-muted">Telemetry</dt>
                  <dd className="font-serif text-2xl sm:text-3xl text-redhill-charcoal mt-1">24/7</dd>
                </div>
              </motion.dl>
            </div>

            {/* Framed architectural plate */}
            <motion.div {...rise(0.2)} className="lg:col-span-7">
              <div className="relative overflow-hidden rounded-lg bg-redhill-sand border border-redhill-line aspect-[16/11] sm:aspect-[16/10]">
                <motion.div style={{ y: heroParallax }} className="absolute -inset-y-6 inset-x-0">
                  {HERO_VIDEO && !reduceMotion ? (
                    <video
                      className="w-full h-full object-cover"
                      src={HERO_VIDEO}
                      poster={HERO_IMAGE}
                      autoPlay
                      muted
                      loop
                      playsInline
                      preload="metadata"
                    />
                  ) : (
                    <img
                      src={HERO_IMAGE}
                      alt="Redhill residential architecture, Bengaluru"
                      className={`w-full h-full object-cover ${reduceMotion ? '' : 'animate-ken-burns'}`}
                    />
                  )}
                </motion.div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent" />

                {/* Architectural plate caption */}
                <div className="absolute bottom-4 left-4 right-4 sm:bottom-6 sm:left-6 sm:right-6 flex flex-col sm:flex-row sm:items-end justify-between gap-3 text-white">
                  <div>
                    <p className="eyebrow text-redhill-gold-soft">Featured Address · Whitefield</p>
                    <p className="font-serif text-xl sm:text-2xl mt-0.5">Redhill Signature Towers</p>
                  </div>
                  <button
                    type="button"
                    onClick={scrollToAccessSection}
                    className="self-start sm:self-auto inline-flex items-center gap-2 bg-white/95 hover:bg-white text-redhill-charcoal text-xs font-semibold uppercase tracking-[0.14em] px-4 py-2.5 rounded-md cursor-pointer transition-colors"
                  >
                    Access Project Dossier
                    <ArrowUpRight className="w-3.5 h-3.5 text-redhill-red" />
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ================================================================ */}
      {/* 01 — SIGNATURE DEVELOPMENTS (Light editorial showcase)            */}
      {/* ================================================================ */}
      <section id="developments" className="py-20 sm:py-28 bg-white border-b border-redhill-line">
        <div className="max-w-[1440px] mx-auto px-5 sm:px-8 lg:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-14 items-end">
            <Reveal className="lg:col-span-7">
              <p className="eyebrow text-redhill-gold mb-3 flex items-center gap-3">
                <span className="w-8 h-px bg-redhill-gold" />01 — Portfolio of Developments
              </p>
              <h2 className="display text-3xl sm:text-4xl lg:text-5xl text-redhill-charcoal">
                Landmark addresses across Bengaluru’s prime corridors.
              </h2>
            </Reveal>
            <Reveal className="lg:col-span-5" delay={0.08}>
              <p className="text-redhill-muted leading-relaxed text-base">
                Every Redhill development is conceived around connectivity, architectural longevity and transparent capital stewardship — from Whitefield to the Devanahalli aerotropolis.
              </p>
            </Reveal>
          </div>

          {/* Interactive editorial spotlight + list */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-stretch">
            <Reveal className="lg:col-span-7">
              <div className="relative h-full min-h-[360px] sm:min-h-[460px] rounded-lg overflow-hidden bg-redhill-sand border border-redhill-line">
                <img
                  key={activeProject.id}
                  src={activeProject.image}
                  alt={activeProject.name}
                  loading="lazy"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover transition-opacity duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-transparent" />
                <span className="absolute top-5 left-5 eyebrow bg-white/95 text-redhill-charcoal px-3 py-1.5 rounded-sm">
                  {activeProject.badge}
                </span>
                <div className="absolute bottom-0 inset-x-0 p-6 sm:p-8 text-white">
                  <p className="eyebrow text-redhill-gold-soft flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5" />{activeProject.location}
                  </p>
                  <h3 className="font-serif text-2xl sm:text-4xl mt-1">{activeProject.name}</h3>
                  <p className="text-sm text-white/80 mt-2 max-w-xl line-clamp-2">{activeProject.description}</p>
                  <dl className="grid grid-cols-3 gap-4 pt-5 mt-5 border-t border-white/20 text-xs">
                    <div>
                      <dt className="text-white/60 uppercase tracking-[0.14em] text-[10px]">Configuration</dt>
                      <dd className="text-white font-medium mt-1">{activeProject.configuration}</dd>
                    </div>
                    <div>
                      <dt className="text-white/60 uppercase tracking-[0.14em] text-[10px]">Indicative Entry</dt>
                      <dd className="text-white font-medium mt-1 tabular">{activeProject.priceStarting}</dd>
                    </div>
                    <div>
                      <dt className="text-white/60 uppercase tracking-[0.14em] text-[10px]">Possession</dt>
                      <dd className="text-white font-medium mt-1">{activeProject.possessionDate}</dd>
                    </div>
                  </dl>
                </div>
              </div>
            </Reveal>

            <div className="lg:col-span-5 flex flex-col justify-between divide-y divide-redhill-line border-y border-redhill-line">
              {featured.map((project, idx) => {
                const selected = idx === activeProjectIdx;
                return (
                  <button
                    key={project.id}
                    type="button"
                    onClick={() => setActiveProjectIdx(idx)}
                    onMouseEnter={() => setActiveProjectIdx(idx)}
                    className={`w-full text-left py-5 px-4 transition-colors flex items-start justify-between gap-4 cursor-pointer ${
                      selected ? 'bg-redhill-ivory' : 'hover:bg-redhill-ivory/60'
                    }`}
                  >
                    <div className="flex items-start gap-4 min-w-0">
                      <span className={`font-serif text-sm tabular pt-1 ${selected ? 'text-redhill-red font-semibold' : 'text-redhill-muted'}`}>
                        0{idx + 1}
                      </span>
                      <div className="min-w-0">
                        <p className="eyebrow text-redhill-gold">{project.location.replace(', Bangalore', '')}</p>
                        <h3 className="font-serif text-xl text-redhill-charcoal mt-0.5 truncate">{project.name}</h3>
                        <p className="text-xs text-redhill-muted mt-1">{project.configuration} · {project.carpetArea}</p>
                      </div>
                    </div>
                    <span className={`mt-1 w-8 h-8 rounded-full border flex items-center justify-center shrink-0 transition-colors ${
                      selected ? 'border-redhill-red bg-redhill-red text-white' : 'border-redhill-stone text-redhill-muted'
                    }`}>
                      <ArrowUpRight className="w-4 h-4" />
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ================================================================ */}
      {/* 02 — THE INVESTOR EXPERIENCE (Intentional dark architectural band)*/}
      {/* ================================================================ */}
      <section id="experience" className="band-dark py-20 sm:py-28">
        <div className="max-w-[1440px] mx-auto px-5 sm:px-8 lg:px-12 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          <Reveal className="lg:col-span-5">
            <div className="relative aspect-[4/5] rounded-lg overflow-hidden border border-white/10">
              <img
                src={EXPERIENCE_IMAGE}
                alt="Redhill private client lounge"
                loading="lazy"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              <div className="absolute bottom-5 left-5 right-5 text-xs text-white/80 flex items-center justify-between border-t border-white/20 pt-3">
                <span className="uppercase tracking-[0.18em]">Private Wealth Desk</span>
                <span className="text-redhill-gold-soft">Bengaluru</span>
              </div>
            </div>
          </Reveal>

          <div className="lg:col-span-7">
            <Reveal>
              <p className="eyebrow text-redhill-gold-soft mb-4 flex items-center gap-3">
                <span className="w-8 h-px bg-redhill-gold-soft" />02 — The Investor Experience
              </p>
              <h2 className="display text-3xl sm:text-5xl text-white max-w-2xl">
                Every square foot, milestone and rupee — accounted for in real time.
              </h2>
              <p className="mt-5 text-white/65 leading-relaxed text-base sm:text-lg max-w-xl">
                Built as a private wealth platform rather than a brochure site, the Redhill Investor Portal gives you direct visibility into construction stages, statutory approvals, capital ledgers and site feeds.
              </p>
            </Reveal>

            <ol className="mt-10 grid grid-cols-1 sm:grid-cols-2 gap-x-10">
              {[
                { icon: Activity, title: 'Stage-by-Stage Milestones', desc: 'Documentation, statutory approvals and construction progress tracked with target dates.' },
                { icon: BookOpen, title: 'Audited Capital Ledger', desc: 'Initial assignments, sub-investments and allotted square footage recorded with buy-in rates.' },
                { icon: Camera, title: 'Live Site Telemetry', desc: 'Direct CCTV feeds alongside dated progress photography and video dispatches.' },
                { icon: MessageCircle, title: 'Executive Concierge Desk', desc: 'Project-specific communication thread with the Redhill asset-management team.' },
              ].map((item, i) => (
                <Reveal as="li" key={item.title} delay={i * 0.06} className="py-6 border-t border-white/15 flex gap-4">
                  <span className="font-serif text-redhill-gold-soft text-lg tabular w-7 shrink-0">0{i + 1}</span>
                  <div>
                    <h3 className="text-white font-medium flex items-center gap-2 mb-1">
                      <item.icon className="w-4 h-4 text-redhill-gold-soft" />
                      {item.title}
                    </h3>
                    <p className="text-sm text-white/60 leading-relaxed">{item.desc}</p>
                  </div>
                </Reveal>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* ================================================================ */}
      {/* 03 — DEDICATED INVESTOR ACCESS SECTION                            */}
      {/* ================================================================ */}
      <section id="access" className="py-20 sm:py-28 bg-redhill-ivory">
        <div className="max-w-[1440px] mx-auto px-5 sm:px-8 lg:px-12 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          <Reveal className="lg:col-span-6 space-y-6 lg:pt-4">
            <p className="eyebrow text-redhill-gold flex items-center gap-3">
              <span className="w-8 h-px bg-redhill-gold" />03 — Investor Access
            </p>
            <h2 className="display text-3xl sm:text-5xl text-redhill-charcoal">
              Enter your private portfolio.
            </h2>
            <p className="text-redhill-muted text-base leading-relaxed max-w-lg">
              Sign in with your registered email address, unique Login ID or phone number to review your property allocations, valuation snapshot, construction milestones and transaction ledger.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
              {[
                { icon: Landmark, label: 'RERA Compliant', sub: 'Verified project filings' },
                { icon: Activity, label: 'Live Valuation', sub: 'Prevailing market rates' },
                { icon: BookOpen, label: 'Exportable Dossier', sub: 'CSV & PDF statements' },
              ].map(card => (
                <div key={card.label} className="lux-card p-4">
                  <card.icon className="w-4 h-4 text-redhill-gold mb-2" />
                  <p className="text-xs font-semibold text-redhill-charcoal">{card.label}</p>
                  <p className="text-[11px] text-redhill-muted mt-0.5">{card.sub}</p>
                </div>
              ))}
            </div>
          </Reveal>

          <Reveal className="lg:col-span-6" delay={0.08}>
            <div ref={inlineFormRef} className="lux-card p-6 sm:p-10 max-w-xl lg:ml-auto border-t-2 border-t-redhill-red">
              <div className="mb-6">
                <p className="eyebrow text-redhill-gold mb-1">Redhill Investor Portal</p>
                <h3 className="font-serif text-2xl sm:text-3xl text-redhill-charcoal">{panelHeading.title}</h3>
                <p className="text-sm text-redhill-muted mt-1">{panelHeading.sub}</p>
              </div>
              {renderAuthForm('inline')}
            </div>
          </Reveal>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-redhill-line py-10">
        <div className="max-w-[1440px] mx-auto px-5 sm:px-8 lg:px-12 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <Logo />
          <p className="text-xs text-redhill-muted">
            © {new Date().getFullYear()} Redhill Infrastructure Pvt Ltd. All rights reserved · Bengaluru, India.
          </p>
        </div>
      </footer>

      {/* Post-login hand-off */}
      <AnimatePresence>
        {entering && (
          <motion.div
            className="fixed inset-0 z-[100] bg-redhill-ivory flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            aria-live="polite"
          >
            <span className="sr-only">Signing you in</span>
            <Logo />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
