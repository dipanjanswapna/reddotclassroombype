
'use client';

import { CourseBuilder } from '@/components/course-builder';

export default function TeacherCourseBuilderPage() {
  return <CourseBuilder userRole="Teacher" redirectPath="/teacher/courses" />;
}
