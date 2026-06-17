// ---------------------------------------------------------------------------
// Servidor proxy Express para la API de Samsara
// Protege la API key y transforma datos al formato BioFleet
// Ejecutar: node server.js
// ---------------------------------------------------------------------------
import "dotenv/config";
import express from "express";
import cors from "cors";

const app = express();
const PORT = process.env.PORT || 3001;
const API_KEY = process.env.SAMSARA_API_KEY;
const SAMSARA_BASE = "https://api.samsara.com";

app.use(cors({ origin: true }));
app.use(express.json());

// ---------------------------------------------------------------------------
// Helper: Fetch genérico contra la API de Samsara
// ---------------------------------------------------------------------------
async function samsaraFetch(endpoint) {
  const url = `${SAMSARA_BASE}${endpoint}`;
  console.log(`[Samsara] GET ${url}`);
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${API_KEY}`,
      Accept: "application/json",
    },
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Samsara API ${res.status}: ${body}`);
  }
  return res.json();
}

// ---------------------------------------------------------------------------
// Helper: Generar datos biométricos simulados (no disponibles en Samsara)
// ---------------------------------------------------------------------------
function generateBiometrics(seed) {
  const hash = [...seed].reduce((a, c) => a + c.charCodeAt(0), 0);
  const bpSys = 110 + (hash % 40);
  const bpDia = 68 + (hash % 25);
  // Modificado: Ampliar rango de IMC para mostrar ejemplos visuales extremos (15.0 a 39.9)
  const bmi = +(15 + (hash % 250) / 10).toFixed(1);
  const hr = 60 + (hash % 45);
  const fatigue = 10 + (hash % 70);
  const oxygen = 94 + (hash % 6);
  const stress = 15 + (hash % 65);
  const temp = +(35.8 + (hash % 30) / 10).toFixed(1);
  const steps = 2000 + (hash % 10000);
  const sleepH = 4 + (hash % 5);
  const sleepM = hash % 60;

  return {
    bpSys, bpDia, bmi, hr, fatigue,
    oxygen, stress, temp, steps,
    sleep: `${sleepH}h ${String(sleepM).padStart(2, "0")}m`,
  };
}

// ---------------------------------------------------------------------------
// Helper: Generar historial de 6 meses simulado
// ---------------------------------------------------------------------------
function generateHistory(bmi0, sys0, dia0) {
  const MESES = ["Ene", "Feb", "Mar", "Abr", "May", "Jun"];
  return MESES.map((mes, i) => ({
    mes,
    bmi: +(bmi0 + (Math.random() * 0.4 - 0.2) + i * 0.1).toFixed(1),
    sistolica: Math.round(sys0 + (Math.random() * 4 - 2) + i * 0.5),
    diastolica: Math.round(dia0 + (Math.random() * 3 - 1.5) + i * 0.3),
  }));
}

// ---------------------------------------------------------------------------
// Helper: Generar registros de salud simulados
// ---------------------------------------------------------------------------
function generateRecords(current, name) {
  const dates = [
    "2026-06-12", "2026-05-30", "2026-05-14",
    "2026-04-28", "2026-04-09", "2026-03-22",
  ];
  const notas = [
    "Chequeo previo a ruta — OK",
    "Descanso adecuado reportado",
    "Jornada larga, hidratación baja",
    "Examen médico mensual",
    "Sin novedad",
    "Buen estado general",
  ];
  return dates.map((fecha, i) => ({
    fecha,
    sys: current.bpSys - i * 2 + Math.round(Math.random() * 3),
    dia: current.bpDia - i + Math.round(Math.random() * 2),
    bmi: +(current.bmi - i * 0.1).toFixed(1),
    hr: current.hr - i + Math.round(Math.random() * 3),
    fatiga: Math.max(10, current.fatigue - i * 3 + Math.round(Math.random() * 5)),
    peso: +(current.bmi * 2.8 + Math.random() * 2).toFixed(1),
    nota: notas[i],
  }));
}

// ---------------------------------------------------------------------------
// GET /api/drivers — Conductores reales + datos biométricos simulados
// ---------------------------------------------------------------------------
app.get("/api/drivers", async (req, res) => {
  try {
    // 1. Obtener conductores de Samsara
    const driversRes = await samsaraFetch("/fleet/drivers");
    const samsaraDrivers = driversRes.data || [];

    // 2. Intentar obtener vehículos para asignar unidades
    let vehicles = [];
    try {
      const vehiclesRes = await samsaraFetch("/fleet/vehicles");
      vehicles = vehiclesRes.data || [];
    } catch (e) {
      console.warn("[Samsara] No se pudieron obtener vehículos:", e.message);
    }

    // 3. Transformar al formato BioFleet
    const biofleetDrivers = samsaraDrivers
      .filter((d) => d.driverActivationStatus === "active" || !d.driverActivationStatus)
      .map((d, idx) => {
        const nameParts = (d.name || "Sin Nombre").split(" ");
        const initials = nameParts.map((p) => p[0]?.toUpperCase() || "").join("").slice(0, 2);
        const driverId = d.id || `SAM-${idx}`;
        const shortId = String(driverId).slice(-3).padStart(3, "0");

        // Buscar vehículo asignado
        const vehicle = vehicles.find(
          (v) => v.staticAssignedDriver?.id === d.id
        );
        const unitName = vehicle
          ? `${vehicle.name || "Unidad"} · #${String(vehicle.id).slice(-3)}`
          : `Unidad Samsara · #${shortId}`;

        // Datos biométricos simulados basados en el nombre
        const current = generateBiometrics(d.name || driverId);

        return {
          id: `${initials}-${shortId}`,
          samsaraId: d.id,
          name: d.name || "Sin Nombre",
          initials,
          age: 30 + (driverId.charCodeAt?.(0) || idx) % 25,
          license: d.licenseNumber || d.license?.number || `Lic. Fed. SAM-${shortId}`,
          unit: unitName,
          route: "Ruta activa (Samsara)",
          lastSync: "en vivo",
          isLive: true,
          current,
          history: generateHistory(current.bmi, current.bpSys, current.bpDia),
          records: generateRecords(current, d.name),
        };
      });

    console.log(`[BioFleet] ${biofleetDrivers.length} conductores transformados`);
    res.json({ success: true, source: "samsara", data: biofleetDrivers });
  } catch (err) {
    console.error("[Samsara] Error:", err.message);
    res.status(502).json({ success: false, error: err.message });
  }
});

// ---------------------------------------------------------------------------
// GET /api/vehicles — Vehículos con ubicación
// ---------------------------------------------------------------------------
app.get("/api/vehicles", async (req, res) => {
  try {
    const vehiclesRes = await samsaraFetch("/fleet/vehicles");
    res.json({ success: true, data: vehiclesRes.data || [] });
  } catch (err) {
    console.error("[Samsara] Error vehículos:", err.message);
    res.status(502).json({ success: false, error: err.message });
  }
});

// ---------------------------------------------------------------------------
// GET /api/health — Verificar conectividad
// ---------------------------------------------------------------------------
app.get("/api/health", async (req, res) => {
  try {
    await samsaraFetch("/fleet/drivers?limit=1");
    res.json({ status: "ok", samsara: "connected" });
  } catch (err) {
    res.json({ status: "ok", samsara: "disconnected", error: err.message });
  }
});

// ---------------------------------------------------------------------------
// Iniciar servidor
// ---------------------------------------------------------------------------
app.listen(PORT, () => {
  console.log(`\n🚛 BioFleet Proxy Server`);
  console.log(`   Puerto: ${PORT}`);
  console.log(`   API Key: ${API_KEY ? "✅ configurada" : "❌ FALTA"}`);
  console.log(`   Endpoints:`);
  console.log(`     GET http://localhost:${PORT}/api/drivers`);
  console.log(`     GET http://localhost:${PORT}/api/vehicles`);
  console.log(`     GET http://localhost:${PORT}/api/health\n`);
});
