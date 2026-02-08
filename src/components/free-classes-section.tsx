'use client';

import { useState, useMemo, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from '@/components/ui/badge';
import { getYoutubeVideoId } from '@/lib/utils';
import { PlayCircle, ArrowLeft, ArrowRight } from 'lucide-react';
import { HomepageConfig } from '@/lib/types';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/context/language-context';

type FreeClassesSectionProps = {
  sectionData: HomepageConfig['freeClassesSection'];
};

const ITEMS_PER_PAGE = 6;

// Helper to translate Bengali grade labels to English for the UI
const translateGrade = (grade: string) => {
  const map: Record<string, string> = {
    'ক্লাস ৬': 'Class 6',
    'ক্লাস ৭': 'Class 7',
    'ক্লাস ৮': 'Class 8',
    'ক্লাস ৯': 'Class 9',
    'ক্লাস ১০': 'Class 10',
    'ক্লাস ১১': 'Class 11',
    'ক্লাস ১২': 'Class 12',
    'সব': 'All',
  };
  return map[grade] || grade;
};

export function FreeClassesSection({ sectionData }: FreeClassesSectionProps) {
  const { title, subtitle, classes } = sectionData;
  const { language } = useLanguage();
  
  const grades = useMemo(() => {
    if (!classes || classes.length === 0) return [];
    return Array.from(new Set(classes.map(c => c.grade))).filter(Boolean);
  }, [classes]);

  const [selectedGrade, setSelectedGrade] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    if (grades.length > 0 && !selectedGrade) {
      setSelectedGrade(grades[0]);
    }
  }, [grades, selectedGrade]);

  const filteredClasses = useMemo(() => {
    if (!classes || !selectedGrade) return [];
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
      <div className="container mx-auto px-4 py-10 md:py-14">
        <div className="text-center mb-8 bg-gradient-to-r from-primary/10 via-background to-green-500/10 py-8 rounded-2xl shadow-sm">
          <h2 id="free-classes-heading" className="font-headline text-2xl font-bold text-green-700 dark:text-green-500">
            {title[language] || title.en}
          </h2>
          <div className="h-1 w-16 bg-primary mx-auto mt-2 rounded-full" />
          <p className="mt-3 text-sm text-muted-foreground max-w-xl mx-auto px-4">
            {subtitle[language] || subtitle.en}
          </p>
        </div>

        <div className="flex items-center justify-center flex-wrap gap-2 mb-8">
          {grades.map(grade => (
            <Button
              key={grade}
              variant={selectedGrade === grade ? 'default' : 'outline'}
              className="rounded-full font-bold px-4 py-1 h-9 text-xs uppercase tracking-wider"
              onClick={() => handleGradeChange(grade)}
            >
              {translateGrade(grade)}
            </Button>
          ))}
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {paginatedClasses.map(item => {
            const videoId = getYoutubeVideoId(item.youtubeUrl);
            const thumbnailUrl = videoId ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` : 'https://placehold.co/600x400.png?text=Invalid+URL';
            return (
              <Link key={item.id} href={item.youtubeUrl} target="_blank" rel="noopener noreferrer" className="group block h-full">
                <Card className="glassmorphism-card border border-primary/20 hover:border-primary/60 bg-gradient-to-br from-card to-secondary/30 dark:from-card dark:to-primary/10 overflow-hidden h-full flex flex-col transition-all">
                  <div className="relative aspect-video overflow-hidden">
                    <Image
                      src={thumbnailUrl}
                      alt={item.title}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-110"
                      data-ai-hint="youtube video class"
                    />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <PlayCircle className="w-12 h-12 text-white" />
                    </div>
                    <div className="absolute top-2 left-2">
                        <Badge variant="secondary" className="bg-background/80 backdrop-blur-sm">{translateGrade(item.grade)}</Badge>
                    </div>
                  </div>
                  <div className="p-4 flex flex-col flex-grow">
                    <h3 className="font-bold text-sm line-clamp-2 group-hover:text-primary transition-colors">{item.title}</h3>
                    <p className="text-xs text-muted-foreground mt-2">{item.subject} • {item.instructor}</p>
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
