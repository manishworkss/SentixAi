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

function LoginLayout({ onLogin }: { onLogin: () => void }) {
  const [showPassword, setShowPassword] = useState(false);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin();
  };

  return (
    <div className="min-h-screen flex bg-white font-sans text-gray-900">
      
      {/* Left Column - Login Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-8 sm:px-16 md:px-24 xl:px-32 relative z-10 bg-white">
        
        {/* Header Section */}
        <div className="mb-10">
          <div className="flex flex-col items-start mb-12">
            <img src="/logo.png" alt="SentixAI Logo" className="h-20 object-contain mb-3" />
            <span className="text-3xl font-black text-gray-900 tracking-tight">
              Sentix<span className="text-cyan-500 font-medium">[Ai]</span>
            </span>
          </div>
          
          <h1 className="text-4xl font-extrabold text-gray-900 mb-2">Welcome back</h1>
          <p className="text-sm text-gray-500">Enter your credentials to access your personalized intelligence workspace.</p>
        </div>

        {/* Form Section */}
        <form onSubmit={handleSubmit} className="space-y-5">
          
          <div>
            <label className="block text-xs font-bold text-gray-700 tracking-wider uppercase mb-1">Email Address</label>
            <input
              type="email"
              required
              defaultValue="executive@studio.com"
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-colors shadow-sm text-sm placeholder-gray-400"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-xs font-bold text-gray-700 tracking-wider uppercase">Password</label>
              <a href="#" className="text-xs font-medium text-cyan-600 hover:text-cyan-500">Forgot password?</a>
            </div>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                defaultValue="password"
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-colors shadow-sm text-sm placeholder-gray-400 pr-10"
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
              className="w-full flex items-center justify-center py-3 px-4 rounded-lg shadow-sm text-sm font-semibold text-white bg-[#0093A9] hover:bg-[#007A8D] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0093A9] transition-colors"
            >
              Sign in to workspace <ArrowRight className="ml-2 h-4 w-4" />
            </button>
          </div>
        </form>

        <div className="mt-8">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-2 bg-white text-gray-400 font-medium uppercase tracking-wider">
                Or continue with
              </span>
            </div>
          </div>

          <div className="mt-6">
            <button
              type="button"
              className="w-full flex justify-center items-center py-3 px-4 border border-gray-200 rounded-lg shadow-sm bg-white text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z" />
              </svg>
              Sign in with Google
            </button>
          </div>
        </div>
        
        <p className="mt-10 text-center text-sm text-gray-600">
          Don't have an account? <a href="#" className="font-semibold text-cyan-600 hover:text-cyan-500">Create one now</a>
        </p>

      </div>

      {/* Right Column - Features & Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-cyan-50 via-white to-cyan-100 overflow-hidden">
        
        {/* Subtle Grid Background */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGcgc3Ryb2tlPSJyZ2JhKDE1NiwxNjMsMTc1LDAuMSkiIGZpbGw9Im5vbmUiPjxwYXRoIGQ9Ik0wIDQwaDQwVjBIMHoiLz48L2c+PC9zdmc+')] z-0 opacity-50"></div>
        
        <div className="relative z-10 flex flex-col justify-center px-16 xl:px-24 w-full">
          
          <div className="mb-10">
            <div className="inline-flex items-center px-3 py-1 rounded-full border border-cyan-200 bg-cyan-50 text-cyan-700 text-xs font-semibold mb-6 shadow-sm">
              <BrainCircuit className="w-3.5 h-3.5 mr-1.5" />
              AI-Powered Studio Insights
            </div>
            
            <h2 className="text-5xl font-extrabold text-gray-900 leading-tight tracking-tight">
              Your intelligent <br/>
              <span className="text-cyan-500">movie co-pilot</span>
            </h2>
          </div>

          <div className="space-y-4">
            
            {/* Feature 1 */}
            <div className="bg-white rounded-2xl p-6 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] border border-gray-100/50">
              <div className="flex items-start">
                <div className="mt-1 mr-3 h-2 w-2 rounded-full bg-cyan-500"></div>
                <div>
                  <h3 className="text-base font-bold text-gray-900 mb-1">Real-time audience sentiment</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">Instant breakdown of exactly what audiences love and what's falling flat.</p>
                </div>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="bg-white rounded-2xl p-6 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] border border-gray-100/50">
              <div className="flex items-start">
                <div className="mt-1 mr-3 h-2 w-2 rounded-full bg-cyan-500"></div>
                <div>
                  <h3 className="text-base font-bold text-gray-900 mb-1">Automated review aggregation</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">Collect thousands of reviews from all platforms instantly without manual work.</p>
                </div>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="bg-white rounded-2xl p-6 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] border border-gray-100/50">
              <div className="flex items-start">
                <div className="mt-1 mr-3 h-2 w-2 rounded-full bg-cyan-500"></div>
                <div>
                  <h3 className="text-base font-bold text-gray-900 mb-1">24/7 AI-driven insights</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">Make data-backed decisions for your next blockbuster with your dedicated AI.</p>
                </div>
              </div>
            </div>

          </div>

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
        <div className="h-24 flex flex-col justify-center px-6 border-b border-gray-200">
          <div className="flex flex-col items-start">
            <img src="/logo.png" alt="SentixAI Logo" className="h-10 object-contain mb-1" />
            <span className="text-xl font-black text-gray-900 tracking-tight">
              Sentix<span className="text-cyan-500 font-medium">[Ai]</span>
            </span>
          </div>
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
