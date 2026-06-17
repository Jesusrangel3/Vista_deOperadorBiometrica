import { AlertTriangle } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import {
  bpStatus,
  hrStatus,
  bmiStatus,
  fatigueStatus,
  statusStyles,
  cn,
} from "@/lib/utils";

// Celda que se pinta de rojo/ámbar si el valor sale de rango.
function Metric({ value, status }) {
  const s = statusStyles[status];
  return (
    <span className={cn("font-mono tabular-nums", status === "ok" ? "text-slate-200" : cn(s.text, "font-semibold"))}>
      {value}
      {status === "critical" && <span className="ml-1 text-red-500">▲</span>}
    </span>
  );
}

export default function HealthTable({ driver }) {
  return (
    <Card className="h-full">
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle>Registros de salud</CardTitle>
        <span className="font-mono text-[10px] uppercase tracking-wider text-slate-500">
          {driver.records.length} mediciones
        </span>
      </CardHeader>
      <CardContent className="pt-0">
        {/* Contenedor de filas en alto contraste oscuro */}
        <div className="overflow-hidden rounded-lg border border-slate-800 bg-slate-900">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-800/80 hover:bg-gray-800/80">
                <TableHead>Fecha</TableHead>
                <TableHead>Presión</TableHead>
                <TableHead>IMC</TableHead>
                <TableHead>BPM</TableHead>
                <TableHead>Fatiga</TableHead>
                <TableHead>Peso</TableHead>
                <TableHead className="min-w-[180px]">Observación</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {driver.records.map((r, i) => {
                const bp = bpStatus(r.sys, r.dia);
                const hasAlert =
                  bp !== "ok" ||
                  hrStatus(r.hr) !== "ok" ||
                  bmiStatus(r.bmi) !== "ok" ||
                  fatigueStatus(r.fatiga) !== "ok";
                return (
                  <TableRow
                    key={r.fecha}
                    className={cn(
                      // Alto contraste: alternancia entre slate-900 y gray-800
                      i % 2 === 0 ? "bg-slate-900" : "bg-gray-800",
                      "hover:bg-slate-800",
                      hasAlert && "ring-1 ring-inset ring-red-500/20"
                    )}
                  >
                    <TableCell className="font-mono text-xs text-slate-300">{r.fecha}</TableCell>
                    <TableCell>
                      <Metric value={`${r.sys}/${r.dia}`} status={bp} />
                    </TableCell>
                    <TableCell>
                      <Metric value={r.bmi.toFixed(1)} status={bmiStatus(r.bmi)} />
                    </TableCell>
                    <TableCell>
                      <Metric value={r.hr} status={hrStatus(r.hr)} />
                    </TableCell>
                    <TableCell>
                      <Metric value={`${r.fatiga}%`} status={fatigueStatus(r.fatiga)} />
                    </TableCell>
                    <TableCell className="font-mono text-xs text-slate-400">{r.peso} kg</TableCell>
                    <TableCell>
                      <span className="flex items-center gap-1.5 text-xs text-slate-400">
                        {hasAlert && <AlertTriangle className="h-3.5 w-3.5 shrink-0 text-red-400" />}
                        {r.nota}
                      </span>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
