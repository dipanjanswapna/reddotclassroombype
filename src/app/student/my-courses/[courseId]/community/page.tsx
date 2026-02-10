
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
    <div className="space-y-10">
      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex flex-col gap-2 border-l-4 border-primary pl-4"
      >
        <h1 className="font-headline text-3xl font-black tracking-tight uppercase">Peer <span className="text-primary">Community</span></h1>
        <p className="mt-1 text-muted-foreground font-medium">Join secret discussion groups and learn with fellow top achievers.</p>
      </motion.div>

      {communityUrl ? (
          <div className="max-w-3xl mx-auto">
            <Card className="rounded-[30px] border-primary/20 shadow-2xl overflow-hidden bg-card border-2">
                <CardHeader className="bg-primary/5 p-8 md:p-10 border-b border-primary/10 text-center">
                    <div className="inline-block p-4 bg-primary/10 rounded-3xl mb-6">
                        <Users className="w-12 h-12 text-primary" />
                    </div>
                    <CardTitle className="text-2xl md:text-3xl font-black uppercase tracking-tight">Exclusive Access Group</CardTitle>
                    <CardDescription className="text-sm md:text-base font-medium mt-2">
                        This is a restricted community for verified students only. 
                    </CardDescription>
                </CardHeader>
                <CardContent className="p-8 md:p-10 space-y-8">
                    <div className="bg-muted/30 p-6 rounded-[20px] border border-dashed border-primary/20 relative group overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-5 rotate-12"><ShieldCheck className="w-20 h-20"/></div>
                        <h3 className="font-black text-[10px] uppercase tracking-[0.2em] text-primary mb-4 flex items-center gap-2">
                            <ShieldCheck className="w-4 h-4" /> Your Secret Access Code
                        </h3>
                        <div className="flex flex-col sm:flex-row items-center gap-4 relative z-10">
                            <div className="flex-grow h-14 bg-white dark:bg-black rounded-xl border border-primary/10 flex items-center justify-center px-6 font-mono text-xl md:text-2xl font-black tracking-[0.3em] text-foreground shadow-inner w-full sm:w-auto">
                                {accessCode}
                            </div>
                            <Button 
                                variant="outline" 
                                size="lg" 
                                className="h-14 px-8 rounded-xl font-black uppercase tracking-widest text-[10px] border-primary/20 hover:bg-primary hover:text-white transition-all shadow-lg w-full sm:w-auto" 
                                onClick={handleCopy}
                            >
                                {copied ? <Check className="mr-2 h-4 w-4" /> : <Copy className="mr-2 h-4 w-4" />}
                                {copied ? 'Copied' : 'Copy Code'}
                            </Button>
                        </div>
                        <p className="text-[10px] md:text-[11px] font-bold text-muted-foreground mt-6 leading-relaxed bg-white/50 dark:bg-black/20 p-3 rounded-lg border border-white/20">
                            বি.দ্র. এই কোডটি গোপন রাখুন। গ্রুপে জয়েন রিকোয়েস্ট দেওয়ার সময় এটি প্রদান করতে হবে। আপনার জয়েন রিকোয়েস্টটি সর্বোচ্চ ২৪-৪৮ ঘন্টার মধ্যে এপ্রুভ করা হবে ইনশাআল্লাহ্।
                        </p>
                    </div>

                    <div className="space-y-4">
                        <Button asChild size="lg" className="w-full h-16 rounded-[20px] font-black uppercase tracking-widest text-sm shadow-xl shadow-primary/20 bg-[#1877F2] hover:bg-[#166fe5] border-none group">
                            <Link href={communityUrl} target="_blank" rel="noopener noreferrer">
                                <Facebook className="mr-3 h-6 w-6 transition-transform group-hover:scale-110" />
                                Join Official Facebook Group
                            </Link>
                        </Button>
                        <p className="text-center text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-60">Verified Community Portal</p>
                    </div>
                </CardContent>
                <CardFooter className="bg-muted/20 p-6 flex justify-center gap-8 border-t border-primary/5">
                    <div className="flex items-center gap-2 opacity-60">
                        <MessageSquare className="w-4 h-4" />
                        <span className="text-[10px] font-black uppercase tracking-tighter">24/7 Discussions</span>
                    </div>
                    <div className="flex items-center gap-2 opacity-60">
                        <Users className="w-4 h-4" />
                        <span className="text-[10px] font-black uppercase tracking-tighter">Peer Learning</span>
                    </div>
                </CardFooter>
            </Card>
        </div>
      ) : (
        <div className="text-center py-24 bg-muted/5 border-2 border-dashed border-primary/10 rounded-[30px] flex flex-col items-center">
            <Info className="w-16 h-16 text-primary/20 mx-auto mb-6" />
            <p className="text-muted-foreground font-black uppercase tracking-widest text-xs opacity-40">No dedicated group for this course yet</p>
            <Button asChild variant="outline" className="mt-6 rounded-xl font-bold uppercase text-[10px] tracking-widest px-8">
                <Link href="/student/community">Visit Main Community</Link>
            </Button>
        </div>
      )}

    </div>
  );
}
