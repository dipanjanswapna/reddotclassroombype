
import type { Metadata } from 'next';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { MapPin, Wifi, Users, BookOpen } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const metadata: Metadata = {
  title: 'RDC OFFLINE HUB',
  description: 'Welcome to the Red Dot Classroom Offline Hub. Find our centers, facilities, and upcoming events.',
};

const features = [
  {
    icon: MapPin,
    title: 'Convenient Locations',
    description: 'Our hubs are strategically located for easy access.',
  },
  {
    icon: Wifi,
    title: 'Modern Facilities',
    description: 'Equipped with high-speed internet and modern learning tools.',
  },
  {
    icon: Users,
    title: 'Expert Instructors',
    description: 'Learn from the best, both online and offline.',
  },
   {
    icon: BookOpen,
    title: 'Rich Library',
    description: 'Access to a vast collection of books and study materials.',
  },
];

export default function OfflineHubPage() {
  return (
    <div className="bg-background">
      <section className="relative bg-secondary/50 py-20">
        <div className="absolute inset-0">
          <Image
            src="https://placehold.co/1200x400.png"
            alt="Offline Hub"
            layout="fill"
            objectFit="cover"
            className="opacity-20"
            data-ai-hint="library classroom"
          />
        </div>
        <div className="container mx-auto px-4 text-center relative">
          <h1 className="font-headline text-5xl font-bold tracking-tight">RDC OFFLINE HUB</h1>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            Your gateway to a blended learning experience. Discover our offline centers and enhance your studies with in-person support.
          </p>
           <Button className="mt-8" size="lg">Find a Center Near You</Button>
        </div>
      </section>

      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
            <h2 className="font-headline text-3xl font-bold">Why Visit Our Hubs?</h2>
            <p className="text-muted-foreground mt-2">Experience the best of both worlds with our state-of-the-art facilities.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
                <Card key={index} className="text-center">
                    <CardHeader>
                        <div className="mx-auto bg-primary/10 rounded-full p-3 w-fit">
                            <feature.icon className="h-8 w-8 text-primary" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <h3 className="text-lg font-bold">{feature.title}</h3>
                        <p className="text-muted-foreground mt-2">{feature.description}</p>
                    </CardContent>
                </Card>
            ))}
        </div>
      </section>
      
       <section className="bg-muted py-16">
        <div className="container mx-auto px-4 text-center">
             <h2 className="font-headline text-3xl font-bold">Our Locations</h2>
             <p className="text-muted-foreground mt-2 mb-8">We are constantly expanding. Find our current offline centers below.</p>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                 <Card>
                    <CardHeader>
                        <CardTitle>Dhaka Hub (Main)</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p>123 Education Lane, Dhanmondi, Dhaka-1205</p>
                        <p><strong>Hours:</strong> 9am - 8pm, Sat-Thu</p>
                        <Button variant="link" className="p-0 h-auto mt-2">Get Directions</Button>
                    </CardContent>
                 </Card>
                  <Card>
                    <CardHeader>
                        <CardTitle>Chittagong Hub</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p>456 Knowledge Street, GEC Circle, Chittagong</p>
                        <p><strong>Hours:</strong> 10am - 7pm, Sat-Thu</p>
                        <Button variant="link" className="p-0 h-auto mt-2">Get Directions</Button>
                    </CardContent>
                 </Card>
             </div>
        </div>
      </section>
    </div>
  );
}
