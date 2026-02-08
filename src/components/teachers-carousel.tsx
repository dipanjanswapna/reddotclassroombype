'use client';

import Link from 'next/link';
import Image from 'next/image';
import type { Instructor } from '@/lib/types';

export function TeachersCarousel({ instructors, scrollSpeed = 25 }: { instructors: Instructor[], scrollSpeed?: number }) {
  if (!instructors || instructors.length === 0) {
    return null;
  }
  
  const animationStyle = {
    animationDuration: `${scrollSpeed}s`,
  };

  return (
    <div
      className="w-full inline-flex flex-nowrap overflow-hidden"
    >
      <ul className="flex items-center justify-center md:justify-start [&_li]:mx-4 animate-infinite-scroll" style={animationStyle}>
        {instructors.map((instructor) => (
            <li key={instructor.id}>
                <Link href={`/teachers/${instructor.slug}`} className="block group text-center w-[200px]" aria-label={`View profile for ${instructor.name}`}>
                    <div className="relative overflow-hidden rounded-lg">
                        <Image
                            src={instructor.avatarUrl || 'https://placehold.co/250x300.png'}
                            alt={instructor.name}
                            width={250}
                            height={300}
                            className="w-full object-cover aspect-[4/5] transition-transform duration-300 group-hover:scale-105"
                            data-ai-hint={instructor.dataAiHint}
                        />
                        <div className="absolute bottom-2 left-2 right-2 p-2 rounded-md bg-black/30 backdrop-blur-sm text-white">
                            <h3 className="font-semibold text-sm truncate">{instructor.name}</h3>
                            <p className="text-xs opacity-80 truncate">{instructor.title}</p>
                        </div>
                    </div>
                </Link>
            </li>
        ))}
      </ul>
      <ul className="flex items-center justify-center md:justify-start [&_li]:mx-4 animate-infinite-scroll" aria-hidden="true" style={animationStyle}>
        {instructors.map((instructor) => (
            <li key={`${instructor.id}-clone`}>
                <Link href={`/teachers/${instructor.slug}`} className="block group text-center w-[200px]" aria-label={`View profile for ${instructor.name}`}>
                    <div className="relative overflow-hidden rounded-lg">
                        <Image
                            src={instructor.avatarUrl || 'https://placehold.co/250x300.png'}
                            alt={instructor.name}
                            width={250}
                            height={300}
                            className="w-full object-cover aspect-[4/5] transition-transform duration-300 group-hover:scale-105"
                            data-ai-hint={instructor.dataAiHint}
                        />
                        <div className="absolute bottom-2 left-2 right-2 p-2 rounded-md bg-black/30 backdrop-blur-sm text-white">
                            <h3 className="font-semibold text-sm truncate">{instructor.name}</h3>
                            <p className="text-xs opacity-80 truncate">{instructor.title}</p>
                        </div>
                    </div>
                </Link>
            </li>
        ))}
      </ul>
    </div>
  );
}
