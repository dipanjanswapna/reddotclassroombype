
'use client';

import { useState } from 'react';
import { notFound, useParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, Copy, Check, Info, ShieldCheck, Facebook, MessageSquare } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import Link from 'next/link';
import { useAuth } from '@/context/auth-context';
import { motion } from 'framer-motion';

export default function CourseCommunityPage() {
  const { toast } = useToast();
  const { userInfo } = useAuth();
  const [copied, setCopied] = useState(false);
  const params = useParams();
  const courseId = params.courseId as string;
  const accessCode = userInfo ? `RDC-${courseId.slice(0, 4).toUpperCase()}-${userInfo.uid.slice(-4).toUpperCase()}` : '';

  const handleCopy = () => {
    if (!accessCode) return;
    navigator.clipboard.writeText(accessCode);
    setCopied(true);
    toast({ title: 'Code Copied!', description: 'Your access code has been copied.' });
    setTimeout(() => setCopied(false), 2000);
  };
  
  const communityUrl = "https://www.facebook.com/groups/rdc.main"; 

  return (
    <div className="space-y-6">
      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex flex-col gap-2 border-l-4 border-primary pl-3"
      >
        <h1 className="font-headline text-2xl font-black uppercase tracking-tight text-foreground">Peer <span className="text-primary">Community</span></h1>
        <p className="text-[10px] md:text-sm text-muted-foreground font-medium">Join exclusive groups for top achievers.</p>
      </motion.div>

      {communityUrl ? (
          <div className="max-w-2xl mx-auto">
            <Card className="rounded-[25px] border-primary/20 shadow-2xl overflow-hidden bg-card border-2">
                <CardHeader className="bg-primary/5 p-6 md:p-8 border-b border-primary/10 text-center">
                    <div className="inline-block p-3 bg-primary/10 rounded-2xl mb-4">
                        <Users className="w-10 h-10 text-primary" />
                    </div>
                    <CardTitle className="text-xl md:text-2xl font-black uppercase tracking-tight">Exclusive Access</CardTitle>
                    <CardDescription className="text-[10px] md:text-xs font-bold uppercase tracking-widest mt-1">
                        Verified Students Only
                    </CardDescription>
                </CardHeader>
                <CardContent className="p-6 md:p-8 space-y-6">
                    <div className="bg-muted/30 p-5 rounded-[20px] border border-dashed border-primary/20 relative group overflow-hidden">
                        <div className="absolute top-0 right-0 p-3 opacity-5 rotate-12"><ShieldCheck className="w-16 h-16"/></div>
                        <h3 className="font-black text-[8px] uppercase tracking-[0.2em] text-primary mb-3 flex items-center gap-1.5">
                            <ShieldCheck className="w-3 h-3" /> Secret Access Code
                        </h3>
                        <div className="flex flex-col xs:flex-row items-center gap-3 relative z-10">
                            <div className="flex-grow h-12 bg-white dark:bg-black rounded-xl border border-primary/10 flex items-center justify-center px-4 font-mono text-lg md:text-xl font-black tracking-[0.2em] text-foreground shadow-inner w-full">
                                {accessCode}
                            </div>
                            <Button 
                                variant="outline" 
                                size="sm" 
                                className="h-12 px-6 rounded-xl font-black uppercase tracking-widest text-[9px] border-primary/20 hover:bg-primary hover:text-white transition-all shadow-md w-full xs:w-auto" 
                                onClick={handleCopy}
                            >
                                {copied ? <Check className="mr-1.5 h-3.5 w-3.5" /> : <Copy className="mr-1.5 h-3.5 w-3.5" />}
                                {copied ? 'Copied' : 'Copy'}
                            </Button>
                        </div>
                        <p className="text-[9px] font-bold text-muted-foreground mt-4 leading-relaxed bg-white/50 dark:bg-black/20 p-2.5 rounded-lg border border-white/20">
                            বি.দ্র. এই কোডটি গোপন রাখুন। গ্রুপে জয়েন রিকোয়েস্ট দেওয়ার সময় এটি প্রদান করতে হবে।
                        </p>
                    </div>

                    <div className="space-y-3">
                        <Button asChild size="lg" className="w-full h-14 rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-primary/20 bg-[#1877F2] hover:bg-[#166fe5] border-none group">
                            <Link href={communityUrl} target="_blank" rel="noopener noreferrer">
                                <Facebook className="mr-2.5 h-5 w-5 transition-transform group-hover:scale-110" />
                                Join Facebook Group
                            </Link>
                        </Button>
                    </div>
                </CardContent>
                <CardFooter className="bg-muted/20 p-4 flex justify-center gap-6 border-t border-primary/5">
                    <div className="flex items-center gap-1.5 opacity-60">
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span className="text-[8px] font-black uppercase tracking-tighter">Support</span>
                    </div>
                    <div className="flex items-center gap-1.5 opacity-60">
                        <Users className="w-3.5 h-3.5" />
                        <span className="text-[8px] font-black uppercase tracking-tighter">Peers</span>
                    </div>
                </CardFooter>
            </Card>
        </div>
      ) : (
        <div className="text-center py-20 bg-muted/5 border-2 border-dashed border-primary/10 rounded-[25px] flex flex-col items-center">
            <Info className="w-12 h-12 text-primary/20 mx-auto mb-4" />
            <p className="text-muted-foreground font-black uppercase tracking-widest text-[10px] opacity-40">No dedicated group for this course yet</p>
        </div>
      )}
    </div>
  );
}
