'use client';

import { useState } from 'react';
import { useJobStore, JobStage } from '@/lib/store/jobs';
import { Briefcase, Plus, Trash2, ExternalLink } from 'lucide-react';

export default function JobsDashboard() {
  const { jobs, addJob, updateStage, deleteJob } = useJobStore();
  
  const [company, setCompany] = useState('');
  const [role, setRole] = useState('');
  const [url, setUrl] = useState('');
  const [notes, setNotes] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!company || !role) return;
    
    addJob({
      company,
      role,
      stage: 'applied',
      url,
      notes
    });

    setCompany('');
    setRole('');
    setUrl('');
    setNotes('');
  };

  const stageColors: Record<JobStage, string> = {
    applied: 'bg-chart-2/20 text-chart-2',
    screening: 'bg-chart-4/20 text-chart-4',
    interview: 'bg-primary/20 text-primary',
    offer: 'bg-chart-5/20 text-chart-5',
    rejected: 'bg-destructive/20 text-destructive',
  };

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Briefcase className="w-8 h-8 text-primary" />
        <h1 className="text-3xl font-black tracking-tight uppercase">Job Applications</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Add Job Form */}
        <div className="md:col-span-1 bg-card border border-border p-6 rounded-lg h-fit">
          <h2 className="text-lg font-bold tracking-tight mb-4 uppercase text-primary">New Application</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-muted-foreground uppercase mb-1">Company</label>
              <input 
                type="text" value={company} onChange={(e) => setCompany(e.target.value)}
                className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:border-primary"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-muted-foreground uppercase mb-1">Role</label>
              <input 
                type="text" value={role} onChange={(e) => setRole(e.target.value)}
                className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:border-primary"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-muted-foreground uppercase mb-1">Job Link</label>
              <input 
                type="url" value={url} onChange={(e) => setUrl(e.target.value)}
                className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:border-primary"
              />
            </div>
            <button type="submit" className="w-full bg-primary text-primary-foreground font-bold uppercase tracking-wider py-2 rounded-md hover:bg-primary/90 flex items-center justify-center gap-2">
              <Plus className="w-4 h-4" /> Track Job
            </button>
          </form>
        </div>

        {/* Jobs List */}
        <div className="md:col-span-2 space-y-4">
          {jobs.length === 0 ? (
            <div className="bg-card border border-border p-8 rounded-lg text-center text-muted-foreground">No applications tracked yet. Start applying!</div>
          ) : (
            jobs.map((j) => (
              <div key={j.id} className="bg-card border border-border p-5 rounded-lg flex flex-col gap-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-xl font-bold uppercase tracking-tight flex items-center gap-2">
                      {j.company}
                      {j.url && <a href={j.url} target="_blank" rel="noreferrer" className="text-muted-foreground hover:text-primary"><ExternalLink className="w-4 h-4" /></a>}
                    </h3>
                    <div className="text-sm text-muted-foreground font-mono mt-1">{j.role}</div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className={`text-[10px] uppercase font-bold px-2 py-1 rounded-full ${stageColors[j.stage]}`}>
                      {j.stage}
                    </span>
                    <div className="text-xs text-muted-foreground">{new Date(j.appliedDate).toLocaleDateString()}</div>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-2 pt-4 border-t border-border">
                  <div className="flex items-center gap-2 w-full max-w-xs">
                    <label className="text-xs font-bold text-muted-foreground uppercase">Update Stage:</label>
                    <select 
                      value={j.stage} 
                      onChange={(e) => updateStage(j.id, e.target.value as JobStage)}
                      className="flex-1 bg-background border border-border rounded-md px-2 py-1 text-xs focus:outline-none focus:border-primary"
                    >
                      <option value="applied">Applied</option>
                      <option value="screening">Screening</option>
                      <option value="interview">Interview</option>
                      <option value="offer">Offer</option>
                      <option value="rejected">Rejected</option>
                    </select>
                  </div>
                  <button onClick={() => deleteJob(j.id)} className="p-2 bg-background border border-border rounded-md text-muted-foreground hover:text-destructive transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )).reverse()
          )}
        </div>
      </div>
    </div>
  );
}
