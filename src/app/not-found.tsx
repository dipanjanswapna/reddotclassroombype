import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="flex min-h-[calc(100vh-8rem)] w-full items-center justify-center bg-background px-4 py-12">
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
              src="https://placehold.co/600x400.png"
              alt="Red Dot Classroom 404 Error"
              fill
              className="object-contain"
              data-ai-hint="error 404"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
