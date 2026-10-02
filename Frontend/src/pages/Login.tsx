import React, { useState, useEffect, useRef } from 'react';
import { User } from '../types';
import { 
  Lock, 
  Mail, 
  ArrowRight, 
  ArrowLeft, 
  User as UserIcon, 
  Phone, 
  Eye, 
  EyeOff, 
  KeyRound, 
  ShieldCheck, 
  RotateCcw,
  CheckCircle2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Logo from '../components/Logo';
import { apiFetch } from '../api/client';

type AuthMode = 'login' | 'signup' | 'forgot_request' | 'forgot_reset';

interface LoginProps {
  onLogin: (user: User) => void;
}

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
  const [bgLoaded, setBgLoaded] = useState(false);

  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);

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

  // Handle Login / Signup submit
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
        onLogin(user);
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

  // Handle Requesting OTP
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
        setResendTimer(45); // 45 seconds countdown
        setOtpDigits(['', '', '', '', '', '']);
        // Focus first OTP input box after transition
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

  // Handle Reset Password Submit
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

  // Helper for OTP individual box typing
  const handleOtpChange = (index: number, val: string) => {
    const cleanVal = val.replace(/\D/g, '');
    
    // Handle paste event of multi-character code
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

    // Auto-advance
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

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-redhill-dark">
      {/* Background Image with Placeholder Gradient + Fade-in */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-[#1a1e2e] via-[#2a2d3d] to-[#1c2030]" />
        <img 
          src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2070&auto=format&fit=crop" 
          alt="Infrastructure" 
          referrerPolicy="no-referrer"
          onLoad={() => setBgLoaded(true)}
          className={`w-full h-full object-cover opacity-40 transition-opacity duration-700 ${bgLoaded ? 'opacity-40' : 'opacity-0'}`}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-redhill-dark/80 to-redhill-red/20" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-md p-8 mx-4"
      >
        <div className="bg-redhill-gray/95 backdrop-blur-xl rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] p-8 border border-white/[0.08] relative overflow-hidden">
          {/* Subtle gold decoration bar */}
          <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-redhill-red via-[#D4AF37] to-amber-500" />
          
          <div className="flex flex-col items-center mb-6">
            <Logo className="mb-4 scale-125" light={true} />
            <p className="text-gray-400 mt-2 font-medium tracking-wide text-sm">Investor Portal Access</p>
          </div>

          {/* Tab buttons for Login / Sign Up (only on login/signup mode) */}
          {(authMode === 'login' || authMode === 'signup') && (
            <div className="flex p-1 bg-black/40 border border-white/[0.06] rounded-xl mb-6">
              <button
                type="button"
                onClick={() => { setAuthMode('login'); setError(''); setSuccessMsg(''); }}
                className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all cursor-pointer ${authMode === 'login' ? 'bg-redhill-red text-white shadow-lg shadow-redhill-red/25' : 'text-gray-400 hover:text-white'}`}
              >
                Log In
              </button>
              <button
                type="button"
                onClick={() => { setAuthMode('signup'); setError(''); setSuccessMsg(''); }}
                className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all cursor-pointer ${authMode === 'signup' ? 'bg-redhill-red text-white shadow-lg shadow-redhill-red/25' : 'text-gray-400 hover:text-white'}`}
              >
                Sign Up
              </button>
            </div>
          )}

          {/* VIEW 1 & 2: LOGIN OR SIGNUP */}
          {(authMode === 'login' || authMode === 'signup') && (
            <form onSubmit={handleAuthSubmit} className="space-y-5">
              <AnimatePresence mode="popLayout">
                {authMode === 'signup' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-5 overflow-hidden"
                  >
                    <div>
                      <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Full Name</label>
                      <div className="relative">
                        <UserIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
                        <input 
                          type="text" 
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="w-full pl-11 pr-4 py-3.5 bg-white/[0.04] border border-white/[0.08] text-white placeholder-gray-600 rounded-xl focus:bg-white/[0.06] focus:ring-2 focus:ring-redhill-red/20 focus:border-redhill-red/50 transition-all outline-none"
                          placeholder="John Doe"
                          required={authMode === 'signup'}
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Phone Number</label>
                      <div className="relative">
                        <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
                        <input 
                          type="tel" 
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          className="w-full pl-11 pr-4 py-3.5 bg-white/[0.04] border border-white/[0.08] text-white placeholder-gray-600 rounded-xl focus:bg-white/[0.06] focus:ring-2 focus:ring-redhill-red/20 focus:border-redhill-red/50 transition-all outline-none"
                          placeholder="+91 98765 43210"
                          required={authMode === 'signup'}
                        />
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                  {authMode === 'login' ? 'Email, Login ID or Phone Number' : 'Email Address'}
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
                  <input 
                    type="text" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-11 pr-4 py-3.5 bg-white/[0.04] border border-white/[0.08] text-white placeholder-gray-600 rounded-xl focus:bg-white/[0.06] focus:ring-2 focus:ring-redhill-red/20 focus:border-redhill-red/50 transition-all outline-none"
                    placeholder={authMode === 'login' ? 'name@example.com, jo210 or +91...' : 'name@example.com'}
                    required
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider">Password</label>
                  {authMode === 'login' && (
                    <button
                      type="button"
                      onClick={switchToForgot}
                      className="text-xs font-semibold text-red-400 hover:text-red-300 transition-colors cursor-pointer hover:underline"
                    >
                      Forgot Password?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
                  <input 
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-11 pr-12 py-3.5 bg-white/[0.04] border border-white/[0.08] text-white placeholder-gray-600 rounded-xl focus:bg-white/[0.06] focus:ring-2 focus:ring-redhill-red/20 focus:border-redhill-red/50 transition-all outline-none"
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors cursor-pointer p-1"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {error && (
                <motion.div 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="p-3.5 bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-xl font-medium"
                >
                  {error}
                </motion.div>
              )}

              {successMsg && (
                <motion.div 
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-3.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm rounded-xl font-medium flex items-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{successMsg}</span>
                </motion.div>
              )}

              <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-redhill-red hover:bg-red-700 text-white font-bold py-3.5 px-4 rounded-xl shadow-lg shadow-redhill-red/30 transition-all flex items-center justify-center gap-2 group disabled:opacity-70 mt-4 cursor-pointer"
              >
                {loading ? (authMode === 'login' ? 'Authenticating...' : 'Registering...') : (
                  <>
                    {authMode === 'login' ? 'Secure Login' : 'Create Account'}
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* VIEW 3: FORGOT PASSWORD - REQUEST OTP */}
          {authMode === 'forgot_request' && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-5"
            >
              <div className="text-center mb-2">
                <div className="w-12 h-12 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center justify-center mx-auto mb-3 text-red-400 shadow-inner">
                  <KeyRound className="w-6 h-6" />
                </div>
                <h2 className="text-lg font-bold text-white">Reset Your Password</h2>
                <p className="text-xs text-gray-400 mt-1 max-w-xs mx-auto">
                  Enter your registered email, Login ID, or phone number to receive a 6-digit verification code.
                </p>
              </div>

              <form onSubmit={handleRequestOtp} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                    Account Identifier
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
                    <input 
                      type="text" 
                      value={forgotIdentifier}
                      onChange={(e) => setForgotIdentifier(e.target.value)}
                      className="w-full pl-11 pr-4 py-3.5 bg-white/[0.04] border border-white/[0.08] text-white placeholder-gray-600 rounded-xl focus:bg-white/[0.06] focus:ring-2 focus:ring-redhill-red/20 focus:border-redhill-red/50 transition-all outline-none"
                      placeholder="Email, Login ID or phone number"
                      autoFocus
                      required
                    />
                  </div>
                </div>

                {error && (
                  <motion.div 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="p-3.5 bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-xl font-medium"
                  >
                    {error}
                  </motion.div>
                )}

                <button 
                  type="submit" 
                  disabled={loading}
                  className="w-full bg-redhill-red hover:bg-red-700 text-white font-bold py-3.5 px-4 rounded-xl shadow-lg shadow-redhill-red/30 transition-all flex items-center justify-center gap-2 group disabled:opacity-70 cursor-pointer"
                >
                  {loading ? 'Sending Code...' : (
                    <>
                      <span>Send Verification Code</span>
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={switchToLogin}
                  className="w-full py-2.5 text-sm text-gray-400 hover:text-white transition-colors flex items-center justify-center gap-1.5 cursor-pointer font-medium"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back to Login</span>
                </button>
              </form>
            </motion.div>
          )}

          {/* VIEW 4: FORGOT PASSWORD - VERIFY OTP & RESET PASSWORD */}
          {authMode === 'forgot_reset' && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-5"
            >
              <div className="text-center mb-1">
                <div className="w-12 h-12 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center justify-center mx-auto mb-3 text-emerald-400 shadow-inner">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h2 className="text-lg font-bold text-white">Enter Verification Code</h2>
                <p className="text-xs text-gray-400 mt-1 max-w-xs mx-auto">
                  We sent a 6-digit OTP code to <strong className="text-gray-200">{maskedEmail || targetEmail}</strong>
                </p>
              </div>

              <form onSubmit={handleResetPasswordSubmit} className="space-y-4">
                {/* 6-Digit OTP Box Grid */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider">
                      6-Digit OTP Code
                    </label>
                    <button
                      type="button"
                      disabled={resendTimer > 0 || loading}
                      onClick={() => handleRequestOtp()}
                      className="text-xs font-semibold text-red-400 hover:text-red-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center gap-1"
                    >
                      <RotateCcw className={`w-3 h-3 ${resendTimer > 0 ? '' : 'hover:rotate-180 transition-transform'}`} />
                      {resendTimer > 0 ? `Resend in ${resendTimer}s` : 'Resend Code'}
                    </button>
                  </div>

                  <div className="flex gap-2 justify-between">
                    {otpDigits.map((digit, idx) => (
                      <input
                        key={idx}
                        ref={(el) => { otpInputRefs.current[idx] = el; }}
                        type="text"
                        inputMode="numeric"
                        maxLength={6}
                        value={digit}
                        onChange={(e) => handleOtpChange(idx, e.target.value)}
                        onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                        className="w-11 h-13 text-center text-xl font-bold font-mono bg-white/[0.04] border border-white/[0.1] text-white rounded-xl focus:bg-white/[0.08] focus:border-redhill-red focus:ring-2 focus:ring-redhill-red/25 transition-all outline-none"
                      />
                    ))}
                  </div>
                </div>

                {/* New Password */}
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">New Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
                    <input 
                      type={showNewPassword ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full pl-11 pr-12 py-3.5 bg-white/[0.04] border border-white/[0.08] text-white placeholder-gray-600 rounded-xl focus:bg-white/[0.06] focus:ring-2 focus:ring-redhill-red/20 focus:border-redhill-red/50 transition-all outline-none"
                      placeholder="At least 4 characters"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors cursor-pointer p-1"
                      tabIndex={-1}
                    >
                      {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Confirm New Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
                    <input 
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full pl-11 pr-12 py-3.5 bg-white/[0.04] border border-white/[0.08] text-white placeholder-gray-600 rounded-xl focus:bg-white/[0.06] focus:ring-2 focus:ring-redhill-red/20 focus:border-redhill-red/50 transition-all outline-none"
                      placeholder="Re-type new password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors cursor-pointer p-1"
                      tabIndex={-1}
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {error && (
                  <motion.div 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="p-3.5 bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-xl font-medium"
                  >
                    {error}
                  </motion.div>
                )}

                {successMsg && (
                  <motion.div 
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-3.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm rounded-xl font-medium flex items-center gap-2"
                  >
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>{successMsg}</span>
                  </motion.div>
                )}

                <button 
                  type="submit" 
                  disabled={loading}
                  className="w-full bg-redhill-red hover:bg-red-700 text-white font-bold py-3.5 px-4 rounded-xl shadow-lg shadow-redhill-red/30 transition-all flex items-center justify-center gap-2 group disabled:opacity-70 cursor-pointer"
                >
                  {loading ? 'Updating Password...' : (
                    <>
                      <span>Reset Password & Login</span>
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>

                <div className="flex items-center justify-between pt-1">
                  <button
                    type="button"
                    onClick={() => { setAuthMode('forgot_request'); setError(''); }}
                    className="text-xs text-gray-400 hover:text-gray-200 transition-colors cursor-pointer font-medium"
                  >
                    ← Change Email / ID
                  </button>
                  <button
                    type="button"
                    onClick={switchToLogin}
                    className="text-xs text-red-400 hover:text-red-300 transition-colors cursor-pointer font-medium"
                  >
                    Back to Login
                  </button>
                </div>
              </form>
            </motion.div>
          )}

        </div>
      </motion.div>
    </div>
  );
}

