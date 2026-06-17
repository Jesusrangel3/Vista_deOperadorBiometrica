import { useState } from "react";
import { Search, Truck, AlertTriangle, Activity } from "lucide-react";
import { Input } from "@/components/ui/input";
import { overallStatus, statusStyles, cn } from "@/lib/utils";

export default function Sidebar({ drivers, selectedId, onSelect }) {
  const [query, setQuery] = useState("");

  const filtered = drivers.filter((d) =>
    `${d.name} ${d.id} ${d.unit}`.toLowerCase().includes(query.toLowerCase())
  );

  const alerts = drivers.filter((d) => overallStatus(d) !== "ok").length;

  return (
    <aside className="flex h-full w-72 shrink-0 flex-col border-r border-slate-800/80 bg-panel/60 backdrop-blur-sm">
      {/* Marca */}
      <div className="flex items-center gap-2.5 border-b border-slate-800/80 px-4 py-4">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-holo/15 ring-1 ring-holo/30">
          <Activity className="h-5 w-5 text-holo" />
        </div>
        <div>
          <p className="text-sm font-semibold tracking-tight text-slate-100">BioFleet</p>
          <p className="font-mono text-[10px] uppercase tracking-widest text-slate-500">
            Control biométrico
          </p>
        </div>
      </div>

      {/* Búsqueda */}
      <div className="p-3">
        <div className="relative">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar operador o unidad…"
            className="pl-8"
          />
        </div>
      </div>

      {/* Resumen de flota */}
      <div className="mx-3 mb-2 flex items-center justify-between rounded-lg border border-slate-800 bg-slate-900/40 px-3 py-2">
        <span className="font-mono text-[11px] text-slate-400">{drivers.length} operadores</span>
        <span
          className={cn(
            "flex items-center gap-1 font-mono text-[11px]",
            alerts ? "text-amber-400" : "text-emerald-400"
          )}
        >
          <AlertTriangle className="h-3.5 w-3.5" />
          {alerts} en alerta
        </span>
      </div>

      {/* Lista */}
      <div className="flex-1 space-y-1 overflow-y-auto px-3 pb-4 scrollbar-thin">
        <p className="px-1 py-2 font-mono text-[10px] uppercase tracking-widest text-slate-600">
          Operadores
        </p>
        {filtered.map((d) => {
          const st = overallStatus(d);
          const s = statusStyles[st];
          const active = d.id === selectedId;
          return (
            <button
              key={d.id}
              onClick={() => onSelect(d.id)}
              className={cn(
                "group flex w-full items-center gap-3 rounded-lg border px-3 py-2.5 text-left transition-all",
                active
                  ? "border-holo/40 bg-holo/10 shadow-holo"
                  : "border-transparent hover:border-slate-700 hover:bg-slate-800/40"
              )}
            >
              <div className="relative">
                <div
                  className={cn(
                    "flex h-9 w-9 items-center justify-center rounded-lg font-mono text-xs font-semibold",
                    active ? "bg-holo/20 text-holo" : "bg-slate-800 text-slate-300"
                  )}
                >
                  {d.initials}
                </div>
                <span
                  className={cn(
                    "absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full ring-2 ring-panel",
                    s.dot,
                    st !== "ok" && "animate-pulseGlow"
                  )}
                />
              </div>
              <div className="min-w-0 flex-1">
                <p className={cn("truncate text-sm font-medium", active ? "text-slate-100" : "text-slate-300")}>
                  {d.name}
                </p>
                <p className="flex items-center gap-1 truncate font-mono text-[10px] text-slate-500">
                  <Truck className="h-3 w-3" /> {d.id}
                </p>
              </div>
              <span className={cn("font-mono text-[10px] font-medium", s.text)}>{s.label}</span>
            </button>
          );
        })}
        {filtered.length === 0 && (
          <p className="px-1 py-6 text-center font-mono text-xs text-slate-600">
            Sin coincidencias.
          </p>
        )}
      </div>
    </aside>
  );
}
