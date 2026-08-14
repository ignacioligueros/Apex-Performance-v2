export interface IntervalData {
  name: string;
  watts: number;
  durationMin: number;
  type?: 'ramp' | 'work' | 'recovery';
}

export interface TelemetryPoint {
  timeMin: number;
  power: number;
  heartRate: number;
}

export interface HistoricalSession {
  id?: string;
  date: string;
  title: string;
  tss: number;
  avgPower?: number;
  normPower?: number;
  ifFactor?: number;
  avgHr?: number;
  maxHr?: number;
}

export interface StrengthMetrics {
  tindeqMax: number;
  edgeSize: number;
  readiness: 'Optimal' | 'Fatigued' | 'Recovering';
}

export interface WorkoutMetrics {
  title: string;
  date: string;
  avgPower: number;
  normPower: number;
  tss: number;
  ifFactor: number;
  avgHr: number;
  maxHr: number;
  verdict: string;
  intervals: IntervalData[];
  telemetryData: TelemetryPoint[];
  history: HistoricalSession[];
  strength: StrengthMetrics;
}

export interface ChatMessage {
  role: 'user' | 'model';
  parts: { text: string }[];
}
