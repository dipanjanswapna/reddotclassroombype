
'use client';

import React, { useRef, useState } from 'react';
import Image from 'next/image';
import { Button } from './ui/button';
import { Download, Star, User, Phone, MapPin, Hash, CreditCard, ListCollapse, RotateCcw } from 'lucide-react';
import { RdcLogo } from './rdc-logo';
import { useToast } from './ui/use-toast';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

type IdCardViewProps = {
  name: string;
  role: string;
  idNumber: string;
  imageUrl: string;
  dataAiHint?: string;
  organization?: string;
  className?: string;
  classRoll?: string;
  fathersName?: string;
  mothersName?: string;
  nidNumber?: string;
  mobileNumber?: string;
  address?: string;
  enrolledCourses?: { title: string }[];
  joinedDate?: string;
  email?: string;
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

export function IdCardView({ 
    name, role, idNumber, imageUrl, dataAiHint, organization, className,
    classRoll, fathersName, mothersName, nidNumber, mobileNumber, address,
    enrolledCourses, joinedDate, email
}: IdCardViewProps) {
  const cardContainerRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const [isFlipped, setIsFlipped] = useState(false);

  const handleDownload = async () => {
    if (!cardContainerRef.current) return;
    
    toast({ title: 'Generating PDF...', description: 'Please wait a moment.' });

    const elementToCapture = cardContainerRef.current?.querySelector(
        isFlipped ? '.id-card-back' : '.id-card-front'
    ) as HTMLElement | null;
    
    if (!elementToCapture) {
        toast({ title: 'Error', description: 'Could not find the card content to download.', variant: 'destructive'});
        return;
    }

    try {
        const canvas = await html2canvas(elementToCapture, { scale: 3, useCORS: true });
        const imgData = canvas.toDataURL('image/png');
        
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

  return (
    <div className={`flex flex-col items-center gap-8 ${className}`}>
        <div className="[perspective:1000px]">
            <div 
                ref={cardContainerRef}
                className={`relative w-[330px] h-[525px] transition-transform duration-700 [transform-style:preserve-3d] ${isFlipped ? '[transform:rotateY(180deg)]' : ''}`}
            >
                {/* Front Side */}
                <div className="id-card-front absolute w-full h-full [backface-visibility:hidden] bg-white text-gray-800 rounded-2xl shadow-2xl p-4 flex flex-col relative overflow-hidden font-sans">
                    <div className={`absolute -top-1/4 -left-1/4 w-72 h-72 rounded-full bg-gradient-to-br ${getRoleColors(role)} opacity-20`}></div>
                    <div className={`absolute -bottom-1/4 -right-1/4 w-72 h-72 rounded-full bg-gradient-to-tl ${getRoleColors(role)} opacity-20`}></div>
                    <header className="flex items-center justify-between z-10">
                        <RdcLogo className="h-10 w-auto" />
                        <div className="text-right">
                            <h1 className="font-bold text-lg leading-tight">RED DOT CLASSROOM</h1>
                            <p className="text-xs text-gray-500">PRANGONS ECOSYSTEM</p>
                        </div>
                    </header>
                    <main className="flex-grow flex flex-col items-center justify-center text-center z-10">
                        <div className={`relative w-36 h-36 rounded-full border-4 border-white shadow-lg bg-gradient-to-br ${getRoleColors(role)} p-1`}>
                            <Image src={imageUrl} alt={name} width={144} height={144} className="rounded-full object-cover" data-ai-hint={dataAiHint} crossOrigin="anonymous"/>
                            <div className="absolute -bottom-2 -right-2 bg-white rounded-full p-1 shadow-md">
                                <Star className={`w-6 h-6 text-yellow-400 fill-current`} />
                            </div>
                        </div>
                        <h2 className="text-2xl font-bold mt-4">{name}</h2>
                        <p className="text-primary font-semibold">{role}</p>
                        <div className="text-left w-full mt-4 space-y-1 text-xs">
                            {classRoll && <div className="flex items-center gap-2"><ListCollapse className="w-4 h-4 text-gray-500 shrink-0"/><span>Class Roll: {classRoll}</span></div>}
                            {idNumber && <div className="flex items-center gap-2"><Hash className="w-4 h-4 text-gray-500 shrink-0"/><span>Reg. No: {idNumber}</span></div>}
                            {fathersName && <div className="flex items-center gap-2"><User className="w-4 h-4 text-gray-500 shrink-0"/><span>Father's Name: {fathersName}</span></div>}
                            {mothersName && <div className="flex items-center gap-2"><User className="w-4 h-4 text-gray-500 shrink-0"/><span>Mother's Name: {mothersName}</span></div>}
                            {mobileNumber && <div className="flex items-center gap-2"><Phone className="w-4 h-4 text-gray-500 shrink-0"/><span>Mobile: {mobileNumber}</span></div>}
                            {nidNumber && <div className="flex items-center gap-2"><CreditCard className="w-4 h-4 text-gray-500 shrink-0"/><span>NID: {nidNumber}</span></div>}
                            {address && <div className="flex items-start gap-2"><MapPin className="w-4 h-4 text-gray-500 shrink-0 mt-0.5"/><span>Address: {address}</span></div>}
                        </div>
                    </main>
                    <footer className="text-center z-10 pt-2">
                        <Image src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=https://rdc-final.app" width={60} height={60} alt="QR Code" className="mx-auto" data-ai-hint="qr code" crossOrigin="anonymous"/>
                        <p className="text-xs text-gray-400 mt-2">www.rdc-final.app</p>
                    </footer>
                </div>

                {/* Back Side */}
                <div className="id-card-back absolute w-full h-full [backface-visibility:hidden] [transform:rotateY(180deg)] bg-white text-gray-800 rounded-2xl shadow-2xl p-4 flex flex-col font-sans">
                     <div className="h-10 bg-gray-200 -m-4 mb-2"></div>
                     <div className="text-xs text-gray-600 space-y-2 text-center mt-2">
                        <p className="font-bold">গুরুত্বপূর্ণ নির্দেশনা</p>
                        <p>এই কার্ডটি Red Dot Classroom (RDC) এর সম্পত্তি। এটি হস্তান্তরযোগ্য নয়। কার্ডটি হারিয়ে গেলে অবিলম্বে কর্তৃপক্ষকে জানান।</p>
                    </div>
                    
                    <div className="flex-grow my-4">
                        <h3 className="font-bold text-center text-sm mb-2">
                           {role === 'Student' ? "Enrolled Courses" : "Contact Information"} 
                        </h3>
                        <div className="text-xs text-left bg-gray-50 p-2 rounded-md h-48 overflow-y-auto">
                           {role === 'Student' && enrolledCourses && enrolledCourses.length > 0 ? (
                               <ul className="space-y-1">
                                   {enrolledCourses.map(course => <li key={course.title} className="truncate">✓ {course.title}</li>)}
                               </ul>
                           ) : role === 'Student' ? (
                                <p className="text-center text-gray-500 pt-16">No courses enrolled.</p>
                           ) : (
                               <div className="space-y-1 pt-2">
                                   <p><strong>Joined Date:</strong> {joinedDate}</p>
                                   <p><strong>Email:</strong> {email}</p>
                                   <p><strong>Website:</strong> www.rdc-final.app</p>
                                   <p className="pt-4 font-bold">If found, please return to:</p>
                                   <p>Red Dot Classroom Head Office, Dhaka, Bangladesh.</p>
                               </div>
                           )}
                        </div>
                    </div>
                    
                    <div className="text-center z-10 pt-2">
                        <Barcode />
                    </div>
                </div>
            </div>
        </div>
        
        <div className="flex gap-4 mt-8">
            <Button onClick={() => setIsFlipped(!isFlipped)}>
                <RotateCcw className="mr-2 h-4 w-4" />
                {isFlipped ? 'View Front' : 'View Back'}
            </Button>
            <Button onClick={handleDownload}>
                <Download className="mr-2 h-4 w-4" />
                Download as PDF
            </Button>
        </div>
    </div>
  );
}
