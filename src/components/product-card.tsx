

'use client';

import React from 'react';
import Image from "next/image";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Product, Organization } from "@/lib/types";
import { Button } from "./ui/button";
import { useCart } from '@/context/cart-context';
import { useToast } from './ui/use-toast';
import { ShoppingCart } from 'lucide-react';

type ProductCardProps = {
  product: Product;
  provider?: Organization | null;
};

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
          description: `"${product.name}" has been added to your cart.`,
      });
    };
  
  if (!product.id || !product.name || !product.imageUrl) {
    return null;
  }
  
  return (
    <Card className="overflow-hidden group flex flex-col h-full">
        <Link href={`/store/product/${product.id}`} className="block flex flex-col flex-grow">
        <CardHeader className="p-0">
            <div className="relative aspect-square">
            <Image
                src={product.imageUrl}
                alt={product.name}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-105"
                data-ai-hint={product.dataAiHint || 'product image'}
            />
            </div>
        </CardHeader>
        <CardContent className="p-4 flex flex-col flex-grow">
            <p className="text-xs text-muted-foreground">{product.category}</p>
            <h3 className="font-semibold truncate group-hover:text-primary flex-grow">{product.name}</h3>
            {provider && (
                <div className="flex items-center gap-2 mt-2">
                    <Image src={provider.logoUrl} alt={provider.name} width={16} height={16} className="rounded-full bg-muted object-contain"/>
                    <p className="text-xs text-muted-foreground">By {provider.name}</p>
                </div>
            )}
            <div className="flex items-center justify-between gap-2 mt-2">
            <div className="flex flex-col">
                {product.oldPrice && (
                <p className="text-sm text-muted-foreground line-through">৳{product.oldPrice}</p>
                )}
                <p className="text-lg font-bold text-primary">৳{product.price}</p>
            </div>
            <Button size="sm" onClick={handleAddToCart} aria-label={`Add ${product.name} to cart`}>
                <ShoppingCart className="h-4 w-4"/>
            </Button>
            </div>
        </CardContent>
        </Link>
    </Card>
  );
}

export const ProductCard = React.memo(ProductCardComponent);
