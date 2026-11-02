import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number, currency: string = "ZAR"): string {
  return new Intl.NumberFormat("en-ZA", {
    style: "currency",
    currency: currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function isBallito(locationId?: string | null): boolean {
  if (!locationId) return false;
  const l = locationId.toLowerCase();
  return l.includes("blt") || l.includes("ballito");
}

export function isDurban(locationId?: string | null): boolean {
  if (!locationId) return false;
  const l = locationId.toLowerCase();
  return l.includes("dbn") || l.includes("durban");
}

export function getClinicName(locationId?: string | null): string {
  if (isBallito(locationId)) return "Ballito Clinic (The Well)";
  return "Durban Clinic (Musgrave)";
}

export function getClinicShortName(locationId?: string | null): string {
  if (isBallito(locationId)) return "Ballito";
  return "Durban";
}

export function matchesLocationFilter(itemLocationId?: string | null, filterLocation?: string | null): boolean {
  if (!filterLocation || filterLocation === "all") return true;
  if (isBallito(filterLocation)) return isBallito(itemLocationId);
  if (isDurban(filterLocation)) return isDurban(itemLocationId);
  return itemLocationId === filterLocation;
}
