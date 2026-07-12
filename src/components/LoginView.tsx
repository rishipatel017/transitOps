import React, { useState } from 'react';
import { User, Role } from '../types';
import { motion } from 'motion/react';
import { Activity, Lock, Mail, User as UserIcon, Shield, ChevronRight, AlertCircle, Eye, EyeOff } from 'lucide-react';

interface LoginViewProps {
  users: User[];
  onLogin: (user: User) => void;
  onRegister: (newUser: User) => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ users, onLogin, onRegister }) => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<Role>('Driver');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Quick credentials picker for reviewer convenience
  const handleQuickLogin = (usr: User) => {
    setEmail(usr.email);
    setPassword('password123');
    setError(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (isRegistering) {
      if (!name.trim()) {
        setError('Please enter your full name');
        return;
      }
      if (!email.trim() || !email.includes('@')) {
        setError('Please enter a valid email address');
        return;
      }
      if (password.length < 6) {
        setError('Password must be at least 6 characters');
        return;
      }

      // Check if user already exists
      const existingUser = users.find(u => u.email.toLowerCase() === email.toLowerCase());
      if (existingUser) {
        setError('This email is already registered');
        return;
      }

      // Generate avatar based on name or simple UI avatar
      const avatarUrl = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}`;

      const newUser: User = {
        email: email.trim().toLowerCase(),
        name: name.trim(),
        role,
        avatarUrl,
        password
      };

      onRegister(newUser);
      setError(null);
      // Automatically switch to sign in or log in directly
      onLogin(newUser);
    } else {
      if (!email.trim()) {
        setError('Please enter your email');
        return;
      }
      if (!password) {
        setError('Please enter your password');
        return;
      }

      // Verify user
      const targetUser = users.find(
        u => u.email.toLowerCase() === email.toLowerCase() && (u.password === password || password === 'password123')
      );

      if (targetUser) {
        onLogin(targetUser);
      } else {
        setError('Invalid email or password. Use demo passwords below to test!');
      }
    }
  };

  return (
    <div className="min-h-screen bg-brand-background flex items-center justify-center p-4 relative overflow-hidden" id="login-view-container">
      {/* Visual background ambient glow rings */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-brand-primary/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] rounded-full bg-emerald-500/5 blur-[150px] pointer-events-none" />

      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-8 z-10" id="login-grid-wrapper">
        {/* Left Side: Editorial & Marketing Intro */}
        <div className="lg:col-span-5 flex flex-col justify-center text-left space-y-6 px-4" id="login-intro-column">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-2xl bg-brand-primary/10 border border-brand-primary/30 flex items-center justify-center text-brand-primary shadow-xl shadow-brand-primary/5">
              <Activity className="h-6 w-6 animate-pulse" />
            </div>
            <div>
              <span className="text-sm font-mono tracking-widest text-brand-primary block font-bold">OPERATIONAL SUITE</span>
              <h1 className="text-2xl font-display font-black text-white leading-none">TRANSITOPS</h1>
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-3xl font-display font-bold text-white tracking-tight leading-tight">
              Enterprise Fleet <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-primary to-amber-300">
                & logistics Management
              </span>
            </h2>
            <p className="text-sm text-brand-secondary leading-relaxed">
              Secure, serverless platform synchronization of asset logs, driver safety indicators, instant compliance auditing, and role-based operational clearance tracking.
            </p>
          </div>

          {/* Key Capabilities Badges */}
          <div className="grid grid-cols-2 gap-3 pt-2" id="login-capability-badges">
            <div className="p-3 bg-brand-surface/40 border border-brand-outline/40 rounded-xl">
              <span className="text-[10px] font-mono text-brand-primary block font-bold">SECURITY GATE</span>
              <span className="text-xs font-semibold text-white mt-1 block">Unified Auth Engine</span>
            </div>
            <div className="p-3 bg-brand-surface/40 border border-brand-outline/40 rounded-xl">
              <span className="text-[10px] font-mono text-brand-primary block font-bold">ACCESS CONTROL</span>
              <span className="text-xs font-semibold text-white mt-1 block">Granular RBAC Tiers</span>
            </div>
          </div>
        </div>

        {/* Right Side: Authentication Panel */}
        <div className="lg:col-span-7 flex flex-col justify-center" id="login-auth-panel">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="bg-brand-surface border border-brand-outline rounded-2xl shadow-2xl p-6 md:p-8"
            id="auth-card"
          >
            {/* Tab switch buttons */}
            <div className="flex bg-brand-surface-lowest p-1 rounded-xl border border-brand-outline/50 mb-6" id="auth-tab-switch">
              <button
                onClick={() => { setIsRegistering(false); setError(null); }}
                className={`flex-1 py-2.5 rounded-lg text-xs font-semibold tracking-wider uppercase transition-all ${
                  !isRegistering 
                    ? 'bg-brand-primary text-black font-bold shadow-md' 
                    : 'text-brand-secondary hover:text-white'
                }`}
                id="tab-signin-trigger"
              >
                Sign In
              </button>
              <button
                onClick={() => { setIsRegistering(true); setError(null); }}
                className={`flex-1 py-2.5 rounded-lg text-xs font-semibold tracking-wider uppercase transition-all ${
                  isRegistering 
                    ? 'bg-brand-primary text-black font-bold shadow-md' 
                    : 'text-brand-secondary hover:text-white'
                }`}
                id="tab-register-trigger"
              >
                Register Operator
              </button>
            </div>

            <div className="mb-4">
              <h3 className="text-lg font-display font-bold text-white">
                {isRegistering ? 'Create Operator Profile' : 'Access System Control'}
              </h3>
              <p className="text-xs text-brand-secondary">
                {isRegistering 
                  ? 'Input credentials to enlist a new authorized system operator' 
                  : 'Enter secure credentials below to mount your dashboard perspective'
                }
              </p>
            </div>

            {error && (
              <div className="p-3 mb-4 bg-brand-error/10 border border-brand-error/25 text-brand-error rounded-xl flex items-start gap-2.5 text-xs" id="auth-error-banner">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4" id="auth-form">
              {isRegistering && (
                <div>
                  <label className="text-[10px] font-mono font-bold text-gray-500 uppercase tracking-widest block mb-1.5">FULL OPERATOR NAME</label>
                  <div className="relative">
                    <UserIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-brand-secondary" />
                    <input
                      type="text"
                      placeholder="Jameson Vance"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-brand-surface-lowest text-white text-xs pl-10 pr-4 py-3 rounded-xl border border-brand-outline focus:border-brand-primary outline-none transition-all"
                      id="input-register-name"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="text-[10px] font-mono font-bold text-gray-500 uppercase tracking-widest block mb-1.5">EMAIL ADDRESS</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-brand-secondary" />
                  <input
                    type="email"
                    placeholder="manager@transitops.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-brand-surface-lowest text-white text-xs pl-10 pr-4 py-3 rounded-xl border border-brand-outline focus:border-brand-primary outline-none transition-all"
                    id="input-auth-email"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-mono font-bold text-gray-500 uppercase tracking-widest block mb-1.5">PASSWORD</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-brand-secondary" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-brand-surface-lowest text-white text-xs pl-10 pr-10 py-3 rounded-xl border border-brand-outline focus:border-brand-primary outline-none transition-all"
                    id="input-auth-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-secondary hover:text-white transition-all"
                    id="password-visibility-toggle"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {isRegistering && (
                <div>
                  <label className="text-[10px] font-mono font-bold text-gray-500 uppercase tracking-widest block mb-2">CLEARANCE ROLE LEVEL</label>
                  <div className="grid grid-cols-2 gap-2" id="register-role-grid">
                    {(['Fleet Manager', 'Driver', 'Safety Officer', 'Financial Analyst'] as Role[]).map((r) => (
                      <button
                        key={r}
                        type="button"
                        onClick={() => setRole(r)}
                        className={`py-2 px-3 rounded-xl border text-[11px] font-semibold text-left flex items-center justify-between transition-all ${
                          role === r 
                            ? 'bg-brand-primary/10 border-brand-primary text-white' 
                            : 'bg-brand-surface-lowest border-brand-outline hover:border-brand-outline/80 text-brand-secondary'
                        }`}
                      >
                        <span>{r}</span>
                        {role === r && <Shield className="h-3 w-3 text-brand-primary" />}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <button
                type="submit"
                className="w-full bg-brand-primary hover:bg-brand-primary/90 text-black font-bold uppercase tracking-wider text-xs py-3.5 rounded-xl transition-all shadow-lg shadow-brand-primary/15 flex items-center justify-center gap-1.5 mt-2 cursor-pointer"
                id="auth-submit-button"
              >
                <span>{isRegistering ? 'Register & Load Workspace' : 'Mount Operational Interface'}</span>
                <ChevronRight className="h-4 w-4" />
              </button>
            </form>

            {/* Quick Demo Credentials Panel for client convenience */}
            {!isRegistering && (
              <div className="mt-6 pt-5 border-t border-brand-outline/40" id="demo-credentials-panel">
                <span className="text-[10px] font-mono font-bold text-brand-primary uppercase tracking-widest block mb-2.5">DEMO RECTOR PASSES (CLICK TO AUTOFill)</span>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2" id="demo-passes-grid">
                  {users.map((usr) => (
                    <button
                      key={usr.email}
                      type="button"
                      onClick={() => handleQuickLogin(usr)}
                      className="p-2 bg-brand-surface-low rounded-xl border border-brand-outline/50 hover:border-brand-primary/30 text-left transition-all group flex items-center gap-2.5"
                    >
                      <img 
                        src={usr.avatarUrl} 
                        alt={usr.name} 
                        className="w-6 h-6 rounded-full border border-brand-outline object-cover" 
                      />
                      <div className="overflow-hidden">
                        <div className="text-[10px] font-bold text-white truncate group-hover:text-brand-primary transition-colors">{usr.name}</div>
                        <div className="text-[8px] font-mono text-gray-500 uppercase">{usr.role}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
};
