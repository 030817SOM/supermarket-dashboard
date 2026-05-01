export type Row = Record<string, string | number | boolean | null>;

export function labelEncode(values: (string | number)[]): { encoded: number[]; map: Map<string, number>; inverse: string[] } {
  const map = new Map<string, number>();
  const inverse: string[] = [];
  const encoded = values.map((v) => {
    const k = String(v);
    if (!map.has(k)) {
      map.set(k, inverse.length);
      inverse.push(k);
    }
    return map.get(k)!;
  });
  return { encoded, map, inverse };
}

export function trainTestSplit<T>(data: T[], testSize = 0.2, seed = 42): { train: T[]; test: T[] } {

  let s = seed >>> 0;
  const rng = () => {
    s |= 0; s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const idx = data.map((_, i) => i);
  for (let i = idx.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [idx[i], idx[j]] = [idx[j], idx[i]];
  }
  const cut = Math.floor(data.length * (1 - testSize));
  const train = idx.slice(0, cut).map((i) => data[i]);
  const test = idx.slice(cut).map((i) => data[i]);
  return { train, test };
}


export function fitLinearRegression(X: number[][], y: number[], lambda = 1e-6): number[] {
  const n = X.length;
  const d = X[0].length;

  const Xa: number[][] = X.map((row) => [...row, 1]);
  const dim = d + 1;
 
  const A: number[][] = Array.from({ length: dim }, () => new Array(dim).fill(0));
  const b: number[] = new Array(dim).fill(0);
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < dim; j++) {
      for (let k = 0; k < dim; k++) A[j][k] += Xa[i][j] * Xa[i][k];
      b[j] += Xa[i][j] * y[i];
    }
  }
  for (let j = 0; j < dim; j++) A[j][j] += lambda;
  return solve(A, b);
}

export function predictLinear(weights: number[], X: number[][]): number[] {
  return X.map((row) => {
    let s = weights[weights.length - 1];
    for (let j = 0; j < row.length; j++) s += weights[j] * row[j];
    return s;
  });
}


function solve(A: number[][], b: number[]): number[] {
  const n = A.length;
  const M = A.map((row, i) => [...row, b[i]]);
  for (let i = 0; i < n; i++) {
    let pivot = i;
    for (let r = i + 1; r < n; r++) if (Math.abs(M[r][i]) > Math.abs(M[pivot][i])) pivot = r;
    [M[i], M[pivot]] = [M[pivot], M[i]];
    const div = M[i][i] || 1e-12;
    for (let c = i; c <= n; c++) M[i][c] /= div;
    for (let r = 0; r < n; r++) {
      if (r === i) continue;
      const factor = M[r][i];
      for (let c = i; c <= n; c++) M[r][c] -= factor * M[i][c];
    }
  }
  return M.map((row) => row[n]);
}

export function mae(y: number[], yhat: number[]) {
  return y.reduce((s, v, i) => s + Math.abs(v - yhat[i]), 0) / y.length;
}
export function mse(y: number[], yhat: number[]) {
  return y.reduce((s, v, i) => s + (v - yhat[i]) ** 2, 0) / y.length;
}
export function r2(y: number[], yhat: number[]) {
  const mean = y.reduce((a, b) => a + b, 0) / y.length;
  const ssTot = y.reduce((s, v) => s + (v - mean) ** 2, 0) || 1e-12;
  const ssRes = y.reduce((s, v, i) => s + (v - yhat[i]) ** 2, 0);
  return 1 - ssRes / ssTot;
}

export function pearson(x: number[], y: number[]) {
  const n = x.length;
  const mx = x.reduce((a, b) => a + b, 0) / n;
  const my = y.reduce((a, b) => a + b, 0) / n;
  let num = 0, dx = 0, dy = 0;
  for (let i = 0; i < n; i++) {
    num += (x[i] - mx) * (y[i] - my);
    dx += (x[i] - mx) ** 2;
    dy += (y[i] - my) ** 2;
  }
  const denom = Math.sqrt(dx * dy) || 1e-12;
  return num / denom;
}
