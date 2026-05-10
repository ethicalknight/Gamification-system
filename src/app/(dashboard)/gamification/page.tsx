'use client';

import { useState, useCallback } from 'react';
import { useGamificationStore, Task } from '@/lib/store/gamification';
import { Target, Zap, TrendingUp, ShieldAlert, Brain, Activity, Code, IndianRupee, Users, Award, Edit2, Check, Camera, Plus, Trash2, Bell, ChevronRight } from 'lucide-react';
import { Modal } from '@/components/shared/Modal';
import { StatCard } from '@/components/shared/StatCard';
import { EmptyState } from '@/components/shared/EmptyState';

const PRIORITY_COLORS = {
  Critical: 'text-destructive border-destructive/30 bg-destructive/10',
  High: 'text-orange-400 border-orange-400/30 bg-orange-400/10',
  Medium: 'text-chart-2 border-chart-2/30 bg-chart-2/10',
  Low: 'text-muted-foreground border-muted-foreground/30 bg-muted/50',
} as const;

function TaskModal({ open, onClose, onAdd }: { open: boolean; onClose: () => void; onAdd: (t: Omit<Task, 'id' | 'done' | 'createdAt'>) => void }) {
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState<Task['priority']>('Medium');
  const [category, setCategory] = useState<Task['category']>('Work');
  const [deadline, setDeadline] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    onAdd({ title: title.trim(), priority, category, deadline: deadline || new Date().toISOString().split('T')[0] });
    setTitle(''); setPriority('Medium'); setCategory('Work'); setDeadline('');
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title="New Task" size="sm">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-muted-foreground uppercase mb-1">Title</label>
          <input
            autoFocus
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:border-primary"
            placeholder="What needs to be done?"
            required
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-muted-foreground uppercase mb-1">Priority</label>
            <select
              value={priority}
              onChange={e => setPriority(e.target.value as Task['priority'])}
              className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:border-primary"
            >
              {(['Low', 'Medium', 'High', 'Critical'] as const).map(p => <option key={p}>{p}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-muted-foreground uppercase mb-1">Category</label>
            <select
              value={category}
              onChange={e => setCategory(e.target.value as Task['category'])}
              className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:border-primary"
            >
              {(['Work', 'Personal', 'Health', 'Finance', 'Learning'] as const).map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
        </div>
        <div>
          <label className="block text-xs font-bold text-muted-foreground uppercase mb-1">Deadline</label>
          <input
            type="date"
            value={deadline}
            onChange={e => setDeadline(e.target.value)}
            className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:border-primary"
          />
        </div>
        <button
          type="submit"
          className="w-full bg-primary text-primary-foreground font-bold uppercase tracking-wider py-2.5 rounded-md hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4" /> Add Task
        </button>
      </form>
    </Modal>
  );
}

export default function GamificationDashboard() {
  const { username, avatarUrl, level, xp, rank, stats, streakDays, badges, tasks, updateProfile, addTask, toggleTask, deleteTask } = useGamificationStore();
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(username);
  const [editAvatar, setEditAvatar] = useState(avatarUrl);
  const [taskModalOpen, setTaskModalOpen] = useState(false);

  const xpForNextLevel = level * 1000;
  const xpPercentage = Math.min(100, Math.floor((xp / xpForNextLevel) * 100));

  const pendingTasks = tasks.filter(t => !t.done);
  const completedTasks = tasks.filter(t => t.done);
  const completionRate = tasks.length > 0 ? Math.round((completedTasks.length / tasks.length) * 100) : 0;

  const handleSaveProfile = () => {
    if (editName.trim()) { updateProfile(editName, editAvatar); setIsEditing(false); }
  };

  const handleAddTask = useCallback((t: Omit<Task, 'id' | 'done' | 'createdAt'>) => {
    addTask(t);
  }, [addTask]);

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-5xl mx-auto">
      <TaskModal open={taskModalOpen} onClose={() => setTaskModalOpen(false)} onAdd={handleAddTask} />

      {/* Profile Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-card border border-border p-6 rounded-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none" />
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6 z-10 w-full md:w-auto">
          <div className="relative shrink-0 group">
            {avatarUrl ? (
              <img src={avatarUrl} alt="Avatar" className="w-24 h-24 rounded-lg object-cover border-2 border-primary" />
            ) : (
              <div className="w-24 h-24 rounded-lg bg-background border-2 border-primary flex items-center justify-center">
                <span className="text-4xl font-black text-primary">{rank}</span>
              </div>
            )}
            <div className="absolute inset-0 bg-black/60 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer" onClick={() => setIsEditing(true)}>
              <Camera className="text-white w-6 h-6" />
            </div>
            <div className="absolute -bottom-3 -right-3 bg-accent border border-primary px-2 py-0.5 rounded text-xs font-bold text-primary">LVL {level}</div>
          </div>
          <div className="flex-1 text-center md:text-left mt-2 md:mt-0">
            {isEditing ? (
              <div className="flex flex-col gap-2 w-full max-w-xs">
                <input type="text" value={editName} onChange={e => setEditName(e.target.value)} className="bg-background border border-border rounded px-2 py-1 text-lg font-bold focus:outline-none focus:border-primary" placeholder="Username" />
                <div className="flex gap-2">
                  <input type="text" value={editAvatar} onChange={e => setEditAvatar(e.target.value)} className="flex-1 bg-background border border-border rounded px-2 py-1 text-xs focus:outline-none focus:border-primary" placeholder="Avatar URL (optional)" />
                  <button onClick={handleSaveProfile} className="p-1.5 bg-primary/20 text-primary rounded hover:bg-primary/40 transition-colors"><Check className="w-4 h-4" /></button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2 group cursor-pointer" onClick={() => setIsEditing(true)}>
                <h1 className="text-2xl font-bold tracking-tight uppercase">{username}</h1>
                <Edit2 className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            )}
            {!isEditing && <p className="text-muted-foreground text-sm flex items-center justify-center md:justify-start gap-2 mt-1"><Award className="w-4 h-4 text-chart-4" /> {streakDays} Day Streak</p>}
          </div>
        </div>
        <div className="w-full md:w-1/3 z-10 mt-4 md:mt-0">
          <div className="flex justify-between text-xs font-medium text-muted-foreground mb-2">
            <span>XP: {xp}</span><span>NEXT: {xpForNextLevel}</span>
          </div>
          <div className="w-full h-3 bg-accent rounded-full overflow-hidden">
            <div className="h-full bg-primary transition-all duration-500 ease-out" style={{ width: `${xpPercentage}%` }} />
          </div>
          <div className="text-[10px] text-muted-foreground mt-1 text-right">{xpPercentage}% to Level {level + 1}</div>
        </div>
      </div>

      {/* Analytics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Task Completion" value={`${completionRate}%`} color="text-chart-2" sub={`${completedTasks.length} of ${tasks.length} done`} />
        <StatCard label="Pending Tasks" value={pendingTasks.length} color={pendingTasks.length > 5 ? 'text-destructive' : 'text-foreground'} sub={pendingTasks.filter(t => t.priority === 'Critical').length + ' critical'} />
        <StatCard label="Total XP" value={xp.toLocaleString()} color="text-primary" sub={`Rank ${rank}`} />
        <StatCard label="Badges" value={badges.length} color="text-chart-4" sub={badges.length === 0 ? 'Level up to earn' : `Last: ${badges.at(-1)?.name}`} />
      </div>

      {/* Trophy Room */}
      <h2 className="text-sm font-bold tracking-widest text-chart-4 border-b border-border pb-2 uppercase">Trophy Room</h2>
      {badges.length === 0 ? (
        <EmptyState icon={Award} message="No badges yet." sub="Level up to earn trophies." />
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {badges.map(b => (
            <div key={b.id} className="bg-card border border-chart-4/30 p-4 rounded-lg flex flex-col items-center text-center gap-2">
              <div className="text-3xl">{b.icon}</div>
              <div className="text-sm font-bold text-chart-4">{b.name}</div>
              <div className="text-[10px] text-muted-foreground">{new Date(b.unlockedAt).toLocaleDateString()}</div>
            </div>
          ))}
        </div>
      )}

      {/* Stats Grid */}
      <h2 className="text-sm font-bold tracking-widest border-b border-border pb-2 uppercase">Core Stats</h2>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { name: 'Strength', val: stats.strength, icon: Activity, color: 'text-chart-1' },
          { name: 'Intelligence', val: stats.intelligence, icon: Brain, color: 'text-chart-2' },
          { name: 'Discipline', val: stats.discipline, icon: Target, color: 'text-chart-3' },
          { name: 'Focus', val: stats.focus, icon: Zap, color: 'text-chart-4' },
          { name: 'Consistency', val: stats.consistency, icon: TrendingUp, color: 'text-primary' },
          { name: 'Knowledge', val: stats.knowledge, icon: Brain, color: 'text-chart-5' },
          { name: 'Finance', val: stats.finance, icon: IndianRupee, color: 'text-chart-1' },
          { name: 'Networking', val: stats.networking, icon: Users, color: 'text-chart-2' },
          { name: 'Coding', val: stats.coding, icon: Code, color: 'text-chart-3' },
          { name: 'Cyber', val: stats.cybersecurity, icon: ShieldAlert, color: 'text-chart-4' },
        ].map(s => (
          <div key={s.name} className="bg-card border border-border p-3 rounded-lg flex flex-col items-center justify-center gap-1.5">
            <s.icon className={`w-5 h-5 ${s.color}`} />
            <div className="text-xl font-black">{s.val}</div>
            <div className="text-[9px] text-muted-foreground font-bold tracking-widest uppercase text-center">{s.name}</div>
          </div>
        ))}
      </div>

      {/* Task Management */}
      <div>
        <div className="flex justify-between items-center border-b border-border pb-2 mb-4">
          <div className="flex items-center gap-3">
            <h2 className="text-sm font-bold tracking-widest uppercase">Active Tasks</h2>
            {pendingTasks.length > 0 && (
              <span className="text-xs font-bold bg-destructive/20 text-destructive px-2 py-0.5 rounded-full border border-destructive/30">
                {pendingTasks.length} pending
              </span>
            )}
          </div>
          <button
            onClick={() => setTaskModalOpen(true)}
            className="flex items-center gap-1.5 text-xs font-bold bg-primary text-primary-foreground px-3 py-1.5 rounded hover:bg-primary/80 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" /> Task
          </button>
        </div>

        {tasks.length === 0 ? (
          <EmptyState icon={Target} message="No tasks yet." sub="Press + Task to add your first task." />
        ) : (
          <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
            {[...tasks].sort((a, b) => {
              if (a.done !== b.done) return Number(a.done) - Number(b.done);
              const pOrder = { Critical: 0, High: 1, Medium: 2, Low: 3 };
              return pOrder[a.priority] - pOrder[b.priority];
            }).map(task => (
              <div
                key={task.id}
                className={`flex items-center gap-3 p-3 border rounded-lg transition-colors group ${task.done ? 'bg-muted/20 border-border/50 opacity-60' : 'bg-card border-border hover:border-primary/30'}`}
              >
                <button
                  onClick={() => toggleTask(task.id)}
                  className={`shrink-0 w-5 h-5 rounded border flex items-center justify-center transition-colors ${task.done ? 'bg-primary border-primary' : 'border-muted-foreground hover:border-primary'}`}
                >
                  {task.done && <Check className="w-3 h-3 text-background" />}
                </button>
                <div className="flex-1 min-w-0">
                  <div className={`text-sm font-medium truncate ${task.done ? 'line-through text-muted-foreground' : ''}`}>{task.title}</div>
                  <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${PRIORITY_COLORS[task.priority]} uppercase`}>{task.priority}</span>
                    <span className="text-[10px] text-muted-foreground">{task.category}</span>
                    {task.deadline && <span className={`text-[10px] flex items-center gap-0.5 ${new Date(task.deadline) < new Date() && !task.done ? 'text-destructive' : 'text-muted-foreground'}`}>
                      <Bell className="w-2.5 h-2.5" /> {task.deadline}
                    </span>}
                  </div>
                </div>
                <button onClick={() => deleteTask(task.id)} className="shrink-0 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-all">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
