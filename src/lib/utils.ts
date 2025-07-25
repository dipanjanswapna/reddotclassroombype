

import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { Timestamp } from "firebase/firestore";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function generateRollNumber(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export function generateRegistrationNumber(): string {
  const min = 10000000; // Smallest 8-digit number
  const max = 99999999; // Largest 8-digit number
  return Math.floor(Math.random() * (max - min + 1) + min).toString();
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

/**
 * Extracts a YouTube video ID from various URL formats.
 * @param url The YouTube URL to parse.
 * @returns The 11-character video ID, or null if not found.
 */
export function getYoutubeVideoId(url: string): string | null {
  if (!url) return null;
  let videoId = null;
  try {
    const urlObj = new URL(url);
    if (urlObj.hostname === 'youtu.be') {
      videoId = urlObj.pathname.slice(1);
    } else if (urlObj.hostname === 'www.youtube.com' || urlObj.hostname === 'youtube.com') {
      videoId = urlObj.searchParams.get('v');
    }
  } catch (e) {
    // regex fallback for invalid urls
    const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = url.match(regex);
    if (match) {
      videoId = match[1];
    }
  }
  return videoId;
}
