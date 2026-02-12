'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from './ui/separator';
import { Star, Truck, ShieldCheck, ShoppingCart, Minus, Plus, Share2, Heart } from 'lucide-react';
import { Product } from '@/lib/types';
import { cn } from '@/lib/utils';
import { useToast } from './ui/use-toast';
import { useCart } from '@/context/cart-context';
import { motion, AnimatePresence } from 'framer-motion';

interface ProductClientPageProps {
  product: Product;
}

/**
 * @fileOverview Refined Product Client Page.
 * High-density layout with 20px rounding and px-1 wall-to-wall consistency.
 */
export function ProductClientPage({ product }: ProductClientPageProps) {
  const [selectedImage, setSelectedImage] = useState(product.imageUrl);
  const [quantity, setQuantity] = useState(1);
  const { toast } = useToast();
  const { addToCart } = useCart();

  const handleQuantityChange = (amount: number) => {
    setQuantity((prev) => Math.max(1, prev + amount));
  };
  
  const handleAddToCart = () => {
    addToCart({
      id: product.id!,
      name: product.name,
      price: product.price,
      quantity: quantity,
      imageUrl: product.imageUrl,
    });
    toast({
        title: "Added to Cart!",
        description: `${quantity} x ${product.name} has been added to your cart.`,
    });
  }

  const handleShare = () => {
      if (navigator.share) {
          navigator.share({
              title: product.name,
              url: window.location.href,
          }).catch(console.error);
      } else {
          navigator.clipboard.writeText(window.location.href);
          toast({ title: "Link copied to clipboard!" });
      }
  }

  const gallery = [product.imageUrl, ...(product.gallery || [])].slice(0, 4);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
      {/* Visual Section: Image Gallery (5/12 cols) */}
      <div className="lg:col-span-5 space-y-4 px-1">
        <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="aspect-square relative bg-white dark:bg-card rounded-[20px] overflow-hidden shadow-2xl border border-primary/5"
        >
          <Image
            src={selectedImage}
            alt={product.name}
            fill
            priority
            className="object-contain p-4"
          />
          {product.oldPrice && (
              <Badge className="absolute top-4 left-4 bg-red-600 text-white border-none font-black text-[10px] uppercase tracking-tighter shadow-lg px-3 py-1">
                  SAVE ৳{(product.oldPrice - product.price).toFixed(0)}
              </Badge>
          )}
        </motion.div>
        
        <div className="grid grid-cols-4 gap-3 px-1">
          {gallery.map((img, idx) => (
            <button
              key={idx}
              className={cn(
                'aspect-square relative bg-white dark:bg-card rounded-xl overflow-hidden border-2 transition-all duration-300',
                selectedImage === img ? 'border-primary shadow-lg scale-105' : 'border-transparent opacity-60 hover:opacity-100'
              )}
              onClick={() => setSelectedImage(img)}
            >
              <Image
                src={img}
                alt={`Gallery ${idx + 1}`}
                fill
                className="object-cover p-1"
              />
            </button>
          ))}
        </div>
      </div>

      {/* Info Section (7/12 cols) */}
      <div className="lg:col-span-7 space-y-8 px-1">
        <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
                <Badge variant="outline" className="bg-primary/5 text-primary border-primary/10 font-black text-[10px] uppercase tracking-widest px-3 py-1">{product.category}</Badge>
                {product.subCategory && <Badge variant="secondary" className="font-bold text-[10px] uppercase tracking-widest px-3 py-1">{product.subCategory}</Badge>}
            </div>
            
            <h1 className="font-headline text-2xl md:text-4xl font-black tracking-tight leading-tight uppercase text-foreground">
                {product.name}
            </h1>

            <div className="flex items-center gap-4">
                <div className="flex items-center bg-yellow-400/10 px-2 py-1 rounded-lg border border-yellow-400/20">
                    <Star className="w-4 h-4 text-yellow-500 fill-current mr-1.5" />
                    <span className="text-sm font-black text-yellow-700">{product.ratings || '4.9'}</span>
                </div>
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest border-l border-black/10 pl-4">
                    {product.reviewsCount || 0} Verified Reviews
                </span>
            </div>
        </div>

        <div className="flex items-end gap-4 bg-muted/30 p-6 rounded-[20px] border border-primary/5">
            <div className="space-y-1">
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Current Price</p>
                <div className="flex items-baseline gap-3">
                    <span className="text-4xl md:text-5xl font-black text-primary tracking-tighter">৳{product.price}</span>
                    {product.oldPrice && (
                        <span className="text-lg md:text-xl text-muted-foreground line-through font-bold decoration-primary/30">৳{product.oldPrice}</span>
                    )}
                </div>
            </div>
            {product.stock && product.stock < 10 && product.stock > 0 && (
                <Badge variant="destructive" className="mb-2 rounded-lg font-black text-[9px] uppercase tracking-widest animate-pulse">
                    Only {product.stock} Left!
                </Badge>
            )}
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex items-center h-14 bg-muted/50 rounded-2xl border border-primary/10 px-2 group">
                <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => handleQuantityChange(-1)} 
                    disabled={quantity <= 1}
                    className="h-10 w-10 rounded-xl hover:bg-white dark:hover:bg-black transition-all"
                >
                    <Minus className="h-4 w-4"/>
                </Button>
                <span className="w-14 text-center font-black text-lg">{quantity}</span>
                <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => handleQuantityChange(1)}
                    className="h-10 w-10 rounded-xl hover:bg-white dark:hover:bg-black transition-all"
                >
                    <Plus className="h-4 w-4"/>
                </Button>
            </div>
            
            <Button 
                size="lg" 
                className="flex-grow h-14 rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-primary/30 text-sm active:scale-95 transition-all" 
                onClick={handleAddToCart}
                disabled={product.stock === 0}
            >
                <ShoppingCart className="mr-2 h-5 w-5"/>
                {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
            </Button>

            <div className="flex gap-2">
                <Button variant="outline" size="icon" className="h-14 w-14 rounded-2xl border-primary/10 hover:bg-primary/5" onClick={handleShare}>
                    <Share2 className="h-5 w-5 text-muted-foreground" />
                </Button>
                <Button variant="outline" size="icon" className="h-14 w-14 rounded-2xl border-primary/10 hover:bg-primary/5">
                    <Heart className="h-5 w-5 text-muted-foreground" />
                </Button>
            </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Card className="rounded-[20px] bg-white/50 dark:bg-card/50 border-white/40 shadow-sm overflow-hidden group">
                <CardContent className="p-5 flex items-center gap-4">
                    <div className="p-3 rounded-2xl bg-blue-500/10 text-blue-600 group-hover:scale-110 transition-transform">
                        <Truck className="h-6 w-6" />
                    </div>
                    <div>
                        <p className="font-black text-[10px] uppercase tracking-widest text-foreground leading-none">Fast Delivery</p>
                        <p className="text-[11px] font-medium text-muted-foreground mt-1">Inside Dhaka: 3 Days</p>
                    </div>
                </CardContent>
            </Card>
            <Card className="rounded-[20px] bg-white/50 dark:bg-card/50 border-white/40 shadow-sm overflow-hidden group">
                <CardContent className="p-5 flex items-center gap-4">
                    <div className="p-3 rounded-2xl bg-green-500/10 text-green-600 group-hover:scale-110 transition-transform">
                        <ShieldCheck className="h-6 w-6" />
                    </div>
                    <div>
                        <p className="font-black text-[10px] uppercase tracking-widest text-foreground leading-none">Secure Pay</p>
                        <p className="text-[11px] font-medium text-muted-foreground mt-1">100% SSL Certified</p>
                    </div>
                </CardContent>
            </Card>
        </div>

        <div className="pt-4 border-t border-black/5">
            <h3 className="font-black text-[11px] uppercase tracking-widest text-muted-foreground mb-4 ml-1">Product Details</h3>
            <div className="prose prose-sm dark:prose-invert max-w-none text-muted-foreground font-medium leading-relaxed bg-muted/20 p-6 rounded-[20px] border border-primary/5">
                {product.description || "No detailed description available for this item."}
            </div>
        </div>
      </div>
    </div>
  );
}
