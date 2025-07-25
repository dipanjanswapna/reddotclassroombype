

'use client';

// IMPORTANT: Replace with your actual Facebook Pixel ID in your .env.local file.
// NEXT_PUBLIC_FACEBOOK_PIXEL_ID=your-id-here
export const FACEBOOK_PIXEL_ID = process.env.NEXT_PUBLIC_FACEBOOK_PIXEL_ID || 'YOUR_PIXEL_ID_HERE';

// IMPORTANT: Replace with your actual Facebook App ID if you use Facebook Login or other plugins.
// NEXT_PUBLIC_FACEBOOK_APP_ID=your-app-id-here
export const FACEBOOK_APP_ID = process.env.NEXT_PUBLIC_FACEBOOK_APP_ID || 'YOUR_APP_ID';


declare global {
  interface Window {
    fbq: (...args: any[]) => void;
  }
}

// https://developers.facebook.com/docs/facebook-pixel/reference
export const pageview = () => {
  if (typeof window.fbq === 'function') {
    window.fbq('track', 'PageView');
  }
};

// https://developers.facebook.com/docs/facebook-pixel/implementation/conversion-tracking
export const track = (name: string, options = {}) => {
  if (typeof window.fbq === 'function') {
    window.fbq('track', name, options);
  }
};

export const trackCustom = (name: string, options = {}) => {
    if (typeof window.fbq === 'function') {
      window.fbq('trackCustom', name, options);
    }
};

/**
 * Tracks a purchase event.
 * @param value The total value of the purchase.
 * @param currency The currency of the purchase (e.g., 'BDT').
 * @param contents Array of items purchased.
 */
export const trackPurchase = (
  value: number,
  currency: string,
  contents: { id: string, quantity: number }[]
) => {
  track('Purchase', {
    value,
    currency,
    contents,
    content_type: 'product'
  });
};

/**
 * Tracks a lead generation event.
 * @param leadType A descriptor for the type of lead (e.g., 'callback_request').
 * @param options Additional data about the lead.
 */
export const trackLead = (leadType: string, options: Record<string, any> = {}) => {
    track('Lead', {
        ...options,
        lead_type: leadType,
    });
};
