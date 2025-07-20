
import { getRewards } from "@/lib/firebase/firestore";
import type { Metadata } from 'next';
import { RewardManager } from "@/components/admin/store/reward-manager";

export const metadata: Metadata = {
    title: 'Store Reward Management',
    description: 'Create, edit, and manage all redeemable rewards for the RDC Store.',
};

export default async function AdminStoreRewardsPage() {
    const rewards = await getRewards();
    
    return <RewardManager 
        initialRewards={rewards}
    />;
}
