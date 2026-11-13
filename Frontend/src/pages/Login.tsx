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
  Building2,
  Maximize2,
  ChevronRight,
  ChevronLeft,
} from 'lucide-react';
import { motion, AnimatePresence, useReducedMotion, useScroll, useTransform } from 'motion/react';
import Logo from '../components/Logo';
import Reveal from '../components/Reveal';
import { apiFetch } from '../api/client';
import { SHOWCASE_CONFIG, ShowcaseProject } from '../config/showcaseConfig';

type AuthMode = 'login' | 'signup' | 'forgot_request' | 'forgot_reset';

interface LoginProps {
  onLogin: (user: User) => void;
}

const HERO_VIDEO = import.meta.env.VITE_HERO_VIDEO_URL || '';
const HERO_IMAGE =
  import.meta.env.VITE_HERO_POSTER_URL ||
  '/assets/projects/hero-highrise.jpg';
const EXPERIENCE_IMAGE = '/assets/projects/pinnacle-heights.jpg';
const ACCESS_EDITORIAL_IMAGE = '/assets/projects/signature-towers.jpg';

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
  const [selectedPublicProject, setSelectedPublicProject] = useState<ShowcaseProject | null>(null);
  const [activeGalleryIdx, setActiveGalleryIdx] = useState(0);

  const inlineFormRef = useRef<HTMLDivElement>(null);
  const drawerFormRef = useRef<HTMLDivElement>(null);
  const activeSectionRef = useRef<string | null>(null);
  activeSectionRef.current = activeSection;

  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const { scrollY } = useScroll();
  const heroParallax = useTransform(scrollY, [0, 800], [0, reduceMotion ? 0 : 48]);

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
    const onScroll = () => setScrolled(window.scrollY > 32);
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

  // Escape & scroll lock for mobile nav, access drawer, and public project modal
  useEffect(() => {
    if (!mobileNavOpen && !accessDrawerOpen && !selectedPublicProject) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMobileNavOpen(false);
        setAccessDrawerOpen(false);
        setSelectedPublicProject(null);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', onKey);
    };
  }, [mobileNavOpen, accessDrawerOpen, selectedPublicProject]);

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
    setSelectedPublicProject(null);
    if (mode) { setAuthMode(mode); setError(''); setSuccessMsg(''); }
    setAccessDrawerOpen(true);
  }, []);

  const scrollToAccessSection = useCallback(() => {
    setMobileNavOpen(false);
    setSelectedPublicProject(null);
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
          initial: { opacity: 0, y: 18 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] as const },
        };

  const panelHeading =
    authMode === 'login'
      ? {
          title: 'Welcome to Your Private Portfolio',
          sub: 'Access your investments, project updates and important documents in one place.',
        }
      : authMode === 'signup'
      ? {
          title: 'Create Your Investor Account',
          sub: 'Register your profile to access Redhill residential developments and portfolio records.',
        }
      : authMode === 'forgot_request'
      ? {
          title: 'Reset Your Password',
          sub: 'Enter your registered account details to receive a 6-digit verification code.',
        }
      : {
          title: 'Verify & Set New Password',
          sub: 'Confirm your 6-digit code and choose a new password.',
        };

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
              className={`relative pb-3 text-xs uppercase tracking-[0.16em] font-semibold transition-colors cursor-pointer ${
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
                    className="field field-icon-left"
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
                    className="field field-icon-left"
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
                className="field field-icon-left"
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
                className="field field-icon-left field-icon-right"
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
              <><Spinner />{authMode === 'login' ? 'Signing In…' : 'Registering…'}</>
            ) : (
              <>
                {authMode === 'login' ? 'Sign In to Portfolio' : 'Create Account'}
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </>
            )}
          </button>

          <p className="text-center text-[11px] text-redhill-muted pt-1">
            Dedicated portal for registered Redhill Infra investors and partners.
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
                  className="field field-icon-left"
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
                  className="field field-icon-left field-icon-right"
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
                  className="field field-icon-left field-icon-right"
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
      {/* REFINED NAVIGATION BAR (Centered 3-column grid across all devices)*/}
      {/* ================================================================ */}
      <header
        className={`fixed top-0 inset-x-0 z-40 transition-all duration-300 border-b ${
          scrolled
            ? 'bg-white/95 backdrop-blur-md border-redhill-line shadow-[0_8px_30px_-18px_rgba(29,30,34,0.18)]'
            : 'bg-gradient-to-b from-black/65 via-black/30 to-transparent border-white/10'
        }`}
      >
        <div className="page-container h-16 sm:h-20 grid grid-cols-2 md:grid-cols-[1fr_auto_1fr] items-center gap-4">
          <a
            href="#top"
            onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' }); }}
            aria-label="Redhill Infra — home"
            className="justify-self-start shrink-0"
          >
            <Logo light={!scrolled} />
          </a>

          <nav aria-label="Primary" className="hidden md:flex items-center justify-center gap-7 lg:gap-10 justify-self-center">
            {NAV_LINKS.map(link => (
              <a
                key={link.id}
                href={`#${link.id}`}
                onClick={(e) => { e.preventDefault(); scrollToSection(link.id); }}
                aria-current={activeSection === link.id ? 'true' : undefined}
                className={`nav-link text-[13px] tracking-[0.06em] font-medium whitespace-nowrap transition-colors duration-300 ${
                  scrolled
                    ? activeSection === link.id
                      ? 'text-redhill-charcoal font-semibold'
                      : 'text-redhill-muted hover:text-redhill-charcoal'
                    : activeSection === link.id
                    ? 'text-white font-semibold'
                    : 'text-white/85 hover:text-white'
                }`}
              >
                {link.label}
              </a>
            ))}
          </nav>

          <div className="flex items-center justify-end gap-2.5 justify-self-end">
            <span className="hidden sm:inline-flex">
              <button
                type="button"
                onClick={() => openAccessDrawer('login')}
                className={`btn-press inline-flex items-center gap-2 rounded-md py-2.5 px-4 lg:px-5 text-xs font-semibold tracking-[0.1em] uppercase transition-all cursor-pointer whitespace-nowrap ${
                  scrolled
                    ? 'bg-redhill-charcoal text-white hover:bg-black'
                    : 'bg-white/95 text-redhill-charcoal hover:bg-white'
                }`}
              >
                <Lock className={`w-3.5 h-3.5 ${scrolled ? 'text-redhill-gold-soft' : 'text-redhill-gold'}`} />
                Investor Access
              </button>
            </span>
            <button
              type="button"
              onClick={() => setMobileNavOpen(true)}
              aria-label="Open navigation menu"
              aria-expanded={mobileNavOpen}
              aria-controls="mobile-nav"
              className={`md:hidden w-11 h-11 inline-flex items-center justify-center rounded-md transition-colors cursor-pointer ${
                scrolled
                  ? 'text-redhill-charcoal hover:bg-redhill-sand'
                  : 'text-white hover:bg-white/15'
              }`}
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
              className="absolute inset-0 bg-redhill-ink/45"
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
                    className="text-left min-h-[56px] border-b border-redhill-line flex items-center justify-between text-base font-medium text-redhill-charcoal cursor-pointer"
                  >
                    <span><span className="text-redhill-gold text-xs font-mono tracking-[0.18em] mr-3">0{i + 1}</span>{link.label}</span>
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
              transition={{ duration: reduceMotion ? 0 : 0.35, ease: [0.22, 1, 0.36, 1] }}
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
                <h2 className="font-serif text-2xl sm:text-3xl text-redhill-charcoal font-semibold tracking-tight">
                  {panelHeading.title}
                </h2>
                <p className="text-sm text-redhill-muted mt-1.5 mb-7 leading-relaxed">{panelHeading.sub}</p>
                {renderAuthForm('drawer')}
              </div>

              <div className="px-6 sm:px-8 py-4 border-t border-redhill-line bg-redhill-ivory text-xs text-redhill-muted flex items-center justify-between">
                <span>Concierge Desk</span>
                <span className="font-mono text-redhill-charcoal">invest@redhillinfra.com</span>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ================================================================ */}
      {/* CINEMATIC FULL-VIEWPORT ARCHITECTURAL HERO (100% Dynamic VH)      */}
      {/* ================================================================ */}
      <section
        id="top"
        className="relative min-h-dvh flex flex-col justify-between overflow-hidden bg-redhill-ink text-white"
      >
        {/* Architectural Photograph / Video Backdrop */}
        <motion.div style={{ y: heroParallax }} className="absolute -inset-y-8 inset-x-0 z-0">
          {HERO_VIDEO && !reduceMotion ? (
            <video
              className="w-full h-full object-cover object-center"
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
              alt="Redhill contemporary 14-storey boutique residential community in Bengaluru"
              className={`w-full h-full object-cover object-[center_35%] ${reduceMotion ? '' : 'animate-ken-burns'}`}
            />
          )}
        </motion.div>

        {/* Subtle Dark Architectural Gradient for Legibility */}
        <div className="absolute inset-0 z-10 bg-gradient-to-t from-[#141519]/92 via-[#141519]/45 to-[#141519]/35" />
        <div className="absolute inset-0 z-10 bg-gradient-to-r from-[#141519]/80 via-[#141519]/30 to-transparent" />

        {/* Top Header Spacer */}
        <div className="h-16 sm:h-20 shrink-0" aria-hidden="true" />

        {/* Hero Editorial Content (Optically centered in available viewport height) */}
        <div className="relative z-20 page-container flex-1 flex items-center py-8 sm:py-12">
          <div className="max-w-3xl space-y-5 sm:space-y-6">
            <motion.div {...rise(0.05)} className="flex items-center gap-3">
              <span className="w-8 sm:w-10 h-px bg-redhill-gold-soft shrink-0" />
              <span className="eyebrow text-redhill-gold-soft">
                Redhill Infra Pvt Ltd · Contemporary Boutique High-Rise Living
              </span>
            </motion.div>

            <motion.h1
              {...rise(0.14)}
              className="display text-[clamp(2.15rem,4.5vw,4.15rem)] text-white font-semibold tracking-tight leading-[1.06]"
            >
              Thoughtfully Designed.{' '}
              <span className="block text-redhill-gold-soft mt-1.5">
                Built for Better Living.
              </span>
            </motion.h1>

            <motion.p
              {...rise(0.22)}
              className="text-base sm:text-lg lg:text-xl text-white/85 leading-relaxed max-w-2xl font-normal"
            >
              Contemporary residential communities crafted for modern urban living across Bengaluru’s prime neighbourhoods.
            </motion.p>

            <motion.div {...rise(0.3)} className="flex flex-wrap items-center gap-3.5 pt-2">
              <button
                type="button"
                onClick={() => scrollToSection('developments')}
                className="btn-primary py-3.5 px-6 text-xs uppercase tracking-[0.14em]"
              >
                Explore Developments
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={scrollToAccessSection}
                className="btn-press inline-flex items-center gap-2 rounded-md py-3.5 px-6 text-xs font-semibold uppercase tracking-[0.14em] bg-white/95 hover:bg-white text-redhill-charcoal transition-colors cursor-pointer"
              >
                <Lock className="w-3.5 h-3.5 text-redhill-gold" />
                Investor Access
              </button>
            </motion.div>
          </div>
        </div>

        {/* Architectural Portfolio Metrics Bar (Evenly aligned 4-column grid with vertical dividers) */}
        <div className="relative z-20 page-container pb-6 sm:pb-8 lg:pb-10 shrink-0">
          <motion.div
            {...rise(0.4)}
            className="pt-5 sm:pt-6 border-t border-white/20 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 lg:gap-0 text-xs"
          >
            <div className="lg:pr-8">
              <p className="text-[10px] uppercase tracking-[0.2em] text-redhill-gold-soft font-semibold">01 · Community Scale</p>
              <p className="text-sm sm:text-base text-white font-medium mt-1">2, 4 &amp; 5 Acre Developments</p>
            </div>
            <div className="lg:border-l lg:border-white/20 lg:px-8">
              <p className="text-[10px] uppercase tracking-[0.2em] text-redhill-gold-soft font-semibold">02 · Architectural Typology</p>
              <p className="text-sm sm:text-base text-white font-medium mt-1">12+ Floor Boutique High-Rises</p>
            </div>
            <div className="lg:border-l lg:border-white/20 lg:px-8">
              <p className="text-[10px] uppercase tracking-[0.2em] text-redhill-gold-soft font-semibold">03 · Bengaluru Corridors</p>
              <p className="text-sm sm:text-base text-white font-medium mt-1">Whitefield · Sarjapur · Hebbal</p>
            </div>
            <div className="lg:border-l lg:border-white/20 lg:pl-8">
              <p className="text-[10px] uppercase tracking-[0.2em] text-redhill-gold-soft font-semibold">04 · Investor Transparency</p>
              <button
                type="button"
                onClick={() => openAccessDrawer('login')}
                className="text-sm sm:text-base text-white/95 hover:text-redhill-gold-soft inline-flex items-center gap-1.5 mt-1 font-medium cursor-pointer transition-colors"
              >
                Open Private Portfolio <ArrowUpRight className="w-4 h-4 text-redhill-gold-soft" />
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ================================================================ */}
      {/* 01 — DEVELOPMENTS SECTION (Editorial Showcase + Adjacent Panel)   */}
      {/* ================================================================ */}
      <section id="developments" className="py-16 sm:py-24 lg:py-28 bg-white border-b border-redhill-line">
        <div className="page-container">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 mb-10 sm:mb-12 items-end">
            <Reveal className="lg:col-span-7">
              <p className="eyebrow text-redhill-gold mb-3 flex items-center gap-3">
                <span className="w-8 h-px bg-redhill-gold" />01 — Developments
              </p>
              <h2 className="display text-[clamp(1.75rem,3.2vw,3rem)] text-redhill-charcoal">
                Contemporary high-rise communities across Bengaluru.
              </h2>
            </Reveal>
            <Reveal className="lg:col-span-5" delay={0.08}>
              <p className="text-redhill-muted leading-relaxed text-sm sm:text-base">
                Thoughtfully planned 12+ storey residential developments set across 2-acre, 4-acre, and 5-acre landscaped communities — combining warm contemporary facades, generous balconies, and enduring build quality.
              </p>
            </Reveal>
          </div>

          {/* Elegant Project Selector Tabs */}
          <div
            role="tablist"
            aria-label="Select Redhill development"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-8"
          >
            {featured.map((project, idx) => {
              const selected = idx === activeProjectIdx;
              return (
                <button
                  key={project.id}
                  type="button"
                  role="tab"
                  aria-selected={selected}
                  onClick={() => setActiveProjectIdx(idx)}
                  className={`text-left p-4 sm:p-5 rounded-lg border transition-all duration-300 cursor-pointer flex flex-col justify-between gap-2.5 ${
                    selected
                      ? 'bg-redhill-ivory border-redhill-charcoal shadow-xs'
                      : 'bg-white border-redhill-line hover:border-redhill-stone hover:bg-redhill-ivory/50'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className={`text-xs font-mono font-semibold tabular ${selected ? 'text-redhill-red' : 'text-redhill-muted'}`}>
                      0{idx + 1}
                    </span>
                    <span className="text-[10px] uppercase tracking-[0.14em] text-redhill-gold font-semibold">
                      {project.landArea || 'Bengaluru'} · {project.floors || '12+ Floors'}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-serif text-base font-semibold text-redhill-charcoal truncate">
                      {project.name}
                    </h3>
                    <p className="text-xs text-redhill-muted truncate mt-0.5">{project.location}</p>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Main Editorial Showcase: Large Architectural Image + Refined Adjacent Information Panel */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-stretch">
            {/* Left: Large Architectural Photograph with Crossfade */}
            <div className="lg:col-span-7 flex flex-col">
              <div className="relative flex-1 min-h-[320px] sm:min-h-[440px] lg:min-h-full rounded-lg overflow-hidden bg-redhill-sand border border-redhill-line group">
                <AnimatePresence mode="wait">
                  <motion.img
                    key={activeProject.id}
                    src={activeProject.image}
                    alt={`${activeProject.name} — ${activeProject.location}`}
                    loading="lazy"
                    referrerPolicy="no-referrer"
                    initial={{ opacity: 0, scale: reduceMotion ? 1 : 1.02 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: reduceMotion ? 0 : 0.4, ease: [0.22, 1, 0.36, 1] }}
                    className="w-full h-full object-cover"
                  />
                </AnimatePresence>
                <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-transparent to-transparent" />

                <div className="absolute top-5 left-5 right-5 flex items-center justify-between gap-3">
                  <span className="eyebrow bg-white/95 text-redhill-charcoal px-3 py-1.5 rounded-sm shadow-xs">
                    {activeProject.statusText || activeProject.badge}
                  </span>
                  {activeProject.landArea && (
                    <span className="eyebrow bg-redhill-ink/80 backdrop-blur-xs text-white px-3 py-1.5 rounded-sm border border-white/15">
                      {activeProject.landArea} · {activeProject.floors}
                    </span>
                  )}
                </div>

                <div className="absolute bottom-5 left-5 right-5 flex items-end justify-between gap-4 text-white">
                  <div>
                    <p className="eyebrow text-redhill-gold-soft flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5" />
                      {activeProject.location}
                    </p>
                    <p className="font-serif text-xl sm:text-2xl font-semibold mt-0.5">{activeProject.name}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedPublicProject(activeProject);
                      setActiveGalleryIdx(0);
                    }}
                    className="inline-flex items-center gap-2 bg-white/95 hover:bg-white text-redhill-charcoal text-xs font-semibold uppercase tracking-[0.12em] px-3.5 py-2 rounded-md cursor-pointer transition-colors shrink-0"
                  >
                    <Maximize2 className="w-3.5 h-3.5 text-redhill-gold" />
                    Gallery ({activeProject.gallery.length})
                  </button>
                </div>
              </div>
            </div>

            {/* Right: Refined Adjacent Information Panel */}
            <div className="lg:col-span-5 lux-card p-6 sm:p-8 flex flex-col justify-between space-y-6 bg-[#FBF9F5]">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeProject.id}
                  initial={{ opacity: 0, y: reduceMotion ? 0 : 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: reduceMotion ? 0 : -8 }}
                  transition={{ duration: reduceMotion ? 0 : 0.3, ease: [0.22, 1, 0.36, 1] }}
                  className="space-y-6"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="eyebrow text-redhill-gold flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5" />
                        {activeProject.location}
                      </span>
                      <span className="text-xs font-mono text-redhill-muted">
                        0{activeProjectIdx + 1} / 0{featured.length}
                      </span>
                    </div>
                    <h3 className="font-serif text-2xl sm:text-3xl text-redhill-charcoal font-semibold tracking-tight">
                      {activeProject.name}
                    </h3>
                    <p className="text-sm text-redhill-muted leading-relaxed mt-3">
                      {activeProject.description}
                    </p>
                  </div>

                  {/* Verified Project Metadata Grid */}
                  <dl className="grid grid-cols-2 gap-3 pt-4 border-t border-redhill-line text-xs">
                    <div className="p-3.5 rounded-md bg-white border border-redhill-line">
                      <dt className="text-[10px] uppercase tracking-[0.16em] text-redhill-muted">Land Area &amp; Scale</dt>
                      <dd className="font-serif text-sm font-semibold text-redhill-charcoal mt-1">
                        {activeProject.landArea || 'Boutique Community'} · {activeProject.floors || '12+ Floors'}
                      </dd>
                    </div>
                    <div className="p-3.5 rounded-md bg-white border border-redhill-line">
                      <dt className="text-[10px] uppercase tracking-[0.16em] text-redhill-muted">Configuration</dt>
                      <dd className="font-serif text-sm font-semibold text-redhill-charcoal mt-1">
                        {activeProject.configuration}
                      </dd>
                    </div>
                    <div className="p-3.5 rounded-md bg-white border border-redhill-line">
                      <dt className="text-[10px] uppercase tracking-[0.16em] text-redhill-muted">Residence Area</dt>
                      <dd className="font-serif text-sm font-semibold text-redhill-charcoal mt-1 tabular">
                        {activeProject.carpetArea}
                      </dd>
                    </div>
                    <div className="p-3.5 rounded-md bg-white border border-redhill-line">
                      <dt className="text-[10px] uppercase tracking-[0.16em] text-redhill-muted">Project Status</dt>
                      <dd className="font-serif text-sm font-semibold text-emerald-800 mt-1">
                        {activeProject.statusText || activeProject.badge}
                      </dd>
                    </div>
                  </dl>

                  {/* Architectural Highlights */}
                  <div className="space-y-2 pt-2">
                    <p className="text-[10px] uppercase tracking-[0.18em] text-redhill-muted font-semibold">
                      Architectural Highlights
                    </p>
                    <ul className="grid grid-cols-1 gap-2">
                      {activeProject.highlights.map((item) => (
                        <li key={item} className="flex items-center gap-2.5 text-xs text-redhill-charcoal">
                          <CheckCircle2 className="w-3.5 h-3.5 text-redhill-gold shrink-0" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </motion.div>
              </AnimatePresence>

              {/* View Project & Investor Dossier Actions */}
              <div className="pt-5 border-t border-redhill-line flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedPublicProject(activeProject);
                    setActiveGalleryIdx(0);
                  }}
                  className="btn-dark flex-1 py-3 px-5 text-xs uppercase tracking-[0.14em]"
                >
                  View Project Details
                  <ArrowUpRight className="w-4 h-4 text-redhill-gold-soft" />
                </button>
                <button
                  type="button"
                  onClick={() => openAccessDrawer('login')}
                  className="btn-secondary py-3 px-5 text-xs uppercase tracking-[0.14em]"
                >
                  Investor Dossier
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================================================================ */}
      {/* 02 — THE INVESTOR EXPERIENCE (Intentional dark architectural band)*/}
      {/* ================================================================ */}
      <section id="experience" className="band-dark py-16 sm:py-24 lg:py-28">
        <div className="page-container grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center">
          <Reveal className="lg:col-span-5">
            <div className="relative aspect-[4/5] rounded-lg overflow-hidden border border-white/10">
              <img
                src={EXPERIENCE_IMAGE}
                alt="Redhill 16-storey boutique high-rise residence at twilight in Bengaluru"
                loading="lazy"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
              <div className="absolute bottom-5 left-5 right-5 text-xs text-white/85 flex items-center justify-between border-t border-white/20 pt-3">
                <span className="uppercase tracking-[0.18em]">Contemporary High-Rise Living</span>
                <span className="text-redhill-gold-soft">12+ Storeys · Bengaluru</span>
              </div>
            </div>
          </Reveal>

          <div className="lg:col-span-7">
            <Reveal>
              <p className="eyebrow text-redhill-gold-soft mb-4 flex items-center gap-3">
                <span className="w-8 h-px bg-redhill-gold-soft" />02 — The Investor Experience
              </p>
              <h2 className="display text-[clamp(1.75rem,3.2vw,3rem)] text-white max-w-2xl">
                Every square foot, milestone and rupee — accounted for in real time.
              </h2>
              <p className="mt-4 sm:mt-5 text-white/70 leading-relaxed text-sm sm:text-base lg:text-lg max-w-xl">
                Designed as a private residential ownership and investment portal, Redhill gives you direct visibility into your allocated area, construction stages, project documents, and capital ledger.
              </p>
            </Reveal>

            <ol className="mt-8 sm:mt-10 grid grid-cols-1 sm:grid-cols-2 gap-x-8 lg:gap-x-10">
              {[
                { icon: Activity, title: 'Stage-by-Stage Milestones', desc: 'Documentation, statutory approvals and construction progress tracked with recorded dates.' },
                { icon: BookOpen, title: 'Audited Capital Ledger', desc: 'Initial assignments, additional allocations and allotted square footage recorded with buy rates.' },
                { icon: Camera, title: 'Site Progress & Media', desc: 'Direct site camera feeds alongside dated progress photography and engineering dispatches.' },
                { icon: MessageCircle, title: 'Executive Relationship Desk', desc: 'Project-specific communication thread with the Redhill Bengaluru team.' },
              ].map((item, i) => (
                <Reveal as="li" key={item.title} delay={i * 0.06} className="py-5 sm:py-6 border-t border-white/15 flex gap-4">
                  <span className="font-serif text-redhill-gold-soft text-lg tabular w-7 shrink-0">0{i + 1}</span>
                  <div>
                    <h3 className="text-white font-medium flex items-center gap-2 mb-1">
                      <item.icon className="w-4 h-4 text-redhill-gold-soft shrink-0" />
                      {item.title}
                    </h3>
                    <p className="text-sm text-white/65 leading-relaxed">{item.desc}</p>
                  </div>
                </Reveal>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* ================================================================ */}
      {/* 03 — INVESTOR ACCESS (Refined Two-Column Private Portfolio View)  */}
      {/* ================================================================ */}
      <section id="access" className="py-16 sm:py-24 lg:py-28 bg-redhill-ivory">
        <div className="page-container">
          <div className="lux-card overflow-hidden grid grid-cols-1 lg:grid-cols-12 shadow-[0_24px_60px_-28px_rgba(29,30,34,0.22)]">
            {/* Left Column: Architectural Imagery + Welcome Editorial Presentation */}
            <div className="lg:col-span-6 relative min-h-[360px] lg:min-h-[620px] flex flex-col justify-between p-6 sm:p-10 lg:p-12 text-white bg-redhill-ink overflow-hidden">
              <img
                src={ACCESS_EDITORIAL_IMAGE}
                alt="Redhill Signature Towers — Contemporary boutique high-rise in Bengaluru"
                loading="lazy"
                className="absolute inset-0 w-full h-full object-cover opacity-80"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#141519]/95 via-[#141519]/55 to-[#141519]/40" />

              <div className="relative z-10 flex items-center justify-between gap-4">
                <Logo light />
                <span className="eyebrow text-redhill-gold-soft border border-white/20 bg-black/35 backdrop-blur-xs px-3 py-1 rounded-sm">
                  Bengaluru
                </span>
              </div>

              <div className="relative z-10 space-y-5 my-auto py-8">
                <p className="eyebrow text-redhill-gold-soft flex items-center gap-3">
                  <span className="w-8 h-px bg-redhill-gold-soft" />
                  03 — Private Investor Portal
                </p>
                <h2 className="display text-[clamp(1.65rem,2.8vw,2.5rem)] text-white font-semibold leading-tight">
                  Contemporary residential communities, transparently managed.
                </h2>
                <p className="text-sm sm:text-base text-white/80 leading-relaxed max-w-md">
                  Review your property allocations, allotted square footage, project milestones, documents, and capital ledger statements in one dedicated place.
                </p>
              </div>

              <div className="relative z-10 grid grid-cols-3 gap-4 pt-6 border-t border-white/20 text-xs">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.16em] text-redhill-gold-soft">Developments</p>
                  <p className="text-white font-medium mt-0.5">2 – 5 Acres</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-[0.16em] text-redhill-gold-soft">Architecture</p>
                  <p className="text-white font-medium mt-0.5">12+ Storeys</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-[0.16em] text-redhill-gold-soft">Support</p>
                  <p className="text-white font-medium mt-0.5">Relationship Desk</p>
                </div>
              </div>
            </div>

            {/* Right Column: Minimal Login / Registration / Recovery Form */}
            <div ref={inlineFormRef} className="lg:col-span-6 p-6 sm:p-10 lg:p-14 flex flex-col justify-center bg-white">
              <div className="max-w-md w-full mx-auto">
                <div className="mb-7">
                  <p className="eyebrow text-redhill-gold mb-2">Investor Access</p>
                  <h3 className="font-serif text-2xl sm:text-3xl text-redhill-charcoal font-semibold tracking-tight">
                    {panelHeading.title}
                  </h3>
                  <p className="text-sm text-redhill-muted mt-1.5 leading-relaxed">
                    {panelHeading.sub}
                  </p>
                </div>
                {renderAuthForm('inline')}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================================================================ */}
      {/* PUBLIC PROJECT DETAIL MODAL (Overview, Specs, Gallery, Enquiry)   */}
      {/* ================================================================ */}
      <AnimatePresence>
        {selectedPublicProject && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
            role="dialog"
            aria-modal="true"
            aria-label={selectedPublicProject.name}
          >
            <motion.div
              className="fixed inset-0 bg-redhill-ink/60 backdrop-blur-xs"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedPublicProject(null)}
            />
            <motion.div
              initial={{ opacity: 0, y: 18, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 18, scale: 0.98 }}
              transition={{ duration: reduceMotion ? 0 : 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="relative z-10 w-full max-w-4xl bg-white rounded-xl border border-redhill-line shadow-2xl overflow-hidden my-auto max-h-[90vh] flex flex-col"
            >
              {/* Modal Top Bar */}
              <div className="px-6 py-4 border-b border-redhill-line flex items-center justify-between bg-redhill-ivory shrink-0">
                <div>
                  <span className="eyebrow text-redhill-gold">{selectedPublicProject.location}</span>
                  <h3 className="font-serif text-xl font-semibold text-redhill-charcoal">
                    {selectedPublicProject.name}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedPublicProject(null)}
                  aria-label="Close project details"
                  className="w-9 h-9 rounded-md inline-flex items-center justify-center text-redhill-muted hover:text-redhill-charcoal hover:bg-redhill-sand transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 sm:p-8 overflow-y-auto space-y-6">
                {/* Active Gallery Image */}
                <div className="relative aspect-[16/9] rounded-lg overflow-hidden bg-redhill-sand border border-redhill-line">
                  <img
                    src={selectedPublicProject.gallery[activeGalleryIdx]?.url || selectedPublicProject.image}
                    alt={selectedPublicProject.gallery[activeGalleryIdx]?.title || selectedPublicProject.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-transparent to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-white">
                    <div>
                      <span className="text-[10px] uppercase tracking-[0.18em] text-redhill-gold-soft font-semibold">
                        {selectedPublicProject.gallery[activeGalleryIdx]?.tag || 'Architecture'}
                      </span>
                      <p className="text-sm sm:text-base font-medium">
                        {selectedPublicProject.gallery[activeGalleryIdx]?.title || selectedPublicProject.name}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          setActiveGalleryIdx((prev) =>
                            prev === 0 ? selectedPublicProject.gallery.length - 1 : prev - 1
                          )
                        }
                        aria-label="Previous image"
                        className="w-8 h-8 rounded-full bg-black/55 hover:bg-black/80 text-white flex items-center justify-center cursor-pointer"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setActiveGalleryIdx((prev) =>
                            (prev + 1) % selectedPublicProject.gallery.length
                          )
                        }
                        aria-label="Next image"
                        className="w-8 h-8 rounded-full bg-black/55 hover:bg-black/80 text-white flex items-center justify-center cursor-pointer"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Gallery Thumbnails */}
                <div className="grid grid-cols-4 sm:grid-cols-6 gap-2.5">
                  {selectedPublicProject.gallery.map((item, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setActiveGalleryIdx(i)}
                      className={`relative aspect-[16/10] rounded overflow-hidden border-2 transition-all cursor-pointer ${
                        activeGalleryIdx === i ? 'border-redhill-red' : 'border-transparent opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img src={item.url} alt={item.title} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>

                {/* Project Overview & Specifications */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 pt-2">
                  <div className="md:col-span-7 space-y-3">
                    <p className="eyebrow text-redhill-gold">Development Overview</p>
                    <p className="text-sm text-redhill-charcoal leading-relaxed">
                      {selectedPublicProject.description}
                    </p>
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
                      {selectedPublicProject.highlights.map((h) => (
                        <li key={h} className="flex items-center gap-2 text-xs text-redhill-muted">
                          <CheckCircle2 className="w-3.5 h-3.5 text-redhill-gold shrink-0" />
                          <span>{h}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="md:col-span-5 bg-redhill-ivory border border-redhill-line rounded-lg p-4 space-y-2.5 text-xs">
                    <div className="flex justify-between py-1.5 border-b border-redhill-line">
                      <span className="text-redhill-muted">Location</span>
                      <span className="font-semibold text-redhill-charcoal">{selectedPublicProject.location}</span>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-redhill-line">
                      <span className="text-redhill-muted">Land Area</span>
                      <span className="font-semibold text-redhill-charcoal">{selectedPublicProject.landArea || 'Boutique Enclave'}</span>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-redhill-line">
                      <span className="text-redhill-muted">Building Elevation</span>
                      <span className="font-semibold text-redhill-charcoal">{selectedPublicProject.floors || '12+ Storeys'}</span>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-redhill-line">
                      <span className="text-redhill-muted">Configuration</span>
                      <span className="font-semibold text-redhill-charcoal">{selectedPublicProject.configuration}</span>
                    </div>
                    <div className="flex justify-between py-1.5">
                      <span className="text-redhill-muted">Status</span>
                      <span className="font-semibold text-emerald-800">{selectedPublicProject.statusText || selectedPublicProject.badge}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="px-6 py-4 border-t border-redhill-line bg-redhill-ivory flex flex-wrap items-center justify-between gap-3 shrink-0">
                <span className="text-xs text-redhill-muted">
                  Allocated investors can sign in to view live milestones, approvals and ledger records.
                </span>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => openAccessDrawer('login')}
                    className="btn-primary py-2.5 px-5 text-xs uppercase tracking-[0.14em]"
                  >
                    Access Investor Dossier
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Footer */}
      <footer className="bg-white border-t border-redhill-line py-10">
        <div className="max-w-[1440px] mx-auto px-5 sm:px-8 lg:px-12 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <Logo />
          <p className="text-xs text-redhill-muted">
            © {new Date().getFullYear()} Redhill Infra Pvt Ltd. Contemporary Boutique High-Rise Living · Bengaluru, India.
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
