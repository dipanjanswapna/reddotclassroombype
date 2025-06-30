import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { Timestamp } from "firebase/firestore";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Recursively removes undefined values from an object or array.
 * This is crucial for passing data to Next.js Server Actions, as they
 * do not support `undefined` in their serializable payload.
 * @param obj The object or array to clean.
 * @returns The cleaned object or array without any `undefined` values.
 */
export function removeUndefinedValues(obj: any): any {
  if (obj === null || obj === undefined) {
    return null;
  }

  if (Array.isArray(obj)) {
    return obj.map(removeUndefinedValues);
  }

  if (typeof obj === 'object' && !(obj instanceof Timestamp)) {
    const newObj: { [key: string]: any } = {};
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        const value = obj[key];
        if (value !== undefined) {
          newObj[key] = removeUndefinedValues(value);
        }
      }
    }
    return newObj;
  }

  return obj;
}
