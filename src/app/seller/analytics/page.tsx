
import { PlaceholderPage } from "@/components/placeholder-page";
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Seller Analytics',
    description: 'Detailed analytics and reports on your sales and course performance.',
};

export default function SellerAnalyticsPage() {
  return (
    <PlaceholderPage 
        title="Seller Analytics"
        description="This page will contain detailed analytics and reports on your sales and course performance."
    />
  );
}
