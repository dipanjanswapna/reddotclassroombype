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
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

type ProductCardProps = {
  product: Product;
  provider?: Organization | null;
  className?: string;
};

const ProductCardComponent = ({ product, provider, className }: ProductCardProps) => {
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
    <motion.div
      whileHover={{ y: -8 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className="h-full min-w-[280px] flex-1 max-w-[400px]"
    >
      <Card className={cn(
          "overflow-hidden group flex flex-col h-full transition-shadow duration-300 hover:shadow-2xl",
          className
      )}>
          <Link href={`/store/product/${product.id}`} className="block flex flex-col flex-grow">
          <CardHeader className="p-0 overflow-hidden">
              <div className="relative aspect-square">
              <Image
                  src={product.imageUrl}
                  alt={product.name}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                  data-ai-hint={product.dataAiHint || 'product image'}
              />
              </div>
          </CardHeader>
          <CardContent className="p-4 flex flex-col flex-grow">
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">{product.category}</p>
              <h3 className="font-bold truncate group-hover:text-primary transition-colors flex-grow">{product.name}</h3>
              {provider && (
                  <div className="flex items-center gap-2 mt-2">
                      <Image src={provider.logoUrl} alt={provider.name} width={16} height={16} className="rounded-full bg-muted object-contain"/>
                      <p className="text-xs text-muted-foreground">By {provider.name}</p>
                  </div>
              )}
              <div className="flex items-center justify-between gap-2 mt-4">
              <div className="flex flex-col">
                  {product.oldPrice && (
                  <p className="text-sm text-muted-foreground line-through">৳{product.oldPrice}</p>
                  )}
                  <p className="text-lg font-bold text-primary">৳{product.price}</p>
              </div>
              <Button size="sm" onClick={handleAddToCart} aria-label={`Add ${product.name} to cart`} className="shadow-md active:shadow-inner transition-all">
                  <ShoppingCart className="h-4 w-4"/>
                  <span className="ml-2 hidden sm:inline">Add to Cart</span>
              </Button>
              </div>
          </CardContent>
          </Link>
      </Card>
    </motion.div>
  );
}

export const ProductCard = React.memo(ProductCardComponent);