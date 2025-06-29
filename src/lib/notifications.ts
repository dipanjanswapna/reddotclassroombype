
import { Award, Video, Megaphone } from "lucide-react";

export const generateNotifications = () => [
  {
    id: 'notif_1',
    icon: Megaphone,
    title: 'New Course Announcement!',
    description: 'The "Advanced Web Development" course has been updated with a new module on WebSockets.',
    date: new Date(Date.now() - 1000 * 60 * 10), // 10 minutes ago
    read: false,
  },
  {
    id: 'notif_2',
    icon: Video,
    title: 'Live Class Starting Soon',
    description: 'Your "HSC Physics" live class on "Modern Physics" starts in 15 minutes.',
    date: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
    read: false,
  },
  {
    id: 'notif_3',
    icon: Award,
    title: 'Assignment Graded',
    description: 'Your assignment "Chemistry Lab Report" has been graded. You scored 92%.',
    date: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
    read: true,
  },
    {
    id: 'notif_4',
    icon: Award,
    title: 'Certificate Unlocked',
    description: 'Congratulations! You have completed the "IELTS Preparation Course" and earned a certificate.',
    date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3), // 3 days ago
    read: true,
  },
];
