import { describe, it, expect } from "vitest";
import { cnsStatusColor, buildWeekChartData } from "./dashboard-utils";

describe("cnsStatusColor", () => {
  it("returns optimal color for score >= 85", () => {
    expect(cnsStatusColor("Optimal")).toBe("#D4F0D4");
  });
  it("returns recovered color for Recovered", () => {
    expect(cnsStatusColor("Recovered")).toBe("#FFF3C4");
  });
  it("returns mild color for Mild Fatigue", () => {
    expect(cnsStatusColor("Mild Fatigue")).toBe("#FFE0B2");
  });
  it("returns high color for High Fatigue", () => {
    expect(cnsStatusColor("High Fatigue")).toBe("#FFCDD2");
  });
  it("returns empty color for null", () => {
    expect(cnsStatusColor(null)).toBe("#F5EDE0");
  });
});

describe("buildWeekChartData", () => {
  it("returns 7 entries spanning last 7 days", () => {
    const result = buildWeekChartData([], []);
    expect(result).toHaveLength(7);
  });

  it("fills in condition values for matching date", () => {
    const conditionLogs = [
      { log_date: "2026-06-04", mental_condition: 4, physical_energy: 3, muscle_soreness: 2 },
    ];
    const sleepLogs = [
      { wake_date: "2026-06-04", sleep_quality: 5 },
    ];
    // find today's entry
    const result = buildWeekChartData(conditionLogs, sleepLogs);
    const today = result.find((d) => d.isToday);
    expect(today?.mentalCondition).toBe(4);
    expect(today?.physicalEnergy).toBe(3);
    expect(today?.muscleSoreness).toBe(2);
    expect(today?.sleepQuality).toBe(5);
  });

  it("sets null for days with no log", () => {
    const result = buildWeekChartData([], []);
    expect(result[0].mentalCondition).toBeNull();
  });
});
