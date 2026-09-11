import React, { useState } from 'react';
import {
  BarChart3,
  Upload,
  Settings,
  LogOut,
  FileText,
  Eye,
  Film,
  Clapperboard,
  Video,
  Sparkles,
  Cpu,
  Network,
  Bot,
  
  Star,
  Search,
  ArrowUpRight,
  TrendingUp
} from 'lucide-react';
import { BrowserRouter as Router, Routes, Route, Navigate, useSearchParams, useLocation, Link } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Home } from './pages/Home';
import { MovieDetail } from './pages/MovieDetail';
import { AnalyticsDashboard } from './components/AnalyticsDashboard';
import { MoviesExplorer } from './components/MoviesExplorer';
import { MovieAnalytics } from './components/MovieAnalytics';
import { Lists } from './pages/Lists';
import { ListDetail } from './pages/ListDetail';
import { Films } from './pages/Films';
import { Reviews } from './pages/Reviews';
import { Navbar } from './components/Navbar';
import { Outlet } from 'react-router-dom';
import { motion } from 'framer-motion';


// ─── CENTRALIZED THEME CONFIGURATION ───────────────────────────
// Modify these values to globally change the look of the app.
export const Theme = {
  fontFamily: "font-sans",
  
  // Backgrounds
  bgApp: "bg-white",     // Main background
  bgCard: "bg-white",    // Card background
  bgDarkPanel: "bg-[#2C2925]", // Warm dark brown/charcoal instead of slate
  bgInput: "bg-white/50",    // Semi-transparent for inputs
  
  // Text Colors
  textPrimary: "text-[#3E3832]", // Warm dark brown text
  textSecondary: "text-[#7A7265]", // Warm medium brown text
  textMuted: "text-[#9E9585]",
  textInverse: "text-white",
  textInverseSecondary: "text-[#DCD4C7]",
  
  // Brand & Accent Colors
  primary: "bg-[#3E3832]",
  primaryHover: "hover:bg-[#2C2925]",
  accentText: "text-[#8B5E34]", // Warm accent (cognac/leather color)
  accentTextHover: "hover:text-[#6E4825]",
  

  // Borders
  border: "border-slate-200",
  borderLight: "border-slate-100",
  
  // Focus Rings
  focusRing: "focus:ring-slate-900",
};

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

function AppContent() {
  const { currentUser } = useAuth();
  const location = useLocation();

  return (
    <Routes>
      {/* Public Routes with Navbar */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/films" element={<Films />} />
        <Route path="/reviews" element={<ProtectedRoute message="Please log in to view reviews."><Reviews /></ProtectedRoute>} />
        <Route path="/movie/:id" element={<MovieDetail />} />
        
        {/* List Routes */}
        <Route path="/lists" element={<ProtectedRoute message="Please log in to access your lists."><Lists /></ProtectedRoute>} />
        <Route path="/lists/:id" element={<ProtectedRoute message="Please log in to access your lists."><ListDetail /></ProtectedRoute>} />
      </Route>
      
      {/* Auth Route (No Navbar) */}
      <Route path="/login" element={!currentUser ? <LoginLayout /> : <Navigate to={location.state?.from || "/"} replace />} />
      
      {/* Admin / Dashboard Route (Sidebar) */}
      <Route path="/dashboard" element={<ProtectedRoute><AdminRoute /></ProtectedRoute>} />
    </Routes>
  );
}

function PublicLayout() {
  return (
    <div className="min-h-screen bg-sentix-bg text-sentix-text font-sans flex flex-col">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
}

function ProtectedRoute({ children, message = "Please log in to access this page." }: { children: React.ReactNode, message?: string }) {
  const { currentUser } = useAuth();
  const location = useLocation();

  if (!currentUser) {
    return <Navigate to="/login" state={{ from: location.pathname, message }} replace />;
  }

  return <>{children}</>;
}

function AdminRoute() {
  const { logout } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  return <DashboardShell activeTab={activeTab} setActiveTab={setActiveTab} onLogout={logout} />;
}

function Logo({ variant = 'large', theme = 'light' }: { variant?: 'large' | 'small', theme?: 'light' | 'dark' }) {
  const isLarge = variant === 'large';
  const iconClass = isLarge ? 'h-32 -mb-2' : 'h-16 -mb-2';
  const textSize = isLarge ? 'text-5xl' : 'text-2xl';
  const textColor = theme === 'light' ? Theme.textPrimary : Theme.textInverse;
  const subtextColor = theme === 'light' ? Theme.textSecondary : Theme.textInverseSecondary;

  const subtext = isLarge && (
    <div className={`mt-2 text-xs uppercase tracking-wider font-semibold text-center ${subtextColor}`}>
      AI-Powered Movie Reviews & Recommendations
    </div>
  );

  return (
    <div className={`flex flex-col items-center text-center ${Theme.fontFamily}`}>
      <img src="/logo.png" alt="SentixAI Logo" className={`${iconClass} object-contain`} />
      <div className="flex flex-col">
        <div className={`${textSize} font-extrabold tracking-tight leading-none`}>
          <span className={textColor}>Sentix</span><span className="text-[#00B4D8] font-light">[Ai]</span>
        </div>
        {subtext}
      </div>
    </div>
  );
}

const GlowingCard = ({ children, className, gradient, glow, animDelay }: { children: React.ReactNode, className: string, gradient: string, glow: string, animDelay: string }) => (
  <div className={`absolute ${className} animate-pulse`} style={{ animationDuration: '8s', animationDelay: animDelay }}>
    {/* Glow effect behind the card */}
    <div className={`absolute inset-0 rounded-[2.5rem] ${glow} blur-2xl opacity-30`} />
    {/* The gradient border wrapper */}
    <div className={`relative w-full h-full rounded-[2.5rem] ${gradient} p-[2px] shadow-2xl`}>
      {/* The inner dark card */}
      <div className="w-full h-full rounded-[2.5rem] bg-[#110E0E] flex items-center justify-center backdrop-blur-sm">
        {children}
      </div>
    </div>
  </div>
);

function AnimatedBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0 bg-[#0B0A0A]">
      {/* Subtle ambient light in the background */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] h-[80vh] bg-indigo-500/5 rounded-full blur-[120px]" />
      
      {/* Floating Glowing Cards */}
      {/* Top Left - Movie Reel */}
      <GlowingCard 
        className="top-[5%] left-[8%] w-48 h-48 -rotate-12"
        gradient="bg-gradient-to-br from-amber-400 via-orange-500 to-red-600"
        glow="bg-orange-500"
        animDelay="0s"
      >
        <Film className="w-20 h-20 text-orange-400 opacity-90" strokeWidth={1.5} />
      </GlowingCard>

      {/* Middle Left - Sparkles (AI) */}
      <GlowingCard 
        className="top-[45%] -left-[2%] w-36 h-36 rotate-[25deg]"
        gradient="bg-gradient-to-br from-fuchsia-400 via-pink-500 to-rose-600"
        glow="bg-pink-500"
        animDelay="2s"
      >
        <Sparkles className="w-16 h-16 text-pink-400 opacity-90" strokeWidth={1.5} />
      </GlowingCard>

      {/* Bottom Left - Cpu */}
      <GlowingCard 
        className="bottom-[5%] left-[15%] w-40 h-40 rotate-12"
        gradient="bg-gradient-to-br from-cyan-400 via-blue-500 to-indigo-600"
        glow="bg-blue-500"
        animDelay="4s"
      >
        <Cpu className="w-16 h-16 text-blue-400 opacity-90" strokeWidth={1.5} />
      </GlowingCard>

      {/* Top Right - Bot */}
      <GlowingCard 
        className="top-[10%] right-[10%] w-44 h-44 rotate-[15deg]"
        gradient="bg-gradient-to-br from-emerald-400 via-teal-500 to-cyan-600"
        glow="bg-teal-500"
        animDelay="1s"
      >
        <Bot className="w-20 h-20 text-teal-400 opacity-90" strokeWidth={1.5} />
      </GlowingCard>

      {/* Bottom Right - Clapperboard */}
      <GlowingCard 
        className="bottom-[10%] right-[8%] w-52 h-52 -rotate-[15deg]"
        gradient="bg-gradient-to-br from-violet-400 via-purple-500 to-fuchsia-600"
        glow="bg-purple-500"
        animDelay="3s"
      >
        <Clapperboard className="w-24 h-24 text-purple-400 opacity-90" strokeWidth={1.5} />
      </GlowingCard>
      
      {/* Middle Right - Network */}
      <GlowingCard 
        className="top-[50%] -right-[2%] w-32 h-32 -rotate-[30deg]"
        gradient="bg-gradient-to-br from-yellow-300 via-amber-400 to-orange-500"
        glow="bg-amber-400"
        animDelay="5s"
      >
        <Network className="w-14 h-14 text-amber-400 opacity-90" strokeWidth={1.5} />
      </GlowingCard>
    </div>
  );
}
function LoginLayout() {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const [isSignUp, setIsSignUp] = useState(searchParams.get('signup') === 'true');
  const returnUrl = searchParams.get('returnUrl') || '/';
  const { login, signup, loginWithGoogle } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // OTP state
  const [otpStep, setOtpStep] = useState(false); // true = show OTP screen
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const [resendCooldown, setResendCooldown] = useState(0);

  const API_URL = import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || 'http://localhost:3001';

  // ─── Resend Cooldown Timer ──────────────────────────────────
  React.useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  // ─── Send OTP ───────────────────────────────────────────────
  const sendOtp = async () => {
    setError('');
    setSuccess('');
    setIsLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to send OTP');
      setOtpStep(true);
      setOtpDigits(['', '', '', '', '', '']);
      setResendCooldown(60);
      setSuccess(`Verification code sent to ${email}`);
    } catch (err: any) {
      if (err.message === 'Failed to fetch') {
        setError('Unable to connect to the server. Please check your connection.');
      } else {
        setError(err.message || 'Failed to send OTP');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // ─── Verify OTP & Create Account ───────────────────────────
  const verifyOtp = async () => {
    const otpCode = otpDigits.join('');
    if (otpCode.length !== 6) {
      setError('Please enter the complete 6-digit code');
      return;
    }
    setError('');
    setSuccess('');
    setIsLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp: otpCode })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Verification failed');

      // OTP verified — now create the Firebase account
      await signup(email, password);
      window.location.href = returnUrl;
    } catch (err: any) {
      if (err.message === 'Failed to fetch') {
        setError('Unable to connect to the server. Please check your connection.');
      } else if (err.code && err.code.startsWith('auth/')) {
        setError(`Authentication error: ${err.message}`);
      } else {
        setError(err.message || 'Verification failed');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // ─── Handle OTP digit input ────────────────────────────────
  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) value = value.slice(-1);
    if (value && !/^\d$/.test(value)) return;

    const newDigits = [...otpDigits];
    newDigits[index] = value;
    setOtpDigits(newDigits);

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasted.length === 0) return;
    const newDigits = [...otpDigits];
    for (let i = 0; i < 6; i++) {
      newDigits[i] = pasted[i] || '';
    }
    setOtpDigits(newDigits);
    // Focus the last filled input or the next empty one
    const focusIndex = Math.min(pasted.length, 5);
    document.getElementById(`otp-${focusIndex}`)?.focus();
  };

  // ─── Form Submit (Login or Signup Step 1) ──────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);
    try {
      if (isSignUp) {
        // Step 1: Send OTP instead of creating account directly
        await sendOtp();
      } else {
        await login(email, password);
        window.location.href = returnUrl;
      }
    } catch (err: any) {
      let errorMessage = err.message || 'Failed to authenticate';
      if (errorMessage === 'Failed to fetch' || errorMessage.includes('Failed to fetch')) {
        errorMessage = 'Unable to connect to the server. Please check your connection.';
      } else if (err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
        errorMessage = 'Invalid email or password.';
      } else if (err.code === 'auth/email-already-in-use') {
        errorMessage = 'An account with this email already exists.';
      } else if (err.code === 'auth/invalid-api-key') {
        errorMessage = 'System configuration error: Invalid Firebase API Key.';
      } else if (err.code && err.code.startsWith('auth/')) {
        errorMessage = `Authentication error: ${err.message}`;
      }
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setError('');
      await loginWithGoogle();
      window.location.href = returnUrl;
    } catch (err: any) {
      setError(err.message || 'Failed to authenticate with Google');
    }
  };

  // ─── Go back from OTP screen ──────────────────────────────
  const handleBackFromOtp = () => {
    setOtpStep(false);
    setOtpDigits(['', '', '', '', '', '']);
    setError('');
    setSuccess('');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-sentix-bg text-sentix-text font-sans p-4 relative overflow-hidden">
      {/* Cinematic Background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-t from-sentix-bg via-sentix-bg/80 to-transparent z-10" />
        <img
          className="w-full h-full object-cover opacity-20 mix-blend-luminosity"
          src="https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=2070&auto=format&fit=crop"
          alt="Cinematic background"
        />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-md bg-sentix-panel/90 backdrop-blur-xl border border-sentix-border rounded-2xl shadow-2xl overflow-hidden z-10 relative"
      >
        <div className="p-8">
          <div className="flex justify-center mb-8">
            <Link to="/" className="flex items-center space-x-2">
              <span className="text-3xl font-black tracking-tighter text-white drop-shadow-md">
                Sentix<span className="text-sentix-cyan font-black">[Ai]</span>
              </span>
            </Link>
          </div>

          <h2 className="text-2xl font-bold text-white text-center mb-2">
            {otpStep ? "Verify Email" : (isSignUp ? "Create Your Account" : "Welcome Back")}
          </h2>
          <p className="text-sm text-sentix-text text-center mb-8">
            {otpStep ? `We sent a code to ${email}` : (isSignUp ? "Join the next-gen movie platform" : "Sign in to continue to SentixAI")}
          </p>

          {location.state?.message && !otpStep && (
            <div className="mb-6 p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-medium rounded-lg text-center">
              {location.state.message}
            </div>
          )}
          {error && (
            <div className="mb-6 p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-medium rounded-lg text-center">
              {error}
            </div>
          )}
          {success && (
            <div className="mb-6 p-3 bg-sentix-green/10 border border-sentix-green/20 text-sentix-green text-sm font-medium rounded-lg text-center">
              {success}
            </div>
          )}

          {otpStep ? (
            <div className="space-y-6">
              <div className="flex gap-2 justify-center" onPaste={handleOtpPaste}>
                {otpDigits.map((digit, index) => (
                  <input
                    key={index}
                    id={`otp-${index}`}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(index, e)}
                    className="w-12 h-14 text-center text-xl font-bold bg-sentix-bg border border-sentix-border rounded-lg focus:outline-none focus:border-sentix-cyan focus:ring-1 focus:ring-sentix-cyan transition-all text-white"
                    autoFocus={index === 0}
                  />
                ))}
              </div>
              <button
                type="button"
                onClick={verifyOtp}
                disabled={isLoading || otpDigits.join('').length !== 6}
                className="w-full flex justify-center py-3 px-4 rounded-lg shadow-md font-bold text-sentix-bg bg-sentix-cyan hover:bg-sentix-cyanHover transition-colors disabled:opacity-50"
              >
                {isLoading ? 'Verifying...' : 'Verify & Create Account'}
              </button>
              <div className="text-center text-sm">
                {resendCooldown > 0 ? (
                  <span className="text-sentix-text">Resend code in {resendCooldown}s</span>
                ) : (
                  <button type="button" onClick={sendOtp} disabled={isLoading} className="text-sentix-cyan hover:text-white transition-colors">
                    Didn't receive the code? Resend
                  </button>
                )}
              </div>
              <button onClick={handleBackFromOtp} className="w-full text-center text-sm text-sentix-text hover:text-white mt-4">
                Back to signup
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {isSignUp && (
                <div>
                  <label className="block text-sm font-bold text-sentix-text mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-3 bg-sentix-bg border border-sentix-border rounded-lg focus:outline-none focus:border-sentix-cyan transition-colors text-white placeholder-sentix-border"
                    placeholder="John Doe"
                  />
                </div>
              )}
              <div>
                <label className="block text-sm font-bold text-sentix-text mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 bg-sentix-bg border border-sentix-border rounded-lg focus:outline-none focus:border-sentix-cyan transition-colors text-white placeholder-sentix-border"
                  placeholder="name@company.com"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-sentix-text mb-1">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 bg-sentix-bg border border-sentix-border rounded-lg focus:outline-none focus:border-sentix-cyan transition-colors text-white placeholder-sentix-border pr-10"
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-sentix-text hover:text-white"
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-6 py-3 px-4 rounded-lg shadow-md font-bold text-sentix-bg bg-sentix-cyan hover:bg-sentix-cyanHover transition-colors disabled:opacity-50"
              >
                {isLoading ? 'Processing...' : (isSignUp ? "Sign Up" : "Sign In")}
              </button>

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-sentix-border"></div>
                </div>
                <div className="relative flex justify-center text-sm font-bold">
                  <span className="px-4 bg-sentix-panel text-sentix-text uppercase tracking-widest text-[10px]">
                    or continue with
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={isLoading}
                className="w-full flex justify-center items-center py-3 px-4 bg-sentix-bg border border-sentix-border rounded-lg shadow-sm font-bold text-white hover:border-sentix-cyan transition-colors disabled:opacity-50"
              >
                <svg className="h-5 w-5 mr-3" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z" />
                </svg>
                Google
              </button>

              <p className="mt-6 text-center text-sm font-medium text-sentix-text">
                {isSignUp ? "Already have an account? " : "Don't have an account? "}
                <button type="button" onClick={() => setIsSignUp(!isSignUp)} className="font-bold text-sentix-cyan hover:text-white transition-colors">
                  {isSignUp ? "Sign in" : "Create one now"}
                </button>
              </p>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  );
}


function DashboardShell({ activeTab, setActiveTab, onLogout }: { activeTab: string, setActiveTab: (tab: string) => void, onLogout: () => void }) {
  const { currentUser } = useAuth();
  const displayName = currentUser?.displayName || currentUser?.email?.split('@')[0] || 'User';
  const [selectedMovie, setSelectedMovie] = useState<string | null>(null);

  return (
    <div className={`flex h-screen ${Theme.bgApp}`}>
      {/* Sidebar */}
      <div className={`w-72 flex flex-col ${Theme.bgCard} border-r ${Theme.border} z-10 shrink-0`}>
        <div className={`h-24 flex flex-col justify-center px-8 border-b ${Theme.borderLight}`}>
          <Logo variant="small" theme="light" />
        </div>

        <div className="flex-1 overflow-y-auto py-6">
          <div className="px-6 mb-3">
            <span className="text-xs uppercase tracking-wider font-semibold text-slate-400">Main Menu</span>
          </div>
          <nav className="px-4 space-y-1">
            <button
              onClick={() => { setActiveTab('dashboard'); setSelectedMovie(null); }}
              className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${activeTab === 'dashboard' ? `${Theme.primary} ${Theme.textInverse} shadow-md` : `${Theme.textSecondary} hover:bg-slate-50 hover:${Theme.textPrimary}`}`}
            >
              <BarChart3 className="mr-3 h-[18px] w-[18px]" />
              Analytics
            </button>
            <button
              onClick={() => { setActiveTab('movies'); setSelectedMovie(null); }}
              className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${activeTab === 'movies' ? `${Theme.primary} ${Theme.textInverse} shadow-md` : `${Theme.textSecondary} hover:bg-slate-50 hover:${Theme.textPrimary}`}`}
            >
              <Film className="mr-3 h-[18px] w-[18px]" />
              Movies
            </button>

            <button
              className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${Theme.textSecondary} hover:bg-white/50 hover:${Theme.textPrimary}`}
            >
              <FileText className="mr-3 h-[18px] w-[18px]" />
              Projects
            </button>
          </nav>
        </div>

        <div className="p-4 border-t border-slate-200">
          <button className={`w-full flex items-center px-4 py-2.5 text-sm font-medium rounded-xl transition-all ${Theme.textSecondary} hover:bg-white/50 hover:${Theme.textPrimary}`}>
            <Settings className="mr-3 h-[18px] w-[18px]" />
            Settings
          </button>
          <button
            onClick={onLogout}
            className="w-full mt-1 flex items-center px-4 py-2.5 text-sm font-medium rounded-xl transition-all text-red-500 hover:bg-red-50"
          >
            <LogOut className="mr-3 h-[18px] w-[18px]" />
            Log out
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden relative">
        
        {/* Top Bar (Optional if we want standard header for legacy views, but new views have their own headers) */}

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto">
          {activeTab === 'dashboard' && <AnalyticsDashboard />}
          {activeTab === 'movies' && !selectedMovie && <MoviesExplorer onSelectMovie={setSelectedMovie} />}
          {activeTab === 'movies' && selectedMovie && <MovieAnalytics movieId={selectedMovie} onBack={() => setSelectedMovie(null)} />}


        </main>
      </div>
    </div>
  );
}





