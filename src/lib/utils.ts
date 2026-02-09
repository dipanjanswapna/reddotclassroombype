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
 */
export const safeToDate = (dateField: any): Date => {
  if (!dateField) {
    return new Date(NaN); 
  }
  if (dateField instanceof Date) {
    return dateField;
  }
  if (typeof dateField.toDate === 'function') {
    return dateField.toDate();
  }
  if (typeof dateField === 'object' && 'seconds' in dateField && 'nanoseconds' in dateField) {
    return new Timestamp(dateField.seconds, dateField.nanoseconds).toDate();
  }
  if (typeof dateField === 'string') {
    const date = new Date(dateField);
    if (!isNaN(date.getTime())) {
        return date;
    }
  }
  return new Date(NaN);
};

/**
 * Extracts a YouTube video ID from various URL formats.
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
    const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = url.match(regex);
    if (match) {
      videoId = match[1];
    }
  }
  return videoId;
}

/**
 * Parses User Agent to get a friendly device string like "Edge on Windows 10/11"
 */
export function getBrowserInfo(): string {
    if (typeof window === 'undefined') return "Unknown Device";
    const ua = navigator.userAgent;
    let browser = "Browser";
    let os = "OS";

    if (ua.indexOf("Edg/") > -1) browser = "Edge";
    else if (ua.indexOf("Chrome") > -1) browser = "Chrome";
    else if (ua.indexOf("Firefox") > -1) browser = "Firefox";
    else if (ua.indexOf("Safari") > -1) browser = "Safari";

    if (ua.indexOf("Windows NT 10.0") > -1) os = "Windows 10/11";
    else if (ua.indexOf("Windows NT 6.3") > -1) os = "Windows 8.1";
    else if (ua.indexOf("Windows NT 6.2") > -1) os = "Windows 8";
    else if (ua.indexOf("Windows NT 6.1") > -1) os = "Windows 7";
    else if (ua.indexOf("Mac OS X") > -1) os = "macOS";
    else if (ua.indexOf("Android") > -1) os = "Android";
    else if (ua.indexOf("iPhone") > -1 || ua.indexOf("iPad") > -1) os = "iOS";
    else if (ua.indexOf("Linux") > -1) os = "Linux";

    return `${browser} on ${os}`;
}

/**
 * Gets the user's public IP address.
 */
export async function getIpAddress(): Promise<string> {
    try {
        const response = await fetch('https://api.ipify.org?format=json');
        const data = await response.json();
        return data.ip;
    } catch (e) {
        return 'Unknown IP';
    }
}
