
'use client';

import { notFound, useParams } from 'next/navigation';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Product } from '@/lib/types';
import { Star, ShieldCheck, CheckCircle, Video, BookOpen } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { getProduct } from '@/lib/firebase/firestore';
import { LoadingSpinner } from '@/components/loading-spinner';

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


const productSpecs = [
    { icon: <BookOpen className="w-5 h-5"/>, title: 'Display', value: 'Natural Textbook Display with 2 lines x 16 characters' },
    { icon: <BookOpen className="w-5 h-5"/>, title: 'Power Supply', value: 'Solar + Battery (1 x LR44)' },
    { icon: <BookOpen className="w-5 h-5"/>, title: 'Dimensions', value: '11.1 x 77 x 165.5 mm' },
    { icon: <BookOpen className="w-5 h-5"/>, title: 'Weight', value: '90g' },
    { icon: <BookOpen className="w-5 h-5"/>, title: 'Functions', value: '552 built-in functions' },
    { icon: <BookOpen className="w-5 h-5"/>, title: 'Memory', value: '9 variables' },
    { icon: <BookOpen className="w-5 h-5"/>, title: 'Warranty', value: '3 Years Official Warranty' },
    { icon: <BookOpen className="w-5 h-5"/>, title: 'QR Code', value: 'QR Code to prove the case transfer' },
];

const additionalBenefits = [
    { icon: <BookOpen className="w-5 h-5"/>, title: 'Free NFC Card', description: 'Get a complimentary NFC card for quick access to calculator features and shortcuts.' },
    { icon: <BookOpen className="w-5 h-5"/>, title: 'Video Lecture', description: 'Access comprehensive video tutorials covering basic usage and advanced techniques.' },
    { icon: <BookOpen className="w-5 h-5"/>, title: 'Calculator Hacks', description: 'Learn time-saving tricks and hidden features to maximize your calculator\'s potential.' },
    { icon: <BookOpen className="w-5 h-5"/>, title: 'Usage Guide', description: 'Detailed step-by-step guide for all calculator functions and operations.' },
];


export default function ProductDetailPage() {
  const params = useParams();
  const productId = params.productId as string;
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
      if (!productId) return;
      const fetchProduct = async () => {
          try {
              const fetchedProduct = await getProduct(productId);
              if (fetchedProduct) {
                  setProduct(fetchedProduct);
              } else {
                  notFound();
              }
          } catch (error) {
              console.error("Failed to fetch product:", error);
              notFound();
          } finally {
              setLoading(false);
          }
      };
      fetchProduct();
  }, [productId]);

  if (loading) {
      return <div className="flex h-screen items-center justify-center"><LoadingSpinner /></div>
  }

  if (!product) {
    notFound();
  }

  return (
    <div className="bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4 py-12">
            <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
                <div>
                     <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md mb-4 sticky top-20">
                        <Image src={product.imageUrl} alt={product.name} width={600} height={600} className="w-full object-cover rounded-md aspect-square" data-ai-hint={product.dataAiHint} />
                    </div>
                </div>
                <div>
                    <h1 className="font-headline text-2xl font-bold">{product.name}</h1>
                    <p className="text-sm text-muted-foreground mt-1">By CASIO</p>
                    
                    <div className="my-4">
                        <Button variant="outline" size="sm">যাচাই করুন</Button>
                    </div>

                    <div className="flex gap-2">
                        <Badge variant="outline" className="border-orange-400 text-orange-600">0 Year Warranty</Badge>
                        <Badge variant="outline" className="border-green-400 text-green-600">In Stock</Badge>
                    </div>

                    <div className="my-4">
                        <div className="flex items-baseline gap-3">
                            <p className="text-3xl font-bold text-primary">৳{product.price}</p>
                            {product.oldPrice && <p className="text-xl text-muted-foreground line-through">৳{product.oldPrice}</p>}
                        </div>
                    </div>
                    
                    <Button size="lg" className="w-full bg-green-600 hover:bg-green-700">Buy Now</Button>
                </div>
            </div>
            
            <div className="mt-12">
                <div className="aspect-video">
                    <iframe
                        className="w-full h-full rounded-lg"
                        src="https://www.youtube.com/embed/dQw4w9WgXcQ"
                        title="Product Video"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        allowFullScreen
                    ></iframe>
                </div>
            </div>
            
            <section className="mt-12">
                <h2 className="font-headline text-2xl font-bold text-center mb-6">Product Specifications</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {productSpecs.map(spec => (
                        <div key={spec.title} className="p-4 rounded-lg flex items-start gap-4" style={{background: 'linear-gradient(90deg, #e0f7fa 0%, #e8f5e9 100%)'}}>
                            <div className="bg-white p-2 rounded-full text-blue-500">{spec.icon}</div>
                            <div>
                                <h4 className="font-semibold">{spec.title}</h4>
                                <p className="text-sm text-muted-foreground">{spec.value}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </section>
            
            <section className="mt-12">
                <h2 className="font-headline text-2xl font-bold text-center mb-6">Exclusive Additional Benefits</h2>
                 <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        {additionalBenefits.map(benefit => (
                            <div key={benefit.title} className="flex items-start gap-4">
                                <div className="p-3 rounded-full text-white" style={{background: 'linear-gradient(45deg, #f8bbd0, #ce93d8)'}}>{benefit.icon}</div>
                                <div>
                                    <h4 className="font-semibold">{benefit.title}</h4>
                                    <p className="text-sm text-muted-foreground">{benefit.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                     <div className="mt-6 pt-4 border-t text-center font-semibold text-primary">
                        <CheckCircle className="inline-block mr-2"/>
                        3 Years Warranty Included!
                    </div>
                </div>
            </section>
            
             <section className="mt-12">
                <h2 className="font-headline text-2xl font-bold mb-6">শিক্ষার্থীদের রিভিউ</h2>
                <div className="text-center py-8 bg-muted rounded-lg">
                    <p className="text-muted-foreground">No reviews yet.</p>
                </div>
            </section>

        </div>
    </div>
  );
}
