
import { courses } from '@/lib/mock-data';
import { Megaphone, Award, Video } from 'lucide-react';

// Helper to generate notifications from mock data
// This function simulates a real backend that would aggregate these events.
export const generateNotifications = () => {
    const allNotifications: any[] = [];
    const studentId = 's1'; // Mock current student

    // Course Announcements
    courses.forEach(course => {
        course.announcements?.forEach(ann => {
            allNotifications.push({
                id: `ann-${course.id}-${ann.id}`,
                icon: Megaphone,
                title: `New Announcement in ${course.title}`,
                description: ann.title,
                date: new Date(ann.date),
                read: false,
            });
        });
    });

    // Graded Assignments
    courses.forEach(course => {
        course.assignments?.forEach(ass => {
            if (ass.status === 'Graded' && ass.studentId === studentId && ass.submissionDate) {
                allNotifications.push({
                    id: `grade-${course.id}-${ass.id}`,
                    icon: Award,
                    title: `Grade Published: ${ass.title}`,
                    description: `Your assignment has been graded. You received: ${ass.grade}`,
                    date: new Date(ass.submissionDate),
                    read: true,
                });
            }
        });
    });

    // Upcoming Live Classes
    courses.forEach(course => {
        course.liveClasses?.forEach(lc => {
            const classDate = new Date(`${lc.date} ${lc.time}`);
            if (classDate > new Date()) {
                allNotifications.push({
                    id: `live-${course.id}-${lc.id}`,
                    icon: Video,
                    title: `Live Class Reminder: ${lc.topic}`,
                    description: `For course "${course.title}". Don't miss it!`,
                    date: classDate,
                    read: false,
                });
            }
        });
    });

    // Sort notifications by date (most recent first)
    return allNotifications.sort((a, b) => b.date.getTime() - a.date.getTime());
};
