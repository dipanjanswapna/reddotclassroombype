
'use client';

import Image from 'next/image';
import Link from 'next/link';
import { HomepageConfig } from '@/lib/types';

type Partner = HomepageConfig['partnersSection']['partners'][0];

export function PartnersLogoScroll({ partners, scrollSpeed = 25 }: { partners: Partner[], scrollSpeed?: number }) {
  if (!partners || partners.length === 0) {
    return null;
  }

  const animationStyle = {
    animationDuration: `${scrollSpeed}s`,
  };

  return (
    <div
      className="w-full inline-flex flex-nowrap overflow-hidden [mask-image:_linear-gradient(to_right,transparent_0,_black_128px,_black_calc(100%-200px),transparent_100%)]"
    >
      <ul className="flex items-center justify-center md:justify-start [&_li]:mx-8 [&_img]:max-w-none animate-infinite-scroll" style={animationStyle}>
        {partners.map((partner) => (
          <li key={partner.id}>
            <Link href={partner.href} target="_blank" rel="noopener noreferrer" className="grayscale opacity-60 hover:grayscale-0 hover:opacity-100 transition-all duration-300">
              <Image
                src={partner.logoUrl}
                alt={partner.name}
                width={140}
                height={60}
                className="object-contain"
                data-ai-hint={partner.dataAiHint}
              />
            </Link>
          </li>
        ))}
      </ul>
      <ul className="flex items-center justify-center md:justify-start [&_li]:mx-8 [&_img]:max-w-none animate-infinite-scroll" aria-hidden="true" style={animationStyle}>
        {partners.map((partner) => (
          <li key={`${partner.id}-clone`}>
             <Link href={partner.href} target="_blank" rel="noopener noreferrer" className="grayscale opacity-60 hover:grayscale-0 hover:opacity-100 transition-all duration-300">
              <Image
                src={partner.logoUrl}
                alt={partner.name}
                width={140}
                height={60}
                className="object-contain"
                data-ai-hint={partner.dataAiHint}
              />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
