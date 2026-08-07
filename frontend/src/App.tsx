import React, { useState } from 'react';
import { 
  BarChart3, 
  Upload, 
  Settings, 
  LogOut, 
  Film, 
  CheckCircle2, 
  AlertTriangle,
  FileText,
  User,
  Eye,
  ArrowRight,
  BrainCircuit
} from 'lucide-react';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard', 'upload'

  if (!isAuthenticated) {
    return <LoginLayout onLogin={() => setIsAuthenticated(true)} />;
  }

  return (
    <DashboardShell 
      activeTab={activeTab} 
      setActiveTab={setActiveTab}
      onLogout={() => setIsAuthenticated(false)} 
    />
  );
}

function Logo({ variant = 'large', theme = 'light' }: { variant?: 'large' | 'small', theme?: 'light' | 'dark' }) {
  const isLarge = variant === 'large';
  const iconClass = isLarge ? 'h-32 mb-4' : 'h-10 mr-3';
  const textSize = isLarge ? 'text-5xl' : 'text-2xl';
  const textColor = theme === 'light' ? 'text-[#1A365D]' : 'text-white';
  const subtextColor = theme === 'light' ? 'text-gray-500' : 'text-gray-400';

  const subtext = isLarge && (
    <div className={`mt-2 text-xs uppercase tracking-wider font-semibold text-center ${subtextColor}`}>
      AI-Powered Movie Reviews & Recommendations
    </div>
  );

  return (
    <div className={`flex ${isLarge ? 'flex-col items-center text-center' : 'flex-row items-center'} font-sans`}>
      <img src="/logo.png" alt="SentixAI Logo" className={`${iconClass} object-contain`} />
      <div className={isLarge ? '' : 'flex flex-col'}>
        <div className={`${textSize} font-extrabold tracking-tight leading-none`}>
          <span className={textColor}>Sentix</span><span className="text-[#00B4D8] font-light">[Ai]</span>
        </div>
        {subtext}
      </div>
    </div>
  );
}

function LoginLayout({ onLogin }: { onLogin: () => void }) {
  const [showPassword, setShowPassword] = useState(false);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGcgc3Ryb2tlPSJyZ2JhKDE1NiwxNjMsMTc1LDAuMDUpIiBmaWxsPSJub25lIj48cGF0aCBkPSJNMCA0MGg0MFYwSDB6Ii8+PC9nPjwvc3ZnPg==')] bg-gray-50 font-sans text-gray-900 p-4 sm:p-8 relative">
      
      {/* Split Login Card */}
      <div className="w-full max-w-5xl flex flex-col md:flex-row bg-white rounded-3xl shadow-2xl overflow-hidden min-h-[600px] border border-gray-100 z-10">
        
        {/* Left Side - Dark */}
        <div className="w-full md:w-[45%] bg-gradient-to-br from-[#1c1333] to-[#0f0a1c] p-10 sm:p-12 flex flex-col justify-center text-white relative">
          <div className="mb-10 flex justify-center w-full">
            <Logo variant="large" theme="dark" />
          </div>
          
          <div className="flex flex-col text-center md:text-left">
            <h1 className="text-4xl font-bold mb-4 tracking-tight">Welcome Back</h1>
            <p className="text-gray-400 leading-relaxed text-base">
              Access your centralized movie intelligence platform. Streamline your reviews and analytics with SentixAI.
            </p>
          </div>
        </div>

        {/* Right Side - Form */}
        <div className="w-full md:w-[55%] p-10 sm:p-16 flex flex-col justify-center bg-white">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">Sign In to Your Account</h2>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
              <input
                type="email"
                required
                defaultValue="executive@studio.com"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-colors shadow-sm placeholder-gray-400"
                placeholder="name@company.com"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium text-gray-700">Password</label>
                <a href="#" className="text-sm font-medium text-cyan-600 hover:text-cyan-500">Forgot Password?</a>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  defaultValue="password"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-colors shadow-sm placeholder-gray-400 pr-10"
                  placeholder="Enter your password"
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                >
                  <Eye className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="w-full flex items-center justify-center py-3.5 px-4 rounded-xl shadow-sm font-semibold text-white bg-[#1c1333] hover:bg-[#2d1e52] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#1c1333] transition-colors"
              >
                Sign In
              </button>
            </div>
          </form>

          <div className="mt-8">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500">
                  or
                </span>
              </div>
            </div>

            <div className="mt-8">
              <button
                type="button"
                className="w-full flex justify-center items-center py-3.5 px-4 border border-gray-300 rounded-xl shadow-sm bg-white font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <svg className="h-5 w-5 mr-3" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z" />
                </svg>
                Sign In with Google
              </button>
            </div>
          </div>
          
          <p className="mt-10 text-center text-sm text-gray-600">
            Don't have an account? <a href="#" className="font-semibold text-gray-900 hover:underline">Contact your administrator.</a>
          </p>
        </div>
      </div>
    </div>
  );
}

function DashboardShell({ activeTab, setActiveTab, onLogout }: { activeTab: string, setActiveTab: (tab: string) => void, onLogout: () => void }) {
  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-md flex flex-col z-20 relative">
        <div className="h-32 flex flex-col justify-center px-6 border-b border-gray-200">
          <Logo variant="small" />
        </div>
        
        <div className="flex-1 overflow-y-auto py-4">
          <nav className="px-4 space-y-2">
            <button 
              onClick={() => setActiveTab('dashboard')}
              className={`w-full flex items-center px-4 py-2 text-sm font-medium rounded-md ${activeTab === 'dashboard' ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50'}`}
            >
              <BarChart3 className="mr-3 h-5 w-5" />
              Analytics Dashboard
            </button>
            <button 
              onClick={() => setActiveTab('upload')}
              className={`w-full flex items-center px-4 py-2 text-sm font-medium rounded-md ${activeTab === 'upload' ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50'}`}
            >
              <Upload className="mr-3 h-5 w-5" />
              Upload Data
            </button>
            <button 
              className="w-full flex items-center px-4 py-2 text-sm font-medium rounded-md text-gray-600 hover:bg-gray-50"
            >
              <FileText className="mr-3 h-5 w-5" />
              Projects
            </button>
          </nav>
        </div>
        
        <div className="p-4 border-t border-gray-200">
          <button 
            className="w-full flex items-center px-4 py-2 text-sm font-medium rounded-md text-gray-600 hover:bg-gray-50"
          >
            <Settings className="mr-3 h-5 w-5" />
            Settings
          </button>
          <button 
            onClick={onLogout}
            className="w-full mt-2 flex items-center px-4 py-2 text-sm font-medium rounded-md text-red-600 hover:bg-red-50"
          >
            <LogOut className="mr-3 h-5 w-5" />
            Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 bg-white shadow-sm flex items-center justify-between px-8 z-10">
          <h1 className="text-2xl font-semibold text-gray-800">
            {activeTab === 'dashboard' ? 'Executive Analytics' : 'Data Ingestion'}
          </h1>
          <div className="flex items-center space-x-4">
            <div className="flex items-center text-sm font-medium text-gray-700">
              <span className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center mr-2">
                <User className="h-5 w-5 text-gray-500" />
              </span>
              Studio Executive
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-8">
          {activeTab === 'dashboard' ? <AnalyticsDashboard /> : <UploadForm />}
        </main>
      </div>
    </div>
  );
}

function UploadForm() {
  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Ingest Movie Reviews</h2>
        
        <form className="space-y-6">
          <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label htmlFor="movie-title" className="block text-sm font-medium text-gray-700">
                Project / Movie Title
              </label>
              <div className="mt-1">
                <input
                  type="text"
                  name="movie-title"
                  id="movie-title"
                  className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md border p-2"
                  placeholder="e.g. Dune: Part Two"
                />
              </div>
            </div>

            <div>
              <label htmlFor="source-platform" className="block text-sm font-medium text-gray-700">
                Source Platform
              </label>
              <div className="mt-1">
                <select
                  id="source-platform"
                  name="source-platform"
                  className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md border p-2"
                >
                  <option>IMDb</option>
                  <option>Rotten Tomatoes</option>
                  <option>Letterboxd</option>
                  <option>Custom JSON/CSV</option>
                </select>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Upload Dataset (CSV/JSON)</label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
              <div className="space-y-1 text-center">
                <Upload className="mx-auto h-12 w-12 text-gray-400" />
                <div className="flex text-sm text-gray-600 justify-center">
                  <label
                    htmlFor="file-upload"
                    className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
                  >
                    <span>Upload a file</span>
                    <input id="file-upload" name="file-upload" type="file" className="sr-only" />
                  </label>
                  <p className="pl-1">or drag and drop</p>
                </div>
                <p className="text-xs text-gray-500">CSV, JSON up to 50MB</p>
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 mr-3"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Trigger Data Ingestion API
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function AnalyticsDashboard() {
  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <FileText className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Reviews Processed</dt>
                  <dd>
                    <div className="text-lg font-medium text-gray-900">1,245,892</div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-5 py-3 border-t border-gray-200">
            <div className="text-sm text-green-600">↑ 12.4% MoM</div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CheckCircle2 className="h-6 w-6 text-green-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Positive Sentiment</dt>
                  <dd>
                    <div className="text-lg font-medium text-gray-900">712,400</div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-5 py-3 border-t border-gray-200">
            <div className="text-sm text-green-600">↑ 57.1% Share</div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <AlertTriangle className="h-6 w-6 text-red-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Negative Sentiment</dt>
                  <dd>
                    <div className="text-lg font-medium text-gray-900">389,102</div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-5 py-3 border-t border-gray-200">
            <div className="text-sm text-red-600">↓ 31.2% Share</div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <AlertTriangle className="h-6 w-6 text-yellow-500" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Spam Quarantine Rate</dt>
                  <dd>
                    <div className="text-lg font-medium text-gray-900">4.2%</div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-5 py-3 border-t border-gray-200">
            <div className="text-sm text-gray-500">Filtered Bots & Bombs</div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Aspect Scores */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Core Aspect Sentiments</h3>
            <div className="space-y-4">
              <AspectScore label="Cinematography" score={88} color="bg-green-500" />
              <AspectScore label="Acting Quality" score={75} color="bg-green-400" />
              <AspectScore label="Storyline" score={42} color="bg-yellow-500" />
              <AspectScore label="Pacing" score={35} color="bg-red-500" />
            </div>
          </div>
        </div>

        {/* LLM Report Card */}
        <div className="lg:col-span-2">
          <div className="bg-white shadow rounded-lg p-6 h-full border border-blue-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg leading-6 font-medium text-gray-900">Frontier LLM Executive Summary</h3>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                Powered by Gemini
              </span>
            </div>
            <div className="prose prose-sm text-gray-600">
              <p className="font-semibold text-gray-900">Analysis for: "Dune: Part Two"</p>
              <p>
                The target audience highly appreciates the <strong>cinematography</strong> and raw imagery (88% positive sentiment), citing it as a "visual masterpiece." Performances by the main cast are also viewed very favorably (75% positive).
              </p>
              <p>
                However, SentixAI detected significant negative feedback regarding structural <strong>storyline cohesion</strong> and <strong>pacing</strong>. Many authentic reviewers noted a "dragging mid-section" that hindered the overall experience.
              </p>
              <div className="mt-4 p-4 bg-gray-50 rounded-md border-l-4 border-blue-500">
                <h4 className="text-sm font-bold text-gray-900">Actionable Studio Insight:</h4>
                <p className="mt-1 text-sm">
                  For future extended cuts or similar sci-fi epics, maintain the high budget allocation for VFX/Cinematography, but strongly consider tighter editing in the second act to address pacing criticisms.
                </p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

function AspectScore({ label, score, color }: { label: string, score: number, color: string }) {
  return (
    <div>
      <div className="flex justify-between items-center mb-1">
        <span className="text-sm font-medium text-gray-700">{label}</span>
        <span className="text-sm font-medium text-gray-900">{score}% Positive</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2.5">
        <div className={`${color} h-2.5 rounded-full`} style={{ width: `${score}%` }}></div>
      </div>
    </div>
  );
}
