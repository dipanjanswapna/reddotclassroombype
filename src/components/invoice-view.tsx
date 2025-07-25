

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
import Link from 'next/link';

type InvoiceViewProps = {
  invoice: Invoice;
  className?: string;
};

const Barcode = () => (
      <svg width="280" height="50" viewBox="0 0 280 50" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto">
          <path d="M1 1H4V49H1V1Z" fill="black"/>
          <path d="M7 1H9V49H7V1Z" fill="black"/>
          <path d="M12 1H15V49H12V1Z" fill="black"/>
          <path d="M18 1H21V49H18V1Z" fill="black"/>
          <path d="M23 1H24V49H23V1Z" fill="black"/>
          <path d="M26 1H28V49H26V1Z" fill="black"/>
          <path d="M31 1H32V49H31V1Z" fill="black"/>
          <path d="M35 1H39V49H35V1Z" fill="black"/>
          <path d="M42 1H43V49H42V1Z" fill="black"/>
          <path d="M46 1H48V49H46V1Z" fill="black"/>
          <path d="M51 1H52V49H51V1Z" fill="black"/>
          <path d="M55 1H56V49H55V1Z" fill="black"/>
          <path d="M59 1H63V49H59V1Z" fill="black"/>
          <path d="M66 1H68V49H66V1Z" fill="black"/>
          <path d="M71 1H72V49H71V1Z" fill="black"/>
          <path d="M74 1H78V49H74V1Z" fill="black"/>
          <path d="M81 1H83V49H81V1Z" fill="black"/>
          <path d="M86 1H88V49H86V1Z" fill="black"/>
          <path d="M91 1H94V49H91V1Z" fill="black"/>
          <path d="M97 1H98V49H97V1Z" fill="black"/>
          <path d="M101 1H105V49H101V1Z" fill="black"/>
          <path d="M108 1H109V49H108V1Z" fill="black"/>
          <path d="M112 1H115V49H112V1Z" fill="black"/>
          <path d="M118 1H120V49H118V1Z" fill="black"/>
          <path d="M123 1H124V49H123V1Z" fill="black"/>
          <path d="M127 1H128V49H127V1Z" fill="black"/>
          <path d="M131 1H133V49H131V1Z" fill="black"/>
          <path d="M136 1H138V49H136V1Z" fill="black"/>
          <path d="M141 1H145V49H141V1Z" fill="black"/>
          <path d="M148 1H149V49H148V1Z" fill="black"/>
          <path d="M152 1H153V49H152V1Z" fill="black"/>
          <path d="M156 1H158V49H156V1Z" fill="black"/>
          <path d="M161 1H163V49H161V1Z" fill="black"/>
          <path d="M166 1H167V49H166V1Z" fill="black"/>
          <path d="M170 1H173V49H170V1Z" fill="black"/>
          <path d="M176 1H179V49H176V1Z" fill="black"/>
          <path d="M182 1H183V49H182V1Z" fill="black"/>
          <path d="M186 1H187V49H186V1Z" fill="black"/>
          <path d="M190 1H191V49H190V1Z" fill="black"/>
          <path d="M194 1H197V49H194V1Z" fill="black"/>
          <path d="M200 1H204V49H200V1Z" fill="black"/>
          <path d="M207 1H208V49H207V1Z" fill="black"/>
          <path d="M211 1H214V49H211V1Z" fill="black"/>
          <path d="M217 1H221V49H217V1Z" fill="black"/>
          <path d="M224 1H225V49H224V1Z" fill="black"/>
          <path d="M228 1H230V49H228V1Z" fill="black"/>
          <path d="M233 1H235V49H233V1Z" fill="black"/>
          <path d="M238 1H239V49H238V1Z" fill="black"/>
          <path d="M242 1H245V49H242V1Z" fill="black"/>
          <path d="M248 1H250V49H248V1Z" fill="black"/>
          <path d="M253 1H254V49H253V1Z" fill="black"/>
          <path d="M257 1H261V49H257V1Z" fill="black"/>
          <path d="M264 1H265V49H264V1Z" fill="black"/>
          <path d="M268 1H270V49H268V1Z" fill="black"/>
          <path d="M273 1H274V49H273V1Z" fill="black"/>
          <path d="M277 1H278V49H277V1Z" fill="black"/>
      </svg>
  );

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
                         <h1 className="font-bold text-2xl text-gray-800">RED DOT CLASSROOM</h1>
                         <p className="text-xs text-gray-500">powered by prangons ecosystem</p>
                         <p className="text-xl font-semibold mt-2">Invoice</p>
                    </div>
                </div>
                <div className="text-right w-full sm:w-auto">
                    <p className="text-sm"><strong>Invoice #:</strong> {invoice.invoiceNumber}</p>
                    <p className="text-sm"><strong>Date:</strong> {format(safeToDate(invoice.invoiceDate), 'PPP')}</p>
                </div>
            </header>

            <section className="grid grid-cols-1 sm:grid-cols-2 gap-8 py-4 border-y">
                <div>
                    <p className="text-sm font-semibold text-gray-500 uppercase">Invoiced To:</p>
                    <p className="font-bold">{invoice.studentDetails.name}</p>
                    <p className="text-sm">RDC ID: {invoice.studentDetails.rdcId}</p>
                    <p className="text-sm">Phone: {invoice.studentDetails.phone}</p>
                    <p className="text-sm">Email: {invoice.studentDetails.email}</p>
                    {invoice.studentDetails.className && <p className="text-sm">Class: {invoice.studentDetails.className}</p>}
                    {invoice.studentDetails.nai && <p className="text-sm">NID/Birth Cert.: {invoice.studentDetails.nai}</p>}
                </div>
                <div className="sm:text-right">
                    <p className="text-sm font-semibold text-gray-500 uppercase">Paid To:</p>
                    <p className="font-bold">Red Dot Classroom</p>
                    <p className="text-sm">Mirpur DOHS, Dhaka, Bangladesh</p>
                    <div className="mt-2 text-sm space-y-1">
                        <p className="flex items-center justify-start sm:justify-end gap-2"><Mail className="h-4 w-4"/> support@reddotclassroom.com</p>
                        <p className="flex items-center justify-start sm:justify-end gap-2"><Globe className="h-4 w-4"/> rdc.vercel.app</p>
                    </div>
                </div>
            </section>
            
            <section className="mt-6">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead>
                            <tr className="bg-gray-100">
                                <th className="p-2 font-semibold uppercase">Course</th>
                                <th className="p-2 font-semibold uppercase text-right">Amount (BDT)</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr className="border-b">
                                <td className="p-2">
                                    <p className="font-medium">{invoice.courseDetails.name}</p>
                                    <p className="text-xs text-gray-500">{invoice.courseDetails.type}{invoice.courseDetails.cycleName ? ` - ${invoice.courseDetails.cycleName}` : ''}</p>
                                </td>
                                <td className="p-2 text-right font-medium">{invoice.financialSummary.totalFee.toFixed(2)}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </section>
            
            <section className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="text-sm space-y-2">
                    <p><strong>Payment Method:</strong> {invoice.paymentDetails.method}</p>
                    <p><strong>Payment Date:</strong> {format(safeToDate(invoice.paymentDetails.date), 'PPP')}</p>
                    <p><strong>Transaction ID:</strong> {invoice.paymentDetails.transactionId}</p>
                </div>
                <div className="space-y-1 text-sm bg-gray-50 p-4 rounded-md border">
                    <div className="flex justify-between"><span>Subtotal:</span><span>{invoice.financialSummary.totalFee.toFixed(2)}</span></div>
                    {invoice.financialSummary.discount > 0 && <div className="flex justify-between"><span>Discount:</span><span>({invoice.financialSummary.discount.toFixed(2)})</span></div>}
                    <Separator/>
                    <div className="flex justify-between font-bold"><span>Net Payable:</span><span>{invoice.financialSummary.netPayable.toFixed(2)}</span></div>
                    <div className="flex justify-between"><span>Amount Paid:</span><span>{invoice.financialSummary.amountPaid.toFixed(2)}</span></div>
                    <Separator/>
                    <div className="flex justify-between font-bold text-lg text-primary"><span>Due Amount:</span><span>{invoice.financialSummary.dueAmount.toFixed(2)}</span></div>
                </div>
            </section>

            {invoice.courseDetails.communityUrl && (
                <section className="mt-8 text-center bg-blue-50/50 p-6 rounded-lg font-bengali">
                    <h3 className="font-bold text-lg text-gray-800">Group Access Code :</h3>
                    <div className="flex items-center justify-center gap-2 mt-2 max-w-md mx-auto">
                        <p className="font-mono text-base bg-gray-200 px-4 py-2 rounded-md flex-grow text-center text-gray-700">{invoice.enrollmentId}</p>
                        <Button variant="success" size="sm" onClick={() => handleCopy(invoice.enrollmentId)}>
                            {copiedCode === invoice.enrollmentId ? <Check className="w-4 h-4"/> : <Copy className="w-4 w-4"/>}
                            <span className="ml-2 hidden sm:inline">Copy Code</span>
                        </Button>
                    </div>
                    <p className="text-xs text-gray-600 mt-3 px-4 leading-relaxed">
                        বি.দ্র. উপরের গ্রুপ এক্সেস কোডটি কপি করে নিচের লিংক / বাটনে ক্লিক করে গ্রুপে তোমার মোবাইল নম্বর, ইমেইল ও গ্রুপ এক্সেস কোড সঠিকভাবে পূরণ করে জয়েন রিকুয়েস্ট দাও। তোমার জয়েন রিকুয়েস্টটি সর্বোচ্চ ২৪-৪৮ ঘন্টার মধ্যে এপ্রুভ করা হবে ইনশাআল্লাহ্। ♥️
                    </p>
                    <Button variant="social" asChild className="mt-4 font-bold">
                        <Link href={invoice.courseDetails.communityUrl} target="_blank" rel="noopener noreferrer"><Facebook className="mr-2 h-4 w-4"/> Join Secret Group</Link>
                    </Button>
                     <p className="text-xs text-gray-500 mt-2 break-all">{invoice.courseDetails.communityUrl}</p>
                </section>
            )}
            
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
