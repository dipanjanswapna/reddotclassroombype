
import { ProductManager } from '@/components/admin/store/product-manager';
import { getProducts, getOrganizations, getStoreCategories } from '@/lib/firebase/firestore';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Store Product Management',
    description: 'Create, edit, and manage all products for the RDC Store.',
};

export default async function AdminStoreProductsPage() {
    const [products, sellers, categories] = await Promise.all([
        getProducts(),
        getOrganizations(),
        getStoreCategories(),
    ]);
    const approvedSellers = sellers.filter(s => s.status === 'approved');
    
    return <ProductManager 
        initialProducts={products}
        sellers={approvedSellers}
        categories={categories}
    />;
}
