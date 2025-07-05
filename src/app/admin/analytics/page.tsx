import type { Metadata } from 'next';
import { AnalyticsClient } from './analytics-client';

export const metadata: Metadata = {
    title: 'Web Analytics',
    description: 'Real-time analytics and performance insights for the platform.',
};

export default function AnalyticsPage() {
    return (
        <div className="p-4 sm:p-6 lg:p-8 space-y-8">
            <div>
                <h1 className="font-headline text-3xl font-bold tracking-tight">
                    Web Analytics
                </h1>
                <p className="mt-1 text-lg text-muted-foreground">
                    Real-time insights into your platform's performance and traffic.
                </p>
            </div>
            <AnalyticsClient />
        </div>
    );
}
