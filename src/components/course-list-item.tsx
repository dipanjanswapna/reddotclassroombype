import Image from 'next/image';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';

type CourseListItemProps = {
  id: string;
  category: string;
  features: string[];
  price: string;
  imageTitle: string;
  imageUrl: string;
  dataAiHint: string;
};

export function CourseListItem({ id, category, features, price, imageTitle, imageUrl, dataAiHint }: CourseListItemProps) {
  return (
    <Link href={`/courses/${id}`} className="block rounded-lg transition-all hover:-translate-y-1 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-primary">
      <Card className="flex h-full overflow-hidden rounded-lg bg-card">
        <div className="flex w-full flex-col p-4 sm:w-1/2 sm:flex-row">
            <div className="flex flex-col justify-between">
                <div>
                    <p className="text-sm text-muted-foreground">{category}</p>
                    <ul className="mt-2 space-y-1">
                    {features.map((feature, index) => (
                        <li key={index} className="flex items-center text-xs">
                        <Check className="mr-2 h-3 w-3 text-green-500" />
                        <span>{feature}</span>
                        </li>
                    ))}
                    </ul>
                    <p className="mt-4 text-lg font-bold text-primary">{price}</p>
                </div>
                <Button variant="accent" className="mt-4 w-full bg-green-500 font-bold text-white hover:bg-green-600">
                    Enroll Now
                </Button>
            </div>
        </div>
        <div className="relative hidden w-1/2 sm:block">
          <div className="absolute top-0 left-0 right-0 flex h-8 items-center justify-center bg-red-600">
            <h3 className="text-lg font-bold text-white">{imageTitle}</h3>
          </div>
          <Image
            src={imageUrl}
            alt={imageTitle}
            width={300}
            height={400}
            className="h-full w-full object-cover"
            data-ai-hint={dataAiHint}
          />
        </div>
      </Card>
    </Link>
  );
}
