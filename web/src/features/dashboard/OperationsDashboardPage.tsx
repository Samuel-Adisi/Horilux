import { ClipboardList, Timer, AlertTriangle, CheckCircle2, Gauge, Plus } from "lucide-react";
import {
  KpiCard, InsightDonut, CountBars, ActivityFeed,
  OwnerStackedBars, TaskOverdueList, TaskBoard, COLORS,
} from "./components/DashboardSections";

const MOCK_STATUS_SEGMENTS = [
  { name: "Open", value: 42, pct: 31, color: COLORS.taupe },
  { name: "In Progress", value: 29, pct: 21, color: COLORS.midnight },
  { name: "Done", value: 64, pct: 47, color: COLORS.forest },
];

const MOCK_ENTITY_LOAD = [
  { label: "Property Asset Holdings", count: 48, pct: 36 },
  { label: "Transaction & Escrow Closures", count: 34, pct: 25 },
  { label: "Client Viewings & Tours", count: 26, pct: 19 },
  { label: "Campaign & Media Launches", count: 18, pct: 13 },
  { label: "General & Internal Audit", count: 9, pct: 7, highlight: true },
];

const MOCK_OVERDUE = [
  { id: 1, title: "Deed of Assignment Verification – Cantonments Villa", owner: "Efua Sutherland", entityTag: "Property", dueLabel: "Due yesterday", statusLabel: "Overdue · 1d", urgent: true },
  { id: 2, title: "Escrow Sign-off Documentation – Villagio Vista", owner: "Kwame Mensah", entityTag: "Transaction", dueLabel: "Today, 14:00", statusLabel: "Due in 3h" },
  { id: 3, title: "VIP Client Viewing Logistics – Ridge Signature", owner: "Akosua Agyapong", entityTag: "Viewing", dueLabel: "Tomorrow, 09:30", statusLabel: "Due in 22h" },
  { id: 4, title: "Title Search Certification – Airport Hills", owner: "Emmanuel Osei-Bonsu", entityTag: "Property", dueLabel: "Due 2 days ago", statusLabel: "Overdue · 2d", urgent: true },
];

const MOCK_OWNERS = [
  { initials: "ES", name: "Efua Sutherland", total: 28, open: 8, inProgress: 6, done: 14 },
  { initials: "KM", name: "Kwame Mensah", total: 24, open: 6, inProgress: 7, done: 11 },
  { initials: "AA", name: "Akosua Agyapong", total: 19, open: 5, inProgress: 4, done: 10 },
  { initials: "EO", name: "Emmanuel Osei-Bonsu", total: 15, open: 4, inProgress: 5, done: 6 },
  { initials: "NY", name: "Nana Yaa Konadu", total: 12, open: 3, inProgress: 3, done: 6 },
];

const MOCK_BOARD = [
  {
    key: "open", title: "Open", color: COLORS.taupe, count: 3,
    cards: [
      { id: "o1", tag: "Property", title: "Structural Survey & Valuation", note: "Engineering sign-off required before final escrow release.", dateLabel: "Oct 28", ownerInitials: "ES", priority: "High" as const },
      { id: "o2", tag: "Transaction", title: "Draft AML / KYC Verification Package", note: "Trust provenance paperwork for buyer counsel review.", dateLabel: "Oct 29", ownerInitials: "KM", priority: "Medium" as const },
      { id: "o3", tag: "Campaign", title: "Drone Footage Capture & Staging", note: "Flyover sequence for the beachfront enclave listing.", dateLabel: "Oct 30", ownerInitials: "AA", priority: "Low" as const },
    ],
  },
  {
    key: "in_progress", title: "In Progress", color: COLORS.midnight, count: 3,
    cards: [
      { id: "p1", tag: "Transaction", title: "Client Due Diligence Review", dateLabel: "Due today", ownerInitials: "KM", priority: "High" as const },
      { id: "p2", tag: "Viewing", title: "Key Handover Protocol Setup", note: "Smart-lock passkeys issued to security escort team.", dateLabel: "Tomorrow", ownerInitials: "EO", priority: "Medium" as const },
      { id: "p3", tag: "Transaction", title: "Legal Addendum for Lease Terms", note: "Revised quarterly maintenance clause from partner.", dateLabel: "Oct 26", ownerInitials: "ES", priority: "High" as const },
    ],
  },
  {
    key: "done", title: "Done", color: COLORS.forest, count: 3,
    cards: [
      { id: "d1", tag: "Property", title: "Site Inspection Checklist Signed", note: "Zero material snags identified.", dateLabel: "Today", ownerInitials: "AA", done: true },
      { id: "d2", tag: "Property", title: "Utility Clearance Certificate", note: "Power authority stamp secured.", dateLabel: "Yesterday", ownerInitials: "EO", done: true },
      { id: "d3", tag: "Transaction", title: "Deposit Receipt Verification", note: "Bank confirmation reconciled with escrow.", dateLabel: "Oct 22", ownerInitials: "KM", done: true },
    ],
  },
];

const MOCK_ACTIVITY = [
  { id: 1, text: <><strong>Kwame Mensah</strong> marked 'Deposit Receipt Verification' as <span style={{ color: COLORS.forest }}>Completed</span></>, time: "12 mins ago" },
  { id: 2, text: <><strong>Efua Sutherland</strong> reassigned 'Title Deed Search' to Emmanuel Osei-Bonsu</>, time: "45 mins ago" },
  { id: 3, text: <><strong>SLA Alert</strong>: 'Deed of Assignment Verification' breached 48h limit</>, time: "2 hours ago" },
  { id: 4, text: <><strong>Akosua Agyapong</strong> created new task 'VIP Client Viewing Logistics'</>, time: "3 hours ago" },
  { id: 5, text: <><strong>Nana Yaa Konadu</strong> updated attachment on 'Escrow Sign-off Documentation'</>, time: "4 hours ago" },
] as unknown as Array<{ id: string | number; text: string; time: string }>;

export function OperationsDashboardPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wide px-2.5 py-1 rounded-full" style={{ backgroundColor: "#e6deff", color: COLORS.midnight }}>Operations</span>
          <h1 className="text-2xl font-bold mt-2" style={{ color: COLORS.midnight }}>Operations Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">Task management and operational velocity across the business</p>
        </div>
        <button className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-white text-sm font-semibold shadow-sm" style={{ backgroundColor: COLORS.midnight }}>
          <Plus size={16} /> New Task
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <KpiCard label="Open Tasks" value={42} icon={<ClipboardList size={18} />} delta="+6 today" deltaDirection="up" sparkline={[10, 14, 12, 18, 16, 20, 22]} />
        <KpiCard label="In Progress" value={29} icon={<Timer size={18} />} subtext="8 closing this sprint" />
        <KpiCard label="Overdue Tasks" value={7} icon={<AlertTriangle size={18} />} subtext="Priority escalation needed" />
        <KpiCard label="Completed This Week" value={64} icon={<CheckCircle2 size={18} />} delta="+18.4%" deltaDirection="up" sparkline={[30, 35, 40, 44, 50, 58, 64]} />
        <KpiCard label="Avg Turnaround" value="2.1 days" icon={<Gauge size={18} />} subtext="98.2% on time" delta="-0.6d" deltaDirection="up" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5 bg-white rounded-2xl p-6 shadow-sm">
          <h2 className="text-base font-bold" style={{ color: COLORS.midnight }}>Task Status Breakdown</h2>
          <p className="text-xs text-gray-400 mb-4">Real-time resolution pipeline composition</p>
          <InsightDonut segments={MOCK_STATUS_SEGMENTS} centerLabel="135 Total" tag="Cycle 43" />
        </div>
        <div className="lg:col-span-7 bg-white rounded-2xl p-6 shadow-sm">
          <h2 className="text-base font-bold" style={{ color: COLORS.midnight }}>Tasks by Linked Entity</h2>
          <p className="text-xs text-gray-400 mb-4">Cross-department operational assignment anchors</p>
          <CountBars items={MOCK_ENTITY_LOAD} />
          <div className="flex items-center justify-between pt-4 mt-2 border-t border-gray-100 text-xs text-gray-500">
            <span>Target throughput: 30 tasks/day</span>
            <span className="font-semibold" style={{ color: COLORS.forest }}>Capacity load: Optimal (84%)</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 bg-white rounded-2xl p-6 shadow-sm">
          <h2 className="text-base font-bold" style={{ color: COLORS.midnight }}>Overdue & At-Risk Tasks</h2>
          <p className="text-xs text-gray-400 mb-4">Needs immediate attention</p>
          <TaskOverdueList badge="4 Escalations" items={MOCK_OVERDUE} />
        </div>
        <div className="lg:col-span-5 bg-white rounded-2xl p-6 shadow-sm">
          <h2 className="text-base font-bold" style={{ color: COLORS.midnight }}>Tasks by Owner</h2>
          <p className="text-xs text-gray-400 mb-4">Operational load balance across the team</p>
          <OwnerStackedBars owners={MOCK_OWNERS} />
          <div className="flex items-center justify-between pt-4 mt-2 border-t border-gray-100 text-xs text-gray-500">
            <span>Team velocity: 92% SLA</span>
            <span className="font-semibold" style={{ color: COLORS.midnight }}>Rebalance workloads</span>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-bold" style={{ color: COLORS.midnight }}>Operational Board</h2>
          <p className="text-sm text-gray-500">Triaged execution stages for transactions & asset compliance</p>
        </div>
        <TaskBoard columns={MOCK_BOARD} />
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <h2 className="text-base font-bold mb-4" style={{ color: COLORS.midnight }}>Recent Activity</h2>
        <ActivityFeed events={MOCK_ACTIVITY} />
      </div>
    </div>
  );
}
