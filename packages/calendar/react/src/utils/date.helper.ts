import { type DateInput } from "@fullcalendar/react";

// Date | string | number | number[]
export const convertToDate = (val?: DateInput): Date => {
  if (!val) return new Date();
  if (typeof val === "string" || typeof val === "number") {
    return new Date(val);
  }
  if (Array.isArray(val)) {
    return new Date();
  }
  return val;
};
