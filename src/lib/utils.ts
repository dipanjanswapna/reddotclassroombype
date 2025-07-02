
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { Timestamp } from "firebase/firestore";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Recursively removes properties with `undefined` values from an object.
 * This is crucial for sending data to Firebase or server actions that don't
 * handle `undefined` during serialization.
 * @param obj The object to clean.
 * @returns A new object with `undefined` values removed.
 */
export function removeUndefinedValues(obj: any): any {
  if (Array.isArray(obj)) {
    return obj.map(v => removeUndefinedValues(v));
  } else if (obj !== null && typeof obj === 'object') {
    return Object.keys(obj).reduce((acc, key) => {
      const value = obj[key];
      if (value !== undefined) {
        (acc as any)[key] = removeUndefinedValues(value);
      }
      return acc;
    }, {});
  }
  return obj;
}

/**
 * Safely converts various date-like types from Firestore into a JavaScript Date object.
 * Handles Timestamps, date strings, and serialized timestamp objects.
 * @param dateField The value to convert.
 * @returns A valid Date object, or a Date object representing an invalid date if conversion fails.
 */
export const safeToDate = (dateField: any): Date => {
  if (!dateField) {
    return new Date(NaN); 
  }
  if (dateField instanceof Date) {
    return dateField;
  }
  // Firestore Timestamp
  if (typeof dateField.toDate === 'function') {
    return dateField.toDate();
  }
  // Object from Firestore serialization
  if (typeof dateField === 'object' && 'seconds' in dateField && 'nanoseconds' in dateField) {
    return new Timestamp(dateField.seconds, dateField.nanoseconds).toDate();
  }
  // String representation
  if (typeof dateField === 'string') {
    const date = new Date(dateField);
    if (!isNaN(date.getTime())) {
        return date;
    }
  }
  // Fallback for unexpected formats
  return new Date(NaN);
};
