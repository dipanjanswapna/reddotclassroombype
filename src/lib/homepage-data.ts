// This file acts as a mock database for homepage content.
// In a real application, this data would be fetched from a CMS or database.

export const homepageConfig = {
  heroBanners: [
    { id: 1, href: '/courses/9', imageUrl: 'https://placehold.co/800x450.png', alt: 'Engineering Program', dataAiHint: 'engineering program' },
    { id: 2, href: '/courses/2', imageUrl: 'https://placehold.co/800x450.png', alt: 'Medical 25 Program', dataAiHint: 'medical program students' },
    { id: 3, href: '/courses/1', imageUrl: 'https://placehold.co/800x450.png', alt: 'ID Timers Batch 25', dataAiHint: 'classroom students' },
    { id: 4, href: '/courses/10', imageUrl: 'https://placehold.co/800x450.png', alt: 'ACS Program', dataAiHint: 'university admission' },
    { id: 5, href: '/courses/13', imageUrl: 'https://placehold.co/800x450.png', alt: 'Arts Program', dataAiHint: 'history book' },
  ],
  liveCoursesIds: ['13', '1', '6', '14'],
  videoSection: {
    title: 'সফল শিক্ষার্থীদের কোর্সে কী কী থাকছে?',
    description: 'নিজেকে এগিয়ে রাখতে আজই শুরু করুন আপনার পছন্দের কোর্স',
    videos: [
      { imageUrl: 'https://placehold.co/600x400.png', alt: 'Online course feature', videoUrl: '#', dataAiHint: 'online learning' },
      { imageUrl: 'https://placehold.co/600x400.png', alt: 'Best science videos', videoUrl: '#', dataAiHint: 'science experiment' },
    ]
  },
  sscHscCourseIds: ['5', '1', '6', '7'],
  masterClassesIds: ['16', '7', '8', '3'],
  admissionCoursesIds: ['2', '9', '10', '1'],
  jobCoursesIds: ['11', '12', '4', '8'],
  whyChooseUs: {
    title: 'কেন আমরাই শিক্ষার্থী ও অভিভাবকদের প্রথম পছন্দ?',
    features: [
      { icon: 'Trophy', title: 'সেরা প্রশিক্ষক', description: 'দেশের সেরা শিক্ষকরা ক্লাস নেন' },
      { icon: 'BookOpen', title: 'লাইভ ক্লাস', description: 'সরাসরি প্রশ্ন করার সুযোগ' },
      { icon: 'Users', title: 'সহপাঠীদের সাথে প্রস্তুতি', description: 'একসাথে পড়াশোনা ও মডেল টেস্ট' },
    ]
  },
  notesBanner: {
    title: 'টেন মিনিট স্কুলের নোট পড়ে পাস!',
    description: 'সেরা নোট, লেকচার শিট ও গুরুত্বপূর্ণ সাজেশন খুঁজে নাও সহজেই।',
    buttonText: 'নোটস এবং সাজেশন',
  },
  statsSectionTitle: '২০২২-২৪ শিক্ষাবর্ষে টেন মিনিট স্কুলের এডমিশন সাফল্য',
  stats: [
    { value: '১,২১৬', label: 'মেডিকেল ও ডেন্টাল' },
    { value: '৮৫+', label: 'বুয়েট' },
    { value: '৯', label: 'আইবিএ (ঢাকা বিশ্ববিদ্যালয়)' },
  ],
  appPromo: {
    title: 'যেকোনো জায়গায় বসে শিখুন, যখন যা প্রয়োজন!',
    description: 'আমাদের অ্যাপ ডাউনলোড করে স্মার্টফোনেই গুছিয়ে নিন আপনার সম্পূর্ণ প্রস্তুতি।',
    imageUrl: 'https://placehold.co/400x500.png',
    googlePlayUrl: '#',
    appStoreUrl: '#',
  }
};
