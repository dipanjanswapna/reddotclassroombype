
'use client';

import Image from 'next/image';
import { Button } from './ui/button';

export function BookBanner() {
    return (
        <section className="mt-16 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-900/10 rounded-lg p-8">
            <div className="grid md:grid-cols-2 gap-8 items-center">
                <div className="space-y-6 text-center md:text-left">
                    <p className="font-semibold text-blue-600 dark:text-blue-300">By bestseller author</p>
                    <h2 className="text-4xl md:text-5xl font-bold text-gray-800 dark:text-white leading-tight">
                        Meet your next favorite book
                    </h2>
                    <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white">Buy our book</Button>
                    <div className="flex items-center justify-center md:justify-start gap-6 mt-4 opacity-70">
                        <Image src="https://i.imgur.com/rS25S1q.png" alt="Audible Logo" width={80} height={20} className="object-contain" data-ai-hint="audible logo"/>
                        <Image src="https://i.imgur.com/1G8WJpT.png" alt="Amazon Logo" width={80} height={20} className="object-contain" data-ai-hint="amazon logo"/>
                        <Image src="https://i.imgur.com/vHqLz3y.png" alt="Google Books Logo" width={80} height={20} className="object-contain" data-ai-hint="google books logo"/>
                    </div>
                </div>
                <div className="relative h-64 md:h-80 flex justify-center items-center">
                    <div className="absolute w-48 md:w-64 transform -translate-x-8 md:-translate-x-12 rotate-[-10deg] transition-transform duration-300 hover:scale-105 hover:rotate-[-5deg]">
                        <Image 
                            src="https://placehold.co/400x600.png"
                            alt="Book cover 2"
                            width={400}
                            height={600}
                            className="object-cover rounded-lg shadow-2xl"
                            data-ai-hint="book cover"
                        />
                    </div>
                    <div className="relative w-56 md:w-72 z-10 transition-transform duration-300 hover:scale-105 hover:rotate-2">
                        <Image 
                             src="https://placehold.co/400x600.png"
                             alt="Book cover 1"
                             width={400}
                             height={600}
                             className="object-cover rounded-lg shadow-2xl"
                             data-ai-hint="book cover mysterious"
                        />
                    </div>
                </div>
            </div>
        </section>
    )
}
