import Image from "next/image";
import Link from "next/link";
import { Star, Users } from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

type CourseCardProps = {
  id: string;
  title: string;
  instructor: string;
  imageUrl: string;
  category: string;
  rating: number;
  reviews: number;
  dataAiHint?: string;
};

export function CourseCard({ id, title, instructor, imageUrl, category, rating, reviews, dataAiHint }: CourseCardProps) {
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
        <Badge variant="secondary" className="mb-2">{category}</Badge>
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
          <div className="flex items-center gap-1 text-muted-foreground">
            <Users className="w-4 h-4" />
            <span>({reviews})</span>
          </div>
        </div>
        <Button asChild size="sm" variant="outline">
          <Link href={`/courses/${id}`}>View Details</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
