import { useMemo } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Legend,
} from "recharts";
import type { Dataset } from "@/lib/dataPipeline";
import { SectionCard } from "./SectionCard";
import { StatCard } from "./StatCard";
import { pearson } from "@/lib/ml";

const fmt = (n: number) =>
  n >= 1000 ? `$${(n / 1000).toFixed(1)}k` : `$${n.toFixed(2)}`;

const CHART_COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
];

const tooltipStyle = {
  backgroundColor: "hsl(var(--popover))",
  border: "1px solid hsl(var(--border))",
  borderRadius: 12,
  fontFamily: "JetBrains Mono",
  fontSize: 12,
};

export const EDAPanel = ({ data }: { data: Dataset }) => {
  const stats = useMemo(() => {
    const total = data.rows.reduce((s, r) => s + Number(r.total_amount ?? 0), 0);
    const avg = total / data.rows.length;
    const txns = data.rows.length;

    const groupSum = (key: string, val: string) => {
      const m = new Map<string, number>();
      for (const r of data.rows) m.set(String(r[key]), (m.get(String(r[key])) ?? 0) + Number(r[val]));
      return Array.from(m.entries()).map(([name, value]) => ({ name, value }));
    };
    const groupCount = (key: string) => {
      const m = new Map<string, number>();
      for (const r of data.rows) m.set(String(r[key]), (m.get(String(r[key])) ?? 0) + 1);
      return Array.from(m.entries()).map(([name, value]) => ({ name, value }));
    };

    const topProducts = groupSum("product_name", "quantity")
      .sort((a, b) => b.value - a.value)
      .slice(0, 10);
    const storeSales = groupSum("store", "total_amount").sort((a, b) => b.value - a.value);
    const payments = groupCount("payment_method");

    // Quantity histogram
    const qtys = data.rows.map((r) => Number(r.quantity));
    const min = Math.min(...qtys), max = Math.max(...qtys);
    const bins = 10;
    const w = (max - min) / bins || 1;
    const hist = Array.from({ length: bins }, (_, i) => ({
      name: `${(min + i * w).toFixed(0)}–${(min + (i + 1) * w).toFixed(0)}`,
      value: 0,
    }));
    for (const q of qtys) {
      const idx = Math.min(bins - 1, Math.floor((q - min) / w));
      hist[idx].value++;
    }

    // Correlation matrix (numeric features)
    const numericKeys = ["quantity", "product_name", "unit_price", "store", "payment_method", "customer_type", "total_amount"];
    const corr = numericKeys.map((a) =>
      numericKeys.map((b) =>
        pearson(
          data.numericRows.map((r) => Number(r[a])).filter(n => !isNaN(n)),
          data.numericRows.map((r) => Number(r[b])).filter(n => !isNaN(n))
        )
      )
    );

    return { total, avg, txns, topProducts, storeSales, payments, hist, corr, numericKeys };
  }, [data]);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-4">
        <StatCard label="Total Revenue" value={fmt(stats.total)} accent="primary" />
        <StatCard label="Avg Transaction" value={fmt(stats.avg)} accent="accent" />
        <StatCard label="Transactions" value={stats.txns.toLocaleString()} />
        <StatCard label="Unique Products" value={data.encoders.product_name.length} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <SectionCard step="03 · EDA" title="Top 10 Products" subtitle="By total quantity sold across all stores.">
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={stats.topProducts} margin={{ left: -10, bottom: 60 }}>
              <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="3 3" />
              <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" angle={-35} textAnchor="end" interval={0} fontSize={11} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} />
              <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "hsl(var(--primary) / 0.08)" }} />
              <Bar dataKey="value" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </SectionCard>

        <SectionCard step="03 · EDA" title="Sales by Store" subtitle="Total revenue per store location.">
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={stats.storeSales} margin={{ left: -10 }}>
              <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="3 3" />
              <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={11} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} />
              <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "hsl(var(--accent) / 0.08)" }} formatter={(v?: number) => v !== undefined ? fmt(v) : ""} />
              <Bar dataKey="value" fill="hsl(var(--accent))" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </SectionCard>

        <SectionCard step="03 · EDA" title="Payment Methods" subtitle="Transaction counts by payment type.">
          <ResponsiveContainer width="100%" height={320}>
            <PieChart>
              <Pie
                data={stats.payments}
                dataKey="value"
                nameKey="name"
                outerRadius={110}
                innerRadius={60}
                paddingAngle={2}
                label={(e) => `${e.name} (${((e.percent ?? 0) * 100).toFixed(1)}%)`}
              >
                {stats.payments.map((_, i) => (
                  <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={tooltipStyle} />
              <Legend wrapperStyle={{ fontFamily: "JetBrains Mono", fontSize: 11 }} />
            </PieChart>
          </ResponsiveContainer>
        </SectionCard>

        <SectionCard step="03 · EDA" title="Quantity Distribution" subtitle="Histogram of items per transaction.">
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={stats.hist} margin={{ left: -10 }}>
              <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="3 3" />
              <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={11} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} />
              <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "hsl(var(--chart-3) / 0.08)" }} />
              <Bar dataKey="value" fill="hsl(var(--chart-3))" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </SectionCard>
      </div>

      <SectionCard step="03 · EDA" title="Correlation Heatmap" subtitle="Pearson correlation between encoded features.">
        <div className="overflow-x-auto">
          <table className="w-full text-xs font-mono">
            <thead>
              <tr>
                <th className="p-2"></th>
                {stats.numericKeys.map((k) => (
                  <th key={k} className="p-2 text-muted-foreground font-normal">{k}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {stats.corr.map((row, i) => (
                <tr key={i}>
                  <td className="p-2 text-muted-foreground">{stats.numericKeys[i]}</td>
                  {row.map((v, j) => {
                    const intensity = Math.abs(v);
                    const color = v >= 0
                      ? `hsl(75 95% 60% / ${intensity * 0.6 + 0.05})`
                      : `hsl(0 75% 60% / ${intensity * 0.6 + 0.05})`;
                    return (
                      <td key={j} className="p-2 text-center" style={{ backgroundColor: color }}>
                        {v.toFixed(2)}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>
    </div>
  );
};

export default EDAPanel;
