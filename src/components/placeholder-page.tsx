
import { PackageOpen } from "lucide-react";

type PlaceholderPageProps = {
    title: string;
    description: string;
}

export function PlaceholderPage({ title, description }: PlaceholderPageProps) {
    return (
        <div className="flex flex-col items-center justify-center text-center h-full p-4 sm:p-6 lg:p-8">
            <div className="p-4 bg-muted rounded-full mb-4">
                <PackageOpen className="w-12 h-12 text-muted-foreground" />
            </div>
            <h1 className="font-headline text-3xl font-bold tracking-tight">{title}</h1>
            <p className="mt-2 text-lg text-muted-foreground max-w-md">
                {description}
            </p>
        </div>
    )
}
