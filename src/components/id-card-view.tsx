
'use client';

import React, { useRef } from 'react';
import Image from 'next/image';
import { Button } from './ui/button';
import { Download, Star, User, Calendar, Hash, Building } from 'lucide-react';
import { RdcLogo } from './rdc-logo';
import { useToast } from './ui/use-toast';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

type IdCardViewProps = {
  name: string;
  role: string;
  idNumber: string;
  joinedDate: string;
  email: string;
  imageUrl: string;
  dataAiHint?: string;
  organization?: string;
  className?: string;
};

const getRoleColors = (role: string) => {
    switch (role.toLowerCase()) {
        case 'student': return 'from-blue-500 to-blue-700';
        case 'teacher': return 'from-green-500 to-green-700';
        case 'admin': return 'from-red-500 to-red-700';
        case 'guardian': return 'from-purple-500 to-purple-700';
        case 'seller organization': return 'from-indigo-500 to-indigo-700';
        case 'moderator': return 'from-orange-500 to-orange-700';
        case 'affiliate': return 'from-yellow-500 to-yellow-700';
        default: return 'from-gray-500 to-gray-700';
    }
}

export function IdCardView({ name, role, idNumber, joinedDate, email, imageUrl, organization, dataAiHint, className }: IdCardViewProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const handleDownload = async () => {
    if (!cardRef.current) return;
    
    toast({ title: 'Generating PDF...', description: 'Please wait a moment.' });
    
    try {
        const canvas = await html2canvas(cardRef.current, { scale: 3, useCORS: true });
        const imgData = canvas.toDataURL('image/png');
        
        // Standard ID card size: 85.6mm x 53.98mm
        const pdf = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: [53.98, 85.6]
        });

        pdf.addImage(imgData, 'PNG', 0, 0, 53.98, 85.6);
        pdf.save(`${name.replace(/\s+/g, '_')}_ID_Card.pdf`);

    } catch (error) {
        console.error("Failed to generate PDF:", error);
        toast({ title: 'Error', description: 'Could not generate PDF.', variant: 'destructive'});
    }
  };

  return (
    <div className={`flex flex-col items-center gap-8 ${className}`}>
        <div ref={cardRef} className="w-[330px] h-[525px] bg-white text-gray-800 rounded-2xl shadow-2xl p-4 flex flex-col relative overflow-hidden font-sans">
            {/* Background pattern */}
            <div className={`absolute -top-1/4 -left-1/4 w-72 h-72 rounded-full bg-gradient-to-br ${getRoleColors(role)} opacity-20`}></div>
            <div className={`absolute -bottom-1/4 -right-1/4 w-72 h-72 rounded-full bg-gradient-to-tl ${getRoleColors(role)} opacity-20`}></div>

            {/* Header */}
            <header className="flex items-center justify-between z-10">
                <RdcLogo className="h-10 w-auto" />
                <div className="text-right">
                    <h1 className="font-bold text-lg leading-tight">RED DOT CLASSROOM</h1>
                    <p className="text-xs text-gray-500">PRANGONS ECOSYSTEM</p>
                </div>
            </header>

            {/* Content */}
            <main className="flex-grow flex flex-col items-center justify-center text-center z-10">
                <div className={`relative w-36 h-36 rounded-full border-4 border-white shadow-lg bg-gradient-to-br ${getRoleColors(role)} p-1`}>
                    <Image src={imageUrl} alt={name} width={144} height={144} className="rounded-full object-cover" data-ai-hint={dataAiHint} crossOrigin="anonymous"/>
                    <div className="absolute -bottom-2 -right-2 bg-white rounded-full p-1 shadow-md">
                        <Star className={`w-6 h-6 text-yellow-400 fill-current`} />
                    </div>
                </div>
                <h2 className="text-2xl font-bold mt-4">{name}</h2>
                <p className="text-primary font-semibold">{role}</p>

                <div className="text-left w-full mt-6 space-y-2 text-sm">
                    <div className="flex items-center gap-2"><User className="w-4 h-4 text-gray-500"/><span>{email}</span></div>
                    {organization && <div className="flex items-center gap-2"><Building className="w-4 h-4 text-gray-500"/><span>{organization}</span></div>}
                    <div className="flex items-center gap-2"><Hash className="w-4 h-4 text-gray-500"/><span>ID: {idNumber}</span></div>
                    <div className="flex items-center gap-2"><Calendar className="w-4 h-4 text-gray-500"/><span>Joined: {joinedDate}</span></div>
                </div>
            </main>

            {/* Footer */}
            <footer className="text-center z-10">
                <Image src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=https://rdc-final.app" width={60} height={60} alt="QR Code" className="mx-auto" data-ai-hint="qr code" crossOrigin="anonymous"/>
                <p className="text-xs text-gray-400 mt-2">www.rdc-final.app</p>
            </footer>
        </div>
        
        <Button onClick={handleDownload}>
            <Download className="mr-2 h-4 w-4" />
            Download as PDF
        </Button>
    </div>
  );
}
