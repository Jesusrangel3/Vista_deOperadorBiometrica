import { useEffect, useMemo, useState } from "react";
import { ShieldAlert, MapPin, Radio, BadgeCheck, Wifi, WifiOff } from "lucide-react";
import { drivers as fallbackDrivers, fetchSamsaraDrivers } from "@/data/drivers";
import { overallStatus, statusStyles, cn } from "@/lib/utils";
import Sidebar from "@/components/Sidebar";
import HoloViewer from "@/components/HoloViewer";
import KpiCards from "@/components/KpiCards";
import TrendsChart from "@/components/TrendsChart";
import HealthTable from "@/components/HealthTable";
import { Badge } from "@/components/ui/badge";

export default function App() {
  const [driverList, setDriverList] = useState(fallbackDrivers);
  const [dataSource, setDataSource] = useState("simulated"); // "samsara" | "simulated"
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState(null);

  // Cargar conductores de Samsara al iniciar
  useEffect(() => {
    let cancelled = false;
    async function loadDrivers() {
      setLoading(true);
      const result = await fetchSamsaraDrivers();
      if (!cancelled) {
        setDriverList(result.drivers);
        setDataSource(result.source);
        // Seleccionar el primer conductor si no hay selección
        if (!selectedId && result.drivers.length > 0) {
          setSelectedId(result.drivers[0].id);
        }
        setLoading(false);
      }
    }
    loadDrivers();
    return () => { cancelled = true; };
  }, []);

  // Si aún no hay selectedId, usar el primero
  const effectiveSelectedId = selectedId || driverList[0]?.id;

  const driver = useMemo(
    () => driverList.find((d) => d.id === effectiveSelectedId) ?? driverList[0],
    [effectiveSelectedId, driverList]
  );

  const status = overallStatus(driver);
  const s = statusStyles[status];

  return (
    <div className="relative z-10 flex h-screen overflow-hidden">
      <Sidebar drivers={driverList} selectedId={effectiveSelectedId} onSelect={setSelectedId} />

      <main className="flex min-w-0 flex-1 flex-col">
        {/* Barra superior: ficha del operador */}
        <header className="flex shrink-0 flex-wrap items-center gap-4 border-b border-slate-800/80 bg-panel/40 px-6 py-3.5 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div
              className={cn(
                "flex h-11 w-11 items-center justify-center rounded-xl font-mono text-sm font-bold ring-1",
                status === "ok" ? "bg-slate-800 text-slate-200 ring-slate-700" : cn("bg-slate-900", s.text, s.ring)
              )}
            >
              {driver.initials}
            </div>
            <div>
              <h1 className="text-base font-semibold tracking-tight text-slate-100">
                Operador: {driver.name}
              </h1>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 font-mono text-[11px] text-slate-500">
                <span className="flex items-center gap-1"><BadgeCheck className="h-3 w-3" />{driver.license}</span>
                <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{driver.route}</span>
                <span>· {driver.age} años</span>
              </div>
            </div>
          </div>

          <div className="ml-auto flex items-center gap-2">
            {/* Indicador de fuente de datos */}
            <Badge className={cn(
              "border-current/30 bg-slate-900",
              dataSource === "samsara" 
                ? "text-emerald-400 border-emerald-500/30" 
                : "text-amber-400 border-amber-500/30"
            )}>
              {dataSource === "samsara" ? (
                <><Wifi className="h-3 w-3" /> Samsara Live</>
              ) : (
                <><WifiOff className="h-3 w-3" /> Simulado</>
              )}
            </Badge>
            <Badge className="border-slate-700 bg-slate-900 text-slate-400">
              <Radio className="h-3 w-3 text-emerald-400" /> {driver.lastSync}
            </Badge>
            <Badge className={cn("border-current/30 bg-slate-900", s.text, s.ring)}>
              <span className={cn("h-1.5 w-1.5 rounded-full", s.dot, status !== "ok" && "animate-pulseGlow")} />
              {s.label.toUpperCase()}
            </Badge>
          </div>
        </header>

        <div className="flex-1 space-y-4 overflow-y-auto p-4 scrollbar-thin lg:p-6">
          {/* Banner de carga */}
          {loading && (
            <div className="flex items-center gap-3 rounded-xl border border-cyan-500/40 bg-cyan-500/10 px-4 py-3 text-sm text-cyan-300">
              <Wifi className="h-5 w-5 shrink-0 animate-pulse" />
              <p>Conectando con Samsara...</p>
            </div>
          )}

          {/* Banner de alerta */}
          {status !== "ok" && (
            <div
              className={cn(
                "flex items-center gap-3 rounded-xl border px-4 py-3 text-sm",
                status === "critical"
                  ? "border-red-500/40 bg-red-500/10 text-red-300"
                  : "border-amber-500/40 bg-amber-500/10 text-amber-300"
              )}
            >
              <ShieldAlert className="h-5 w-5 shrink-0" />
              <p>
                <span className="font-semibold">
                  {status === "critical" ? "Alerta crítica:" : "Vigilancia:"}
                </span>{" "}
                {driver.name} presenta uno o más signos vitales fuera de rango. Revisa las tarjetas
                resaltadas y considera detener la operación.
              </p>
            </div>
          )}

          {/* Panel superior: visor 3D + KPIs */}
          <section className="grid gap-4 xl:grid-cols-12">
            <div className="min-h-[380px] xl:col-span-7 xl:min-h-[480px]">
              <HoloViewer status={status} driverName={driver.name} driver={driver} />
            </div>
            <div className="flex flex-col gap-3 xl:col-span-5">
              <div className="flex items-center justify-between">
                <h2 className="font-mono text-[11px] uppercase tracking-widest text-slate-500">
                  Monitoreo en tiempo real
                </h2>
                <span className="font-mono text-[11px] text-slate-600">{driver.unit}</span>
              </div>
              <KpiCards driver={driver} />
              <div className="hidden xl:block xl:flex-1">
                <TrendsChart driver={driver} />
              </div>
            </div>
          </section>

          {/* Panel inferior */}
          <section className="grid gap-4 xl:grid-cols-12">
            <div className="xl:hidden">
              <TrendsChart driver={driver} />
            </div>
            <div className="xl:col-span-12">
              <HealthTable driver={driver} />
            </div>
          </section>

          <footer className="pb-2 pt-1 text-center font-mono text-[10px] text-slate-700">
            BioFleet · Centro de control biométrico · {dataSource === "samsara" ? "datos en vivo vía Samsara API" : "datos simulados — no aptos para uso clínico real"}
          </footer>
        </div>
      </main>
    </div>
  );
}
