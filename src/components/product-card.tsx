'use client';

import React from 'react';
import Image from "next/image";
import Link from "next/link";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Product, Organization } from "@/lib/types";
import { Button } from "./ui/button";
import { useCart } from '@/context/cart-context';
import { useToast } from './ui/use-toast';
import { ShoppingCart, Star } from 'lucide-react';
import { cn } from '@/lib/utils';

type ProductCardProps = {
  product: Product;
  provider?: Organization | null;
};

/**
 * @fileOverview ProductCard Component.
 * Optimized for 5-column desktop grid with px-1 and 20px rounding.
 * Static look with sky blue theme color rgb(194, 231, 255).
 */
const ProductCardComponent = ({ product, provider }: ProductCardProps) => {
    const { addToCart } = useCart();
    const { toast } = useToast();

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
          description: `"${product.name}" has been added.`,
      });
    };
  
  if (!product.id || !product.name || !product.imageUrl) {
    return null;
  }
  
  return (
    <Card className={cn(
        "group flex flex-col h-full overflow-hidden shadow-xl border-primary/10 rounded-[20px] p-2 md:p-3",
        "transition-all duration-300"
    )} style={{ backgroundColor: 'rgb(194, 231, 255)' }}>
        <Link href={`/store/product/${product.id}`} className="block flex flex-col flex-grow outline-none">
            {/* Image Container */}
            <CardHeader className="p-0 relative aspect-square overflow-hidden rounded-[16px] shadow-inner bg-black/5">
                <Image
                    src={product.imageUrl}
                    alt={product.name}
                    fill
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 20vw"
                    className="object-cover"
                    data-ai-hint={product.dataAiHint || 'product image'}
                />
                
                {product.oldPrice && (
                    <Badge className="absolute top-2 left-2 bg-red-600 text-white border-none font-black text-[8px] uppercase tracking-tighter shadow-lg">
                        SAVE BDT {(product.oldPrice - product.price).toFixed(0)}
                    </Badge>
                )}
            </CardHeader>

            {/* Body Content */}
            <CardContent className="p-2 md:p-3 pt-3 flex flex-col flex-grow text-left space-y-2">
                <div className="space-y-0.5">
                    <p className="text-[8px] md:text-[9px] font-black uppercase tracking-[0.15em] text-gray-600 truncate opacity-70">
                        {product.category}
                    </p>
                    <h3 className="text-xs md:text-sm font-black leading-tight text-gray-900 line-clamp-2 font-headline uppercase tracking-tight h-[2.4rem]">
                        {product.name}
                    </h3>
                </div>

                {/* Rating & Stock */}
                <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-0.5">
                        <Star className="w-2.5 h-2.5 text-yellow-500 fill-current" />
                        <span className="text-[9px] font-bold text-gray-700">{product.ratings || '4.9'}</span>
                    </div>
                    {product.stock && product.stock < 10 && product.stock > 0 && (
                        <span className="text-[8px] font-black text-red-600 uppercase tracking-tighter bg-red-50 px-1.5 py-0.5 rounded border border-red-100">Only {product.stock} Left</span>
                    )}
                </div>

                {/* Price Area */}
                <div className="pt-2 border-t border-black/5 flex items-end justify-between mt-auto">
                    <div className="flex flex-col">
                        {product.oldPrice && (
                            <span className="text-[9px] font-bold text-gray-500 line-through decoration-primary/30 leading-none">
                                ৳{product.oldPrice}
                            </span>
                        )}
                        <span className="text-[15px] md:text-lg font-black text-primary tracking-tighter leading-none mt-0.5">
                            ৳{product.price}
                        </span>
                    </div>
                    
                    <Button 
                        size="icon" 
                        onClick={handleAddToCart} 
                        className="h-9 w-9 md:h-10 md:w-10 rounded-xl bg-primary text-white shadow-lg active:scale-90 transition-transform"
                        aria-label={`Add ${product.name} to cart`}
                    >
                        <ShoppingCart className="h-4 w-4 md:h-5 md:w-5" />
                    </Button>
                </div>
            </CardContent>
        </Link>
    </Card>
  );
}

export const ProductCard = React.memo(ProductCardComponent);
