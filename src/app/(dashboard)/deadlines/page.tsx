'use client';

import { useState, useMemo } from 'react';
import { useDeadlineStore, Deadline } from '@/lib/store/deadlines';
import { Bell, Plus, Trash2, CalendarClock, AlertTriangle, CheckCircle2, Clock } from 'lucide-react';
import { Modal } from '@/components/shared/Modal';
import { EmptyState } from '@/components/shared/EmptyState';

const PRIORITY_COLOR: Record<Deadline['priority'], string> = {
  Critical: 'text-destructive border-destructive/40 bg-destructive/10',
  High: 'text-orange-400 border-orange-400/40 bg-orange-400/10',
  Medium: 'text-chart-4 border-chart-4/40 bg-chart-4/10',
  Low: 'text-muted-foreground border-muted-foreground/40 bg-muted/30',
};

function DeadlineModal({ open, onClose, onAdd }: {
  open: boolean; onClose: () => void;
  onAdd: (d: Omit<Deadline, 'id' | 'notified' | 'createdAt'>) => void;
}) {
  const [form, setForm] = useState({ title: '', date: '', priority: 'Medium' as Deadline['priority'], category: 'General', recurring: false });
  const set = (k: string, v: unknown) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.date) return;
    onAdd({ ...form, date: new Date(form.date).toISOString() });
    setForm({ title: '', date: '', priority: 'Medium', category: 'General', recurring: false });
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title="Add Deadline" size="sm">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-muted-foreground uppercase mb-1">Title *</label>
          <input autoFocus type="text" value={form.title} onChange={e => set('title', e.target.value)} className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:border-primary" placeholder="What's the deadline for?" required />
        </div>
        <div>
          <label className="block text-xs font-bold text-muted-foreground uppercase mb-1">Date & Time *</label>
          <input type="datetime-local" value={form.date} onChange={e => set('date', e.target.value)} className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:border-primary" required />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-muted-foreground uppercase mb-1">Priority</label>
            <select value={form.priority} onChange={e => set('priority', e.target.value)} className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:border-primary">
              {(['Low', 'Medium', 'High', 'Critical'] as const).map(p => <option key={p}>{p}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-muted-foreground uppercase mb-1">Category</label>
            <input type="text" value={form.category} onChange={e => set('category', e.target.value)} className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:border-primary" placeholder="e.g. Project" />
          </div>
        </div>
        <label className="flex items-center gap-2 text-sm cursor-pointer">
          <input type="checkbox" checked={form.recurring} onChange={e => set('recurring', e.target.checked)} className="accent-primary" />
          Recurring deadline (weekly repeat)
        </label>
        <button type="submit" className="w-full bg-primary text-primary-foreground font-bold uppercase tracking-wider py-2.5 rounded-md hover:bg-primary/90 transition-colors flex items-center justify-center gap-2">
          <Plus className="w-4 h-4" /> Add Deadline
        </button>
      </form>
    </Modal>
  );
}

function Countdown({ date }: { date: string }) {
  const diff = new Date(date).getTime() - Date.now();
  if (diff < 0) return <span className="text-[10px] text-destructive font-bold">OVERDUE</span>;
  const days = Math.floor(diff / 86400000);
  const hrs = Math.floor((diff % 86400000) / 3600000);
  const mins = Math.floor((diff % 3600000) / 60000);
  if (days > 0) return <span className="text-[10px] font-mono text-muted-foreground">{days}d {hrs}h left</span>;
  if (hrs > 0) return <span className="text-[10px] font-mono text-chart-4">{hrs}h {mins}m left</span>;
  return <span className="text-[10px] font-mono text-destructive">{mins}m left</span>;
}

export default function DeadlinesDashboard() {
  const { deadlines, addDeadline, deleteDeadline } = useDeadlineStore();
  const [modalOpen, setModalOpen] = useState(false);

  const now = Date.now();
  const sorted = useMemo(() =>
    [...deadlines].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()),
    [deadlines]);

  const overdue = sorted.filter(d => new Date(d.date).getTime() < now);
  const upcoming7 = sorted.filter(d => {
    const t = new Date(d.date).getTime();
    return t >= now && t <= now + 7 * 86400000;
  });
  const future = sorted.filter(d => new Date(d.date).getTime() > now + 7 * 86400000);

  const requestNotifications = async () => {
    if ('Notification' in window) {
      const perm = await Notification.requestPermission();
      if (perm === 'granted') {
        new Notification('Antigravity OS', { body: 'Notifications enabled! You will be reminded of upcoming deadlines.', icon: '/icon-192x192.png' });
      }
    }
  };

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <CalendarClock className="w-7 h-7 text-primary" />
          <h1 className="text-3xl font-black tracking-tight uppercase">Deadlines</h1>
        </div>
        <div className="flex gap-2">
          <button onClick={requestNotifications} className="flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded border border-border bg-card text-muted-foreground hover:text-foreground transition-colors">
            <Bell className="w-3.5 h-3.5" /> Enable Alerts
          </button>
          <button onClick={() => setModalOpen(true)} className="flex items-center gap-1.5 text-xs font-bold bg-primary text-primary-foreground px-3 py-2 rounded hover:bg-primary/80 transition-colors">
            <Plus className="w-3.5 h-3.5" /> Add Deadline
          </button>
        </div>
      </div>

      <DeadlineModal open={modalOpen} onClose={() => setModalOpen(false)} onAdd={addDeadline} />

      {/* Summary Row */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Overdue', val: overdue.length, color: 'text-destructive', icon: AlertTriangle },
          { label: 'This Week', val: upcoming7.length, color: 'text-chart-4', icon: Clock },
          { label: 'Upcoming', val: future.length, color: 'text-chart-2', icon: CheckCircle2 },
        ].map(s => (
          <div key={s.label} className="bg-card border border-border rounded-lg p-4 flex flex-col gap-1">
            <div className="text-xs font-bold text-muted-foreground uppercase flex items-center gap-1">
              <s.icon className="w-3.5 h-3.5" /> {s.label}
            </div>
            <div className={`text-2xl font-black ${s.color}`}>{s.val}</div>
          </div>
        ))}
      </div>

      {deadlines.length === 0 ? (
        <EmptyState icon={CalendarClock} message="No deadlines tracked." sub="Add a deadline to start getting reminders." />
      ) : (
        <div className="space-y-6">
          {overdue.length > 0 && (
            <div>
              <h2 className="text-xs font-bold text-destructive uppercase tracking-widest mb-3 flex items-center gap-2"><AlertTriangle className="w-3.5 h-3.5" /> Overdue ({overdue.length})</h2>
              <div className="space-y-2">
                {overdue.map(d => <DeadlineRow key={d.id} d={d} onDelete={deleteDeadline} />)}
              </div>
            </div>
          )}
          {upcoming7.length > 0 && (
            <div>
              <h2 className="text-xs font-bold text-chart-4 uppercase tracking-widest mb-3 flex items-center gap-2"><Clock className="w-3.5 h-3.5" /> This Week ({upcoming7.length})</h2>
              <div className="space-y-2">
                {upcoming7.map(d => <DeadlineRow key={d.id} d={d} onDelete={deleteDeadline} />)}
              </div>
            </div>
          )}
          {future.length > 0 && (
            <div>
              <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-3">Upcoming ({future.length})</h2>
              <div className="space-y-2">
                {future.map(d => <DeadlineRow key={d.id} d={d} onDelete={deleteDeadline} />)}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function DeadlineRow({ d, onDelete }: { d: Deadline; onDelete: (id: string) => void }) {
  return (
    <div className={`flex items-center gap-3 p-4 border rounded-lg bg-card group transition-colors hover:border-primary/30 ${new Date(d.date).getTime() < Date.now() ? 'border-destructive/30' : 'border-border'}`}>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-bold text-sm">{d.title}</span>
          {d.recurring && <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">RECURRING</span>}
        </div>
        <div className="flex items-center gap-3 mt-1 text-[10px] text-muted-foreground">
          <span>{new Date(d.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
          <span>•</span>
          <span>{d.category}</span>
          <span>•</span>
          <Countdown date={d.date} />
        </div>
      </div>
      <span className={`text-[9px] font-bold px-2 py-0.5 rounded border shrink-0 ${PRIORITY_COLOR[d.priority]}`}>{d.priority}</span>
      <button onClick={() => onDelete(d.id)} className="shrink-0 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-all p-1">
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );
}
