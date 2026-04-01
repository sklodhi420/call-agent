import React, { useState } from 'react';
import { Mail, ArrowRight, ShieldCheck, AlertCircle, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const SHEET_CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTLOWQmmf6Hp0OQm48zJRSkE39EGh2z1p9yl_8zlU541rYO5FKeg8muS2yvHDJxGkuriJtnizCnJKxY/pub?output=csv';

export default function LandingPage({ onValidationSuccess }) {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const validateEmail = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    
    const normalizedEmail = email.toLowerCase().trim();
    
    if (!normalizedEmail || !/^\S+@\S+\.\S+$/.test(normalizedEmail)) {
      setError('Please enter a valid email address.');
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch(SHEET_CSV_URL);
      if (!response.ok) {
         throw new Error('Access denied or sheet not published properly.');
      }
      
      const csvText = await response.text();
      // Basic CSV parsing to find the exact email match in any cell
      const rows = csvText.split('\n');
      let isEmailAuthorized = false;
      
      for (const row of rows) {
        // Split by comma and remove quotes
        const cells = row.split(',').map(cell => cell.replace(/^"|"$/g, '').trim().toLowerCase());
        if (cells.includes(normalizedEmail)) {
          isEmailAuthorized = true;
          break;
        }
      }

      if (isEmailAuthorized) {
        onValidationSuccess(normalizedEmail);
      } else {
        setError('Unauthorized access. Your email is not on the approved list.');
      }
    } catch (err) {
      console.error('Validation error:', err);
      setError('Could not reach validation server. Please ensure the Google Sheet is published to the web as CSV.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center relative overflow-hidden font-sans selection:bg-blue-500/30">
      
      {/* Dynamic Background Elements - Premium Feel */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/20 rounded-full blur-[120px] mix-blend-screen animate-pulse" style={{ animationDuration: '8s' }}></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-600/20 rounded-full blur-[120px] mix-blend-screen animate-pulse" style={{ animationDuration: '12s' }}></div>
        <div className="absolute top-[40%] left-[60%] w-[20%] h-[20%] bg-purple-600/10 rounded-full blur-[80px] mix-blend-screen animate-pulse" style={{ animationDuration: '10s' }}></div>
      </div>

      {/* Main Glassmorphic Card */}
      <div className="z-10 w-full max-w-md p-8 md:p-10 mx-4 bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] transition-all duration-500 hover:shadow-[0_8px_32px_0_rgba(59,130,246,0.15)] hover:border-white/20">
        
        {/* Header Section */}
        <div className="flex flex-col items-center mb-10 text-center space-y-4">
          <div className="w-16 h-16 bg-gradient-to-tr from-blue-500 to-indigo-500 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/30 transform transition-transform hover:rotate-6 hover:scale-105 duration-300">
            <ShieldCheck className="w-8 h-8 text-white" strokeWidth={2} />
          </div>
          <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400 tracking-tight">
            Secure Access
          </h1>
          <p className="text-slate-400 text-sm max-w-[280px]">
            Please verify your identity to access the Agent platform.
          </p>
        </div>

        {/* Form Section */}
        <form onSubmit={validateEmail} className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium text-slate-300 ml-1">
              Authorized Email
            </label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-slate-500 group-focus-within:text-blue-400 transition-colors duration-300" />
              </div>
              <input
                id="email"
                type="email"
                required
                className="w-full pl-12 pr-4 py-4 bg-slate-900/50 border border-slate-700/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-300"
                placeholder="you@company.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (error) setError(null);
                }}
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="flex items-start bg-red-500/10 border border-red-500/20 rounded-xl p-4 animate-in fade-in slide-in-from-top-2 duration-300">
              <AlertCircle className="h-5 w-5 text-red-400 shrink-0 mt-0.5" />
              <p className="ml-3 text-sm text-red-200/90 leading-relaxed">
                {error}
              </p>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading || !email}
            className="group relative w-full flex justify-center py-4 px-4 border border-transparent text-sm font-bold rounded-xl text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-950 focus:ring-blue-500 shadow-lg shadow-blue-600/25 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 overflow-hidden"
          >
            {/* Hover Glare Effect */}
            <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></div>
            
            <span className="flex items-center tracking-wide z-10">
              {isLoading ? (
                <>
                  <Loader2 className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" />
                  Verifying...
                </>
              ) : (
                <>
                  Proceed to App
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
                </>
              )}
            </span>
          </button>
        </form>
      </div>
      
      {/* Footer Text */}
      <div className="absolute bottom-8 mt-12 text-center text-xs text-slate-500">
        Protected by Agent Authorization System
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes shimmer {
          100% { transform: translateX(100%); }
        }
      `}} />
    </div>
  );
}
