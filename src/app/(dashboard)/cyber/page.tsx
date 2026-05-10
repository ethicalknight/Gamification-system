'use client';

import { useState } from 'react';
import { useCyberStore, CyberLab } from '@/lib/store/cyber';
import { ShieldAlert, Plus, Trash2 } from 'lucide-react';

export default function CyberDashboard() {
  const { labs, logLab, deleteLab } = useCyberStore();
  
  const [platform, setPlatform] = useState<CyberLab['platform']>('HackTheBox');
  const [name, setName] = useState('');
  const [difficulty, setDifficulty] = useState<CyberLab['difficulty']>('Easy');
  const [notes, setNotes] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;
    
    logLab({
      platform,
      name,
      difficulty,
      notes
    });

    setName('');
    setNotes('');
  };

  const diffColors = {
    Easy: 'text-chart-2 bg-chart-2/10 border-chart-2/20',
    Medium: 'text-chart-4 bg-chart-4/10 border-chart-4/20',
    Hard: 'text-destructive bg-destructive/10 border-destructive/20',
    Insane: 'text-purple-500 bg-purple-500/10 border-purple-500/20',
  };

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <ShieldAlert className="w-8 h-8 text-primary" />
        <h1 className="text-3xl font-black tracking-tight uppercase">Cyber Security</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Log Lab Form */}
        <div className="md:col-span-1 bg-card border border-border p-6 rounded-lg h-fit">
          <h2 className="text-lg font-bold tracking-tight mb-4 uppercase text-primary">Log Capture</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-muted-foreground uppercase mb-1">Platform</label>
              <select 
                value={platform} onChange={(e) => setPlatform(e.target.value as CyberLab['platform'])}
                className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:border-primary"
              >
                <option value="HackTheBox">HackTheBox</option>
                <option value="TryHackMe">TryHackMe</option>
                <option value="PortSwigger">PortSwigger</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-muted-foreground uppercase mb-1">Target Name</label>
              <input 
                type="text" value={name} onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Lame, Blue..."
                className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:border-primary"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-muted-foreground uppercase mb-1">Threat Level</label>
              <select 
                value={difficulty} onChange={(e) => setDifficulty(e.target.value as CyberLab['difficulty'])}
                className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:border-primary"
              >
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
                <option value="Insane">Insane</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-muted-foreground uppercase mb-1">Briefing Notes</label>
              <textarea 
                value={notes} onChange={(e) => setNotes(e.target.value)}
                className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:border-primary font-mono text-xs h-20"
              />
            </div>
            <button type="submit" className="w-full bg-primary text-primary-foreground font-bold uppercase tracking-wider py-2 rounded-md hover:bg-primary/90 flex items-center justify-center gap-2">
              <Plus className="w-4 h-4" /> Root Target
            </button>
          </form>
        </div>

        {/* Lab List */}
        <div className="md:col-span-2 space-y-4">
          {labs.length === 0 ? (
            <div className="bg-card border border-border p-8 rounded-lg text-center text-muted-foreground">No targets rooted yet. Access a terminal.</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {labs.slice().reverse().map((lab) => (
                <div key={lab.id} className={`bg-card border border-border p-4 rounded-lg flex flex-col hover:border-primary/50 transition-colors`}>
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-bold text-lg leading-tight font-mono">{lab.name}</h3>
                      <div className="text-xs text-muted-foreground mt-0.5">{lab.platform}</div>
                    </div>
                    <button onClick={() => deleteLab(lab.id)} className="text-muted-foreground hover:text-destructive">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  
                  <div className="flex items-center gap-2 mb-3 mt-1">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${diffColors[lab.difficulty]} uppercase tracking-wider`}>
                      {lab.difficulty}
                    </span>
                  </div>

                  {lab.notes && (
                    <p className="text-xs text-muted-foreground font-mono mt-2 flex-1 border-l-2 border-border pl-2 line-clamp-3">
                      {lab.notes}
                    </p>
                  )}
                  
                  <div className="text-[10px] text-muted-foreground mt-4 pt-3 border-t border-border">
                    Rooted on {new Date(lab.completedAt).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
