import { ProductManager } from '@/components/admin/store/product-manager';
import { getProducts, getOrganizations, getStoreCategories } from '@/lib/firebase/firestore';
import type { Metadata } from 'next';
import { ShoppingBag, Package } from 'lucide-react';

export const metadata: Metadata = {
    title: 'Store Inventory | Admin',
    description: 'Master inventory control for the RDC Store.',
};

/**
 * @fileOverview Admin Store Products Page
 * Implements a high-density, wall-to-wall (px-1) layout.
 * Fetches products, sellers, and categories for the dynamic ProductManager.
 */
export default async function AdminStoreProductsPage() {
    const [products, sellers, categories] = await Promise.all([
        getProducts(),
        getOrganizations(),
        getStoreCategories(),
    ]);
    
    const approvedSellers = sellers.filter(s => s.status === 'approved');
    
    return (
        <div className="px-1 py-4 md:py-8 space-y-10">
            {/* Page Header - High Density */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 border-l-4 border-primary pl-4">
                <div className="space-y-1">
                    <h1 className="font-headline text-3xl md:text-4xl font-black tracking-tight leading-none uppercase text-foreground">
                        Store <span className="text-primary">Inventory</span>
                    </h1>
                    <p className="text-sm md:text-lg text-muted-foreground font-medium">
                        Master control for all RDC merchandise and academic resources.
                    </p>
                </div>
                <div className="hidden md:flex items-center gap-3 bg-primary/5 p-3 rounded-[20px] border border-primary/10">
                    <div className="h-10 w-10 bg-primary rounded-xl flex items-center justify-center text-white shadow-lg">
                        <Package className="w-6 h-6" />
                    </div>
                    <div className="pr-4">
                        <p className="text-xl font-black text-primary leading-none">{products.length}</p>
                        <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground mt-1">Total SKUs</p>
                    </div>
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
