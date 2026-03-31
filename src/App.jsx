import { BrowserRouter, Routes, Route, useNavigate, useParams } from 'react-router-dom';
import { useState } from 'react';
import {
  LayoutDashboard, Phone, BarChart2,
  ChevronLeft, ChevronRight, Settings, LogOut
} from 'lucide-react';
import AgentPage from './pages/AgentPage';
import StatsPage from './pages/StatsPage';

const menuItems = [
  { id: 'agent', label: 'Agent', icon: Phone },
  { id: 'stats', label: 'Call Stats', icon: BarChart2 },
];

function Sidebar({ activeSection, onSectionChange, isMobileMenuOpen, setIsMobileMenuOpen }) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={`relative flex flex-col bg-gray-900 border-r border-gray-800 transition-all duration-300 ${
        isMobileMenuOpen ? 'fixed inset-0 z-50 w-full' : 'hidden'
      } md:relative md:flex ${collapsed ? 'md:w-16' : 'md:w-64'}`}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-6 border-b border-gray-800">
        <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-blue-500/10">
          <LayoutDashboard className="w-5 h-5 text-blue-500" />
        </div>
        {!collapsed && (
          <span className="text-lg font-semibold text-white">Admin Panel</span>
        )}
        <button
          onClick={() => setIsMobileMenuOpen(false)}
          className="ml-auto md:hidden text-gray-400 hover:text-white p-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 py-4 space-y-1">
        {menuItems.map(({ id, label, icon: Icon }) => {
          const isActive = activeSection === id;
          return (
            <button
              key={id}
              onClick={() => onSectionChange(id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 hover:bg-gray-800 group ${
                isActive
                  ? 'bg-blue-500/10 text-blue-500 border border-blue-500/20'
                  : 'text-gray-400'
              }`}
            >
              <Icon className={`w-5 h-5 transition-colors ${
                isActive ? 'text-blue-500' : 'text-gray-400 group-hover:text-blue-500'
              }`} />
              {!collapsed && (
                <span className={`font-medium transition-colors ${
                  isActive ? 'text-blue-500' : 'group-hover:text-white'
                }`}>
                  {label}
                </span>
              )}
              {isActive && !collapsed && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-500" />
              )}
            </button>
          );
        })}
      </nav>

      {/* Settings */}
      <div className="px-2 py-4 border-t border-gray-800">
        <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-400 hover:bg-gray-800 transition-colors">
          <Settings className="w-5 h-5" />
          {!collapsed && <span className="font-medium">Settings</span>}
        </button>
      </div>

      {/* Collapse toggle — desktop only */}
      <button
        onClick={() => setCollapsed(c => !c)}
        className="hidden md:flex absolute -right-3 top-20 w-6 h-6 rounded-full bg-gray-800 border border-gray-700 items-center justify-center text-gray-400 hover:text-white hover:bg-gray-700 transition-colors"
      >
        {collapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
      </button>
    </aside>
  );
}

function Layout() {
  const navigate = useNavigate();
  const { section } = useParams();
  const activeSection = section || 'agent';
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const sectionTitle = {
    agent: 'Calling Agent',
    stats: 'Call Statistics',
  };

  return (
    <div className="flex h-screen bg-gray-950">
      <Sidebar
        activeSection={activeSection}
        onSectionChange={(id) => navigate(`/${id}`)}
        isMobileMenuOpen={isMobileMenuOpen}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
      />

      <main className="flex-1 overflow-hidden flex flex-col">
        {/* Header */}
        <header className="h-16 border-b border-gray-800 bg-gray-900/50 backdrop-blur-xl flex items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsMobileMenuOpen(p => !p)}
              className="md:hidden text-gray-400 hover:text-white p-2"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <div>
              <h1 className="text-xl font-semibold text-white">
                {sectionTitle[activeSection] || 'Admin Panel'}
              </h1>
              <p className="text-sm text-gray-400 hidden md:block">
                Manage and monitor your calling agent
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-semibold text-sm">
              A
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          <Routes>
            <Route path="/" element={<AgentPage />} />
            <Route path="/agent" element={<AgentPage />} />
            <Route path="/stats" element={<StatsPage />} />
          </Routes>
        </div>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/*" element={<Layout />} />
      </Routes>
    </BrowserRouter>
  );
}
