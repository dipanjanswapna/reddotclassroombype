
// A standalone 404 page, as per Next.js App Router conventions for root not-found files.
// This file is NOT wrapped by the root layout.tsx, so it needs its own <html> and <body> tags.
import './globals.css';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Inter, Poppins, Hind_Siliguri } from 'next/font/google';
import { cn } from '@/lib/utils';

// Re-declare fonts just like in the root layout for styling consistency
const fontInter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
})

const fontPoppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '600', '700'],
  variable: '--font-poppins',
})

const fontHindSiliguri = Hind_Siliguri({
  subsets: ['bengali', 'latin'],
  weight: ['400', '700'],
  variable: '--font-bengali',
})

export default function NotFound() {
  return (
    <html lang="en" className={cn('font-body antialiased', fontInter.variable, fontPoppins.variable, fontHindSiliguri.variable)}>
        <head>
            <title>404 - Page Not Found | RDC</title>
            <meta name="description" content="The page you are looking for does not exist." />
        </head>
        <body>
            <main className="flex min-h-screen w-full items-center justify-center bg-background px-4 py-12">
            <div className="container mx-auto max-w-6xl">
                <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
                <div className="flex flex-col items-center text-center lg:items-start lg:text-left">
                    <p className="font-semibold text-muted-foreground">ERROR CODE: 404</p>
                    <h1 className="mt-4 text-6xl font-extrabold tracking-tight text-foreground sm:text-7xl">
                    OOOPS!!
                    </h1>
                    <p className="mt-4 text-2xl text-muted-foreground">
                    This is not the page you are looking for.
                    </p>
                    <div className="mt-10">
                    <p className="text-muted-foreground">Here are some helpful links instead:</p>
                    <div className="mt-4 flex flex-wrap justify-center gap-4 lg:justify-start">
                        <Button asChild variant="link" className="text-base">
                        <Link href="/">Home</Link>
                        </Button>
                        <Button asChild variant="link" className="text-base">
                        <Link href="/courses">Courses</Link>
                        </Button>
                        <Button asChild variant="link" className="text-base">
                        <Link href="/contact">Contact</Link>
                        </Button>
                    </div>
                    </div>
                </div>
                <div className="relative h-96">
                    <Image
                    src="/404error.png"
                    alt="Red Dot Classroom 404 Error"
                    fill
                    className="object-contain"
                    />
                </div>
                </div>
            </div>
            </main>
        </body>
    </html>
  );
}
