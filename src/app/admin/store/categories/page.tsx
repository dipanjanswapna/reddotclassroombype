
import { getStoreCategories } from "@/lib/firebase/firestore";
import type { Metadata } from 'next';
import { CategoryManager } from "@/components/admin/store/category-manager";

export const metadata: Metadata = {
    title: 'Store Category Management',
    description: 'Create, edit, and manage all product categories for the RDC Store.',
};

export default async function AdminStoreCategoriesPage() {
    const categories = await getStoreCategories();
    
    return <CategoryManager 
        initialCategories={categories}
    />;
}
