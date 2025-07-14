
import { getNotices } from '@/lib/firebase/firestore';
import { NoticeClient } from './notice-client';

export const revalidate = 0; // Revalidate this page on every request

export default async function AdminNoticesPage() {
    const notices = await getNotices({ includeDrafts: true });
    
    return (
        <div className="p-4 sm:p-6 lg:p-8 space-y-8">
            <div>
                <h1 className="font-headline text-3xl font-bold tracking-tight">Notice Management</h1>
                <p className="mt-1 text-lg text-muted-foreground">
                    Create, edit, and manage all notices and announcements.
                </p>
            </div>
            <NoticeClient initialNotices={notices} />
        </div>
    )
}
