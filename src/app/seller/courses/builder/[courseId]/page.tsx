'use client';

import { CourseBuilder } from '@/components/course-builder';

export default function SellerCourseBuilderPage() {
  return <CourseBuilder userRole="Seller" redirectPath="/seller/courses" />;
}
