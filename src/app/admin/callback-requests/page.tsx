
import { CallbackClient } from './callback-client';
import { getCallbackRequests } from '@/lib/firebase/firestore';

export default async function CallbackRequestsPage() {
    const initialRequests = await getCallbackRequests();

    return (
        <div className="p-4 sm:p-6 lg:p-8 space-y-8">
            <div>
                <h1 className="font-headline text-3xl font-bold tracking-tight">Callback Requests</h1>
                <p className="mt-1 text-lg text-muted-foreground">
                    Manage and respond to student callback requests.
                </p>
            </div>
            <CallbackClient initialRequests={initialRequests} />
        </div>
    )
}
