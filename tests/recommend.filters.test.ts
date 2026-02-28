import { describe, expect, it } from "vitest"
import { NOW } from "../server/recommend/config"
import {
  hasStartDate,
  isReleased,
  parseList,
  parseNumber,
} from "../server/recommend/filters"

function toAnimeDate(d: Date) {
  return {
    startYear: d.getFullYear(),
    startMonth: d.getMonth() + 1,
    startDay: d.getDate(),
  }
}

describe("recommend/filters", () => {
  it("parseNumber parses finite numbers and rejects invalid values", () => {
    expect(parseNumber("42")).toBe(42)
    expect(parseNumber(3.14)).toBe(3.14)
    expect(parseNumber("not-a-number")).toBeNull()
    expect(parseNumber(Infinity)).toBeNull()
  })

  it("parseList parses and trims comma separated values", () => {
    expect(parseList("Action, Drama ,  Sci-Fi ")).toEqual([
      "Action",
      "Drama",
      "Sci-Fi",
    ])
    expect(parseList("")).toBeNull()
    expect(parseList(undefined)).toBeNull()
  })

  it("hasStartDate checks that startYear is not null", () => {
    expect(hasStartDate({ startYear: 2024 })).toBe(true)
    expect(hasStartDate({ startYear: null })).toBe(false)
  })

  it("isReleased returns true for past dates and false for future/incomplete dates", () => {
    const past = new Date(NOW.getTime() - 1000 * 60 * 60 * 24 * 10)
    const future = new Date(NOW.getTime() + 1000 * 60 * 60 * 24 * 10)

    expect(isReleased(toAnimeDate(past))).toBe(true)
    expect(isReleased(toAnimeDate(future))).toBe(false)
    expect(isReleased({ startYear: NOW.getFullYear() })).toBe(false)
  })
})
