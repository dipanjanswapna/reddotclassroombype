
import Link from "next/link";
import Image from "next/image";
import logoSrc from '@/public/logo.png';

export function OfflineHubFooter() {
  return (
    <footer className="border-t border-red-500/20 bg-gray-900 text-gray-400 font-bengali">
      <div className="container mx-auto px-4 py-6 flex flex-col md:flex-row items-center justify-between gap-4 text-sm">
        <div className="text-center md:text-left">
            <p>&copy; {new Date().getFullYear()} RDC OFFLINE HUB. সর্বস্বত্ব সংরক্ষিত।</p>
        </div>
        <div className="flex items-center justify-center md:justify-start gap-2">
            <span>Powered by</span>
            <Link href="/" className="flex items-center gap-1 font-semibold text-white hover:text-red-400 transition-colors">
                <Image src={logoSrc} alt="RDC Logo" width={80} height={26} className="h-5 w-auto filter brightness-0 invert" />
            </Link>
        </div>
      </div>
    </footer>
  );
}
