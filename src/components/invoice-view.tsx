'use client';

import React, { useRef, useState } from 'react';
import Image from 'next/image';
import { Button } from './ui/button';
import { Download, Loader2 } from 'lucide-react';
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

  const handleDownload = async () => {
    const element = printAreaRef.current;
    if (!element) return;
    
    setIsDownloading(true);
    toast({ title: 'Generating PDF...', description: 'Please wait a moment.' });

    try {
        const canvas = await html2canvas(element, { 
            scale: 2, // Use a scale of 2 for better resolution
            useCORS: true,
            backgroundColor: '#ffffff'
        });
        
        const imgData = canvas.toDataURL('image/png');
        
        const pdf = new jsPDF({
            orientation: 'portrait',
            unit: 'px',
            format: [canvas.width, canvas.height] // Set PDF size to canvas size
        });
        
        pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
        pdf.save(`${invoice.invoiceNumber}.pdf`);

    } catch (error) {
        console.error("Failed to generate PDF:", error);
        toast({ title: 'Error', description: 'Could not generate PDF.', variant: 'destructive'});
    } finally {
        setIsDownloading(false);
    }
  };

  return (
    <div className={`flex flex-col items-center gap-6 ${className}`}>
        <div ref={printAreaRef} className="bg-white p-8 rounded-lg w-full max-w-4xl text-gray-800 shadow-lg border">
            <header className="flex justify-between items-start pb-6 border-b">
                <div className="w-1/2">
                    <Image src={logoSrc} alt="RED DOT CLASSROOM Logo" className="h-16 w-auto mb-4" />
                    <h1 className="font-bold text-lg">RED DOT CLASSROOM</h1>
                    <p className="text-xs text-gray-500">PRANGONS ECOSYSTEM</p>
                    <p className="text-xs text-gray-500">Dhaka, Bangladesh</p>
                    <p className="text-xs text-gray-500">support@reddotclassroom.com</p>
                </div>
                <div className="text-right w-1/2">
                    <h2 className="text-3xl font-bold text-gray-400 uppercase">Invoice</h2>
                    <p className="text-sm mt-2"><strong>Invoice #:</strong> {invoice.invoiceNumber}</p>
                    <p className="text-sm"><strong>Date:</strong> {format(safeToDate(invoice.invoiceDate), 'PPP')}</p>
                </div>
            </header>

            <section className="grid grid-cols-2 gap-8 mt-6">
                <div>
                    <h3 className="font-semibold text-gray-500 uppercase text-sm mb-2">Bill To</h3>
                    <p className="font-bold">{invoice.studentDetails.name}</p>
                    <p className="text-sm">{invoice.studentDetails.rdcId}</p>
                    <p className="text-sm">{invoice.studentDetails.email}</p>
                    <p className="text-sm">{invoice.studentDetails.phone}</p>
                </div>
                <div className="text-right">
                    <h3 className="font-semibold text-gray-500 uppercase text-sm mb-2">Payment Details</h3>
                    <p className="text-sm"><strong>Method:</strong> {invoice.paymentDetails.method}</p>
                    <p className="text-sm"><strong>Transaction ID:</strong> {invoice.paymentDetails.transactionId}</p>
                </div>
            </section>
            
            <section className="mt-8">
                <table className="w-full text-left">
                    <thead>
                        <tr className="bg-gray-100">
                            <th className="p-2 font-semibold">Description</th>
                            <th className="p-2 font-semibold text-right">Amount</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr className="border-b">
                            <td className="p-2">
                                <p className="font-medium">{invoice.courseDetails.name}</p>
                                <p className="text-xs text-gray-500">
                                    {invoice.courseDetails.type} Course
                                    {invoice.courseDetails.cycleName && ` - ${invoice.courseDetails.cycleName}`}
                                </p>
                            </td>
                            <td className="p-2 text-right">BDT {invoice.financialSummary.totalFee.toFixed(2)}</td>
                        </tr>
                    </tbody>
                </table>
            </section>
            
            <section className="mt-6 flex justify-end">
                <div className="w-full max-w-xs space-y-2">
                    <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Subtotal:</span>
                        <span>BDT {invoice.financialSummary.totalFee.toFixed(2)}</span>
                    </div>
                    {invoice.financialSummary.discount > 0 && (
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Discount:</span>
                            <span>- BDT {invoice.financialSummary.discount.toFixed(2)}</span>
                        </div>
                    )}
                    <Separator />
                    <div className="flex justify-between font-bold">
                        <span>Net Payable:</span>
                        <span>BDT {invoice.financialSummary.netPayable.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between font-bold text-green-600">
                        <span>Amount Paid:</span>
                        <span>BDT {invoice.financialSummary.amountPaid.toFixed(2)}</span>
                    </div>
                    <Separator className="my-2"/>
                     <div className="flex justify-between font-bold text-xl bg-gray-100 p-2 rounded-md">
                        <span>Due Amount:</span>
                        <span className={invoice.financialSummary.dueAmount > 0 ? 'text-red-600' : ''}>BDT {invoice.financialSummary.dueAmount.toFixed(2)}</span>
                    </div>
                </div>
            </section>
            
            <footer className="mt-12 pt-6 border-t text-center">
                 <p className="text-sm text-gray-600">Thank you for choosing Red Dot Classroom!</p>
                 <p className="text-xs text-gray-400 mt-1">This is a computer-generated invoice and does not require a signature.</p>
            </footer>
        </div>
        
        <div className="flex gap-4">
            <Button onClick={handleDownload} disabled={isDownloading}>
                {isDownloading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                    <Download className="mr-2 h-4 w-4" />
                )}
                Download as PDF
            </Button>
        </div>
    </div>
  );
}
