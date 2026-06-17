import { useMemo } from "react";
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip 
} from "recharts";
import { Activity, Heart, Thermometer, Brain, Footprints, Moon, Compass, MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";

const colors = {
  ok: { hex: "#10b981", text: "text-emerald-400", border: "border-emerald-500/20" },
  warn: { hex: "#fbbf24", text: "text-amber-400", border: "border-amber-500/20" },
  critical: { hex: "#f87171", text: "text-red-400", border: "border-red-500/20" }
};

export default function VitalStatsPanel({ driver }) {
  const current = driver.current;
  
  // Determinar estados de cada métrica
  const getStressStatus = (val) => val >= 75 ? "critical" : val >= 50 ? "warn" : "ok";
  const getTempStatus = (val) => val >= 37.8 || val <= 35.5 ? "critical" : val >= 37.3 ? "warn" : "ok";
  const getOxygenStatus = (val) => val < 92 ? "critical" : val < 95 ? "warn" : "ok";
  
  const stressStatus = getStressStatus(current.stress);
  const tempStatus = getTempStatus(current.temp);
  const oxygenStatus = getOxygenStatus(current.oxygen);

  // Simular forma de onda de ECG en tiempo real
  const hrWaveData = useMemo(() => {
    const baseHr = current.hr;
    // Patrón clásico de latido cardíaco (Complejo QRS)
    const qrsPattern = [0, 2, -1, 15, -4, 0, 1, 0, 0, 0];
    return Array.from({ length: 20 }, (_, i) => {
      const pIdx = i % qrsPattern.length;
      const noise = (Math.sin(i * 0.8) * 0.5);
      return {
        idx: i,
        val: baseHr + (qrsPattern[pIdx] * 0.8) + noise
      };
    });
  }, [current.hr]);

  // Simular historial de presión arterial
  const bpWaveData = useMemo(() => {
    const baseSys = current.bpSys;
    const baseDia = current.bpDia;
    return Array.from({ length: 10 }, (_, i) => {
      const wave = Math.sin(i * 0.9) * 4;
      const cosWave = Math.cos(i * 0.9) * 2;
      return {
        idx: i,
        sys: baseSys + wave + (i % 2 === 0 ? 1 : -1),
        dia: baseDia + cosWave + (i % 2 === 0 ? -0.5 : 0.5)
      };
    });
  }, [current.bpSys, current.bpDia]);

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-slate-800/80 bg-[#060a11]/80 p-5 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.5)] backdrop-blur-md h-full">
      {/* Título de Sección */}
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
        <div className="flex items-center gap-2">
          <Activity className="h-4 w-4 text-cyan-400" />
          <h2 className="font-mono text-xs font-semibold uppercase tracking-[0.15em] text-slate-300">
            VITAL STATS & ANALYTICS
          </h2>
        </div>
        <MoreHorizontal className="h-4 w-4 text-slate-500 cursor-pointer hover:text-slate-300" />
      </div>

      {/* 1. Frecuencia Cardíaca (ECG Sparkline) */}
      <div className="rounded-lg border border-slate-800/60 bg-slate-950/40 p-3.5">
        <div className="flex items-center justify-between mb-1.5">
          <span className="font-mono text-[10px] uppercase tracking-wider text-slate-400">
            FRECUENCIA CARDIACA
          </span>
          <span className={cn("font-mono text-sm font-bold", colors.ok.text)}>
            {current.hr} <span className="text-[10px] font-normal text-slate-500">bpm</span>
          </span>
        </div>
        <div className="h-14 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={hrWaveData} margin={{ top: 2, right: 2, bottom: 2, left: 2 }}>
              <CartesianGrid stroke="#1e293b/30" strokeDasharray="3 3" vertical={false} />
              <Tooltip 
                content={({ active, payload }) => {
                  if (!active || !payload?.length) return null;
                  return (
                    <div className="rounded border border-slate-800 bg-slate-950 px-2 py-0.5 font-mono text-[9px] text-slate-300">
                      {Math.round(payload[0].value)} bpm
                    </div>
                  );
                }} 
              />
              <Line 
                type="monotone" 
                dataKey="val" 
                stroke="#10b981" 
                strokeWidth={2} 
                dot={false}
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 2. Presión Arterial */}
      <div className="rounded-lg border border-slate-800/60 bg-slate-950/40 p-3.5">
        <div className="flex items-center justify-between mb-1.5">
          <span className="font-mono text-[10px] uppercase tracking-wider text-slate-400">
            PRESIÓN ARTERIAL
          </span>
          <span className="font-mono text-sm font-bold text-sky-400">
            {current.bpSys}/{current.bpDia} <span className="text-[10px] font-normal text-slate-500">mmHg</span>
          </span>
        </div>
        <div className="h-14 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={bpWaveData} margin={{ top: 2, right: 2, bottom: 2, left: 2 }}>
              <defs>
                <linearGradient id="sysGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#38bdf8" stopOpacity={0.25} />
                  <stop offset="100%" stopColor="#38bdf8" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="#1e293b/30" strokeDasharray="3 3" vertical={false} />
              <Area 
                type="monotone" 
                dataKey="sys" 
                stroke="#38bdf8" 
                strokeWidth={1.5} 
                fill="url(#sysGrad)" 
                dot={false}
              />
              <Area 
                type="monotone" 
                dataKey="dia" 
                stroke="#0369a1" 
                strokeWidth={1.5} 
                fill="transparent" 
                dot={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 3. Temperatura & Estrés (Fila de 2 columnas) */}
      <div className="grid grid-cols-2 gap-3">
        {/* Temperatura */}
        <div className="rounded-lg border border-slate-800/60 bg-slate-950/40 p-3.5 flex flex-col justify-between h-[110px]">
          <div>
            <div className="flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-wider text-slate-400">
              <Thermometer className="h-3 w-3 text-red-400" />
              <span>TEMPERATURA</span>
            </div>
            <div className="font-mono text-base font-bold text-slate-200 mt-1">
              {current.temp.toFixed(1)}°C
            </div>
          </div>
          {/* Indicador visual de barras (Termómetro LED) */}
          <div className="flex items-center gap-1 mt-2">
            {[35.5, 36.2, 36.8, 37.4, 38.0].map((tThreshold, i) => {
              const active = current.temp >= tThreshold;
              let barColor = "bg-slate-800";
              if (active) {
                if (tempStatus === "critical") barColor = "bg-red-500 shadow-[0_0_6px_#ef4444]";
                else if (tempStatus === "warn") barColor = "bg-amber-500 shadow-[0_0_6px_#f59e0b]";
                else barColor = "bg-emerald-500 shadow-[0_0_6px_#10b981]";
              }
              return (
                <div 
                  key={i} 
                  className={cn(
                    "h-3.5 w-2.5 rounded-sm transition-all duration-300", 
                    barColor
                  )} 
                />
              );
            })}
          </div>
        </div>

        {/* Estrés */}
        <div className="rounded-lg border border-slate-800/60 bg-slate-950/40 p-3.5 flex items-center justify-between h-[110px]">
          <div className="flex flex-col justify-between h-full">
            <div className="flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-wider text-slate-400">
              <Brain className="h-3 w-3 text-violet-400" />
              <span>ESTRÉS</span>
            </div>
            <div className={cn("font-mono text-xs font-semibold uppercase mt-auto", colors[stressStatus].text)}>
              {stressStatus === "ok" ? "Bajo" : stressStatus === "warn" ? "Moderado" : "Elevado"}
            </div>
          </div>
          
          {/* Circular progress gauge */}
          <div className="relative flex items-center justify-center w-[58px] h-[58px]">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
              {/* Back Circle */}
              <circle
                cx="18"
                cy="18"
                r="15"
                fill="transparent"
                stroke="#1e293b"
                strokeWidth="3"
              />
              {/* Progress Circle */}
              <circle
                cx="18"
                cy="18"
                r="15"
                fill="transparent"
                stroke={colors[stressStatus].hex}
                strokeWidth="3.2"
                strokeDasharray="94.2"
                strokeDashoffset={94.2 - (94.2 * current.stress) / 100}
                strokeLinecap="round"
                className="transition-all duration-500"
              />
            </svg>
            <div className="absolute font-mono text-[11px] font-bold text-slate-200">
              {current.stress}%
            </div>
          </div>
        </div>
      </div>

      {/* 4. Métricas Secundarias en Línea */}
      <div className="flex flex-col gap-2.5 mt-1">
        {/* Saturación O2 */}
        <div className="flex items-center justify-between rounded-lg border border-slate-800/50 bg-slate-950/30 px-3.5 py-2.5">
          <div className="flex items-center gap-2.5">
            <Compass className="h-4 w-4 text-emerald-400 animate-pulseGlow" />
            <span className="font-mono text-[10px] uppercase tracking-wider text-slate-400">
              Saturación O₂
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-semibold text-slate-300">
              {current.oxygen}%
            </span>
            <span className={cn("font-mono text-[9px] px-1.5 py-0.5 rounded uppercase font-semibold", 
              oxygenStatus === "ok" ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"
            )}>
              {oxygenStatus === "ok" ? "Normal" : "Crítico"}
            </span>
          </div>
        </div>

        {/* Pasos Hoy */}
        <div className="flex items-center justify-between rounded-lg border border-slate-800/50 bg-slate-950/30 px-3.5 py-2.5">
          <div className="flex items-center gap-2.5">
            <Footprints className="h-4 w-4 text-cyan-400" />
            <span className="font-mono text-[10px] uppercase tracking-wider text-slate-400">
              Pasos Hoy
            </span>
          </div>
          <span className="font-mono text-xs font-bold text-slate-200">
            {current.steps.toLocaleString()}
          </span>
        </div>

        {/* Reposo (Sueño) */}
        <div className="flex items-center justify-between rounded-lg border border-slate-800/50 bg-slate-950/30 px-3.5 py-2.5">
          <div className="flex items-center gap-2.5">
            <Moon className="h-4 w-4 text-indigo-400" />
            <span className="font-mono text-[10px] uppercase tracking-wider text-slate-400">
              Reposo nocturno
            </span>
          </div>
          <span className="font-mono text-xs font-bold text-slate-200">
            {current.sleep}
          </span>
        </div>
      </div>
    </div>
  );
}
