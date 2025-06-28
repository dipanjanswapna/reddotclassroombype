
import { Organization } from "@/lib/mock-data";
import Link from "next/link";
import { RdcLogo } from "./rdc-logo";

export function PartnerFooter({ partner }: { partner: Organization }) {
  return (
    <footer className="border-t bg-secondary/50">
      <div className="container mx-auto px-4 py-6 text-center text-sm text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} {partner.name}. All rights reserved.</p>
        <div className="flex items-center justify-center gap-2 mt-2">
            <span>Powered by</span>
            <Link href="/" className="flex items-center gap-1 font-semibold text-foreground hover:text-primary transition-colors">
                <RdcLogo className="h-5 w-auto" />
                Red Dot Classroom
            </Link>
        </div>
      </div>
    </footer>
  );
}
