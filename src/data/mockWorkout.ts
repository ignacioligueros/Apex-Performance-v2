import { WorkoutMetrics } from '../types';

export const defaultWorkoutMetrics: WorkoutMetrics = {
  title: 'Sin entrenamientos sincronizados',
  date: '',
  type: 'Ride',
  distance: 0,
  movingTime: 0,
  elevation: 0,
  avgPace: '0:00',
  avgPower: 0,
  normPower: 0,
  tss: 0,
  ifFactor: 0,
  avgHr: 0,
  maxHr: 0,
  verdict: '',
  intervals: [],
  telemetryData: [],
  history: [],
  strength: {
    tindeqMax: 0,
    edgeSize: 20,
    readiness: 'Optimal'
  }
};

