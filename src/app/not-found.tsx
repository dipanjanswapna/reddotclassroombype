// A standalone 404 page. It needs its own <html> and <body> tags
// to avoid being wrapped by the main layout.
import './globals.css';
import Image from 'next/image';

export default function NotFound() {
  return (
    <html lang="en">
        <head>
            <title>404 - Page Not Found | RDC</title>
            <meta name="description" content="The page you are looking for does not exist." />
            <link rel="icon" href="/favicon.ico" />
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
                        <a href="/" className="inline-flex items-center justify-center rounded-md text-sm font-medium text-primary underline-offset-4 hover:underline text-base">Home</a>
                        <a href="/courses" className="inline-flex items-center justify-center rounded-md text-sm font-medium text-primary underline-offset-4 hover:underline text-base">Courses</a>
                        <a href="/contact" className="inline-flex items-center justify-center rounded-md text-sm font-medium text-primary underline-offset-4 hover:underline text-base">Contact</a>
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
