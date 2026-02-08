'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Separator } from './ui/separator';
import { Star, Truck, ShieldCheck, Youtube, Minus, Plus, ShoppingCart, CheckCircle2, Zap } from 'lucide-react';
import { Product } from '@/lib/types';
import { cn } from '@/lib/utils';
import { getYoutubeVideoId } from '@/lib/utils';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
  } from "@/components/ui/accordion"
import { useToast } from './ui/use-toast';
import { useCart } from '@/context/cart-context';
import { Label } from './ui/label';
import Link from 'next/link';

interface ProductClientPageProps {
  product: Product;
}

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

  const gallery = [product.imageUrl, ...(product.gallery || [])].slice(0, 4);
  const videoId = product.videoUrl ? getYoutubeVideoId(product.videoUrl) : null;

  const specifications = [
    { label: 'Category', value: product.category },
    { label: 'Sub-category', value: product.subCategory || 'General' },
    { label: 'Stock Availability', value: product.stock ? `${product.stock} items remaining` : 'In Stock' },
    { label: 'Item Type', value: 'Physical Product' },
    { label: 'Condition', value: 'New' },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16">
      {/* Left: Image Gallery */}
      <div className="lg:col-span-7 space-y-6">
        <div className="aspect-square relative bg-white dark:bg-background/50 rounded-[2.5rem] overflow-hidden border-2 border-primary/5 shadow-2xl group">
          <Image
            src={selectedImage}
            alt={product.name}
            fill
            className="object-contain p-8 transition-transform duration-700 group-hover:scale-105"
            priority
          />
        </div>
        <div className="grid grid-cols-4 gap-4 px-2">
          {gallery.map((img, idx) => (
            <button
              key={idx}
              className={cn(
                'aspect-square relative bg-white dark:bg-card rounded-2xl overflow-hidden border-2 transition-all hover:border-primary/40 shadow-sm',
                selectedImage === img ? 'border-primary shadow-lg scale-105' : 'border-transparent opacity-70 hover:opacity-100'
              )}
              onClick={() => setSelectedImage(img)}
            >
              <Image
                src={img}
                alt={`${product.name} thumbnail ${idx + 1}`}
                fill
                className="object-contain p-2"
              />
            </button>
          ))}
        </div>
      </div>

      {/* Right: Product Info */}
      <div className="lg:col-span-5 space-y-8">
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <Badge variant={product.stock && product.stock > 0 ? "accent" : "destructive"} className="px-4 py-1 rounded-full font-black uppercase tracking-widest text-[10px]">
                    {product.stock && product.stock > 0 ? 'In Stock' : 'Sold Out'}
                </Badge>
                <div className="flex items-center gap-1.5">
                    <div className="flex items-center text-yellow-400">
                        {[...Array(5)].map((_, i) => (
                            <Star key={i} className="w-4 h-4 fill-current" />
                        ))}
                    </div>
                    <span className="text-xs font-bold text-muted-foreground">5.0 (25 Reviews)</span>
                </div>
            </div>
            <h1 className="text-3xl md:text-4xl font-black font-headline tracking-tight leading-tight">{product.name}</h1>
            <p className="text-muted-foreground text-sm font-medium leading-relaxed line-clamp-3">
                {product.description}
            </p>
        </div>

        <div className="flex items-baseline gap-4 bg-primary/5 p-6 rounded-3xl border border-primary/10">
            <div className="flex flex-col">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/60">Our Price</span>
                <p className="text-4xl font-black text-primary tracking-tighter">৳{product.price}</p>
            </div>
            {product.oldPrice && (
              <div className="flex flex-col">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Regular</span>
                <p className="text-lg text-muted-foreground line-through font-bold decoration-primary/40 decoration-2">৳{product.oldPrice}</p>
              </div>
            )}
        </div>

        <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex items-center bg-muted/50 rounded-2xl p-1 border h-14">
                    <Button variant="ghost" size="icon" onClick={() => handleQuantityChange(-1)} disabled={quantity <= 1} className="rounded-xl h-12 w-12 hover:bg-background">
                        <Minus className="h-4 w-4"/>
                    </Button>
                    <span className="w-12 text-center font-black text-lg">{quantity}</span>
                    <Button variant="ghost" size="icon" onClick={() => handleQuantityChange(1)} className="rounded-xl h-12 w-12 hover:bg-background">
                        <Plus className="h-4 w-4"/>
                    </Button>
                </div>
                <Button size="lg" className="flex-grow font-black uppercase tracking-widest text-xs h-14 rounded-2xl shadow-xl shadow-primary/10 active:scale-95 transition-all" onClick={handleAddToCart}>
                    <ShoppingCart className="mr-2 h-5 w-5"/>
                    Add to Cart
                </Button>
            </div>
            <Button variant="accent" size="lg" className="w-full font-black uppercase tracking-widest text-xs h-14 rounded-2xl bg-green-600 hover:bg-green-700 shadow-xl shadow-green-500/10 active:scale-95 transition-all" asChild>
                <Link href="/store/checkout" onClick={handleAddToCart}>
                    <Zap className="mr-2 h-5 w-5 fill-current"/>
                    Buy It Now
                </Link>
            </Button>
        </div>

        <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-3 p-4 bg-muted/30 rounded-2xl border border-primary/5">
                <div className="p-2 bg-primary/10 rounded-xl"><Truck className="h-5 w-5 text-primary" /></div>
                <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-primary/60">Fast Delivery</p>
                    <p className="text-xs font-bold">Safe & Reliable</p>
                </div>
            </div>
            <div className="flex items-center gap-3 p-4 bg-muted/30 rounded-2xl border border-primary/5">
                <div className="p-2 bg-primary/10 rounded-xl"><ShieldCheck className="h-5 w-5 text-primary" /></div>
                <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-primary/60">Quality Check</p>
                    <p className="text-xs font-bold">100% Genuine</p>
                </div>
            </div>
        </div>

        <Accordion type="single" collapsible defaultValue="specs" className="w-full space-y-3">
            <AccordionItem value="specs" className="border rounded-2xl overflow-hidden bg-card transition-all hover:border-primary/20">
                <AccordionTrigger className="font-black text-left px-6 py-4 hover:no-underline text-sm uppercase tracking-widest">
                    Technical Specifications
                </AccordionTrigger>
                <AccordionContent className="px-6 pb-6 pt-2">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-muted/50 border rounded-xl overflow-hidden">
                        {specifications.map((spec, i) => (
                            <div key={i} className="flex justify-between items-center p-4 bg-card group">
                                <span className="text-xs font-black uppercase tracking-wider text-muted-foreground">{spec.label}</span>
                                <span className="text-sm font-bold text-foreground">{spec.value}</span>
                            </div>
                        ))}
                    </div>
                </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="description" className="border rounded-2xl overflow-hidden bg-card transition-all hover:border-primary/20">
                <AccordionTrigger className="font-black text-left px-6 py-4 hover:no-underline text-sm uppercase tracking-widest">
                    Detailed Description
                </AccordionTrigger>
                <AccordionContent className="px-6 pb-6 pt-2">
                    <div className="prose prose-sm dark:prose-invert max-w-none text-muted-foreground leading-relaxed font-medium">
                        {product.description || "No description available."}
                    </div>
                </AccordionContent>
            </AccordionItem>

            {videoId && (
                 <AccordionItem value="video" className="border rounded-2xl overflow-hidden bg-card transition-all hover:border-primary/20">
                    <AccordionTrigger className="font-black text-left px-6 py-4 hover:no-underline text-sm uppercase tracking-widest">
                        Product Video
                    </AccordionTrigger>
                    <AccordionContent className="px-6 pb-6 pt-2">
                         <div className="aspect-video relative rounded-xl overflow-hidden border shadow-inner">
                            <iframe
                            className="absolute inset-0 w-full h-full"
                            src={`https://www.youtube.com/embed/${videoId}`}
                            title={product.name}
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                            allowFullScreen
                            ></iframe>
                        </div>
                    </AccordionContent>
                </AccordionItem>
            )}
        </Accordion>
      </div>
    </div>
  );
}
