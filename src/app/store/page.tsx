
'use client';

import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Product } from '@/lib/types';
import { ArrowRight, Book, Shirt, Pen, List, ChevronRight } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { cn } from '@/lib/utils';

// Dummy data for products. In a real application, this would come from Firestore.
const products: Product[] = [
  // Apparel
  { id: 'prod_hoodie_1', name: 'Hoodie', category: 'Apparel', subCategory: 'Hoodie', price: 1200, oldPrice: 1500, imageUrl: 'https://placehold.co/400x400.png', dataAiHint: 'hoodie black' },
  { id: 'prod_jersey_1', name: 'Jersey', category: 'Apparel', subCategory: 'Jersey', price: 800, oldPrice: 950, imageUrl: 'https://placehold.co/400x400.png', dataAiHint: 'jersey dark blue' },
  { id: 'prod_tshirt_1', name: 'Original Tee', category: 'Apparel', subCategory: 'T-Shirt', price: 550, oldPrice: 650, imageUrl: 'https://placehold.co/400x400.png', dataAiHint: 't-shirt black' },
  { id: 'prod_tshirt_2', name: 'Academic Batch T-Shirt', category: 'Apparel', subCategory: 'T-Shirt', price: 600, imageUrl: 'https://placehold.co/400x400.png', dataAiHint: 't-shirt blue' },
  // Stationery
  { id: 'prod_notebook_1', name: 'HSC Physics Note', category: 'Stationery', subCategory: 'Notebook', price: 250, imageUrl: 'https://placehold.co/400x400.png', dataAiHint: 'notebook journal' },
  { id: 'prod_notebook_2', name: 'HSC Chemistry Note', category: 'Stationery', subCategory: 'Notebook', price: 250, imageUrl: 'https://placehold.co/400x400.png', dataAiHint: 'notebook journal' },
  { id: 'prod_pen_1', name: 'RDC Premium Gel Pen', category: 'Stationery', subCategory: 'Pen', price: 50, imageUrl: 'https://placehold.co/400x400.png', dataAiHint: 'pen black' },
  { id: 'prod_pen_2', name: 'RDC Ballpoint Pen Set', category: 'Stationery', subCategory: 'Pen', price: 150, imageUrl: 'https://placehold.co/400x400.png', dataAiHint: 'pen blue' },
  // E-Book
  { id: 'prod_ebook_1', name: 'HSC Physics E-Book', category: 'E-Book', price: 150, imageUrl: 'https://placehold.co/400x400.png', dataAiHint: 'ebook physics' },
  { id: 'prod_ebook_2', name: 'SSC Model Tests E-Book', category: 'E-Book', price: 100, imageUrl: 'https://placehold.co/400x400.png', dataAiHint: 'ebook exam' },
  // Printed Book
  { id: 'prod_printed_book_1', name: 'HSC Physics Printed Book', category: 'Printed Book', price: 550, imageUrl: 'https://placehold.co/400x400.png', dataAiHint: 'book physics' },
  { id: 'prod_printed_book_2', name: 'Admission Test Printed Book', category: 'Printed Book', price: 650, imageUrl: 'https://placehold.co/400x400.png', dataAiHint: 'book admission' },
];

const mainCategories = [
    { name: "প্রিন্টেড বই", category: "Printed Book", icon: Book, color: "text-blue-600 dark:text-blue-400", bgColor: "bg-blue-100 dark:bg-blue-900/30" },
    { name: "ই-বুক", category: "E-Book", icon: Book, color: "text-purple-600 dark:text-purple-400", bgColor: "bg-purple-100 dark:bg-purple-900/30" },
    { name: "অ্যাপারেল", category: "Apparel", icon: Shirt, color: "text-pink-600 dark:text-pink-400", bgColor: "bg-pink-100 dark:bg-pink-900/30" },
    { name: "স্টেশনারি", category: "Stationery", icon: Pen, color: "text-green-600 dark:text-green-400", bgColor: "bg-green-100 dark:bg-green-900/30" },
];

const ProductCard = ({ product }: { product: Product }) => (
    <Link href={`/store/product/${product.id}`} className="group">
        <Card className="overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1 bg-white dark:bg-gray-800">
            <CardHeader className="p-0">
                <div className="aspect-square bg-muted flex items-center justify-center">
                    <Image src={product.imageUrl} alt={product.name} width={400} height={400} className="object-cover group-hover:scale-105 transition-transform" data-ai-hint={product.dataAiHint} />
                </div>
            </CardHeader>
            <CardContent className="p-4">
                <h3 className="font-semibold truncate">{product.name}</h3>
                <div className="flex items-baseline gap-2 mt-1">
                    <p className="text-primary font-bold">৳{product.price}</p>
                    {product.oldPrice && <p className="text-sm text-muted-foreground line-through">৳{product.oldPrice}</p>}
                </div>
                <span className="text-green-600 text-xs font-semibold mt-1 block">অর্ডার করুন</span>
            </CardContent>
        </Card>
    </Link>
);


export default function RdcStorePage() {
    const [selectedCategory, setSelectedCategory] = useState<string>('Printed Book');
    const [selectedSubCategory, setSelectedSubCategory] = useState<string | null>(null);

    const subCategories = useMemo(() => {
        if (!selectedCategory) return [];
        const categoryProducts = products.filter(p => p.category === selectedCategory);
        return ['All', ...Array.from(new Set(categoryProducts.map(p => p.subCategory).filter(Boolean))) as string[]];
    }, [selectedCategory]);

    const filteredProducts = useMemo(() => {
        let items = products.filter(p => p.category === selectedCategory);
        if (selectedSubCategory && selectedSubCategory !== 'All') {
            items = items.filter(p => p.subCategory === selectedSubCategory);
        }
        return items;
    }, [selectedCategory, selectedSubCategory]);

    const handleCategorySelect = (category: string) => {
        setSelectedCategory(category);
        setSelectedSubCategory(null);
    }

  return (
    <div className="bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4 py-8">
            <div className="relative rounded-lg overflow-hidden mb-8">
                <Image src="https://placehold.co/1200x300.png" width={1200} height={300} alt="RDC Store Banner" className="w-full h-auto" data-ai-hint="students learning computer" />
            </div>

            <section className="mb-12">
                <h2 className="font-headline text-xl font-bold text-center mb-6">আমাদের স্টোরের সকল ক্যাটাগরি</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {mainCategories.map(cat => (
                        <button 
                            key={cat.category}
                            onClick={() => handleCategorySelect(cat.category)}
                            className={cn(
                                "group p-4 flex items-center gap-4 rounded-lg bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-all border-2",
                                selectedCategory === cat.category ? "border-primary" : "border-transparent"
                            )}
                        >
                            <div className={cn("p-3 rounded-md", cat.bgColor, selectedCategory === cat.category ? 'ring-2 ring-primary/50' : '')}>
                                <cat.icon className={cn("w-6 h-6", cat.color)} />
                            </div>
                            <h3 className="font-semibold">{cat.name}</h3>
                            <ChevronRight className="ml-auto text-muted-foreground transition-transform group-hover:translate-x-1" />
                        </button>
                    ))}
                </div>
            </section>
            
            {subCategories.length > 1 && (
                 <section className="mb-8">
                    <div className="flex items-center justify-center flex-wrap gap-2">
                        {subCategories.map(subCat => (
                            <Button
                                key={subCat}
                                variant={(selectedSubCategory || 'All') === subCat ? 'default' : 'outline'}
                                onClick={() => setSelectedSubCategory(subCat)}
                                className="rounded-full font-semibold px-4 py-2 text-sm"
                            >
                                {subCat}
                            </Button>
                        ))}
                    </div>
                </section>
            )}

            <section className="mb-12">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                    {filteredProducts.map(p => <ProductCard key={p.id} product={p} />)}
                </div>
                {filteredProducts.length > 19 && (
                    <div className="text-center mt-6">
                        <Button variant="outline">আরো দেখুন</Button>
                    </div>
                )}
            </section>

        </div>
    </div>
  )
}
