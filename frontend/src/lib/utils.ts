import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function isColombianHoliday(date: Date): boolean {
  const year = date.getFullYear();
  const month = date.getMonth() + 1; // 1-12
  const day = date.getDate();

  // Helper to check if two dates are same day (ignoring year if we check by month/day calculated)
  const isSameDay = (d1: Date, m: number, d: number) => {
    return d1.getMonth() + 1 === m && d1.getDate() === d;
  };

  // 1. Fixed-date holidays
  if (month === 1 && day === 1) return true; // New Year
  if (month === 5 && day === 1) return true; // Labor Day
  if (month === 7 && day === 20) return true; // Independence Day
  if (month === 8 && day === 7) return true; // Battle of Boyaca
  if (month === 12 && day === 8) return true; // Immaculate Conception
  if (month === 12 && day === 25) return true; // Christmas

  // Helper to calculate movable holidays (Emiliani Law)
  const getMovableHolidayDate = (y: number, m: number, d: number) => {
    const tempDate = new Date(y, m - 1, d);
    const dayOfWeek = tempDate.getDay();
    if (dayOfWeek === 1) return tempDate;
    const daysToAdd = dayOfWeek === 0 ? 1 : 8 - dayOfWeek;
    const result = new Date(tempDate);
    result.setDate(tempDate.getDate() + daysToAdd);
    return result;
  };

  // Movable holidays (Emiliani Law)
  if (isSameDay(getMovableHolidayDate(year, 1, 6), month, day)) return true; // Epiphany (Jan 6)
  if (isSameDay(getMovableHolidayDate(year, 3, 19), month, day)) return true; // St. Joseph (Mar 19)
  if (isSameDay(getMovableHolidayDate(year, 6, 29), month, day)) return true; // St. Peter & St. Paul (Jun 29)
  if (isSameDay(getMovableHolidayDate(year, 8, 15), month, day)) return true; // Assumption of Mary (Aug 15)
  if (isSameDay(getMovableHolidayDate(year, 10, 12), month, day)) return true; // Columbus Day (Oct 12)
  if (isSameDay(getMovableHolidayDate(year, 11, 1), month, day)) return true; // All Saints (Nov 1)
  if (isSameDay(getMovableHolidayDate(year, 11, 11), month, day)) return true; // Independence of Cartagena (Nov 11)

  // 2. Easter-based holidays (Meeus/Jones/Butcher algorithm)
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const L = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * L) / 451);
  const easterMonth = Math.floor((h + L - 7 * m + 114) / 31);
  const easterDay = ((h + L - 7 * m + 114) % 31) + 1;
  const easterSunday = new Date(year, easterMonth - 1, easterDay);

  // Holy Thursday (Easter - 3 days)
  const holyThursday = new Date(easterSunday);
  holyThursday.setDate(easterSunday.getDate() - 3);
  if (isSameDay(holyThursday, month, day)) return true;

  // Good Friday (Easter - 2 days)
  const holyFriday = new Date(easterSunday);
  holyFriday.setDate(easterSunday.getDate() - 2);
  if (isSameDay(holyFriday, month, day)) return true;

  // Ascension of Jesus (Easter + 39 days, moves to Monday -> Easter + 43 days)
  const ascension = new Date(easterSunday);
  ascension.setDate(easterSunday.getDate() + 43);
  if (isSameDay(ascension, month, day)) return true;

  // Corpus Christi (Easter + 60 days, moves to Monday -> Easter + 64 days)
  const corpusChristi = new Date(easterSunday);
  corpusChristi.setDate(easterSunday.getDate() + 64);
  if (isSameDay(corpusChristi, month, day)) return true;

  // Sacred Heart (Easter + 68 days, moves to Monday -> Easter + 71 days)
  const sacredHeart = new Date(easterSunday);
  sacredHeart.setDate(easterSunday.getDate() + 71);
  if (isSameDay(sacredHeart, month, day)) return true;

  return false;
}
