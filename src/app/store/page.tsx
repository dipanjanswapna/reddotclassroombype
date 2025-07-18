
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Product } from '@/lib/types';
import { ArrowRight, ChevronRight, Book, Tally4, Shirt, Pen, Filter } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { Checkbox } from '@/components/ui/checkbox';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

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
  // Stationery
  { id: 'prod_pen_1', name: 'RDC Premium Gel Pen', category: 'Pen', price: 50, imageUrl: 'https://placehold.co/400x400.png', dataAiHint: 'pen black' },
  { id: 'prod_notebook_1', name: 'RDC Hardcover Notebook', category: 'Notebook', price: 250, imageUrl: 'https://placehold.co/400x400.png', dataAiHint: 'notebook journal' },
];

const categories = [
    { name: "টি-শার্ট", icon: Shirt, href: "/store?category=T-Shirt" },
    { name: "PDF বই", icon: Book, href: "/store?category=PDF+Book" },
    { name: "প্রিন্টেড বই", icon: Book, href: "/store?category=Printed+Book" },
    { name: "স্টেশনারি", icon: Pen, href: "/store?category=Stationery" },
];

const FilterSidebar = () => (
    <div className="w-full lg:w-64 xl:w-72">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2"><Filter className="w-5 h-5"/> ফিল্টার করুন</h3>
        <Accordion type="multiple" defaultValue={['স্তর', 'বিভাগ', 'শ্রেণী', 'বিষয়']} className="w-full">
            <AccordionItem value="স্তর">
                <AccordionTrigger>স্তর</AccordionTrigger>
                <AccordionContent className="space-y-2">
                    <div className="flex items-center space-x-2"><Checkbox id="hsc" /><label htmlFor="hsc" className="text-sm">HSC</label></div>
                    <div className="flex items-center space-x-2"><Checkbox id="admission" /><label htmlFor="admission" className="text-sm">এডমিশন</label></div>
                </AccordionContent>
            </AccordionItem>
            <AccordionItem value="বিভাগ">
                <AccordionTrigger>বিভাগ</AccordionTrigger>
                <AccordionContent className="space-y-2">
                    <div className="flex items-center space-x-2"><Checkbox id="science" /><label htmlFor="science" className="text-sm">বিজ্ঞান</label></div>
                    <div className="flex items-center space-x-2"><Checkbox id="arts" /><label htmlFor="arts" className="text-sm">মানবিক</label></div>
                    <div className="flex items-center space-x-2"><Checkbox id="commerce" /><label htmlFor="commerce" className="text-sm">ব্যবসায় শিক্ষা</label></div>
                </AccordionContent>
            </AccordionItem>
            <AccordionItem value="শ্রেণী">
                <AccordionTrigger>শ্রেণী</AccordionTrigger>
                <AccordionContent className="space-y-2">
                     <div className="flex items-center space-x-2"><Checkbox id="class-9" /><label htmlFor="class-9" className="text-sm">৯ম</label></div>
                     <div className="flex items-center space-x-2"><Checkbox id="class-10" /><label htmlFor="class-10" className="text-sm">১০ম</label></div>
                </AccordionContent>
            </AccordionItem>
             <AccordionItem value="বিষয়">
                <AccordionTrigger>বিষয়</AccordionTrigger>
                <AccordionContent className="space-y-2">
                     <div className="flex items-center space-x-2"><Checkbox id="physics" /><label htmlFor="physics" className="text-sm">পদার্থবিজ্ঞান</label></div>
                     <div className="flex items-center space-x-2"><Checkbox id="chemistry" /><label htmlFor="chemistry" className="text-sm">রসায়ন</label></div>
                </AccordionContent>
            </AccordionItem>
        </Accordion>
    </div>
);


export const ProductCard = ({ product }: { product: Product }) => (
    <Link href={`/store/product/${product.id}`} className="group">
        <Card className="overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
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
            </CardContent>
        </Card>
    </Link>
);


export default function RdcStorePage() {
  return (
    <div className="bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4 py-8">
             <div className="bg-blue-100 dark:bg-blue-900/30 rounded-lg p-6 grid md:grid-cols-2 items-center gap-4 mb-8">
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

            <div className="flex flex-col lg:flex-row gap-8">
                <aside className="lg:w-1/4">
                    <FilterSidebar />
                </aside>
                <main className="flex-1">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="font-headline text-2xl font-bold">প্রিন্টেড বই</h2>
                        <Button variant="link" asChild><Link href="/store?category=Printed+Book">সব দেখুন <ArrowRight className="ml-2 h-4 w-4"/></Link></Button>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                        {products.filter(p => p.category === 'Printed Book').map(p => <ProductCard key={p.id} product={p} />)}
                    </div>
                </main>
            </div>
        </div>
    </div>
  )
}
