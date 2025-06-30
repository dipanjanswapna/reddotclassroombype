
import Link from "next/link";
import { Organization } from "@/lib/types";
import Image from "next/image";
import { Button } from "./ui/button";

export function PartnerHeader({ partner }: { partner: Organization }) {
  const partnerSiteUrl = `/sites/${partner.subdomain}`;

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
          <Button variant="outline" asChild>
            <Link href="/login">Login to RDC</Link>
          </Button>
        </nav>
      </div>
    </header>
  );
}
