

import { notFound } from 'next/navigation';
import { getProduct, getProducts } from '@/lib/firebase/firestore';
import type { Metadata } from 'next';
import { ProductClientPage } from '@/components/product-client-page';
import { Card } from '@/components/ui/card';
import Image from 'next/image';
import Link from 'next/link';
import { ProductReviewSystem } from '@/components/product-review-system';

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

  const allProducts = await getProducts();
  const relatedProducts = allProducts.filter(
      p => p.isPublished && p.category === product.category && p.id !== product.id
  ).slice(0, 4);

  return (
    <div className="bg-gray-50 dark:bg-gray-900 py-8 md:py-12">
        <div className="container mx-auto px-4">
            <ProductClientPage product={product} />

            <div className="mt-12">
                <ProductReviewSystem product={product} />
            </div>

            {relatedProducts.length > 0 && (
                 <section className="mt-16">
                    <h2 className="font-headline text-3xl font-bold mb-6 text-center">Related Products</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {relatedProducts.map(p => (
                            <Card key={p.id} className="overflow-hidden group">
                                <Link href={`/store/product/${p.id}`} className="block">
                                    <div className="p-0">
                                    <div className="relative aspect-square">
                                        <Image
                                        src={p.imageUrl}
                                        alt={p.name}
                                        fill
                                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                                        />
                                    </div>
                                    </div>
                                    <div className="p-4">
                                    <p className="text-xs text-muted-foreground">{p.category}</p>
                                    <h3 className="font-semibold truncate group-hover:text-primary">{p.name}</h3>
                                    <div className="flex items-center gap-2 mt-2">
                                        <p className="text-lg font-bold text-primary">৳{p.price}</p>
                                        {p.oldPrice && (
                                        <p className="text-sm text-muted-foreground line-through">৳{p.oldPrice}</p>
                                        )}
                                    </div>
                                    </div>
                                </Link>
                            </Card>
                        ))}
                    </div>
                </section>
            )}
        </div>
    </div>
  );
}


