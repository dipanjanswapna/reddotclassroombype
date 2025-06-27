
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { homepageConfig as initialConfig } from '@/lib/homepage-data';
import { PlusCircle, Save, Trash2 } from 'lucide-react';
import Image from 'next/image';

type HomepageConfig = typeof initialConfig;
type CourseIdSections = 'liveCoursesIds' | 'sscHscCourseIds' | 'masterClassesIds' | 'admissionCoursesIds' | 'jobCoursesIds';

export default function AdminHomepageManagementPage() {
  const { toast } = useToast();
  const [config, setConfig] = useState(initialConfig);

  const handleSave = () => {
    // In a real app, this would send the `config` object to the backend.
    console.log('Saving homepage config:', config);
    toast({
      title: 'Homepage Updated',
      description: 'Your changes have been saved successfully.',
    });
  };

  const handleInputChange = (section: keyof HomepageConfig, key: string, value: string, index?: number) => {
      setConfig(prevConfig => {
        const newConfig = { ...prevConfig };
        const sectionData = newConfig[section];

        if (Array.isArray(sectionData) && index !== undefined) {
            const newArray = [...sectionData];
            const itemToUpdate = { ...newArray[index] };
            (itemToUpdate as any)[key] = value;
            newArray[index] = itemToUpdate;
            (newConfig as any)[section] = newArray;
        } else if (typeof sectionData === 'object' && !Array.isArray(sectionData) && sectionData !== null) {
            const newSectionData = { ...sectionData, [key]: value };
            (newConfig as any)[section] = newSectionData;
        }

        return newConfig;
    });
  };

  const handleStringArrayChange = (section: CourseIdSections, value: string) => {
    const ids = value.split(',').map(id => id.trim()).filter(Boolean);
    setConfig(prev => ({ ...prev, [section]: ids }));
  };
  
  const handleNestedInputChange = (section: keyof HomepageConfig, subSectionKey: string, key: string, value: string, index: number) => {
    setConfig(prevConfig => {
        const newConfig = { ...prevConfig };
        const sectionData = newConfig[section] as any;
        const subSectionData = sectionData[subSectionKey];

        if (Array.isArray(subSectionData) && index !== undefined) {
            const newArray = [...subSectionData];
            const itemToUpdate = { ...newArray[index] };
            (itemToUpdate as any)[key] = value;
            newArray[index] = itemToUpdate;
            (newConfig as any)[section][subSectionKey] = newArray;
        }

        return newConfig;
    });
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-headline text-3xl font-bold tracking-tight">Homepage Management</h1>
          <p className="mt-1 text-lg text-muted-foreground">Control the content displayed on your homepage.</p>
        </div>
        <Button onClick={handleSave}><Save className="mr-2"/>Save Changes</Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Hero Carousel</CardTitle>
              <CardDescription>Manage the main banners on the homepage.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {config.heroBanners.map((banner, index) => (
                <div key={banner.id} className="p-4 border rounded-lg space-y-2">
                  <h4 className="font-semibold">Banner {index + 1}</h4>
                   <div className="space-y-1">
                      <Label>Image URL</Label>
                      <Input value={banner.imageUrl} onChange={(e) => handleInputChange('heroBanners', 'imageUrl', e.target.value, index)} />
                    </div>
                     <div className="space-y-1">
                      <Label>Link URL (e.g., /courses/1)</Label>
                      <Input value={banner.href} onChange={(e) => handleInputChange('heroBanners', 'href', e.target.value, index)} />
                    </div>
                </div>
              ))}
            </CardContent>
          </Card>
          
           <Card>
              <CardHeader>
                <CardTitle>Featured Courses Sections</CardTitle>
                <CardDescription>Enter comma-separated course IDs to feature in each section.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                  <div className="space-y-2">
                      <Label htmlFor="liveCoursesIds">লাইভ কোর্সসমূহ (IDs)</Label>
                      <Input id="liveCoursesIds" value={config.liveCoursesIds.join(', ')} onChange={(e) => handleStringArrayChange('liveCoursesIds', e.target.value)} />
                  </div>
                   <div className="space-y-2">
                      <Label htmlFor="sscHscCourseIds">SSC ও HSC (IDs)</Label>
                      <Input id="sscHscCourseIds" value={config.sscHscCourseIds.join(', ')} onChange={(e) => handleStringArrayChange('sscHscCourseIds', e.target.value)} />
                  </div>
                   <div className="space-y-2">
                      <Label htmlFor="masterClassesIds">মাস্টারক্লাস (IDs)</Label>
                      <Input id="masterClassesIds" value={config.masterClassesIds.join(', ')} onChange={(e) => handleStringArrayChange('masterClassesIds', e.target.value)} />
                  </div>
                   <div className="space-y-2">
                      <Label htmlFor="admissionCoursesIds">Admission (IDs)</Label>
                      <Input id="admissionCoursesIds" value={config.admissionCoursesIds.join(', ')} onChange={(e) => handleStringArrayChange('admissionCoursesIds', e.target.value)} />
                  </div>
                   <div className="space-y-2">
                      <Label htmlFor="jobCoursesIds">Job Prep (IDs)</Label>
                      <Input id="jobCoursesIds" value={config.jobCoursesIds.join(', ')} onChange={(e) => handleStringArrayChange('jobCoursesIds', e.target.value)} />
                  </div>
              </CardContent>
          </Card>


          <Card>
            <CardHeader>
              <CardTitle>Video Section</CardTitle>
              <CardDescription>Manage the two promotional videos and their thumbnails.</CardDescription>
            </CardHeader>
            <CardContent className="grid md:grid-cols-2 gap-6">
              {config.videoSection.videos.map((video, index) => (
                <div key={index} className="p-4 border rounded-lg space-y-2">
                    <h4 className="font-semibold">Video {index + 1}</h4>
                     <div className="space-y-1">
                      <Label>Image URL</Label>
                      <Input value={video.imageUrl} onChange={(e) => handleNestedInputChange('videoSection', 'videos', 'imageUrl', e.target.value, index)} />
                    </div>
                     <div className="space-y-1">
                      <Label>Video URL (YouTube/Vimeo)</Label>
                      <Input value={video.videoUrl} onChange={(e) => handleNestedInputChange('videoSection', 'videos', 'videoUrl', e.target.value, index)} />
                    </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-1 space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>App Promo Section</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="space-y-1">
                <Label>Title</Label>
                <Input value={config.appPromo.title} onChange={(e) => handleInputChange('appPromo', 'title', e.target.value)} />
              </div>
              <div className="space-y-1">
                <Label>Description</Label>
                <Textarea value={config.appPromo.description} onChange={(e) => handleInputChange('appPromo', 'description', e.target.value)} />
              </div>
              <div className="space-y-1">
                <Label>App Screenshot Image URL</Label>
                <Input value={config.appPromo.imageUrl} onChange={(e) => handleInputChange('appPromo', 'imageUrl', e.target.value)} />
              </div>
            </CardContent>
          </Card>
           <Card>
            <CardHeader>
              <CardTitle>Stats Section</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {config.stats.map((stat, index) => (
                <div key={index} className="p-4 border rounded-lg space-y-2">
                    <div className="space-y-1">
                      <Label>Value</Label>
                      <Input value={stat.value} onChange={(e) => handleInputChange('stats', 'value', e.target.value, index)} />
                    </div>
                     <div className="space-y-1">
                      <Label>Label</Label>
                      <Input value={stat.label} onChange={(e) => handleInputChange('stats', 'label', e.target.value, index)} />
                    </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
