
import React, { useState, useEffect, useRef } from "react";
import {
  PhoneCall,
  Calendar,
  Clock,
  Play,
  Pause,
  FileText,
  Search,
  RefreshCcw,
  User,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Volume2,
  VolumeX,
  Download,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Clock3,
  PhoneOff,
  LogOut
} from "lucide-react";

// Vapi environment variables
const VAPI_PRIVATE_KEY = import.meta.env.VITE_VAPI_PRIVATE_KEY || '';
const VAPI_ASSISTANT_ID = import.meta.env.VITE_VAPI_ASSISTANT_ID || '';
const VAPI_API_BASE = 'https://api.vapi.ai';

// --- Custom Audio Player Component ---
const CustomAudioPlayer = ({ src }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration);
    const onEnded = () => setIsPlaying(false);

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', updateDuration);
    audio.addEventListener('ended', onEnded);

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', updateDuration);
      audio.removeEventListener('ended', onEnded);
    };
  }, [src]);

  const togglePlay = (e) => {
    e.stopPropagation();
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (e) => {
    e.stopPropagation();
    const time = parseFloat(e.target.value);
    audioRef.current.currentTime = time;
    setCurrentTime(time);
  };

  const handleVolume = (e) => {
    e.stopPropagation();
    const val = parseFloat(e.target.value);
    setVolume(val);
    audioRef.current.volume = val;
    setIsMuted(val === 0);
  };

  const formatTime = (time) => {
    if (isNaN(time)) return "0:00";
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="bg-gray-950/80 backdrop-blur-md border border-gray-800 p-4 rounded-2xl shadow-2xl flex flex-col gap-3" onClick={e => e.stopPropagation()}>
      <audio ref={audioRef} src={src} preload="metadata" />

      <div className="flex items-center gap-4">
        {/* Play/Pause Button */}
        <button
          onClick={togglePlay}
          className="w-10 h-10 rounded-full bg-blue-600 hover:bg-blue-500 flex items-center justify-center text-white transition-all transform hover:scale-105 active:scale-95 shadow-lg shadow-blue-600/20"
        >
          {isPlaying ? <Pause size={20} fill="currentColor" /> : <Play size={20} className="ml-1" fill="currentColor" />}
        </button>

        {/* Progress Bar & Timing */}
        <div className="flex-1 flex flex-col gap-1">
          <input
            type="range"
            min="0"
            max={duration || 100}
            value={currentTime}
            onChange={handleSeek}
            className="w-full h-1.5 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-blue-500 hover:accent-blue-400"
          />
          <div className="flex justify-between text-[10px] text-gray-400 font-mono">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Volume Control */}
        <div className="flex items-center gap-2 group relative">
          <button
            onClick={(e) => {
              e.stopPropagation();
              const newMute = !isMuted;
              setIsMuted(newMute);
              audioRef.current.muted = newMute;
            }}
            className="text-gray-400 hover:text-white transition-colors"
          >
            {isMuted || volume === 0 ? <VolumeX size={18} /> : <Volume2 size={18} />}
          </button>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={isMuted ? 0 : volume}
            onChange={handleVolume}
            className="w-16 h-1 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
          />
        </div>

        {/* Download Button */}
        <a
          href={src}
          download
          target="_blank"
          rel="noopener noreferrer"
          className="p-2 text-gray-400 hover:text-white transition-colors"
          title="Download Call Recording"
          onClick={e => e.stopPropagation()}
        >
          <Download size={18} />
        </a>
      </div>
    </div>
  );
};

// --- Main StatsPage Component ---
export default function StatsPage({ onLogout }) {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedRow, setExpandedRow] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState('agent');

  const fetchLogs = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!VAPI_PRIVATE_KEY) {
        throw new Error('VITE_VAPI_PRIVATE_KEY is not configured');
      }

      const response = await fetch(`${VAPI_API_BASE}/call?limit=100`, {
        headers: {
          'Authorization': `Bearer ${VAPI_PRIVATE_KEY}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(`Vapi API error: ${response.status} - ${text}`);
      }

      const data = await response.json();
      
      const processedData = Array.isArray(data)
        ? data
          .filter(call => call.type === 'webCall')
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        : [];
      setLogs(processedData);
    } catch (err) {
      console.error("Error fetching call logs:", err);
      setError(err.message || "Failed to load call logs. Please ensure VAPI_PRIVATE_KEY is configured.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }) + " " + date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDuration = (seconds) => {
    if (!seconds) return "0s";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
  };

  const toggleRow = (id) => {
    setExpandedRow(expandedRow === id ? null : id);
  };

  const filteredLogs = logs.filter(log => {
      
    // 1. App Toggle Filter
    const TARGET_APP_ID = 'call-agent-app';
    const isAgentCall = log.metadata?.appId === TARGET_APP_ID || 
                        log.assistant?.metadata?.appId === TARGET_APP_ID || 
                        (log.name && log.name.startsWith('Call with')) || 
                        (log.assistant?.name && log.assistant.name.startsWith('Call with'));

    if (filterType === 'agent' && !isAgentCall) {
        return false;
    }

    // 2. Search Text Filter
    const searchLower = searchTerm.toLowerCase();
    return (
      (log.id && log.id.toLowerCase().includes(searchLower)) ||
      (log.assistantId && log.assistantId.toLowerCase().includes(searchLower)) ||
      (log.customer?.number && log.customer.number.toLowerCase().includes(searchLower)) ||
      (log.analysis?.summary && log.analysis.summary.toLowerCase().includes(searchLower))
    );
  });

  const renderTranscript = (transcript) => {
    if (!transcript) return <p className="text-gray-500 italic">No transcript available for this call.</p>;

    // Split by lines and highlight roles if found
    return transcript.split('\n').filter(line => line.trim() !== '').map((line, i) => {
      const isAssistant = line.toLowerCase().startsWith('assistant:');
      const isUser = line.toLowerCase().startsWith('user:');

      return (
        <div key={i} className={`mb-3 p-3 rounded-xl border ${isAssistant ? 'bg-blue-500/5 border-blue-500/10' :
          isUser ? 'bg-purple-500/5 border-purple-500/10' :
            'bg-gray-800/20 border-gray-800/10'
          }`}>
          <span className={`text-[10px] font-bold uppercase tracking-wider block mb-1 ${isAssistant ? 'text-blue-400' :
            isUser ? 'text-purple-400' :
              'text-gray-500'
            }`}>
            {isAssistant ? 'Mark (AI)' : isUser ? 'Customer' : 'Participant'}
          </span>
          <p className="text-sm text-gray-300 leading-relaxed">
            {line.replace(/^(assistant|user):/i, '').trim()}
          </p>
        </div>
      );
    });
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white p-6 lg:p-10 font-sans">
      <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-700">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-500 bg-clip-text text-transparent">
              Vapi Call Intelligence
            </h1>
            <p className="text-gray-500 mt-1">Monitor and analyze your AI agent performance</p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchLogs}
              disabled={loading}
              className="flex items-center gap-2.5 px-6 py-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-xl transition-all shadow-lg shadow-blue-600/20 active:scale-95 font-semibold"
            >
              <RefreshCcw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              {loading ? 'Refreshing...' : 'Refresh Logs'}
            </button>
            <button
              onClick={onLogout}
              className="flex items-center gap-2.5 px-6 py-3 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-xl transition-all border border-red-500/20 active:scale-95 font-semibold"
            >
              <LogOut className="w-4 h-4" />
              Logout Admin
            </button>
          </div>
        </div>

        {/* Filters & Actions */}
        <div className="flex flex-col lg:flex-row gap-4 items-center justify-between bg-gray-900/40 backdrop-blur-xl p-5 rounded-2xl border border-gray-800/50 shadow-xl">
          
          {/* Toggle buttons */}
          <div className="flex bg-gray-950 p-1.5 rounded-xl border border-gray-800 w-full lg:w-auto">
             <button onClick={() => setFilterType('all_web')} className={`flex-1 lg:flex-none px-6 py-2.5 rounded-lg text-sm font-bold tracking-wide transition-all ${filterType === 'all_web' ? 'bg-blue-600/20 text-blue-400 shadow-md border border-blue-500/30' : 'text-gray-500 hover:text-white hover:bg-gray-800/50 border border-transparent'}`}>
               ALL WEB SDK
             </button>
             <button onClick={() => setFilterType('agent')} className={`flex-1 lg:flex-none px-6 py-2.5 rounded-lg text-sm font-bold tracking-wide transition-all ${filterType === 'agent' ? 'bg-purple-600/20 text-purple-400 shadow-md border border-purple-500/30' : 'text-gray-500 hover:text-white hover:bg-gray-800/50 border border-transparent'}`}>
               NEW CALL AGENT
             </button>
          </div>

          <div className="relative w-full lg:w-[450px]">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              placeholder="Search logs by ID, number, or summary..."
              className="w-full pl-11 pr-5 py-3 bg-gray-950 border border-gray-800 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/50 transition-all font-medium"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { label: filterType === 'agent' ? 'Filtered Agent Calls' : 'Total Web Calls', value: filteredLogs.length, icon: PhoneCall, color: 'blue' },
            {
              label: 'Avg duration',
              value: filteredLogs.length > 0 ? formatDuration(filteredLogs.reduce((acc, curr) => acc + (curr.duration || 0), 0) / filteredLogs.length) : '0s',
              icon: Clock3,
              color: 'green'
            },
            {
              label: 'Successful Deals',
              value: filteredLogs.filter(l => l.analysis?.successEvaluation === 'true' || l.analysis?.successEvaluation === true).length,
              icon: CheckCircle2,
              color: 'purple'
            }
          ].map((stat, i) => (
            <div key={i} className="group relative bg-gray-900 border border-gray-800/60 p-6 rounded-3xl overflow-hidden shadow-sm transition-all hover:bg-gray-800/40 hover:border-blue-500/20">
              <div className={`absolute top-0 right-0 p-8 -mr-4 -mt-4 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity`}>
                <stat.icon size={120} />
              </div>
              <div className="flex items-center gap-4 mb-4">
                <div className={`p-3 bg-blue-500/10 rounded-2xl`}>
                  <stat.icon className={`w-6 h-6 text-blue-500`} />
                </div>
                <span className="text-gray-400 text-sm font-semibold uppercase tracking-wider">{stat.label}</span>
              </div>
              <p className="text-4xl font-bold text-white tracking-tight">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Logs Table */}
        <div className="bg-gray-900/60 border border-gray-800/80 rounded-3xl overflow-hidden backdrop-blur-sm shadow-2xl">
          {loading && logs.length === 0 ? (
            <div className="p-32 text-center">
              <div className="relative inline-block mb-6">
                <div className="absolute inset-0 bg-blue-500/20 blur-2xl rounded-full animate-pulse"></div>
                <RefreshCcw className="w-16 h-16 text-blue-500 animate-spin relative" />
              </div>
              <p className="text-xl text-white font-semibold mb-2">Analyzing Call History</p>
              <p className="text-gray-500 max-w-xs mx-auto">Retrieving call recordings and intelligence logs from Vapi servers...</p>
            </div>
          ) : error ? (
            <div className="p-32 text-center border-t border-red-500/20">
              <div className="bg-red-500/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 border border-red-500/20">
                <PhoneOff className="w-10 h-10 text-red-500" />
              </div>
              <p className="text-xl text-white font-semibold mb-2">Sync Connection Error</p>
              <p className="text-red-400 mb-6">{error}</p>
              <button
                onClick={fetchLogs}
                className="px-8 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-xl transition-all font-medium border border-gray-700"
              >
                Reconnect to Vapi
              </button>
            </div>
          ) : filteredLogs.length === 0 ? (
            <div className="p-32 text-center">
              <div className="bg-gray-800/40 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Search className="w-10 h-10 text-gray-600" />
              </div>
              <p className="text-xl text-white font-semibold mb-2">No results found</p>
              <p className="text-gray-500">We couldn't find any call logs matching "{searchTerm}"</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-800/40 border-b border-gray-800">
                    <th className="px-8 py-5 text-[11px] font-bold text-gray-500 uppercase tracking-[0.2em]">Contact & Date</th>
                    <th className="px-8 py-5 text-[11px] font-bold text-gray-500 uppercase tracking-[0.2em]">Assistant</th>
                    <th className="px-8 py-5 text-[11px] font-bold text-gray-500 uppercase tracking-[0.2em]">Engagement</th>
                    <th className="px-8 py-5 text-[11px] font-bold text-gray-500 uppercase tracking-[0.2em]">Call Status</th>
                    <th className="px-8 py-5 text-[11px] font-bold text-gray-500 uppercase tracking-[0.2em]">Intelligence Summary</th>
                    <th className="px-8 py-5 text-[11px] font-bold text-gray-500 uppercase tracking-[0.2em]"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800/40">
                  {filteredLogs.map((log) => (
                    <React.Fragment key={log.id}>
                      <tr
                        className={`group hover:bg-blue-600/[0.03] transition-all cursor-pointer ${expandedRow === log.id ? 'bg-blue-600/[0.05]' : ''}`}
                        onClick={() => toggleRow(log.id)}
                      >
                        <td className="px-8 py-6">
                          <div className="flex items-center gap-4">
                            <div className={`p-2 rounded-xl border ${expandedRow === log.id ? 'bg-blue-600/20 border-blue-500/30 text-blue-400' : 'bg-gray-800 border-gray-700 text-gray-400'}`}>
                              <User size={18} />
                            </div>
                            <div className="flex flex-col">
                              <span className="text-sm font-semibold text-white group-hover:text-blue-400 transition-colors">
                                {log.metadata?.email || log.assistant?.metadata?.email || log.assistant?.name || log.customer?.number || `Web Guest ${log.id.substring(0, 4)}`}
                              </span>
                              <span className="text-[11px] text-gray-500 flex items-center gap-1.5 mt-0.5">
                                <Calendar size={10} /> {formatDate(log.createdAt)}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-6">
                          <div className="flex flex-col">
                            <span className="text-sm font-semibold text-white">
                              {log.assistant?.name || (log.assistantId && `ID: ${log.assistantId.substring(0, 6)}...`) || "SDK Web Call"}
                            </span>
                            <span className="text-[10px] text-gray-500 uppercase tracking-wider">
                              {log.type}
                            </span>
                          </div>
                        </td>
                        <td className="px-8 py-6">
                          <div className="flex items-center gap-2">
                            <Clock3 size={14} className="text-gray-500" />
                            <span className="text-sm text-gray-300 font-medium">{formatDuration(log.duration)}</span>
                          </div>
                        </td>
                        <td className="px-8 py-6">
                          <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${log.status === 'completed' ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]' :
                              log.status === 'ongoing' ? 'bg-yellow-500 shadow-[0_0_8px_rgba(234,179,8,0.4)] animate-pulse' :
                                'bg-red-500 shadow-[0_0_8px_rgba(239,44,44,0.4)]'
                              }`} />
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{log.status}</span>
                          </div>
                        </td>
                        <td className="px-8 py-6 max-w-sm">
                          <p className="text-xs text-gray-400 font-medium line-clamp-1 italic border-l-2 border-gray-800 pl-3">
                            {log.analysis?.summary || "Analyzing call results..."}
                          </p>
                        </td>
                        <td className="px-8 py-6 text-right">
                          <div className={`p-2 rounded-lg transition-transform ${expandedRow === log.id ? 'rotate-180 text-blue-400 bg-blue-500/10' : 'text-gray-600 bg-gray-800/40 group-hover:text-gray-400'}`}>
                            <ChevronDown size={18} />
                          </div>
                        </td>
                      </tr>

                      {/* Expanded Details Section */}
                      {expandedRow === log.id && (
                        <tr className="bg-gray-950/40">
                          <td colSpan="6" className="px-10 py-10 border-t border-blue-500/10 border-b border-blue-500/10">
                            <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">

                              {/* Analysis & Controls (12 cols) */}
                              <div className="xl:col-span-12 lg:grid lg:grid-cols-2 gap-10 mb-6 xl:mb-0">
                                <div className="space-y-8">
                                  <section>
                                    <div className="flex items-center gap-2 mb-4">
                                      <div className="w-1.5 h-4 bg-blue-600 rounded-full"></div>
                                      <h4 className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em]">Conversation Summary</h4>
                                    </div>
                                    <div className="bg-gray-900 border border-gray-800 p-6 rounded-3xl text-[13px] text-gray-300 leading-relaxed shadow-inner">
                                      {log.analysis?.summary || "Summary generation is in progress for this call session."}
                                    </div>
                                  </section>

                                  {log.metadata && Object.keys(log.metadata).length > 0 && (
                                    <section>
                                      <div className="flex items-center gap-2 mb-4">
                                        <div className="w-1.5 h-4 bg-yellow-500 rounded-full"></div>
                                        <h4 className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em]">Metadata</h4>
                                      </div>
                                      <div className="bg-gray-900 border border-gray-800 p-6 rounded-3xl text-[13px] text-gray-300 shadow-inner flex flex-col gap-2">
                                        {Object.entries(log.metadata).map(([key, value]) => (
                                          <div key={key} className="flex items-center gap-3 border-b border-gray-800/50 pb-2 last:border-0 last:pb-0">
                                            <span className="font-bold text-gray-500 uppercase tracking-wider text-[10px] w-24 block break-words">{key}</span>
                                            <span className="text-white font-medium">{String(value)}</span>
                                          </div>
                                        ))}
                                      </div>
                                    </section>
                                  )}

                                  <div className="grid grid-cols-2 gap-4">
                                    {[
                                      { label: 'Evaluation', value: (log.analysis?.successEvaluation === 'true' || log.analysis?.successEvaluation === true) ? 'Successful' : (log.analysis?.successEvaluation === 'false' || log.analysis?.successEvaluation === false) ? 'Needs Followup' : 'Pending', icon: (log.analysis?.successEvaluation === 'true' || log.analysis?.successEvaluation === true) ? CheckCircle2 : (log.analysis?.successEvaluation === 'false' || log.analysis?.successEvaluation === false) ? XCircle : HelpCircle, color: (log.analysis?.successEvaluation === 'true' || log.analysis?.successEvaluation === true) ? 'green' : (log.analysis?.successEvaluation === 'false' || log.analysis?.successEvaluation === false) ? 'red' : 'gray' },
                                      { label: 'Type', value: log.type === 'webCall' ? 'Web GUI' : 'Phone', icon: User, color: 'blue' },
                                      { label: 'Session ID', value: log.id.substring(0, 12) + '...', icon: FileText, color: 'gray' },
                                      { label: 'Total Cost', value: `$${log.cost?.toFixed(3) || '0.000'}`, icon: Clock, color: 'blue' }
                                    ].map((item, idx) => (
                                      <div key={idx} className="bg-gray-900/40 border border-gray-800/80 p-4 rounded-2xl flex items-center gap-3">
                                        <div className={`p-2 bg-blue-500/10 rounded-lg text-blue-500`}>
                                          <item.icon size={16} />
                                        </div>
                                        <div>
                                          <p className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">{item.label}</p>
                                          <p className="text-[12px] font-semibold text-white">{item.value}</p>
                                        </div>
                                      </div>
                                    ))}
                                  </div>

                                  {log.recordingUrl && (
                                    <section>
                                      <div className="flex items-center gap-2 mb-4">
                                        <div className="w-1.5 h-4 bg-green-600 rounded-full"></div>
                                        <h4 className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em]">Voice Recording</h4>
                                      </div>
                                      <CustomAudioPlayer src={log.recordingUrl} />
                                    </section>
                                  )}
                                </div>

                                <section className="mt-8 lg:mt-0">
                                  <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-2">
                                      <div className="w-1.5 h-4 bg-purple-600 rounded-full"></div>
                                      <h4 className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em]">Live Transcript</h4>
                                    </div>
                                    {log.recordingUrl && (
                                      <button
                                        onClick={(e) => { e.stopPropagation(); window.open(log.recordingUrl, '_blank'); }}
                                        className="text-white hover:text-blue-400 flex items-center gap-2 text-[10px] font-bold uppercase transition-colors"
                                      >
                                        <ExternalLink size={12} /> Open Recording
                                      </button>
                                    )}
                                  </div>
                                  <div className="bg-gray-950/80 border border-gray-800 p-6 rounded-3xl h-[450px] overflow-y-auto custom-scrollbar shadow-inner">
                                    {renderTranscript(log.transcript)}
                                  </div>
                                </section>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <style>{`
          .custom-scrollbar::-webkit-scrollbar { width: 4px; }
          .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
          .custom-scrollbar::-webkit-scrollbar-thumb { background: #1f2937; border-radius: 10px; }
          .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #3b82f6; }
          
          .line-clamp-1 {
            display: -webkit-box;
            -webkit-line-clamp: 1;
            -webkit-box-orient: vertical;  
            overflow: hidden;
          }

          @keyframes fade-in {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .animate-in {
            animation: fade-in 0.5s ease-out forwards;
          }
        `}</style>
      </div>
    </div>
  );
}
