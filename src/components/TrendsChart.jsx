import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-slate-700 bg-slate-900/95 px-3 py-2 shadow-xl backdrop-blur">
      <p className="mb-1 font-mono text-[11px] uppercase tracking-wider text-slate-400">{label}</p>
      {payload.map((p) => (
        <p key={p.dataKey} className="flex items-center gap-2 font-mono text-xs">
          <span className="h-2 w-2 rounded-full" style={{ background: p.color }} />
          <span className="text-slate-300">{p.name}:</span>
          <span className="font-semibold text-slate-100">{p.value}</span>
        </p>
      ))}
    </div>
  );
}

export default function TrendsChart({ driver }) {
  return (
    <Card className="h-full">
      <CardHeader className="flex-row items-center justify-between">
        <div>
          <CardTitle>Tendencias · últimos 6 meses</CardTitle>
          <p className="font-mono text-[10px] uppercase tracking-wider text-slate-500">
            IMC · presión sistólica / diastólica
          </p>
        </div>
        <span className="font-mono text-[10px] text-slate-600">{driver.id}</span>
      </CardHeader>
      <CardContent className="h-[260px] pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={driver.history} margin={{ top: 8, right: 8, bottom: 0, left: -18 }}>
            <defs>
              <linearGradient id="imcFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#22d3ee" stopOpacity={0.25} />
                <stop offset="100%" stopColor="#22d3ee" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
            <XAxis dataKey="mes" stroke="#475569" tick={{ fontSize: 11, fontFamily: "monospace" }} tickLine={false} />
            <YAxis
              yAxisId="left"
              stroke="#475569"
              tick={{ fontSize: 11, fontFamily: "monospace" }}
              tickLine={false}
              axisLine={false}
              domain={[60, 160]}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              stroke="#475569"
              tick={{ fontSize: 11, fontFamily: "monospace" }}
              tickLine={false}
              axisLine={false}
              domain={[15, 40]}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              wrapperStyle={{ fontSize: 11, fontFamily: "monospace", paddingTop: 6 }}
              iconType="plainline"
            />
            <Area
              yAxisId="right"
              type="monotone"
              dataKey="bmi"
              name="IMC"
              stroke="#22d3ee"
              strokeWidth={2}
              fill="url(#imcFill)"
              dot={{ r: 2, fill: "#22d3ee" }}
            />
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="sistolica"
              name="Sistólica"
              stroke="#f87171"
              strokeWidth={2}
              dot={{ r: 2 }}
            />
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="diastolica"
              name="Diastólica"
              stroke="#fbbf24"
              strokeWidth={2}
              strokeDasharray="4 3"
              dot={{ r: 2 }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
