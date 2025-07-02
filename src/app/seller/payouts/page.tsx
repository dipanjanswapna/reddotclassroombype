
import { PlaceholderPage } from "@/components/placeholder-page";
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Seller Payouts',
    description: 'View your seller earnings and payout history.',
};

export default function SellerPayoutsPage() {
  return (
    <PlaceholderPage 
        title="Seller Payouts"
        description="This page will show your seller earnings and payout history. This feature is coming soon."
    />
  );
}
