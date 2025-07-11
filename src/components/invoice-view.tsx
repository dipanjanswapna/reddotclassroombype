
'use client';

import React, { useRef, useState } from 'react';
import Image from 'next/image';
import { Button } from './ui/button';
import { Download, Loader2, Copy, Check, Mail, Globe, Facebook, Printer } from 'lucide-react';
import { useToast } from './ui/use-toast';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import logoSrc from '@/public/logo.png';
import { Invoice } from '@/lib/types';
import { format } from 'date-fns';
import { safeToDate } from '@/lib/utils';
import { Separator } from './ui/separator';

type InvoiceViewProps = {
  invoice: Invoice;
  className?: string;
};

export function InvoiceView({ invoice, className }: InvoiceViewProps) {
  const printAreaRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const [isDownloading, setIsDownloading] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  
  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    toast({ title: 'Code Copied!' });
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleDownload = async () => {
    const element = printAreaRef.current;
    if (!element) return;
    
    setIsDownloading(true);
    toast({ title: 'Generating PDF...', description: 'Please wait a moment.' });

    try {
        const canvas = await html2canvas(element, { 
            scale: 2, // Higher scale for better quality
            useCORS: true,
            backgroundColor: '#ffffff'
        });
        
        const imgData = canvas.toDataURL('image/png');
        
        // A4 size in points: 595.28 x 841.89
        const pdf = new jsPDF({
            orientation: 'portrait',
            unit: 'pt',
            format: 'a4'
        });
        
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        
        const imgWidth = canvas.width;
        const imgHeight = canvas.height;
        const ratio = imgWidth / imgHeight;

        let finalWidth = pdfWidth - 40; // 20pt margin on each side
        let finalHeight = finalWidth / ratio;

        if (finalHeight > pdfHeight - 40) {
            finalHeight = pdfHeight - 40;
            finalWidth = finalHeight * ratio;
        }

        const x = (pdfWidth - finalWidth) / 2;
        const y = 20; // 20pt margin from top
        
        pdf.addImage(imgData, 'PNG', x, y, finalWidth, finalHeight);
        pdf.save(`${invoice.invoiceNumber}.pdf`);

    } catch (error) {
        console.error("Failed to generate PDF:", error);
        toast({ title: 'Error', description: 'Could not generate PDF.', variant: 'destructive'});
    } finally {
        setIsDownloading(false);
    }
  };

  const handlePrint = () => {
      window.print();
  }

  return (
    <div className={`flex flex-col items-center gap-6 p-4 bg-gray-100 dark:bg-gray-900 ${className}`}>
        <style jsx global>{`
            @media print {
                body * {
                    visibility: hidden;
                }
                #printable-invoice, #printable-invoice * {
                    visibility: visible;
                }
                #printable-invoice {
                    position: absolute;
                    left: 0;
                    top: 0;
                    width: 100%;
                }
            }
        `}</style>
        <div id="printable-invoice" ref={printAreaRef} className="bg-white p-6 sm:p-8 rounded-lg w-full max-w-4xl text-gray-800 shadow-lg border">
            <header className="flex flex-col sm:flex-row justify-between items-start pb-6 gap-4">
                <div className="flex items-center gap-4">
                    <Image src={logoSrc} alt="RED DOT CLASSROOM Logo" className="h-16 w-auto" />
                    <div>
                         <h1 className="font-bold text-2xl text-gray-800">RDC Classroom</h1>
                         <p className="text-xs text-gray-500">SINCE 2018</p>
                         <p className="text-xl font-semibold mt-2">Invoice</p>
                    </div>
                </div>
                <div className="text-right w-full sm:w-auto">
                    <Image src="https://placehold.co/120x120.png?text=QR" alt="QR Code" width={120} height={120} data-ai-hint="qr code"/>
                </div>
            </header>

            <section className="grid grid-cols-1 sm:grid-cols-2 gap-8 py-4 border-y">
                <div>
                    <p className="text-sm"><strong>Date:</strong> {format(safeToDate(invoice.invoiceDate), 'yyyy-MM-dd HH:mm:ss')}</p>
                    <p className="text-sm mt-4"><strong>Invoiced To:</strong></p>
                    <p className="font-bold">{invoice.studentDetails.name}</p>
                    <p className="text-sm">{invoice.studentDetails.phone}</p>
                    <p className="text-sm">{invoice.studentDetails.email}</p>
                    <p className="text-sm">{invoice.studentDetails.className}</p>
                    <p className="text-sm">{invoice.studentDetails.nai}</p>
                </div>
                <div className="sm:text-right">
                    <p className="text-sm"><strong>Status:</strong> <span className="font-semibold text-green-600 uppercase">{invoice.status}</span></p>
                    <p className="text-sm mt-4"><strong>Paid To:</strong></p>
                    <p className="font-bold">RDC Classroom</p>
                    <p className="text-sm">Mirpur DOHS, Dhaka, Bangladesh</p>
                    <div className="mt-2 text-sm space-y-1">
                        <p className="flex items-center justify-start sm:justify-end gap-2"><Mail className="h-4 w-4"/> support@reddotclassroom.com</p>
                        <p className="flex items-center justify-start sm:justify-end gap-2"><Globe className="h-4 w-4"/> rdc.vercel.app</p>
                        <p className="flex items-center justify-start sm:justify-end gap-2"><Facebook className="h-4 w-4"/> RDC Students Group</p>
                    </div>
                </div>
            </section>
            
            <section className="mt-6">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead>
                            <tr className="bg-gray-100">
                                <th className="p-2 font-semibold uppercase">Course</th>
                                <th className="p-2 font-semibold uppercase">Cycle</th>
                                <th className="p-2 font-semibold uppercase">Gateway</th>
                                <th className="p-2 font-semibold uppercase">Coupon</th>
                                <th className="p-2 font-semibold uppercase text-right">Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr className="border-b">
                                <td className="p-2">{invoice.courseDetails.name}</td>
                                <td className="p-2">{invoice.courseDetails.cycleName || "N/A"}</td>
                                <td className="p-2">{invoice.paymentDetails.method}</td>
                                <td className="p-2">{invoice.coupon || 'N/A'}</td>
                                <td className="p-2 text-right font-semibold">BDT {invoice.financialSummary.netPayable.toFixed(2)}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </section>

            <section className="mt-8 text-center bg-gray-50 p-6 rounded-lg">
                <h3 className="font-bold text-lg">Group Access Code:</h3>
                <div className="flex items-center justify-center gap-2 mt-2 max-w-md mx-auto">
                    <p className="font-mono text-lg bg-gray-200 px-4 py-2 rounded-md flex-grow text-center">{invoice.enrollmentId}</p>
                    <Button size="sm" onClick={() => handleCopy(invoice.enrollmentId)}>
                        {copiedCode === invoice.enrollmentId ? <Check className="w-4 h-4"/> : <Copy className="w-4 h-4"/>}
                        <span className="ml-2 hidden sm:inline">Copy Code</span>
                    </Button>
                </div>
                <p className="text-xs text-gray-500 mt-2 px-4">বি.দ্র. উপরের গ্রুপ এক্সেস কোডটি কপি করে নিচের লিংক / বাটনে ক্লিক করে গ্রুপে তোমার মোবাইল নম্বর, ইমেইল ও গ্রুপ এক্সেস কোড সঠিকভাবে পূরণ করে জয়েন রিকুয়েস্ট দাও। তোমার জয়েন রিকুয়েস্টটি সর্বোচ্চ ২৪-৪৮ ঘন্টার মধ্যে এপ্রুভ করা হবে ইনশাআল্লাহ্। ♥️</p>
                <Button variant="outline" asChild className="mt-4 border-blue-600 text-blue-600 hover:bg-blue-50 hover:text-blue-700">
                    <a href="https://www.facebook.com/groups/rdc.main" target="_blank" rel="noopener noreferrer"><Facebook className="mr-2 h-4 w-4"/> Join Secret Group</a>
                </Button>
                <p className="text-sm font-semibold text-blue-600 mt-2"><a href="https://www.facebook.com/groups/rdc.main" target="_blank" rel="noopener noreferrer">https://www.facebook.com/groups/rdc.main</a></p>
            </section>
            
            <footer className="mt-12 pt-6 border-t text-center text-xs text-gray-500">
                 <p>This is a digital invoice. You can find this on rdc.vercel.app/student/payments</p>
            </footer>
        </div>
        
        <div className="flex gap-4">
            <Button onClick={handleDownload} disabled={isDownloading}>
                {isDownloading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                    <Download className="mr-2 h-4 w-4" />
                )}
                Download
            </Button>
             <Button variant="outline" onClick={handlePrint}>
                <Printer className="mr-2 h-4 w-4" />
                Print
            </Button>
        </div>
    </div>
  );
}
