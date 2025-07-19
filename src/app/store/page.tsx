
'use client';

import { useState, useMemo, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Product } from '@/lib/types';
import { ArrowRight, Book, Shirt, Pen, List, ChevronRight, Menu, X } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { getProducts } from '@/lib/firebase/firestore';
import { LoadingSpinner } from '@/components/loading-spinner';
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { useIsMobile } from '@/hooks/use-mobile';


const mainCategories = [
    { name: "প্রিন্টেড বই", category: "Printed Book", icon: Book, color: "text-blue-600 dark:text-blue-400", bgColor: "bg-blue-100 dark:bg-blue-900/30" },
    { name: "ই-বুক", category: "E-Book", icon: Book, color: "text-purple-600 dark:text-purple-400", bgColor: "bg-purple-100 dark:bg-purple-900/30" },
    { name: "অ্যাপারেল", category: "Apparel", icon: Shirt, color: "text-pink-600 dark:text-pink-400", bgColor: "bg-pink-100 dark:bg-pink-900/30" },
    { name: "স্টেশনারি", category: "Stationery", icon: Pen, color: "text-green-600 dark:text-green-400", bgColor: "bg-green-100 dark:bg-green-900/30" },
];

const ProductCard = ({ product }: { product: Product }) => (
    <Link href={`/store/product/${product.id}`} className="group">
        <Card className="overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1 bg-white dark:bg-gray-800 h-full flex flex-col">
            <div className="aspect-square bg-muted flex items-center justify-center overflow-hidden">
                <Image src={product.imageUrl} alt={product.name} width={400} height={400} className="object-cover group-hover:scale-105 transition-transform w-full h-full" data-ai-hint={product.dataAiHint} />
            </div>
            <CardContent className="p-4 flex-grow flex flex-col">
                <h3 className="font-semibold truncate flex-grow">{product.name}</h3>
                <div className="flex items-baseline gap-2 mt-2">
                    <p className="text-primary font-bold">৳{product.price}</p>
                    {product.oldPrice && <p className="text-sm text-muted-foreground line-through">৳{product.oldPrice}</p>}
                </div>
                <span className="text-green-600 text-xs font-semibold mt-1 block">অর্ডার করুন</span>
            </CardContent>
        </Card>
    </Link>
);

const FilterSidebarContent = ({
    selectedCategory,
    handleCategorySelect,
    subCategories,
    selectedSubCategory,
    setSelectedSubCategory,
    onClose,
}: {
    selectedCategory: string | null;
    handleCategorySelect: (category: string | null) => void;
    subCategories: string[];
    selectedSubCategory: string | null;
    setSelectedSubCategory: (subCategory: string | null) => void;
    onClose?: () => void;
}) => (
    <div className="space-y-6 p-4">
        <div>
            <h3 className="font-semibold mb-3">ক্যাটাগরি</h3>
            <div className="space-y-2">
                <button
                    onClick={() => { handleCategorySelect(null); onClose?.(); }}
                    className={cn(
                        "w-full text-left p-2 rounded-md transition-colors",
                        selectedCategory === null ? 'bg-primary/10 text-primary' : 'hover:bg-muted'
                    )}
                >
                    সব প্রোডাক্ট
                </button>
                {mainCategories.map(cat => (
                    <button
                        key={cat.category}
                        onClick={() => { handleCategorySelect(cat.category); onClose?.(); }}
                        className={cn(
                            "w-full text-left p-2 rounded-md flex items-center gap-2 transition-colors",
                            selectedCategory === cat.category ? 'bg-primary/10 text-primary' : 'hover:bg-muted'
                        )}
                    >
                        <cat.icon className={cn("w-5 h-5", cat.color)} />
                        {cat.name}
                    </button>
                ))}
            </div>
        </div>
        {selectedCategory && subCategories.length > 0 && (
            <div>
                <h3 className="font-semibold mb-3">সাব-ক্যাটাগরি</h3>
                <div className="space-y-2">
                    <button
                        onClick={() => { setSelectedSubCategory(null); onClose?.(); }}
                        className={cn(
                            "w-full text-left p-2 rounded-md transition-colors",
                            selectedSubCategory === null ? 'bg-primary/10 text-primary' : 'hover:bg-muted'
                        )}
                    >
                        সব
                    </button>
                    {subCategories.map(subCat => (
                        <button
                            key={subCat}
                            onClick={() => { setSelectedSubCategory(subCat); onClose?.(); }}
                            className={cn(
                                "w-full text-left p-2 rounded-md transition-colors",
                                selectedSubCategory === subCat ? 'bg-primary/10 text-primary' : 'hover:bg-muted'
                            )}
                        >
                            {subCat}
                        </button>
                    ))}
                </div>
            </div>
        )}
    </div>
);


export default function RdcStorePage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [selectedSubCategory, setSelectedSubCategory] = useState<string | null>(null);
    const [isSheetOpen, setIsSheetOpen] = useState(false);
    const isMobile = useIsMobile();

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const fetchedProducts = await getProducts();
                setProducts(fetchedProducts);
            } catch (error) {
                console.error("Failed to fetch products:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchProducts();
    }, []);

    const subCategories = useMemo(() => {
        if (!selectedCategory) return [];
        const categoryProducts = products.filter(p => p.category === selectedCategory);
        return [...new Set(categoryProducts.map(p => p.subCategory).filter(Boolean))] as string[];
    }, [products, selectedCategory]);

    const filteredProducts = useMemo(() => {
        let items = products;
        if (selectedCategory) {
            items = items.filter(p => p.category === selectedCategory);
        }
        if (selectedSubCategory) {
            items = items.filter(p => p.subCategory === selectedSubCategory);
        }
        return items;
    }, [products, selectedCategory, selectedSubCategory]);

    const handleCategorySelect = (category: string | null) => {
        setSelectedCategory(category);
        setSelectedSubCategory(null);
    };
    
    if(loading) {
        return <div className="flex h-screen items-center justify-center"><LoadingSpinner /></div>
    }

  return (
    <div className="bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4 py-8">
            <div className="relative rounded-lg overflow-hidden mb-8">
                <Image src="https://placehold.co/1200x300.png" width={1200} height={300} alt="RDC Store Banner" className="w-full h-auto" data-ai-hint="students learning computer" />
            </div>

            <div className="grid lg:grid-cols-4 gap-8">
                {/* Desktop Sidebar */}
                {!isMobile && (
                    <div className="lg:col-span-1">
                        <Card className="sticky top-20">
                            <CardContent className="p-0">
                                <FilterSidebarContent
                                    selectedCategory={selectedCategory}
                                    handleCategorySelect={handleCategorySelect}
                                    subCategories={subCategories}
                                    selectedSubCategory={selectedSubCategory}
                                    setSelectedSubCategory={setSelectedSubCategory}
                                />
                            </CardContent>
                        </Card>
                    </div>
                )}
                
                {/* Mobile Filter Button & Sheet */}
                {isMobile && (
                     <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                        <SheetTrigger asChild>
                            <Button variant="outline" className="lg:hidden flex items-center gap-2 mb-4">
                                <List className="w-4 h-4" /> Filter Products
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="left">
                            <SheetHeader>
                                <SheetTitle>Filter Products</SheetTitle>
                            </SheetHeader>
                             <FilterSidebarContent
                                selectedCategory={selectedCategory}
                                handleCategorySelect={handleCategorySelect}
                                subCategories={subCategories}
                                selectedSubCategory={selectedSubCategory}
                                setSelectedSubCategory={setSelectedSubCategory}
                                onClose={() => setIsSheetOpen(false)}
                            />
                        </SheetContent>
                    </Sheet>
                )}

                <div className="lg:col-span-3">
                    <section>
                         <h2 className="font-headline text-2xl font-bold mb-6">
                            {selectedCategory ? `${selectedCategory}${selectedSubCategory ? ` / ${selectedSubCategory}` : ''}` : 'All Products'}
                        </h2>
                        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                           {filteredProducts.length > 0 ? (
                                filteredProducts.map(p => <ProductCard key={p.id} product={p} />)
                           ) : (
                                <p className="col-span-full text-center text-muted-foreground py-10">No products found in this category.</p>
                           )}
                        </div>
                    </section>
                </div>
            </div>
            
             <section className="mt-16">
                <div className="relative bg-[#0d122b] text-white p-8 md:p-12 rounded-2xl overflow-hidden grid md:grid-cols-2 gap-8 items-center">
                    <div className="absolute -top-10 -right-10 w-32 h-32 bg-pink-500/20 rounded-full"></div>
                    <div className="absolute -bottom-16 -left-10 w-48 h-48 bg-blue-500/20 rounded-full"></div>
                    <div className="relative z-10">
                        <h2 className="font-headline text-3xl font-bold leading-tight">৬ষ্ঠ শ্রেণি থেকে SSC-HSC পরীক্ষা এবং এডমিশন প্রিপারেশনের জন্য RDC'র কোর্সগুলো ভিজিট করুন।</h2>
                        <p className="mt-4 text-white/80">বাসায় বসেই বুয়েট-ঢাবি-মেডিকেল পাস ও ১৭ বছর পর্যন্ত অভিজ্ঞ শিক্ষকদের সাথে পড়াশোনা হোক দেশের সর্বাধুনিক প্রযুক্তির RDC অ্যাপ এবং ওয়েব-অ্যাপে।</p>
                        <Button asChild className="mt-6 bg-blue-500 hover:bg-blue-600 font-bengali font-bold">
                            <Link href="/courses">
                                ভিজিট করুন <ArrowRight className="ml-2 w-4 h-4" />
                            </Link>
                        </Button>
                    </div>
                    <div className="relative hidden md:block">
                        <Image
                            src="https://placehold.co/400x300.png"
                            alt="Student studying with laptop"
                            width={400}
                            height={300}
                            className="object-contain"
                            data-ai-hint="student studying illustration"
                        />
                    </div>
                </div>
            </section>
        </div>
    </div>
  )
}
