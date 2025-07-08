

'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { PlusCircle, Save, X, Loader2, Youtube, CheckCircle, ChevronDown, Facebook, Linkedin, Twitter, ExternalLink } from 'lucide-react';
import Image from 'next/image';
import { HomepageConfig, OfflineHubProgram, TeamMember, TopperPageCard, TopperPageSection } from '@/lib/types';
import { getHomepageConfig } from '@/lib/firebase/firestore';
import { saveHomepageConfigAction } from '@/app/actions/homepage.actions';
import { LoadingSpinner } from '@/components/loading-spinner';
import { Switch } from '@/components/ui/switch';
import { getYoutubeVideoId } from '@/lib/utils';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

type SocialChannel = NonNullable<HomepageConfig['socialMediaSection']['channels']>[0];
type CourseIdSections = 'liveCoursesIds' | 'sscHscCourseIds' | 'masterClassesIds' | 'admissionCoursesIds' | 'jobCoursesIds';
type CategoryItem = HomepageConfig['categoriesSection']['categories'][0];
type OfflineCenter = NonNullable<HomepageConfig['offlineHubSection']['centers']>[0];

export default function AdminHomepageManagementPage() {
  const { toast } = useToast();
  const [config, setConfig] = useState<HomepageConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    async function fetchConfig() {
      try {
        const fetchedConfig = await getHomepageConfig();
        setConfig(fetchedConfig);
      } catch (error) {
        console.error("Error fetching homepage config:", error);
        toast({ title: "Error", description: "Could not load homepage configuration.", variant: "destructive" });
      } finally {
        setLoading(false);
      }
    }
    fetchConfig();
  }, [toast]);

  const handleSave = async () => {
    if (!config) return;
    setIsSaving(true);
    const result = await saveHomepageConfigAction(config);
    if (result.success) {
        toast({
            title: 'Homepage Updated',
            description: 'Your changes have been saved successfully.',
        });
    } else {
        toast({ title: 'Error', description: result.message, variant: 'destructive'});
    }
    setIsSaving(false);
  };

  const handleStringArrayChange = (section: CourseIdSections, value: string) => {
    const ids = value.split(',').map(id => id.trim()).filter(Boolean);
    setConfig(prev => prev ? ({ ...prev, [section]: ids }) : null);
  };
  
  const handleNestedInputChange = (section: keyof HomepageConfig, subSectionKey: string, key: string, value: string | number, index: number) => {
    setConfig(prevConfig => {
        if (!prevConfig) return null;
        const newConfig = JSON.parse(JSON.stringify(prevConfig));
        const sectionData = newConfig[section] as any;
        const subSectionData = sectionData[subSectionKey];

        if (Array.isArray(subSectionData) && index !== undefined && subSectionData[index]) {
            subSectionData[index][key] = value;
            newConfig[section][subSectionKey] = subSectionData;
        }
        return newConfig;
    });
  };
  
  const handleDeepNestedInputChange = (section: keyof HomepageConfig, subSectionKey: string, index: number, field: string, subfield: string, value: string) => {
    setConfig(prevConfig => {
        if (!prevConfig) return null;
        const newConfig = JSON.parse(JSON.stringify(prevConfig));
        newConfig[section][subSectionKey][index][field][subfield] = value;
        return newConfig;
    });
  };

  const handleSectionInputChange = (section: keyof HomepageConfig, key: string, value: string | number | { bn: string; en: string }) => {
    setConfig(prevConfig => {
      if (!prevConfig) return null;
      const newConfig = { ...prevConfig };
      if (newConfig[section]) {
        (newConfig[section] as any)[key] = value;
      }
      return newConfig;
    });
  };
  
  const handleSectionTitleChange = (section: keyof HomepageConfig, lang: 'bn' | 'en', value: string) => {
    setConfig(prevConfig => {
      if (!prevConfig) return null;
      const newConfig = JSON.parse(JSON.stringify(prevConfig)); // Deep copy
      if (newConfig[section] && (newConfig[section] as any).title) {
        (newConfig[section] as any).title[lang] = value;
      }
      return newConfig;
    });
  };

  const handleSectionSubtitleChange = (section: keyof HomepageConfig, lang: 'bn' | 'en', value: string) => {
    setConfig(prevConfig => {
      if (!prevConfig) return null;
      const newConfig = JSON.parse(JSON.stringify(prevConfig)); // Deep copy
      if (newConfig[section] && (newConfig[section] as any).subtitle) {
        (newConfig[section] as any).subtitle[lang] = value;
      }
      return newConfig;
    });
  };
  
  const addHeroBanner = () => {
    setConfig(prev => prev ? ({
      ...prev,
      heroBanners: [
        ...prev.heroBanners,
        { id: Date.now(), href: '/courses/', imageUrl: 'https://placehold.co/800x450.png', alt: 'New Banner', dataAiHint: 'banner placeholder' }
      ]
    }) : null);
  };
  
  const addCategory = () => {
    setConfig(prev => {
        if (!prev) return null;
        const newCategory = {
            id: Date.now(),
            title: 'New Category',
            imageUrl: 'https://placehold.co/400x500.png',
            linkUrl: '/courses',
            dataAiHint: 'category placeholder',
        };
        return {
            ...prev,
            categoriesSection: { ...prev.categoriesSection, categories: [...prev.categoriesSection.categories, newCategory] }
        };
    });
  };

  const addPartner = () => {
    setConfig(prev => {
        if (!prev) return null;
        const partnersSection = prev.partnersSection || { display: true, title: { bn: 'আমাদের পার্টনার', en: 'Our Partners' }, partners: [] };
        const newPartner = {
            id: Date.now(),
            name: 'New Partner',
            logoUrl: 'https://placehold.co/140x60.png',
            href: '#',
            dataAiHint: 'company logo'
        };
        return {
            ...prev,
            partnersSection: { ...partnersSection, partners: [...partnersSection.partners, newPartner] }
        };
    });
  };

  const addFreeClass = () => {
    setConfig(prev => {
      if (!prev) return null;
      const freeClassesSection = prev.freeClassesSection || { display: true, title: { bn: '', en: '' }, subtitle: {bn: '', en: ''}, classes: []};
      const newClass = {
        id: `fc_${Date.now()}`,
        title: 'New Free Class',
        youtubeUrl: '',
        subject: '',
        instructor: '',
        grade: 'ক্লাস ৯'
      };
      return {
        ...prev,
        freeClassesSection: { ...freeClassesSection, classes: [...freeClassesSection.classes, newClass]}
      };
    });
  };

  const removeHeroBanner = (id: number) => {
    setConfig(prev => prev ? ({
      ...prev,
      heroBanners: prev.heroBanners.filter(banner => banner.id !== id)
    }) : null);
  };
  
  const removeCategory = (id: number) => {
    setConfig(prev => {
        if (!prev) return null;
        return {
            ...prev,
            categoriesSection: { ...prev.categoriesSection, categories: prev.categoriesSection.categories.filter(c => c.id !== id) }
        };
    });
  };

  const removePartner = (id: number) => {
    setConfig(prev => {
        if (!prev) return null;
        const partnersSection = prev.partnersSection || { display: true, title: { bn: '', en: '' }, partners: [] };
        const newPartners = partnersSection.partners.filter(p => p.id !== p.id);
        return {
            ...prev,
            partnersSection: { ...partnersSection, partners: newPartners }
        };
    });
  };
  
  const removeFreeClass = (id: string) => {
    setConfig(prev => {
      if (!prev || !prev.freeClassesSection) return null;
      const updatedClasses = prev.freeClassesSection.classes.filter(c => c.id !== id);
      return { ...prev, freeClassesSection: { ...prev.freeClassesSection, classes: updatedClasses }};
    });
  };

  const handleHeroBannerChange = (index: number, field: 'imageUrl' | 'href', value: string) => {
    setConfig(prev => {
        if (!prev) return null;
        const newBanners = [...prev.heroBanners];
        const bannerToUpdate = { ...newBanners[index], [field]: value };
        newBanners[index] = bannerToUpdate;
        return { ...prev, heroBanners: newBanners };
    });
  };
  
  const handleCategoryChange = (index: number, field: keyof CategoryItem, value: string) => {
    setConfig(prev => {
        if (!prev) return null;
        const newCategories = [...prev.categoriesSection.categories];
        const categoryToUpdate = { ...newCategories[index], [field]: value };
        newCategories[index] = categoryToUpdate;
        return { ...prev, categoriesSection: { ...prev.categoriesSection, categories: newCategories } };
    });
  };

  const handleCarouselSettingChange = (key: 'autoplay' | 'autoplayDelay', value: any) => {
    setConfig(prev => {
        if (!prev) return null;
        return {
            ...prev,
            heroCarousel: {
                ...(prev.heroCarousel || { autoplay: true, autoplayDelay: 5000 }),
                [key]: value
            }
        };
    });
  };
  
  const handleAppPromoChange = (key: keyof HomepageConfig['appPromo'], value: any) => {
    setConfig(prev => {
        if (!prev) return null;
        return { ...prev, appPromo: { ...prev.appPromo, [key]: value } };
    });
  };

  const addOfflineCenter = () => {
    setConfig(prev => {
        if (!prev) return null;
        const newCenter: OfflineCenter = { id: Date.now().toString(), name: '', address: '' };
        return { ...prev, offlineHubSection: { ...prev.offlineHubSection, centers: [...prev.offlineHubSection.centers, newCenter] } };
    });
  };

  const updateOfflineCenter = (id: string, field: 'name' | 'address', value: string) => {
      setConfig(prev => {
          if (!prev) return null;
          const updatedCenters = prev.offlineHubSection.centers.map(c => c.id === id ? { ...c, [field]: value } : c);
          return { ...prev, offlineHubSection: { ...prev.offlineHubSection, centers: updatedCenters } };
      });
  };

  const removeOfflineCenter = (id: string) => {
      setConfig(prev => {
          if (!prev) return null;
          const updatedCenters = prev.offlineHubSection.centers.filter(c => c.id !== id);
          return { ...prev, offlineHubSection: { ...prev.offlineHubSection, centers: updatedCenters } };
      });
  };

  const handleProgramChange = (index: number, field: keyof Omit<OfflineHubProgram, 'id' | 'features'>, value: string) => {
      setConfig(prev => {
          if (!prev || !prev.offlineHubSection.programs) return null;
          const newPrograms = JSON.parse(JSON.stringify(prev.offlineHubSection.programs));
          newPrograms[index][field] = value;
          return { ...prev, offlineHubSection: { ...prev.offlineHubSection, programs: newPrograms } };
      });
  };

  const handleProgramFeatureChange = (progIndex: number, featIndex: number, value: string) => {
      setConfig(prev => {
          if (!prev || !prev.offlineHubSection.programs) return null;
          const newPrograms = JSON.parse(JSON.stringify(prev.offlineHubSection.programs));
          newPrograms[progIndex].features[featIndex] = value;
          return { ...prev, offlineHubSection: { ...prev.offlineHubSection, programs: newPrograms } };
      });
  };

  const addProgramFeature = (progIndex: number) => {
      setConfig(prev => {
          if (!prev || !prev.offlineHubSection.programs) return null;
          const newPrograms = JSON.parse(JSON.stringify(prev.offlineHubSection.programs));
          newPrograms[progIndex].features.push('');
          return { ...prev, offlineHubSection: { ...prev.offlineHubSection, programs: newPrograms } };
      });
  };

  const removeProgramFeature = (progIndex: number, featIndex: number) => {
      setConfig(prev => {
          if (!prev || !prev.offlineHubSection.programs) return null;
          const newPrograms = JSON.parse(JSON.stringify(prev.offlineHubSection.programs));
          newPrograms[progIndex].features.splice(featIndex, 1);
          return { ...prev, offlineHubSection: { ...prev.offlineHubSection, programs: newPrograms } };
      });
  };

  const addProgram = () => {
      setConfig(prev => {
          if (!prev) return null;
          const newProgram: OfflineHubProgram = {
              id: Date.now().toString(),
              title: 'New Program',
              imageUrl: 'https://placehold.co/600x400.png',
              dataAiHint: 'program students',
              features: ['New Feature 1', 'New Feature 2'],
              button1Text: 'Book Now',
              button1Url: '#',
              button2Text: 'Learn More',
              button2Url: '#',
          };
          const programs = prev.offlineHubSection.programs ? [...prev.offlineHubSection.programs, newProgram] : [newProgram];
          return { ...prev, offlineHubSection: { ...prev.offlineHubSection, programs } };
      });
  };

  const removeProgram = (id: string) => {
      setConfig(prev => {
          if (!prev || !prev.offlineHubSection.programs) return null;
          const updatedPrograms = prev.offlineHubSection.programs.filter(p => p.id !== id);
          return { ...prev, offlineHubSection: { ...prev.offlineHubSection, programs: updatedPrograms } };
      });
  };
  
  const handleTeamMemberChange = (id: string, field: keyof Omit<TeamMember, 'id' | 'socialLinks'>, value: string) => {
    setConfig(prev => {
        if (!prev) return null;
        const newMembers = prev.aboutUsSection.teamMembers.map(m => m.id === id ? { ...m, [field]: value } : m);
        return { ...prev, aboutUsSection: { ...prev.aboutUsSection, teamMembers: newMembers } };
    });
  };

  const handleSocialLinkChange = (memberId: string, index: number, field: 'platform' | 'url', value: string) => {
    setConfig(prev => {
        if (!prev) return null;
        const newMembers = prev.aboutUsSection.teamMembers.map(member => {
            if (member.id === memberId) {
                const newLinks = [...member.socialLinks];
                newLinks[index] = { ...newLinks[index], [field]: value as any };
                return { ...member, socialLinks: newLinks };
            }
            return member;
        });
        return { ...prev, aboutUsSection: { ...prev.aboutUsSection, teamMembers: newMembers } };
    });
  };

  const addTeamMember = () => {
    setConfig(prev => {
        if (!prev) return null;
        const newMember: TeamMember = {
            id: `member_${Date.now()}`,
            name: 'New Member',
            title: 'Designation',
            imageUrl: 'https://placehold.co/400x500.png',
            dataAiHint: 'person professional',
            socialLinks: [{ platform: 'facebook', url: '#' }]
        };
        return { ...prev, aboutUsSection: { ...prev.aboutUsSection, teamMembers: [...prev.aboutUsSection.teamMembers, newMember] } };
    });
  };

  const removeTeamMember = (id: string) => {
    setConfig(prev => {
        if (!prev) return null;
        const newMembers = prev.aboutUsSection.teamMembers.filter(m => m.id !== id);
        return { ...prev, aboutUsSection: { ...prev.aboutUsSection, teamMembers: newMembers } };
    });
  };

  const addSocialLink = (memberId: string) => {
     setConfig(prev => {
        if (!prev) return null;
        const newMembers = prev.aboutUsSection.teamMembers.map(member => {
            if (member.id === memberId) {
                const newLinks = [...member.socialLinks, { platform: 'facebook', url: '#' }];
                return { ...member, socialLinks: newLinks };
            }
            return member;
        });
        return { ...prev, aboutUsSection: { ...prev.aboutUsSection, teamMembers: newMembers } };
    });
  }

  const removeSocialLink = (memberId: string, index: number) => {
    setConfig(prev => {
        if (!prev) return null;
        const newMembers = prev.aboutUsSection.teamMembers.map(member => {
            if (member.id === memberId) {
                const newLinks = member.socialLinks.filter((_, i) => i !== index);
                return { ...member, socialLinks: newLinks };
            }
            return member;
        });
        return { ...prev, aboutUsSection: { ...prev.aboutUsSection, teamMembers: newMembers } };
    });
  }

  const handleStrugglingSectionChange = (key: keyof HomepageConfig['strugglingStudentSection'], value: any) => {
    setConfig(prev => {
        if (!prev) return null;
        return { ...prev, strugglingStudentSection: { ...prev.strugglingStudentSection, [key]: value } };
    });
  };

  const handleStrugglingSectionLangChange = (field: 'title' | 'subtitle' | 'buttonText', lang: 'bn' | 'en', value: string) => {
    setConfig(prevConfig => {
        if (!prevConfig) return null;
        const newConfig = JSON.parse(JSON.stringify(prevConfig));
        if (newConfig.strugglingStudentSection && newConfig.strugglingStudentSection[field]) {
            newConfig.strugglingStudentSection[field][lang] = value;
        }
        return newConfig;
    });
  };

    const handleTopperPageChange = (field: keyof TopperPageSection, value: string) => {
        setConfig(prev => {
            if (!prev) return null;
            const newConfig = JSON.parse(JSON.stringify(prev));
            newConfig.topperPageSection[field] = value;
            return newConfig;
        });
    };

    const handleTopperCardChange = (id: string, field: keyof TopperPageCard, value: string) => {
        setConfig(prev => {
            if (!prev) return null;
            const newCards = prev.topperPageSection.cards.map(c => 
                c.id === id ? { ...c, [field]: value } : c
            );
            const newConfig = JSON.parse(JSON.stringify(prev));
            newConfig.topperPageSection.cards = newCards;
            return newConfig;
        });
    };

  const sections = [
    { key: 'topperPageSection', label: 'Strugglers/Topper Page'},
    { key: 'strugglingStudentSection', label: 'Struggling Student Section'},
    { key: 'categoriesSection', label: 'Categories Section' },
    { key: 'journeySection', label: 'Journey Section (Live Courses)' },
    { key: 'teachersSection', label: 'Teachers Section' },
    { key: 'videoSection', label: 'Video Section' },
    { key: 'sscHscSection', label: 'SSC & HSC Section' },
    { key: 'masterclassSection', label: 'Masterclass Section' },
    { key: 'admissionSection', label: 'Admission Section' },
    { key: 'jobPrepSection', label: 'Job Prep Section' },
    { key: 'whyChooseUs', label: 'Why Choose Us Section' },
    { key: 'freeClassesSection', label: 'Free Classes Section' },
    { key: 'aboutUsSection', label: 'About Us Section'},
    { key: 'collaborations', label: 'Collaborations Section' },
    { key: 'partnersSection', label: 'Partners Section' },
    { key: 'socialMediaSection', label: 'Social Media Section' },
    { key: 'notesBanner', label: 'Notes Banner' },
    { key: 'statsSection', label: 'Stats Section' },
    { key: 'appPromo', label: 'App Promo Section' },
    { key: 'offlineHubSection', label: 'Offline Hub Section' },
  ] as const;

  const handleSectionToggle = (sectionKey: typeof sections[number]['key'], value: boolean) => {
    setConfig(prevConfig => {
      if (!prevConfig) return null;
      const newConfig = { ...prevConfig };
      if (newConfig[sectionKey]) {
        (newConfig[sectionKey] as any).display = value;
      }
      return newConfig;
    });
  };

  if (loading) {
    return <div className="flex h-screen items-center justify-center"><LoadingSpinner className="h-12 w-12"/></div>;
  }
  
  if (!config) {
     return <div className="flex h-screen items-center justify-center"><p>Could not load homepage configuration.</p></div>;
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-headline text-3xl font-bold tracking-tight">Homepage Management</h1>
          <p className="mt-1 text-lg text-muted-foreground">Control the content displayed on your homepage.</p>
        </div>
        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving ? <Loader2 className="mr-2 animate-spin"/> : <Save className="mr-2"/>}
          Save Changes
        </Button>
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
                <div key={banner.id} className="p-4 border rounded-lg space-y-2 relative">
                   <Button variant="ghost" size="icon" className="absolute top-1 right-1 h-6 w-6" onClick={() => removeHeroBanner(banner.id)}><X className="text-destructive h-4 w-4"/></Button>
                  <h4 className="font-semibold">Banner {index + 1}</h4>
                   <div className="space-y-1">
                      <Label>Image URL</Label>
                      <Input value={banner.imageUrl} onChange={(e) => handleHeroBannerChange(index, 'imageUrl', e.target.value)} />
                    </div>
                     <div className="space-y-1">
                      <Label>Link URL (e.g., /courses/1)</Label>
                      <Input value={banner.href} onChange={(e) => handleHeroBannerChange(index, 'href', e.target.value)} />
                    </div>
                </div>
              ))}
               <Button variant="outline" className="w-full border-dashed" onClick={addHeroBanner}><PlusCircle className="mr-2"/>Add Banner</Button>
            </CardContent>
             <CardHeader>
              <CardTitle>Carousel Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex items-center justify-between rounded-lg border p-3 shadow-sm">
                    <Label htmlFor="autoplay-switch" className="font-medium">
                    Enable Autoplay
                    </Label>
                    <Switch
                        id="autoplay-switch"
                        checked={config.heroCarousel?.autoplay ?? true}
                        onCheckedChange={(checked) => handleCarouselSettingChange('autoplay', checked)}
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="autoplay-delay">Autoplay Delay (in milliseconds)</Label>
                    <Input 
                        id="autoplay-delay"
                        type="number"
                        value={config.heroCarousel?.autoplayDelay ?? 5000}
                        onChange={(e) => handleCarouselSettingChange('autoplayDelay', parseInt(e.target.value))}
                        disabled={!config.heroCarousel?.autoplay}
                    />
                </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Struggling Student Section</CardTitle>
              <CardDescription>Manage the "Struggling in Studies?" banner on the homepage.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Title (Bangla)</Label>
                  <Input value={config.strugglingStudentSection.title.bn} onChange={e => handleStrugglingSectionLangChange('title', 'bn', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Title (English)</Label>
                  <Input value={config.strugglingStudentSection.title.en} onChange={e => handleStrugglingSectionLangChange('title', 'en', e.target.value)} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Subtitle (Bangla)</Label>
                  <Input value={config.strugglingStudentSection.subtitle.bn} onChange={e => handleStrugglingSectionLangChange('subtitle', 'bn', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Subtitle (English)</Label>
                  <Input value={config.strugglingStudentSection.subtitle.en} onChange={e => handleStrugglingSectionLangChange('subtitle', 'en', e.target.value)} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Button Text (Bangla)</Label>
                  <Input value={config.strugglingStudentSection.buttonText.bn} onChange={e => handleStrugglingSectionLangChange('buttonText', 'bn', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Button Text (English)</Label>
                  <Input value={config.strugglingStudentSection.buttonText.en} onChange={e => handleStrugglingSectionLangChange('buttonText', 'en', e.target.value)} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Image URL</Label>
                <Input value={config.strugglingStudentSection.imageUrl} onChange={e => handleStrugglingSectionChange('imageUrl', e.target.value)} />
                {config.strugglingStudentSection.imageUrl && (
                  <div className="mt-2 rounded-lg border overflow-hidden aspect-[16/9] relative bg-muted max-w-sm">
                    <Image
                      src={config.strugglingStudentSection.imageUrl}
                      alt="Image Preview"
                      fill
                      className="object-contain"
                    />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
                <CardTitle>Strugglers/Topper Page</CardTitle>
                <CardDescription>Manage the content for the "/strugglers-studies" page.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                    <Label>Page Title</Label>
                    <Input value={config.topperPageSection.title} onChange={e => handleTopperPageChange('title', e.target.value)} />
                </div>
                <div className="space-y-2">
                    <Label>Main Illustration Image URL</Label>
                    <Input value={config.topperPageSection.mainImageUrl} onChange={e => handleTopperPageChange('mainImageUrl', e.target.value)} />
                </div>
                {config.topperPageSection.cards.map((card, index) => (
                    <div key={card.id} className="p-4 border rounded-lg space-y-2">
                        <h4 className="font-semibold">Card {index + 1}</h4>
                        <div className="space-y-1">
                            <Label>Icon URL</Label>
                            <Input value={card.iconUrl} onChange={e => handleTopperCardChange(card.id, 'iconUrl', e.target.value)} />
                        </div>
                        <div className="space-y-1">
                            <Label>Title</Label>
                            <Input value={card.title} onChange={e => handleTopperCardChange(card.id, 'title', e.target.value)} />
                        </div>
                        <div className="space-y-1">
                            <Label>Description</Label>
                            <Textarea value={card.description} onChange={e => handleTopperCardChange(card.id, 'description', e.target.value)} rows={3}/>
                        </div>
                    </div>
                ))}
            </CardContent>
          </Card>

          <Card>
              <CardHeader>
                <CardTitle>Categories Section</CardTitle>
                <CardDescription>Manage the category cards shown on the homepage.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                 <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label>Section Title (Bangla)</Label>
                        <Input value={config.categoriesSection.title.bn} onChange={e => handleSectionTitleChange('categoriesSection', 'bn', e.target.value)} />
                    </div>
                     <div className="space-y-2">
                        <Label>Section Title (English)</Label>
                        <Input value={config.categoriesSection.title.en} onChange={e => handleSectionTitleChange('categoriesSection', 'en', e.target.value)} />
                    </div>
                </div>
                {config.categoriesSection.categories.map((category, index) => (
                  <div key={category.id} className="p-4 border rounded-lg space-y-2 relative">
                    <Button variant="ghost" size="icon" className="absolute top-1 right-1 h-6 w-6" onClick={() => removeCategory(category.id)}><X className="text-destructive h-4 w-4"/></Button>
                    <h4 className="font-semibold">Category {index + 1}</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1"><Label>Title</Label><Input value={category.title} onChange={(e) => handleCategoryChange(index, 'title', e.target.value)} /></div>
                      <div className="space-y-1"><Label>Image URL</Label><Input value={category.imageUrl} onChange={(e) => handleCategoryChange(index, 'imageUrl', e.target.value)} /></div>
                      <div className="space-y-1"><Label>Link URL</Label><Input value={category.linkUrl} onChange={(e) => handleCategoryChange(index, 'linkUrl', e.target.value)} /></div>
                      <div className="space-y-1"><Label>Image AI Hint</Label><Input value={category.dataAiHint} onChange={(e) => handleCategoryChange(index, 'dataAiHint', e.target.value)} /></div>
                    </div>
                  </div>
                ))}
                <Button variant="outline" className="w-full border-dashed" onClick={addCategory}><PlusCircle className="mr-2"/>Add Category</Button>
              </CardContent>
          </Card>
          
          <Card>
              <CardHeader>
                  <CardTitle>About Us Section</CardTitle>
                  <CardDescription>Manage the team members displayed on the About Us page.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                          <Label>Section Title (Bangla)</Label>
                          <Input value={config.aboutUsSection.title.bn} onChange={e => handleSectionTitleChange('aboutUsSection', 'bn', e.target.value)} />
                      </div>
                      <div className="space-y-2">
                          <Label>Section Title (English)</Label>
                          <Input value={config.aboutUsSection.title.en} onChange={e => handleSectionTitleChange('aboutUsSection', 'en', e.target.value)} />
                      </div>
                       <div className="space-y-2 col-span-2">
                          <Label>Section Subtitle (English)</Label>
                          <Textarea value={config.aboutUsSection.subtitle.en} onChange={e => handleSectionSubtitleChange('aboutUsSection', 'en', e.target.value)} />
                      </div>
                  </div>
                  {config.aboutUsSection.teamMembers.map((member, index) => (
                      <Collapsible key={member.id} className="p-4 border rounded-lg space-y-2 relative" defaultOpen>
                          <div className="flex justify-between items-start">
                              <h4 className="font-semibold pt-2">Member {index + 1}: {member.name}</h4>
                              <div>
                                  <Button variant="ghost" size="icon" onClick={() => removeTeamMember(member.id)}><X className="text-destructive h-4 w-4"/></Button>
                                  <CollapsibleTrigger asChild>
                                      <Button variant="ghost" size="icon"><ChevronDown className="h-4 w-4"/></Button>
                                  </CollapsibleTrigger>
                              </div>
                          </div>
                          <CollapsibleContent className="space-y-4">
                              <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2"><Label>Name</Label><Input value={member.name} onChange={e => handleTeamMemberChange(member.id, 'name', e.target.value)} /></div>
                                <div className="space-y-2"><Label>Title</Label><Input value={member.title} onChange={e => handleTeamMemberChange(member.id, 'title', e.target.value)} /></div>
                              </div>
                              <div className="space-y-2"><Label>Image URL</Label><Input value={member.imageUrl} onChange={e => handleTeamMemberChange(member.id, 'imageUrl', e.target.value)} /></div>
                              <div className="space-y-2"><Label>Image AI Hint</Label><Input value={member.dataAiHint} onChange={e => handleTeamMemberChange(member.id, 'dataAiHint', e.target.value)} /></div>
                              <div className="space-y-2">
                                  <Label>Social Links</Label>
                                  {member.socialLinks.map((link, linkIndex) => (
                                      <div key={linkIndex} className="flex items-center gap-2">
                                          <Select value={link.platform} onValueChange={(value) => handleSocialLinkChange(member.id, linkIndex, 'platform', value)}>
                                              <SelectTrigger className="w-[120px]"><SelectValue /></SelectTrigger>
                                              <SelectContent>
                                                  <SelectItem value="facebook">Facebook</SelectItem>
                                                  <SelectItem value="linkedin">LinkedIn</SelectItem>
                                                  <SelectItem value="twitter">Twitter</SelectItem>
                                                  <SelectItem value="external">External</SelectItem>
                                              </SelectContent>
                                          </Select>
                                          <Input value={link.url} onChange={e => handleSocialLinkChange(member.id, linkIndex, 'url', e.target.value)} placeholder="Full URL" />
                                          <Button variant="ghost" size="icon" onClick={() => removeSocialLink(member.id, linkIndex)}><X className="h-4 w-4 text-destructive"/></Button>
                                      </div>
                                  ))}
                                  <Button variant="outline" size="sm" onClick={() => addSocialLink(member.id)}><PlusCircle className="mr-2"/>Add Social Link</Button>
                              </div>
                          </CollapsibleContent>
                      </Collapsible>
                  ))}
                  <Button variant="outline" className="w-full border-dashed" onClick={addTeamMember}><PlusCircle className="mr-2"/>Add Team Member</Button>
              </CardContent>
          </Card>

           <Card>
              <CardHeader>
                <CardTitle>Offline Hub Page Settings</CardTitle>
                <CardDescription>Control the content on the RDC OFFLINE HUB page.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2"> <Label>Title (Bangla)</Label> <Input value={config.offlineHubSection.title.bn} onChange={e => handleSectionTitleChange('offlineHubSection', 'bn', e.target.value)} /> </div>
                  <div className="space-y-2"> <Label>Title (English)</Label> <Input value={config.offlineHubSection.title.en} onChange={e => handleSectionTitleChange('offlineHubSection', 'en', e.target.value)} /> </div>
                </div>
                 <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2"> <Label>Subtitle (Bangla)</Label> <Textarea value={config.offlineHubSection.subtitle.bn} onChange={e => handleSectionSubtitleChange('offlineHubSection', 'bn', e.target.value)} /> </div>
                  <div className="space-y-2"> <Label>Subtitle (English)</Label> <Textarea value={config.offlineHubSection.subtitle.en} onChange={e => handleSectionSubtitleChange('offlineHubSection', 'en', e.target.value)} /> </div>
                </div>
                 <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2"> <Label>Image URL</Label> <Input value={config.offlineHubSection.imageUrl} onChange={e => handleSectionInputChange('offlineHubSection', 'imageUrl', e.target.value)} /> </div>
                  <div className="space-y-2"> <Label>Image AI Hint</Label> <Input value={config.offlineHubSection.dataAiHint} onChange={e => handleSectionInputChange('offlineHubSection', 'dataAiHint', e.target.value)} /> </div>
                </div>
                 <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2"> <Label>Button 1 Text (BN)</Label> <Input value={config.offlineHubSection.button1Text.bn} onChange={e => handleSectionInputChange('offlineHubSection', 'button1Text', { ...config.offlineHubSection.button1Text, bn: e.target.value })} /> </div>
                  <div className="space-y-2"> <Label>Button 1 Text (EN)</Label> <Input value={config.offlineHubSection.button1Text.en} onChange={e => handleSectionInputChange('offlineHubSection', 'button1Text', { ...config.offlineHubSection.button1Text, en: e.target.value })} /> </div>
                  <div className="space-y-2"> <Label>Button 2 Text (BN)</Label> <Input value={config.offlineHubSection.button2Text.bn} onChange={e => handleSectionInputChange('offlineHubSection', 'button2Text', { ...config.offlineHubSection.button2Text, bn: e.target.value })} /> </div>
                  <div className="space-y-2"> <Label>Button 2 Text (EN)</Label> <Input value={config.offlineHubSection.button2Text.en} onChange={e => handleSectionInputChange('offlineHubSection', 'button2Text', { ...config.offlineHubSection.button2Text, en: e.target.value })} /> </div>
                </div>
                 <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2"> <Label>Centers Title (BN)</Label> <Input value={config.offlineHubSection.centersTitle.bn} onChange={e => handleSectionInputChange('offlineHubSection', 'centersTitle', { ...config.offlineHubSection.centersTitle, bn: e.target.value })} /> </div>
                  <div className="space-y-2"> <Label>Centers Title (EN)</Label> <Input value={config.offlineHubSection.centersTitle.en} onChange={e => handleSectionInputChange('offlineHubSection', 'centersTitle', { ...config.offlineHubSection.centersTitle, en: e.target.value })} /> </div>
                </div>
                <div>
                    <Label>Center Locations</Label>
                    <div className="space-y-2 mt-2">
                        {config.offlineHubSection.centers.map(center => (
                            <div key={center.id} className="p-2 border rounded-md flex gap-2 items-start">
                                <div className="flex-grow space-y-2">
                                    <Input placeholder="Center Name (e.g., Uttara, Dhaka)" value={center.name} onChange={e => updateOfflineCenter(center.id, 'name', e.target.value)} />
                                    <Textarea placeholder="Full Address" value={center.address} onChange={e => updateOfflineCenter(center.id, 'address', e.target.value)} rows={2}/>
                                </div>
                                <Button variant="ghost" size="icon" onClick={() => removeOfflineCenter(center.id)}><X className="text-destructive h-4 w-4"/></Button>
                            </div>
                        ))}
                    </div>
                    <Button variant="outline" className="w-full mt-2" onClick={addOfflineCenter}><PlusCircle className="mr-2"/>Add Center</Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Offline Hub Programs</CardTitle>
                <CardDescription>Manage the program cards on the offline hub page.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                 <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label>Programs Section Title (Bangla)</Label>
                        <Input value={config.offlineHubSection.programsTitle?.bn || ''} onChange={e => setConfig(prev => prev ? ({ ...prev, offlineHubSection: { ...prev.offlineHubSection, programsTitle: { ...(prev.offlineHubSection.programsTitle || { bn: '', en: '' }), bn: e.target.value } } }) : null)} />
                    </div>
                     <div className="space-y-2">
                        <Label>Programs Section Title (English)</Label>
                        <Input value={config.offlineHubSection.programsTitle?.en || ''} onChange={e => setConfig(prev => prev ? ({ ...prev, offlineHubSection: { ...prev.offlineHubSection, programsTitle: { ...(prev.offlineHubSection.programsTitle || { bn: '', en: '' }), en: e.target.value } } }) : null)} />
                    </div>
                 </div>
                 {config.offlineHubSection.programs?.map((program, progIndex) => (
                   <Collapsible key={program.id} className="p-4 border rounded-lg space-y-2 relative" defaultOpen>
                    <div className="flex justify-between items-start">
                      <h4 className="font-semibold pt-2">Program {progIndex + 1}: {program.title}</h4>
                      <div>
                        <Button variant="ghost" size="icon" onClick={() => removeProgram(program.id)}><X className="text-destructive h-4 w-4"/></Button>
                        <CollapsibleTrigger asChild>
                          <Button variant="ghost" size="icon"><ChevronDown className="h-4 w-4"/></Button>
                        </CollapsibleTrigger>
                      </div>
                    </div>
                     <CollapsibleContent className="space-y-4">
                        <div className="space-y-2"><Label>Title</Label><Input value={program.title} onChange={(e) => handleProgramChange(progIndex, 'title', e.target.value)} /></div>
                        <div className="space-y-2"><Label>Image URL</Label><Input value={program.imageUrl} onChange={(e) => handleProgramChange(progIndex, 'imageUrl', e.target.value)} /></div>
                        <div className="space-y-2"><Label>Button 1 Text</Label><Input value={program.button1Text} onChange={(e) => handleProgramChange(progIndex, 'button1Text', e.target.value)} /></div>
                        <div className="space-y-2"><Label>Button 1 URL</Label><Input value={program.button1Url} onChange={(e) => handleProgramChange(progIndex, 'button1Url', e.target.value)} /></div>
                        <div className="space-y-2"><Label>Button 2 Text</Label><Input value={program.button2Text} onChange={(e) => handleProgramChange(progIndex, 'button2Text', e.target.value)} /></div>
                        <div className="space-y-2"><Label>Button 2 URL</Label><Input value={program.button2Url} onChange={(e) => handleProgramChange(progIndex, 'button2Url', e.target.value)} /></div>
                        
                        <div className="space-y-2">
                          <Label>Features</Label>
                          {program.features.map((feature, featIndex) => (
                            <div key={featIndex} className="flex items-center gap-2">
                              <CheckCircle className="h-4 w-4 text-green-500 shrink-0"/>
                              <Input value={feature} onChange={(e) => handleProgramFeatureChange(progIndex, featIndex, e.target.value)} />
                              <Button variant="ghost" size="icon" onClick={() => removeProgramFeature(progIndex, featIndex)}><X className="h-4 w-4 text-destructive"/></Button>
                            </div>
                          ))}
                           <Button variant="outline" size="sm" onClick={() => addProgramFeature(progIndex)}><PlusCircle className="mr-2"/>Add Feature</Button>
                        </div>

                     </CollapsibleContent>
                   </Collapsible>
                 ))}
                 <Button variant="outline" className="w-full border-dashed" onClick={addProgram}><PlusCircle className="mr-2"/>Add Program</Button>
              </CardContent>
            </Card>

            <Card>
                <CardHeader><CardTitle>Offline Hub Contact Section</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                     <div className="space-y-2"> <Label>Title (Bangla)</Label> <Input value={config.offlineHubSection.contactSection.title.bn} onChange={e => { const newConfig = JSON.parse(JSON.stringify(config)); newConfig.offlineHubSection.contactSection.title.bn = e.target.value; setConfig(newConfig); }} /> </div>
                     <div className="space-y-2"> <Label>Subtitle (Bangla)</Label> <Textarea value={config.offlineHubSection.contactSection.subtitle.bn} onChange={e => { const newConfig = JSON.parse(JSON.stringify(config)); newConfig.offlineHubSection.contactSection.subtitle.bn = e.target.value; setConfig(newConfig); }} /> </div>
                     <div className="space-y-2"> <Label>Call Button Text (Bangla)</Label> <Input value={config.offlineHubSection.contactSection.callButtonText.bn} onChange={e => { const newConfig = JSON.parse(JSON.stringify(config)); newConfig.offlineHubSection.contactSection.callButtonText.bn = e.target.value; setConfig(newConfig); }} /> </div>
                     <div className="space-y-2"> <Label>Call Button Number</Label> <Input value={config.offlineHubSection.contactSection.callButtonNumber} onChange={e => { const newConfig = JSON.parse(JSON.stringify(config)); newConfig.offlineHubSection.contactSection.callButtonNumber = e.target.value; setConfig(newConfig); }} /> </div>
                     <div className="space-y-2"> <Label>WhatsApp Button Text (Bangla)</Label> <Input value={config.offlineHubSection.contactSection.whatsappButtonText.bn} onChange={e => { const newConfig = JSON.parse(JSON.stringify(config)); newConfig.offlineHubSection.contactSection.whatsappButtonText.bn = e.target.value; setConfig(newConfig); }} /> </div>
                     <div className="space-y-2"> <Label>WhatsApp Number</Label> <Input value={config.offlineHubSection.contactSection.whatsappNumber} onChange={e => { const newConfig = JSON.parse(JSON.stringify(config)); newConfig.offlineHubSection.contactSection.whatsappNumber = e.target.value; setConfig(newConfig); }} /> </div>
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
              <CardDescription>Manage the promotional videos. Thumbnails are generated automatically from the YouTube URL.</CardDescription>
            </CardHeader>
            <CardContent className="grid md:grid-cols-2 gap-6">
              {config.videoSection.videos.map((video, index) => (
                <div key={index} className="p-4 border rounded-lg space-y-4">
                    <h4 className="font-semibold">Video {index + 1}</h4>
                     <div className="space-y-1">
                      <Label>Video Title</Label>
                      <Input value={video.title} onChange={(e) => handleNestedInputChange('videoSection', 'videos', 'title', e.target.value, index)} />
                    </div>
                     <div className="space-y-1">
                      <Label>YouTube Video URL</Label>
                      <Input value={video.videoUrl} onChange={(e) => handleNestedInputChange('videoSection', 'videos', 'videoUrl', e.target.value, index)} />
                    </div>
                </div>
              ))}
            </CardContent>
          </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Free Classes Section</CardTitle>
                    <CardDescription>Manage the "আমাদের সকল ফ্রি ক্লাসসমূহ" section.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Section Title (Bangla)</Label>
                            <Input value={config.freeClassesSection.title.bn} onChange={e => handleSectionTitleChange('freeClassesSection', 'bn', e.target.value)} />
                        </div>
                         <div className="space-y-2">
                            <Label>Section Subtitle (Bangla)</Label>
                            <Input value={config.freeClassesSection.subtitle.bn} onChange={e => handleSectionSubtitleChange('freeClassesSection', 'bn', e.target.value)} />
                        </div>
                    </div>
                    
                    {config.freeClassesSection.classes.map((item, index) => {
                        const videoId = getYoutubeVideoId(item.youtubeUrl);
                        const thumbnailUrl = videoId ? `https://img.youtube.com/vi/${videoId}/default.jpg` : 'https://placehold.co/120x90.png?text=Invalid';
                        return (
                            <div key={item.id} className="p-4 border rounded-lg space-y-2 relative">
                                <Button variant="ghost" size="icon" className="absolute top-1 right-1 h-6 w-6" onClick={() => removeFreeClass(item.id)}><X className="text-destructive h-4 w-4"/></Button>
                                <div className="flex items-start gap-4">
                                    <Image src={thumbnailUrl} alt="Thumbnail" width={120} height={90} className="rounded-md object-cover bg-muted" />
                                    <div className="grid grid-cols-2 gap-x-4 gap-y-2 flex-grow">
                                        <div className="col-span-2 space-y-1"><Label>Class Title</Label><Input value={item.title} onChange={(e) => handleNestedInputChange('freeClassesSection', 'classes', 'title', e.target.value, index)} /></div>
                                        <div className="space-y-1"><Label>Subject</Label><Input value={item.subject} onChange={(e) => handleNestedInputChange('freeClassesSection', 'classes', 'subject', e.target.value, index)} /></div>
                                        <div className="space-y-1"><Label>Instructor</Label><Input value={item.instructor} onChange={(e) => handleNestedInputChange('freeClassesSection', 'classes', 'instructor', e.target.value, index)} /></div>
                                        <div className="col-span-2 space-y-1"><Label>YouTube URL</Label><Input value={item.youtubeUrl} onChange={(e) => handleNestedInputChange('freeClassesSection', 'classes', 'youtubeUrl', e.target.value, index)} /></div>
                                        <div className="col-span-2 space-y-1"><Label>Grade</Label><Input value={item.grade} onChange={(e) => handleNestedInputChange('freeClassesSection', 'classes', 'grade', e.target.value, index)} placeholder="e.g., ক্লাস ৯"/></div>
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                    <Button variant="outline" className="w-full border-dashed" onClick={addFreeClass}><PlusCircle className="mr-2"/>Add Free Class</Button>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Stats Section</CardTitle>
                    <CardDescription>Manage the "লক্ষাধিক শিক্ষার্থীর পথচলা" section.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label>Section Title (Bangla)</Label>
                        <Input value={config.statsSection.title.bn} onChange={e => handleSectionTitleChange('statsSection', 'bn', e.target.value)} />
                    </div>
                    {config.statsSection.stats.map((stat, index) => (
                        <div key={index} className="p-4 border rounded-lg space-y-2 relative">
                            <h4 className="font-semibold">Stat {index + 1}</h4>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Value</Label>
                                    <Input value={stat.value} onChange={e => handleNestedInputChange('statsSection', 'stats', 'value', e.target.value, index)} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Label (Bangla)</Label>
                                    <Input value={(stat.label as any).bn} onChange={e => handleDeepNestedInputChange('statsSection', 'stats', index, 'label', 'bn', e.target.value)} />
                                </div>
                            </div>
                        </div>
                    ))}
                </CardContent>
            </Card>
          
           <Card>
                <CardHeader>
                    <CardTitle>Partners Section</CardTitle>
                    <CardDescription>Manage the logos of partners displayed on the homepage.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-4">
                        {config.partnersSection?.partners.map((partner, index) => (
                            <div key={partner.id} className="p-4 border rounded-lg space-y-4 relative">
                                <Button variant="ghost" size="icon" className="absolute top-2 right-2 h-6 w-6" onClick={() => removePartner(partner.id)}>
                                    <X className="text-destructive h-4 w-4" />
                                </Button>
                                <div className="space-y-2">
                                    <Label>Partner Name</Label>
                                    <Input value={partner.name} onChange={(e) => handleNestedInputChange('partnersSection', 'partners', 'name', e.target.value, index)} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Logo URL</Label>
                                    <Input value={partner.logoUrl} onChange={(e) => handleNestedInputChange('partnersSection', 'partners', 'logoUrl', e.target.value, index)} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Website Link</Label>
                                    <Input value={partner.href} onChange={(e) => handleNestedInputChange('partnersSection', 'partners', 'href', e.target.value, index)} />
                                </div>
                            </div>
                        ))}
                    </div>
                    <Button variant="outline" className="w-full border-dashed mt-4" onClick={addPartner}>
                        <PlusCircle className="mr-2" />
                        Add Partner
                    </Button>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Social Media Section</CardTitle>
                    <CardDescription>Manage the "আমাদের সাথে কানেক্টেড থাকুন" section.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label>Section Title (Bangla)</Label>
                        <Input value={config.socialMediaSection.title.bn} onChange={e => handleSectionTitleChange('socialMediaSection', 'bn', e.target.value)} />
                    </div>
                    <div className="space-y-2">
                        <Label>Section Description (Bangla)</Label>
                        <Textarea value={config.socialMediaSection.description.bn} onChange={e => handleSectionTitleChange('socialMediaSection', 'bn', e.target.value)} />
                    </div>
                    {config.socialMediaSection.channels.map((channel, index) => (
                        <div key={channel.id} className="p-4 border rounded-lg space-y-4">
                            <h4 className="font-semibold">Channel {index + 1}</h4>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2"><Label>Platform</Label><Input value={channel.platform} onChange={e => handleNestedInputChange('socialMediaSection', 'channels', 'platform', e.target.value, index)} /></div>
                                <div className="space-y-2"><Label>Name (Bangla)</Label><Input value={(channel.name as any).bn} onChange={e => handleDeepNestedInputChange('socialMediaSection', 'channels', index, 'name', 'bn', e.target.value)} /></div>
                                <div className="space-y-2"><Label>Handle</Label><Input value={channel.handle} onChange={e => handleNestedInputChange('socialMediaSection', 'channels', 'handle', e.target.value, index)} /></div>
                                <div className="space-y-2"><Label>Stat 1 Value</Label><Input value={channel.stat1_value} onChange={e => handleNestedInputChange('socialMediaSection', 'channels', 'stat1_value', e.target.value, index)} /></div>
                                <div className="space-y-2"><Label>Stat 1 Label (Bangla)</Label><Input value={(channel.stat1_label as any).bn} onChange={e => handleDeepNestedInputChange('socialMediaSection', 'channels', index, 'stat1_label', 'bn', e.target.value)} /></div>
                                <div className="space-y-2"><Label>Stat 2 Value</Label><Input value={channel.stat2_value} onChange={e => handleNestedInputChange('socialMediaSection', 'channels', 'stat2_value', e.target.value, index)} /></div>
                                <div className="space-y-2"><Label>Stat 2 Label (Bangla)</Label><Input value={(channel.stat2_label as any).bn} onChange={e => handleDeepNestedInputChange('socialMediaSection', 'channels', index, 'stat2_label', 'bn', e.target.value)} /></div>
                                <div className="space-y-2"><Label>CTA Text (Bangla)</Label><Input value={(channel.ctaText as any).bn} onChange={e => handleDeepNestedInputChange('socialMediaSection', 'channels', index, 'ctaText', 'bn', e.target.value)} /></div>
                                <div className="space-y-2 col-span-2"><Label>CTA URL</Label><Input value={channel.ctaUrl} onChange={e => handleNestedInputChange('socialMediaSection', 'channels', 'ctaUrl', e.target.value, index)} /></div>
                                <div className="space-y-2 col-span-2"><Label>Description (Bangla)</Label><Textarea value={(channel.description as any).bn} onChange={e => handleDeepNestedInputChange('socialMediaSection', 'channels', index, 'description', 'bn', e.target.value)} /></div>
                            </div>
                        </div>
                    ))}
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Notes Banner</CardTitle>
                    <CardDescription>Manage the "ফ্রি নোটস এবং লেকচার শিট" banner.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label>Title (Bangla)</Label>
                        <Input value={config.notesBanner.title.bn} onChange={e => handleDeepNestedInputChange('notesBanner', 'title', 0, 'bn', 'bn', e.target.value)} />
                    </div>
                    <div className="space-y-2">
                        <Label>Description (Bangla)</Label>
                        <Input value={config.notesBanner.description.bn} onChange={e => handleDeepNestedInputChange('notesBanner', 'description', 0, 'bn', 'bn', e.target.value)} />
                    </div>
                    <div className="space-y-2">
                        <Label>Button Text (Bangla)</Label>
                        <Input value={config.notesBanner.buttonText.bn} onChange={e => handleDeepNestedInputChange('notesBanner', 'buttonText', 0, 'bn', 'bn', e.target.value)} />
                    </div>
                </CardContent>
            </Card>

        </div>

        <div className="lg:col-span-1 space-y-8">
           <Card>
                <CardHeader>
                    <CardTitle>Site Branding</CardTitle>
                    <CardDescription>Manage the main logo for the entire site.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-2">
                        <Label htmlFor="logoUrl">Site Logo URL</Label>
                        <Input 
                            id="logoUrl"
                            value={config.logoUrl || ''} 
                            onChange={(e) => setConfig(prev => prev ? ({ ...prev, logoUrl: e.target.value }) : null)}
                            placeholder="https://example.com/logo.png"
                        />
                        <p className="text-xs text-muted-foreground">If a URL is provided, it will replace the default logo across the site.</p>
                    </div>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle>Animation Settings</CardTitle>
                    <CardDescription>Control the scroll speed of homepage carousels.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="teachersScrollSpeed">Teachers Carousel Speed (seconds)</Label>
                        <Input 
                        id="teachersScrollSpeed"
                        type="number"
                        value={config.teachersSection?.scrollSpeed ?? 25} 
                        onChange={(e) => handleSectionInputChange('teachersSection', 'scrollSpeed', parseInt(e.target.value) || 25)}
                        />
                        <p className="text-xs text-muted-foreground">Lower number means faster scroll. Default is 25.</p>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="partnersScrollSpeed">Partners Carousel Speed (seconds)</Label>
                        <Input 
                        id="partnersScrollSpeed"
                        type="number"
                        value={config.partnersSection?.scrollSpeed ?? 25} 
                        onChange={(e) => handleSectionInputChange('partnersSection', 'scrollSpeed', parseInt(e.target.value) || 25)}
                        />
                        <p className="text-xs text-muted-foreground">Lower number means faster scroll. Default is 25.</p>
                    </div>
                </CardContent>
            </Card>
             <Card>
                <CardHeader>
                <CardTitle>Floating WhatsApp Button</CardTitle>
                <CardDescription>Manage the floating chat button on public pages.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                <div className="flex items-center justify-between rounded-lg border p-3 shadow-sm">
                    <Label htmlFor="floatingWhatsApp-display" className="font-medium">
                    Display Button
                    </Label>
                    <Switch
                    id="floatingWhatsApp-display"
                    checked={config.floatingWhatsApp.display}
                    onCheckedChange={(checked) =>
                        setConfig((prev) =>
                        prev
                            ? {
                                ...prev,
                                floatingWhatsApp: { ...prev.floatingWhatsApp, display: checked },
                            }
                            : null
                        )
                    }
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="floatingWhatsApp-number">WhatsApp Number</Label>
                    <Input
                    id="floatingWhatsApp-number"
                    value={config.floatingWhatsApp.number}
                    onChange={(e) =>
                        setConfig((prev) =>
                        prev
                            ? {
                                ...prev,
                                floatingWhatsApp: { ...prev.floatingWhatsApp, number: e.target.value },
                            }
                            : null
                        )
                    }
                    placeholder="e.g. 8801XXXXXXXXX"
                    />
                </div>
                </CardContent>
            </Card>
           <Card>
                <CardHeader>
                <CardTitle>Section Visibility</CardTitle>
                <CardDescription>Toggle the visibility of sections on the homepage.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                {sections.map(section => (
                    <div key={section.key} className="flex items-center justify-between rounded-lg border p-3 shadow-sm">
                    <div className="space-y-0.5">
                        <Label htmlFor={section.key} className="text-sm">{section.label}</Label>
                    </div>
                    <Switch
                        id={section.key}
                        checked={(config as any)[section.key]?.display ?? true}
                        onCheckedChange={(value) => handleSectionToggle(section.key, value)}
                    />
                    </div>
                ))}
                </CardContent>
            </Card>

          <Card>
            <CardHeader>
              <CardTitle>App Promo Section</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="space-y-1">
                <Label>Title (Bangla)</Label>
                <Input value={config.appPromo.title.bn} onChange={(e) => handleAppPromoChange('title', { ...config.appPromo.title, bn: e.target.value })} />
              </div>
              <div className="space-y-1">
                <Label>Description (Bangla)</Label>
                <Textarea value={config.appPromo.description.bn} onChange={(e) => handleAppPromoChange('description', { ...config.appPromo.description, bn: e.target.value })} />
              </div>
              <div className="space-y-1">
                <Label>App Screenshot Image URL</Label>
                <Input value={config.appPromo.imageUrl} onChange={(e) => handleAppPromoChange('imageUrl', e.target.value )} />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
