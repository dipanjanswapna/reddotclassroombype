
'use client';

import { StudyPlannerClient } from '@/components/student/planner/study-planner-client';

export default function StudentPlannerPage() {
    // All data fetching and logic is now handled client-side in StudyPlannerClient
    // to better support offline functionality.
    return <StudyPlannerClient />;
}
