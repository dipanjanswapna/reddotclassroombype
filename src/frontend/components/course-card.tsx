
import Image from "next/image";
import Link from "next/link";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Course } from "@/lib/mock-data";

type CourseCardProps = Partial<Course>;

export function CourseCard({ id, title, instructors, imageUrl, category, price, dataAiHint, isArchived }: CourseCardProps) {
  if (!id || !title || !imageUrl) {
    return null;
  }
  
  return (
    <Card className="flex flex-col h-full overflow-hidden transition-all hover:shadow-lg hover:-translate-y-1 rounded-lg bg-card">
      <CardHeader className="p-0">
        <Link href={`/courses/${id}`}>
          <Image
            src={imageUrl}
            alt={title}
            width={600}
            height={400}
            className="w-full h-auto object-cover aspect-[16/10]"
            data-ai-hint={dataAiHint}
          />
        </Link>
      </CardHeader>
      <CardContent className="p-4 flex-grow">
        {category && <Badge variant="outline" className="mb-2 text-primary border-primary">{category}</Badge>}
        <Link href={`/courses/${id}`}>
          <h3 className="font-headline text-base font-bold leading-snug hover:text-primary transition-colors">{title}</h3>
        </Link>
        {instructors && instructors.length > 0 && <p className="text-muted-foreground text-sm mt-2">By {instructors[0].name}</p>}
      </CardContent>
      <CardFooter className="p-4 pt-0">
        {isArchived ? (
            <Badge variant="secondary">Enrollment Closed</Badge>
        ) : (
            price && <p className="font-headline text-lg font-bold text-primary">{price}</p>
        )}
      </CardFooter>
    </Card>
  );
}
