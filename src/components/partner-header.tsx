
'use client';

import Link from "next/link";
import { Organization } from "@/lib/types";
import Image from "next/image";
import { Button } from "./ui/button";
import { useCart } from "@/context/cart-context";
import { ShoppingCart } from "lucide-react";
import { Badge } from "./ui/badge";

export function PartnerHeader({ partner }: { partner: Organization }) {
  const partnerSiteUrl = `/sites/${partner.subdomain}`;
  const { items, setIsCartOpen } = useCart();
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur">
      <div className="container flex h-16 items-center justify-between">
        <Link href={partnerSiteUrl} className="flex items-center gap-3">
          <Image src={partner.logoUrl} alt={`${partner.name} Logo`} width={32} height={32} className="rounded-md object-contain" />
          <span className="font-bold text-lg">{partner.name}</span>
        </Link>
        <nav className="flex items-center gap-2">
          <Button variant="ghost" asChild>
            <Link href={partnerSiteUrl}>Courses</Link>
          </Button>
           <Button variant="ghost" size="icon" className="relative" onClick={() => setIsCartOpen(true)}>
             <ShoppingCart className="h-5 w-5" />
             {itemCount > 0 && (
                <Badge variant="destructive" className="absolute -top-1 -right-1 h-5 w-5 justify-center rounded-full p-0 text-xs">{itemCount}</Badge>
             )}
          </Button>
          <Button variant="outline" asChild>
            <Link href="/login">Login to RDC</Link>
          </Button>
        </nav>
      </div>
    </header>
  );
}
