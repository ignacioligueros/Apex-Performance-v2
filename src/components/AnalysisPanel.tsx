import { WorkoutMetrics } from '../types';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { Activity, Flame, ShieldCheck, Heart, Loader2, RefreshCw } from 'lucide-react';
import Markdown from 'react-markdown';

interface AnalysisPanelProps {
  metrics: WorkoutMetrics;
  loading: boolean;
  onRequestAnalysis: () => void;
}

export const AnalysisPanel = ({ metrics, loading, onRequestAnalysis }: AnalysisPanelProps) => {
  return (
    <div className="border border-rose-500/30 bg-[#171118]/90 rounded-3xl p-5 shadow-[0_0_25px_rgba(244,63,94,0.1)] flex flex-col justify-between h-full backdrop-blur-md">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-rose-900/40 mb-4">
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-400 shadow-[0_0_8px_#fb7185]" />
            <h2 className="text-lg font-bold tracking-tight text-white font-mono">
              Performance Analysis
            </h2>
          </div>
          <span className="text-[10px] uppercase font-mono text-rose-400/80 bg-rose-950/60 border border-rose-800/40 px-2 py-0.5 rounded">
            AI Diagnostics
          </span>
        </div>

        {/* Dual Chart: Power vs Heart Rate */}
        <div className="bg-[#120d13]/80 border border-rose-950/60 rounded-2xl p-3 mb-5">
          <div className="flex items-center justify-center gap-6 text-xs font-mono mb-2">
            <div className="flex items-center gap-1.5 text-rose-400">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block" />
              <span>Power (W)</span>
            </div>
            <div className="flex items-center gap-1.5 text-sky-400">
              <span className="w-2.5 h-2.5 rounded-full bg-sky-400 inline-block" />
              <span>Heart Rate (bpm)</span>
            </div>
          </div>
          
          {!metrics.telemetryData || metrics.telemetryData.length === 0 ? (
            <div className="h-44 w-full flex items-center justify-center text-slate-500 font-mono text-xs text-center px-4">
              {metrics.avgPower === 0 && metrics.history.length === 0
                ? 'Conecta y sincroniza Strava para cargar la telemetría y gráficos de tu entrenamiento.'
                : 'Sin telemetría detallada segundo a segundo para esta sesión.'}
            </div>
          ) : (
            <div className="h-44 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={metrics.telemetryData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                  <XAxis dataKey="timeMin" stroke="#475569" tick={{ fontSize: 10, fill: '#64748b' }} unit="m" />
                  <YAxis yAxisId="power" domain={[0, 220]} stroke="#f87171" tick={{ fontSize: 10, fill: '#f87171' }} />
                  <YAxis yAxisId="hr" orientation="right" domain={[60, 180]} stroke="#38bdf8" tick={{ fontSize: 10, fill: '#38bdf8' }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#e11d48', borderRadius: '12px', color: '#f8fafc' }}
                  />
                  <Line
                    yAxisId="power"
                    type="monotone"
                    dataKey="power"
                    stroke="#f87171"
                    strokeWidth={2}
                    dot={{ r: 2, fill: '#f87171' }}
                    name="Power"
                  />
                  <Line
                    yAxisId="hr"
                    type="monotone"
                    dataKey="heartRate"
                    stroke="#38bdf8"
                    strokeWidth={2}
                    dot={{ r: 2, fill: '#38bdf8' }}
                    name="Heart Rate"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-5">
          <div className="bg-[#1f1520] border border-rose-900/40 rounded-xl p-3 text-center">
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">Avg Power</span>
            <span className="text-base sm:text-lg font-bold font-mono text-white">{metrics.avgPower} W</span>
          </div>

          <div className="bg-[#1f1520] border border-rose-900/40 rounded-xl p-3 text-center">
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">Norm Power</span>
            <span className="text-base sm:text-lg font-bold font-mono text-white">{metrics.normPower} W</span>
          </div>

          <div className="bg-[#1f1520] border border-rose-900/40 rounded-xl p-3 text-center">
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">IF Factor</span>
            <span className="text-base sm:text-lg font-bold font-mono text-rose-300">{metrics.ifFactor}</span>
          </div>

          <div className="bg-[#1f1520] border border-rose-900/40 rounded-xl p-3 text-center">
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">TSS Load</span>
            <span className="text-base sm:text-lg font-bold font-mono text-teal-300">{metrics.tss}</span>
          </div>

          <div className="bg-[#1f1520] border border-rose-900/40 rounded-xl p-3 text-center">
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">Avg HR</span>
            <span className="text-base sm:text-lg font-bold font-mono text-sky-300">{metrics.avgHr} bpm</span>
          </div>

          <div className="bg-[#1f1520] border border-rose-900/40 rounded-xl p-3 text-center">
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">Max HR</span>
            <span className="text-base sm:text-lg font-bold font-mono text-rose-400">{metrics.maxHr} bpm</span>
          </div>
        </div>
      </div>

      {/* Verdict / Evaluation Card */}
      {metrics.verdict || loading ? (
        <div className="bg-[#211521] border border-rose-900/50 rounded-2xl p-4 space-y-3 flex-1 overflow-y-auto max-h-[250px] custom-scrollbar relative">
          <div className="flex items-center gap-2 text-rose-400 font-mono text-xs font-bold uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4 text-rose-400" />
            <span>Veredicto Apex</span>
            {loading ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin ml-auto text-rose-500" />
            ) : (
              <button onClick={onRequestAnalysis} className="ml-auto text-rose-500/50 hover:text-rose-400 transition-colors" title="Regenerar análisis">
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
          <div className="text-xs sm:text-sm text-slate-300 leading-relaxed font-sans markdown-body">
            {metrics.verdict ? (
              <Markdown>{metrics.verdict}</Markdown>
            ) : (
              <span className="text-slate-500 italic">Generando análisis profundo de la sesión...</span>
            )}
          </div>
        </div>
      ) : (
        <button 
          onClick={onRequestAnalysis}
          disabled={loading}
          className="w-full bg-[#211521] hover:bg-rose-950/60 border border-rose-900/50 hover:border-rose-500/50 rounded-2xl p-4 flex flex-col items-center justify-center gap-2 transition-all group disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <div className="flex items-center gap-2 text-rose-400 font-mono text-xs font-bold uppercase tracking-wider group-hover:text-rose-300">
            <ShieldCheck className="w-4 h-4" />
            <span>Solicitar Análisis de Apex</span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 group-hover:text-slate-300 leading-relaxed font-sans text-center transition-colors">
            Generar un diagnóstico detallado usando IA para esta sesión.
          </p>
        </button>
      )}
    </div>
  );
};
