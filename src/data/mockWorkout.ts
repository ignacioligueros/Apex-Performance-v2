import { WorkoutMetrics } from '../types';

export const defaultWorkoutMetrics: WorkoutMetrics = {
  title: 'MyWhoosh - Endurance #7',
  date: '2026-08-08',
  avgPower: 147,
  normPower: 147,
  tss: 38,
  ifFactor: 0.65,
  avgHr: 145,
  maxHr: 169,
  verdict: '',
  intervals: [
    { name: 'Ramp Up', watts: 0, durationMin: 10, type: 'ramp' },
    { name: '142 W', watts: 142, durationMin: 1, type: 'recovery' },
    { name: '164 W', watts: 164, durationMin: 7, type: 'work' },
    { name: '184 W', watts: 184, durationMin: 1, type: 'work' },
    { name: '163 W', watts: 163, durationMin: 6, type: 'work' },
    { name: '142 W', watts: 142, durationMin: 6, type: 'recovery' },
    { name: '164 W', watts: 164, durationMin: 7, type: 'work' },
    { name: '164 W', watts: 164, durationMin: 7, type: 'work' },
  ],
  telemetryData: [
    { timeMin: 0, power: 40, heartRate: 85 },
    { timeMin: 5, power: 100, heartRate: 110 },
    { timeMin: 10, power: 142, heartRate: 130 },
    { timeMin: 15, power: 164, heartRate: 148 },
    { timeMin: 20, power: 184, heartRate: 159 },
    { timeMin: 25, power: 163, heartRate: 150 },
    { timeMin: 30, power: 142, heartRate: 138 },
    { timeMin: 35, power: 164, heartRate: 152 },
    { timeMin: 40, power: 164, heartRate: 155 },
    { timeMin: 45, power: 150, heartRate: 145 },
    { timeMin: 50, power: 120, heartRate: 132 },
    { timeMin: 56, power: 80, heartRate: 105 },
  ],
  history: [
    { date: '2026-08-08', title: 'Endurance #7', tss: 38 },
    { date: '2026-08-07', title: 'Endurance #6', tss: 40 },
    { date: '2026-08-05', title: 'Sweet Spot', tss: 55 },
    { date: '2026-08-03', title: 'Recovery Spin', tss: 22 },
    { date: '2026-08-01', title: 'Threshold Intervals', tss: 65 },
  ],
  strength: {
    tindeqMax: 50,
    edgeSize: 20,
    readiness: 'Recovering'
  }
};
