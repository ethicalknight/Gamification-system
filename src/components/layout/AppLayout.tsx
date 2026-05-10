'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Activity, Brain, Briefcase, CalendarClock, ChevronRight, FileText, LayoutDashboard, Link as LinkIcon, ShieldAlert, Target, Terminal, TrendingUp, Zap } from 'lucide-react';

const NAV_ITEMS = [
  { name: 'Dashboard', href: '/gamification', icon: LayoutDashboard },
  { name: 'Finance', href: '/finance', icon: TrendingUp },
  { name: 'Projects', href: '/projects', icon: Terminal },
  { name: 'Jobs', href: '/jobs', icon: Briefcase },
  { name: 'Deadlines', href: '/deadlines', icon: CalendarClock },
  { name: 'Knowledge', href: '/knowledge', icon: Brain },
  { name: 'Links', href: '/links', icon: LinkIcon },
  { name: 'Productivity', href: '/productivity', icon: Zap },
  { name: 'Cybersecurity', href: '/cyber', icon: ShieldAlert },
  { name: 'Exercise', href: '/exercise', icon: Activity },
  { name: 'News', href: '/news', icon: FileText },
];

export function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex h-screen w-full bg-background text-foreground overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 border-r border-border bg-card">
        <div className="p-4 border-b border-border">
          <div className="flex items-center gap-2 text-primary font-bold text-xl tracking-tighter">
            <Target className="w-6 h-6" />
            <span>SYSTEM</span>
          </div>
        </div>
        <nav className="flex-1 overflow-y-auto p-2 space-y-1">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${
                  isActive
                    ? 'bg-primary/10 text-primary border border-primary/20 shadow-[0_0_10px_rgba(0,123,255,0.1)]'
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                }`}
              >
                <item.icon className="w-4 h-4" />
                <span className="text-sm font-medium">{item.name}</span>
                {isActive && <ChevronRight className="w-4 h-4 ml-auto" />}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        <div className="flex-1 overflow-y-auto pb-20 md:pb-0 pt-safe">
          {children}
        </div>

        {/* Mobile Bottom Navigation */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-card/95 backdrop-blur-md border-t border-border flex items-center justify-around px-2 z-50 pb-safe">
          {NAV_ITEMS.slice(0, 5).map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex flex-col items-center justify-center w-full h-full space-y-1 active:scale-95 transition-transform ${
                  isActive ? 'text-primary' : 'text-muted-foreground'
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span className="text-[10px] font-medium">{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </main>
    </div>
  );
}
