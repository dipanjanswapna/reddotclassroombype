
import { getOrders, getUsers } from "@/lib/firebase/firestore";
import type { Metadata } from 'next';
import { OrderManager } from "@/components/admin/store/order-manager";

export const metadata: Metadata = {
    title: 'Store Orders Management',
    description: 'View and manage all product orders from the RDC Store.',
};

export default async function AdminStoreOrdersPage() {
    const orders = await getOrders();
    const users = await getUsers();
    
    return <OrderManager 
        initialOrders={orders}
        users={users}
    />;
}
