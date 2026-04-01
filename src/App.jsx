import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useState } from 'react';
import AgentPage from './pages/AgentPage';
import StatsPage from './pages/StatsPage';
import AdminLoginPage from './pages/AdminLoginPage';
import LandingPage from './pages/LandingPage';

function ProtectedAdminRoute({ isAuthenticated, onLogin, onLogout }) {
  if (!isAuthenticated) {
    return <AdminLoginPage onLogin={onLogin} />;
  }
  return <StatsPage onLogout={onLogout} />;
}

// Protect the Agent Page
function ProtectedAgentRoute({ isEmailValidated, children }) {
  if (!isEmailValidated) {
    return <Navigate to="/" replace />;
  }
  return children;
}

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(
    localStorage.getItem('admin_authenticated') === 'true'
  );

  // Email validation state - using sessionStorage so it forgets when they close the tab!
  const [isEmailValidated, setIsEmailValidated] = useState(
    sessionStorage.getItem('user_email_validated') === 'true'
  );

  const handleLogin = () => {
    setIsAuthenticated(true);
    localStorage.setItem('admin_authenticated', 'true');
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('admin_authenticated');
  };

  const handleValidationSuccess = (email) => {
    setIsEmailValidated(true);
    sessionStorage.setItem('user_email_validated', 'true');
  };

  return (
    <BrowserRouter>
      <Routes>
        {/* Landing Page */}
        <Route 
          path="/" 
          element={
            isEmailValidated ? (
              <Navigate to="/agent" replace />
            ) : (
              <LandingPage onValidationSuccess={handleValidationSuccess} />
            )
          } 
        />
        
        {/* Protected Agent Page */}
        <Route 
          path="/agent" 
          element={
            <ProtectedAgentRoute isEmailValidated={isEmailValidated}>
              <AgentPage />
            </ProtectedAgentRoute>
          } 
        />
        
        {/* Completely Separate Admin Page */}
        <Route path="/admin" element={
          <ProtectedAdminRoute 
            isAuthenticated={isAuthenticated} 
            onLogin={handleLogin} 
            onLogout={handleLogout}
          />
        } />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
