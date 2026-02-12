import { Card, CardContent, CardHeader } from "@/components/ui/card";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Calendar, Clock, Newspaper } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getBlogPosts } from "@/lib/firebase/firestore";
import { BlogPost } from "@/lib/types";
import type { Metadata } from "next";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { t } from "@/lib/i18n";

export const metadata: Metadata = {
  title: 'Blog | RDC Insights',
  description: 'Academic tips and latest updates from RDC.',
};

/**
 * @fileOverview Localized Blog Page
 * Wall-to-wall px-1 layout with Hind Siliguri font.
 */
export default async function BlogPage({ params }: { params: { locale: string } }) {
  const awaitedParams = await params;
  const language = awaitedParams.locale as 'en' | 'bn';
  const isBn = language === 'bn';
  const blogPosts: BlogPost[] = await getBlogPosts();

  return (
    <div className={cn("bg-background min-h-screen pb-20 px-1", isBn && "font-bengali")}>
      {/* Modern Header Section */}
      <section className="relative py-16 md:py-24 bg-muted/30 border-b border-white/5 overflow-hidden rounded-b-[40px]">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-primary/5 blur-[120px] rounded-full -z-10" />
        <div className="container mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest mb-6 border border-primary/20 shadow-sm">
            <Newspaper className="w-3.5 h-3.5" />
            {t.nav_blog[language]}
          </div>
          <h1 className="font-headline text-4xl md:text-5xl lg:text-6xl font-black tracking-tight uppercase leading-tight max-w-4xl mx-auto">
            {isBn ? 'আমাদের' : 'Our'} <span className="text-primary">{isBn ? 'ব্লগ' : 'Blog'}</span> & Resources
          </h1>
          <p className="mt-6 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto font-medium leading-relaxed">
            {isBn 
                ? 'শিক্ষার সর্বশেষ টিপস, পরীক্ষার স্ট্র্যাটেজি এবং একাডেমিক আপডেট সম্পর্কে জানুন আমাদের অভিজ্ঞ ফ্যাকাল্টিদের কাছ থেকে।'
                : 'Stay ahead with the latest academic tips, exam strategies, and educational trends curated by our elite faculty.'
            }
          </p>
        </div>
      </section>

      {/* Blog Grid Section */}
      <div className="container mx-auto px-4 py-12 md:py-20">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {blogPosts.map((post, index) => (
            <Card key={post.slug} className="group flex flex-col glassmorphism-card border-white/20 bg-white/40 dark:bg-card/40 overflow-hidden rounded-[30px] shadow-xl transition-all duration-500 hover:shadow-2xl hover:-translate-y-2">
              <CardHeader className="p-0 relative aspect-video overflow-hidden">
                <Link href={`/blog/${post.slug}`}>
                  <Image
                    src={post.imageUrl}
                    alt={post.title}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                    data-ai-hint={post.dataAiHint}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                </Link>
                <Badge className="absolute top-4 left-4 bg-primary text-white border-none font-black text-[9px] uppercase tracking-widest px-3 py-1 shadow-lg">
                  INSIGHT
                </Badge>
              </CardHeader>
              <CardContent className="p-8 flex flex-col flex-grow text-left space-y-4">
                <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                    <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 text-primary" /> 12 MAY 2024</span>
                    <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-primary" /> 5 MIN READ</span>
                </div>
                <h2 className="font-headline text-xl md:text-2xl font-black leading-tight group-hover:text-primary transition-colors text-left uppercase tracking-tight">
                  <Link href={`/blog/${post.slug}`}>{post.title}</Link>
                </h2>
                <p className="text-muted-foreground text-sm leading-relaxed line-clamp-3 font-medium flex-grow">
                  {post.excerpt}
                </p>
                <div className="mt-4 pt-6 border-t border-black/5">
                  <Button asChild variant="link" className="p-0 h-auto self-start text-primary font-black uppercase tracking-widest text-[10px] group-hover:gap-3 transition-all">
                    <Link href={`/blog/${post.slug}`} className="flex items-center">
                      Read Article <ArrowRight className="ml-2 h-3.5 w-3.5" />
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {blogPosts.length === 0 && (
          <div className="text-center py-24 bg-muted/20 border-2 border-dashed border-primary/10 rounded-[30px] flex flex-col items-center">
            <Newspaper className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-20" />
            <p className="text-muted-foreground font-black uppercase tracking-widest text-xs">No blog posts published yet</p>
            <Button variant="outline" asChild className="mt-6 rounded-xl font-black uppercase">
              <Link href="/">Back to Homepage</Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}