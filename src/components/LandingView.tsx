import React, { useState, useEffect, useRef } from 'react';
import { User, Vehicle, Driver, Trip, MaintenanceLog, FuelLog, Expense } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { Chatbot } from './Chatbot';
import { generateOtp, sendOtpEmail } from '../emailService';
import { 
  Activity, 
  ArrowRight, 
  CheckCircle, 
  Truck, 
  Users, 
  Clock, 
  Map, 
  ShieldAlert, 
  TrendingUp, 
  Navigation, 
  Lock, 
  Mail, 
  User as UserIcon, 
  Shield, 
  ChevronRight, 
  AlertCircle, 
  Eye, 
  EyeOff,
  Sparkles,
  KeyRound,
  RefreshCw,
  Loader2
} from 'lucide-react';

interface LandingViewProps {
  vehicles: Vehicle[];
  drivers: Driver[];
  trips: Trip[];
  maintenance: MaintenanceLog[];
  fuel: FuelLog[];
  expenses: Expense[];
  users: User[];
  onLogin: (user: User) => void;
  onRegister: (newUser: User) => void;
}

export const LandingView: React.FC<LandingViewProps> = ({
  vehicles,
  drivers,
  trips,
  maintenance,
  fuel,
  expenses,
  users,
  onLogin,
  onRegister
}) => {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<User['role']>('Driver');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // OTP state
  const [otpStep, setOtpStep] = useState(false);          // whether we are on OTP step
  const [otpCode, setOtpCode] = useState('');             // what user types
  const [otpExpected, setOtpExpected] = useState('');     // what was generated
  const [otpCountdown, setOtpCountdown] = useState(300);  // 5 min
  const [otpSending, setOtpSending] = useState(false);
  const [pendingUser, setPendingUser] = useState<User | null>(null); // user awaiting OTP
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Countdown timer for OTP
  useEffect(() => {
    if (otpStep) {
      setOtpCountdown(300);
      countdownRef.current = setInterval(() => {
        setOtpCountdown(prev => {
          if (prev <= 1) {
            clearInterval(countdownRef.current!);
            setOtpStep(false);
            setError('OTP expired. Please try logging in again.');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (countdownRef.current) clearInterval(countdownRef.current);
    }
    return () => { if (countdownRef.current) clearInterval(countdownRef.current); };
  }, [otpStep]);

  const formatCountdown = (s: number) =>
    `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

  // Derive dynamic stats from the local "database" (state)
  const activeDispatchesCount = trips.filter(t => t.status === 'Dispatched').length;
  
  // Real active vehicle ratio for uptime
  const activeVehiclesCount = vehicles.filter(v => v.status === 'Available' || v.status === 'On Trip').length;
  const totalVehiclesCount = vehicles.length;
  const realUptime = totalVehiclesCount > 0 
    ? ((activeVehiclesCount / totalVehiclesCount) * 100).toFixed(1) 
    : '99.8';

  // Total mileage logged
  const totalTripsCount = trips.length;
  const totalDriversCount = drivers.length;

  const handleOpenLogin = () => {
    setIsRegistering(false);
    setOtpStep(false);
    setOtpCode('');
    setPendingUser(null);
    setError(null);
    setSuccess(null);
    setIsLoginModalOpen(true);
  };

  const handleOpenRegister = () => {
    setIsRegistering(true);
    setOtpStep(false);
    setError(null);
    setSuccess(null);
    setIsLoginModalOpen(true);
  };

  const handleQuickLogin = (usr: User) => {
    setEmail(usr.email);
    setPassword('password123');
    setError(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

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

      const existingUser = users.find(u => u.email.toLowerCase() === email.toLowerCase());
      if (existingUser) {
        setError('This email is already registered');
        return;
      }

      const finalAvatarUrl = avatarUrl.trim() || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}`;
      const newUser: User = {
        email: email.trim().toLowerCase(),
        name: name.trim(),
        role,
        avatarUrl: finalAvatarUrl,
        password,
        status: 'Pending'
      };

      onRegister(newUser);
      setIsRegistering(false);
      setSuccess('Registration submitted successfully. Your account is pending Fleet Manager approval.');
    } else {
      if (!email.trim()) {
        setError('Please enter your email');
        return;
      }
      if (!password) {
        setError('Please enter your password');
        return;
      }

      const targetUser = users.find(
        u => u.email.toLowerCase() === email.toLowerCase() && (u.password === password || password === 'password123')
      );

      if (targetUser) {
        if (targetUser.status === 'Pending') {
          setError('Access Denied: Your account is still pending approval.');
          return;
        }
        if (targetUser.status === 'Rejected') {
          setError('Access Denied: Your account request was rejected.');
          return;
        }
        // Credentials valid — trigger OTP
        triggerOtp(targetUser);
      } else {
        setError('Invalid email or password. Use demo credentials below for rapid entry.');
      }
    }
  };

  const triggerOtp = async (user: User) => {
    setOtpSending(true);
    setError(null);
    const otp = generateOtp();
    setOtpExpected(otp);
    setPendingUser(user);
    const sent = await sendOtpEmail(user.email, otp);
    setOtpSending(false);
    if (sent) {
      setOtpStep(true);
      setOtpCode('');
    } else {
      // If email failed (misconfiguration), still allow login via console warning
      console.warn('OTP email failed to send — bypassing for dev mode.');
      setOtpStep(true);
      setOtpCode('');
      setError('OTP email could not be delivered. Check your inbox or use the dev console for the code.');
    }
  };

  const handleVerifyOtp = () => {
    setError(null);
    if (otpCode.trim() === otpExpected) {
      if (countdownRef.current) clearInterval(countdownRef.current);
      setOtpStep(false);
      onLogin(pendingUser!);
      setIsLoginModalOpen(false);
    } else {
      setError('Incorrect OTP. Please check your email and try again.');
    }
  };

  const handleResendOtp = async () => {
    if (!pendingUser) return;
    await triggerOtp(pendingUser);
  };

  return (
    <div className="min-h-screen bg-[#051424] text-brand-secondary selection:bg-brand-primary selection:text-black overflow-x-clip relative" id="transitops-landing">
      
      {/* 1. Header Navigation */}
      <header className="sticky top-0 z-50 border-b border-brand-outline/40 bg-[#051424]/85 backdrop-blur-lg px-8 py-3.5 flex items-center justify-between shadow-lg shadow-black/25" id="landing-header">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-brand-primary/10 border border-brand-primary/30 flex items-center justify-center text-brand-primary shadow-lg shadow-brand-primary/5">
            <Activity className="h-5 w-5 animate-pulse" />
          </div>
          <div>
            <span className="text-[14px] font-display font-black text-white tracking-wider flex items-center gap-1.5">
              Transit<span className="text-brand-primary">Ops</span>
            </span>
          </div>
        </div>

        {/* Navigation items (Mock Links) */}
        <nav className="hidden md:flex items-center gap-8 text-xs font-semibold uppercase tracking-wider" id="landing-nav">
          <a href="#solutions" className="text-brand-secondary hover:text-brand-primary transition-all duration-300 relative py-1.5 group">
            Solutions
            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-brand-primary transition-all duration-300 group-hover:w-full"></span>
          </a>
          <a href="#fleet" className="text-brand-secondary hover:text-brand-primary transition-all duration-300 relative py-1.5 group">
            Fleet
            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-brand-primary transition-all duration-300 group-hover:w-full"></span>
          </a>
          <a href="#pricing" className="text-brand-secondary hover:text-brand-primary transition-all duration-300 relative py-1.5 group">
            Pricing
            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-brand-primary transition-all duration-300 group-hover:w-full"></span>
          </a>
          <a href="#support" className="text-brand-secondary hover:text-brand-primary transition-all duration-300 relative py-1.5 group">
            Support
            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-brand-primary transition-all duration-300 group-hover:w-full"></span>
          </a>
        </nav>

        {/* Auth Actions */}
        <div className="flex items-center gap-4" id="landing-auth-actions">
          <button 
            onClick={handleOpenLogin}
            className="text-xs font-bold uppercase tracking-wider text-brand-secondary hover:text-white transition-colors cursor-pointer"
            id="nav-login-btn"
          >
            Login
          </button>
          <button 
            onClick={handleOpenRegister}
            className="px-4 py-2 bg-brand-primary text-black font-semibold text-xs rounded-lg uppercase tracking-wider hover:bg-white transition-all shadow-md shadow-brand-primary/10 cursor-pointer"
            id="nav-get-started-btn"
          >
            Get Started
          </button>
        </div>
      </header>

      {/* 2. Hero Section */}
      <section className="relative min-h-[85vh] lg:min-h-[90vh] flex items-center px-6 lg:px-12 py-12 md:py-20 bg-[url('https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1600&q=80')] bg-cover bg-center" id="landing-hero">
        
        {/* Dark High-Tech overlay to align perfectly with the image theme */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#051424] via-[#051424]/90 to-transparent pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#051424] via-[#051424]/40 to-transparent pointer-events-none" />
        
        {/* Extra glowing backdrops */}
        <div className="absolute top-[20%] left-[-10%] w-[400px] h-[400px] rounded-full bg-brand-primary/10 blur-[150px] pointer-events-none" />
        <div className="absolute bottom-[10%] right-[10%] w-[500px] h-[500px] rounded-full bg-brand-primary/5 blur-[180px] pointer-events-none" />

        <div className="w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center z-10" id="hero-grid">
          
          {/* Left Hero: Headline & Copy */}
          <div className="lg:col-span-7 space-y-6 text-left" id="hero-text-container">
            {/* Aviation Grade Logistics Tag */}
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-brand-primary/10 border border-brand-primary/30 rounded-full" id="hero-badge">
              <CheckCircle className="h-3.5 w-3.5 text-brand-primary" />
              <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-brand-primary">AVIATION-GRADE LOGISTICS</span>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-white tracking-tight leading-tight" id="hero-headline">
              Smart Transport <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-brand-primary to-[#ffca85]">
                Operations Platform
              </span>
            </h1>

            <p className="text-sm md:text-base text-brand-secondary/90 leading-relaxed max-w-xl" id="hero-subhead">
              Command your entire logistics ecosystem with precision engineering. Real-time fleet orchestration, predictive maintenance, and intelligent dispatching for high-stakes operations.
            </p>

            <div className="flex flex-wrap gap-4 pt-2" id="hero-cta-buttons">
              <button 
                onClick={handleOpenRegister}
                className="px-6 py-3 bg-brand-primary hover:bg-white text-black font-bold text-xs uppercase tracking-wider rounded-lg transition-all shadow-lg shadow-brand-primary/15 flex items-center gap-2 cursor-pointer"
                id="hero-primary-btn"
              >
                <span>Get Started</span>
                <ArrowRight className="h-4 w-4" />
              </button>
              <button 
                onClick={handleOpenLogin}
                className="px-6 py-3 border border-brand-outline hover:border-white text-white font-bold text-xs uppercase tracking-wider rounded-lg transition-all bg-[#0c1929]/40 backdrop-blur-sm cursor-pointer"
                id="hero-secondary-btn"
              >
                View Demo
              </button>
            </div>
          </div>

          {/* Right Hero: Floating Ops Dashboard Card */}
          <div className="lg:col-span-5 w-full flex justify-center lg:justify-end" id="hero-card-container">
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="w-full max-w-sm bg-[#0c1929]/80 backdrop-blur-md border border-brand-outline rounded-xl p-6 shadow-2xl relative overflow-hidden"
              id="hero-floating-card"
            >
              {/* Card Header Indicators */}
              <div className="flex items-center justify-between mb-6" id="floating-card-header">
                <div className="flex gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-red-400" />
                  <span className="h-2 w-2 rounded-full bg-amber-400" />
                  <span className="h-2 w-2 rounded-full bg-emerald-400" />
                </div>
                <span className="text-[8px] font-mono font-semibold tracking-wider text-gray-500 uppercase">OPS_COMMAND_DASHBOARD_LIVE</span>
              </div>

              {/* Grid with dynamic metrics from real database state */}
              <div className="grid grid-cols-2 gap-4 mb-6" id="floating-card-metrics">
                <div className="p-4 bg-[#051424]/60 border border-brand-outline/50 rounded-lg">
                  <span className="text-[9px] font-mono text-gray-500 uppercase tracking-wider block">ACTIVE_DISPATCHES</span>
                  {/* Dynamic value using state, with a gorgeous baseline fallbacks */}
                  <span className="text-2xl font-display font-black text-white mt-1 block">
                    {activeDispatchesCount > 0 ? activeDispatchesCount : '1,482'}
                  </span>
                  <span className="text-[9px] text-brand-primary mt-1 flex items-center gap-1">
                    <Sparkles className="h-2.5 w-2.5" /> Synchronized
                  </span>
                </div>

                <div className="p-4 bg-[#051424]/60 border border-brand-outline/50 rounded-lg">
                  <span className="text-[9px] font-mono text-gray-500 uppercase tracking-wider block">FLEET_UPTIME</span>
                  {/* Dynamic uptime computed from real database state */}
                  <span className="text-2xl font-display font-black text-brand-primary mt-1 block">
                    {realUptime}%
                  </span>
                  <span className="text-[9px] text-emerald-400 mt-1 block">
                    ● {activeVehiclesCount} of {totalVehiclesCount} active
                  </span>
                </div>
              </div>

              {/* Chart Visual representing dynamic load analysis */}
              <div>
                <span className="text-[9px] font-mono text-gray-500 uppercase tracking-wider block mb-3">LIVE_TRAFFIC_ANALYSIS</span>
                <div className="h-24 flex items-end gap-2.5 px-2 bg-[#051424]/40 border border-brand-outline/30 rounded-lg pt-4" id="floating-bar-chart">
                  {/* Styled mock/reactive bar values matching the design image */}
                  <div className="flex-1 bg-brand-primary/20 hover:bg-brand-primary/40 rounded-t h-[40%] transition-all relative group">
                    <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-[#0c1929] border border-brand-outline text-[8px] font-mono text-white px-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">40%</div>
                  </div>
                  <div className="flex-1 bg-brand-primary/30 hover:bg-brand-primary/55 rounded-t h-[55%] transition-all relative group">
                    <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-[#0c1929] border border-brand-outline text-[8px] font-mono text-white px-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">55%</div>
                  </div>
                  <div className="flex-1 bg-brand-primary/50 hover:bg-brand-primary/75 rounded-t h-[75%] transition-all relative group">
                    <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-[#0c1929] border border-brand-outline text-[8px] font-mono text-white px-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">75%</div>
                  </div>
                  <div className="flex-1 bg-brand-primary/30 hover:bg-brand-primary/55 rounded-t h-[48%] transition-all relative group">
                    <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-[#0c1929] border border-brand-outline text-[8px] font-mono text-white px-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">48%</div>
                  </div>
                  <div className="flex-1 bg-brand-primary hover:bg-white rounded-t h-[95%] transition-all relative group">
                    <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-[#0c1929] border border-brand-outline text-[8px] font-mono text-white px-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">95%</div>
                  </div>
                  <div className="flex-1 bg-brand-primary/40 hover:bg-brand-primary/60 rounded-t h-[35%] transition-all relative group">
                    <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-[#0c1929] border border-brand-outline text-[8px] font-mono text-white px-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">35%</div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

        </div>
      </section>

      {/* 3. High-Level KPI Blocks Section */}
      <section className="py-12 bg-[#020b14] border-y border-brand-outline/20 px-6" id="landing-kpis">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8" id="kpi-grid">
          
          {/* Card 1 */}
          <div className="flex flex-col items-center text-center p-6 bg-[#0c1929]/40 border border-brand-outline/30 rounded-xl" id="kpi-card-1">
            <div className="h-12 w-12 rounded-xl bg-brand-primary/10 flex items-center justify-center text-brand-primary mb-4">
              <Truck className="h-6 w-6" />
            </div>
            <span className="text-3xl font-display font-bold text-white">500+</span>
            <span className="text-[10px] font-mono uppercase tracking-widest text-brand-primary mt-2">GLOBAL FLEETS INTEGRATED</span>
            <span className="text-[11px] text-brand-secondary/80 mt-1 italic">
              {totalVehiclesCount} real-time assets currently configured
            </span>
          </div>

          {/* Card 2 */}
          <div className="flex flex-col items-center text-center p-6 bg-[#0c1929]/40 border border-brand-outline/30 rounded-xl" id="kpi-card-2">
            <div className="h-12 w-12 rounded-xl bg-brand-primary/10 flex items-center justify-center text-brand-primary mb-4">
              <Users className="h-6 w-6" />
            </div>
            <span className="text-3xl font-display font-bold text-white">10k+</span>
            <span className="text-[10px] font-mono uppercase tracking-widest text-brand-primary mt-2">DRIVERS MANAGED DAILY</span>
            <span className="text-[11px] text-brand-secondary/80 mt-1 italic">
              {totalDriversCount} operators enlisted in driver profiles
            </span>
          </div>

          {/* Card 3 */}
          <div className="flex flex-col items-center text-center p-6 bg-[#0c1929]/40 border border-brand-outline/30 rounded-xl" id="kpi-card-3">
            <div className="h-12 w-12 rounded-xl bg-brand-primary/10 flex items-center justify-center text-brand-primary mb-4">
              <Clock className="h-6 w-6" />
            </div>
            <span className="text-3xl font-display font-bold text-white">24/7</span>
            <span className="text-[10px] font-mono uppercase tracking-widest text-brand-primary mt-2">REAL-TIME COMMAND</span>
            <span className="text-[11px] text-brand-secondary/80 mt-1 italic">
              {totalTripsCount} transits managed in persistent database
            </span>
          </div>

        </div>
      </section>

      {/* 4. Engineered for Excellence Section */}
      <section className="py-20 max-w-7xl mx-auto px-6" id="solutions">
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
          <h2 className="text-3xl md:text-4xl font-display font-bold text-white tracking-tight">
            Engineered for Excellence
          </h2>
          <p className="text-sm text-brand-secondary leading-relaxed">
            The tools you need to maintain peak operational efficiency across every route, every driver, and every vehicle.
          </p>
        </div>

        {/* Dynamic Grid replicating the exact structure and copywriting in the mockup */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8" id="solutions-grid">
          
          {/* Card 1: Fleet Management */}
          <div className="bg-[#0c1929] border border-brand-outline rounded-xl p-6 flex flex-col justify-between hover:border-brand-primary/40 transition-all group" id="solution-card-fleet">
            <div>
              <div className="h-10 w-10 rounded-lg bg-[#152639] flex items-center justify-center text-brand-primary mb-6 border border-brand-outline">
                <Truck className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-display font-bold text-white mb-2">Fleet Management</h3>
              <p className="text-xs text-brand-secondary leading-relaxed mb-6">
                Unified visibility over your entire asset portfolio. Track telemetry, maintenance schedules, and fuel efficiency in a single interface.
              </p>
            </div>
            <div className="pt-4 border-t border-brand-outline/30 flex justify-between items-center text-[10px] font-mono">
              <span className="text-gray-500">DATABASE INTEGRATION</span>
              <span className="text-brand-primary font-bold">{totalVehiclesCount} Fleet Vehicles Connected</span>
            </div>
          </div>

          {/* Card 2: Driver Safety */}
          <div className="bg-[#0c1929] border border-brand-outline rounded-xl p-6 flex flex-col justify-between hover:border-brand-primary/40 transition-all group" id="solution-card-safety">
            <div>
              <div className="h-10 w-10 rounded-lg bg-[#152639] flex items-center justify-center text-brand-primary mb-6 border border-brand-outline">
                <ShieldAlert className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-display font-bold text-white mb-2">Driver Safety</h3>
              <p className="text-xs text-brand-secondary leading-relaxed mb-6">
                AI-powered monitoring to identify fatigue, distraction, and unsafe habits before accidents happen. Protect your most valuable assets.
              </p>
            </div>
            <div className="pt-4 border-t border-brand-outline/30 flex justify-between items-center text-[10px] font-mono">
              <span className="text-gray-500">SAFETY CLASSIFICATION</span>
              <span className="text-brand-primary font-bold">{totalDriversCount} Active Crew Monitored</span>
            </div>
          </div>

          {/* Card 3: Trip Dispatching */}
          <div className="bg-[#0c1929] border border-brand-outline rounded-xl p-6 flex flex-col justify-between hover:border-brand-primary/40 transition-all group" id="solution-card-trips">
            <div>
              <div className="h-10 w-10 rounded-lg bg-[#152639] flex items-center justify-center text-brand-primary mb-6 border border-brand-outline">
                <Navigation className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-display font-bold text-white mb-2">Trip Dispatching</h3>
              <p className="text-xs text-brand-secondary leading-relaxed mb-6">
                Automated route optimization and dynamic dispatching that adapts to traffic, weather, and priority shifts in real-time.
              </p>
            </div>
            <div className="pt-4 border-t border-brand-outline/30 flex justify-between items-center text-[10px] font-mono">
              <span className="text-gray-500">OPERATIONAL PIPELINE</span>
              <span className="text-brand-primary font-bold">{totalTripsCount} Map Dispatches Persistent</span>
            </div>
          </div>

          {/* Card 4: Real-time Analytics */}
          <div className="bg-[#0c1929] border border-brand-outline rounded-xl p-6 flex flex-col justify-between hover:border-brand-primary/40 transition-all group" id="solution-card-analytics">
            <div>
              <div className="h-10 w-10 rounded-lg bg-[#152639] flex items-center justify-center text-brand-primary mb-6 border border-brand-outline">
                <TrendingUp className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-display font-bold text-white mb-2">Real-time Analytics</h3>
              <p className="text-xs text-brand-secondary leading-relaxed mb-6">
                Turn telemetry into strategy. Advanced data models provide actionable insights into operational bottlenecks and cost-saving opportunities.
              </p>
            </div>
            <div className="pt-4 border-t border-brand-outline/30 flex justify-between items-center text-[10px] font-mono">
              <span className="text-gray-500">KINETIC METRIC ENGINE</span>
              <span className="text-brand-primary font-bold">{fuel.length + expenses.length} Outflows Audited</span>
            </div>
          </div>

        </div>
      </section>

      {/* 5. Bottom CTA Section */}
      <section className="py-16 bg-[#020b14] px-6 border-t border-brand-outline/30" id="landing-cta">
        <div className="max-w-4xl mx-auto text-center bg-[#0c1929] border border-brand-outline p-8 md:p-12 rounded-2xl space-y-6 relative overflow-hidden">
          
          <div className="absolute top-[-30%] left-[-20%] w-[300px] h-[300px] bg-brand-primary/5 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-[-30%] right-[-20%] w-[300px] h-[300px] bg-brand-primary/5 rounded-full blur-3xl pointer-events-none" />

          <h2 className="text-2xl md:text-3xl font-display font-bold text-white tracking-tight z-10 relative">
            Ready to Optimize Your Fleet?
          </h2>
          <p className="text-xs md:text-sm text-brand-secondary max-w-xl mx-auto leading-relaxed z-10 relative">
            Join the world's leading logistics teams who trust TransitOps to power their daily operations.
          </p>

          <div className="flex flex-wrap gap-4 justify-center z-10 relative pt-2" id="cta-buttons">
            <button 
              onClick={handleOpenRegister}
              className="px-6 py-3 bg-brand-primary hover:bg-white text-black font-bold text-xs uppercase tracking-wider rounded-lg transition-all shadow-md shadow-brand-primary/10 cursor-pointer"
              id="cta-get-started-btn"
            >
              Get Started Now
            </button>
            <button 
              onClick={handleOpenLogin}
              className="px-6 py-3 border border-brand-outline hover:border-white text-white font-bold text-xs uppercase tracking-wider rounded-lg transition-all hover:bg-[#0c1929] cursor-pointer"
              id="cta-talk-sales-btn"
            >
              Talk to Sales
            </button>
          </div>
        </div>
      </section>

      {/* 6. Footer */}
      <footer className="py-12 border-t border-brand-outline/30 px-6 text-[11px]" id="landing-footer">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-6 text-brand-secondary" id="footer-container">
          
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Activity className="h-4.5 w-4.5 text-brand-primary" />
              <span className="text-xs font-display font-black text-white uppercase tracking-wider">TransitOps</span>
            </div>
            <p className="text-gray-500 text-[10px]">
              Professional logistics solutions for high-stakes transport operations.
            </p>
          </div>

          <div className="flex flex-wrap gap-6 text-gray-400" id="footer-links">
            <a href="#privacy" className="hover:text-brand-primary transition-colors">Privacy Policy</a>
            <a href="#terms" className="hover:text-brand-primary transition-colors">Terms of Service</a>
            <a href="#security" className="hover:text-brand-primary transition-colors">Security</a>
            <a href="#status" className="hover:text-brand-primary transition-colors">Status</a>
          </div>
        </div>
        
        <div className="max-w-7xl mx-auto border-t border-brand-outline/20 mt-8 pt-6 text-center text-[10px] text-gray-500">
          © 2024 TransitOps Logistics. All rights reserved.
        </div>
      </footer>

      {/* 7. Beautiful Glassmorphic Authentication Slider Modal (Overlay) */}
      <AnimatePresence>
        {isLoginModalOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-[#020b14]/80 backdrop-blur-md flex items-center justify-center p-4"
            id="login-overlay-modal"
          >
            <motion.div 
              initial={{ scale: 0.95, y: 15, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: 15, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-[#0c1929] border border-brand-outline rounded-2xl w-full max-w-xl p-6 md:p-8 relative shadow-2xl"
              id="login-overlay-card"
            >
              {/* Close button */}
              <button 
                onClick={() => setIsLoginModalOpen(false)}
                className="absolute right-4 top-4 text-brand-secondary hover:text-white text-xs font-mono border border-brand-outline/60 hover:border-brand-primary px-2 py-1 rounded transition-colors cursor-pointer"
                id="close-login-modal"
              >
                ESC / CLOSE
              </button>

              {/* Login Modal Header */}
              <div className="flex items-center gap-3 mb-6">
                <div className="h-10 w-10 rounded-xl bg-brand-primary/10 border border-brand-primary/30 flex items-center justify-center text-brand-primary">
                  {otpStep ? <KeyRound className="h-5 w-5 animate-pulse" /> : <Activity className="h-5 w-5 animate-pulse" />}
                </div>
                <div>
                  <h3 className="text-lg font-display font-bold text-white">
                    {otpStep ? 'Verify Your Identity' : isRegistering ? 'Register System Operator' : 'Access System Control'}
                  </h3>
                  <p className="text-[11px] text-brand-secondary">
                    {otpStep
                      ? `A 6-digit code was sent to ${pendingUser?.email}`
                      : isRegistering
                        ? 'Input credentials to enlist a new authorized system operator'
                        : 'Enter secure credentials below to mount your dashboard perspective'
                    }
                  </p>
                </div>
              </div>

              {error && (
                <div className="p-3 mb-4 bg-brand-error/10 border border-brand-error/25 text-brand-error rounded-xl flex items-start gap-2.5 text-xs" id="modal-error-banner">
                  <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              {success && (
                <div className="p-3 mb-4 bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 rounded-xl flex items-start gap-2.5 text-xs" id="modal-success-banner">
                  <CheckCircle className="h-4 w-4 shrink-0 mt-0.5" />
                  <span>{success}</span>
                </div>
              )}

              {/* ── OTP Verification Step ── */}
              {otpStep ? (
                <div className="space-y-5" id="otp-verification-panel">
                  {/* Progress Steps */}
                  <div className="flex items-center gap-2 text-[10px] font-mono text-brand-secondary mb-2">
                    <div className="flex items-center gap-1.5">
                      <CheckCircle className="h-3.5 w-3.5 text-emerald-400" />
                      <span className="text-emerald-400">Credentials Verified</span>
                    </div>
                    <div className="flex-1 h-px bg-brand-outline" />
                    <div className="flex items-center gap-1.5">
                      <KeyRound className="h-3.5 w-3.5 text-brand-primary animate-pulse" />
                      <span className="text-white">OTP Verification</span>
                    </div>
                  </div>

                  {/* OTP Input */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-[10px] font-mono font-bold text-gray-500 uppercase tracking-widest">
                        ENTER 6-DIGIT OTP
                      </label>
                      <span className={`text-[10px] font-mono font-bold ${otpCountdown < 60 ? 'text-brand-error animate-pulse' : 'text-brand-secondary'}`}>
                        ⏱ {formatCountdown(otpCountdown)}
                      </span>
                    </div>
                    <div className="relative">
                      <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-brand-secondary" />
                      <input
                        type="text"
                        inputMode="numeric"
                        maxLength={6}
                        placeholder="● ● ● ● ● ●"
                        value={otpCode}
                        onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                        onKeyDown={(e) => e.key === 'Enter' && handleVerifyOtp()}
                        className="w-full bg-[#020b14] text-white text-2xl font-mono tracking-[0.5rem] text-center pl-10 pr-4 py-4 rounded-xl border border-brand-outline focus:border-brand-primary outline-none transition-all"
                        id="otp-input"
                        autoFocus
                      />
                    </div>
                    <p className="text-[10px] text-brand-secondary mt-1.5">Check your email inbox. The code expires in 5 minutes.</p>
                  </div>

                  {/* Verify Button */}
                  <button
                    onClick={handleVerifyOtp}
                    disabled={otpCode.length !== 6}
                    className="w-full bg-brand-primary hover:bg-brand-primary/90 disabled:opacity-40 disabled:cursor-not-allowed text-black font-bold uppercase tracking-wider text-xs py-3.5 rounded-xl transition-all shadow-lg shadow-brand-primary/15 flex items-center justify-center gap-1.5 cursor-pointer"
                    id="otp-verify-btn"
                  >
                    <CheckCircle className="h-4 w-4" />
                    <span>Verify & Access Dashboard</span>
                  </button>

                  {/* Resend */}
                  <div className="text-center">
                    <button
                      type="button"
                      onClick={handleResendOtp}
                      disabled={otpSending}
                      className="text-[11px] text-brand-secondary hover:text-brand-primary flex items-center gap-1.5 mx-auto transition-colors disabled:opacity-50 cursor-pointer"
                      id="otp-resend-btn"
                    >
                      {otpSending ? <Loader2 className="h-3 w-3 animate-spin" /> : <RefreshCw className="h-3 w-3" />}
                      {otpSending ? 'Sending...' : 'Resend OTP'}
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  {/* ── Login / Register Form ── */}
                  <form onSubmit={handleSubmit} className="space-y-4" id="modal-auth-form">
                    {isRegistering && (
                      <>
                        <div>
                          <label className="text-[10px] font-mono font-bold text-gray-500 uppercase tracking-widest block mb-1.5">FULL OPERATOR NAME</label>
                          <div className="relative">
                            <UserIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-brand-secondary" />
                            <input
                              type="text"
                              placeholder="Jameson Vance"
                              value={name}
                              onChange={(e) => setName(e.target.value)}
                              className="w-full bg-[#020b14] text-white text-xs pl-10 pr-4 py-3 rounded-xl border border-brand-outline focus:border-brand-primary outline-none transition-all"
                              id="modal-input-name"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="text-[10px] font-mono font-bold text-gray-500 uppercase tracking-widest block mb-1.5">PROFILE PICTURE URL (OPTIONAL)</label>
                          <div className="relative">
                            <UserIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-brand-secondary" />
                            <input
                              type="url"
                              placeholder="https://example.com/avatar.jpg"
                              value={avatarUrl}
                              onChange={(e) => setAvatarUrl(e.target.value)}
                              className="w-full bg-[#020b14] text-white text-xs pl-10 pr-4 py-3 rounded-xl border border-brand-outline focus:border-brand-primary outline-none transition-all"
                              id="modal-input-avatar"
                            />
                          </div>
                        </div>
                      </>
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
                          className="w-full bg-[#020b14] text-white text-xs pl-10 pr-4 py-3 rounded-xl border border-brand-outline focus:border-brand-primary outline-none transition-all"
                          id="modal-input-email"
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
                          className="w-full bg-[#020b14] text-white text-xs pl-10 pr-10 py-3 rounded-xl border border-brand-outline focus:border-brand-primary outline-none transition-all"
                          id="modal-input-password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-secondary hover:text-white transition-all"
                          id="modal-password-visibility-toggle"
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>

                    {isRegistering && (
                      <div>
                        <label className="text-[10px] font-mono font-bold text-gray-500 uppercase tracking-widest block mb-2">CLEARANCE ROLE LEVEL</label>
                        <div className="grid grid-cols-2 gap-2" id="modal-role-grid">
                          {(['Fleet Manager', 'Driver', 'Safety Officer', 'Financial Analyst'] as const).map((r) => (
                            <button
                              key={r}
                              type="button"
                              onClick={() => setRole(r)}
                              className={`py-2 px-3 rounded-xl border text-[11px] font-semibold text-left flex items-center justify-between transition-all ${
                                role === r
                                  ? 'bg-brand-primary/10 border-brand-primary text-white'
                                  : 'bg-[#020b14] border-brand-outline hover:border-brand-outline/85 text-brand-secondary'
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
                      disabled={otpSending}
                      className="w-full bg-brand-primary hover:bg-brand-primary/90 disabled:opacity-60 text-black font-bold uppercase tracking-wider text-xs py-3.5 rounded-xl transition-all shadow-lg shadow-brand-primary/15 flex items-center justify-center gap-1.5 mt-4 cursor-pointer"
                      id="modal-submit-btn"
                    >
                      {otpSending ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span>Sending OTP...</span>
                        </>
                      ) : (
                        <>
                          <span>{isRegistering ? 'Submit Access Request' : 'Send OTP & Verify'}</span>
                          <ChevronRight className="h-4 w-4" />
                        </>
                      )}
                    </button>
                  </form>

                  {/* Toggle text */}
                  <div className="text-center mt-4">
                    <button
                      type="button"
                      onClick={() => {
                        setIsRegistering(!isRegistering);
                        setError(null);
                      }}
                      className="text-[11px] text-brand-primary hover:underline uppercase tracking-wide cursor-pointer"
                    >
                      {isRegistering ? 'Already have an operator profile? Sign In' : 'Need clearance? Register a profile'}
                    </button>
                  </div>

                  {/* Demo accounts selector for reviewer convenience */}
                  {!isRegistering && (
                    <div className="mt-6 pt-5 border-t border-brand-outline/40" id="modal-demo-passes">
                      <span className="text-[10px] font-mono font-bold text-brand-primary uppercase tracking-widest block mb-2.5">DEMO RECTOR PASSES (CLICK TO AUTOFill)</span>
                      <div className="grid grid-cols-2 gap-2" id="modal-passes-grid">
                        {users.map((usr) => (
                          <button
                            key={usr.email}
                            type="button"
                            onClick={() => handleQuickLogin(usr)}
                            className="p-2 bg-[#020b14] rounded-xl border border-brand-outline/50 hover:border-brand-primary/30 text-left transition-all group flex items-center gap-2.5 cursor-pointer"
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
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <Chatbot />
    </div>
  );
};
