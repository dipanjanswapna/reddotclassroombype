'use client';

import { useState, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { getYoutubeVideoId } from '@/lib/utils';
import { PlayCircle, ArrowLeft, ArrowRight } from 'lucide-react';
import { HomepageConfig } from '@/lib/types';
import { cn } from '@/lib/utils';

type FreeClassesSectionProps = {
  sectionData: HomepageConfig['freeClassesSection'];
};

const ITEMS_PER_PAGE = 6;

export function FreeClassesSection({ sectionData }: FreeClassesSectionProps) {
  const { title, subtitle, classes } = sectionData;
  const [selectedGrade, setSelectedGrade] = useState('সব');
  const [currentPage, setCurrentPage] = useState(1);

  const grades = useMemo(() => {
    if (!classes) return ['সব'];
    return ['সব', ...Array.from(new Set(classes.map(c => c.grade)))];
  }, [classes]);

  const filteredClasses = useMemo(() => {
    if (!classes) return [];
    if (selectedGrade === 'সব') return classes;
    return classes.filter(c => c.grade === selectedGrade);
  }, [classes, selectedGrade]);

  const totalPages = Math.ceil(filteredClasses.length / ITEMS_PER_PAGE);

  const paginatedClasses = useMemo(() => {
    return filteredClasses.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);
  }, [filteredClasses, currentPage]);

  const handleGradeChange = (grade: string) => {
    setSelectedGrade(grade);
    setCurrentPage(1);
  };
  
  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  return (
      <div className="container mx-auto px-4">
        <div className="text-center mb-6">
          <h2 id="free-classes-heading" className="font-headline text-2xl font-bold text-green-700 dark:text-green-500">{title.bn}</h2>
          <div className="h-1 w-16 bg-primary mx-auto mt-2 rounded-full" />
          <p className="mt-3 text-sm text-muted-foreground max-w-xl mx-auto">{subtitle.bn}</p>
        </div>

        <div className="flex items-center justify-center flex-wrap gap-2 mb-6">
          {grades.map(grade => (
            <Button
              key={grade}
              variant={selectedGrade === grade ? 'default' : 'outline'}
              className="rounded-full font-semibold px-3 py-1 h-8 text-xs"
              onClick={() => handleGradeChange(grade)}
            >
              {grade}
            </Button>
          ))}
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {paginatedClasses.map(item => {
            const videoId = getYoutubeVideoId(item.youtubeUrl);
            const thumbnailUrl = videoId ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` : 'https://placehold.co/600x400.png?text=Invalid+URL';
            return (
              <Link key={item.id} href={item.youtubeUrl} target="_blank" rel="noopener noreferrer" className="group block">
                <Card className="glassmorphism-card overflow-hidden h-full flex flex-col">
                  <div className="relative aspect-video">
                    <Image
                      src={thumbnailUrl}
                      alt={item.title}
                      fill
                      className="object-cover"
                      data-ai-hint="youtube video class"
                    />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <PlayCircle className="w-12 h-12 text-primary" />
                    </div>
                  </div>
                  <div className="p-3 flex flex-col flex-grow">
                    <h3 className="font-semibold text-sm line-clamp-2">{item.title}</h3>
                    <p className="text-xs text-muted-foreground mt-1">{item.subject} • {item.instructor}</p>
                  </div>
                </Card>
              </Link>
            )
          })}
        </div>

        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-8">
            <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}> <ArrowLeft className="h-4 w-4" /> </Button>
            {[...Array(totalPages)].map((_, i) => (
              <Button
                key={i + 1}
                variant={currentPage === i + 1 ? 'default' : 'outline'}
                className="h-8 w-8 text-xs"
                onClick={() => handlePageChange(i + 1)}
              >
                {i + 1}
              </Button>
            ))}
            <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages}> <ArrowRight className="h-4 w-4" /> </Button>
          </div>
        )}
      </div>
  );
}