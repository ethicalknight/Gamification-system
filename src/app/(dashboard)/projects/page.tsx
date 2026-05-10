'use client';

import { useState } from 'react';
import { useProjectStore, Project, ProjectStatus } from '@/lib/store/projects';
import { Terminal, Plus, Trash2, Globe2, ExternalLink } from 'lucide-react';

export default function ProjectsDashboard() {
  const { projects, addProject, updateProgress, updateStatus, deleteProject } = useProjectStore();
  
  const [title, setTitle] = useState('');
  const [stack, setStack] = useState('');
  const [githubUrl, setGithubUrl] = useState('');
  const [deploymentUrl, setDeploymentUrl] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;
    
    addProject({
      title,
      stack,
      status: 'planning',
      githubUrl,
      deploymentUrl
    });

    setTitle('');
    setStack('');
    setGithubUrl('');
    setDeploymentUrl('');
  };

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Terminal className="w-8 h-8 text-primary" />
        <h1 className="text-3xl font-black tracking-tight uppercase">Projects Module</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Add Project Form */}
        <div className="md:col-span-1 bg-card border border-border p-6 rounded-lg h-fit">
          <h2 className="text-lg font-bold tracking-tight mb-4 uppercase text-primary">Initialize Project</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-muted-foreground uppercase mb-1">Codename / Title</label>
              <input 
                type="text" value={title} onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:border-primary"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-muted-foreground uppercase mb-1">Tech Stack</label>
              <input 
                type="text" value={stack} onChange={(e) => setStack(e.target.value)}
                placeholder="e.g. Next.js, Rust, Postgres"
                className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-muted-foreground uppercase mb-1">GitHub URL</label>
              <input 
                type="url" value={githubUrl} onChange={(e) => setGithubUrl(e.target.value)}
                className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-muted-foreground uppercase mb-1">Deployment URL</label>
              <input 
                type="url" value={deploymentUrl} onChange={(e) => setDeploymentUrl(e.target.value)}
                className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:border-primary"
              />
            </div>
            <button type="submit" className="w-full bg-primary text-primary-foreground font-bold uppercase tracking-wider py-2 rounded-md hover:bg-primary/90 flex items-center justify-center gap-2">
              <Plus className="w-4 h-4" /> Initialize
            </button>
          </form>
        </div>

        {/* Project List */}
        <div className="md:col-span-2 space-y-4">
          {projects.length === 0 ? (
            <div className="bg-card border border-border p-8 rounded-lg text-center text-muted-foreground">No active projects. Initialize one to start gaining XP.</div>
          ) : (
            projects.map((p) => (
              <div key={p.id} className="bg-card border border-border p-5 rounded-lg flex flex-col gap-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-xl font-bold uppercase tracking-tight">{p.title}</h3>
                    <div className="text-sm text-muted-foreground font-mono mt-1">{p.stack}</div>
                  </div>
                  <div className="flex gap-2">
                    {p.githubUrl && <a href={p.githubUrl} target="_blank" rel="noreferrer" className="p-2 bg-background border border-border rounded-md hover:text-primary transition-colors"><Globe2 className="w-4 h-4" /></a>}
                    {p.deploymentUrl && <a href={p.deploymentUrl} target="_blank" rel="noreferrer" className="p-2 bg-background border border-border rounded-md hover:text-primary transition-colors"><ExternalLink className="w-4 h-4" /></a>}
                    <button onClick={() => deleteProject(p.id)} className="p-2 bg-background border border-border rounded-md text-muted-foreground hover:text-destructive transition-colors"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-muted-foreground uppercase mb-1">Status</label>
                    <select 
                      value={p.status} 
                      onChange={(e) => updateStatus(p.id, e.target.value as ProjectStatus)}
                      className="w-full bg-background border border-border rounded-md px-2 py-1 text-xs focus:outline-none focus:border-primary"
                    >
                      <option value="planning">Planning</option>
                      <option value="active">Active</option>
                      <option value="paused">Paused</option>
                      <option value="completed">Completed</option>
                      <option value="abandoned">Abandoned</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-muted-foreground uppercase mb-1">Completion: {p.completionPercentage}%</label>
                    <input 
                      type="range" min="0" max="100" 
                      value={p.completionPercentage} 
                      onChange={(e) => updateProgress(p.id, parseInt(e.target.value))}
                      className="w-full accent-primary"
                    />
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
