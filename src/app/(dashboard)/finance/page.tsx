'use client';

import { useState, useMemo } from 'react';
import { useFinanceStore, Transaction } from '@/lib/store/finance';
import { IndianRupee, Plus, Trash2, Edit2, Check, X, CalendarDays, List, TrendingUp, TrendingDown } from 'lucide-react';
import { Modal } from '@/components/shared/Modal';
import { StatCard } from '@/components/shared/StatCard';
import { EmptyState } from '@/components/shared/EmptyState';

const TYPE_COLOR = {
  income: 'bg-chart-2/20 text-chart-2',
  expense: 'bg-destructive/20 text-destructive',
  subscription: 'bg-primary/20 text-primary',
  investment: 'bg-chart-4/20 text-chart-4',
} as const;

function TransactionModal({ open, onClose, onAdd, initial }: {
  open: boolean; onClose: () => void;
  onAdd: (tx: Omit<Transaction, 'id' | 'createdAt'>) => void;
  initial?: Transaction | null;
}) {
  const today = new Date().toISOString().split('T')[0];
  const [form, setForm] = useState({
    amount: initial?.amount.toString() ?? '',
    type: (initial?.type ?? 'expense') as Transaction['type'],
    category: initial?.category ?? '',
    description: initial?.description ?? '',
    isNecessary: initial?.isNecessary ?? true,
    date: initial?.date?.split('T')[0] ?? today,
  });

  const set = (k: string, v: unknown) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.amount || !form.category) return;
    onAdd({
      amount: parseFloat(form.amount),
      type: form.type,
      category: form.category,
      description: form.description,
      isNecessary: form.type === 'expense' ? form.isNecessary : true,
      date: new Date(form.date).toISOString(),
    });
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title={initial ? 'Edit Transaction' : 'New Transaction'} size="sm">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-muted-foreground uppercase mb-1">Type</label>
            <select value={form.type} onChange={e => set('type', e.target.value)} className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:border-primary">
              <option value="expense">Expense</option>
              <option value="income">Income</option>
              <option value="subscription">Subscription</option>
              <option value="investment">Investment</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-muted-foreground uppercase mb-1">Amount (₹)</label>
            <input type="number" step="0.01" min="0" value={form.amount} onChange={e => set('amount', e.target.value)} className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:border-primary" required />
          </div>
        </div>
        <div>
          <label className="block text-xs font-bold text-muted-foreground uppercase mb-1">Date</label>
          <input type="date" value={form.date} onChange={e => set('date', e.target.value)} className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:border-primary" />
        </div>
        <div>
          <label className="block text-xs font-bold text-muted-foreground uppercase mb-1">Category</label>
          <input type="text" value={form.category} onChange={e => set('category', e.target.value)} placeholder="e.g. Food, Salary, Rent" className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:border-primary" required />
        </div>
        <div>
          <label className="block text-xs font-bold text-muted-foreground uppercase mb-1">Description</label>
          <input type="text" value={form.description} onChange={e => set('description', e.target.value)} className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:border-primary" />
        </div>
        {form.type === 'expense' && (
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input type="checkbox" checked={form.isNecessary} onChange={e => set('isNecessary', e.target.checked)} className="accent-primary" />
            Was this a necessary expense?
          </label>
        )}
        <button type="submit" className="w-full bg-primary text-primary-foreground font-bold uppercase tracking-wider py-2.5 rounded-md hover:bg-primary/90 transition-colors flex items-center justify-center gap-2">
          <Plus className="w-4 h-4" /> {initial ? 'Save Changes' : 'Add Transaction'}
        </button>
      </form>
    </Modal>
  );
}

function CalendarView({ transactions }: { transactions: Transaction[] }) {
  const [viewMonth, setViewMonth] = useState(() => {
    const n = new Date(); return { month: n.getMonth(), year: n.getFullYear() };
  });

  const daysInMonth = new Date(viewMonth.year, viewMonth.month + 1, 0).getDate();
  const firstDayOfWeek = new Date(viewMonth.year, viewMonth.month, 1).getDay();

  const dayMap = useMemo(() => {
    const m: Record<number, { income: number; expense: number }> = {};
    transactions.forEach(tx => {
      const d = new Date(tx.date);
      if (d.getMonth() === viewMonth.month && d.getFullYear() === viewMonth.year) {
        const day = d.getDate();
        if (!m[day]) m[day] = { income: 0, expense: 0 };
        if (tx.type === 'income') m[day].income += tx.amount;
        else if (tx.type === 'expense' || tx.type === 'subscription') m[day].expense += tx.amount;
      }
    });
    return m;
  }, [transactions, viewMonth]);

  const monthName = new Date(viewMonth.year, viewMonth.month).toLocaleString('default', { month: 'long', year: 'numeric' });
  const today = new Date();

  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <button onClick={() => setViewMonth(v => {
          const d = new Date(v.year, v.month - 1); return { month: d.getMonth(), year: d.getFullYear() };
        })} className="text-muted-foreground hover:text-foreground p-1">‹</button>
        <h3 className="text-sm font-bold uppercase">{monthName}</h3>
        <button onClick={() => setViewMonth(v => {
          const d = new Date(v.year, v.month + 1); return { month: d.getMonth(), year: d.getFullYear() };
        })} className="text-muted-foreground hover:text-foreground p-1">›</button>
      </div>
      <div className="grid grid-cols-7 text-center">
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
          <div key={i} className="text-[10px] font-bold text-muted-foreground py-2">{d}</div>
        ))}
        {Array.from({ length: firstDayOfWeek }).map((_, i) => <div key={`e${i}`} />)}
        {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => {
          const data = dayMap[day];
          const isToday = today.getDate() === day && today.getMonth() === viewMonth.month && today.getFullYear() === viewMonth.year;
          return (
            <div key={day} className={`min-h-[48px] border border-border/20 p-1 flex flex-col items-center ${isToday ? 'bg-primary/10' : 'hover:bg-muted/30'}`}>
              <span className={`text-[10px] font-bold ${isToday ? 'text-primary' : 'text-muted-foreground'}`}>{day}</span>
              {data?.income ? <span className="text-[8px] font-bold text-chart-2 leading-tight">+{data.income.toFixed(0)}</span> : null}
              {data?.expense ? <span className="text-[8px] font-bold text-destructive leading-tight">-{data.expense.toFixed(0)}</span> : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function FinanceDashboard() {
  const { transactions, monthlyTarget, setMonthlyTarget, addTransaction, updateTransaction, deleteTransaction } = useFinanceStore();

  const [modalOpen, setModalOpen] = useState(false);
  const [editTx, setEditTx] = useState<Transaction | null>(null);
  const [view, setView] = useState<'list' | 'calendar'>('list');
  const [filterType, setFilterType] = useState<string>('all');
  const [isEditingTarget, setIsEditingTarget] = useState(false);
  const [targetInput, setTargetInput] = useState(monthlyTarget.toString());
  const [searchQ, setSearchQ] = useState('');

  const now = new Date();
  const cm = now.getMonth(); const cy = now.getFullYear();

  const filtered = useMemo(() => transactions.filter(t => {
    if (filterType !== 'all' && t.type !== filterType) return false;
    if (searchQ && !t.category.toLowerCase().includes(searchQ.toLowerCase()) && !t.description?.toLowerCase().includes(searchQ.toLowerCase())) return false;
    return true;
  }), [transactions, filterType, searchQ]);

  const totalIncome = transactions.filter(t => t.type === 'income').reduce((a, t) => a + t.amount, 0);
  const totalExpense = transactions.filter(t => t.type === 'expense' || t.type === 'subscription').reduce((a, t) => a + t.amount, 0);
  const totalInvest = transactions.filter(t => t.type === 'investment').reduce((a, t) => a + t.amount, 0);
  const balance = totalIncome - totalExpense - totalInvest;

  const monthExpense = transactions.filter(t => (t.type === 'expense' || t.type === 'subscription') && new Date(t.date).getMonth() === cm && new Date(t.date).getFullYear() === cy).reduce((a, t) => a + t.amount, 0);
  const targetPct = Math.min(100, (monthExpense / monthlyTarget) * 100);

  const handleAdd = (tx: Omit<Transaction, 'id' | 'createdAt'>) => {
    if (editTx) { updateTransaction(editTx.id, tx); setEditTx(null); }
    else addTransaction(tx);
  };

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <IndianRupee className="w-7 h-7 text-primary" />
          <h1 className="text-3xl font-black tracking-tight uppercase">Finance</h1>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setView('list')} className={`p-2 rounded border text-xs font-bold transition-colors ${view === 'list' ? 'bg-primary text-primary-foreground border-primary' : 'bg-card border-border text-muted-foreground'}`}><List className="w-4 h-4" /></button>
          <button onClick={() => setView('calendar')} className={`p-2 rounded border text-xs font-bold transition-colors ${view === 'calendar' ? 'bg-primary text-primary-foreground border-primary' : 'bg-card border-border text-muted-foreground'}`}><CalendarDays className="w-4 h-4" /></button>
          <button onClick={() => { setEditTx(null); setModalOpen(true); }} className="flex items-center gap-1.5 text-xs font-bold bg-primary text-primary-foreground px-3 py-2 rounded hover:bg-primary/80 transition-colors">
            <Plus className="w-3.5 h-3.5" /> Add
          </button>
        </div>
      </div>

      <TransactionModal open={modalOpen} onClose={() => { setModalOpen(false); setEditTx(null); }} onAdd={handleAdd} initial={editTx} />

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Balance" value={`₹${balance.toFixed(0)}`} color={balance >= 0 ? 'text-chart-2' : 'text-destructive'} />
        <StatCard label="Income" value={`₹${totalIncome.toFixed(0)}`} color="text-chart-2" icon={<TrendingUp className="w-4 h-4" />} />
        <StatCard label="Expenses" value={`₹${totalExpense.toFixed(0)}`} color="text-destructive" icon={<TrendingDown className="w-4 h-4" />} />
        <StatCard label="Invested" value={`₹${totalInvest.toFixed(0)}`} color="text-chart-4" />
      </div>

      {/* Monthly Target */}
      <div className="bg-card border border-border p-4 rounded-lg">
        <div className="flex justify-between items-center mb-2">
          <span className="text-xs font-bold text-muted-foreground uppercase">Monthly Budget Target</span>
          {isEditingTarget ? (
            <div className="flex items-center gap-1">
              <input type="number" value={targetInput} onChange={e => setTargetInput(e.target.value)} className="w-20 bg-background border border-border rounded px-2 py-0.5 text-xs focus:border-primary focus:outline-none" />
              <button onClick={() => { setMonthlyTarget(parseFloat(targetInput) || 0); setIsEditingTarget(false); }} className="text-primary p-1"><Check className="w-3.5 h-3.5" /></button>
              <button onClick={() => setIsEditingTarget(false)} className="text-muted-foreground p-1"><X className="w-3.5 h-3.5" /></button>
            </div>
          ) : (
            <button onClick={() => setIsEditingTarget(true)} className="flex items-center gap-1 text-xs font-bold hover:text-primary transition-colors">₹{monthlyTarget} <Edit2 className="w-3 h-3" /></button>
          )}
        </div>
        <div className="w-full h-2.5 bg-accent rounded-full overflow-hidden">
          <div className={`h-full transition-all duration-500 ${targetPct > 90 ? 'bg-destructive' : targetPct > 75 ? 'bg-chart-4' : 'bg-primary'}`} style={{ width: `${targetPct}%` }} />
        </div>
        <div className="flex justify-between mt-1 text-[10px] text-muted-foreground">
          <span>₹{monthExpense.toFixed(0)} spent this month</span>
          <span>₹{Math.max(0, monthlyTarget - monthExpense).toFixed(0)} remaining</span>
        </div>
      </div>

      {view === 'calendar' ? (
        <CalendarView transactions={transactions} />
      ) : (
        <div className="bg-card border border-border rounded-lg overflow-hidden">
          <div className="p-4 border-b border-border flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              placeholder="Search transactions..."
              value={searchQ}
              onChange={e => setSearchQ(e.target.value)}
              className="flex-1 bg-background border border-border rounded px-3 py-1.5 text-sm focus:outline-none focus:border-primary"
            />
            <div className="flex gap-1 flex-wrap">
              {(['all', 'income', 'expense', 'subscription', 'investment'] as const).map(f => (
                <button key={f} onClick={() => setFilterType(f)} className={`text-[10px] font-bold px-2 py-1 rounded uppercase transition-colors ${filterType === f ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:text-foreground'}`}>{f}</button>
              ))}
            </div>
          </div>
          {filtered.length === 0 ? (
            <EmptyState icon={IndianRupee} message="No transactions." sub="Add your first transaction above." />
          ) : (
            <div className="overflow-y-auto max-h-[460px]">
              <table className="w-full text-sm text-left">
                <thead className="text-[10px] text-muted-foreground uppercase bg-background border-b border-border sticky top-0">
                  <tr>
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3">Details</th>
                    <th className="px-4 py-3 hidden sm:table-cell">Type</th>
                    <th className="px-4 py-3 text-right">Amount</th>
                    <th className="px-4 py-3 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {[...filtered].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(tx => (
                    <tr key={tx.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3 whitespace-nowrap text-xs text-muted-foreground">
                        {new Date(tx.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-bold text-sm">{tx.category}</div>
                        {tx.description && <div className="text-xs text-muted-foreground">{tx.description}</div>}
                      </td>
                      <td className="px-4 py-3 hidden sm:table-cell">
                        <span className={`text-[9px] uppercase font-bold px-2 py-0.5 rounded-full ${TYPE_COLOR[tx.type]}`}>{tx.type}</span>
                      </td>
                      <td className={`px-4 py-3 text-right font-black ${tx.type === 'income' ? 'text-chart-2' : tx.type === 'expense' ? 'text-destructive' : ''}`}>
                        {tx.type === 'income' ? '+' : '-'}₹{tx.amount.toFixed(2)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-1">
                          <button onClick={() => { setEditTx(tx); setModalOpen(true); }} className="text-muted-foreground hover:text-primary transition-colors p-1"><Edit2 className="w-3.5 h-3.5" /></button>
                          <button onClick={() => deleteTransaction(tx.id)} className="text-muted-foreground hover:text-destructive transition-colors p-1"><Trash2 className="w-3.5 h-3.5" /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
