import { describe, expect, it } from "vitest";
import { normalizeScoreTo100 } from "../../app/utils/normalizeScore";

describe("normalizeScoreTo100", () => {
  it("returns 0 for unrated (score 0)", () => {
    expect(normalizeScoreTo100(0, "POINT_10")).toBe(0);
    expect(normalizeScoreTo100(0, "POINT_5")).toBe(0);
    expect(normalizeScoreTo100(0, null)).toBe(0);
  });

  it("POINT_100: returns score unchanged", () => {
    expect(normalizeScoreTo100(75, "POINT_100")).toBe(75);
    expect(normalizeScoreTo100(100, "POINT_100")).toBe(100);
  });

  it("POINT_10_DECIMAL: multiplies by 10", () => {
    expect(normalizeScoreTo100(8.5, "POINT_10_DECIMAL")).toBeCloseTo(85);
    expect(normalizeScoreTo100(10, "POINT_10_DECIMAL")).toBeCloseTo(100);
  });

  it("POINT_10: multiplies by 10", () => {
    expect(normalizeScoreTo100(8, "POINT_10")).toBe(80);
    expect(normalizeScoreTo100(10, "POINT_10")).toBe(100);
  });

  it("POINT_5: maps 1-5 to 20/40/60/80/100", () => {
    expect(normalizeScoreTo100(1, "POINT_5")).toBeCloseTo(20);
    expect(normalizeScoreTo100(3, "POINT_5")).toBeCloseTo(60);
    expect(normalizeScoreTo100(5, "POINT_5")).toBeCloseTo(100);
  });

  it("POINT_3: maps 1-3 to ~33/67/100", () => {
    expect(normalizeScoreTo100(1, "POINT_3")).toBeCloseTo(33.33, 1);
    expect(normalizeScoreTo100(2, "POINT_3")).toBeCloseTo(66.67, 1);
    expect(normalizeScoreTo100(3, "POINT_3")).toBeCloseTo(100);
  });

  it("SMILEY: maps 1-3 to ~33/67/100", () => {
    expect(normalizeScoreTo100(1, "SMILEY")).toBeCloseTo(33.33, 1);
    expect(normalizeScoreTo100(3, "SMILEY")).toBeCloseTo(100);
  });

  it("unknown format: falls back to POINT_10 assumption", () => {
    expect(normalizeScoreTo100(7, "UNKNOWN_FORMAT")).toBe(70);
    expect(normalizeScoreTo100(7, null)).toBe(70);
    expect(normalizeScoreTo100(7, undefined)).toBe(70);
  });

  it("normalizes equivalent ratings across formats to similar values", () => {
    // A "max" rating on each scale should all normalize to 100
    expect(normalizeScoreTo100(100, "POINT_100")).toBe(100);
    expect(normalizeScoreTo100(10, "POINT_10")).toBe(100);
    expect(normalizeScoreTo100(10, "POINT_10_DECIMAL")).toBe(100);
    expect(normalizeScoreTo100(5, "POINT_5")).toBe(100);
    expect(normalizeScoreTo100(3, "POINT_3")).toBeCloseTo(100);
    expect(normalizeScoreTo100(3, "SMILEY")).toBeCloseTo(100);
  });
});
