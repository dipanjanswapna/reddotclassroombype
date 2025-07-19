

import { notFound } from 'next/navigation';
import { getProduct } from '@/lib/firebase/firestore';
import type { Metadata } from 'next';
import { ProductClientPage } from './product-client-page';

export async function generateMetadata({ params }: { params: { productId: string } }): Promise<Metadata> {
  const product = await getProduct(params.productId);

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
      description: product.description,
      images: [product.imageUrl],
    },
  };
}

export default async function ProductDetailPage({ params }: { params: { productId: string } }) {
  const product = await getProduct(params.productId);

  if (!product || !product.isPublished) {
    notFound();
  }

  return <ProductClientPage product={product} />;
}
