

'use client';

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import { ProductCard } from '@/components/product-card';
import type { Product, Organization } from '@/lib/types';

export function ProductCarousel({ products, providers }: { products: Product[], providers?: Organization[] }) {
  if (!products || products.length === 0) {
    return null;
  }

  return (
    <Carousel opts={{ align: 'start', loop: products.length > 4 }}>
      <CarouselContent className="-ml-4">
        {products.map((product) => {
           const provider = providers?.find(p => p.id === product.sellerId);
           return (
              <CarouselItem key={product.id} className="md:basis-1/2 lg:basis-1/4 pl-4">
                <ProductCard product={product} provider={provider}/>
              </CarouselItem>
          )
        })}
      </CarouselContent>
      <CarouselPrevious className="hidden md:flex"/>
      <CarouselNext className="hidden md:flex"/>
    </Carousel>
  );
}
