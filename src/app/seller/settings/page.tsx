
import { PlaceholderPage } from "@/components/placeholder-page";
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Seller Settings',
    description: 'Settings for your seller account, integrations, and more.',
};

export default function SellerSettingsPage() {
  return (
    <PlaceholderPage 
        title="Seller Settings"
        description="This page will contain settings for your seller account, integrations, and more. This feature is coming soon."
    />
  );
}
