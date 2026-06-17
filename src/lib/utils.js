import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

/**
 * Niveles de estado de un signo vital.
 * "ok" | "warn" | "critical"
 */

// Presión arterial — clasificación tipo AHA simplificada.
export function bpStatus(sys, dia) {
  if (sys >= 140 || dia >= 90) return "critical"; // Hipertensión grado 2
  if (sys >= 130 || dia >= 85) return "warn"; // Elevada / grado 1
  if (sys < 90 || dia < 60) return "warn"; // Hipotensión
  return "ok";
}

// Frecuencia cardíaca en reposo (BPM).
export function hrStatus(hr) {
  if (hr >= 110 || hr <= 45) return "critical";
  if (hr >= 100 || hr <= 50) return "warn";
  return "ok";
}

// Índice de masa corporal.
export function bmiStatus(bmi) {
  if (bmi >= 35 || bmi < 17) return "critical";
  if (bmi >= 30 || bmi < 18.5) return "warn";
  return "ok";
}

export function bmiLabel(bmi) {
  if (bmi < 18.5) return "Bajo peso";
  if (bmi < 25) return "Normal";
  if (bmi < 30) return "Sobrepeso";
  if (bmi < 35) return "Obesidad I";
  return "Obesidad II+";
}

// Nivel de fatiga 0–100.
export function fatigueStatus(f) {
  if (f >= 85) return "critical";
  if (f >= 70) return "warn";
  return "ok";
}

export function fatigueLabel(f) {
  if (f >= 85) return "Crítica";
  if (f >= 70) return "Alta";
  if (f >= 40) return "Moderada";
  return "Baja";
}

// Estado global del operador a partir de sus signos actuales.
export function overallStatus(d) {
  const states = [
    bpStatus(d.current.bpSys, d.current.bpDia),
    hrStatus(d.current.hr),
    bmiStatus(d.current.bmi),
    fatigueStatus(d.current.fatigue),
  ];
  if (states.includes("critical")) return "critical";
  if (states.includes("warn")) return "warn";
  return "ok";
}

// Mapa de clases por estado (texto / borde / fondo / punto).
export const statusStyles = {
  ok: {
    text: "text-emerald-400",
    ring: "ring-emerald-500/30",
    dot: "bg-emerald-400",
    glow: "shadow-[0_0_16px_-4px_rgba(52,211,153,0.5)]",
    label: "Estable",
  },
  warn: {
    text: "text-amber-400",
    ring: "ring-amber-500/40",
    dot: "bg-amber-400",
    glow: "shadow-[0_0_16px_-4px_rgba(245,158,11,0.55)]",
    label: "Vigilancia",
  },
  critical: {
    text: "text-red-400",
    ring: "ring-red-500/50",
    dot: "bg-red-400",
    glow: "shadow-[0_0_18px_-3px_rgba(239,68,68,0.6)]",
    label: "Alerta",
  },
};
