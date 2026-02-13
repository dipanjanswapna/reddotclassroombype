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
import { t } from '@/lib/i18n';
import { cn } from '@/lib/utils';

type Language = 'en' | 'bn';

export async function generateMetadata({ params }: { params: { productId: string } }): Promise<Metadata> {
  const awaitedParams = await params;
  const product = await getProduct(awaitedParams.productId);

  if (!product || !product.isPublished) {
    return {
      title: 'Product Not Found',
    };
  }

  return {
    title: `${product.name} | RDC Store`,
    description: product.description || `Buy ${product.name} from the official Red Dot Classroom store.`,
    openGraph: {
      images: [product.imageUrl],
    },
  };
}

/**
 * @fileOverview Localized Product Detail Page
 * Standardized reduced spacing.
 */
export default async function ProductDetailPage({ params }: { params: { locale: string; productId: string } }) {
  const awaitedParams = await params;
  const { productId, locale } = awaitedParams;
  const language = (locale as Language) || 'en';
  const isBn = language === 'bn';
  
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
  ).slice(0, 5);

  const getT = (key: string) => t[key]?.[language] || t[key]?.['en'] || key;

  return (
    <div className={cn("bg-transparent pb-20 px-1", isBn && "font-bengali")}>
        {/* Breadcrumb */}
        <div className="container mx-auto px-4 py-4 md:py-6">
            <Button asChild variant="ghost" size="sm" className="rounded-xl font-black uppercase text-[10px] tracking-widest gap-2 text-muted-foreground hover:text-primary">
                <Link href={`/${language}/store`}>
                    <ChevronLeft className="w-4 h-4" />
                    {getT('back_to_home')}
                </Link>
            </Button>
        </div>

        <div className="container mx-auto px-1 space-y-12 md:space-y-16">
            {/* Main Product Info */}
            <section className="py-0">
                <ProductClientPage product={product} />
            </section>

            {/* Reviews Section */}
            <section className="py-0 px-1">
                <div className="flex items-center gap-3 mb-8 border-l-4 border-primary pl-4">
                    <h2 className="font-headline text-2xl md:text-3xl font-black uppercase tracking-tight">{getT('customer_feedback')}</h2>
                </div>
                <ProductReviewSystem product={product} />
            </section>

            {/* Related Products */}
            {relatedProducts.length > 0 && (
                 <section className="py-0 px-1">
                    <div className="flex items-center justify-between mb-8 border-l-4 border-primary pl-4">
                        <div className="text-left">
                            <h2 className="font-headline text-2xl md:text-3xl font-black uppercase tracking-tight">{getT('similar_items')}</h2>
                            <p className="text-[10px] md:text-xs font-bold text-muted-foreground uppercase tracking-widest mt-1">Recommended for you</p>
                        </div>
                        <div className="bg-primary/10 p-2 rounded-xl hidden sm:block">
                            <ShoppingBag className="w-6 h-6 text-primary" />
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6 px-1">
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