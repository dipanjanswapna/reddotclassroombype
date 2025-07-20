
import { getRedeemRequests, getUsers } from "@/lib/firebase/firestore";
import type { Metadata } from 'next';
import { RedeemManager } from "@/components/admin/store/redeem-manager";

export const metadata: Metadata = {
    title: 'Store Redeem Requests',
    description: 'View and manage all student reward redemption requests.',
};

export default async function AdminRedeemRequestsPage() {
    const requests = await getRedeemRequests();
    const users = await getUsers();
    
    return <RedeemManager 
        initialRequests={requests}
        users={users}
    />;
}
