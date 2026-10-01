import React, { useState } from 'react';
import { User } from '../types';
import { Lock, Mail, ArrowRight, User as UserIcon, Phone, Eye, EyeOff } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Logo from '../components/Logo';
import { apiFetch } from '../api/client';

interface LoginProps {
  onLogin: (user: User) => void;
}

export default function Login({ onLogin }: LoginProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [bgLoaded, setBgLoaded] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
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
      console.error('Login request failed:', err);
      setError(err?.message || 'Something went wrong. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-redhill-dark">
      {/* Background Image with Placeholder Gradient + Fade-in */}
      <div className="absolute inset-0 z-0">
        {/* Placeholder gradient that matches the image tones */}
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

          <div className="flex p-1 bg-black/40 border border-white/[0.06] rounded-xl mb-6">
            <button
              onClick={() => { setIsLogin(true); setError(''); }}
              className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all cursor-pointer ${isLogin ? 'bg-redhill-red text-white shadow-lg shadow-redhill-red/25' : 'text-gray-400 hover:text-white'}`}
            >
              Log In
            </button>
            <button
              onClick={() => { setIsLogin(false); setError(''); }}
              className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all cursor-pointer ${!isLogin ? 'bg-redhill-red text-white shadow-lg shadow-redhill-red/25' : 'text-gray-400 hover:text-white'}`}
            >
              Sign Up
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <AnimatePresence mode="popLayout">
              {!isLogin && (
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
                        required={!isLogin}
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
                        required={!isLogin}
                      />
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                {isLogin ? 'Email, Login ID or Phone Number' : 'Email Address'}
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
                <input 
                  type="text" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-11 pr-4 py-3.5 bg-white/[0.04] border border-white/[0.08] text-white placeholder-gray-600 rounded-xl focus:bg-white/[0.06] focus:ring-2 focus:ring-redhill-red/20 focus:border-redhill-red/50 transition-all outline-none"
                  placeholder={isLogin ? 'name@example.com, jo210 or +91...' : 'name@example.com'}
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Password</label>
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

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-redhill-red hover:bg-red-700 text-white font-bold py-3.5 px-4 rounded-xl shadow-lg shadow-redhill-red/30 transition-all flex items-center justify-center gap-2 group disabled:opacity-70 mt-4 cursor-pointer"
            >
              {loading ? (isLogin ? 'Authenticating...' : 'Registering...') : (
                <>
                  {isLogin ? 'Secure Login' : 'Create Account'}
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
