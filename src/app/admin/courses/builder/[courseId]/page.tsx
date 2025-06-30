'use client';

import { CourseBuilder } from '@/components/course-builder';

export default function AdminCourseBuilderPage() {
  return <CourseBuilder userRole="Admin" redirectPath="/admin/courses" />;
}
