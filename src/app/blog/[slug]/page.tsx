
import { notFound } from 'next/navigation';
import Image from 'next/image';
import { getBlogPostBySlug } from '@/lib/firebase/firestore';
import type { Metadata } from 'next';
import { BlogPost } from '@/lib/types';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const post: BlogPost | null = await getBlogPostBySlug(params.slug);

  if (!post) {
    return {
      title: 'Post Not Found',
    };
  }

  return {
    title: `${post.title} | Red Dot Classroom Blog`,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      images: [
        {
          url: post.imageUrl,
          width: 600,
          height: 400,
          alt: post.title,
        },
      ],
    },
  };
}

export default async function BlogPostPage({ params }: { params: { slug: string } }) {
  const post = await getBlogPostBySlug(params.slug);

  if (!post) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <article className="max-w-3xl mx-auto">
        <header className="mb-8">
          <h1 className="font-headline text-4xl font-bold tracking-tight mb-4">{post.title}</h1>
          <Image
            src={post.imageUrl}
            alt={post.title}
            width={1200}
            height={600}
            className="rounded-lg object-cover w-full aspect-video"
            data-ai-hint={post.dataAiHint}
          />
        </header>
        <div 
            className="prose prose-lg dark:prose-invert max-w-none"
        >
          <ReactMarkdown rehypePlugins={[rehypeRaw]}>{post.content}</ReactMarkdown>
        </div>
      </article>
    </div>
  );
}
