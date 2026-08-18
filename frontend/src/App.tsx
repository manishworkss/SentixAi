import React, { useState } from 'react';
import {
  BarChart3,
  Upload,
  Settings,
  LogOut,
  FileText,
  Eye,
  Film
} from 'lucide-react';

import { AuthProvider, useAuth } from './contexts/AuthContext';
import { AnalyticsDashboard } from './components/AnalyticsDashboard';
import { MoviesExplorer } from './components/MoviesExplorer';
import { MovieAnalytics } from './components/MovieAnalytics';


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
      <AppContent />
    </AuthProvider>
  );
}

function AppContent() {
  const { currentUser, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');

  if (!currentUser) {
    return <LoginLayout />;
  }

  return (
    <DashboardShell
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      onLogout={logout}
    />
  );
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

function LoginLayout() {
  const [showPassword, setShowPassword] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
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

  const API_URL = 'http://localhost:3001';

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
      setError(err.message || 'Failed to send OTP');
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
    } catch (err: any) {
      setError(err.message || 'Verification failed');
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
      }
    } catch (err: any) {
      setError(err.message || 'Failed to authenticate');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setError('');
      await loginWithGoogle();
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
    <div className={`min-h-screen flex items-center justify-center ${Theme.bgApp} ${Theme.fontFamily} ${Theme.textPrimary} p-4 sm:p-8 relative`}>

      {/* Split Login Card */}
      <div className={`w-full max-w-5xl flex flex-col md:flex-row ${Theme.bgCard} rounded-[2rem] shadow-xl overflow-hidden min-h-[600px] border ${Theme.border} z-10`}>

        {/* Left Side - Premium Dark Slate */}
        <div className={`w-full md:w-[45%] ${Theme.bgDarkPanel} p-10 sm:p-14 flex flex-col ${Theme.textInverse} relative`}>
          {/* Subtle gradient overlay to make it look premium but not "AI" */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-slate-950/50"></div>
          
          <div className="mb-12 flex justify-start w-full relative z-10">
            <Logo variant="large" theme="dark" />
          </div>

          <div className="flex-grow flex flex-col justify-start pt-4 relative z-10">
            <h1 className={`text-3xl font-bold mb-6 tracking-tight ${Theme.textInverse}`}>
              {otpStep ? "Verify Email" : (isSignUp ? "Join SentixAI" : "Welcome Back")}
            </h1>

            {otpStep ? (
              <div className={`space-y-4 ${Theme.textInverseSecondary} leading-relaxed text-sm`}>
                <p>
                  We've sent a 6-digit verification code to your email. Enter it to complete your registration.
                </p>
                <ul className="space-y-3 mt-8 font-medium">
                  <li className="flex items-center"><span className="text-indigo-400 mr-3 text-lg">✓</span> Check your inbox (and spam)</li>
                  <li className="flex items-center"><span className="text-indigo-400 mr-3 text-lg">✓</span> Code expires in 5 minutes</li>
                  <li className="flex items-center"><span className="text-indigo-400 mr-3 text-lg">✓</span> Request a new code below</li>
                </ul>
              </div>
            ) : isSignUp ? (
              <div className={`space-y-4 ${Theme.textInverseSecondary} leading-relaxed text-sm`}>
                <p>
                  Unlock the full potential of your studio's data with our advanced movie intelligence platform.
                </p>
                <ul className="space-y-3 mt-8 font-medium">
                  <li className="flex items-center"><span className="text-indigo-400 mr-3 text-lg">✓</span> Real-Time Sentiment Analysis</li>
                  <li className="flex items-center"><span className="text-indigo-400 mr-3 text-lg">✓</span> Predictive Audience Metrics</li>
                  <li className="flex items-center"><span className="text-indigo-400 mr-3 text-lg">✓</span> Centralized Studio Dashboard</li>
                </ul>
              </div>
            ) : (
              <div className={`space-y-4 ${Theme.textInverseSecondary} leading-relaxed text-sm`}>
                <p>
                  Access your centralized movie intelligence platform. Streamline your reviews and analytics with SentixAI.
                </p>
                <ul className="space-y-3 mt-8 font-medium">
                  <li className="flex items-center"><span className="text-indigo-400 mr-3 text-lg">✓</span> Track Real-Time Audience Sentiments</li>
                  <li className="flex items-center"><span className="text-indigo-400 mr-3 text-lg">✓</span> Review Automated Breakdowns</li>
                  <li className="flex items-center"><span className="text-indigo-400 mr-3 text-lg">✓</span> Generate Predictive Reports</li>
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* Right Side - Form or OTP */}
        <div className={`w-full md:w-[55%] p-10 sm:p-14 flex flex-col justify-center ${Theme.bgCard} relative`}>

          {/* ════════════════════════════════════════════════════════ */}
          {/* OTP VERIFICATION SCREEN */}
          {/* ════════════════════════════════════════════════════════ */}
          {otpStep ? (
            <div>
              <button
                type="button"
                onClick={handleBackFromOtp}
                className="flex items-center text-sm font-bold ${Theme.textSecondary} hover:text-slate-800 mb-8 transition-colors"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                </svg>
                Back to signup
              </button>

              <h2 className="text-2xl font-bold ${Theme.textPrimary} mb-2">
                Enter Verification Code
              </h2>
              <p className="text-sm font-medium ${Theme.textSecondary} mb-8">
                We sent a 6-digit code to <span className="font-bold text-slate-800">{email}</span>
              </p>

              {error && (
                <div className="p-4 bg-rose-50 text-rose-700 font-medium text-sm rounded-xl border border-rose-100 mb-6">
                  {error}
                </div>
              )}

              {success && (
                <div className="p-4 bg-emerald-50 text-emerald-700 font-medium text-sm rounded-xl border border-emerald-100 mb-6">
                  {success}
                </div>
              )}

              {/* 6-Digit OTP Input */}
              <div className="flex gap-3 mb-8" onPaste={handleOtpPaste}>
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
                    className={`w-12 h-14 text-center text-xl font-bold ${Theme.bgInput} border ${Theme.border} rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 focus:${Theme.bgCard} transition-all shadow-sm ${Theme.textPrimary}`}
                    autoFocus={index === 0}
                  />
                ))}
              </div>

              {/* Verify Button */}
              <button
                type="button"
                onClick={verifyOtp}
                disabled={isLoading || otpDigits.join('').length !== 6}
                className="w-full flex items-center justify-center py-4 px-4 rounded-xl shadow-md font-bold text-white bg-slate-900 hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-900 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Verifying...' : 'Verify & Create Account'}
              </button>

              {/* Resend OTP */}
              <div className="mt-8 text-center">
                {resendCooldown > 0 ? (
                  <p className="text-sm font-medium text-slate-400">
                    Resend code in <span className="font-bold text-slate-700">{resendCooldown}s</span>
                  </p>
                ) : (
                  <button
                    type="button"
                    onClick={sendOtp}
                    disabled={isLoading}
                    className="text-sm font-bold ${Theme.accentText} ${Theme.accentTextHover} disabled:opacity-50"
                  >
                    Didn't receive the code? Resend
                  </button>
                )}
              </div>
            </div>
          ) : (
            /* ════════════════════════════════════════════════════════ */
            /* NORMAL LOGIN / SIGNUP FORM */
            /* ════════════════════════════════════════════════════════ */
            <>
              <h2 className="text-2xl font-bold ${Theme.textPrimary} mb-8">
                {isSignUp ? "Create Your Account" : "Sign In to Your Account"}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-5">
                {error && (
                  <div className="p-4 bg-rose-50 text-rose-700 font-medium text-sm rounded-xl border border-rose-100">
                    {error}
                  </div>
                )}

                {isSignUp && (
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Full Name</label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className={`w-full px-4 py-3.5 ${Theme.bgInput} border ${Theme.border} rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 focus:${Theme.bgCard} transition-all shadow-sm font-medium placeholder-slate-400 ${Theme.textPrimary}`}
                      placeholder="John Doe"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Email Address</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={`w-full px-4 py-3.5 ${Theme.bgInput} border ${Theme.border} rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 focus:${Theme.bgCard} transition-all shadow-sm font-medium placeholder-slate-400 ${Theme.textPrimary}`}
                    placeholder="name@company.com"
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-sm font-bold text-slate-700">Password</label>
                    <a href="#" className="text-sm font-bold ${Theme.accentText} ${Theme.accentTextHover}">Forgot Password?</a>
                  </div>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className={`w-full px-4 py-3.5 ${Theme.bgInput} border ${Theme.border} rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 focus:${Theme.bgCard} transition-all shadow-sm font-medium placeholder-slate-400 pr-10 ${Theme.textPrimary}`}
                      placeholder="Enter your password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600"
                    >
                      <Eye className="h-5 w-5" />
                    </button>
                  </div>
                </div>

                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full flex items-center justify-center py-4 px-4 rounded-xl shadow-md font-bold text-white bg-slate-900 hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-900 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? 'Processing...' : (isSignUp ? "Sign Up" : "Sign In")}
                  </button>
                </div>
              </form>

              <div className="mt-8">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-100"></div>
                  </div>
                  <div className="relative flex justify-center text-sm font-bold">
                    <span className={`px-4 ${Theme.bgCard} text-slate-400 uppercase tracking-widest text-[10px]`}>
                      or continue with
                    </span>
                  </div>
                </div>

                <div className="mt-6">
                  <button
                    type="button"
                    onClick={handleGoogleSignIn}
                    disabled={isLoading}
                    className={`w-full flex justify-center items-center py-3.5 px-4 ${Theme.bgCard} border ${Theme.border} rounded-xl shadow-sm font-bold text-slate-700 hover:${Theme.bgInput} transition-all disabled:opacity-50`}
                  >
                    <svg className="h-5 w-5 mr-3" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z" />
                    </svg>
                    Google
                  </button>
                </div>
              </div>

              <p className="mt-10 text-center text-sm font-medium ${Theme.textSecondary}">
                {isSignUp ? (
                  <>
                    Already have an account? <button type="button" onClick={() => setIsSignUp(false)} className="font-bold ${Theme.accentText} ${Theme.accentTextHover}">Sign in</button>
                  </>
                ) : (
                  <>
                    Don't have an account? <button type="button" onClick={() => setIsSignUp(true)} className="font-bold ${Theme.accentText} ${Theme.accentTextHover}">Create one now</button>
                  </>
                )}
              </p>
            </>
          )}
        </div>
      </div>
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
              onClick={() => { setActiveTab('upload'); setSelectedMovie(null); }}
              className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${activeTab === 'upload' ? `${Theme.primary} ${Theme.textInverse} shadow-md` : `${Theme.textSecondary} hover:bg-slate-50 hover:${Theme.textPrimary}`}`}
            >
              <Upload className="mr-3 h-[18px] w-[18px]" />
              Ingest Data
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
        {(activeTab === 'upload') && (
          <header className={`h-[96px] flex items-center justify-between px-10 shrink-0 ${Theme.bgApp}`}>
            <div>
              <h1 className={`text-2xl font-bold ${Theme.textPrimary} tracking-tight`}>
                Data Ingestion
              </h1>
              <p className={`text-sm mt-1 ${Theme.textSecondary} font-medium`}>
                Upload and process review datasets
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className={`flex items-center gap-3 ${Theme.bgCard} px-4 py-2 rounded-2xl border ${Theme.border} shadow-sm`}>
                <div className={`h-9 w-9 rounded-full flex items-center justify-center text-sm font-bold ${Theme.primary} ${Theme.textInverse}`}>
                  {displayName.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className={`text-sm font-bold ${Theme.textPrimary}`}>{displayName}</div>
                  <div className={`text-xs ${Theme.textSecondary} font-medium`}>Studio Executive</div>
                </div>
              </div>
            </div>
          </header>
        )}

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto">
          {activeTab === 'dashboard' && <AnalyticsDashboard />}
          {activeTab === 'movies' && !selectedMovie && <MoviesExplorer onSelectMovie={setSelectedMovie} />}
          {activeTab === 'movies' && selectedMovie && <MovieAnalytics movieId={selectedMovie} onBack={() => setSelectedMovie(null)} />}
          {activeTab === 'upload' && (
            <div className="px-10 pb-10 max-w-7xl mx-auto space-y-8 mt-10">
              <UploadForm onSuccess={() => setActiveTab('dashboard')} />
            </div>
          )}

        </main>
      </div>
    </div>
  );
}

function UploadForm({ onSuccess }: { onSuccess: (data: any) => void }) {
  const [loading, setLoading] = useState(false);
  return (
    <div className="max-w-3xl mx-auto mt-4">
      <div className={`rounded-3xl p-10 ${Theme.bgCard} border ${Theme.border} shadow-sm`}>
        <h2 className={`text-xl font-bold mb-8 ${Theme.textPrimary}`}>Ingest Movie Reviews</h2>

        <form className="space-y-8" onSubmit={(e) => { e.preventDefault(); setLoading(true); setTimeout(() => { setLoading(false); onSuccess({}); }, 1000); }}>
          <div className="grid grid-cols-1 gap-y-8 gap-x-6 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="block text-sm font-semibold mb-2 text-slate-700">Project / Movie Title</label>
              <input
                type="text"
                className={`w-full px-5 py-4 rounded-2xl text-sm font-medium ${Theme.bgInput} border ${Theme.border} focus:outline-none focus:ring-2 focus:ring-slate-900 focus:${Theme.bgCard} transition-all placeholder:text-slate-400`}
                placeholder="e.g. tt15398776"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2 text-slate-700">Source Platform</label>
              <select
                className={`w-full px-5 py-4 rounded-2xl text-sm font-medium ${Theme.bgInput} border ${Theme.border} focus:outline-none focus:ring-2 focus:ring-slate-900 focus:${Theme.bgCard} transition-all text-slate-700`}
              >
                <option>IMDb</option>
                <option>Rotten Tomatoes</option>
                <option>Letterboxd</option>
                <option>Custom JSON/CSV</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2 text-slate-700">Upload Dataset</label>
            <div className={`flex justify-center px-6 pt-10 pb-10 rounded-3xl border-2 border-dashed ${Theme.border} ${Theme.bgInput} hover:bg-slate-100 transition-colors`}>
              <div className="space-y-3 text-center">
                <div className={`w-16 h-16 ${Theme.bgCard} rounded-full flex items-center justify-center mx-auto shadow-sm border border-slate-100`}>
                  <Upload className="h-7 w-7 text-slate-600" />
                </div>
                <div className="flex text-sm justify-center text-slate-600 font-medium mt-4">
                  <label htmlFor="file-upload" className={`cursor-pointer font-bold ${Theme.accentText} ${Theme.accentTextHover}`}>
                    <span>Click to upload</span>
                    <input id="file-upload" type="file" className="sr-only" />
                  </label>
                  <p className="pl-1">or drag and drop</p>
                </div>
                <p className={`text-xs ${Theme.textSecondary} font-medium`}>CSV, JSON up to 50MB</p>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-4 pt-4">
            <button type="button" className={`py-3.5 px-6 rounded-2xl text-sm font-bold text-slate-600 ${Theme.bgCard} border ${Theme.border} hover:bg-slate-100 transition-all`}>Cancel</button>
            <button type="submit" disabled={loading} className={`py-3.5 px-8 rounded-2xl text-sm font-bold ${Theme.textInverse} ${Theme.primary} ${Theme.primaryHover} shadow-md transition-all disabled:opacity-50`}>
              {loading ? "Scraping IMDb..." : "Trigger Ingestion"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}



