'use client';

import { CourseBuilder } from '@/components/course-builder';

export default function PartnerCourseBuilderPage() {
  return <CourseBuilder userRole="Seller" redirectPath="/partner/courses" />;
}
