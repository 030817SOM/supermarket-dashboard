import { ReactNode } from "react";
import { cn } from "@/lib/utils";

export const StatCard = ({
  label,
  value,
  hint,
  accent = "primary",
  className,
}: {
  label: string;
  value: ReactNode;
  hint?: string;
  accent?: "primary" | "accent" | "muted";
  className?: string;
}) => {
  const accentColor = {
    primary: "text-primary",
    accent: "text-accent",
    muted: "text-foreground",
  }[accent];
  return (
    <div className={cn("glass-card rounded-2xl p-6", className)}>
      <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">{label}</p>
      <p className={cn("mt-3 font-serif text-4xl leading-none", accentColor)}>{value}</p>
      {hint && <p className="mt-2 text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
};
