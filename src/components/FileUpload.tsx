import { useCallback, useState } from "react";
import { Upload, FileSpreadsheet, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  onFile: (file: File) => void;
  loading?: boolean;
}

export const FileUpload = ({ onFile, loading }: Props) => {
  const [drag, setDrag] = useState(false);
  const [name, setName] = useState<string | null>(null);

  const handle = useCallback(
    (file: File) => {
      setName(file.name);
      onFile(file);
    },
    [onFile]
  );

  return (
    <label
      onDragOver={(e) => {
        e.preventDefault();
        setDrag(true);
      }}
      onDragLeave={() => setDrag(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDrag(false);
        const f = e.dataTransfer.files?.[0];
        if (f) handle(f);
      }}
      className={cn(
        "relative flex flex-col items-center justify-center gap-4 rounded-2xl border-2 border-dashed p-12 transition-all cursor-pointer",
        "border-border hover:border-primary/60 hover:bg-primary/5",
        drag && "border-primary bg-primary/10 glow-primary",
        loading && "pointer-events-none opacity-70"
      )}
    >
      <input
        type="file"
        accept=".xlsx,.xls,.csv"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) handle(f);
        }}
      />
      <div className="grid h-16 w-16 place-items-center rounded-xl bg-primary/10 text-primary">
        {loading ? <Loader2 className="h-8 w-8 animate-spin" /> : name ? <FileSpreadsheet className="h-8 w-8" /> : <Upload className="h-8 w-8" />}
      </div>
      <div className="text-center">
        <p className="text-lg font-medium">
          {loading ? "Processing your data..." : name ?? "Drop your supermarket transactions file"}
        </p>
        <p className="mt-1 text-sm text-muted-foreground font-mono">
          .xlsx · .xls · .csv — required columns: quantity, product_name, unit_price, store, payment_method, customer_type, total_amount
        </p>
      </div>
    </label>
  );
};
