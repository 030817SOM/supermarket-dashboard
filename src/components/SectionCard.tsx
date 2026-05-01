import { ReactNode } from "react";
import { cn } from "@/lib/utils";

export const SectionCard = ({
  title,
  subtitle,
  step,
  children,
  className,
}: {
  title: string;
  subtitle?: string;
  step?: string;
  children: ReactNode;
  className?: string;
}) => (
  <section className={cn("glass-card rounded-3xl p-6 md:p-8", className)}>
    <header className="mb-6 flex items-end justify-between gap-4">
      <div>
        {step && <p className="font-mono text-xs uppercase tracking-widest text-primary">{step}</p>}
        <h2 className="mt-1 font-serif text-3xl md:text-4xl">{title}</h2>
        {subtitle && <p className="mt-2 text-sm text-muted-foreground max-w-2xl">{subtitle}</p>}
      </div>
    </header>
    {children}
  </section>
);
