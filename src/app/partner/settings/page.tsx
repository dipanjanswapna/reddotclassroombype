
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function SellerSettingsPage() {
  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8">
      <div>
        <h1 className="font-headline text-3xl font-bold tracking-tight">Seller Settings</h1>
        <p className="text-lg text-muted-foreground">Manage your organization's account and payout details.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Payout Method</CardTitle>
          <CardDescription>Set up how you want to receive your earnings.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="bank-name">Bank Name</Label>
              <Input id="bank-name" placeholder="e.g., City Bank" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="account-name">Account Name</Label>
              <Input id="account-name" placeholder="e.g., Your Organization Name" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="account-number">Account Number</Label>
              <Input id="account-number" placeholder="e.g., 1234567890" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="routing-number">Routing Number</Label>
              <Input id="routing-number" placeholder="e.g., 12345" />
            </div>
          </div>
        </CardContent>
        <div className="p-6 pt-0">
          <Button>Save Payout Details</Button>
        </div>
      </Card>
    </div>
  );
}
