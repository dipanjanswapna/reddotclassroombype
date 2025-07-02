
import { Organization } from "@/lib/types";
import Link from "next/link";
import Image from "next/image";
import { RdcLogo } from "./rdc-logo";

export function PartnerFooter({ partner }: { partner: Organization }) {
  return (
    <footer className="border-t bg-secondary/50">
      <div className="container mx-auto px-4 py-6 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
        <div className="text-center md:text-left">
            <p>&copy; {new Date().getFullYear()} {partner.name}. All rights reserved.</p>
            <div className="flex items-center justify-center md:justify-start gap-2 mt-2">
                <span>Powered by</span>
                <Link href="/" className="flex items-center gap-1 font-semibold text-foreground hover:text-primary transition-colors">
                    <RdcLogo className="h-5 w-auto" />
                    Red Dot Classroom
                </Link>
            </div>
        </div>
        <div>
            <Image
                src="https://mir-s3-cdn-cf.behance.net/projects/max_808/ed1f18226284187.Y3JvcCwxMDI0LDgwMCwwLDM2Nw.png"
                alt="DBID Certified"
                width={100}
                height={50}
                className="object-contain"
                data-ai-hint="DBID logo"
            />
        </div>
      </div>
    </footer>
  );
}
