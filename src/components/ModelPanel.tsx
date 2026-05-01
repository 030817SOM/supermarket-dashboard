import { useMemo, useState } from "react";
import {
  CartesianGrid,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
  ReferenceLine,
} from "recharts";
import type { Dataset } from "@/lib/dataPipeline";
import { fitLinearRegression, mae, mse, predictLinear, r2, trainTestSplit } from "@/lib/ml";
import { SectionCard } from "./SectionCard";
import { StatCard } from "./StatCard";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Sparkles } from "lucide-react";

const FEATURES = ["quantity", "product_name", "unit_price", "store", "payment_method", "customer_type"] as const;

export const ModelPanel = ({ data }: { data: Dataset }) => {
  const model = useMemo(() => {
    const records = data.numericRows.map((r) => ({
      x: FEATURES.map((f) => Number(r[f])),
      y: Number(r.total_amount),
    }));
    const { train, test } = trainTestSplit(records, 0.2, 42);
    const Xtr = train.map((r) => r.x);
    const ytr = train.map((r) => r.y);
    const Xte = test.map((r) => r.x);
    const yte = test.map((r) => r.y);
    const weights = fitLinearRegression(Xtr, ytr);
    const yhat = predictLinear(weights, Xte);
    const scatter = yte.map((v, i) => ({ actual: v, predicted: yhat[i] }));
    return {
      weights,
      mae: mae(yte, yhat),
      mse: mse(yte, yhat),
      r2: r2(yte, yhat),
      scatter,
      trainSize: train.length,
      testSize: test.length,
      maxVal: Math.max(...yte, ...yhat),
      minVal: Math.min(...yte, ...yhat),
    };
  }, [data]);

  const [form, setForm] = useState({
    quantity: 5,
    unit_price: 50,
    product_name: data.encoders.product_name[0],
    store: data.encoders.store[0],
    payment_method: data.encoders.payment_method[0],
    customer_type: data.encoders.customer_type[0],
  });

  const prediction = useMemo(() => {
    const x = [
      form.quantity,
      data.encoders.product_name.indexOf(form.product_name),
      form.unit_price,
      data.encoders.store.indexOf(form.store),
      data.encoders.payment_method.indexOf(form.payment_method),
      data.encoders.customer_type.indexOf(form.customer_type),
    ];
    return predictLinear(model.weights, [x])[0];
  }, [form, model.weights, data.encoders]);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-4">
        <StatCard label="Train / Test" value={`${model.trainSize}/${model.testSize}`} hint="80% / 20% split, seed 42" />
        <StatCard label="MAE" value={`$${model.mae.toFixed(2)}`} accent="accent" hint="Mean Absolute Error" />
        <StatCard label="MSE" value={model.mse.toFixed(2)} hint="Mean Squared Error" />
        <StatCard label="R² Score" value={model.r2.toFixed(4)} accent="primary" hint="1.0 = perfect" />
      </div>

      <SectionCard step="06 · Evaluate" title="Actual vs Predicted Sales" subtitle="Each point is a held-out transaction. Closer to the diagonal = better prediction.">
        <ResponsiveContainer width="100%" height={400}>
          <ScatterChart margin={{ left: 10, bottom: 10 }}>
            <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="3 3" />
            <XAxis type="number" dataKey="actual" name="Actual" stroke="hsl(var(--muted-foreground))" fontSize={11}
              label={{ value: "Actual ($)", position: "insideBottom", offset: -5, fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
            <YAxis type="number" dataKey="predicted" name="Predicted" stroke="hsl(var(--muted-foreground))" fontSize={11}
              label={{ value: "Predicted ($)", angle: -90, position: "insideLeft", fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
            <ReferenceLine
              segment={[{ x: model.minVal, y: model.minVal }, { x: model.maxVal, y: model.maxVal }]}
              stroke="hsl(var(--accent))"
              strokeDasharray="4 4"
            />
            <Tooltip
              cursor={{ strokeDasharray: "3 3" }}
              contentStyle={{
                backgroundColor: "hsl(var(--popover))",
                border: "1px solid hsl(var(--border))",
                borderRadius: 12,
                fontFamily: "JetBrains Mono",
                fontSize: 12,
              }}
              formatter={(value, name) => [value ? `$${value.toFixed(2)}` : '', name]}
            />
            <Scatter data={model.scatter} fill="hsl(var(--primary))" fillOpacity={0.7} />
          </ScatterChart>
        </ResponsiveContainer>
      </SectionCard>

      <SectionCard step="07 · Predict" title="Predict a New Transaction" subtitle="Adjust feature values and watch the model forecast a total amount in real time.">
        <div className="grid gap-6 lg:grid-cols-[1fr_auto]">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label className="font-mono text-xs uppercase tracking-wider text-muted-foreground">Quantity</Label>
              <Input type="number" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: Number(e.target.value) })} className="mt-2 font-mono" />
            </div>
            <div>
              <Label className="font-mono text-xs uppercase tracking-wider text-muted-foreground">Unit Price ($)</Label>
              <Input type="number" step="0.01" value={form.unit_price} onChange={(e) => setForm({ ...form, unit_price: Number(e.target.value) })} className="mt-2 font-mono" />
            </div>
            {(["product_name", "store", "payment_method", "customer_type"] as const).map((field) => (
              <div key={field}>
                <Label className="font-mono text-xs uppercase tracking-wider text-muted-foreground">{field.replace("_", " ")}</Label>
                <Select value={form[field] as string} onValueChange={(v) => setForm({ ...form, [field]: v })}>
                  <SelectTrigger className="mt-2 font-mono"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {data.encoders[field].map((v) => (
                      <SelectItem key={v} value={v}>{v}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ))}
          </div>

          <div className="flex flex-col items-center justify-center rounded-2xl border border-primary/40 bg-primary/5 p-8 text-center min-w-[240px]">
            <Sparkles className="mb-3 h-6 w-6 text-primary" />
            <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">Predicted Total</p>
            <p className="mt-3 font-serif text-5xl text-primary">
              ${prediction.toFixed(2)}
            </p>
            <p className="mt-3 text-xs text-muted-foreground">Linear Regression · ridge λ=1e-6</p>
          </div>
        </div>
      </SectionCard>
    </div>
  );
};
