export function mapToSortedArray<K>(
  m: Map<K, number>,
  limit: number
): { key: K; value: number }[] {
  return [...m.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([key, value]) => ({ key, value }));
}

export function calcStats(values: number[]) {
  if (!values.length) return { count: 0, min: 0, max: 0, avg: 0, sum: 0 };

  let sum = 0;
  let min = values[0];
  let max = values[0];

  for (const v of values) {
    sum += v;
    if (v < min) min = v;
    if (v > max) max = v;
  }

  return {
    count: values.length,
    min: Number(min.toFixed(3)),
    max: Number(max.toFixed(3)),
    avg: Number((sum / values.length).toFixed(3)),
    sum: Number(sum.toFixed(3)),
  };
}

export function parseNumber(v: unknown): number | null {
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

export function parseList(v: unknown): string[] | null {
  if (!v || typeof v !== "string") return null;
  return v
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}
