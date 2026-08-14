import { WorkoutMetrics, HistoricalSession } from '../types';
import { ResponsiveContainer, BarChart, Bar, Tooltip, Cell } from 'recharts';
import { Mountain, Database, Flame, ShieldAlert, Activity } from 'lucide-react';

interface AthleteHubPanelProps {
  metrics: WorkoutMetrics;
  syncing: boolean;
  isLoggedIn?: boolean;
  onSelectSession: (session: HistoricalSession) => void;
  onUpdateStrength?: (field: 'tindeqMax' | 'readiness', value: any) => void;
}

export const AthleteHubPanel = ({
  metrics,
  syncing,
  isLoggedIn,
  onSelectSession,
  onUpdateStrength
}: AthleteHubPanelProps) => {

  const maxTSS = Math.max(...metrics.history.map(h => h.tss), 100);

  const getTssColor = (tss: number) => {
    if (tss >= 80) return '#f43f5e'; // rose
    if (tss >= 50) return '#f59e0b'; // amber
    if (tss >= 30) return '#14b8a6'; // teal
    return '#3b82f6'; // blue
  };

  return (
    <div className="border border-teal-500/30 bg-[#0e141d]/90 rounded-3xl p-5 shadow-[0_0_25px_rgba(20,184,166,0.1)] flex flex-col justify-between h-full backdrop-blur-md">
      
      {/* 1. TRAINING LOAD HISTORY */}
      <div>
        <div className="flex items-center justify-between pb-3 border-b border-teal-900/40 mb-4">
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-teal-400 shadow-[0_0_8px_#2dd4bf]" />
            <h2 className="text-lg font-bold tracking-tight text-white font-mono">
              Load & Recovery
            </h2>
          </div>
          <span className="text-[10px] uppercase font-mono text-teal-400/80 bg-teal-950/60 border border-teal-800/40 px-2 py-0.5 rounded">
            Past 7 Days
          </span>
        </div>

        {/* Small Bar Chart for TSS */}
        <div className="h-24 w-full relative mb-3">
          {metrics.history.length === 0 ? (
            <div className="h-full w-full rounded-2xl bg-[#151e2b]/50 border border-teal-900/30 flex items-center justify-center text-[11px] font-mono text-slate-500 text-center px-4">
              Sin entrenamientos cargados. Sincroniza Strava para ver tu carga TSS.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={metrics.history} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#0d9488', borderRadius: '8px', color: '#f8fafc', fontSize: '12px' }}
                  formatter={(val: any) => [`${val} TSS`, 'Load']}
                  labelStyle={{ display: 'none' }}
                  cursor={{ fill: '#1e293b', opacity: 0.4 }}
                />
                <Bar dataKey="tss" radius={[4, 4, 0, 0]}>
                  {metrics.history.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={getTssColor(entry.tss)} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* List of recent sessions */}
        <div className="space-y-1.5 max-h-[160px] overflow-y-auto pr-1 custom-scrollbar">
          {metrics.history.length === 0 ? (
            <div className="p-3 text-center text-xs text-slate-500 font-mono bg-[#151e2b]/40 rounded-xl border border-teal-900/20">
              No hay historial de actividades
            </div>
          ) : (
            metrics.history.map((item, idx) => (
              <button
                key={idx}
                onClick={() => onSelectSession(item)}
                className="w-full bg-[#151e2b]/80 border border-teal-900/30 hover:border-teal-500/40 rounded-xl px-3 py-2 flex items-center justify-between transition-colors text-left"
              >
                <div className="flex flex-col min-w-0 mr-2">
                  <span className="text-[9px] font-mono text-slate-500">
                    {item.date}
                  </span>
                  <span className="font-sans font-medium text-slate-300 text-xs truncate leading-tight">
                    {item.title.replace(/^Sesión\s+/, '')}
                  </span>
                </div>
                <span className={`shrink-0 font-mono font-bold px-2 py-0.5 rounded-md text-[10px] ${
                  item.tss >= 80 ? 'bg-rose-950/60 text-rose-300' :
                  item.tss >= 50 ? 'bg-amber-950/60 text-amber-300' :
                  item.tss >= 30 ? 'bg-teal-950/60 text-teal-300' :
                  'bg-blue-950/60 text-blue-300'
                }`}>
                  {item.tss} TSS
                </span>
              </button>
            ))
          )}
        </div>
      </div>

      {/* 2. STRENGTH & CLIMBING HUB */}
      <div className="mt-5 pt-4 border-t border-teal-900/30">
        <div className="flex items-center gap-2 mb-3">
          <Mountain className="w-4 h-4 text-rose-400" />
          <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">Strength & Boulder</span>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-[#1c1622] border border-rose-900/40 rounded-xl p-3 flex flex-col justify-center items-center group relative">
            <span className="text-[10px] text-slate-400 font-mono mb-1 text-center flex items-center gap-1">
              TINDEQ MAX
              {metrics.strength.tindeqMax > 0 && (
                isLoggedIn 
                  ? <span className="text-teal-500/80 cursor-help" title="Guardado en tu cuenta en la nube">☁️</span>
                  : <span className="text-rose-500/80 cursor-help" title="Inicia sesión arriba para guardar este dato">⚠️</span>
              )}
            </span>
            <div className="flex items-end gap-1">
              <input 
                type="number" 
                value={metrics.strength.tindeqMax || ''}
                onChange={(e) => onUpdateStrength?.('tindeqMax', Number(e.target.value))}
                className="w-16 bg-transparent border-b border-rose-900/0 group-hover:border-rose-900/50 text-xl font-bold text-rose-400 font-mono text-center focus:outline-none focus:border-rose-500 transition-colors"
                placeholder="0"
              />
              <span className="text-[10px] text-rose-400/70 mb-0.5">kg</span>
            </div>
            <span className="text-[9px] text-slate-500 mt-1">{metrics.strength.edgeSize}mm Edge</span>
          </div>

          <div className="bg-[#1c1622] border border-rose-900/40 rounded-xl p-3 flex flex-col justify-center items-center">
            <span className="text-[10px] text-slate-400 font-mono mb-1 text-center">TENDON STATE</span>
            <div className="flex items-center gap-1.5 mt-1">
              {metrics.strength.readiness === 'Optimal' && <Activity className="w-5 h-5 text-teal-400" />}
              {metrics.strength.readiness === 'Recovering' && <Activity className="w-5 h-5 text-amber-400" />}
              {metrics.strength.readiness === 'Fatigued' && <ShieldAlert className="w-5 h-5 text-rose-400" />}
            </div>
            <span className={`text-[10px] font-bold mt-1.5 ${
              metrics.strength.readiness === 'Optimal' ? 'text-teal-400' :
              metrics.strength.readiness === 'Recovering' ? 'text-amber-400' : 'text-rose-400'
            }`}>
              {metrics.strength.readiness === 'Optimal' ? 'Óptimo' :
               metrics.strength.readiness === 'Recovering' ? 'Recuperando' : 'Fatigado'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
