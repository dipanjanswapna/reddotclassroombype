
'use client';

import { useRef, useState } from 'react';
import Image from 'next/image';
import { UploadCloud, Loader2 } from 'lucide-react';
import { Button } from './ui/button';

interface ImageUploaderProps {
  onAnswerChange: (dataUrl: string | null) => void;
  existingImageUrl?: string;
}

export function ImageUploader({ onAnswerChange, existingImageUrl }: ImageUploaderProps) {
    const inputRef = useRef<HTMLInputElement>(null);
    const [isUploading, setIsUploading] = useState(false);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setIsUploading(true);
            const reader = new FileReader();
            reader.onloadend = () => {
                onAnswerChange(reader.result as string);
                setIsUploading(false);
            };
             reader.onerror = () => {
                setIsUploading(false);
                // Optionally add a toast message for error
            };
            reader.readAsDataURL(file);
        }
    };
    
    const handleRemoveImage = () => {
        onAnswerChange(null);
        if (inputRef.current) {
            inputRef.current.value = '';
        }
    };

    return (
        <div className="space-y-2">
            <input type="file" accept="image/*" ref={inputRef} onChange={handleFileChange} className="hidden" />
            <Button type="button" variant="outline" onClick={() => inputRef.current?.click()} className="w-full" disabled={isUploading}>
                {isUploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UploadCloud className="mr-2 h-4 w-4" />}
                {existingImageUrl ? "Change Image" : "Upload Image"}
            </Button>
            {existingImageUrl && (
                <div className="mt-2 p-2 border rounded-md relative">
                    <p className="text-sm text-muted-foreground mb-2">Image Preview:</p>
                    <Image src={existingImageUrl} alt="Answer preview" width={400} height={300} className="rounded-md object-contain mx-auto max-h-[300px]" />
                    <Button type="button" variant="destructive" size="sm" className="absolute top-2 right-2" onClick={handleRemoveImage}>Remove</Button>
                </div>
            )}
        </div>
    );
}
