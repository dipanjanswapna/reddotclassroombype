
import { ProductManager } from '@/components/admin/store/product-manager';
import { getProducts, getOrganizations, getStoreCategories } from '@/lib/firebase/firestore';
import type { Metadata } from 'next';
import { motion } from 'framer-motion';
import { ShoppingBag } from 'lucide-react';

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
    
    return (
        <div className="px-1 py-4 md:py-8 space-y-10">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 border-l-4 border-primary pl-4">
                <div>
                    <h1 className="font-headline text-3xl md:text-4xl font-black tracking-tight leading-none uppercase text-foreground">
                        Store <span className="text-primary">Inventory</span>
                    </h1>
                    <p className="mt-2 text-sm md:text-lg text-muted-foreground font-medium">
                        Create, edit, and manage all products for the RDC Store.
                    </p>
                </div>
                <div className="bg-primary/10 p-3 rounded-2xl hidden md:block">
                    <ShoppingBag className="w-8 h-8 text-primary" />
                </div>
            </div>
            
            <ProductManager 
                initialProducts={products}
                sellers={approvedSellers}
                categories={categories}
            />
        </div>
    );
}
