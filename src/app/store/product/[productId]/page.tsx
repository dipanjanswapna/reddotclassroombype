

import { notFound } from 'next/navigation';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Product } from '@/lib/types';
import { Star, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import { ProductCard } from '../../page';

// Dummy data fetching. In a real application, this would fetch from Firestore.
const getProductById = (id: string): Product | undefined => {
  const products: Product[] = [
    { id: 'prod_tshirt_1', name: 'RDC Original Tee', category: 'T-Shirt', price: 550, oldPrice: 650, imageUrl: 'https://placehold.co/600x600.png', description: 'Comfortable and stylish original t-shirt from Red Dot Classroom. Made with high-quality cotton for all-day wear.', dataAiHint: 't-shirt black' },
    { id: 'prod_tshirt_2', name: 'RDC Classic Hoodie', category: 'Hoodie', price: 1200, oldPrice: 1500, imageUrl: 'https://placehold.co/600x600.png', description: 'Stay warm with the RDC Classic Hoodie. Perfect for chilly days and late-night study sessions.', dataAiHint: 'hoodie black' },
    { id: 'prod_tshirt_3', name: 'RDC Supporter Jersey', category: 'Jersey', price: 800, oldPrice: 950, imageUrl: 'https://placehold.co/600x600.png', description: 'Show your support with the official RDC Jersey. Breathable fabric makes it perfect for any activity.', dataAiHint: 'jersey dark blue' },
    { id: 'prod_book_1', name: 'HSC Physics 1st Paper', category: 'Printed Book', price: 750, imageUrl: 'https://placehold.co/600x600.png', description: 'Comprehensive guide and question bank for HSC Physics 1st Paper. Written by expert educators.', dataAiHint: 'book physics' },
    { id: 'prod_book_2', name: 'Admission Test Question Bank', category: 'Printed Book', price: 900, imageUrl: 'https://placehold.co/600x600.png', description: 'The ultimate question bank to prepare you for university admission tests across various disciplines.', dataAiHint: 'book question bank' },
    { id: 'prod_book_3', name: 'Medical Admission Biology', category: 'Printed Book', price: 850, imageUrl: 'https://placehold.co/600x600.png', description: 'Specialized biology guide for medical admission test aspirants, covering all essential topics.', dataAiHint: 'book biology' },
    { id: 'prod_pdf_1', name: 'SSC Model Tests (PDF)', category: 'PDF Book', price: 150, imageUrl: 'https://placehold.co/600x600.png', description: 'A collection of SSC model tests in PDF format for you to practice and excel in your exams.', dataAiHint: 'ebook pdf' },
    { id: 'prod_pdf_2', name: 'HSC Chemistry Notes (PDF)', category: 'PDF Book', price: 200, imageUrl: 'https://placehold.co/600x600.png', description: 'Detailed and easy-to-understand chemistry notes for HSC students, available for instant download.', dataAiHint: 'ebook pdf' },
  ];
  return products.find(p => p.id === id);
};

const getRelatedProducts = (currentProduct?: Product): Product[] => {
    const products: Product[] = [
        { id: 'prod_tshirt_1', name: 'RDC Original Tee', category: 'T-Shirt', price: 550, oldPrice: 650, imageUrl: 'https://placehold.co/400x400.png', dataAiHint: 't-shirt black' },
        { id: 'prod_book_1', name: 'HSC Physics 1st Paper', category: 'Printed Book', price: 750, imageUrl: 'https://placehold.co/400x400.png', dataAiHint: 'book physics' },
        { id: 'prod_tshirt_2', name: 'RDC Classic Hoodie', category: 'Hoodie', price: 1200, oldPrice: 1500, imageUrl: 'https://placehold.co/400x400.png', dataAiHint: 'hoodie black' },
        { id: 'prod_book_2', name: 'Admission Test Question Bank', category: 'Printed Book', price: 900, imageUrl: 'https://placehold.co/400x400.png', dataAiHint: 'book question bank' },
    ];
    if (!currentProduct) return products;
    return products.filter(p => p.category === currentProduct.category && p.id !== currentProduct.id);
}


export default function ProductDetailPage({ params }: { params: { productId: string } }) {
  const product = getProductById(params.productId);
  const relatedProducts = getRelatedProducts(product);

  if (!product) {
    notFound();
  }

  return (
    <div className="bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4 py-12">
            <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg">
                    <Image src={product.imageUrl} alt={product.name} width={600} height={600} className="w-full object-cover rounded-md aspect-square" data-ai-hint={product.dataAiHint} />
                </div>
                <div>
                    <Badge variant="secondary" className="mb-2">{product.category}</Badge>
                    <h1 className="font-headline text-3xl font-bold">{product.name}</h1>
                    <div className="flex items-center gap-2 mt-2">
                        <div className="flex items-center">
                            {[...Array(5)].map((_, i) => <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />)}
                        </div>
                        <span className="text-sm text-muted-foreground">(15 Reviews)</span>
                    </div>

                    <div className="my-6">
                        <div className="flex items-baseline gap-3">
                            <p className="text-4xl font-bold text-primary">৳{product.price}</p>
                            {product.oldPrice && <p className="text-2xl text-muted-foreground line-through">৳{product.oldPrice}</p>}
                        </div>
                         <p className="text-sm text-muted-foreground mt-1">VAT included</p>
                    </div>
                    
                    <p className="text-muted-foreground mb-6">{product.description}</p>
                    
                    <Card className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
                        <CardContent className="p-4 flex items-center gap-3">
                            <ShieldCheck className="w-8 h-8 text-green-600" />
                            <div>
                                <h4 className="font-semibold text-green-800 dark:text-green-200">100% Original Product</h4>
                                <p className="text-xs text-green-700 dark:text-green-300">Guaranteed authentic products from RDC.</p>
                            </div>
                        </CardContent>
                    </Card>

                    <Button size="lg" className="w-full mt-6">Add to Cart</Button>
                </div>
            </div>

            {relatedProducts.length > 0 && (
                <section className="mt-16">
                    <h2 className="font-headline text-2xl font-bold mb-6">Related Products</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                        {relatedProducts.map(p => <ProductCard key={p.id} product={p} />)}
                    </div>
                </section>
            )}
        </div>
    </div>
  );
}
