// ---------------------------------------------------------------------------
// Datos de operadores de flota.
// Intenta cargar conductores reales desde Samsara vía el proxy backend.
// Si falla, usa los datos simulados como fallback.
// ---------------------------------------------------------------------------

const MESES = ["Ene", "Feb", "Mar", "Abr", "May", "Jun"];

function buildHistory(seed) {
  return MESES.map((mes, i) => ({
    mes,
    bmi: +(seed.bmi0 + seed.bmiTrend * i + (i % 2 ? 0.2 : -0.1)).toFixed(1),
    sistolica: Math.round(seed.sys0 + seed.sysTrend * i),
    diastolica: Math.round(seed.dia0 + seed.diaTrend * i),
  }));
}

// ---------------------------------------------------------------------------
// Datos simulados (fallback)
// ---------------------------------------------------------------------------
export const simulatedDrivers = [
  {
    id: "JP-204",
    name: "Juan Pérez",
    initials: "JP",
    age: 41,
    license: "Lic. Fed. A-882041",
    unit: "Kenworth T680 · #204",
    route: "Bajío → Monterrey",
    lastSync: "hace 2 min",
    isLive: false,
    current: { 
      bpSys: 124, 
      bpDia: 82, 
      bmi: 26.1, 
      hr: 78, 
      fatigue: 38,
      oxygen: 98,
      stress: 42,
      temp: 36.8,
      steps: 8421,
      sleep: "7h 12m"
    },
    history: buildHistory({
      bmi0: 25.2, bmiTrend: 0.18,
      sys0: 118, sysTrend: 1.2,
      dia0: 78, diaTrend: 0.8,
    }),
    records: [
      { fecha: "2026-06-12", sys: 124, dia: 82, bmi: 26.1, hr: 78, fatiga: 38, peso: 84.2, nota: "Chequeo previo a ruta — OK" },
      { fecha: "2026-05-30", sys: 122, dia: 80, bmi: 25.9, hr: 75, fatiga: 31, peso: 83.8, nota: "Descanso adecuado reportado" },
      { fecha: "2026-05-14", sys: 126, dia: 83, bmi: 25.7, hr: 80, fatiga: 44, peso: 83.1, nota: "Jornada larga, hidratación baja" },
      { fecha: "2026-04-28", sys: 120, dia: 79, bmi: 25.6, hr: 76, fatiga: 29, peso: 82.7, nota: "Examen médico mensual" },
      { fecha: "2026-04-09", sys: 121, dia: 81, bmi: 25.4, hr: 74, fatiga: 35, peso: 82.4, nota: "Sin novedad" },
      { fecha: "2026-03-22", sys: 119, dia: 78, bmi: 25.2, hr: 73, fatiga: 27, peso: 82.0, nota: "Buen estado general" },
    ],
  },
  {
    id: "CG-118",
    name: "Carlos Gómez",
    initials: "CG",
    age: 53,
    license: "Lic. Fed. A-771118",
    unit: "Freightliner Cascadia · #118",
    route: "CDMX → Guadalajara",
    lastSync: "hace 40 s",
    isLive: false,
    current: { 
      bpSys: 148, 
      bpDia: 96, 
      bmi: 31.4, 
      hr: 104, 
      fatigue: 88,
      oxygen: 91,
      stress: 82,
      temp: 38.4,
      steps: 2940,
      sleep: "4h 25m"
    },
    history: buildHistory({
      bmi0: 30.1, bmiTrend: 0.26,
      sys0: 134, sysTrend: 2.6,
      dia0: 86, diaTrend: 1.9,
    }),
    records: [
      { fecha: "2026-06-13", sys: 148, dia: 96, bmi: 31.4, hr: 104, fatiga: 88, peso: 98.6, nota: "ALERTA: HTA grado 2 + fatiga crítica" },
      { fecha: "2026-05-29", sys: 144, dia: 93, bmi: 31.1, hr: 99, fatiga: 79, peso: 98.0, nota: "Recomendado descanso obligatorio" },
      { fecha: "2026-05-12", sys: 141, dia: 91, bmi: 30.8, hr: 96, fatiga: 71, peso: 97.3, nota: "Presión elevada sostenida" },
      { fecha: "2026-04-25", sys: 138, dia: 89, bmi: 30.6, hr: 92, fatiga: 64, peso: 96.8, nota: "Derivado a valoración cardiológica" },
      { fecha: "2026-04-07", sys: 136, dia: 88, bmi: 30.4, hr: 90, fatiga: 58, peso: 96.2, nota: "Sobrepeso + presión borderline" },
      { fecha: "2026-03-20", sys: 134, dia: 86, bmi: 30.1, hr: 88, fatiga: 52, peso: 95.7, nota: "Inicio de seguimiento intensivo" },
    ],
  },
  {
    id: "ML-076",
    name: "María López",
    initials: "ML",
    age: 36,
    license: "Lic. Fed. A-660076",
    unit: "Volvo VNL · #076",
    route: "Querétaro → Laredo",
    lastSync: "hace 5 min",
    isLive: false,
    current: { 
      bpSys: 116, 
      bpDia: 74, 
      bmi: 22.8, 
      hr: 68, 
      fatigue: 22,
      oxygen: 99,
      stress: 21,
      temp: 36.4,
      steps: 10240,
      sleep: "8h 05m"
    },
    history: buildHistory({
      bmi0: 23.0, bmiTrend: -0.05,
      sys0: 114, sysTrend: 0.4,
      dia0: 73, diaTrend: 0.2,
    }),
    records: [
      { fecha: "2026-06-11", sys: 116, dia: 74, bmi: 22.8, hr: 68, fatiga: 22, peso: 63.4, nota: "Indicadores óptimos" },
      { fecha: "2026-05-27", sys: 115, dia: 73, bmi: 22.9, hr: 66, fatiga: 19, peso: 63.6, nota: "Excelente recuperación" },
      { fecha: "2026-05-10", sys: 117, dia: 75, bmi: 22.7, hr: 70, fatiga: 28, peso: 63.1, nota: "Ruta nocturna sin incidencias" },
      { fecha: "2026-04-24", sys: 114, dia: 72, bmi: 23.0, hr: 67, fatiga: 24, peso: 63.8, nota: "Chequeo rutinario" },
      { fecha: "2026-04-06", sys: 116, dia: 74, bmi: 23.1, hr: 69, fatiga: 21, peso: 64.0, nota: "Sin novedad" },
      { fecha: "2026-03-19", sys: 115, dia: 73, bmi: 23.0, hr: 65, fatiga: 18, peso: 63.9, nota: "Programa de bienestar al día" },
    ],
  },
];

// Mantener compatibilidad con imports existentes
export const drivers = simulatedDrivers;

// ---------------------------------------------------------------------------
// Fetch de conductores reales desde Samsara (vía proxy backend)
// ---------------------------------------------------------------------------
const PROXY_URL = "http://localhost:3001";

export async function fetchSamsaraDrivers() {
  try {
    const res = await fetch(`${PROXY_URL}/api/drivers`, {
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    if (json.success && json.data?.length > 0) {
      return { drivers: json.data, source: "samsara" };
    }
    throw new Error("Sin conductores");
  } catch (err) {
    console.warn("[BioFleet] Samsara no disponible, usando datos simulados:", err.message);
    return { drivers: simulatedDrivers, source: "simulated" };
  }
}
