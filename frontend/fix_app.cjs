const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// 1. Imports
code = code.replace(
  "import { AnalyticsDashboard } from './components/AnalyticsDashboard';\nimport { MoviesExplorer } from './components/MoviesExplorer';\nimport { MovieAnalytics } from './components/MovieAnalytics';",
  "import { Dashboard } from './pages/Dashboard';"
);

// 2. Routes
code = code.replace(
  `        {/* List Routes */}
        <Route path="/lists" element={<Lists />} />
        <Route path="/lists/:id" element={<ListDetail />} />
      </Route>
      
      {/* Auth Route (No Navbar) */}
      <Route path="/login" element={!currentUser ? <LoginLayout /> : <Navigate to={location.state?.from || "/"} replace />} />
      
      {/* Admin / Dashboard Route (Sidebar) */}
      <Route path="/dashboard" element={<ProtectedRoute><AdminRoute /></ProtectedRoute>} />`,
  `        {/* List Routes */}
        <Route path="/lists" element={<Lists />} />
        <Route path="/lists/:id" element={<ListDetail />} />
        
        {/* Dashboard / Profile Routes */}
        <Route path="/dashboard" element={<ProtectedRoute message="Please log in to view your profile."><Dashboard /></ProtectedRoute>} />
      </Route>
      
      {/* Auth Route (No Navbar) */}
      <Route path="/login" element={!currentUser ? <LoginLayout /> : <Navigate to={location.state?.from || "/"} replace />} />`
);

// 3. Remove AdminRoute
code = code.replace(
  `function AdminRoute() {\n  const { logout } = useAuth();\n  const [activeTab, setActiveTab] = useState('dashboard');\n  return <DashboardShell activeTab={activeTab} setActiveTab={setActiveTab} onLogout={logout} />;\n}`,
  ""
);

// 4. Remove DashboardShell (which is at the end of the file)
const dashboardShellIndex = code.indexOf('function DashboardShell');
if (dashboardShellIndex !== -1) {
  code = code.substring(0, dashboardShellIndex);
}

fs.writeFileSync('src/App.tsx', code);
