import Image from "next/image";
import Link from "next/link";
import { Star, Users } from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type CourseCardProps = {
  id: string;
  title: string;
  instructor: string;
  imageUrl: string;
  category: string;
  rating: number;
  reviews: number;
  price: string;
  dataAiHint?: string;
};

export function CourseCard({ id, title, instructor, imageUrl, category, rating, reviews, price, dataAiHint }: CourseCardProps) {
  return (
    <Card className="flex flex-col h-full overflow-hidden transition-all hover:shadow-lg hover:-translate-y-1">
      <CardHeader className="p-0">
        <Link href={`/courses/${id}`}>
          <Image
            src={imageUrl}
            alt={title}
            width={600}
            height={400}
            className="w-full h-48 object-cover"
            data-ai-hint={dataAiHint}
          />
        </Link>
      </CardHeader>
      <CardContent className="p-4 flex-grow">
        <div className="flex justify-between items-center mb-2">
            <Badge variant="secondary">{category}</Badge>
            <p className="font-headline text-lg font-bold text-primary">{price}</p>
        </div>
        <Link href={`/courses/${id}`}>
          <CardTitle className="font-headline text-lg leading-snug hover:text-primary transition-colors">{title}</CardTitle>
        </Link>
        <p className="text-muted-foreground text-sm mt-2">By {instructor}</p>
      </CardContent>
      <CardFooter className="p-4 pt-0 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 text-yellow-400">
            <Star className="w-4 h-4 fill-current" />
            <span className="font-bold text-foreground">{rating}</span>
          </div>
          <div className="flex items-center gap-1 text-muted-foreground text-sm">
            <span>({reviews} reviews)</span>
          </div>
        </div>
        <Link href={`/courses/${id}`} className="text-sm font-semibold text-primary hover:underline">View Details</Link>
      </CardFooter>
    </Card>
  );
}
