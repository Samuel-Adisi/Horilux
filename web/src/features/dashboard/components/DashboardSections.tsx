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

export function CountBars({ items }: { items: Array<{ label: string; count: number; pct: number; highlight?: boolean }> }) {
  const maxPct = Math.max(...items.map(i => i.pct));
  return (
    <div className="space-y-3">
      {items.map(it => (
        <div key={it.label} className="flex items-center justify-between text-sm gap-3">
          <span className={it.highlight ? 'font-semibold' : 'text-gray-700'} style={it.highlight ? { color: COLORS.forest } : undefined}>{it.label}</span>
          <div className="flex items-center gap-2">
            <div className="w-24 h-2 rounded-full bg-gray-100 overflow-hidden">
              <div className="h-full rounded-full" style={{ width: `${(it.pct / maxPct) * 100}%`, backgroundColor: it.highlight ? COLORS.forest : COLORS.midnight }} />
            </div>
            <span className="font-mono font-semibold w-4 text-right" style={it.highlight ? { color: COLORS.forest } : undefined}>{it.count}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

export function RadialGauge({ percent, valueLabel, valueSubtext, footnote, tag }: {
  percent: number; valueLabel: string; valueSubtext?: string; footnote?: string; tag?: string;
}) {
  const r = 40, c = 2 * Math.PI * r;
  const offset = c - (percent / 100) * c;
  return (
    <div className="flex flex-col items-center justify-center py-2 space-y-3">
      {tag && <span className="self-end text-[10px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 font-medium">{tag}</span>}
      <div className="relative w-44 h-44">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r={r} fill="none" stroke="#F1F0F5" strokeWidth="10" />
          <circle cx="50" cy="50" r={r} fill="none" stroke={COLORS.midnight} strokeWidth="10" strokeDasharray={c} strokeDashoffset={offset} strokeLinecap="round" />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-bold" style={{ color: COLORS.midnight }}>{percent}%</span>
          <span className="text-[10px] uppercase tracking-wide text-gray-400 mt-0.5">Attained</span>
        </div>
      </div>
      <div className="text-center">
        <div className="text-lg font-bold" style={{ color: COLORS.midnight }}>{valueLabel}</div>
        {valueSubtext && <p className="text-sm font-medium mt-0.5" style={{ color: COLORS.forest }}>{valueSubtext}</p>}
        {footnote && <p className="text-xs text-gray-400 mt-1">{footnote}</p>}
      </div>
    </div>
  );
}

export function CommissionTracker({ earned, earnedDelta, earnedSparkline, pending, breakdown }: {
  earned: string; earnedDelta?: string; earnedSparkline?: number[]; pending: string;
  breakdown: Array<{ label: string; value: string; tone: 'warn' | 'info' | 'danger' }>;
}) {
  const toneClass = (t: string) => t === 'danger' ? 'bg-red-50 text-red-700' : t === 'warn' ? 'bg-amber-50 text-amber-700' : 'bg-indigo-50 text-indigo-700';
  const renderSparkline = () => {
    if (!earnedSparkline || earnedSparkline.length < 2) return null;
    const w = 120, h = 28;
    const min = Math.min(...earnedSparkline), max = Math.max(...earnedSparkline), range = max - min || 1;
    const pts = earnedSparkline.map((v, i) => `${(i / (earnedSparkline.length - 1)) * w},${h - ((v - min) / range) * h}`).join(' ');
    return <svg width={w} height={h}><polyline points={pts} fill="none" stroke={COLORS.forest} strokeWidth="2" strokeLinecap="round" /></svg>;
  };
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div className="bg-gray-50 rounded-xl p-4 flex flex-col justify-between space-y-3">
        <div>
          <span className="text-xs uppercase tracking-wide text-gray-400">Earned This Month</span>
          <div className="text-xl font-bold mt-1" style={{ color: COLORS.midnight }}>{earned}</div>
          {earnedDelta && <span className="text-xs font-medium mt-1 inline-block" style={{ color: COLORS.forest }}>▲ {earnedDelta}</span>}
        </div>
        {renderSparkline()}
      </div>
      <div className="bg-gray-50 rounded-xl p-4 space-y-2">
        <div>
          <span className="text-xs uppercase tracking-wide text-gray-400">Pending Payouts</span>
          <div className="text-xl font-bold mt-1" style={{ color: COLORS.midnight }}>{pending}</div>
        </div>
        <div className="space-y-1.5 pt-1">
          {breakdown.map(b => (
            <div key={b.label} className="flex items-center justify-between text-sm">
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${toneClass(b.tone)}`}>{b.label}</span>
              <span className="font-mono font-medium">{b.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function ActionQueueList({ items, badge }: {
  badge?: string;
  items: Array<{ id: string | number; name: string; waitingLabel: string; waitingUrgent?: boolean; detail: string; buttonLabel: string }>;
}) {
  return (
    <div className="space-y-2.5">
      {badge && <div className="flex justify-end"><span className="text-xs px-2.5 py-1 rounded-full font-semibold" style={{ backgroundColor: `${COLORS.taupe}22`, color: COLORS.taupe }}>{badge}</span></div>}
      {items.map(it => (
        <div key={it.id} className="p-3.5 rounded-xl bg-gray-50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-sm">{it.name}</span>
              <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${it.waitingUrgent ? 'bg-red-50 text-red-700' : 'bg-gray-200 text-gray-600'}`}>{it.waitingLabel}</span>
            </div>
            <p className="text-xs text-gray-500 truncate">{it.detail}</p>
          </div>
          <button className="shrink-0 px-3 py-2 rounded-lg text-xs font-semibold text-white" style={{ backgroundColor: COLORS.forest }}>{it.buttonLabel}</button>
        </div>
      ))}
    </div>
  );
}

export function PriorityFollowUps({ items }: {
  items: Array<{ id: string | number; initials: string; name: string; time: string; priority: 'Hot' | 'Warm' | 'Cold' }>;
}) {
  const priorityStyle = (p: string) => p === 'Hot'
    ? { backgroundColor: COLORS.midnight, color: 'white' }
    : p === 'Warm'
    ? { backgroundColor: `${COLORS.taupe}22`, color: COLORS.taupe }
    : { backgroundColor: '#F1F0F5', color: '#6B7280' };
  return (
    <div className="space-y-2.5">
      {items.map(it => (
        <div key={it.id} className="p-3 rounded-xl bg-gray-50 flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold shrink-0">{it.initials}</div>
            <div className="min-w-0">
              <div className="text-sm font-semibold truncate">{it.name}</div>
              <div className="text-xs text-gray-400">{it.time}</div>
            </div>
          </div>
          <span className="text-xs px-2.5 py-0.5 rounded-full font-bold shrink-0" style={priorityStyle(it.priority)}>{it.priority}</span>
        </div>
      ))}
    </div>
  );
}

export function TransactionsDetailTable({ rows }: {
  rows: Array<{ id: string | number; property: string; client: string; status: string; statusTone: 'success' | 'info' | 'warn' | 'neutral'; price: string; commission: string; updated: string }>;
}) {
  const toneClass = (t: string) => t === 'success' ? 'bg-green-50 text-green-700' : t === 'info' ? 'bg-indigo-50 text-indigo-700' : t === 'warn' ? 'bg-amber-50 text-amber-700' : 'bg-gray-100 text-gray-600';
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse text-sm">
        <thead>
          <tr className="text-xs uppercase text-gray-400 border-b">
            <th className="py-2 px-2">Property</th>
            <th className="py-2 px-2">Client</th>
            <th className="py-2 px-2">Status</th>
            <th className="py-2 px-2">Agreed Price</th>
            <th className="py-2 px-2">Expected Comm.</th>
            <th className="py-2 px-2">Updated</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {rows.map(r => (
            <tr key={r.id} className="hover:bg-gray-50">
              <td className="py-3 px-2 font-semibold" style={{ color: COLORS.midnight }}>{r.property}</td>
              <td className="py-3 px-2">{r.client}</td>
              <td className="py-3 px-2"><span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${toneClass(r.statusTone)}`}>{r.status}</span></td>
              <td className="py-3 px-2 font-mono">{r.price}</td>
              <td className="py-3 px-2 font-mono font-semibold" style={{ color: COLORS.forest }}>{r.commission}</td>
              <td className="py-3 px-2 text-gray-400">{r.updated}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function ReferralClientsList({ items, footnote }: {
  footnote?: string;
  items: Array<{ id: string | number; initials: string; name: string; note: string; value: string; valueTag: string }>;
}) {
  return (
    <div className="space-y-2.5">
      {items.map(it => (
        <div key={it.id} className="p-3.5 rounded-xl bg-gray-50 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold shrink-0" style={{ backgroundColor: `${COLORS.forest}18`, color: COLORS.forest }}>{it.initials}</div>
            <div className="min-w-0">
              <div className="text-sm font-semibold truncate">{it.name}</div>
              <div className="text-xs text-gray-500 truncate">{it.note}</div>
            </div>
          </div>
          <div className="text-right shrink-0">
            <div className="text-sm font-bold" style={{ color: COLORS.midnight }}>{it.value}</div>
            <span className="text-[11px] font-medium" style={{ color: COLORS.forest }}>{it.valueTag}</span>
          </div>
        </div>
      ))}
      {footnote && <p className="text-xs text-gray-400 pt-1">{footnote}</p>}
    </div>
  );
}

export function InsightDonut({ segments, centerLabel, tag, note }: {
  segments: Array<{ name: string; value: number; pct: number; color: string }>;
  centerLabel: string; tag?: string; note?: string;
}) {
  return (
    <div className="space-y-3">
      {tag && <div className="flex justify-end"><span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 font-medium">{tag}</span></div>}
      <div className="flex items-center gap-6">
        <div className="relative w-32 h-32 shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={segments} dataKey="pct" innerRadius={44} outerRadius={62} paddingAngle={2} cornerRadius={4} stroke="none">
                {segments.map((s, i) => <Cell key={i} fill={s.color} />)}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex items-center justify-center text-sm font-bold" style={{ color: COLORS.midnight }}>{centerLabel}</div>
        </div>
        <div className="space-y-1.5 flex-1 text-sm">
          {segments.map(s => (
            <div key={s.name} className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-gray-700 truncate">
                <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: s.color }} />
                {s.name}
              </span>
              <span className="font-bold shrink-0" style={{ color: COLORS.midnight }}>{s.pct}%</span>
            </div>
          ))}
        </div>
      </div>
      {note && <p className="text-xs text-gray-500 bg-gray-50 p-2.5 rounded-lg">{note}</p>}
    </div>
  );
}

export function ClosedDealCards({ deals }: {
  deals: Array<{ id: string | number; badge: string; date: string; title: string; buyer: string; price: string; commission: string }>;
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {deals.map(d => (
        <div key={d.id} className="p-4 rounded-xl bg-gray-50 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1" style={{ backgroundColor: `${COLORS.forest}18`, color: COLORS.forest }}>✓ {d.badge}</span>
            <span className="text-xs text-gray-400">{d.date}</span>
          </div>
          <div>
            <h3 className="font-bold leading-tight" style={{ color: COLORS.midnight }}>{d.title}</h3>
            <p className="text-xs text-gray-500 mt-0.5">Buyer: {d.buyer}</p>
          </div>
          <div className="pt-2 border-t flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase tracking-wide text-gray-400 block">Final Price</span>
              <span className="text-sm font-bold">{d.price}</span>
            </div>
            <div className="text-right">
              <span className="text-[10px] uppercase tracking-wide text-gray-400 block">Commission</span>
              <span className="text-sm font-bold" style={{ color: COLORS.forest }}>{d.commission}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function TeamLeaderboardTable({ rows }: {
  rows: Array<{ rank: number; initials: string; name: string; title: string; campaigns: number; views: string; leads: number; conversion: string }>;
}) {
  const rankBg = (r: number) => r === 1 ? 'bg-amber-100 text-amber-800' : r === 2 ? 'bg-gray-100 text-gray-600' : 'bg-orange-50 text-orange-700';
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="text-xs uppercase text-gray-400 border-b">
            <th className="py-2 px-2">Rank</th>
            <th className="py-2 px-2">Associate</th>
            <th className="py-2 px-2 text-center">Campaigns</th>
            <th className="py-2 px-2 text-right">Views</th>
            <th className="py-2 px-2 text-right">Leads</th>
            <th className="py-2 px-2 text-right">Conv.</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {rows.map(r => (
            <tr key={r.rank} className="hover:bg-gray-50">
              <td className="py-3 px-2">
                <span className={`w-5 h-5 rounded-full font-bold text-[10px] inline-flex items-center justify-center ${rankBg(r.rank)}`}>{r.rank}</span>
              </td>
              <td className="py-3 px-2">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold shrink-0">{r.initials}</div>
                  <div>
                    <div className="font-semibold text-sm">{r.name}</div>
                    <div className="text-[10px] text-gray-400">{r.title}</div>
                  </div>
                </div>
              </td>
              <td className="py-3 px-2 text-center font-semibold">{r.campaigns}</td>
              <td className="py-3 px-2 text-right font-mono">{r.views}</td>
              <td className="py-3 px-2 text-right font-mono font-semibold" style={{ color: COLORS.midnight }}>{r.leads}</td>
              <td className="py-3 px-2 text-right font-mono font-semibold text-green-700">{r.conversion}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function DualMetricBars({ items, footnoteLeft, footnoteRight }: {
  footnoteLeft?: string; footnoteRight?: string;
  items: Array<{ label: string; metricText: string; pct: number }>;
}) {
  return (
    <div className="space-y-4">
      {items.map(it => (
        <div key={it.label}>
          <div className="flex justify-between items-center text-xs mb-1">
            <span className="font-semibold text-gray-800">{it.label}</span>
            <span className="text-gray-500 font-medium">{it.metricText}</span>
          </div>
          <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full rounded-full" style={{ width: `${it.pct}%`, backgroundColor: COLORS.midnight, opacity: 0.5 + it.pct / 200 }} />
          </div>
        </div>
      ))}
      {(footnoteLeft || footnoteRight) && (
        <div className="pt-3 border-t mt-4 text-[11px] text-gray-500 flex items-center justify-between">
          <span>{footnoteLeft}</span>
          <span className="font-bold" style={{ color: COLORS.midnight }}>{footnoteRight}</span>
        </div>
      )}
    </div>
  );
}

export function ScheduleList({ items }: {
  items: Array<{ id: string | number; month: string; day: string; title: string; time: string; channel: string; tag: string }>;
}) {
  return (
    <div className="space-y-2.5">
      {items.map(it => (
        <div key={it.id} className="p-3.5 rounded-xl bg-gray-50 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl flex flex-col items-center justify-center shrink-0" style={{ backgroundColor: '#EDE9FE', color: '#6D28D9' }}>
              <span className="text-[9px] uppercase leading-none">{it.month}</span>
              <span className="text-sm font-extrabold leading-none mt-0.5">{it.day}</span>
            </div>
            <div className="min-w-0">
              <h3 className="text-sm font-semibold truncate">{it.title}</h3>
              <span className="text-xs text-gray-400">{it.time} • {it.channel}</span>
            </div>
          </div>
          <span className="text-xs px-2.5 py-1 rounded-full font-bold shrink-0" style={{ backgroundColor: '#EDE9FE', color: '#6D28D9' }}>{it.tag}</span>
        </div>
      ))}
    </div>
  );
}

export function PublishedCampaignCards({ campaigns }: {
  campaigns: Array<{ id: string | number; badge: string; publishedLabel: string; title: string; subtitle: string; views: string; enquiries: number; leads: number }>;
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {campaigns.map(c => (
        <div key={c.id} className="p-4 rounded-xl bg-gray-50 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] px-2 py-0.5 rounded-md font-bold flex items-center gap-1" style={{ backgroundColor: `${COLORS.forest}18`, color: COLORS.forest }}>
              <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: COLORS.forest }} /> {c.badge}
            </span>
            <span className="text-[11px] text-gray-400">{c.publishedLabel}</span>
          </div>
          <div>
            <h3 className="text-sm font-bold leading-snug">{c.title}</h3>
            <p className="text-xs text-gray-500 mt-0.5">{c.subtitle}</p>
          </div>
          <div className="grid grid-cols-3 gap-2 pt-3 border-t text-center">
            <div>
              <span className="text-[10px] uppercase font-bold text-gray-400 block">Views</span>
              <span className="text-xs font-extrabold" style={{ color: COLORS.midnight }}>{c.views}</span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-gray-400 block">Enquiries</span>
              <span className="text-xs font-extrabold text-gray-800">{c.enquiries}</span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-gray-400 block">Leads</span>
              <span className="text-xs font-extrabold" style={{ color: COLORS.forest }}>{c.leads}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function StageRevenueBars({ stages, footer }: {
  footer?: { label: string; deals: string; value: string; comm: string };
  stages: Array<{ label: string; deals: number; value: string; comm: string; pct: number; color: string }>;
}) {
  return (
    <div className="space-y-4">
      {stages.map(s => (
        <div key={s.label}>
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-0.5 text-xs mb-1">
            <span className="font-semibold text-gray-800 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: s.color }} />
              {s.label} <span className="text-gray-400 font-normal">({s.deals} deals)</span>
            </span>
            <span className="font-bold text-gray-800">{s.value} <span className="text-gray-400 font-normal">· Comm: {s.comm}</span></span>
          </div>
          <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full rounded-full" style={{ width: `${s.pct}%`, backgroundColor: s.color }} />
          </div>
        </div>
      ))}
      {footer && (
        <div className="pt-3 border-t">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-0.5 text-xs mb-1">
            <span className="font-bold text-gray-900 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: COLORS.forest }} />
              {footer.label} <span className="text-xs font-extrabold px-2 py-0.5 rounded" style={{ backgroundColor: `${COLORS.forest}18`, color: COLORS.forest }}>{footer.deals}</span>
            </span>
            <span className="font-extrabold" style={{ color: COLORS.forest }}>{footer.value} <span className="text-gray-500 font-semibold">· Comm: {footer.comm}</span></span>
          </div>
          <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full rounded-full" style={{ width: '92%', backgroundColor: COLORS.forest }} />
          </div>
        </div>
      )}
    </div>
  );
}

export function FinanceDonut({ segments, centerPct, centerLabel, footerLeft, footerRight }: {
  centerPct: number; centerLabel: string; footerLeft?: string; footerRight?: string;
  segments: Array<{ name: string; value: string; pct: number; color: string; danger?: boolean }>;
}) {
  return (
    <div className="space-y-4">
      <div className="relative w-44 h-44 mx-auto">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={segments} dataKey="pct" innerRadius={62} outerRadius={80} paddingAngle={2} cornerRadius={4} stroke="none">
              {segments.map((s, i) => <Cell key={i} fill={s.color} />)}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-2xl font-black" style={{ color: COLORS.midnight }}>{centerPct}%</span>
          <span className="text-[10px] uppercase tracking-wide text-gray-400 mt-0.5">{centerLabel}</span>
        </div>
      </div>
      <div className="space-y-2.5 text-sm">
        {segments.map(s => (
          <div key={s.name} className="flex items-center justify-between">
            <span className="flex items-center gap-2 font-semibold" style={{ color: s.danger ? '#DC2626' : '#374151' }}>
              <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: s.color }} />
              {s.name}
            </span>
            <span className="text-right">
              <span className="font-bold" style={{ color: s.danger ? '#DC2626' : '#111827' }}>{s.value}</span>
              <span className="text-xs ml-1" style={{ color: s.danger ? '#F87171' : '#9CA3AF' }}>({s.pct}%)</span>
            </span>
          </div>
        ))}
      </div>
      {(footerLeft || footerRight) && (
        <div className="pt-3 border-t flex items-center justify-between text-[11px] text-gray-400">
          <span>{footerLeft}</span>
          <span className="font-semibold" style={{ color: COLORS.midnight }}>{footerRight}</span>
        </div>
      )}
    </div>
  );
}

export function CommissionSplitCard({ total, tag, splitPct, agentLabel, agentValue, agentNote, companyLabel, companyValue, companyNote, footerItems }: {
  total: string; tag?: string; splitPct: number;
  agentLabel: string; agentValue: string; agentNote?: string;
  companyLabel: string; companyValue: string; companyNote?: string;
  footerItems?: Array<{ label: string; value: string }>;
}) {
  return (
    <div className="space-y-5">
      {tag && <div className="flex justify-end"><span className="text-[11px] px-2.5 py-1 rounded-md bg-gray-100 text-gray-600 font-bold">{tag}</span></div>}
      <div>
        <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Total Recognized Commission</div>
        <div className="text-3xl font-black" style={{ color: COLORS.midnight }}>{total}</div>
        <div className="mt-3 h-4 w-full rounded-full bg-gray-100 flex overflow-hidden p-0.5 gap-0.5">
          <div className="h-full rounded-l-full" style={{ width: `${splitPct}%`, backgroundColor: COLORS.midnight }} />
          <div className="h-full rounded-r-full" style={{ width: `${100 - splitPct}%`, backgroundColor: COLORS.forest }} />
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-3.5 rounded-xl" style={{ backgroundColor: `${COLORS.midnight}0d`, border: `1px solid ${COLORS.midnight}22` }}>
          <div className="flex items-center gap-1.5 text-xs font-bold" style={{ color: COLORS.midnight }}>
            <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: COLORS.midnight }} />
            {agentLabel}
          </div>
          <div className="text-xl font-extrabold mt-1">{agentValue}</div>
          {agentNote && <p className="text-[11px] text-gray-500 mt-0.5">{agentNote}</p>}
        </div>
        <div className="p-3.5 rounded-xl" style={{ backgroundColor: `${COLORS.forest}0d`, border: `1px solid ${COLORS.forest}22` }}>
          <div className="flex items-center gap-1.5 text-xs font-bold" style={{ color: COLORS.forest }}>
            <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: COLORS.forest }} />
            {companyLabel}
          </div>
          <div className="text-xl font-extrabold mt-1">{companyValue}</div>
          {companyNote && <p className="text-[11px] text-gray-500 mt-0.5">{companyNote}</p>}
        </div>
      </div>
      {footerItems && (
        <div className="pt-4 border-t flex flex-wrap items-center gap-x-6 gap-y-2 text-xs">
          {footerItems.map(f => (
            <div key={f.label} className="flex items-center gap-2">
              <span className="font-bold text-gray-700">{f.label}:</span>
              <span className="font-bold" style={{ color: COLORS.midnight }}>{f.value}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function CommissionRulesTable({ rows, tag }: {
  tag?: string;
  rows: Array<{ role: string; note: string; split: string; active: boolean }>;
}) {
  return (
    <div>
      {tag && <div className="flex justify-end mb-2"><span className="text-xs text-gray-400 font-semibold">{tag}</span></div>}
      <div className="divide-y text-sm">
        {rows.map(r => (
          <div key={r.role} className="py-3 flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="font-bold text-gray-900 truncate">{r.role}</p>
              <p className="text-xs text-gray-400 truncate">{r.note}</p>
            </div>
            <div className="flex items-center gap-2.5 shrink-0">
              <span className="font-extrabold text-gray-800">{r.split}</span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${r.active ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-400'}`}>
                {r.active ? 'Active' : 'Inactive'}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function OverdueList({ badge, items }: {
  badge?: string;
  items: Array<{ id: string | number; title: string; daysLabel: string; client: string; note: string; amount: string; buttonLabel: string }>;
}) {
  return (
    <div className="space-y-3">
      {badge && <div className="flex justify-end"><span className="text-xs px-2.5 py-1 rounded-full font-bold bg-red-100 text-red-700">{badge}</span></div>}
      {items.map(it => (
        <div key={it.id} className="p-3.5 rounded-xl border border-red-100 bg-red-50/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className="font-extrabold text-sm truncate">{it.title}</h4>
              <span className="px-2 py-0.5 bg-red-100 text-red-700 text-[10px] font-bold rounded">{it.daysLabel}</span>
            </div>
            <p className="text-xs text-gray-500 mt-0.5">Client: <span className="font-semibold text-gray-700">{it.client}</span> · {it.note}</p>
            <p className="text-xs font-bold text-red-600 mt-1">Amount: {it.amount}</p>
          </div>
          <button className="shrink-0 px-3 py-1.5 bg-white border border-red-200 hover:bg-red-50 text-red-700 text-xs font-bold rounded-lg">{it.buttonLabel}</button>
        </div>
      ))}
    </div>
  );
}

export function UpcomingPaymentsList({ items }: {
  items: Array<{ id: string | number; title: string; statusTag: string; statusTone: 'info' | 'warn' | 'neutral'; client: string; expected: string; amount: string; dueLabel: string }>;
}) {
  const toneClass = (t: string) => t === 'info' ? 'bg-blue-50 text-blue-700' : t === 'warn' ? 'bg-amber-50 text-amber-700' : 'bg-purple-50 text-purple-700';
  return (
    <div className="space-y-3">
      {items.map(it => (
        <div key={it.id} className="p-3.5 rounded-xl bg-gray-50 border flex items-center justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className="font-extrabold text-sm truncate">{it.title}</h4>
              <span className={`px-2 py-0.5 text-[10px] font-bold rounded ${toneClass(it.statusTone)}`}>{it.statusTag}</span>
            </div>
            <p className="text-xs text-gray-500 mt-0.5">Client: <span className="font-semibold text-gray-700">{it.client}</span> · Expected: {it.expected}</p>
            <p className="text-xs font-bold text-gray-900 mt-1">{it.amount}</p>
          </div>
          <span className="shrink-0 text-xs font-bold bg-gray-100 text-gray-600 px-2.5 py-1 rounded-lg">{it.dueLabel}</span>
        </div>
      ))}
    </div>
  );
}

export function SettlementsLedgerTable({ rows }: {
  rows: Array<{ id: string | number; initials: string; property: string; area: string; client: string; total: string; agentShare: string; companyShare: string; date: string; status: string; statusTone: 'success' | 'warn' }>;
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse text-xs">
        <thead>
          <tr className="border-b text-gray-400 font-bold uppercase tracking-wider text-[10px]">
            <th className="py-3 px-3">Property</th>
            <th className="py-3 px-3">Client</th>
            <th className="py-3 px-3">Total Commission</th>
            <th className="py-3 px-3">Agent Share</th>
            <th className="py-3 px-3">Company Share</th>
            <th className="py-3 px-3">Payment Date</th>
            <th className="py-3 px-3">Status</th>
            <th className="py-3 px-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {rows.map(r => (
            <tr key={r.id} className="hover:bg-gray-50">
              <td className="py-3.5 px-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center font-bold shrink-0" style={{ backgroundColor: `${COLORS.midnight}15`, color: COLORS.midnight }}>{r.initials}</div>
                  <div className="min-w-0">
                    <p className="font-extrabold text-gray-900 truncate">{r.property}</p>
                    <p className="text-[10px] text-gray-400 truncate">{r.area}</p>
                  </div>
                </div>
              </td>
              <td className="py-3.5 px-3 font-semibold text-gray-700">{r.client}</td>
              <td className="py-3.5 px-3 font-extrabold text-gray-900">{r.total}</td>
              <td className="py-3.5 px-3 font-bold" style={{ color: COLORS.midnight }}>{r.agentShare}</td>
              <td className="py-3.5 px-3 font-bold" style={{ color: COLORS.forest }}>{r.companyShare}</td>
              <td className="py-3.5 px-3 text-gray-500 font-medium">{r.date}</td>
              <td className="py-3.5 px-3">
                <span className={`px-2.5 py-1 rounded-full font-extrabold text-[10px] inline-flex items-center gap-1 ${r.statusTone === 'success' ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'}`}>
                  <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: r.statusTone === 'success' ? COLORS.forest : COLORS.taupe }} />
                  {r.status}
                </span>
              </td>
              <td className="py-3.5 px-3 text-right">
                <a href="#" className="font-bold hover:underline" style={{ color: COLORS.midnight }}>View Receipt</a>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
