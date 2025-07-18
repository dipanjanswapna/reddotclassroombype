
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Product } from '@/lib/types';
import { ArrowRight, Book, Shirt, Pen, List, ChevronRight } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { cn } from '@/lib/utils';

// Dummy data for products. In a real application, this would come from Firestore.
const products: Product[] = [
  // Apparel
  { id: 'prod_hoodie_1', name: 'Hoodie', category: 'Apparel', price: 1200, oldPrice: 1500, imageUrl: 'https://placehold.co/400x400.png', dataAiHint: 'hoodie black' },
  { id: 'prod_jersey_1', name: 'Jersey', category: 'Apparel', price: 800, oldPrice: 950, imageUrl: 'https://placehold.co/400x400.png', dataAiHint: 'jersey dark blue' },
  { id: 'prod_tshirt_1', name: 'Original Tee', category: 'Apparel', price: 550, oldPrice: 650, imageUrl: 'https://placehold.co/400x400.png', dataAiHint: 't-shirt black' },
  { id: 'prod_tshirt_2', name: 'Academic Batch T-Shirt', category: 'Apparel', price: 600, imageUrl: 'https://placehold.co/400x400.png', dataAiHint: 't-shirt blue' },
  // Stationery
  { id: 'prod_notebook_1', name: 'HSC Physics Note', category: 'Stationery', price: 250, imageUrl: 'https://placehold.co/400x400.png', dataAiHint: 'notebook journal' },
  { id: 'prod_notebook_2', name: 'HSC Chemistry Note', category: 'Stationery', price: 250, imageUrl: 'https://placehold.co/400x400.png', dataAiHint: 'notebook journal' },
  { id: 'prod_notebook_3', name: 'HSC Math Note', category: 'Stationery', price: 250, imageUrl: 'https://placehold.co/400x400.png', dataAiHint: 'notebook journal' },
  { id: 'prod_notebook_4', name: 'HSC Biology Note', category: 'Stationery', price: 250, imageUrl: 'https://placehold.co/400x400.png', dataAiHint: 'notebook journal' },
  // Pen
  { id: 'prod_pen_1', name: 'RDC Premium Gel Pen', category: 'Pen', price: 50, imageUrl: 'https://placehold.co/400x400.png', dataAiHint: 'pen black' },
  { id: 'prod_pen_2', name: 'RDC Ballpoint Pen Set', category: 'Pen', price: 150, imageUrl: 'https://placehold.co/400x400.png', dataAiHint: 'pen blue' },
  { id: 'prod_pen_3', name: 'RDC Fountain Pen', category: 'Pen', price: 350, imageUrl: 'https://placehold.co/400x400.png', dataAiHint: 'pen elegant' },
  { id: 'prod_pen_4', name: 'RDC Marker Set', category: 'Pen', price: 200, imageUrl: 'https://placehold.co/400x400.png', dataAiHint: 'marker colorful' },
  // E-Book
  { id: 'prod_ebook_1', name: 'HSC Physics E-Book', category: 'E-Book', price: 150, imageUrl: 'https://placehold.co/400x400.png', dataAiHint: 'ebook physics' },
  { id: 'prod_ebook_2', name: 'SSC Model Tests E-Book', category: 'E-Book', price: 100, imageUrl: 'https://placehold.co/400x400.png', dataAiHint: 'ebook exam' },
  { id: 'prod_ebook_3', name: 'Admission Test E-Book', category: 'E-Book', price: 200, imageUrl: 'https://placehold.co/400x400.png', dataAiHint: 'ebook admission' },
  { id: 'prod_ebook_4', name: 'Medical Biology E-Book', category: 'E-Book', price: 180, imageUrl: 'https://placehold.co/400x400.png', dataAiHint: 'ebook biology' },
];

const categories = [
    { name: "প্রিন্টেড বই", icon: Book, href: "/store?category=Printed+Book", color: "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300" },
    { name: "ই-বুক", icon: Book, href: "/store?category=E-Book", color: "bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-300" },
    { name: "অ্যাপারেল", icon: Shirt, href: "/store?category=Apparel", color: "bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-300" },
    { name: "স্টেশনারি", icon: Pen, href: "/store?category=Stationery", color: "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-300" },
];

const HorizontalProductCard = ({ product }: { product: Product }) => (
    <Link href={`/store/product/${product.id}`} className="group flex items-center gap-4 rounded-lg p-4 bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-shadow">
        <Image src={product.imageUrl} alt={product.name} width={80} height={80} className="rounded-md object-cover bg-gray-100" data-ai-hint={product.dataAiHint} />
        <div className="flex-grow">
            <h3 className="font-semibold text-sm">{product.name}</h3>
            <p className="text-xs text-muted-foreground">{product.category}</p>
            <div className="flex items-baseline gap-2 mt-1">
                <p className="text-primary font-bold text-sm">৳{product.price}</p>
                {product.oldPrice && <p className="text-xs text-muted-foreground line-through">৳{product.oldPrice}</p>}
            </div>
            <span className="text-green-600 text-xs font-semibold mt-1 block">অর্ডার করুন</span>
        </div>
    </Link>
);


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

const ProductSection = ({ title, productCategory, viewAllLink }: { title: string, productCategory: string, viewAllLink: string }) => (
    <section className="mb-12">
        <div className="flex items-center justify-between mb-4">
            <h2 className="font-headline text-2xl font-bold">{title}</h2>
            <Button variant="link" asChild><Link href={viewAllLink}>সব দেখুন <ArrowRight className="ml-2 h-4 w-4"/></Link></Button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {products.filter(p => p.category === productCategory).slice(0, 4).map(p => <ProductCard key={p.id} product={p} />)}
        </div>
        <div className="text-center mt-6">
            <Button variant="outline">আরো দেখুন</Button>
        </div>
    </section>
);


export default function RdcStorePage() {
  return (
    <div className="bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4 py-8">
            <div className="relative rounded-lg overflow-hidden mb-8">
                <Image src="https://placehold.co/1200x300.png" width={1200} height={300} alt="RDC Store Banner" className="w-full h-auto" data-ai-hint="students learning computer" />
            </div>

            <section className="mb-12">
                <h2 className="font-headline text-xl font-bold text-center mb-6">আমাদের স্টোরের সকল ক্যাটাগরি</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {categories.map(cat => (
                        <Link href={cat.href} key={cat.name}>
                            <Card className="p-4 flex items-center gap-4 hover:shadow-lg hover:border-primary/50 transition-all">
                                <div className={cn("p-3 rounded-md", cat.color)}>
                                    <cat.icon className="w-6 h-6" />
                                </div>
                                <h3 className="font-semibold">{cat.name}</h3>
                                <ChevronRight className="ml-auto text-muted-foreground" />
                            </Card>
                        </Link>
                    ))}
                </div>
            </section>
            
            <section className="mb-12">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="font-headline text-2xl font-bold">অ্যাপারেল</h2>
                    <Button variant="link" asChild><Link href="/store?category=Apparel">সব দেখুন <ArrowRight className="ml-2 h-4 w-4"/></Link></Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {products.filter(p => p.category === 'Apparel').slice(0, 4).map(p => <HorizontalProductCard key={p.id} product={p} />)}
                </div>
            </section>
            
            <ProductSection title="স্টেশনারি" productCategory="Stationery" viewAllLink="/store?category=Stationery" />
            <ProductSection title="পেন" productCategory="Pen" viewAllLink="/store?category=Pen" />
            <ProductSection title="ই-বুক" productCategory="E-Book" viewAllLink="/store?category=E-Book" />

            <section>
                 <div className="relative bg-blue-900 text-white p-8 rounded-lg grid md:grid-cols-2 items-center gap-6 overflow-hidden">
                    <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-blue-800/50 rounded-full"></div>
                    <div className="relative z-10">
                        <h3 className="font-headline text-2xl font-bold"> ৬ষ্ঠ থেকে SSC পরীক্ষা এবং এডমিশন বিষয়ভিত্তিক সমাধান</h3>
                        <p className="mt-2 text-blue-200">তোমার প্রয়োজন অনুযায়ী বেছে নাও সেরা কোর্সটি।</p>
                        <Button variant="secondary" asChild className="mt-4">
                            <Link href="/courses">কোর্সগুলো দেখুন <ArrowRight className="ml-2 h-4 w-4" /></Link>
                        </Button>
                    </div>
                    <div className="hidden md:block relative h-48">
                         <Image src="https://placehold.co/300x200.png" alt="Student studying" fill className="object-contain" data-ai-hint="student studying laptop"/>
                    </div>
                 </div>
            </section>
        </div>
    </div>
  )
}
