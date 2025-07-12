
'use client';

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, Banknote, User } from "lucide-react";
import { saveUserAction } from "@/app/actions/user.actions";
import { useAuth } from "@/context/auth-context";
import { LoadingSpinner } from "@/components/loading-spinner";

export default function SellerProfilePage() {
    const { toast } = useToast();
    const { userInfo, loading: authLoading, refreshUserInfo } = useAuth();
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    // State for personal information
    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    
    // State for payment info
    const [paymentMethod, setPaymentMethod] = useState("bKash");
    const [paymentNumber, setPaymentNumber] = useState("");
    
    useEffect(() => {
        if (userInfo) {
            setFullName(userInfo.name || "");
            setEmail(userInfo.email || "");
            setLoading(false);
        } else if (!authLoading) {
            setLoading(false);
        }
    }, [userInfo, authLoading]);

    const handleSave = async () => {
        if (!userInfo?.id) return;
        setIsSaving(true);
        try {
            await saveUserAction({ id: userInfo.id, name: fullName });
            await refreshUserInfo();
            toast({
                title: "Profile Updated",
                description: "Your personal information has been saved.",
            });
        } catch (error) {
            toast({ title: 'Error', description: 'Failed to update profile.', variant: 'destructive'});
        } finally {
            setIsSaving(false);
        }
    };
    
    if (loading || authLoading) {
        return (
            <div className="flex items-center justify-center h-[calc(100vh-8rem)]">
                <LoadingSpinner className="w-12 h-12" />
            </div>
        );
    }

    if (!userInfo) {
        return <p className="p-8">Could not load seller profile. Please try logging in again.</p>
    }

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8">
      <div>
        <h1 className="font-headline text-3xl font-bold tracking-tight">Seller Profile</h1>
        <p className="text-muted-foreground">Manage your account and payment information.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-8">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><User /> Primary Contact Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="regNumber">Staff ID</Label>
                        <Input id="regNumber" value={userInfo.registrationNumber || 'N/A'} readOnly className="cursor-not-allowed bg-muted" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="fullName">Contact Name</Label>
                        <Input id="fullName" value={fullName} onChange={e => setFullName(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="email">Contact Email Address</Label>
                        <Input id="email" type="email" value={email} readOnly disabled/>
                    </div>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Banknote /> Payout Information</CardTitle>
                    <CardDescription>How you would like to receive your commissions.</CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <div className="space-y-2">
                        <Label htmlFor="paymentMethod">Payment Method</Label>
                        <Input id="paymentMethod" value={paymentMethod} readOnly disabled />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="paymentNumber">bKash Number</Label>
                        <Input id="paymentNumber" value={paymentNumber} onChange={e => setPaymentNumber(e.target.value)} placeholder="e.g., 01700000000" />
                    </div>
                </CardContent>
            </Card>
          </div>
          <div className="md:col-span-1 space-y-8">
             <Button onClick={handleSave} disabled={isSaving} className="w-full">
                {isSaving ? <Loader2 className="mr-2 animate-spin"/> : null}
                Save Changes
            </Button>
          </div>
      </div>
    </div>
  );
}
