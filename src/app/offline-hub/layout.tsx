import React from 'react';

/**
 * @fileOverview Layout for the Offline Hub section.
 * The footer and header are handled globally by LayoutWrapper.
 * This layout primarily sets the section-specific font and base background.
 */
export default async function OfflineHubLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="bg-gray-900 text-white font-bengali">
        <main>{children}</main>
    </div>
  );
}