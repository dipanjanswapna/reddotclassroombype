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
import { ShoppingCart, Star, AlertCircle, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/context/language-context';

type ProductCardProps = {
  product: Product;
  provider?: Organization | null;
};

const ProductCardComponent = ({ product, provider }: ProductCardProps) => {
    const { addToCart } = useCart();
    const { toast } = useToast();
    const { language } = useLanguage();

    const isOutOfStock = product.stock !== undefined && product.stock <= 0;

    const handleAddToCart = (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      
      if (isOutOfStock) {
          toast({ title: "Out of Stock", description: "This item is currently sold out.", variant: "destructive" });
          return;
      }

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
        "group flex flex-col h-full overflow-hidden shadow-xl border-primary/5 rounded-[20px] p-2.5 transition-all duration-500 hover:shadow-2xl hover:-translate-y-1 bg-card",
        "relative"
    )}>
        <Link href={`/${language}/store/product/${product.id}`} className="block flex flex-col flex-grow outline-none">
            {/* Visual Container */}
            <CardHeader className="p-0 relative aspect-square overflow-hidden rounded-[16px] shadow-inner bg-muted/20">
                <Image
                    src={product.imageUrl}
                    alt={product.name}
                    fill
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 20vw"
                    className={cn("object-cover transition-transform duration-700 group-hover:scale-110 p-2", isOutOfStock && "opacity-40 grayscale")}
                    data-ai-hint={product.dataAiHint || 'product image'}
                />
                
                {isOutOfStock ? (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/30 backdrop-blur-[1px] z-10">
                        <Badge variant="destructive" className="font-black text-[9px] uppercase tracking-widest px-3 py-1 shadow-lg rounded-lg border-none">Sold Out</Badge>
                    </div>
                ) : product.oldPrice && (
                    <Badge className="absolute top-2 left-2 bg-red-600 text-white border-none font-black text-[8px] uppercase tracking-widest shadow-lg">OFFER</Badge>
                )}
            </CardHeader>

            {/* Content Area */}
            <CardContent className="p-3 pt-4 flex flex-col flex-grow text-left space-y-3">
                <div className="space-y-1">
                    <p className="text-[8px] md:text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground opacity-70">
                        {product.category}
                    </p>
                    <h3 className="text-xs md:text-sm font-black leading-tight text-foreground line-clamp-2 font-headline uppercase tracking-tight h-[2.4rem] group-hover:text-primary transition-colors">
                        {product.name}
                    </h3>
                </div>

                <div className="flex items-center justify-between gap-2 border-b border-primary/5 pb-2">
                    <div className="flex items-center gap-1">
                        <Star className={cn("w-3 h-3", (product.ratings || 0) > 0 ? "text-yellow-500 fill-current" : "text-gray-300")} />
                        <span className="text-[10px] font-black text-gray-700">{product.ratings || '4.9'}</span>
                    </div>
                    {!isOutOfStock && product.stock && product.stock < 10 && (
                        <span className="text-[8px] font-black text-orange-600 uppercase tracking-tighter bg-orange-50 px-1.5 py-0.5 rounded-lg border border-orange-100">Limited Stock</span>
                    )}
                </div>

                <div className="pt-1 flex items-end justify-between mt-auto">
                    <div className="flex flex-col">
                        {product.oldPrice && (
                            <span className="text-[10px] font-bold text-muted-foreground line-through decoration-primary/20 leading-none mb-1 opacity-60">
                                ৳{product.oldPrice}
                            </span>
                        )}
                        <span className="text-lg font-black text-primary tracking-tighter leading-none">
                            ৳{product.price}
                        </span>
                    </div>
                    
                    <Button 
                        size="icon" 
                        onClick={handleAddToCart} 
                        disabled={isOutOfStock}
                        className={cn(
                            "h-9 w-9 rounded-xl transition-all active:scale-90 shadow-lg",
                            isOutOfStock ? "bg-muted text-muted-foreground shadow-none" : "bg-primary text-white shadow-primary/20 hover:bg-primary/90"
                        )}
                    >
                        <ShoppingCart className="h-4 w-4" />
                    </Button>
                </div>
            </CardContent>
        </Link>
    </Card>
  );
}

export const ProductCard = React.memo(ProductCardComponent);
