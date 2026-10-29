export interface BusinessDayHours {
  open: string; // "08:00"
  close: string; // "16:30"
  closed: boolean;
}

export type BusinessSchedule = Record<string, BusinessDayHours>;

export const DEFAULT_SAST_SCHEDULE: BusinessSchedule = {
  Monday: { open: "08:00", close: "16:30", closed: false },
  Tuesday: { open: "08:00", close: "16:30", closed: false },
  Wednesday: { open: "08:00", close: "16:30", closed: false },
  Thursday: { open: "08:00", close: "16:30", closed: false },
  Friday: { open: "08:00", close: "16:30", closed: false },
  Saturday: { open: "08:30", close: "12:00", closed: false },
  Sunday: { open: "00:00", close: "00:00", closed: true },
};

const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

/**
 * Checks if a given Date is within the configured business operating hours.
 */
export function isWithinBusinessHours(date: Date, schedule: BusinessSchedule = DEFAULT_SAST_SCHEDULE): boolean {
  const dayName = DAY_NAMES[date.getDay()];
  const dayConfig = schedule[dayName];
  if (!dayConfig || dayConfig.closed) return false;

  const [openHour, openMin] = dayConfig.open.split(":").map(Number);
  const [closeHour, closeMin] = dayConfig.close.split(":").map(Number);

  const currentMinutes = date.getHours() * 60 + date.getMinutes();
  const openMinutes = openHour * 60 + openMin;
  const closeMinutes = closeHour * 60 + closeMin;

  return currentMinutes >= openMinutes && currentMinutes < closeMinutes;
}

/**
 * Fast-forwards a date to the next valid business hour opening if currently closed.
 */
export function advanceToNextBusinessOpening(date: Date, schedule: BusinessSchedule = DEFAULT_SAST_SCHEDULE): Date {
  const current = new Date(date);

  for (let i = 0; i < 14; i++) { // search up to 2 weeks ahead
    const dayName = DAY_NAMES[current.getDay()];
    const dayConfig = schedule[dayName];

    if (dayConfig && !dayConfig.closed) {
      const [openHour, openMin] = dayConfig.open.split(":").map(Number);
      const [closeHour, closeMin] = dayConfig.close.split(":").map(Number);

      const currentMinutes = current.getHours() * 60 + current.getMinutes();
      const openMinutes = openHour * 60 + openMin;
      const closeMinutes = closeHour * 60 + closeMin;

      if (currentMinutes < openMinutes) {
        current.setHours(openHour, openMin, 0, 0);
        return current;
      } else if (currentMinutes < closeMinutes) {
        return current;
      }
    }

    // Advance to next day at 00:00
    current.setDate(current.getDate() + 1);
    current.setHours(0, 0, 0, 0);
  }

  return current;
}

/**
 * Calculates a due date by adding a given number of business hours to a start date.
 */
export function calculateDueDate(
  startDate: Date,
  businessHoursToAdd: number,
  schedule: BusinessSchedule = DEFAULT_SAST_SCHEDULE
): Date {
  let current = advanceToNextBusinessOpening(new Date(startDate), schedule);
  let remainingMinutes = Math.round(businessHoursToAdd * 60);

  while (remainingMinutes > 0) {
    const dayName = DAY_NAMES[current.getDay()];
    const dayConfig = schedule[dayName];

    if (!dayConfig || dayConfig.closed) {
      current = advanceToNextBusinessOpening(current, schedule);
      continue;
    }

    const [closeHour, closeMin] = dayConfig.close.split(":").map(Number);
    const closeMinutes = closeHour * 60 + closeMin;
    const currentMinutes = current.getHours() * 60 + current.getMinutes();

    const availableMinutesToday = closeMinutes - currentMinutes;

    if (remainingMinutes <= availableMinutesToday) {
      current.setMinutes(current.getMinutes() + remainingMinutes);
      remainingMinutes = 0;
    } else {
      remainingMinutes -= availableMinutesToday;
      current.setDate(current.getDate() + 1);
      current.setHours(0, 0, 0, 0);
      current = advanceToNextBusinessOpening(current, schedule);
    }
  }

  return current;
}

/**
 * Evaluates whether an inquiry has breached the target response SLA in business hours.
 */
export function checkInquirySLA(
  createdAt: Date,
  targetResponseHours: number = 2,
  schedule: BusinessSchedule = DEFAULT_SAST_SCHEDULE,
  now: Date = new Date()
) {
  const deadline = calculateDueDate(createdAt, targetResponseHours, schedule);
  const isBreached = now > deadline;
  const remainingMs = deadline.getTime() - now.getTime();
  const remainingHours = Math.max(0, remainingMs / (1000 * 60 * 60));

  let status: "on_track" | "warning" | "breached";
  if (isBreached) {
    status = "breached";
  } else if (remainingHours < 1.0) {
    status = "warning";
  } else {
    status = "on_track";
  }

  return {
    isBreached,
    deadline,
    remainingHours: Number(remainingHours.toFixed(1)),
    status,
  };
}
