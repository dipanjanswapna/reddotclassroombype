'use client';

import { ReactLenis } from 'lenis/react';
import { ReactNode } from 'react';

/**
 * @fileOverview LenisProvider component.
 * Provides smooth scrolling across the entire application using the Lenis library.
 * Wraps the root layout to ensure a buttery-smooth feel.
 */
export function LenisProvider({ children }: { children: ReactNode }) {
  return (
    <ReactLenis root options={{ lerp: 0.1, duration: 1.5, smoothWheel: true }}>
      {children}
    </ReactLenis>
  );
}
