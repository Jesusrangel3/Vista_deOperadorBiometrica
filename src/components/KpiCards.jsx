import { Heart, Activity, Gauge, BatteryWarning, AlertTriangle } from "lucide-react";
import { Card } from "@/components/ui/card";
import {
  bpStatus,
  hrStatus,
  bmiStatus,
  bmiLabel,
  fatigueStatus,
  fatigueLabel,
  statusStyles,
  cn,
} from "@/lib/utils";

function KpiCard({ icon: Icon, label, value, unit, sub, status, range }) {
  const s = statusStyles[status];
  return (
    <Card className={cn("relative overflow-hidden ring-1 ring-inset", s.ring, status !== "ok" && s.glow)}>
      {/* Acento lateral por estado */}
      <span className={cn("absolute left-0 top-0 h-full w-1", s.dot)} />
      <div className="flex items-start justify-between p-4">
        <div className="flex items-center gap-2">
          <Icon className={cn("h-4 w-4", s.text)} />
          <span className="font-mono text-[11px] uppercase tracking-wider text-slate-400">{label}</span>
        </div>
        {status !== "ok" ? (
          <AlertTriangle className={cn("h-4 w-4 animate-pulseGlow", s.text)} />
        ) : (
          <span className={cn("h-2 w-2 rounded-full", s.dot)} />
        )}
      </div>
      <div className="px-4 pb-4">
        <div className="flex items-baseline gap-1.5">
          <span className={cn("font-mono text-3xl font-semibold tabular-nums", status === "ok" ? "text-slate-100" : s.text)}>
            {value}
          </span>
          <span className="font-mono text-xs text-slate-500">{unit}</span>
        </div>
        <div className="mt-1 flex items-center justify-between">
          <span className={cn("text-xs font-medium", s.text)}>{sub}</span>
          <span className="font-mono text-[10px] text-slate-600">{range}</span>
        </div>
      </div>
    </Card>
  );
}

export default function KpiCards({ driver }) {
  const c = driver.current;
  return (
    <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
      <KpiCard
        icon={Gauge}
        label="Presión arterial"
        value={`${c.bpSys}/${c.bpDia}`}
        unit="mmHg"
        sub={statusStyles[bpStatus(c.bpSys, c.bpDia)].label}
        status={bpStatus(c.bpSys, c.bpDia)}
        range="ideal <120/80"
      />
      <KpiCard
        icon={Activity}
        label="IMC"
        value={c.bmi.toFixed(1)}
        unit="kg/m²"
        sub={bmiLabel(c.bmi)}
        status={bmiStatus(c.bmi)}
        range="normal 18.5–24.9"
      />
      <KpiCard
        icon={Heart}
        label="Frec. cardíaca"
        value={c.hr}
        unit="bpm"
        sub={statusStyles[hrStatus(c.hr)].label}
        status={hrStatus(c.hr)}
        range="reposo 60–100"
      />
      <KpiCard
        icon={BatteryWarning}
        label="Nivel de fatiga"
        value={`${c.fatigue}%`}
        unit=""
        sub={fatigueLabel(c.fatigue)}
        status={fatigueStatus(c.fatigue)}
        range="seguro <70%"
      />
    </div>
  );
}
