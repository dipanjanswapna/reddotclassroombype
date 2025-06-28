
'use client';

import React from 'react';

// This layout is a pass-through. The actual course-specific layout is
// located in the [courseId] directory. This file is kept to avoid
// potential routing issues if it were deleted entirely, but its
// logic has been removed to fix a bug where it was causing a 404 error.
export default function MyCoursesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
