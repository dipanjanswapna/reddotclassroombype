import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

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
