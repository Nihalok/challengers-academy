import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Lock, LogIn, AlertCircle, ArrowLeft, Eye, EyeOff, Mail, KeyRound, ChevronRight, CheckCircle } from 'lucide-react';
import { useNavigate, NavLink } from 'react-router-dom';
import SectionHeader from './components/SectionHeader';
import SEO from './components/SEO';
import { useAuth } from './hooks/useAuth';

type View = 'login' | 'forgot' | 'sent' | 'reset' | 'reset-success';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

declare global {
  interface Window { google?: any; }
}

export default function Login() {
  const [view, setView] = useState<View>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lockoutTime, setLockoutTime] = useState<number | null>(null);
  const [countdown, setCountdown] = useState(0);
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();

  // Check for reset token in URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('reset');
    if (token) {
      setResetToken(token);
      setView('reset');
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) navigate('/admin');
  }, [isAuthenticated, navigate]);

  // Lockout countdown
  useEffect(() => {
    if (!lockoutTime) return;
    const interval = setInterval(() => {
      const remaining = Math.ceil((lockoutTime - Date.now()) / 1000);
      if (remaining <= 0) { setLockoutTime(null); setCountdown(0); clearInterval(interval); }
      else setCountdown(remaining);
    }, 1000);
    return () => clearInterval(interval);
  }, [lockoutTime]);

  // Google OAuth init
  useEffect(() => {
    if (!GOOGLE_CLIENT_ID || !window.google) return;
    window.google.accounts.id.initialize({
      client_id: GOOGLE_CLIENT_ID,
      callback: handleGoogleCallback,
    });
    const btn = document.getElementById('google-signin-btn');
    if (btn) {
      window.google.accounts.id.renderButton(btn, { theme: 'outline', size: 'large', width: '100%', text: 'continue_with' });
    }
  }, [view]);

  const handleGoogleCallback = async (response: any) => {
    setIsSubmitting(true);
    setError('');
    try {
      const res = await fetch('/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credential: response.credential, rememberMe }),
      });
      const data = await res.json();
      if (data.success && data.token) {
        await login(data.token, rememberMe);
        navigate('/admin');
      } else {
        setError(data.message || 'Google sign-in failed. You may not have admin access.');
      }
    } catch {
      setError('Google sign-in error. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (lockoutTime) return;
    setIsSubmitting(true);
    setError('');
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, rememberMe }),
      });
      const data = await res.json();
      if (data.success && data.token) {
        await login(data.token, rememberMe);
        navigate('/admin');
      } else if (data.lockout) {
        setLockoutTime(Date.now() + data.lockoutMs);
        setCountdown(Math.ceil(data.lockoutMs / 1000));
        setError(data.message || 'Too many failed attempts.');
      } else {
        setError(data.message || 'Invalid credentials. Please try again.');
      }
    } catch {
      setError('Connection error. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (data.success) setView('sent');
      else setError(data.message || 'Failed to send reset email.');
    } catch {
      setError('Connection error. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    setIsSubmitting(true);
    setError('');
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: resetToken, newPassword }),
      });
      const data = await res.json();
      if (data.success) {
        setView('reset-success');
      } else {
        setError(data.message || 'Password reset link is invalid or expired.');
      }
    } catch {
      setError('Connection error. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatCountdown = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return m > 0 ? `${m}m ${sec}s` : `${sec}s`;
  };

  return (
    <div className="relative pt-28 pb-10 md:py-10 bg-ivory min-h-screen flex items-center justify-center overflow-hidden font-sans">
      <SEO
        title="Admin Login"
        description="Administrative access for Challengers Volleyball Academy staff."
      />

      {/* Background Decor */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl">
           <div className="absolute top-10 right-0 w-80 h-80 bg-orange/5 rounded-full blur-[80px]" />
           <div className="absolute bottom-10 left-0 w-80 h-80 bg-espresso/5 rounded-full blur-[80px]" />
        </div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-md mx-auto">

          <AnimatePresence mode="wait">

            {/* LOGIN VIEW */}
            {view === 'login' && (
              <motion.div key="login" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                <div className="mb-4 text-center">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange/10 border border-orange/20 mb-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-orange animate-pulse" />
                    <span className="text-[9px] font-black uppercase tracking-[0.2em] text-orange">Staff Portal</span>
                  </div>
                  <h1 className="text-xl font-condensed font-black text-espresso uppercase tracking-tight">
                    <span className="font-serif italic font-normal text-orange lowercase">admin </span>access only
                  </h1>
                </div>

                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-3xl shadow-xl border border-espresso/5 p-6 md:p-8"
                >
                  <div className="mb-5 text-center">
                    <div className="w-12 h-12 bg-espresso rounded-xl flex items-center justify-center text-white mx-auto mb-3 shadow-md">
                      <Lock className="w-6 h-6" />
                    </div>
                    <h3 className="text-lg font-condensed font-black uppercase text-espresso">Administrative Login</h3>
                    <p className="text-espresso/40 text-[9px] font-black uppercase tracking-widest mt-0.5">Enter your credentials to continue</p>
                  </div>

                  <form onSubmit={handleLogin} className="space-y-3.5">
                    {/* Email */}
                    <div className="space-y-1">
                      <label className="text-[9px] font-black uppercase tracking-widest text-espresso/40 ml-1">Email Address</label>
                      <div className="relative">
                        <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-espresso/30" />
                        <input
                          id="admin-email"
                          type="email"
                          required
                          autoComplete="email"
                          value={email}
                          onChange={e => setEmail(e.target.value)}
                          placeholder="admin@example.com"
                          className="w-full bg-ivory border border-espresso/5 rounded-xl py-3 pl-10 pr-4 outline-none focus:border-orange transition-all font-medium text-xs text-espresso"
                        />
                      </div>
                    </div>

                    {/* Password */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between ml-1">
                        <label className="text-[9px] font-black uppercase tracking-widest text-espresso/40">Password</label>
                        <button
                          type="button"
                          onClick={() => { setView('forgot'); setError(''); }}
                          className="text-orange text-[9px] font-black uppercase tracking-widest hover:text-espresso transition-colors"
                        >
                          Forgot password?
                        </button>
                      </div>
                      <div className="relative">
                        <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-espresso/30" />
                        <input
                          id="admin-password"
                          required
                          type={showPassword ? 'text' : 'password'}
                          value={password}
                          onChange={e => setPassword(e.target.value)}
                          placeholder="••••••••"
                          autoComplete="current-password"
                          className="w-full bg-ivory border border-espresso/5 rounded-xl py-3 pl-10 pr-10 outline-none focus:border-orange transition-all font-medium text-xs text-center tracking-[0.3em]"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-espresso/30 hover:text-espresso/60 transition-colors"
                        >
                          {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>

                    {/* Remember Me */}
                    <label className="flex items-center gap-2.5 cursor-pointer ml-1 pt-0.5">
                      <div
                        onClick={() => setRememberMe(!rememberMe)}
                        className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${rememberMe ? 'bg-orange border-orange' : 'border-espresso/20 bg-ivory'}`}
                      >
                        {rememberMe && <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
                      </div>
                      <span className="text-espresso/50 text-[9px] font-bold uppercase tracking-wider">Remember me for 30 days</span>
                    </label>

                    {/* Error */}
                    <AnimatePresence>
                      {error && (
                        <motion.div
                          initial={{ opacity: 0, y: -5 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0 }}
                          className="bg-red-50 text-red-600 p-3 rounded-xl flex items-start gap-2.5 text-xs font-semibold"
                        >
                          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                          <span>
                            {error}
                            {lockoutTime && countdown > 0 && (
                              <span className="block mt-1 text-red-400 font-black">Try again in {formatCountdown(countdown)}</span>
                            )}
                          </span>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <button
                      id="admin-login-btn"
                      type="submit"
                      disabled={isSubmitting || !!lockoutTime}
                      className="w-full bg-orange text-white py-3.5 rounded-xl font-black uppercase tracking-widest text-[9px] flex items-center justify-center gap-2 hover:bg-espresso transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? (
                        <span className="flex items-center gap-2">
                          <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Verifying...
                        </span>
                      ) : lockoutTime ? (
                        `Locked · ${formatCountdown(countdown)}`
                      ) : (
                        <><LogIn className="w-3.5 h-3.5" /> Authorize Access</>
                      )}
                    </button>
                  </form>

                  {/* Google Sign-In */}
                  <div className="flex items-center gap-3 my-4">
                    <div className="flex-1 h-px bg-espresso/5" />
                    <span className="text-espresso/30 text-[8px] font-black uppercase tracking-widest">or continue with</span>
                    <div className="flex-1 h-px bg-espresso/5" />
                  </div>

                  {GOOGLE_CLIENT_ID ? (
                    <div id="google-signin-btn" className="w-full flex justify-center min-h-[40px]" />
                  ) : (
                    <button
                      type="button"
                      onClick={() => setError('To activate Google Sign-In, add your GOOGLE_CLIENT_ID and VITE_GOOGLE_CLIENT_ID in your .env file.')}
                      className="w-full bg-white border border-espresso/10 hover:border-espresso/20 py-2.5 px-4 rounded-xl flex items-center justify-center gap-2.5 text-espresso/80 text-xs font-bold transition-all shadow-sm hover:shadow"
                    >
                      <svg className="w-4 h-4" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                      </svg>
                      Sign in with Google
                    </button>
                  )}

                  <div className="mt-5 pt-4 border-t border-espresso/5 flex justify-center">
                    <NavLink to="/" className="text-[9px] font-black uppercase tracking-widest text-espresso/40 hover:text-orange transition-colors flex items-center gap-1.5">
                      <ArrowLeft className="w-3 h-3" /> Back to Academy
                    </NavLink>
                  </div>
                </motion.div>
              </motion.div>
            )}

            {/* FORGOT PASSWORD VIEW */}
            {view === 'forgot' && (
              <motion.div key="forgot" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                <div className="mb-4 text-center">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange/10 border border-orange/20 mb-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-orange animate-pulse" />
                    <span className="text-[9px] font-black uppercase tracking-[0.2em] text-orange">Staff Portal</span>
                  </div>
                  <h1 className="text-xl font-condensed font-black text-espresso uppercase tracking-tight">
                    Reset your <span className="font-serif italic font-normal text-orange lowercase">password</span>
                  </h1>
                </div>

                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-3xl shadow-xl border border-espresso/5 p-6 md:p-8"
                >
                  <div className="mb-5 text-center">
                    <div className="w-12 h-12 bg-espresso rounded-xl flex items-center justify-center text-white mx-auto mb-3 shadow-md">
                      <Mail className="w-6 h-6" />
                    </div>
                    <h3 className="text-lg font-condensed font-black uppercase text-espresso">Forgot Password</h3>
                    <p className="text-espresso/40 text-[9px] font-black uppercase tracking-widest mt-0.5">Enter your admin email to receive a reset link</p>
                  </div>

                  <form onSubmit={handleForgotPassword} className="space-y-3.5">
                    <div className="space-y-1">
                      <label className="text-[9px] font-black uppercase tracking-widest text-espresso/40 ml-1">Email Address</label>
                      <div className="relative">
                        <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-espresso/30" />
                        <input
                          id="forgot-email"
                          type="email"
                          required
                          value={email}
                          onChange={e => setEmail(e.target.value)}
                          placeholder="admin@example.com"
                          className="w-full bg-ivory border border-espresso/5 rounded-xl py-3 pl-10 pr-4 outline-none focus:border-orange transition-all font-medium text-xs text-espresso"
                        />
                      </div>
                    </div>

                    <AnimatePresence>
                      {error && (
                        <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                          className="bg-red-50 text-red-600 p-3 rounded-xl flex items-center gap-2.5 text-xs font-semibold">
                          <AlertCircle className="w-4 h-4 shrink-0" />{error}
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <button
                      id="forgot-submit-btn"
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full bg-orange text-white py-3.5 rounded-xl font-black uppercase tracking-widest text-[9px] flex items-center justify-center gap-2 hover:bg-espresso transition-all shadow-md disabled:opacity-50"
                    >
                      {isSubmitting ? (
                        <span className="flex items-center gap-2">
                          <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Sending...
                        </span>
                      ) : (
                        <><ChevronRight className="w-3.5 h-3.5" /> Send Reset Link</>
                      )}
                    </button>
                  </form>

                  <div className="mt-5 pt-4 border-t border-espresso/5 flex justify-center">
                    <button
                      onClick={() => { setView('login'); setError(''); }}
                      className="text-[9px] font-black uppercase tracking-widest text-espresso/40 hover:text-orange transition-colors flex items-center gap-1.5"
                    >
                      <ArrowLeft className="w-3 h-3" /> Back to Login
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            )}

            {/* EMAIL SENT VIEW */}
            {view === 'sent' && (
              <motion.div key="sent" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                <div className="mb-4 text-center">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-50 border border-green-200 mb-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                    <span className="text-[9px] font-black uppercase tracking-[0.2em] text-green-600">Verification Sent</span>
                  </div>
                  <h1 className="text-xl font-condensed font-black text-espresso uppercase tracking-tight">
                    Check your <span className="font-serif italic font-normal text-orange lowercase">email</span>
                  </h1>
                </div>

                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-3xl shadow-xl border border-espresso/5 p-6 md:p-8 text-center"
                >
                  <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center mx-auto mb-3 shadow-sm">
                    <CheckCircle className="w-6 h-6 text-green-500" />
                  </div>
                  <h3 className="text-lg font-condensed font-black uppercase text-espresso mb-1">Reset Link Sent</h3>
                  <p className="text-espresso/60 text-xs mb-1">
                    If <span className="font-bold text-espresso">{email}</span> is a registered admin account, a password reset link has been sent.
                  </p>
                  <p className="text-espresso/40 text-[9px] font-black uppercase tracking-widest mb-6">Check your inbox and spam folder</p>

                  <div className="pt-4 border-t border-espresso/5 flex justify-center">
                    <button
                      onClick={() => { setView('login'); setError(''); }}
                      className="text-[9px] font-black uppercase tracking-widest text-espresso/40 hover:text-orange transition-colors flex items-center gap-1.5"
                    >
                      <ArrowLeft className="w-3 h-3" /> Back to Login
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            )}

            {/* RESET PASSWORD VIEW */}
            {view === 'reset' && (
              <motion.div key="reset" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                <div className="mb-4 text-center">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange/10 border border-orange/20 mb-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-orange" />
                    <span className="text-[9px] font-black uppercase tracking-[0.2em] text-orange">Security</span>
                  </div>
                  <h1 className="text-xl font-condensed font-black text-espresso uppercase tracking-tight">
                    Set <span className="font-serif italic font-normal text-orange lowercase">new </span>password
                  </h1>
                </div>

                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-3xl shadow-xl border border-espresso/5 p-6 md:p-8"
                >
                  <div className="mb-5 text-center">
                    <div className="w-12 h-12 bg-orange/10 rounded-xl flex items-center justify-center text-orange mx-auto mb-3">
                      <KeyRound className="w-6 h-6" />
                    </div>
                    <h3 className="text-lg font-condensed font-black uppercase text-espresso">New Password</h3>
                    <p className="text-espresso/40 text-[9px] font-black uppercase tracking-widest mt-0.5">Create a new secure password for your account</p>
                  </div>

                  <form onSubmit={handleResetPassword} className="space-y-3.5">
                    <div className="space-y-1">
                      <label className="text-[9px] font-black uppercase tracking-widest text-espresso/40 ml-1">New Password</label>
                      <div className="relative">
                        <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-espresso/30" />
                        <input
                          id="new-password"
                          required
                          type={showPassword ? 'text' : 'password'}
                          value={newPassword}
                          onChange={e => setNewPassword(e.target.value)}
                          placeholder="••••••••"
                          className="w-full bg-ivory border border-espresso/5 rounded-xl py-3 pl-10 pr-10 outline-none focus:border-orange transition-all font-medium text-xs text-center tracking-[0.3em]"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-espresso/30 hover:text-espresso/60 transition-colors"
                        >
                          {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[9px] font-black uppercase tracking-widest text-espresso/40 ml-1">Confirm Password</label>
                      <div className="relative">
                        <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-espresso/30" />
                        <input
                          id="confirm-password"
                          required
                          type={showPassword ? 'text' : 'password'}
                          value={confirmPassword}
                          onChange={e => setConfirmPassword(e.target.value)}
                          placeholder="••••••••"
                          className="w-full bg-ivory border border-espresso/5 rounded-xl py-3 pl-10 pr-4 outline-none focus:border-orange transition-all font-medium text-xs text-center tracking-[0.3em]"
                        />
                      </div>
                    </div>

                    <AnimatePresence>
                      {error && (
                        <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                          className="bg-red-50 text-red-600 p-3 rounded-xl flex items-center gap-2.5 text-xs font-semibold">
                          <AlertCircle className="w-4 h-4 shrink-0" />{error}
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <button
                      id="reset-submit-btn"
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full bg-orange text-white py-3.5 rounded-xl font-black uppercase tracking-widest text-[9px] flex items-center justify-center gap-2 hover:bg-espresso transition-all shadow-md disabled:opacity-50"
                    >
                      {isSubmitting ? (
                        <span className="flex items-center gap-2">
                          <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Updating Password...
                        </span>
                      ) : (
                        <><CheckCircle className="w-3.5 h-3.5" /> Save New Password</>
                      )}
                    </button>
                  </form>

                  <div className="mt-5 pt-4 border-t border-espresso/5 flex justify-center">
                    <button
                      onClick={() => { setView('login'); setError(''); }}
                      className="text-[9px] font-black uppercase tracking-widest text-espresso/40 hover:text-orange transition-colors flex items-center gap-1.5"
                    >
                      <ArrowLeft className="w-3 h-3" /> Back to Login
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            )}

            {/* RESET SUCCESS VIEW */}
            {view === 'reset-success' && (
              <motion.div key="reset-success" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                <div className="mb-4 text-center">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-50 border border-green-200 mb-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                    <span className="text-[9px] font-black uppercase tracking-[0.2em] text-green-600">Success</span>
                  </div>
                  <h1 className="text-xl font-condensed font-black text-espresso uppercase tracking-tight">
                    Password <span className="font-serif italic font-normal text-green-600 lowercase">updated</span>
                  </h1>
                </div>

                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-3xl shadow-xl border border-espresso/5 p-6 md:p-8 text-center"
                >
                  <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center mx-auto mb-3 shadow-sm">
                    <CheckCircle className="w-6 h-6 text-green-500" />
                  </div>
                  <h3 className="text-lg font-condensed font-black uppercase text-espresso mb-1">Password Changed</h3>
                  <p className="text-espresso/60 text-xs mb-6">
                    Your password has been successfully updated. You can now log in with your new password.
                  </p>

                  <button
                    onClick={() => { setView('login'); setError(''); }}
                    className="w-full bg-orange text-white py-3.5 rounded-xl font-black uppercase tracking-widest text-[9px] flex items-center justify-center gap-2 hover:bg-espresso transition-all shadow-md"
                  >
                    <LogIn className="w-3.5 h-3.5" /> Go to Login
                  </button>
                </motion.div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
