import { Line, AreaChart, Area, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

const COLORS = {
  midnight: '#240270',
  forest: '#003E03',
  taupe: '#7A6D0C',
  gray: '#9CA3AF',
};

export function KpiCard({ label, value, delta, deltaDirection, subtext, icon }: {
  label: string; value: string | number; delta?: string; deltaDirection?: 'up' | 'down';
  subtext?: string; icon?: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between gap-2">
      <div className="flex items-center justify-between">
        <span className="text-xs uppercase tracking-wide text-gray-500 font-medium">{label}</span>
        {icon}
      </div>
      <div className="flex items-baseline justify-between">
        <span className="text-2xl font-semibold" style={{ color: COLORS.midnight }}>{value}</span>
        {delta && (
          <span className={`text-xs px-2 py-0.5 rounded-full font-mono ${deltaDirection === 'down' ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
            {deltaDirection === 'up' ? '▲' : '▼'} {delta}
          </span>
        )}
      </div>
      {subtext && <div className="text-xs text-gray-400 truncate">{subtext}</div>}
    </div>
  );
}

export function EngagementVelocityChart({ data }: { data: Array<{ date: string; views: number; inquiries: number; viewings: number }> }) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <AreaChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#eee" vertical={false} />
        <XAxis dataKey="date" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
        <Tooltip />
        <Area type="monotone" dataKey="views" stroke={COLORS.midnight} fill={COLORS.midnight} fillOpacity={0.1} strokeWidth={2} name="Views" />
        <Area type="monotone" dataKey="inquiries" stroke={COLORS.forest} fill={COLORS.forest} fillOpacity={0.08} strokeWidth={2} name="Inquiries" />
        <Line type="monotone" dataKey="viewings" stroke={COLORS.taupe} strokeWidth={2} dot={false} name="Viewings Booked" />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function ConversionFunnel({ stages }: { stages: Array<{ label: string; count: number; pct: number }> }) {
  return (
    <div className="space-y-3.5">
      {stages.map((s, i) => (
        <div key={s.label} className="space-y-1">
          <div className="flex justify-between text-sm">
            <span className="font-medium text-gray-700">{i + 1}. {s.label}</span>
            <span className="font-mono font-semibold">{s.count} <span className="text-gray-400 font-normal">({s.pct}%)</span></span>
          </div>
          <div className="w-full h-3 rounded-full bg-gray-100 overflow-hidden">
            <div className="h-full rounded-full" style={{ width: `${s.pct}%`, backgroundColor: COLORS.midnight, opacity: 1 - i * 0.15 }} />
          </div>
        </div>
      ))}
    </div>
  );
}

export function StatusDonut({ segments }: { segments: Array<{ name: string; value: number; color: string }> }) {
  const total = segments.reduce((a, s) => a + s.value, 0);
  return (
    <div className="flex flex-col sm:flex-row items-center gap-6">
      <div className="relative w-40 h-40 shrink-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={segments} dataKey="value" innerRadius={55} outerRadius={75} paddingAngle={2}>
              {segments.map((s, i) => <Cell key={i} fill={s.color} />)}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-2xl font-semibold">{total}</span>
          <span className="text-[10px] uppercase text-gray-400">Total Assets</span>
        </div>
      </div>
      <div className="w-full space-y-2">
        {segments.map(s => (
          <div key={s.name} className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: s.color }} />
              <span className="text-gray-700">{s.name}</span>
            </div>
            <span className="font-mono font-semibold">{s.value} <span className="text-gray-400 font-normal">({((s.value / total) * 100).toFixed(1)}%)</span></span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ValuationTierBars({ tiers }: { tiers: Array<{ label: string; units: number; value: string; pct: number }> }) {
  return (
    <div className="space-y-3">
      {tiers.map(t => (
        <div key={t.label} className="space-y-1">
          <div className="flex justify-between items-center text-sm">
            <span className="font-medium text-gray-700">{t.label}</span>
            <span className="font-mono text-gray-500">{t.units} units <span className="text-gray-900 font-semibold">({t.value})</span></span>
          </div>
          <div className="w-full h-3 rounded-full bg-gray-100 overflow-hidden">
            <div className="h-full rounded-full" style={{ width: `${t.pct}%`, backgroundColor: COLORS.midnight }} />
          </div>
        </div>
      ))}
    </div>
  );
}
