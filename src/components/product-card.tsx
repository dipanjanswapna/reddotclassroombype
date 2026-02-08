
'use client';

import React, { useState } from 'react';
import Image from "next/image";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Product, Organization } from "@/lib/types";
import { Button } from "./ui/button";
import { useCart } from '@/context/cart-context';
import { useToast } from './ui/use-toast';
import { ShoppingCart } from 'lucide-react';
import { cn } from '@/lib/utils';

type ProductCardProps = {
  product: Product;
  provider?: Organization | null;
  className?: string;
};

const ProductCardComponent = ({ product, provider, className }: ProductCardProps) => {
    const { addToCart } = useCart();
    const { toast } = useToast();
    const [isImageLoading, setIsImageLoading] = useState(true);

    const handleAddToCart = (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      addToCart({
        id: product.id!,
        name: product.name,
        price: product.price,
        quantity: 1,
        imageUrl: product.imageUrl,
      });
      toast({
          title: "Added to Cart!",
          description: `"${product.name}" has been added to your cart.`,
      });
    };
  
  if (!product.id || !product.name || !product.imageUrl) {
    return null;
  }
  
  return (
    <div className="h-full w-full">
      <Card className={cn(
          "overflow-hidden group flex flex-col h-full transition-all duration-500 border border-primary/20 hover:border-primary/60 bg-gradient-to-br from-card to-secondary/30 dark:from-card dark:to-primary/10 shadow-lg hover:shadow-xl rounded-2xl",
          className
      )}>
          <Link href={`/store/product/${product.id}`} className="block flex flex-col flex-grow">
          <CardHeader className="p-0 overflow-hidden bg-muted">
              <div className={cn(
                  "relative aspect-square overflow-hidden",
                  isImageLoading && "animate-pulse"
              )}>
              <Image
                  src={product.imageUrl}
                  alt={product.name}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  className={cn(
                    "object-cover transition-all duration-700 group-hover:scale-110",
                    isImageLoading ? "scale-105 blur-lg grayscale opacity-50" : "scale-100 blur-0 grayscale-0 opacity-100"
                  )}
                  onLoadingComplete={() => setIsImageLoading(false)}
                  data-ai-hint={product.dataAiHint || 'product image'}
              />
              </div>
          </CardHeader>
          <CardContent className="p-4 flex flex-col flex-grow">
              <p className="text-xs font-black text-primary/60 uppercase tracking-[0.2em] mb-1">{product.category}</p>
              <h3 className="font-bold text-sm leading-tight group-hover:text-primary transition-colors line-clamp-2 flex-grow">{product.name}</h3>
              {provider && (
                  <div className="flex items-center gap-2 mt-2">
                      <Image src={provider.logoUrl} alt={provider.name} width={16} height={16} className="rounded-full bg-muted object-contain"/>
                      <p className="text-[10px] text-muted-foreground">By {provider.name}</p>
                  </div>
              )}
              <div className="flex items-center justify-between gap-2 mt-4">
              <div className="flex flex-col">
                  {product.oldPrice && (
                  <p className="text-[10px] text-muted-foreground line-through">৳{product.oldPrice}</p>
                  )}
                  <p className="text-base font-black text-primary">৳{product.price}</p>
              </div>
              <Button size="sm" onClick={handleAddToCart} aria-label={`Add ${product.name} to cart`} className="shadow-md active:shadow-inner transition-all h-9 px-3 rounded-xl text-xs">
                  <ShoppingCart className="h-3.5 w-3.5"/>
                  <span className="ml-1.5 hidden sm:inline font-bold">Add</span>
              </Button>
              </div>
          </CardContent>
          </Link>
      </Card>
    </div>
  );
}

export const ProductCard = React.memo(ProductCardComponent);
