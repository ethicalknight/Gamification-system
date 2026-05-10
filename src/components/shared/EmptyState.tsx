import { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon?: LucideIcon;
  message: string;
  sub?: string;
}

export function EmptyState({ icon: Icon, message, sub }: EmptyStateProps) {
  return (
    <div className="bg-card border border-border border-dashed p-10 rounded-lg flex flex-col items-center justify-center text-center gap-2">
      {Icon && <Icon className="w-8 h-8 text-muted-foreground opacity-30 mb-1" />}
      <p className="text-sm text-muted-foreground">{message}</p>
      {sub && <p className="text-xs text-muted-foreground opacity-60">{sub}</p>}
    </div>
  );
}
