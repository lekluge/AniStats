import { NOW } from "./config";

export function parseNumber(v: any): number | null {
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

export function parseList(v: any): string[] | null {
  if (!v || typeof v !== "string") return null;
  return v.split(",").map(s => s.trim()).filter(Boolean);
}

export function hasStartDate(a: any) {
  return a.startYear !== null;
}

export function isReleased(a: any) {
  if (typeof a.startYear !== "number") return false;
  if (typeof a.startMonth !== "number") return false;

  const d = new Date(a.startYear, a.startMonth - 1, a.startDay ?? 1);
  return d <= NOW;
}
