import Image from "next/image";
import Link from "next/link";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type CourseCardProps = {
  id: string;
  title: string;
  instructor?: string;
  imageUrl: string;
  category?: string;
  price?: string;
  dataAiHint?: string;
};

export function CourseCard({ id, title, instructor, imageUrl, category, price, dataAiHint }: CourseCardProps) {
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
        {instructor && <p className="text-muted-foreground text-sm mt-2">By {instructor}</p>}
      </CardContent>
      {price && (
        <CardFooter className="p-4 pt-0">
            <p className="font-headline text-lg font-bold text-primary">{price}</p>
        </CardFooter>
      )}
    </Card>
  );
}
