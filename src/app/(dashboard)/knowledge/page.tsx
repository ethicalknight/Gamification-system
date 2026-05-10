'use client';

import { useState } from 'react';
import { useKnowledgeStore } from '@/lib/store/knowledge';
import { Brain, Plus, Trash2, Tag } from 'lucide-react';

export default function KnowledgeDashboard() {
  const { notes, addNote, deleteNote } = useKnowledgeStore();
  
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [content, setContent] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !content) return;
    
    addNote({
      title,
      category: category || 'General',
      content
    });

    setTitle('');
    setCategory('');
    setContent('');
  };

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Brain className="w-8 h-8 text-primary" />
        <h1 className="text-3xl font-black tracking-tight uppercase">Knowledge Base</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Add Note Form */}
        <div className="md:col-span-1 bg-card border border-border p-6 rounded-lg h-fit">
          <h2 className="text-lg font-bold tracking-tight mb-4 uppercase text-primary">Store Information</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-muted-foreground uppercase mb-1">Title</label>
              <input 
                type="text" value={title} onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:border-primary"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-muted-foreground uppercase mb-1">Category / Tags</label>
              <input 
                type="text" value={category} onChange={(e) => setCategory(e.target.value)}
                placeholder="e.g. React, Cyber, AI"
                className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-muted-foreground uppercase mb-1">Content (Markdown)</label>
              <textarea 
                value={content} onChange={(e) => setContent(e.target.value)}
                rows={5}
                className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:border-primary font-mono resize-y"
                required
              />
            </div>
            <button type="submit" className="w-full bg-primary text-primary-foreground font-bold uppercase tracking-wider py-2 rounded-md hover:bg-primary/90 flex items-center justify-center gap-2">
              <Plus className="w-4 h-4" /> Save Note
            </button>
          </form>
        </div>

        {/* Notes Grid */}
        <div className="md:col-span-2 space-y-4">
          {notes.length === 0 ? (
            <div className="bg-card border border-border p-8 rounded-lg text-center text-muted-foreground">No knowledge stored. Start building your second brain.</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {notes.map((n) => (
                <div key={n.id} className="bg-card border border-border p-4 rounded-lg flex flex-col group relative hover:border-primary/50 transition-colors">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-lg leading-tight pr-6">{n.title}</h3>
                    <button 
                      onClick={() => deleteNote(n.id)} 
                      className="absolute top-4 right-4 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  
                  <div className="flex items-center gap-1 mb-3 text-xs text-primary bg-primary/10 w-fit px-2 py-0.5 rounded">
                    <Tag className="w-3 h-3" /> {n.category}
                  </div>

                  <p className="text-sm text-muted-foreground whitespace-pre-wrap font-mono line-clamp-4 flex-1">
                    {n.content}
                  </p>
                  
                  <div className="text-[10px] text-muted-foreground mt-4 pt-3 border-t border-border">
                    {new Date(n.createdAt).toLocaleDateString()}
                  </div>
                </div>
              )).reverse()}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
