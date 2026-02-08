
import { notFound } from 'next/navigation';
import { getProduct, getProducts, getOrganizations } from '@/lib/firebase/firestore';
import type { Metadata } from 'next';
import { ProductClientPage } from '@/components/product-client-page';
import { Card } from '@/components/ui/card';
import Image from 'next/image';
import Link from 'next/link';
import { ProductReviewSystem } from '@/components/product-review-system';
import { ProductCard } from '@/components/product-card';

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
  ).slice(0, 4);

  return (
    <div className="bg-background py-10 md:py-14 max-w-full overflow-hidden">
        <div className="container mx-auto px-4 md:px-8">
            <ProductClientPage product={product} />

            <div className="mt-16">
                <ProductReviewSystem product={product} />
            </div>

            {relatedProducts.length > 0 && (
                 <section className="mt-20 border-t border-primary/5 pt-16">
                    <div className="text-center mb-10 space-y-2">
                        <h2 className="font-headline text-3xl font-black uppercase tracking-tight text-green-700 dark:text-green-500">Related Products</h2>
                        <div className="h-1.5 w-24 bg-primary mx-auto rounded-full shadow-md" />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
                        {relatedProducts.map(p => {
                            const provider = allOrgs.find(o => o.id === p.sellerId);
                            return (
                                <ProductCard key={p.id} product={p} provider={provider} />
                            )
                        })}
                    </div>
                </section>
            )}
        </div>
    </div>
  );
}
