import { Activity, Calendar, Clock, Flame, Heart, HeartPulse, Mountain, Zap, ArrowRight, ActivitySquare, Loader2 } from 'lucide-react';

export const FormInput = ({ label, icon: Icon, type = "text", value, onChange, placeholder, step, required }: any) => (
  <div className="flex flex-col space-y-1.5">
    <label className="text-xs font-semibold text-stone-500 flex items-center gap-2">
      {Icon && <Icon className="w-4 h-4 text-emerald-600" />}
      {label}
    </label>
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      step={step}
      required={required}
      className="rounded-xl border border-stone-200 px-4 py-3 text-sm focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-50 transition-all bg-stone-50 text-stone-800 placeholder-stone-400"
    />
  </div>
);

export const FormSelect = ({ label, icon: Icon, value, onChange, options }: any) => (
  <div className="flex flex-col space-y-1.5">
    <label className="text-xs font-semibold text-stone-500 flex items-center gap-2">
      {Icon && <Icon className="w-4 h-4 text-emerald-600" />}
      {label}
    </label>
    <select
      value={value}
      onChange={onChange}
      className="rounded-xl border border-stone-200 px-4 py-3 text-sm focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-50 transition-all bg-stone-50 text-stone-800 appearance-none"
    >
      {options.map((opt: any) => (
        <option key={opt.value} value={opt.value}>{opt.label}</option>
      ))}
    </select>
  </div>
);
