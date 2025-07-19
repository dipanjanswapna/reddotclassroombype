
'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Separator } from './ui/separator';
import { Star, Truck, ShieldCheck, Youtube, Minus, Plus, ShoppingCart } from 'lucide-react';
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
      id: product.id,
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

  return (
    <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
      {/* Image Gallery */}
      <div className="space-y-4">
        <div className="aspect-square relative bg-muted rounded-lg overflow-hidden">
          <Image
            src={selectedImage}
            alt={product.name}
            fill
            className="object-contain"
          />
        </div>
        <div className="grid grid-cols-4 gap-2">
          {gallery.map((img, idx) => (
            <button
              key={idx}
              className={cn(
                'aspect-square relative bg-muted rounded-md overflow-hidden ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
                selectedImage === img && 'ring-2 ring-primary'
              )}
              onClick={() => setSelectedImage(img)}
            >
              <Image
                src={img}
                alt={`${product.name} thumbnail ${idx + 1}`}
                fill
                className="object-cover"
              />
            </button>
          ))}
        </div>
      </div>

      {/* Product Info */}
      <div className="space-y-6">
        <div>
            {product.stock && product.stock > 0 ? (
                <Badge variant="accent">In Stock</Badge>
            ) : (
                <Badge variant="destructive">Out of Stock</Badge>
            )}
          <h1 className="text-3xl font-bold mt-2">{product.name}</h1>
          <div className="flex items-center gap-2 mt-2">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
              ))}
            </div>
            <span className="text-sm text-muted-foreground">(5.0 / 25 reviews)</span>
          </div>
        </div>

        <div className="flex items-baseline gap-4">
            <p className="text-4xl font-bold text-primary">৳{product.price}</p>
            {product.oldPrice && (
              <p className="text-xl text-muted-foreground line-through">৳{product.oldPrice}</p>
            )}
        </div>

        <Separator />
        
        <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex items-center border rounded-md">
                <Button variant="ghost" size="icon" onClick={() => handleQuantityChange(-1)} disabled={quantity <= 1}><Minus className="h-4 w-4"/></Button>
                <span className="w-12 text-center font-bold">{quantity}</span>
                <Button variant="ghost" size="icon" onClick={() => handleQuantityChange(1)}><Plus className="h-4 w-4"/></Button>
            </div>
            <Button size="lg" className="flex-grow font-bold" onClick={handleAddToCart}>
                <ShoppingCart className="mr-2 h-5 w-5"/>
                Add to Cart
            </Button>
        </div>

        <Card className="bg-secondary/50">
          <CardContent className="p-4 grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Truck className="h-5 w-5 text-primary" />
              <div>
                <p className="font-semibold">Free Shipping</p>
                <p className="text-xs text-muted-foreground">On orders over ৳1000</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-primary" />
              <div>
                <p className="font-semibold">Secure Payment</p>
                <p className="text-xs text-muted-foreground">SSL-encrypted checkout</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Accordion type="single" collapsible defaultValue="description">
            <AccordionItem value="description">
                <AccordionTrigger>Product Description</AccordionTrigger>
                <AccordionContent>
                    <div className="prose prose-sm dark:prose-invert">
                        <p>{product.description || "No description available."}</p>
                    </div>
                </AccordionContent>
            </AccordionItem>
             <AccordionItem value="specifications">
                <AccordionTrigger>Specifications</AccordionTrigger>
                <AccordionContent>
                    <ul className="list-disc pl-5 text-sm text-muted-foreground">
                        <li>Category: {product.category}</li>
                        <li>Sub-category: {product.subCategory || 'N/A'}</li>
                        <li>Stock: {product.stock || 'N/A'}</li>
                    </ul>
                </AccordionContent>
            </AccordionItem>
            {videoId && (
                 <AccordionItem value="video">
                    <AccordionTrigger>Product Video</AccordionTrigger>
                    <AccordionContent>
                         <div className="aspect-video">
                            <iframe
                            className="w-full h-full rounded-lg"
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
