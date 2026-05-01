import * as XLSX from "xlsx";
import { labelEncode, type Row } from "./ml";

export const REQUIRED_COLS = [
  "quantity",
  "product_name",
  "unit_price",
  "store",
  "payment_method",
  "customer_type",
  "total_amount",
] as const;

export type CleanReport = {
  raw: number;
  afterUnnamed: number;
  missing: number;
  duplicates: number;
  final: number;
};

export type Encoders = {
  product_name: string[];
  store: string[];
  payment_method: string[];
  customer_type: string[];
};

export type Dataset = {
  rows: Row[];
  numericRows: Row[]; 
  encoders: Encoders;
  report: CleanReport;
  columns: string[];
};

export async function parseWorkbook(file: File): Promise<Row[]> {
  const buf = await file.arrayBuffer();
  const wb = XLSX.read(buf, { type: "array" });
  const ws = wb.Sheets[wb.SheetNames[0]];
  return XLSX.utils.sheet_to_json<Row>(ws, { defval: null });
}

export function cleanAndEncode(raw: Row[]): Dataset {
  const report: CleanReport = { raw: raw.length, afterUnnamed: 0, missing: 0, duplicates: 0, final: 0 };

  
  const cleaned = raw.map((r) => {
    const o: Row = {};
    for (const k of Object.keys(r)) if (!/^Unnamed/i.test(k) && !/^__EMPTY/i.test(k)) o[k] = r[k];
    return o;
  });
  report.afterUnnamed = cleaned.length;


  const noMissing = cleaned.filter((r) =>
    REQUIRED_COLS.every((c) => r[c] !== null && r[c] !== undefined && r[c] !== "")
  );
  report.missing = cleaned.length - noMissing.length;


  const seen = new Set<string>();
  const dedup = noMissing.filter((r) => {
    const key = REQUIRED_COLS.map((c) => String(r[c])).join("|");
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
  report.duplicates = noMissing.length - dedup.length;
  report.final = dedup.length;

  
  for (const r of dedup) {
    r.quantity = Number(r.quantity);
    r.unit_price = Number(r.unit_price);
    r.total_amount = Number(r.total_amount);
  }

  
  const product = labelEncode(dedup.map((r) => r.product_name));
  const store = labelEncode(dedup.map((r) => r.store));
  const payment = labelEncode(dedup.map((r) => r.payment_method));
  const customer = labelEncode(dedup.map((r) => r.customer_type));

  const numericRows = dedup.map((r, i) => ({
    quantity: r.quantity,
    product_name: product.encoded[i],
    unit_price: r.unit_price,
    store: store.encoded[i],
    payment_method: payment.encoded[i],
    customer_type: customer.encoded[i],
    total_amount: r.total_amount,
  }));

  return {
    rows: dedup,
    numericRows,
    encoders: {
      product_name: product.inverse,
      store: store.inverse,
      payment_method: payment.inverse,
      customer_type: customer.inverse,
    },
    report,
    columns: Object.keys(dedup[0] ?? {}),
  };
}
