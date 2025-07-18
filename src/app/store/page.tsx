
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Product } from '@/lib/types';
import { ArrowRight, ChevronRight, Book, Tally4, Shirt, Pen } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

// Dummy data for products. In a real application, this would come from Firestore.
const products: Product[] = [
  // T-Shirts
  { id: 'prod_tshirt_1', name: 'RDC Original Tee', category: 'T-Shirt', price: 550, oldPrice: 650, imageUrl: 'https://placehold.co/400x400.png', dataAiHint: 't-shirt black' },
  { id: 'prod_tshirt_2', name: 'RDC Classic Hoodie', category: 'Hoodie', price: 1200, oldPrice: 1500, imageUrl: 'https://placehold.co/400x400.png', dataAiHint: 'hoodie black' },
  { id: 'prod_tshirt_3', name: 'RDC Supporter Jersey', category: 'Jersey', price: 800, oldPrice: 950, imageUrl: 'https://placehold.co/400x400.png', dataAiHint: 'jersey dark blue' },
  // Printed Books
  { id: 'prod_book_1', name: 'HSC Physics 1st Paper', category: 'Printed Book', price: 750, imageUrl: 'https://placehold.co/400x400.png', dataAiHint: 'book physics' },
  { id: 'prod_book_2', name: 'Admission Test Question Bank', category: 'Printed Book', price: 900, imageUrl: 'https://placehold.co/400x400.png', dataAiHint: 'book question bank' },
  { id: 'prod_book_3', name: 'Medical Admission Biology', category: 'Printed Book', price: 850, imageUrl: 'https://placehold.co/400x400.png', dataAiHint: 'book biology' },
  // PDF Books
  { id: 'prod_pdf_1', name: 'SSC Model Tests (PDF)', category: 'PDF Book', price: 150, imageUrl: 'https://placehold.co/400x400.png', dataAiHint: 'ebook pdf' },
  { id: 'prod_pdf_2', name: 'HSC Chemistry Notes (PDF)', category: 'PDF Book', price: 200, imageUrl: 'https://placehold.co/400x400.png', dataAiHint: 'ebook pdf' },
];

const categories = [
    { name: "RDC'র কোর্স", icon: Book, href: "/courses" },
    { name: "টি-শার্ট", icon: Shirt, href: "/store?category=T-Shirt" },
    { name: "PDF বই", icon: Book, href: "/store?category=PDF+Book" },
    { name: "প্রিন্টেড বই", icon: Tally4, href: "/store?category=Printed+Book" }
];

const ProductCard = ({ product }: { product: Product }) => (
    <Link href={`/store/product/${product.id}`} className="group">
        <Card className="overflow-hidden transition-all hover:shadow-lg">
            <CardHeader className="p-0">
                <div className="aspect-square bg-muted flex items-center justify-center">
                    <Image src={product.imageUrl} alt={product.name} width={400} height={400} className="object-cover group-hover:scale-105 transition-transform" data-ai-hint={product.dataAiHint} />
                </div>
            </CardHeader>
            <CardContent className="p-3">
                <h3 className="font-semibold truncate">{product.name}</h3>
                <div className="flex items-baseline gap-2 mt-1">
                    <p className="text-primary font-bold">৳{product.price}</p>
                    {product.oldPrice && <p className="text-sm text-muted-foreground line-through">৳{product.oldPrice}</p>}
                </div>
            </CardContent>
        </Card>
    </Link>
);


export default function RdcStorePage() {
  return (
    <div className="bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4 py-8 space-y-12">
            {/* Top Banner */}
            <div className="bg-blue-100 dark:bg-blue-900/30 rounded-lg p-6 grid md:grid-cols-2 items-center gap-4">
                <div className="flex items-center gap-4">
                     <div className="hidden sm:block">
                        <Image src="https://placehold.co/100x100.png" alt="Programs" width={100} height={100} data-ai-hint="school academic admission" />
                     </div>
                     <div>
                        <h2 className="font-headline text-2xl font-bold text-blue-800 dark:text-blue-200">৬ষ্ঠ শ্রেণি থেকে এডমিশন প্রস্তুতি পর্যন্ত</h2>
                        <p className="text-blue-700 dark:text-blue-300">সকল কোর্সে ভর্তি চলছে</p>
                     </div>
                </div>
                <div className="flex md:justify-end">
                    <Button asChild>
                        <Link href="/courses">বিস্তারিত জানতে ক্লিক করুন <ChevronRight className="ml-2 h-4 w-4" /></Link>
                    </Button>
                </div>
            </div>

            {/* Categories */}
            <section>
                <h2 className="font-headline text-2xl font-bold mb-4 text-center">শপ ক্যাটাগরি</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {categories.map(category => {
                        const Icon = category.icon;
                        return (
                            <Link key={category.name} href={category.href}>
                                <Card className="p-4 flex items-center justify-between hover:border-primary hover:bg-primary/5 transition-colors">
                                    <div>
                                        <p className="font-semibold">{category.name}</p>
                                    </div>
                                    <Icon className="h-8 w-8 text-primary" />
                                </Card>
                            </Link>
                        )
                    })}
                </div>
            </section>
            
            {/* Product Sections */}
            <section>
                 <div className="flex justify-between items-center mb-4">
                    <h2 className="font-headline text-2xl font-bold">প্রিন্টেড বই</h2>
                    <Button variant="link" asChild><Link href="/store?category=Printed+Book">সব দেখুন <ArrowRight className="ml-2 h-4 w-4"/></Link></Button>
                 </div>
                 <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {products.filter(p => p.category === 'Printed Book').slice(0, 5).map(p => <ProductCard key={p.id} product={p} />)}
                 </div>
            </section>
            
            <section>
                 <div className="flex justify-between items-center mb-4">
                    <h2 className="font-headline text-2xl font-bold">টি-শার্ট</h2>
                    <Button variant="link" asChild><Link href="/store?category=T-Shirt">সব দেখুন <ArrowRight className="ml-2 h-4 w-4"/></Link></Button>
                 </div>
                 <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {products.filter(p => p.category === 'T-Shirt' || p.category === 'Hoodie' || p.category === 'Jersey').slice(0, 5).map(p => <ProductCard key={p.id} product={p} />)}
                 </div>
            </section>
            
            <section>
                 <div className="flex justify-between items-center mb-4">
                    <h2 className="font-headline text-2xl font-bold">PDF বই</h2>
                    <Button variant="link" asChild><Link href="/store?category=PDF+Book">সব দেখুন <ArrowRight className="ml-2 h-4 w-4"/></Link></Button>
                 </div>
                 <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {products.filter(p => p.category === 'PDF Book').slice(0, 5).map(p => <ProductCard key={p.id} product={p} />)}
                 </div>
            </section>

             {/* Bottom Banner */}
             <div className="bg-gray-800 text-white rounded-lg p-8 grid md:grid-cols-2 items-center gap-8">
                 <div className="text-center md:text-left">
                     <h2 className="font-headline text-3xl font-bold">৬ষ্ঠ শ্রেণি থেকে SSC-HSC পরীক্ষা এবং এডমিশন প্রিপারেশনের জন্য</h2>
                     <p className="mt-2 text-gray-300">RDC'র কোর্সগুলো ভিজিট করুন।</p>
                 </div>
                 <div className="flex flex-col items-center md:items-end">
                    <Image src="https://placehold.co/150x150.png" alt="Student studying" width={150} height={150} className="rounded-full mb-4" data-ai-hint="student cartoon study" />
                    <Button variant="outline" className="bg-transparent border-white text-white hover:bg-white hover:text-black">
                        <Link href="/courses">কোর্সগুলো ভিজিট করুন</Link>
                    </Button>
                 </div>
             </div>

        </div>
    </div>
  )
}

    