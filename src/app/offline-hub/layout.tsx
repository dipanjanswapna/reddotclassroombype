import React from 'react';

/**
 * @fileOverview Layout for the Offline Hub section.
 * Removed forced dark theme to allow the section to follow the global system theme
 * and match the main page aesthetic.
 */
export default async function OfflineHubLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="bg-background text-foreground font-bengali">
        <main>{children}</main>
    </div>
  );
}
