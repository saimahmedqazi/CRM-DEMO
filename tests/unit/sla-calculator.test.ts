import { describe, it, expect } from "vitest";
import {
  calculateDueDate,
  checkInquirySLA,
  isWithinBusinessHours,
  DEFAULT_SAST_SCHEDULE,
} from "@/lib/sla/sla-calculator";

describe("Business Hours SLA Calculator (SAST)", () => {
  it("correctly identifies whether a timestamp is within SAST business hours", () => {
    // Wednesday 10:00 SAST -> Open
    const wednesdayOpen = new Date("2026-10-28T10:00:00");
    expect(isWithinBusinessHours(wednesdayOpen, DEFAULT_SAST_SCHEDULE)).toBe(true);

    // Wednesday 20:00 SAST -> Closed
    const wednesdayNight = new Date("2026-10-28T20:00:00");
    expect(isWithinBusinessHours(wednesdayNight, DEFAULT_SAST_SCHEDULE)).toBe(false);

    // Sunday 11:00 SAST -> Closed
    const sunday = new Date("2026-10-25T11:00:00");
    expect(isWithinBusinessHours(sunday, DEFAULT_SAST_SCHEDULE)).toBe(false);
  });

  it("rolls over after-hours inquiry to next morning 08:00 before counting SLA", () => {
    // Inquiry arrives Tuesday night at 21:00. Target SLA: 2 hours.
    // Should start at Wednesday 08:00 and be due at Wednesday 10:00.
    const tuesdayNight = new Date("2026-10-27T21:00:00");
    const due = calculateDueDate(tuesdayNight, 2, DEFAULT_SAST_SCHEDULE);

    expect(due.getHours()).toBe(10);
    expect(due.getMinutes()).toBe(0);
    expect(due.getDay()).toBe(3); // Wednesday
  });

  it("rolls over Friday afternoon inquiry to Saturday morning", () => {
    // Friday at 15:30. Clinic closes at 16:30 (1 hour remaining on Friday).
    // Target SLA: 2 hours.
    // 1 hour consumed Friday (15:30 to 16:30), remaining 1 hour carries to Saturday (opens 08:30 -> due 09:30).
    const fridayAfternoon = new Date("2026-10-30T15:30:00");
    const due = calculateDueDate(fridayAfternoon, 2, DEFAULT_SAST_SCHEDULE);

    expect(due.getDay()).toBe(6); // Saturday
    expect(due.getHours()).toBe(9);
    expect(due.getMinutes()).toBe(30);
  });

  it("detects breached SLAs accurately", () => {
    // Created Wednesday at 08:00 with 2h SLA (due 10:00). Current time 11:00.
    const createdAt = new Date("2026-10-28T08:00:00");
    const now = new Date("2026-10-28T11:00:00");

    const result = checkInquirySLA(createdAt, 2, DEFAULT_SAST_SCHEDULE, now);
    expect(result.isBreached).toBe(true);
    expect(result.status).toBe("breached");
  });
});
