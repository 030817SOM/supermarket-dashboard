import { useState } from "react";
import { FileUpload } from "@/components/FileUpload";
import { EDAPanel} from "@/components/EDAPanel";
import { ModelPanel } from "@/components/ModelPanel";
import { SectionCard } from "@/components/SectionCard";
import { cleanAndEncode, parseWorkbook, type Dataset } from "@/lib/dataPipeline";
import { toast } from "sonner";
import { Activity, Database, Brain, ArrowDown } from "lucide-react";

const Index = () => {
  const [data, setData] = useState<Dataset | null>(null);
  const [loading, setLoading] = useState(false);

  const handleFile = async (file: File) => {
    setLoading(true);
    try {
      const raw = await parseWorkbook(file);
      if (raw.length === 0) throw new Error("File is empty");
      const ds = cleanAndEncode(raw);
      if (ds.rows.length < 10) throw new Error("Need at least 10 valid rows after cleaning");
      setData(ds);
      toast.success(`Loaded ${ds.rows.length} clean transactions`);
      setTimeout(() => document.getElementById("results")?.scrollIntoView({ behavior: "smooth" }), 100);
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "Failed to parse file. Check required columns.";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border">
        <div className="absolute inset-0 grid-bg opacity-30" />
        <div className="container relative mx-auto px-6 py-20 md:py-28">
          <div className="mx-auto max-w-4xl text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/40 bg-primary/5 px-4 py-1.5 font-mono text-xs uppercase tracking-widest text-primary">
              <Activity className="h-3 w-3" /> Supermarket ML Pipeline
            </div>
            <h1 className="mt-6 font-serif text-5xl leading-[1.05] md:text-7xl lg:text-8xl">
              Predict supermarket sales
              <span className="block italic text-primary"> with one upload.</span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
              Drop your transaction spreadsheet. We clean the data, run exploratory analysis,
              train a regression model, and let you forecast new sales — all in your browser.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-6 font-mono text-xs uppercase tracking-widest text-muted-foreground">
              <span className="flex items-center gap-2"><Database className="h-3.5 w-3.5 text-primary" /> Clean & encode</span>
              <span className="flex items-center gap-2"><Activity className="h-3.5 w-3.5 text-accent" /> Visualize</span>
              <span className="flex items-center gap-2"><Brain className="h-3.5 w-3.5 text-primary" /> Train & predict</span>
            </div>
          </div>
        </div>
      </section>

      {/* Upload */}
      <section className="container mx-auto px-6 py-12">
        <SectionCard step="01 · Load" title="Upload your dataset" subtitle="Excel or CSV with supermarket transactions. Nothing leaves your browser.">
          <FileUpload onFile={handleFile} loading={loading} />
        </SectionCard>
      </section>

      {/* Results */}
      {data && (
        <section id="results" className="container mx-auto space-y-10 px-6 pb-24">
          <SectionCard step="02 · Clean" title="Data cleaning report" subtitle="Unnamed columns dropped, missing rows removed, duplicates filtered.">
            <div className="grid gap-4 md:grid-cols-5 font-mono text-sm">
              {[
                { label: "Raw rows", value: data.report.raw },
                { label: "After unnamed", value: data.report.afterUnnamed },
                { label: "Missing dropped", value: data.report.missing, color: "text-destructive" },
                { label: "Duplicates dropped", value: data.report.duplicates, color: "text-destructive" },
                { label: "Final clean", value: data.report.final, color: "text-primary" },
              ].map((s) => (
                <div key={s.label} className="rounded-xl border border-border bg-secondary/40 p-4">
                  <p className="text-xs uppercase tracking-widest text-muted-foreground">{s.label}</p>
                  <p className={`mt-2 text-2xl ${s.color ?? ""}`}>{s.value.toLocaleString()}</p>
                </div>
              ))}
            </div>
          </SectionCard>

          <EDAPanel data={data} />

          <SectionCard
            step="04 · Encode"
            title="Feature encoding"
            subtitle="Categorical columns mapped to integers. Features: quantity, product_name, unit_price, store, payment_method, customer_type → target: total_amount."
          >
            <div className="grid gap-4 md:grid-cols-4 font-mono text-xs">
              {(["product_name", "store", "payment_method", "customer_type"] as const).map((k) => (
                <div key={k} className="rounded-xl border border-border bg-secondary/40 p-4">
                  <p className="uppercase tracking-widest text-muted-foreground">{k}</p>
                  <p className="mt-2 text-primary text-lg">{data.encoders[k].length} classes</p>
                  <p className="mt-2 text-muted-foreground line-clamp-2">{data.encoders[k].slice(0, 4).join(", ")}{data.encoders[k].length > 4 ? "…" : ""}</p>
                </div>
              ))}
            </div>
          </SectionCard>

          <ModelPanel data={data} />
        </section>
      )}

      {!data && (
        <div className="container mx-auto px-6 pb-24 text-center text-muted-foreground">
          <ArrowDown className="mx-auto h-5 w-5 animate-bounce text-primary" />
          <p className="mt-2 font-mono text-xs uppercase tracking-widest">Upload a file to begin</p>
        </div>
      )}

      <footer className="border-t border-border">
        <div className="container mx-auto px-6 py-8 font-mono text-xs uppercase tracking-widest text-muted-foreground flex justify-between flex-wrap gap-2">
          <span>Supermarket Sales · ML Pipeline</span>
          <span>Linear Regression · Client-side</span>
        </div>
      </footer>
    </main>
  );
};

export default Index;
