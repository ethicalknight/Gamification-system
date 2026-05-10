'use client';

import { useState, useEffect, useCallback } from 'react';
import { useNewsStore } from '@/lib/store/news';
import { Newspaper, ExternalLink, BookmarkX, BookmarkPlus, RefreshCw, Loader2, Search } from 'lucide-react';
import { EmptyState } from '@/components/shared/EmptyState';

const RSS_FEEDS = {
  Technology: 'https://techcrunch.com/feed/',
  AI: 'https://feeds.feedburner.com/CapturingTechnologyAI',
  Cybersecurity: 'https://krebsonsecurity.com/feed/',
  World: 'https://feeds.bbci.co.uk/news/world/rss.xml',
  India: 'https://feeds.bbci.co.uk/news/world/south_asia/rss.xml',
  Science: 'https://rss.nytimes.com/services/xml/rss/nyt/Science.xml',
} as const;

type Category = keyof typeof RSS_FEEDS;

interface RssArticle {
  title: string;
  link: string;
  description: string;
  pubDate: string;
  thumbnail?: string;
}

export default function NewsDashboard() {
  const { savedArticles, saveArticle, removeArticle } = useNewsStore();
  const [activeCategory, setActiveCategory] = useState<Category>('Technology');
  const [articles, setArticles] = useState<RssArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [searchQ, setSearchQ] = useState('');

  const fetchNews = useCallback(async (category: Category) => {
    setLoading(true);
    setError(false);
    try {
      const res = await fetch(`https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(RSS_FEEDS[category])}&count=15`);
      const data = await res.json();
      if (data.items && data.status === 'ok') {
        setArticles(data.items);
      } else {
        setError(true);
        setArticles([]);
      }
    } catch {
      setError(true);
      setArticles([]);
    }
    setLoading(false);
  }, []);

  useEffect(() => { fetchNews(activeCategory); }, [activeCategory, fetchNews]);

  const filtered = searchQ
    ? articles.filter(a => a.title.toLowerCase().includes(searchQ.toLowerCase()) || a.description?.toLowerCase().includes(searchQ.toLowerCase()))
    : articles;

  const isSaved = (url: string) => savedArticles.some(a => a.url === url);

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Newspaper className="w-7 h-7 text-primary" />
          <h1 className="text-3xl font-black tracking-tight uppercase">Intelligence Feed</h1>
        </div>
        <button onClick={() => fetchNews(activeCategory)} className={`p-2 rounded border border-border bg-card text-muted-foreground hover:text-primary transition-colors ${loading ? 'pointer-events-none' : ''}`}>
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Category Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1 hide-scrollbar">
        {(Object.keys(RSS_FEEDS) as Category[]).map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`text-xs font-bold px-3 py-1.5 rounded border uppercase whitespace-nowrap transition-colors ${activeCategory === cat ? 'bg-primary text-primary-foreground border-primary' : 'bg-card text-muted-foreground border-border hover:border-primary/50'}`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search articles..."
          value={searchQ}
          onChange={e => setSearchQ(e.target.value)}
          className="w-full bg-card border border-border rounded-lg pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:border-primary"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Live Feed */}
        <div className="md:col-span-2 space-y-4">
          <h2 className="text-sm font-bold tracking-widest uppercase text-primary border-b border-border pb-2">
            {activeCategory} Feed {filtered.length > 0 && <span className="text-muted-foreground font-normal">({filtered.length})</span>}
          </h2>

          {loading ? (
            <div className="flex justify-center items-center h-40 text-primary"><Loader2 className="w-8 h-8 animate-spin" /></div>
          ) : error ? (
            <div className="bg-card border border-destructive/30 p-6 rounded-lg text-center">
              <p className="text-sm text-muted-foreground">Failed to load feed. Check connection or try refresh.</p>
              <button onClick={() => fetchNews(activeCategory)} className="mt-3 text-xs font-bold text-primary hover:underline">Retry</button>
            </div>
          ) : filtered.length === 0 ? (
            <EmptyState icon={Newspaper} message="No articles found." sub={searchQ ? 'Try a different search term.' : 'Try refreshing the feed.'} />
          ) : (
            <div className="space-y-4">
              {filtered.map((a, i) => (
                <div key={i} className="bg-card border border-border rounded-lg overflow-hidden flex flex-col md:flex-row group hover:border-primary/40 transition-colors">
                  {a.thumbnail && !a.thumbnail.includes('gravatar') && !a.thumbnail.includes('1x1') && (
                    <div className="md:w-1/3 h-36 md:h-auto overflow-hidden bg-muted shrink-0">
                      <img
                        src={a.thumbnail}
                        alt=""
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
                      />
                    </div>
                  )}
                  <div className="p-4 flex-1 flex flex-col justify-between min-w-0">
                    <div>
                      <h3 className="font-bold text-sm leading-tight mb-1.5 line-clamp-2">{a.title}</h3>
                      {a.description && (
                        <p className="text-xs text-muted-foreground line-clamp-2 font-mono">
                          {a.description.replace(/<[^>]+>/g, '').slice(0, 150)}...
                        </p>
                      )}
                    </div>
                    <div className="flex items-center justify-between mt-3 pt-2 border-t border-border/50">
                      <div className="text-[10px] text-muted-foreground">{new Date(a.pubDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</div>
                      <div className="flex gap-2 items-center">
                        <button
                          onClick={() => {
                            if (!isSaved(a.link)) saveArticle({ title: a.title, url: a.link, source: activeCategory });
                          }}
                          className={`text-xs font-bold flex items-center gap-1 transition-colors ${isSaved(a.link) ? 'text-chart-4 cursor-default' : 'text-muted-foreground hover:text-primary'}`}
                        >
                          <BookmarkPlus className="w-3.5 h-3.5" /> {isSaved(a.link) ? 'Saved' : 'Save'}
                        </button>
                        <a href={a.link} target="_blank" rel="noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Saved Articles */}
        <div className="md:col-span-1 space-y-4">
          <h2 className="text-sm font-bold tracking-widest uppercase border-b border-border pb-2">
            Saved Intel <span className="text-muted-foreground font-normal">({savedArticles.length})</span>
          </h2>
          {savedArticles.length === 0 ? (
            <EmptyState icon={Newspaper} message="No saved articles." sub="Bookmark articles from the feed." />
          ) : (
            <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
              {[...savedArticles].reverse().map(a => (
                <div key={a.id} className="bg-card border border-border p-3 rounded-lg flex flex-col gap-2 hover:border-primary/30 transition-colors">
                  <h3 className="font-bold text-xs leading-tight line-clamp-2">{a.title}</h3>
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] uppercase font-bold text-chart-2 bg-chart-2/10 px-1.5 py-0.5 rounded border border-chart-2/20">{a.source}</span>
                    <div className="flex gap-1">
                      <a href={a.url} target="_blank" rel="noreferrer" className="text-muted-foreground hover:text-primary"><ExternalLink className="w-3 h-3" /></a>
                      <button onClick={() => removeArticle(a.id)} className="text-muted-foreground hover:text-destructive"><BookmarkX className="w-3 h-3" /></button>
                    </div>
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
