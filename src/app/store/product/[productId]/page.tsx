import { notFound } from 'next/navigation';
import { getProduct, getProducts, getOrganizations } from '@/lib/firebase/firestore';
import type { Metadata } from 'next';
import { ProductClientPage } from '@/components/product-client-page';
import { Card } from '@/components/ui/card';
import Image from 'next/image';
import Link from 'next/link';
import { ProductReviewSystem } from '@/components/product-review-system';
import { ProductCard } from '@/components/product-card';
import { ChevronLeft, ShoppingBag, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

export async function generateMetadata({ params }: { params: { productId: string } }): Promise<Metadata> {
  const { productId } = params;
  const product = await getProduct(productId);

  if (!product || !product.isPublished) {
    return {
      title: 'Product Not Found',
    };
  }

  return {
    title: `${product.name} | RDC Store`,
    description: product.description || `Buy ${product.name} from the official Red Dot Classroom store.`,
    openGraph: {
      title: product.name,
      description: product.description || '',
      images: [product.imageUrl],
    },
  };
}

/**
 * @fileOverview Refined Product Detail Page with px-1 consistency and Related Products.
 */
export default async function ProductDetailPage({ params }: { params: { productId: string } }) {
  const { productId } = params;
  const product = await getProduct(productId);

  if (!product || !product.isPublished) {
    notFound();
  }

  const [allProducts, allOrgs] = await Promise.all([
      getProducts(),
      getOrganizations()
  ]);

  const relatedProducts = allProducts.filter(
      p => p.isPublished && p.category === product.category && p.id !== product.id
  ).slice(0, 5); // 5 for the desktop row

  return (
    <div className="bg-transparent pb-20">
        {/* Navigation Breadcrumb */}
        <div className="container mx-auto px-4 py-4 md:py-6">
            <Button asChild variant="ghost" size="sm" className="rounded-xl font-black uppercase text-[10px] tracking-widest gap-2 text-muted-foreground hover:text-primary">
                <Link href="/store">
                    <ChevronLeft className="w-4 h-4" />
                    Back to Store Hub
                </Link>
            </Button>
        </div>

        <div className="container mx-auto px-1 space-y-16">
            {/* Main Product Info */}
            <section className="py-0">
                <ProductClientPage product={product} />
            </section>

            {/* Reviews Section */}
            <section className="py-0 px-1">
                <div className="flex items-center gap-3 mb-8 border-l-4 border-primary pl-4">
                    <h2 className="font-headline text-2xl md:text-3xl font-black uppercase tracking-tight">Customer <span className="text-primary">Feedback</span></h2>
                </div>
                <ProductReviewSystem product={product} />
            </section>

            {/* Related Products Grid - 5 columns on desktop */}
            {relatedProducts.length > 0 && (
                 <section className="py-0 px-1">
                    <div className="flex items-center justify-between mb-8 border-l-4 border-primary pl-4">
                        <div className="text-left">
                            <h2 className="font-headline text-2xl md:text-3xl font-black uppercase tracking-tight">You May <span className="text-primary">Also Like</span></h2>
                            <p className="text-[10px] md:text-xs font-bold text-muted-foreground uppercase tracking-widest mt-1">Recommended for your academic journey</p>
                        </div>
                        <div className="bg-primary/10 p-2 rounded-xl hidden sm:block">
                            <ShoppingBag className="w-6 h-6 text-primary" />
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-5 px-1">
                        {relatedProducts.map(p => {
                            const provider = allOrgs.find(o => o.id === p.sellerId);
                            return <ProductCard key={p.id} product={p} provider={provider} />;
                        })}
                    </div>
                </section>
            )}
        </div>
    </div>
  );
}
