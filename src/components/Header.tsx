import { Activity, Database, Mountain, LogOut, Trash2, Loader2, Sparkles } from 'lucide-react';
import { User } from 'firebase/auth';

interface HeaderProps {
  title: string;
  date: string;
  user: User | null;
  syncing: boolean;
  onSyncStrava: () => void;
  stravaConnected: boolean;
  onConnectStrava: () => void;
  onClearChat: () => void;
  onLogout: () => void;
  onLogin: () => void;
}

export const Header = ({
  title,
  date,
  user,
  syncing,
  onSyncStrava,
  stravaConnected,
  onConnectStrava,
  onClearChat,
  onLogout,
  onLogin
}: HeaderProps) => {
  return (
    <header className="flex flex-col md:flex-row items-center justify-between gap-4 px-6 py-4 bg-[#0a0d14]/90 border-b border-slate-800/80 backdrop-blur-md text-slate-100 shrink-0 z-20">
      
      {/* Title Section matching reference image */}
      <div className="flex flex-col items-center md:items-start text-center md:text-left">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-teal-500/10 border border-teal-500/30 rounded-xl flex items-center justify-center text-teal-400 shadow-[0_0_12px_rgba(20,184,166,0.3)]">
            <Activity className="w-4 h-4" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white font-mono">
            Apex <span className="text-teal-400 font-normal">//</span> <span className="font-sans">Performance</span>
          </h1>
        </div>
        <p className="text-xs sm:text-sm text-slate-400 mt-1 font-medium tracking-wide">
          Last Training Analysis: <span className="text-slate-200 font-semibold">{title}</span>
        </p>
        <p className="text-xs text-teal-400/90 font-mono mt-0.5">{date}</p>
      </div>

      {/* Profile & Controls */}
      <div className="flex flex-wrap items-center justify-center md:justify-end gap-3 sm:gap-6">
        
        {/* Profile Reference Metrics */}
        <div className="hidden sm:flex items-center gap-4 bg-[#121622] border border-slate-800 px-4 py-2 rounded-2xl text-xs">
          <div>
            <span className="text-[10px] uppercase tracking-wider text-slate-400 font-mono block">FTP Ref</span>
            <span className="text-sm font-bold text-teal-400 font-mono">225W <span className="text-[10px] text-slate-400 font-normal">(2.82 w/kg)</span></span>
          </div>
          <div className="h-6 w-px bg-slate-800" />
          <div>
            <span className="text-[10px] uppercase tracking-wider text-slate-400 font-mono block">FC Máx</span>
            <span className="text-sm font-bold text-rose-400 font-mono">191 BPM</span>
          </div>
        </div>

        {/* Sync & Action Buttons */}
        <div className="flex items-center gap-2">
          {!stravaConnected ? (
            <button
              onClick={onConnectStrava}
              disabled={syncing}
              className="bg-[#fc4c02]/10 hover:bg-[#fc4c02]/20 text-[#fc4c02] border border-[#fc4c02]/30 px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all shadow-[0_0_10px_rgba(252,76,2,0.1)] active:scale-95 disabled:opacity-50"
              title="Connect Strava Account"
            >
              <Database className="w-3.5 h-3.5" />
              <span>Connect Strava</span>
            </button>
          ) : (
            <button
              onClick={onSyncStrava}
              disabled={syncing}
              className="bg-teal-500/10 hover:bg-teal-500/20 text-teal-300 border border-teal-500/30 px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all shadow-[0_0_10px_rgba(20,184,166,0.1)] active:scale-95 disabled:opacity-50"
              title="Sincronizar última sesión de Strava"
            >
              {syncing ? <Loader2 className="w-3.5 h-3.5 animate-spin text-teal-400" /> : <Database className="w-3.5 h-3.5" />}
              <span>Sync Strava</span>
            </button>
          )}

          <button
            onClick={onClearChat}
            className="bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-slate-200 border border-slate-700/60 p-2 rounded-xl text-xs font-medium transition-all"
            title="Limpiar chat de Apex"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>

          {user ? (
            <div className="flex items-center gap-2 ml-2 pl-2 border-l border-slate-800">
              {user.photoURL ? (
                <img src={user.photoURL} alt="Profile" className="w-7 h-7 rounded-full border border-teal-500/30" referrerPolicy="no-referrer" />
              ) : (
                <div className="w-7 h-7 rounded-full bg-slate-800 flex items-center justify-center text-[10px] font-bold text-slate-300">
                  {user.email?.[0].toUpperCase()}
                </div>
              )}
              <button
                onClick={onLogout}
                className="bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-rose-400 border border-slate-700/60 p-1.5 rounded-lg text-xs font-medium transition-all"
                title="Cerrar sesión"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={onLogin}
              className="bg-teal-500/10 hover:bg-teal-500/20 text-teal-300 border border-teal-500/30 px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ml-2"
            >
              Sign In (Cloud Sync)
            </button>
          )}
        </div>
      </div>

    </header>
  );
};
