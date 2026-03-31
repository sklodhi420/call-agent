import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useState } from 'react';
import AgentPage from './pages/AgentPage';
import StatsPage from './pages/StatsPage';
import AdminLoginPage from './pages/AdminLoginPage';

function ProtectedAdminRoute({ isAuthenticated, onLogin, onLogout }) {
  if (!isAuthenticated) {
    return <AdminLoginPage onLogin={onLogin} />;
  }
  return <StatsPage onLogout={onLogout} />;
}

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(
    localStorage.getItem('admin_authenticated') === 'true'
  );

  const handleLogin = () => {
    setIsAuthenticated(true);
    localStorage.setItem('admin_authenticated', 'true');
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('admin_authenticated');
  };

  return (
    <BrowserRouter>
      <Routes>
        {/* Public Agent Page - Standalone */}
        <Route path="/" element={<AgentPage />} />
        <Route path="/agent" element={<AgentPage />} />
        
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
