import { Line, AreaChart, Area, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

export const COLORS = {
  midnight: '#240270',
  forest: '#003E03',
  taupe: '#7A6D0C',
  gray: '#9CA3AF',
};

export function KpiCard({ label, value, delta, deltaDirection, subtext, icon, sparkline }: {
  label: string; value: string | number; delta?: string; deltaDirection?: 'up' | 'down';
  subtext?: string; icon?: React.ReactNode; sparkline?: number[];
}) {
  const renderSparkline = () => {
    if (!sparkline || sparkline.length < 2) return null;
    const w = 96, h = 24;
    const min = Math.min(...sparkline);
    const max = Math.max(...sparkline);
    const range = max - min || 1;
    const pts = sparkline.map((v, i) => {
      const x = (i / (sparkline.length - 1)) * w;
      const y = h - ((v - min) / range) * h;
      return `${x},${y}`;
    }).join(' ');
    return (
      <svg width={w} height={h} className="shrink-0">
        <polyline points={pts} fill="none" stroke={COLORS.midnight} strokeWidth="2" strokeLinecap="round" />
      </svg>
    );
  };

  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between gap-2">
      <div className="flex items-center justify-between">
        <span className="text-xs uppercase tracking-wide text-gray-500 font-medium">{label}</span>
        {icon && <span className="text-gray-400">{icon}</span>}
      </div>
      <div className="flex items-baseline justify-between">
        <span className="text-2xl font-semibold" style={{ color: COLORS.midnight }}>{value}</span>
        {delta && (
          <span className={`text-xs px-2 py-0.5 rounded-full font-mono ${deltaDirection === 'down' ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
            {deltaDirection === 'up' ? '▲' : '▼'} {delta}
          </span>
        )}
      </div>
      <div className="flex items-end justify-between gap-2">
        {subtext && <div className="text-xs text-gray-400 truncate">{subtext}</div>}
        {renderSparkline()}
      </div>
    </div>
  );
}

function EngagementTooltip({ active, payload, label }: any) {
  if (!active || !payload || !payload.length) return null;
  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 px-4 py-3 text-sm">
      <div className="font-mono text-[11px] text-gray-400 uppercase tracking-wide mb-2">{label}</div>
      {payload.map((p: any) => (
        <div key={p.dataKey} className="flex items-center justify-between gap-6 py-0.5">
          <span className="flex items-center gap-1.5 text-gray-500 capitalize">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
            {p.name}
          </span>
          <span className="font-mono font-semibold text-gray-800">{typeof p.value === 'number' ? p.value.toLocaleString() : p.value}</span>
        </div>
      ))}
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

function DonutTooltip({ active, payload }: any) {
  if (!active || !payload || !payload.length) return null;
  const d = payload[0];
  return (
    <div className="bg-white rounded-lg shadow-lg border border-gray-100 px-3 py-2 text-xs">
      <div className="flex items-center gap-1.5 font-medium text-gray-700">
        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: d.payload.color }} />
        {d.name}
      </div>
      <div className="font-mono font-semibold text-gray-900 mt-0.5">{d.value} units</div>
    </div>
  );
}

export function StatusDonut({ segments }: { segments: Array<{ name: string; value: number; color: string }> }) {
  const total = segments.reduce((a, s) => a + s.value, 0);
  return (
    <div className="flex flex-col sm:flex-row items-center gap-8">
      <div className="relative w-44 h-44 shrink-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={segments}
              dataKey="value"
              innerRadius={62}
              outerRadius={80}
              paddingAngle={3}
              cornerRadius={6}
              stroke="none"
            >
              {segments.map((s, i) => <Cell key={i} fill={s.color} />)}
            </Pie>
            <Tooltip content={<DonutTooltip />} />
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-3xl font-semibold" style={{ color: COLORS.midnight }}>{total}</span>
          <span className="text-[10px] uppercase tracking-wide text-gray-400 mt-0.5">Total Assets</span>
        </div>
      </div>
      <div className="w-full space-y-3">
        {segments.map(s => (
          <div key={s.name} className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: s.color }} />
              <span className="text-gray-600">{s.name}</span>
            </div>
            <span className="font-mono font-semibold text-gray-900">{s.value} <span className="text-gray-400 font-normal">({((s.value / total) * 100).toFixed(1)}%)</span></span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ValuationTierBars({ tiers }: { tiers: Array<{ label: string; units: number; value: string; pct: number }> }) {
  const maxPct = Math.max(...tiers.map(t => t.pct));
  return (
    <div className="space-y-4">
      {tiers.map((t) => (
        <div key={t.label} className="space-y-1.5">
          <div className="flex justify-between items-center text-sm">
            <span className="font-medium text-gray-700">{t.label}</span>
            <span className="font-mono text-gray-400">{t.units} units <span className="text-gray-900 font-semibold">({t.value})</span></span>
          </div>
          <div className="w-full h-2.5 rounded-full bg-gray-100 overflow-hidden">
            <div
              className="h-full rounded-full"
              style={{
                width: `${(t.pct / maxPct) * 100}%`,
                background: `linear-gradient(90deg, ${COLORS.midnight}99, ${COLORS.midnight})`,
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

export function ManagedPropertiesTable({ properties }: {
  properties: Array<{
    id: string | number; image?: string; title: string; address: string;
    price: string; status: string; dom: number; views: number; inquiries: number; lastUpdated: string;
  }>
}) {
  const statusColor = (status: string) => {
    const s = status.toLowerCase();
    if (s.includes('available')) return 'bg-green-50 text-green-700';
    if (s.includes('offer')) return 'bg-amber-50 text-amber-700';
    if (s.includes('review') || s.includes('pending')) return 'bg-gray-100 text-gray-700';
    return 'bg-gray-100 text-gray-500';
  };

  if (properties.length === 0) {
    return (
      <div className="text-center py-12 text-gray-400">
        <p className="mb-2">No listings yet</p>
        <button className="text-sm font-medium" style={{ color: COLORS.midnight }}>+ Add Property</button>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse text-sm">
        <thead>
          <tr className="text-xs uppercase text-gray-400 border-b">
            <th className="py-2 px-2">Property</th>
            <th className="py-2 px-2">Price</th>
            <th className="py-2 px-2">Status</th>
            <th className="py-2 px-2">DOM</th>
            <th className="py-2 px-2">Views/Inq</th>
            <th className="py-2 px-2">Updated</th>
            <th className="py-2 px-2 text-right">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {properties.map(p => (
            <tr key={p.id} className="hover:bg-gray-50">
              <td className="py-3 px-2">
                <div className="flex items-center gap-3">
                  {p.image ? (
                    <img src={p.image} className="w-12 h-10 rounded-lg object-cover shrink-0" />
                  ) : (
                    <div className="w-12 h-10 rounded-lg bg-gray-100 flex items-center justify-center shrink-0 text-gray-400">🏠</div>
                  )}
                  <div className="min-w-0">
                    <div className="font-semibold truncate">{p.title}</div>
                    <div className="text-gray-400 truncate text-xs">{p.address}</div>
                  </div>
                </div>
              </td>
              <td className="py-3 px-2 font-mono font-semibold">{p.price}</td>
              <td className="py-3 px-2">
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColor(p.status)}`}>{p.status}</span>
              </td>
              <td className="py-3 px-2 font-mono">{p.dom}d</td>
              <td className="py-3 px-2 font-mono">{p.views} / {p.inquiries}</td>
              <td className="py-3 px-2 text-gray-400">{p.lastUpdated}</td>
              <td className="py-3 px-2 text-right text-gray-400">⋮</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function ViewingsAgenda({ viewings }: {
  viewings: Array<{ id: string | number; name: string; address: string; tag?: string; host?: string; time: string }>
}) {
  if (viewings.length === 0) {
    return <p className="text-sm text-gray-400 py-6 text-center">No upcoming viewings scheduled.</p>;
  }
  return (
    <div className="space-y-2.5">
      {viewings.map(v => (
        <div key={v.id} className="p-2.5 rounded-xl bg-gray-50 flex items-start justify-between gap-2">
          <div className="min-w-0 space-y-0.5">
            <div className="font-semibold text-sm truncate">{v.name}</div>
            <div className="text-xs text-gray-400 truncate">{v.address}</div>
            <div className="flex items-center gap-2 pt-1">
              {v.tag && <span className="text-[10px] uppercase px-1.5 py-0.5 rounded bg-white text-gray-600">{v.tag}</span>}
              {v.host && <span className="text-[11px] text-gray-400">Host: {v.host}</span>}
            </div>
          </div>
          <span className="text-xs font-mono px-2 py-1 rounded shrink-0" style={{ backgroundColor: COLORS.midnight, color: 'white' }}>
            {v.time}
          </span>
        </div>
      ))}
    </div>
  );
}

export function LeadsSnapshot({ channels, leads }: {
  channels: Array<{ label: string; pct: number; color: string }>;
  leads: Array<{ id: string | number; initials: string; name: string; note: string; tag: string }>;
}) {
  return (
    <div className="space-y-3">
      <div className="w-full h-2 rounded-full overflow-hidden flex bg-gray-100">
        {channels.map(c => <div key={c.label} className="h-full" style={{ width: `${c.pct}%`, backgroundColor: c.color }} />)}
      </div>
      <div className="flex justify-between text-[11px] text-gray-400">
        {channels.map(c => <span key={c.label}>{c.label} ({c.pct}%)</span>)}
      </div>
      {leads.length === 0 ? (
        <p className="text-sm text-gray-400 py-4 text-center">No leads yet.</p>
      ) : (
        <div className="divide-y pt-1">
          {leads.map(l => (
            <div key={l.id} className="py-2 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-xs font-semibold">{l.initials}</div>
                <div>
                  <div className="text-sm font-medium leading-tight">{l.name}</div>
                  <div className="text-[11px] text-gray-400 truncate">{l.note}</div>
                </div>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">{l.tag}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function ActivityFeed({ events }: {
  events: Array<{ id: string | number; icon?: string; text: string; time: string }>
}) {
  if (events.length === 0) {
    return <p className="text-sm text-gray-400 py-6 text-center">No recent activity.</p>;
  }
  return (
    <div className="space-y-3">
      {events.map(e => (
        <div key={e.id} className="flex gap-2.5 items-start">
          <span className="text-gray-400 mt-0.5">•</span>
          <div className="space-y-0.5 text-sm">
            <p>{e.text}</p>
            <div className="text-[10px] text-gray-400">{e.time}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function RevenueTrendChart({ data }: { data: Array<{ month: string; current: number; prior: number }> }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <AreaChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
        <defs>
          <linearGradient id="gradRevenue" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={COLORS.midnight} stopOpacity={0.22} />
            <stop offset="100%" stopColor={COLORS.midnight} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="4 4" stroke="#eef0f5" vertical={false} />
        <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false} dy={8} />
        <YAxis tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false} width={50}
          tickFormatter={(v) => `$${v}M`} />
        <Tooltip content={<EngagementTooltip />} cursor={{ stroke: '#e5e7eb', strokeWidth: 1 }} />
        <Line type="monotone" dataKey="prior" stroke="#9CA3AF" strokeWidth={2} strokeDasharray="4 4" dot={false} name="FY Prior" />
        <Area type="monotone" dataKey="current" stroke={COLORS.midnight} strokeWidth={2.5} fill="url(#gradRevenue)" name="FY Actual" dot={false} activeDot={{ r: 5, strokeWidth: 2, stroke: '#fff' }} />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function MetricCallouts({ items }: { items: Array<{ label: string; value: string; subtext?: string; positive?: boolean }> }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4 pt-4 bg-gray-50 p-4 rounded-xl">
      {items.map(it => (
        <div key={it.label}>
          <span className="text-xs uppercase tracking-wide text-gray-400">{it.label}</span>
          <div className="text-lg font-semibold mt-0.5" style={{ color: COLORS.midnight }}>{it.value}</div>
          {it.subtext && (
            <span className={`text-xs ${it.positive ? 'text-green-700 font-medium' : 'text-gray-400'}`}>{it.subtext}</span>
          )}
        </div>
      ))}
    </div>
  );
}

export function DepartmentBars({ departments }: {
  departments: Array<{ name: string; tag?: string; value: string; delta: string; pct: number; footnoteLeft: string; footnoteRight: string }>
}) {
  return (
    <div className="space-y-4">
      {departments.map(d => (
        <div key={d.name} className="p-3.5 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
          <div className="flex justify-between items-center text-sm">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-gray-800">{d.name}</span>
              {d.tag && <span className="px-1.5 py-0.5 text-[10px] font-mono bg-gray-200 rounded text-gray-600">{d.tag}</span>}
            </div>
            <span className="font-mono font-semibold text-gray-900">{d.value} <span className="text-green-700 font-normal">({d.delta})</span></span>
          </div>
          <div className="w-full h-2 bg-gray-200 rounded-full mt-2 overflow-hidden">
            <div className="h-full rounded-full" style={{ width: `${d.pct}%`, backgroundColor: COLORS.midnight }} />
          </div>
          <div className="flex justify-between mt-1.5 text-[10px] text-gray-400">
            <span>{d.footnoteLeft}</span>
            <span>{d.footnoteRight}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

export function RegionalBars({ regions }: { regions: Array<{ label: string; value: string; pct: number }> }) {
  return (
    <div className="space-y-4">
      {regions.map(r => (
        <div key={r.label}>
          <div className="flex justify-between items-center text-sm mb-1.5">
            <span className="font-medium text-gray-700">{r.label}</span>
            <span className="font-mono font-semibold text-gray-900">{r.value}</span>
          </div>
          <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full rounded-full" style={{ width: `${r.pct}%`, backgroundColor: COLORS.midnight, opacity: 0.4 + r.pct / 200 }} />
          </div>
        </div>
      ))}
    </div>
  );
}

export function LeaderboardTable({ brokers }: {
  brokers: Array<{ rank: number; name: string; title: string; division: string; deals: number; volume: string; yield: string }>
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="bg-gray-50 text-xs uppercase text-gray-400">
            <th className="py-2.5 px-3 rounded-l-lg">Rank & Broker</th>
            <th className="py-2.5 px-3">Division</th>
            <th className="py-2.5 px-3 text-right">Deals</th>
            <th className="py-2.5 px-3 text-right">Volume</th>
            <th className="py-2.5 px-3 text-right rounded-r-lg">Yield</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {brokers.map(b => (
            <tr key={b.rank} className="hover:bg-gray-50 transition-colors">
              <td className="py-3 px-3">
                <div className="flex items-center gap-2.5">
                  <span className="w-5 font-mono font-bold text-gray-800">{String(b.rank).padStart(2, '0')}</span>
                  <div>
                    <div className="font-semibold text-sm">{b.name}</div>
                    <div className="text-[10px] text-gray-400">{b.title}</div>
                  </div>
                </div>
              </td>
              <td className="py-3 px-3 text-sm text-gray-500">{b.division}</td>
              <td className="py-3 px-3 text-right font-mono">{b.deals} units</td>
              <td className="py-3 px-3 text-right font-mono font-semibold">{b.volume}</td>
              <td className="py-3 px-3 text-right font-mono font-semibold text-green-700">{b.yield}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function RiskRadar({ items }: {
  items: Array<{ title: string; description: string; severity: 'Critical' | 'Attention' | 'Compliance'; actions?: string[] }>
}) {
  const severityColor = (s: string) => s === 'Critical' ? 'text-red-700' : s === 'Attention' ? 'text-amber-700' : 'text-gray-500';
  return (
    <div className="space-y-3">
      {items.map(it => (
        <div key={it.title} className="p-3.5 rounded-xl bg-gray-50 flex items-start gap-3">
          <span className={`mt-0.5 ${severityColor(it.severity)}`}>●</span>
          <div className="flex-1 space-y-0.5">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-sm">{it.title}</span>
              <span className={`font-mono text-xs font-semibold ${severityColor(it.severity)}`}>{it.severity}</span>
            </div>
            <p className="text-sm text-gray-500">{it.description}</p>
            {it.actions && (
              <div className="flex gap-2 pt-1.5">
                {it.actions.map(a => (
                  <button key={a} className="px-2.5 py-1 rounded text-[11px] font-mono bg-gray-200 text-gray-700">{a}</button>
                ))}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

export function MilestoneFeed({ events }: {
  events: Array<{ title: string; subtitle: string; time: string }>
}) {
  return (
    <div className="space-y-3">
      {events.map(e => (
        <div key={e.title} className="p-3 rounded-xl bg-gray-50 flex items-start gap-3">
          <span className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center shrink-0 text-gray-500">●</span>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-sm">{e.title}</span>
              <span className="text-[11px] text-gray-400">{e.time}</span>
            </div>
            <span className="text-sm text-gray-500">{e.subtitle}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
