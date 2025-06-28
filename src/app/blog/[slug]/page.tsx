import { notFound } from 'next/navigation';
import Image from 'next/image';
import { blogPosts } from '@/lib/mock-data';
import type { Metadata } from 'next';

const getPostBySlug = (slug: string) => {
  return blogPosts.find((post) => post.slug === slug);
};

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const post = getPostBySlug(params.slug);

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
  const post = getPostBySlug(params.slug);

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
            dangerouslySetInnerHTML={{ __html: post.content }}
        />
      </article>
    </div>
  );
}
