
// This file acts as a mock database, centralizing all content.
// In a real-world application, this data would come from a database via an API.

export type LiveClass = {
  id: string;
  topic: string;
  date: string;
  time: string;
  platform: 'Zoom' | 'Google Meet' | 'Facebook Live' | 'YouTube Live';
  joinUrl: string;
};

export type Lesson = {
  id: string;
  title: string;
  type: 'video' | 'quiz' | 'document';
  duration: string;
  videoId?: string;
  lectureSheetUrl?: string;
};

export type SyllabusModule = {
  id: string;
  title: string;
  lessons: Lesson[];
};

export type Review = {
  id: string;
  user: {
    name: string;
    avatarUrl: string;
    dataAiHint: string;
  };
  rating: number;
  comment: string;
  date: string;
};

export type Organization = {
  id: string;
  name: string;
  logoUrl: string;
  status: 'approved' | 'pending' | 'rejected';
  subdomain: string;
  primaryColor: string;
  secondaryColor: string;
  hero?: {
    title: string;
    subtitle: string;
    imageUrl: string;
    dataAiHint?: string;
  };
};

export type Instructor = {
  id: string;
  name: string;
  title: string;
  avatarUrl: string;
  dataAiHint: string;
  slug: string;
  status: 'Approved' | 'Pending Approval' | 'Rejected';
  bio: string;
  socials?: {
    linkedin?: string;
    facebook?: string;
    twitter?: string;
  }
  organizationId?: string;
}

export type QuizQuestion = {
    id: string;
    text: string;
    options: string[];
    correctAnswer: number; // index of the correct option
};

export type Quiz = {
  id: string;
  title: string;
  topic: string;
  totalQuestions: number;
  duration: number; // in minutes
  status: 'Completed' | 'Not Started' | 'In Progress';
  score?: number;
  questions: QuizQuestion[];
};

export type Assignment = {
  id: string;
  title: string;
  topic: string;
  deadline: string;
  status: 'Submitted' | 'Pending' | 'Graded' | 'Late';
  grade?: string;
  feedback?: string;
  submissionDate?: string;
};

export type Course = {
  id: string;
  title: string;
  description: string;
  instructors: Instructor[]; // Multiple instructors for the course
  imageUrl: string;
  dataAiHint: string;
  category: string;
  subCategory?: string;
  price: string;
  status: 'Published' | 'Pending Approval' | 'Draft' | 'Rejected';
  rating?: number;
  reviews?: number;
  whatYouWillLearn?: string[];
  syllabus?: SyllabusModule[];
  features?: string[];
  features_detailed?: { title: string; description: string }[];
  imageTitle?: string;
  classRoutine?: { day: string; subject: string; time: string; id?: string; instructorName?: string; }[];
  faqs?: { question: string; answer: string; id?: string; }[];
  reviewsData?: Review[];
  liveClasses?: LiveClass[];
  isArchived?: boolean;
  includedArchivedCourseIds?: string[];
  isPrebooking?: boolean;
  prebookingPrice?: string;
  prebookingEndDate?: string;
  organizationId?: string;
  organizationName?: string;
  quizzes?: Quiz[];
  assignments?: Assignment[];
};


export type BlogPost = {
  slug: string;
  title: string;
  excerpt: string;
  imageUrl: string;
  dataAiHint: string;
  content: string;
};

export type PromoCode = {
  id: string;
  code: string;
  type: 'percentage' | 'fixed';
  value: number;
  usageCount: number;
  usageLimit: number;
  expiresAt: string;
  isActive: boolean;
  applicableCourseIds: string[]; // 'all' for all courses
  createdBy: 'admin' | string; // admin or teacherId
}

export const organizations: Organization[] = [
  { id: 'org_medishark', name: 'MediShark', logoUrl: 'https://placehold.co/100x100.png', status: 'approved', subdomain: 'medishark', primaryColor: '211 100% 50%', secondaryColor: '210 40% 98%', hero: { title: 'Welcome to MediShark Academy', subtitle: 'Your gateway to medical excellence. We provide top-tier courses for medical admission tests and professional exams.', imageUrl: 'https://placehold.co/1200x400.png', dataAiHint: 'medical students' } },
  { id: 'org_acs', name: 'ACS Group', logoUrl: 'https://placehold.co/100x100.png', status: 'approved', subdomain: 'acs', primaryColor: '142 76% 36%', secondaryColor: '142 10% 95%', hero: { title: 'ACS: Your Partner in Admission Success', subtitle: 'Guiding you to your dream university with our expert-led courses.', imageUrl: 'https://placehold.co/1200x400.png', dataAiHint: 'university campus' } },
  { id: 'org_jobprep', name: 'Job Prep Inc.', logoUrl: 'https://placehold.co/100x100.png', status: 'pending', subdomain: 'jobprep', primaryColor: '45 95% 51%', secondaryColor: '45 100% 95%', hero: { title: 'Land Your Dream Job with Us', subtitle: 'Comprehensive preparation for government and bank jobs.', imageUrl: 'https://placehold.co/1200x400.png', dataAiHint: 'job interview' } },
];


// Master list of all instructors in the platform
export const allInstructors: Instructor[] = [
    { 
        id: 'ins-ja', name: 'Jubayer Ahmed', title: 'Lead Developer & ICT Instructor', 
        avatarUrl: 'https://placehold.co/100x100.png', dataAiHint: 'male teacher',
        slug: 'jubayer-ahmed', status: 'Approved', 
        bio: 'Jubayer is a seasoned full-stack developer with over 10 years of experience building applications for high-growth startups and established tech companies. He specializes in making complex ICT topics easy to understand for HSC students.',
        socials: { linkedin: '#', facebook: '#'}
    },
    { 
        id: 'ins-si', name: 'Dr. Sadia Islam', title: 'Medical Admission Specialist', 
        avatarUrl: 'https://placehold.co/100x100.png', dataAiHint: 'female doctor',
        slug: 'sadia-islam', status: 'Approved',
        organizationId: 'org_medishark',
        bio: 'Sadia is a doctor and an experienced instructor who has helped hundreds of students get into their dream medical colleges. Her expertise is in Biology and Chemistry.',
        socials: { linkedin: '#'}
    },
    { 
        id: 'ins-rc', name: 'Raihan Chowdhury', title: 'Certified IELTS Trainer & Math Expert', 
        avatarUrl: 'https://placehold.co/100x100.png', dataAiHint: 'english teacher',
        slug: 'raihan-chowdhury', status: 'Approved',
        bio: 'Raihan has been teaching for over 8 years and has a proven track record of helping students achieve high scores. He also has a passion for teaching Mathematics for admission tests.',
        socials: { facebook: '#'}
    },
    { 
        id: 'ins-ak', name: 'Ayesha Khan', title: 'Data Scientist & Bank Job Mentor', 
        avatarUrl: 'https://placehold.co/100x100.png', dataAiHint: 'female programmer',
        slug: 'ayesha-khan', status: 'Pending Approval',
        organizationId: 'org_jobprep',
        bio: 'Ayesha is a professional data scientist working in the tech industry, with a passion for teaching and sharing her knowledge. She also mentors students for bank job preparations.',
        socials: { twitter: '#'}
    },
    { 
        id: 'ins-fm', name: 'Farhan Mahmud', title: 'Experienced SSC & DU Admission Tutor', 
        avatarUrl: 'https://placehold.co/100x100.png', dataAiHint: 'male teacher',
        slug: 'farhan-mahmud', status: 'Approved',
        organizationId: 'org_acs',
        bio: 'Farhan has been teaching for over 12 years and specializes in preparing students for public exams like SSC and Dhaka University admission tests.',
    },
    { 
        id: 'ins-nj', name: 'Nusrat Jahan', title: 'HSC Specialist (Commerce & Arts)', 
        avatarUrl: 'https://placehold.co/100x100.png', dataAiHint: 'female teacher',
        slug: 'nusrat-jahan', status: 'Rejected',
        bio: 'Nusrat is a passionate educator with a knack for making complex topics in Commerce and Arts subjects easy to understand for HSC students.'
    },
     { 
        id: 'ins-ka', name: 'Dr. Karim Ahmed', title: 'Chemistry', 
        avatarUrl: 'https://placehold.co/100x100.png', dataAiHint: 'male doctor', slug: 'karim-ahmed', 
        status: 'Approved', organizationId: 'org_medishark', bio: 'Bio for Karim' 
    },
];

const getInst = (id: string) => allInstructors.find(i => i.id === id)!;

export const allPromoCodes: PromoCode[] = [
  { id: 'promo1', code: 'EID20', type: 'percentage', value: 20, usageCount: 25, usageLimit: 100, expiresAt: '2024-12-31', isActive: true, applicableCourseIds: ['all'], createdBy: 'admin' },
  { id: 'promo2', code: 'RDC100', type: 'fixed', value: 100, usageCount: 50, usageLimit: 200, expiresAt: '2024-10-31', isActive: true, applicableCourseIds: ['all'], createdBy: 'admin' },
  { id: 'promo3', code: 'ICTMASTER', type: 'percentage', value: 15, usageCount: 10, usageLimit: 50, expiresAt: '2024-09-30', isActive: true, applicableCourseIds: ['7', '14'], createdBy: 'ins-ja' },
  { id: 'promo4', code: 'ADMISSION500', type: 'fixed', value: 500, usageCount: 5, usageLimit: 20, expiresAt: '2024-08-31', isActive: true, applicableCourseIds: ['2', '9', '10'], createdBy: 'admin' },
];

export const courses: Course[] = [
  {
    id: '1',
    title: 'HSC 2025 ক্র্যাশ কোর্স - বিজ্ঞান',
    description: 'এইচএসসি ২০২৫ পরীক্ষার্থীদের জন্য পূর্ণাঙ্গ প্রস্তুতি নিশ্চিত করতে একটি সম্পূর্ণ অনলাইন ব্যাচ। অভিজ্ঞ শিক্ষকদের সাথে লাইভ ক্লাস, লেকচার শিট, এবং পরীক্ষার মাধ্যমে সেরা প্রস্তুতি নিন।',
    status: 'Pending Approval',
    isPrebooking: true,
    price: 'BDT 5000',
    prebookingPrice: 'BDT 4500',
    prebookingEndDate: '2024-12-31',
    instructors: [
       getInst('ins-ja'),
       getInst('ins-si'),
       getInst('ins-rc'),
       getInst('ins-ak'),
    ],
    imageUrl: 'https://placehold.co/600x400.png',
    dataAiHint: 'physics class',
    category: 'HSC',
    subCategory: 'বিজ্ঞান',
    rating: 4.8,
    reviews: 120,
    whatYouWillLearn: [
        'Build enterprise-level React applications',
        'Master server-side rendering with Next.js',
        'Design and consume RESTful APIs',
        'Implement robust authentication and authorization',
        'Deploy applications using Docker and Vercel',
    ],
    syllabus: [
        { 
            id: 'm1-1',
            title: 'পদার্থবিজ্ঞান',
            lessons: [
                { id: 'l1-1-1', title: 'ভৌত জগৎ ও পরিমাপ', type: 'video', duration: '45 min', videoId: 'dQw4w9WgXcQ', lectureSheetUrl: 'https://www.google.com/drive/' },
                { id: 'l1-1-2', title: 'ভেক্টর', type: 'video', duration: '55 min', videoId: 'dQw4w9WgXcQ', lectureSheetUrl: 'https://www.google.com/drive/'  },
                { id: 'l1-1-3', title: 'গতিবিদ্যা', type: 'video', duration: '50 min', videoId: 'dQw4w9WgXcQ', lectureSheetUrl: 'https://www.google.com/drive/'  },
                { id: 'l1-1-4', title: 'Chapter 1 Quiz', type: 'quiz', duration: '15 min' },
            ]
        },
        { 
            id: 'm1-2',
            title: 'রসায়ন',
            lessons: [
                { id: 'l1-2-1', title: 'ল্যাবরেটরির নিরাপদ ব্যবহার', type: 'video', duration: '40 min', videoId: 'dQw4w9WgXcQ', lectureSheetUrl: 'https://www.google.com/drive/' },
                { id: 'l1-2-2', title: 'গুণগত রসায়ন', type: 'video', duration: '60 min', videoId: 'dQw4w9WgXcQ', lectureSheetUrl: 'https://www.google.com/drive/' },
            ]
        },
        { 
            id: 'm1-3',
            title: 'উচ্চতর গণিত',
            lessons: [
                 { id: 'l1-3-1', title: 'ম্যাট্রিক্স ও নির্ণায়ক', type: 'video', duration: '65 min', videoId: 'dQw4w9WgXcQ', lectureSheetUrl: 'https://www.google.com/drive/' },
            ]
        },
        { 
            id: 'm1-4',
            title: 'জীববিজ্ঞান',
            lessons: [
                { id: 'l1-4-1', title: 'কোষ ও এর গঠন', type: 'video', duration: '50 min', videoId: 'dQw4w9WgXcQ', lectureSheetUrl: 'https://www.google.com/drive/' },
            ]
        },
    ],
    features: ['লাইভ ক্লাস', 'লেকচার শীট', 'ডেইলি এক্সাম', 'সাপ্তাহিক পরীক্ষা', 'প্রশ্ন-উত্তর সেশন', 'ফাইনাল মডেল টেস্ট'],
    features_detailed: [
        { title: 'লাইভ ক্লাস', description: 'সরাসরি প্রশ্ন করার সুযোগ' },
        { title: 'লেকচার শীট', description: 'প্রতিটি ক্লাসের পর নোট' },
        { title: 'ডেইলি এক্সাম', description: 'দৈনিক অগ্রগতি যাচাই' },
        { title: 'সাপ্তাহিক পরীক্ষা', description: 'সাপ্তাহিক পরীক্ষার মাধ্যমে প্রস্তুতি' },
        { title: 'প্রশ্ন-উত্তর সেশন', description: 'সরাসরি প্রশ্ন করার সুযোগ' },
        { title: 'ফাইনাল মডেল টেস্ট', description: ' চূড়ান্ত পরীক্ষার প্রস্তুতি' },
    ],
    imageTitle: 'PCMB',
    classRoutine: [
        { day: 'শনি', subject: 'পদার্থবিজ্ঞান', time: 'সন্ধ্যা ৭:০০', instructorName: 'Jubayer Ahmed' },
        { day: 'রবি', subject: 'রসায়ন', time: 'সন্ধ্যা ৭:০০', instructorName: 'Dr. Sadia Islam' },
        { day: 'সোম', subject: 'উচ্চতর গণিত', time: 'সন্ধ্যা ৭:০০', instructorName: 'Raihan Chowdhury' },
        { day: 'মঙ্গল', subject: 'জীববিজ্ঞান', time: 'সন্ধ্যা ৭:০০', instructorName: 'Ayesha Khan' },
    ],
    faqs: [
        { question: 'কোর্সটি কীভাবে কিনব?', answer: 'আপনি "Enroll Now" বাটনে ক্লিক করে বিকাশ, নগদ বা কার্ডের মাধ্যমে পেমেন্ট করে কোর্সটি কিনতে পারেন।' },
        { question: 'ক্লাসগুলো কি লাইভ হবে?', answer: 'হ্যাঁ, সকল ক্লাস লাইভ অনুষ্ঠিত হবে এবং প্রতিটি ক্লাসের রেকর্ডেড ভিডিও পোর্টালে পাওয়া যাবে।' },
        { question: 'কোর্সের ম্যাটেরিয়ালগুলো কোথায় পাব?', answer: 'সকল লেকচার শীট এবং অন্যান্য রিসোর্স আপনার স্টুডেন্ট ড্যাশবোর্ডের "Resources" সেকশনে পাবেন।' }
    ],
    reviewsData: [
      { id: 'r1', user: { name: 'Rahim Sheikh', avatarUrl: 'https://placehold.co/100x100.png', dataAiHint: 'male student' }, rating: 5, comment: 'This course is amazing! The instructors explain everything so clearly.', date: 'June 15, 2024' },
      { id: 'r2', user: { name: 'Fatima Akter', avatarUrl: 'https://placehold.co/100x100.png', dataAiHint: 'female student' }, rating: 4, comment: 'Great content, but I wish there were more practice problems.', date: 'June 12, 2024' },
    ],
    liveClasses: [
        { id: 'lc1-1', topic: 'ভেক্টর প্রবলেম সলভিং', date: 'July 10, 2024', time: '8:00 PM', platform: 'YouTube Live', joinUrl: 'https://www.youtube.com/watch?v=jfKfPfyJRdk' },
        { id: 'lc1-2', topic: 'গতিবিদ্যা রিভিউ', date: 'July 12, 2024', time: '8:00 PM', platform: 'Facebook Live', joinUrl: 'https://www.facebook.com/watch/live/?ref=watch_permalink&v=1158671215243119' },
        { id: 'lc1-3', topic: 'রসায়ন বিশেষ লাইভ', date: 'July 15, 2024', time: '7:00 PM', platform: 'Zoom', joinUrl: 'https://zoom.us/j/1234567890' },
    ],
    includedArchivedCourseIds: ['17'],
    quizzes: [
      { 
        id: 'q1', title: 'Chapter 1 Quiz', topic: 'ভৌত জগৎ ও পরিমাপ', totalQuestions: 2, duration: 5, status: 'Completed', score: 50,
        questions: [
            { id: 'q1-1', text: 'Which of the following is a fundamental unit?', options: ['Newton', 'Joule', 'Ampere', 'Watt'], correctAnswer: 2 },
            { id: 'q1-2', text: 'What is the dimension of velocity?', options: ['LT', 'L/T', 'L/T^2', 'T/L'], correctAnswer: 1 }
        ]
      },
      { 
        id: 'q2', title: 'Chapter 2 Quiz', topic: 'ভেক্টর', totalQuestions: 3, duration: 10, status: 'Not Started',
        questions: [
            { id: 'q2-1', text: 'What is the dot product of two perpendicular vectors?', options: ['0', '1', 'Their product', 'Their sum'], correctAnswer: 0 },
            { id: 'q2-2', text: 'Which of the following is a scalar quantity?', options: ['Velocity', 'Acceleration', 'Work', 'Force'], correctAnswer: 2 },
            { id: 'q2-3', text: 'The cross product of two parallel vectors is?', options: ['A scalar', 'A zero vector', 'A unit vector', 'Their product'], correctAnswer: 1 }
        ]
      },
    ],
    assignments: [
      { id: 'a1', title: 'Vector Problem Set', topic: 'ভেক্টর', deadline: '2024-07-20', status: 'Graded', grade: 'A+', feedback: 'Excellent work! You have a strong grasp of vector concepts. Keep it up.', submissionDate: '2024-07-19' },
      { id: 'a2', title: 'Lab Safety Report', topic: 'ল্যাবরেটরির নিরাপদ ব্যবহার', deadline: '2024-07-25', status: 'Submitted', submissionDate: '2024-07-24' },
      { id: 'a3', title: 'Kinematics Problems', topic: 'গতিবিদ্যা', deadline: '2024-08-01', status: 'Pending' },
      { id: 'a4', title: 'Organic Chemistry Reactions', topic: 'জৈব রসায়ন', deadline: '2024-07-15', status: 'Late' },
    ]
  },
  {
    id: '2',
    title: 'Admission Test Prep (Medical)',
    description: 'A comprehensive course designed to help you ace the medical admission tests with in-depth lessons, practice questions, and mock tests.',
    status: 'Published',
    organizationId: 'org_medishark',
    organizationName: 'MediShark',
    instructors: [
       getInst('ins-si'),
       getInst('ins-ka')
    ],
    imageUrl: 'https://placehold.co/600x400.png',
    dataAiHint: 'medical students',
    category: 'Admission',
    subCategory: 'Medical',
    price: 'BDT 5000',
    rating: 4.9,
    reviews: 250,
    features: ['বিষয়ভিত্তিক ক্লাস', 'প্রশ্নব্যাংক সলভ', 'ফাইনাল মডেল টেস্ট', 'লেকচার শীট', 'ডেইলি এক্সাম', 'সাপ্তাহিক পরীক্ষা'],
    imageTitle: 'Medical',
    features_detailed: [
        { title: 'লাইভ ক্লাস', description: 'সরাসরি প্রশ্ন করার সুযোগ' },
        { title: 'লেকচার শীট', description: 'প্রতিটি ক্লাসের পর নোট' },
        { title: 'ডেইলি এক্সাম', description: 'দৈনিক অগ্রগতি যাচাই' },
        { title: 'সাপ্তাহিক পরীক্ষা', description: 'সাপ্তাহিক পরীক্ষার মাধ্যমে প্রস্তুতি' },
        { title: 'প্রশ্ন-উত্তর সেশন', description: 'সরাসরি প্রশ্ন করার সুযোগ' },
        { title: 'ফাইনাল মডেল টেস্ট', description: ' চূড়ানত পরীক্ষার প্রস্তুতি' },
    ],
    syllabus: [
        { 
            id: 'm2-1',
            title: 'জীববিজ্ঞান',
            lessons: [
                { id: 'l2-1-1', title: 'প্রাণী বৈচিত্র্য', type: 'video', duration: '45 min', videoId: 'dQw4w9WgXcQ', lectureSheetUrl: 'https://www.google.com/drive/' },
                { id: 'l2-1-2', title: 'কোষ ও টিস্যু', type: 'video', duration: '55 min', videoId: 'dQw4w9WgXcQ', lectureSheetUrl: 'https://www.google.com/drive/' },
            ]
        },
        { 
            id: 'm2-2',
            title: 'রসায়ন',
            lessons: [
                { id: 'l2-2-1', title: 'জৈব রসায়ন', type: 'video', duration: '70 min', videoId: 'dQw4w9WgXcQ', lectureSheetUrl: 'https://www.google.com/drive/' },
            ]
        },
    ],
    classRoutine: [
        { day: 'শনি', subject: 'জীববিজ্ঞান', time: 'সন্ধ্যা ৭:০০', instructorName: 'Dr. Sadia Islam' },
        { day: 'সোম', subject: 'রসায়ন', time: 'সন্ধ্যা ৭:০০', instructorName: 'Dr. Karim Ahmed' },
    ],
    faqs: [
        { question: 'মেডিকেল ভর্তি পরীক্ষার জন্য যোগ্যতা কী?', answer: 'সাধারণত এসএসসি এবং এইচএসসিতে জীববিজ্ঞানসহ নির্দিষ্ট জিপিএ প্রয়োজন হয়। বিস্তারিত সার্কুলারে উল্লেখ থাকে।' },
        { question: 'নেগেটিভ মার্কিং আছে কি?', answer: 'হ্যাঁ, মেডিকেল ভর্তি পরীক্ষায় প্রতিটি ভুল উত্তরের জন্য ০.২৫ নম্বর কাটা হয়।' },
        { question: 'এই কোর্সের ক্লাসগুলো রেকর্ডেড থাকবে?', answer: 'হ্যাঁ, প্রতিটি লাইভ ক্লাসের রেকর্ডিং আপনার ড্যাশবোর্ডে পাওয়া যাবে।' }
    ]
  },
  {
    id: '3',
    title: 'IELTS Preparation Course',
    description: 'Achieve your desired IELTS band score with our intensive preparation course covering all four modules: Listening, Reading, Writing, and Speaking.',
    status: 'Published',
    instructors: [
       getInst('ins-rc'),
       { id: 'ins-jm', name: 'Jessica Miller', title: 'Listening & Reading', avatarUrl: 'https://placehold.co/100x100.png', dataAiHint: 'female instructor', slug: 'jessica-miller', status: 'Approved', bio: 'Bio for Jessica' },
    ],
    imageUrl: 'https://placehold.co/600x400.png',
    dataAiHint: 'ielts exam',
    category: 'Language',
    price: 'BDT 3000',
    rating: 4.7,
    reviews: 180,
    features: [' রেকর্ডেড ক্লাস', 'লেকচার শীট', 'কুইজ', 'মক টেস্ট', 'Speaking সেশন' ],
    imageTitle: 'IELTS Prep',
    features_detailed: [
        { title: 'Listening Module', description: 'Practice with real exam-like audio clips.' },
        { title: 'Reading Module', description: 'Learn strategies for different question types.' },
        { title: 'Writing Module', description: 'Master Task 1 and Task 2 with expert feedback.' },
        { title: 'Speaking Module', description: 'One-on-one practice sessions.' },
        { title: 'Mock Tests', description: 'Full-length mock tests to simulate exam conditions.' },
        { title: 'Strategy Sessions', description: 'Tips and tricks to maximize your score.' },
    ],
    syllabus: [
        { 
            id: 'm3-1',
            title: 'Listening',
            lessons: [
                { id: 'l3-1-1', title: 'Introduction to Listening Skills', type: 'video', duration: '30 min', videoId: 'dQw4w9WgXcQ', lectureSheetUrl: 'https://www.google.com/drive/' },
                { id: 'l3-1-2', title: 'Practice Test 1', type: 'quiz', duration: '40 min' },
            ]
        },
        { 
            id: 'm3-2',
            title: 'Reading',
            lessons: [
                { id: 'l3-2-1', title: 'Skimming and Scanning', type: 'video', duration: '35 min', videoId: 'dQw4w9WgXcQ', lectureSheetUrl: 'https://www.google.com/drive/' },
            ]
        },
    ],
    classRoutine: [
        { day: 'Flexible', subject: 'Recorded Modules', time: 'Anytime' },
        { day: 'Saturday', subject: 'Live Speaking Practice', time: '8:00 PM', instructorName: 'Raihan Chowdhury' },
    ],
    faqs: [
        { question: 'What is the duration of this course?', answer: 'This is a self-paced course with lifetime access to materials. Live sessions are held weekly.' },
        { question: 'Will I get a certificate?', answer: 'Yes, a certificate of completion is provided after you finish all the modules and mock tests.' },
    ],
    reviewsData: [
      { id: 'r3', user: { name: 'John Doe', avatarUrl: 'https://placehold.co/100x100.png', dataAiHint: 'male person' }, rating: 5, comment: 'Excellent course for IELTS prep. The instructor is very knowledgeable.', date: 'May 20, 2024' },
    ],
    liveClasses: [
        { id: 'lc3-1', topic: 'Speaking Test Simulation', date: 'July 11, 2024', time: '9:00 PM', platform: 'Zoom', joinUrl: 'https://zoom.us/j/1234567890' },
    ],
    quizzes: [
      { id: 'q3', title: 'Listening Mock Test', topic: 'Full Module', totalQuestions: 40, duration: 30, status: 'Completed', score: 85, questions: [] },
      { id: 'q4', title: 'Reading Practice 1', topic: 'Skimming and Scanning', totalQuestions: 10, duration: 15, status: 'In Progress', questions: [] },
    ],
    assignments: [
      { id: 'a3', title: 'Writing Task 1 Sample', topic: 'Report Writing', deadline: '2024-07-18', status: 'Graded', grade: '7.5' },
      { id: 'a4', title: 'Writing Task 2 Essay', topic: 'Argumentative Essay', deadline: '2024-07-22', status: 'Pending' },
    ]
  },
  {
    id: '4',
    title: 'Data Science with Python',
    description: 'Learn the fundamentals of data science and machine learning using Python. This course is perfect for beginners with no prior programming experience.',
    status: 'Published',
     instructors: [
       getInst('ins-ak'),
       { id: 'ins-dc', name: 'David Chen', title: 'Machine Learning Expert', avatarUrl: 'https://placehold.co/100x100.png', dataAiHint: 'male programmer', slug: 'david-chen', status: 'Approved', bio: 'Bio for David' },
    ],
    imageUrl: 'https://placehold.co/600x400.png',
    dataAiHint: 'python code',
    category: 'Skills',
    price: 'BDT 5500',
    rating: 4.8,
    reviews: 300,
    features: [' রেকর্ডেড ক্লাস', 'লেকচার শীট', 'কুইজ', 'প্রজেক্ট', 'সার্টিফিকেট' ],
    imageTitle: 'Data Science',
    features_detailed: [
        { title: 'Python Programming', description: 'Master the basics of Python for data analysis.' },
        { title: 'Data Analysis', description: 'Learn libraries like NumPy and Pandas.' },
        { title: 'Data Visualization', description: 'Create stunning charts with Matplotlib and Seaborn.' },
        { title: 'Machine Learning', description: 'Understand algorithms with Scikit-learn.' },
        { title: 'Real-world Projects', description: 'Apply your skills to solve practical problems.' },
        { title: 'Career Guidance', description: 'Get tips on building your data science portfolio.' },
    ],
    syllabus: [
        { 
            id: 'm4-1',
            title: 'Module 1: Python Basics',
            lessons: [
                { id: 'l4-1-1', title: 'Variables and Data Types', type: 'video', duration: '45 min', videoId: 'dQw4w9WgXcQ', lectureSheetUrl: 'https://www.google.com/drive/' },
                { id: 'l4-1-2', title: 'Functions', type: 'video', duration: '50 min', videoId: 'dQw4w9WgXcQ', lectureSheetUrl: 'https://www.google.com/drive/' },
            ]
        },
        { 
            id: 'm4-2',
            title: 'Module 2: Data Manipulation with Pandas',
            lessons: [
                { id: 'l4-2-1', title: 'Introduction to DataFrames', type: 'video', duration: '60 min', videoId: 'dQw4w9WgXcQ', lectureSheetUrl: 'https://www.google.com/drive/' },
            ]
        },
    ],
    classRoutine: [
        { day: 'Flexible', subject: 'All Modules (Recorded)', time: 'Anytime' },
        { day: 'Sunday', subject: 'Live Q&A Session', time: '9:00 PM', instructorName: 'Ayesha Khan' },
    ],
    faqs: [
        { question: 'Do I need any prior programming experience?', answer: 'No, this course is designed for absolute beginners.' },
        { question: 'What software will I need?', answer: 'You will need a computer with Python and Jupyter Notebook installed. We will guide you through the setup process.' },
    ]
  },
  {
    id: '5',
    title: 'SSC 2025 Online Batch',
    description: 'A complete online batch for SSC 2025 candidates covering all subjects with live classes, lecture sheets, and regular exams.',
    status: 'Published',
    instructors: [
       getInst('ins-fm'),
       getInst('ins-nj'),
    ],
    imageUrl: 'https://placehold.co/600x400.png',
    dataAiHint: 'classroom students',
    category: 'SSC',
    price: 'BDT 4000',
    rating: 4.7,
    reviews: 95,
    features: ['লাইভ ক্লাস', 'লেকচার শীট', 'প্র্যাকটিস', 'ফাইনাল মডেল টেস্ট', 'সাপ্তাহিক পরীক্ষা'],
    imageTitle: 'SSC 2025',
    features_detailed: [
        { title: 'লাইভ ক্লাস', description: 'সরাসরি প্রশ্ন করার সুযোগ' },
        { title: 'লেকচার শীট', description: 'প্রতিটি ক্লাসের পর নোট' },
        { title: 'ডেইলি এক্সাম', description: 'দৈনিক অগ্রগতি যাচাই' },
        { title: 'সাপ্তাহিক পরীক্ষা', description: 'সাপ্তাহিক পরীক্ষার মাধ্যমে প্রস্তুতি' },
        { title: 'প্রশ্ন-উত্তর সেশন', description: 'সরাসরি প্রশ্ন করার সুযোগ' },
        { title: 'ফাইনাল মডেল টেস্ট', description: ' চূড়ানত পরীক্ষার প্রস্তুতি' },
    ],
    syllabus: [
        { 
            id: 'm5-1',
            title: 'গণিত',
            lessons: [
                { id: 'l5-1-1', title: 'বীজগণিত', type: 'video', duration: '50 min', videoId: 'dQw4w9WgXcQ', lectureSheetUrl: 'https://www.google.com/drive/' },
                { id: 'l5-1-2', title: 'জ্যামিতি', type: 'video', duration: '45 min', videoId: 'dQw4w9WgXcQ', lectureSheetUrl: 'https://www.google.com/drive/' },
            ]
        },
        { 
            id: 'm5-2',
            title: 'ইংরেজি',
            lessons: [
                 { id: 'l5-2-1', title: 'Grammar: Tenses', type: 'video', duration: '55 min', videoId: 'dQw4w9WgXcQ', lectureSheetUrl: 'https://www.google.com/drive/' },
            ]
        },
    ],
    classRoutine: [
        { day: 'শনি', subject: 'গণিত', time: 'বিকাল ৫:০০', instructorName: 'Farhan Mahmud' },
        { day: 'সোম', subject: 'ইংরেজি', time: 'বিকাল ৫:০০', instructorName: 'Nusrat Jahan' },
        { day: 'বুধ', subject: 'বিজ্ঞান', time: 'বিকাল ৫:০০', instructorName: 'Farhan Mahmud' },
    ],
    faqs: [
        { question: 'এই কোর্সটি কোন বোর্ডের জন্য?', answer: 'এই কোর্সটি বাংলাদেশের সকল শিক্ষা বোর্ডের সিলেবাস অনুযায়ী তৈরি করা হয়েছে।' },
        { question: 'ক্লাস মিস করলে কী হবে?', answer: 'প্রতিটি লাইভ ক্লাসের রেকর্ডিং আপনার ড্যাশবোর্ডে থাকবে, তাই আপনি যেকোনো সময় দেখে নিতে পারবেন।' }
    ]
  },
  {
    id: '6',
    title: 'HSC 2025 Commerce Batch',
    description: 'Join our comprehensive online batch for HSC 2025 commerce students. Get access to live classes, solve practice problems and clear your doubts.',
    status: 'Published',
    instructors: [
       getInst('ins-nj'),
       { id: 'ins-ik', name: 'Imran Khan', title: 'Finance', avatarUrl: 'https://placehold.co/100x100.png', dataAiHint: 'male teacher', slug: 'imran-khan', status: 'Approved', bio: 'Bio for Imran' },
    ],
    imageUrl: 'https://placehold.co/600x400.png',
    dataAiHint: 'lecture hall',
    category: 'HSC',
    subCategory: 'বাণিজ্য',
    price: 'BDT 4500',
    rating: 4.6,
    reviews: 80,
    features: ['লাইভ ক্লাস', 'লেকচার শীট', 'প্র্যাকটিস', 'ফাইনাল মডেল টেস্ট'],
    imageTitle: 'HSC 2025',
    features_detailed: [
        { title: 'লাইভ ক্লাস', description: 'সরাসরি প্রশ্ন করার সুযোগ' },
        { title: 'লেকচার শীট', description: 'প্রতিটি ক্লাসের পর নোট' },
        { title: 'ডেইলি এক্সাম', description: 'দৈনিক অগ্রগতি যাচাই' },
        { title: 'সাপ্তাহিক পরীক্ষা', description: 'সাপ্তাহিক পরীক্ষার মাধ্যমে প্রস্তুতি' },
    ],
     syllabus: [
        { 
            id: 'm6-1',
            title: 'হিসাববিজ্ঞান',
            lessons: [
                { id: 'l6-1-1', title: 'হিসাববিজ্ঞানের পরিচিতি', type: 'video', duration: '50 min', videoId: 'dQw4w9WgXcQ', lectureSheetUrl: 'https://www.google.com/drive/' },
            ]
        },
        { 
            id: 'm6-2',
            title: 'ফিন্যান্স, ব্যাংকিং ও বীমা',
            lessons: [
                 { id: 'l6-2-1', title: 'অর্থায়নের সূচনা', type: 'video', duration: '55 min', videoId: 'dQw4w9WgXcQ', lectureSheetUrl: 'https://www.google.com/drive/' },
            ]
        },
    ],
    classRoutine: [
        { day: 'রবি', subject: 'হিসাববিজ্ঞান', time: 'সন্ধ্যা ৭:০০', instructorName: 'Nusrat Jahan' },
        { day: 'মঙ্গল', subject: 'ফিন্যান্স, ব্যাংকিং ও বীমা', time: 'সন্ধ্যা ৭:০০', instructorName: 'Imran Khan' },
        { day: 'বৃহঃ', subject: 'ব্যবসায় সংগঠন', time: 'সন্ধ্যা ৭:০০', instructorName: 'Nusrat Jahan' },
    ],
    faqs: [
        { question: 'এই কোর্সটি কাদের জন্য?', answer: 'এই কোর্সটি এইচএসসি ২০২৫ এর বাণিজ্য বিভাগের শিক্ষার্থীদের জন্য।' },
        { question: 'কোর্সের মেয়াদ কতদিন?', answer: 'কোর্সটি এইচএসসি পরীক্ষা পর্যন্ত চলবে।' }
    ]
  },
  {
    id: '7',
    title: 'HSC ICT Masterclass',
    description: 'Master the HSC ICT syllabus with our recorded masterclass. Learn from the best and score high in your exams.',
    status: 'Published',
    instructors: [
       getInst('ins-ja'),
    ],
    imageUrl: 'https://placehold.co/600x400.png',
    dataAiHint: 'computer circuit',
    category: 'HSC',
    price: 'BDT 2500',
    rating: 4.9,
    reviews: 150,
    features: ['রেকর্ডেড ক্লাস', 'লেকচার শীট', 'কুইজ', 'সাপোর্ট সেশন'],
    imageTitle: 'HSC ICT',
    features_detailed: [
        { title: 'Chapter-wise Lectures', description: 'Detailed video lectures for all chapters.' },
        { title: 'Problem Solving', description: 'Creative question and programming problem solving.' },
        { title: 'CQ & MCQ Practice', description: 'Practice sessions for both types of questions.' },
        { title: '24/7 Support', description: 'Get your doubts cleared anytime in the support forum.' },
    ],
    syllabus: [
        { 
            id: 'm7-1',
            title: 'Chapter 3: Number Systems & Digital Devices',
            lessons: [
                { id: 'l7-1-1', title: 'Number Systems', type: 'video', duration: '60 min', videoId: 'dQw4w9WgXcQ', lectureSheetUrl: 'https://www.google.com/drive/' },
                { id: 'l7-1-2', title: 'Logic Gates', type: 'video', duration: '75 min', videoId: 'dQw4w9WgXcQ', lectureSheetUrl: 'https://www.google.com/drive/' },
            ]
        },
        { 
            id: 'm7-2',
            title: 'Chapter 5: Programming Language',
            lessons: [
                { id: 'l7-2-1', title: 'Introduction to C', type: 'video', duration: '50 min', videoId: 'dQw4w9WgXcQ', lectureSheetUrl: 'https://www.google.com/drive/' },
            ]
        },
    ],
    classRoutine: [
        { day: 'Flexible', subject: 'All Modules (Recorded)', time: 'Anytime' },
    ],
    faqs: [
        { question: 'Is this course enough for A+?', answer: 'Yes, this course covers the entire syllabus in-depth and is designed to help you achieve the highest grade.' },
    ]
  },
  {
    id: '8',
    title: 'Graphic Design Fundamentals',
    description: 'Learn the basics of graphic design including Photoshop, Illustrator, and Figma. Build a strong portfolio to start your design career.',
    status: 'Published',
    instructors: [
       getInst('ins-si'),
    ],
    imageUrl: 'https://placehold.co/600x400.png',
    dataAiHint: 'graphic design',
    category: 'Skills',
    price: 'BDT 3500',
    rating: 4.8,
    reviews: 210,
    features: ['ফটোশপ', 'ইলাস্ট্রেটর', 'ফিigma', 'ফ্রিল্যান্সিং গাইডলাইন'],
    imageTitle: 'Graphics',
    features_detailed: [
        { title: 'Adobe Photoshop', description: 'Photo editing, manipulation, and digital art.' },
        { title: 'Adobe Illustrator', description: 'Vector graphics, logo design, and illustrations.' },
        { title: 'Figma', description: 'UI/UX design for web and mobile apps.' },
        { title: 'Design Principles', description: 'Learn about color theory, typography, and layout.' },
        { title: 'Portfolio Building', description: 'Create a professional portfolio to showcase your work.' },
        { title: 'Freelancing', description: 'Learn how to start your career as a freelance designer.' },
    ],
    syllabus: [
        { 
            id: 'm8-1',
            title: 'Module 2: Mastering Photoshop',
            lessons: [
                { id: 'l8-1-1', title: 'Introduction to Photoshop UI', type: 'video', duration: '40 min', videoId: 'dQw4w9WgXcQ', lectureSheetUrl: 'https://www.google.com/drive/' },
            ]
        },
        { 
            id: 'm8-2',
            title: 'Module 3: Vector Art with Illustrator',
            lessons: [
                { id: 'l8-2-1', title: 'Mastering the Pen Tool', type: 'video', duration: '60 min', videoId: 'dQw4w9WgXcQ', lectureSheetUrl: 'https://www.google.com/drive/' },
            ]
        },
    ],
    classRoutine: [
        { day: 'Flexible', subject: 'All Modules (Recorded)', time: 'Anytime' },
        { day: 'Friday', subject: 'Live Project Review', time: '8:00 PM', instructorName: 'Sadia Islam' },
    ],
    faqs: [
        { question: 'Do I need a powerful computer for this course?', answer: 'A mid-range computer that can run Adobe software smoothly is recommended.' },
        { question: 'Will I get any software?', answer: 'We do not provide software. Students need to have their own licensed copies of Adobe Photoshop and Illustrator.' },
    ]
  },
  {
    id: '9',
    title: 'Engineering Admission',
    description: 'Prepare for engineering university admission tests with our specialized course. Cover Physics, Chemistry, and Higher Math in detail.',
    status: 'Published',
    instructors: [
       getInst('ins-ja'),
       getInst('ins-si'),
       getInst('ins-rc'),
    ],
    imageUrl: 'https://placehold.co/600x400.png',
    dataAiHint: 'engineering drawing',
    category: 'Admission',
    subCategory: 'Engineering',
    price: 'BDT 5000',
    rating: 4.8,
    reviews: 280,
    features: ['ফিজিক্স', 'ক্যামিস্ট্রি', 'হায়ার ম্যাথ', 'প্রশ্নব্যাংক সলভ', 'মডেল টেস্ট'],
    imageTitle: 'Engineering',
    features_detailed: [
        { title: 'লাইভ ক্লাস', description: 'সরাসরি প্রশ্ন করার সুযোগ' },
        { title: 'প্রশ্নব্যাংক সলভ', description: 'বিগত বছরের প্রশ্ন সমাধান' },
        { title: 'ডেইলি এক্সাম', description: 'দৈনিক অগ্রগতি যাচাই' },
        { title: 'সাপ্তাহিক পরীক্ষা', description: 'সাপ্তাহিক পরীক্ষার মাধ্যমে প্রস্তুতি' },
        { title: 'শর্টকাট টেকনিক', description: 'দ্রুত প্রব্লেম সলভ করার কৌশল' },
        { title: 'ফাইনাল মডেল টেস্ট', description: ' চূড়ান্ত পরীক্ষার প্রস্তুতি' },
    ],
    syllabus: [
        { 
            id: 'm9-1',
            title: 'Physics',
            lessons: [
                 { id: 'l9-1-1', title: 'Mechanics Review', type: 'video', duration: '80 min', videoId: 'dQw4w9WgXcQ', lectureSheetUrl: 'https://www.google.com/drive/' },
            ]
        },
        { 
            id: 'm9-2',
            title: 'Chemistry',
            lessons: [
                { id: 'l9-2-1', title: 'Organic Chemistry Review', type: 'video', duration: '90 min', videoId: 'dQw4w9WgXcQ', lectureSheetUrl: 'https://www.google.com/drive/' },
            ]
        },
    ],
    classRoutine: [
        { day: 'শনি-সোম-বুধ', subject: 'Physics, Chemistry, Math', time: 'রাত ৮:০০', instructorName: 'Jubayer Ahmed' },
    ],
    faqs: [
        { question: 'Is this course suitable for BUET admission?', answer: 'Yes, this course is designed to cover the syllabus of all major engineering universities in Bangladesh, including BUET, KUET, RUET, and CUET.' },
        { question: 'How many model tests are included?', answer: 'There are over 20 model tests included in this course.' },
    ]
  },
  {
    id: '10',
    title: 'University (Ka unit) Admission',
    description: 'A complete guide for Dhaka University Ka-unit admission test. Prepare with the best mentors and materials.',
    status: 'Published',
    organizationId: 'org_acs',
    organizationName: 'ACS Group',
    instructors: [
       getInst('ins-fm'),
    ],
    imageUrl: 'https://placehold.co/600x400.png',
    dataAiHint: 'university building',
    category: 'Admission',
    price: 'BDT 5000',
    rating: 4.7,
    reviews: 220,
    features: ['বিষয়ভিত্তিক ক্লাস', 'প্রশ্নব্যাংক সলভ', 'ফাইনাল মডেল টেস্ট'],
    imageTitle: 'DU Ka Unit',
    features_detailed: [
        { title: 'লাইভ ক্লাস', description: 'সরাসরি প্রশ্ন করার সুযোগ' },
        { title: 'প্রশ্নব্যাংক সলভ', description: 'বিগত বছরের প্রশ্ন সমাধান' },
        { title: 'এক্সাম', description: 'প্রস্তুতি যাচাই' },
        { title: 'মডেল টেস্ট', description: ' চূড়ান্ত পরীক্ষার প্রস্তুতি' },
    ],
    syllabus: [
        { 
            id: 'm10-1',
            title: 'Physics',
            lessons: [
                 { id: 'l10-1-1', title: 'Physics Ka Unit Analysis', type: 'video', duration: '60 min', videoId: 'dQw4w9WgXcQ', lectureSheetUrl: 'https://www.google.com/drive/' },
            ]
        },
    ],
    classRoutine: [
        { day: 'প্রতিদিন', subject: 'লাইভ ক্লাস ও পরীক্ষা', time: 'সন্ধ্যা ৭:৩০', instructorName: 'Farhan Mahmud' },
    ],
    faqs: [
        { question: 'How is this course different?', answer: 'We focus on the specific patterns of DU Ka-unit questions and provide exclusive shortcut techniques.' },
    ]
  },
  {
    id: '11',
    title: 'BCS Preliminary Course',
    description: 'Prepare for the BCS preliminary exam with our comprehensive course covering all subjects.',
    status: 'Published',
    instructors: [
       getInst('ins-rc'),
    ],
    imageUrl: 'https://placehold.co/600x400.png',
    dataAiHint: 'government building',
    category: 'Job Prep',
    price: 'BDT 4000',
    rating: 4.8,
    reviews: 400,
    features: ['লাইভ ক্লাস', 'লেকচার শীট', 'ডেইলি এক্সাম', 'মডেল টেস্ট'],
    imageTitle: 'BCS Preli',
    features_detailed: [
        { title: 'Subject-wise Classes', description: 'Detailed classes on all 10 subjects.' },
        { title: 'PDF Lecture Sheets', description: 'Downloadable notes for every class.' },
        { title: 'Regular Exams', description: 'Quizzes and exams to track your progress.' },
        { title: 'Final Model Tests', description: 'Prepare for the final exam with full-length model tests.' },
    ],
    syllabus: [
        { 
            id: 'm11-1',
            title: 'Bangladesh Affairs',
            lessons: [
                 { id: 'l11-1-1', title: 'History of Bangladesh', type: 'video', duration: '60 min', videoId: 'dQw4w9WgXcQ', lectureSheetUrl: 'https://www.google.com/drive/' },
            ]
        },
    ],
    classRoutine: [
        { day: 'Friday & Saturday', subject: 'Live Classes', time: '10:00 AM & 8:00 PM', instructorName: 'Raihan Chowdhury' },
    ],
    faqs: [
        { question: 'Is this course enough for the preliminary exam?', answer: 'Yes, this course comprehensively covers all the topics required for the BCS preliminary exam.' },
    ]
  },
  {
    id: '12',
    title: 'Bank Job Preparation',
    description: 'A complete course for bank job seekers. Cover math, english, general knowledge and analytical skills.',
    status: 'Published',
    organizationId: 'org_jobprep',
    organizationName: 'Job Prep Inc.',
    instructors: [
       getInst('ins-ak'),
    ],
    imageUrl: 'https://placehold.co/600x400.png',
    dataAiHint: 'bank interior',
    category: 'Job Prep',
    price: 'BDT 3500',
    rating: 4.7,
    reviews: 350,
    features: ['লাইভ ক্লাস', 'লেকচার শীট', 'ডেইলি এক্সাম', 'ভাইভা টিপস'],
    imageTitle: 'Bank Job',
    features_detailed: [
        { title: 'Math Classes', description: 'Shortcut techniques for quick problem-solving.' },
        { title: 'English Classes', description: 'Focus on grammar, vocabulary, and writing.' },
        { title: 'General Knowledge', description: 'Covering recent and important topics.' },
        { title: 'Mock Tests', description: 'Simulate real bank job exams.' },
    ],
    syllabus: [
        { 
            id: 'm12-1',
            title: 'Quantitative Aptitude',
            lessons: [
                 { id: 'l12-1-1', title: 'Percentage and Profit-Loss', type: 'video', duration: '60 min', videoId: 'dQw4w9WgXcQ', lectureSheetUrl: 'https://www.google.com/drive/' },
            ]
        },
    ],
    classRoutine: [
        { day: 'Sunday & Tuesday', subject: 'Live Classes', time: '9:00 PM', instructorName: 'Ayesha Khan' },
    ],
    faqs: [
        { question: 'Which banks does this course cover?', answer: 'This course is designed for the recruitment exams of all government and private banks in Bangladesh.' },
    ]
  },
  {
    id: '13',
    title: 'HSC 25 Online Batch - Arts',
    category: 'এইচএসসি ২৫ অনলাইন ব্যাচ',
    subCategory: 'মানবিক',
    features: ['লাইভ ক্লাস', 'লেকচার শীট', 'প্র্যাকটিস', 'ফাইনাল মডেল টেস্ট'],
    price: '৳ ৪২০০',
    status: 'Published',
    imageTitle: 'মানবিক শাখা',
    imageUrl: 'https://placehold.co/300x400.png',
    dataAiHint: 'history book',
    description: 'A complete online batch for HSC 2025 Arts students covering all subjects with live classes, lecture sheets, and regular exams.',
    instructors: [
       getInst('ins-nj'),
       { id: 'ins-ik', name: 'Imran Khan', title: 'Civics', avatarUrl: 'https://placehold.co/100x100.png', dataAiHint: 'male teacher', slug: 'imran-khan', status: 'Approved', bio: 'Bio for Imran' },
    ],
    rating: 4.5,
    reviews: 70,
    features_detailed: [
        { title: 'লাইভ ক্লাস', description: 'সরাসরি প্রশ্ন করার সুযোগ' },
        { title: 'লেকচার শীট', description: 'প্রতিটি ক্লাসের পর নোট' },
        { title: 'ডেইলি এক্সাম', description: 'দৈনিক অগ্রগতি যাচাই' },
        { title: 'সাপ্তাহিক পরীক্ষা', description: 'সাপ্তাহিক পরীক্ষার মাধ্যমে প্রস্তুতি' },
    ],
    syllabus: [
        { 
            id: 'm13-1',
            title: 'ইতিহাস',
            lessons: [
                 { id: 'l13-1-1', title: 'বাংলার ইতিহাস', type: 'video', duration: '50 min', videoId: 'dQw4w9WgXcQ', lectureSheetUrl: 'https://www.google.com/drive/' },
            ]
        },
    ],
    classRoutine: [
        { day: 'রবি', subject: 'ইতিহাস', time: 'বিকাল ৪:০০', instructorName: 'Nusrat Jahan' },
        { day: 'মঙ্গল', subject: 'পৌরনীতি', time: 'বিকাল ৪:০০', instructorName: 'Imran Khan' },
        { day: 'বৃহঃ', subject: 'অর্থনীতি', time: 'বিকাল ৪:০০', instructorName: 'Nusrat Jahan' },
    ],
    faqs: [
        { question: 'Will this course cover all subjects for the Arts group?', answer: 'Yes, this course covers all compulsory and major subjects for the HSC Arts stream.' },
    ]
  },
  {
    id: '14',
    title: 'HSC Physics Subject Course',
    category: 'বিষয়ভিত্তিক কোর্স',
    price: '৳ ৭৫০',
    status: 'Published',
    imageTitle: 'PHYSICS',
    imageUrl: 'https://placehold.co/300x400.png',
    dataAiHint: 'physics equation',
    features: ['রেকর্ডেড ক্লাস', 'লেকচার শীট', 'কুইজ', 'সাপোর্ট সেশন'],
    description: 'Master Physics for your HSC exams with our detailed subject-based course. Access recorded classes, lecture sheets, and quizzes anytime.',
    instructors: [
       getInst('ins-ja'),
    ],
    rating: 4.9,
    reviews: 180,
    features_detailed: [
        { title: 'Chapter-wise Videos', description: 'In-depth recorded lectures for each chapter.' },
        { title: 'Concept Clarity', description: 'Focus on building strong conceptual understanding.' },
        { title: 'Problem Solving', description: 'Solutions to a wide range of creative questions.' },
        { title: 'Doubt Clearing', description: 'Dedicated sessions to clear your doubts.' },
    ],
    syllabus: [
        { 
            id: 'm14-1',
            title: 'Physics 1st Paper',
            lessons: [
                { id: 'l14-1-1', title: 'Vectors', type: 'video', duration: '60 min', videoId: 'dQw4w9WgXcQ', lectureSheetUrl: 'https://www.google.com/drive/' },
            ]
        },
    ],
    classRoutine: [
        { day: 'Flexible', subject: 'All Modules (Recorded)', time: 'Anytime' },
    ],
    faqs: [
        { question: 'Is this course recorded or live?', answer: 'This is a fully recorded course, so you can learn at your own pace.' },
    ]
  },
   {
    id: '15',
    title: 'টেস্ট পেপার সলভ - বিজ্ঞান',
    category: 'টেস্ট পেপার সলভ',
    subCategory: 'বিজ্ঞান',
    price: '৳ ৯৫০',
    status: 'Published',
    imageTitle: 'বিজ্ঞান শাখা',
    imageUrl: 'https://placehold.co/300x400.png',
    dataAiHint: 'exam paper',
    features: ['ফিজিক্স', 'ক্যামিস্ট্রি', 'বায়োলজি', 'হায়ার ম্যাথ'],
    description: 'Solve test papers for the science stream with our expert teachers. Get ready for your final exams with confidence.',
    instructors: [
       getInst('ins-si'),
       getInst('ins-ja'),
    ],
    rating: 4.8,
    reviews: 130,
    features_detailed: [
        { title: 'Live Solving Classes', description: 'Solve top college test papers live with teachers.' },
        { title: 'PDF Solve Sheets', description: 'Get detailed PDF solutions for every question.' },
        { title: 'Time Management', description: 'Learn how to manage your time effectively in exams.' },
        { title: 'Suggestion', description: 'Get important suggestions before your exam.' },
    ],
    syllabus: [
        { 
            id: 'm15-1',
            title: 'Physics Test Papers',
            lessons: [
                 { id: 'l15-1-1', title: 'Dhaka College Test Paper Solve', type: 'video', duration: '90 min', videoId: 'dQw4w9WgXcQ', lectureSheetUrl: 'https://www.google.com/drive/' },
            ]
        },
    ],
    classRoutine: [
        { day: 'Daily', subject: 'Live Solving Class', time: '8:30 PM', instructorName: 'Jubayer Ahmed' },
    ],
    faqs: [
        { question: 'Which test papers will be solved?', answer: 'We will be solving test papers from renowned colleges across the country.' },
    ]
  },
  {
    id: '16',
    title: 'মাস্টার কোর্স - ওয়েব ডেভেলপমেন্ট',
    category: 'মাস্টার কোর্স',
    price: 'Free',
    status: 'Published',
    imageTitle: 'ওয়েব ডেভেলপমেন্ট',
    imageUrl: 'https://placehold.co/300x400.png',
    dataAiHint: 'programming code',
    features: ['HTML', 'CSS', 'JavaScript', 'Bootstrap'],
    description: 'Learn the basics of web development for free. Start your journey into the world of coding with our master course.',
    instructors: [
       getInst('ins-ja'),
    ],
    rating: 4.9,
    reviews: 500,
    features_detailed: [
        { title: 'HTML5', description: 'Learn the structure of web pages.' },
        { title: 'CSS3', description: 'Style your web pages and create beautiful layouts.' },
        { title: 'JavaScript', description: 'Make your web pages interactive.' },
        { title: 'Bootstrap 5', description: 'Build responsive websites quickly.' },
    ],
    syllabus: [
        { 
            id: 'm16-1',
            title: 'HTML',
            lessons: [
                 { id: 'l16-1-1', title: 'HTML Basics', type: 'video', duration: '30 min', videoId: 'dQw4w9WgXcQ', lectureSheetUrl: 'https://www.google.com/drive/' },
            ]
        },
        { 
            id: 'm16-2',
            title: 'CSS',
            lessons: [
                 { id: 'l16-2-1', title: 'CSS Basics', type: 'video', duration: '45 min', videoId: 'dQw4w9WgXcQ', lectureSheetUrl: 'https://www.google.com/drive/' },
            ]
        },
    ],
    classRoutine: [
        { day: 'Flexible', subject: 'All Modules (Recorded)', time: 'Anytime' },
    ],
    faqs: [
        { question: 'Is this course really free?', answer: 'Yes, this master course is completely free of charge.' },
        { question: 'Will I get a certificate?', answer: 'Yes, you will receive a certificate of completion after finishing the course.' },
    ]
  },
  {
    id: '17',
    title: 'HSC 2024 Crash Course (Archived)',
    category: 'Old is Gold',
    price: 'N/A',
    status: 'Published',
    isArchived: true,
    imageTitle: 'বিজ্ঞান শাখা',
    imageUrl: 'https://placehold.co/300x400.png',
    dataAiHint: 'old books',
    description: 'An archived version of the HSC 2024 crash course for science students.',
    instructors: [getInst('ins-ja')],
    rating: 4.8,
    reviews: 500,
  },
  {
    id: '18',
    title: 'Medical Admission 2023 (Archived)',
    category: 'Old is Gold',
    price: 'N/A',
    status: 'Published',
    isArchived: true,
    imageTitle: 'মেডিকেল',
    imageUrl: 'https://placehold.co/300x400.png',
    dataAiHint: 'archive box',
    description: 'The complete course for the 2023 medical admission test. Archived for reference.',
    instructors: [getInst('ins-si')],
    rating: 4.9,
    reviews: 800,
  }
];

export const blogPosts: BlogPost[] = [
    {
        slug: "study-tips-for-hsc",
        title: "Effective Study Tips for HSC Candidates",
        excerpt: "Discover proven strategies to boost your preparation for the upcoming HSC exams and achieve your desired results.",
        imageUrl: "https://placehold.co/600x400.png",
        dataAiHint: "student studying",
        content: `
        <p>The HSC exam is a significant milestone in a student's life in Bangladesh. Proper preparation is key to success. Here are some effective study tips to help you excel:</p>
        <h3 class="font-bold text-lg mt-4 mb-2">1. Create a Realistic Study Routine</h3>
        <p>A well-planned routine is the first step towards effective preparation. Allocate specific time slots for each subject, and make sure to include short breaks to avoid burnout. Consistency is more important than long hours of study.</p>
        <h3 class="font-bold text-lg mt-4 mb-2">2. Understand, Don't Just Memorize</h3>
        <p>Focus on understanding the core concepts rather than rote memorization. This will help you answer creative and analytical questions, which are common in the HSC syllabus.</p>
        <h3 class="font-bold text-lg mt-4 mb-2">3. Practice with Test Papers</h3>
        <p>Solving previous years' question papers and model tests is crucial. It helps you understand the exam pattern, manage your time effectively, and identify your weak areas.</p>
        <h3 class="font-bold text-lg mt-4 mb-2">4. Stay Healthy</h3>
        <p>Don't neglect your health. Ensure you get enough sleep, eat nutritious food, and engage in some form of physical activity. A healthy mind resides in a healthy body.</p>
        <p class="mt-4">By following these tips, you can significantly improve your preparation and confidence for the HSC exams. Good luck!</p>
        `
    },
    {
        slug: "choosing-university-subject",
        title: "How to Choose the Right University Subject for You",
        excerpt: "A comprehensive guide to help you navigate the difficult decision of choosing a subject for your university studies.",
        imageUrl: "https://placehold.co/600x400.png",
        dataAiHint: "university campus",
        content: `
        <p>Choosing a university subject is one of the most critical decisions of your life. It can shape your career and future. Here’s a guide to help you make an informed choice:</p>
        <h3 class="font-bold text-lg mt-4 mb-2">1. Assess Your Interests and Passions</h3>
        <p>What subjects do you genuinely enjoy studying? Think about what you are passionate about. Studying a subject you love will make your university years more enjoyable and fulfilling.</p>
        <h3 class="font-bold text-lg mt-4 mb-2">2. Consider Your Strengths</h3>
        <p>Identify your academic strengths. Are you good at analytical thinking, creative tasks, or problem-solving? Choose a subject that plays to your strengths.</p>
        <h3 class="font-bold text-lg mt-4 mb-2">3. Research Career Prospects</h3>
        <p>Look into the career opportunities associated with different subjects. What kind of jobs can you get? What is the potential for growth? Websites like LinkedIn and job portals can be excellent resources.</p>
        <h3 class="font-bold text-lg mt-4 mb-2">4. Talk to People</h3>
        <p>Speak with current university students, recent graduates, and professionals in fields that interest you. Their insights and experiences can be invaluable.</p>
        <p class="mt-4">Making this decision takes time, so start early and do thorough research. Choose wisely, and you'll be on the path to a successful and satisfying career.</p>
        `
    },
    {
        slug: "importance-of-skills-development",
        title: "The Importance of Skill Development Beyond Academics",
        excerpt: "Learn why developing practical skills is crucial for your career and how you can get started today.",
        imageUrl: "https://placehold.co/600x400.png",
        dataAiHint: "person coding",
        content: `
        <p>In today's competitive job market, academic qualifications alone are often not enough. Developing practical skills is essential for career success. Here's why:</p>
        <h3 class="font-bold text-lg mt-4 mb-2">1. Enhances Employability</h3>
        <p>Employers look for candidates who can hit the ground running. Skills like coding, graphic design, digital marketing, or public speaking make you a more attractive candidate.</p>
        <h3 class="font-bold text-lg mt-4 mb-2">2. Fosters Adaptability</h3>
        <p>The world is changing rapidly. New technologies and industries are emerging constantly. Having a diverse skill set makes you more adaptable to these changes and new opportunities.</p>
        <h3 class="font-bold text-lg mt-4 mb-2">3. Boosts Confidence</h3>
        <p>Mastering a new skill can be a great confidence booster. It proves that you are a capable learner and can take on new challenges.</p>
        <h3 class="font-bold text-lg mt-4 mb-2">How to Get Started?</h3>
        <p>Platforms like Red Dot Classroom offer a wide range of skill development courses. You can learn coding, design, languages, and much more from the comfort of your home. Start today and invest in your future.</p>
        `
    },
];

export const mockGrades = [
  {
    id: 'g1',
    courseName: 'HSC 2025 Crash Course - Science',
    assignmentName: 'Physics Model Test 1',
    score: 85,
    grade: 'A+',
    date: '2024-06-20',
  },
  {
    id: 'g2',
    courseName: 'HSC 2025 Crash Course - Science',
    assignmentName: 'Chemistry Quiz 3',
    score: 92,
    grade: 'A+',
    date: '2024-06-18',
  },
  {
    id: 'g3',
    courseName: 'IELTS Preparation Course',
    assignmentName: 'Writing Task 2 Practice',
    score: 75,
    grade: 'B+',
    date: '2024-06-15',
  },
  {
    id: 'g4',
    courseName: 'IELTS Preparation Course',
    assignmentName: 'Listening Mock Test',
    score: 80,
    grade: 'A',
    date: '2024-06-12',
  },
  {
    id: 'g5',
    courseName: 'Data Science with Python',
    assignmentName: 'Project 1: Pandas Data Analysis',
    score: 95,
    grade: 'A+',
    date: '2024-06-10',
  },
   {
    id: 'g6',
    courseName: 'HSC 2025 Crash Course - Science',
    assignmentName: 'Math Weekly Exam',
    score: 68,
    grade: 'B',
    date: '2024-06-05',
  },
];
