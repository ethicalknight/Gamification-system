'use client';

import { useState, useMemo } from 'react';
import { useLinkStore, LinkItem } from '@/lib/store/links';
import { LinkIcon, Plus, Trash2, Edit2, Bookmark, BookmarkCheck, ExternalLink, Copy, Check, Search, Star } from 'lucide-react';
import { Modal } from '@/components/shared/Modal';
import { EmptyState } from '@/components/shared/EmptyState';

const CATEGORIES = ['General', 'Tools', 'Learning', 'Reference', 'Project', 'AI', 'Cybersecurity', 'Finance', 'Career'];

function LinkModal({ open, onClose, onSave, initial }: {
  open: boolean; onClose: () => void;
  onSave: (l: Omit<LinkItem, 'id' | 'createdAt'>) => void;
  initial?: LinkItem | null;
}) {
  const [form, setForm] = useState({
    url: initial?.url ?? '',
    title: initial?.title ?? '',
    description: initial?.description ?? '',
    category: initial?.category ?? 'General',
    isBookmarked: initial?.isBookmarked ?? false,
    usefulScore: initial?.usefulScore ?? 3,
  });
  const set = (k: string, v: unknown) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.url || !form.title) return;
    onSave(form);
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title={initial ? 'Edit Link' : 'Save Link'} size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-muted-foreground uppercase mb-1">URL *</label>
          <input type="url" value={form.url} onChange={e => set('url', e.target.value)} className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:border-primary" placeholder="https://..." required />
        </div>
        <div>
          <label className="block text-xs font-bold text-muted-foreground uppercase mb-1">Title *</label>
          <input type="text" value={form.title} onChange={e => set('title', e.target.value)} className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:border-primary" required />
        </div>
        <div>
          <label className="block text-xs font-bold text-muted-foreground uppercase mb-1">Why saved / Description</label>
          <textarea value={form.description} onChange={e => set('description', e.target.value)} rows={2} className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:border-primary resize-none" placeholder="Why is this useful?" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-muted-foreground uppercase mb-1">Category</label>
            <select value={form.category} onChange={e => set('category', e.target.value)} className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:border-primary">
              {CATEGORIES.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-muted-foreground uppercase mb-1">Usefulness (1-5)</label>
            <div className="flex gap-1 mt-1">
              {[1,2,3,4,5].map(n => (
                <button key={n} type="button" onClick={() => set('usefulScore', n)} className={`w-8 h-8 rounded text-xs font-bold transition-colors border ${form.usefulScore >= n ? 'bg-chart-4/30 border-chart-4/50 text-chart-4' : 'bg-background border-border text-muted-foreground'}`}>
                  {n}
                </button>
              ))}
            </div>
          </div>
        </div>
        <button type="submit" className="w-full bg-primary text-primary-foreground font-bold uppercase tracking-wider py-2.5 rounded-md hover:bg-primary/90 transition-colors flex items-center justify-center gap-2">
          <Plus className="w-4 h-4" /> {initial ? 'Save Changes' : 'Save Link'}
        </button>
      </form>
    </Modal>
  );
}

function CopyButton({ url }: { url: string }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  return (
    <button onClick={copy} className="text-muted-foreground hover:text-primary transition-colors p-1" title="Copy URL">
      {copied ? <Check className="w-3.5 h-3.5 text-chart-2" /> : <Copy className="w-3.5 h-3.5" />}
    </button>
  );
}

export default function LinksDashboard() {
  const { links, addLink, updateLink, deleteLink, toggleBookmark } = useLinkStore();
  const [modalOpen, setModalOpen] = useState(false);
  const [editLink, setEditLink] = useState<LinkItem | null>(null);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [showBookmarks, setShowBookmarks] = useState(false);

  const usedCategories = ['All', ...Array.from(new Set(links.map(l => l.category)))];

  const filtered = useMemo(() => links.filter(l => {
    if (showBookmarks && !l.isBookmarked) return false;
    if (activeCategory !== 'All' && l.category !== activeCategory) return false;
    if (search) {
      const q = search.toLowerCase();
      return l.title.toLowerCase().includes(q) || l.url.toLowerCase().includes(q) || l.description?.toLowerCase().includes(q);
    }
    return true;
  }), [links, search, activeCategory, showBookmarks]);

  const handleSave = (data: Omit<LinkItem, 'id' | 'createdAt'>) => {
    if (editLink) { updateLink(editLink.id, data); setEditLink(null); }
    else addLink(data);
  };

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <LinkIcon className="w-7 h-7 text-primary" />
          <h1 className="text-3xl font-black tracking-tight uppercase">Link Vault</h1>
          <span className="text-xs font-bold text-muted-foreground bg-muted px-2 py-0.5 rounded">{links.length}</span>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowBookmarks(v => !v)}
            className={`flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded border transition-colors ${showBookmarks ? 'bg-chart-4/20 border-chart-4/50 text-chart-4' : 'bg-card border-border text-muted-foreground hover:text-foreground'}`}
          >
            <Bookmark className="w-3.5 h-3.5" /> Saved
          </button>
          <button onClick={() => { setEditLink(null); setModalOpen(true); }} className="flex items-center gap-1.5 text-xs font-bold bg-primary text-primary-foreground px-3 py-2 rounded hover:bg-primary/80 transition-colors">
            <Plus className="w-3.5 h-3.5" /> Add Link
          </button>
        </div>
      </div>

      <LinkModal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setEditLink(null); }}
        onSave={handleSave}
        initial={editLink}
      />

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search links..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full bg-card border border-border rounded-lg pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:border-primary"
        />
      </div>

      {/* Category Filters */}
      <div className="flex gap-2 overflow-x-auto pb-1 hide-scrollbar">
        {usedCategories.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`text-xs font-bold px-3 py-1.5 rounded whitespace-nowrap border transition-colors ${activeCategory === cat ? 'bg-primary text-primary-foreground border-primary' : 'bg-card text-muted-foreground border-border hover:border-primary/50'}`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Links Grid */}
      {filtered.length === 0 ? (
        <EmptyState icon={LinkIcon} message="No links found." sub={search ? 'Try a different search term.' : 'Click + Add Link to save your first resource.'} />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...filtered].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).map(link => (
            <div key={link.id} className="bg-card border border-border rounded-lg p-4 flex flex-col gap-3 hover:border-primary/30 transition-colors group">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-sm leading-tight truncate">{link.title}</h3>
                  <p className="text-[10px] text-muted-foreground truncate font-mono mt-0.5">{link.url}</p>
                </div>
                <button onClick={() => toggleBookmark(link.id)} className={`shrink-0 transition-colors ${link.isBookmarked ? 'text-chart-4' : 'text-muted-foreground hover:text-chart-4'}`}>
                  {link.isBookmarked ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
                </button>
              </div>

              {link.description && <p className="text-xs text-muted-foreground line-clamp-2">{link.description}</p>}

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">{link.category}</span>
                  <div className="flex gap-0.5">
                    {[1,2,3,4,5].map(n => <Star key={n} className={`w-2.5 h-2.5 ${n <= link.usefulScore ? 'text-chart-4 fill-chart-4' : 'text-muted-foreground'}`} />)}
                  </div>
                </div>
                <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  <CopyButton url={link.url} />
                  <a href={link.url} target="_blank" rel="noreferrer" className="text-muted-foreground hover:text-primary transition-colors p-1"><ExternalLink className="w-3.5 h-3.5" /></a>
                  <button onClick={() => { setEditLink(link); setModalOpen(true); }} className="text-muted-foreground hover:text-primary transition-colors p-1"><Edit2 className="w-3.5 h-3.5" /></button>
                  <button onClick={() => deleteLink(link.id)} className="text-muted-foreground hover:text-destructive transition-colors p-1"><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
