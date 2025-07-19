
import React from 'react';

// This layout file is now handled by the logic within LayoutWrapper.
// It can be simplified or used for store-specific metadata in the future.

export default function StoreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
