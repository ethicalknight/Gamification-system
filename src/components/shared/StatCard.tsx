interface StatCardProps {
  label: string;
  value: string | number;
  sub?: string;
  color?: string;
  icon?: React.ReactNode;
}

export function StatCard({ label, value, sub, color = 'text-foreground', icon }: StatCardProps) {
  return (
    <div className="bg-card border border-border p-4 rounded-lg flex flex-col justify-between min-h-[80px]">
      <div className="flex items-center justify-between mb-1">
        <div className="text-xs text-muted-foreground font-bold uppercase tracking-wider">{label}</div>
        {icon && <div className="text-muted-foreground opacity-60">{icon}</div>}
      </div>
      <div className={`text-2xl font-black truncate ${color}`}>{value}</div>
      {sub && <div className="text-[10px] text-muted-foreground mt-1 font-mono">{sub}</div>}
    </div>
  );
}
