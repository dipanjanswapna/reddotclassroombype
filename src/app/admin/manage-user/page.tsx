
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Loader2, Search } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { findUserByRegistrationOrRoll } from '@/app/actions/user.actions';

export default function ManageUserSearchPage() {
    const [searchTerm, setSearchTerm] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();
    const { toast } = useToast();

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!searchTerm.trim()) {
            toast({ title: "Error", description: "Please enter a User ID or Roll Number.", variant: "destructive" });
            return;
        }
        setIsLoading(true);
        const result = await findUserByRegistrationOrRoll(searchTerm.trim());

        if (result.userId) {
            router.push(`/admin/manage-user/${result.userId}`);
        } else {
            toast({
                title: "User Not Found",
                description: `No user found with the ID or Roll: ${searchTerm}`,
                variant: "destructive"
            });
            setIsLoading(false);
        }
    };

    return (
        <div className="p-4 sm:p-6 lg:p-8 space-y-8">
            <div>
                <h1 className="font-headline text-3xl font-bold tracking-tight">Manage User Profile</h1>
                <p className="mt-1 text-lg text-muted-foreground">
                    Find and manage any user by their Registration Number or Class Roll.
                </p>
            </div>
            <Card className="max-w-xl mx-auto">
                <CardHeader>
                    <CardTitle>Find User</CardTitle>
                    <CardDescription>Enter the user's ID to view and edit their complete profile.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSearch} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="search-term">User Registration No. or Roll No.</Label>
                            <Input
                                id="search-term"
                                placeholder="e.g., 12345678"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <Button type="submit" className="w-full" disabled={isLoading}>
                            {isLoading ? <Loader2 className="mr-2 animate-spin" /> : <Search className="mr-2" />}
                            Search User
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
