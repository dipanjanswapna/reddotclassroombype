// This file acts as a mock database, centralizing all content.
// In a real-world application, this data would come from a database via an API.

export type Course = {
  id: string;
  title: string;
  description: string;
  instructor: {
    name: string;
    title: string;
    avatarUrl: string;
    bio: string;
    dataAiHint: string;
  };
  imageUrl: string;
  dataAiHint: string;
  category: string;
  price: string;
  rating?: number;
  reviews?: number;
  whatYouWillLearn?: string[];
  syllabus?: { title: string; content: string }[];
  features?: string[];
  imageTitle?: string;
};

export type BlogPost = {
  slug: string;
  title: string;
  excerpt: string;
  imageUrl: string;
  dataAiHint: string;
  content: string;
};

export const courses: Course[] = [
  {
    id: '1',
    title: 'HSC 2025 ক্র্যাশ কোর্স - বিজ্ঞান',
    description: 'Master modern web development with React, Next.js, and advanced backend techniques. This course covers everything from building dynamic user interfaces to deploying scalable applications.',
    instructor: {
      name: 'Jubayer Ahmed',
      title: 'Lead Developer & Instructor',
      avatarUrl: 'https://placehold.co/100x100',
      bio: 'Jubayer is a seasoned full-stack developer with over 10 years of experience building applications for high-growth startups and established tech companies.',
      dataAiHint: 'male teacher',
    },
    imageUrl: 'https://placehold.co/600x400',
    dataAiHint: 'physics class',
    category: 'HSC',
    price: 'BDT 4500',
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
        { title: 'Module 1: React Fundamentals Deep Dive', content: 'Advanced hooks, context API, performance optimization.' },
        { title: 'Module 2: Introduction to Next.js', content: 'Pages router, data fetching, static site generation.' },
        { title: 'Module 3: Backend with Node.js & Express', content: 'Building REST APIs, middleware, database integration.' },
        { title: 'Module 4: Authentication & Security', content: 'JWT, OAuth, password hashing, common vulnerabilities.' },
        { title: 'Module 5: Deployment & DevOps', content: 'Docker basics, CI/CD pipelines, deploying to the cloud.' },
    ],
    features: ['লাইভ ক্লাস', 'লেকচার শীট', 'প্র্যাকটিস', 'ফাইনাল মডেল টেস্ট'],
    imageTitle: 'PCMB',
  },
  {
    id: '2',
    title: 'Admission Test Prep (Medical)',
    description: 'A comprehensive course designed to help you ace the medical admission tests with in-depth lessons, practice questions, and mock tests.',
    instructor: {
      name: 'Sadia Islam',
      title: 'Medical Admission Specialist',
      avatarUrl: 'https://placehold.co/100x100',
      bio: 'Sadia is a doctor and an experienced instructor who has helped hundreds of students get into their dream medical colleges.',
      dataAiHint: 'female doctor'
    },
    imageUrl: 'https://placehold.co/600x400',
    dataAiHint: 'medical students',
    category: 'Admission',
    price: 'BDT 5000',
    features: ['বিষয়ভিত্তিক ক্লাস', 'প্রশ্নব্যাংক সলভ', 'ফাইনাল মডেল টেস্ট'],
    imageTitle: 'Medical',
  },
  {
    id: '3',
    title: 'IELTS Preparation Course',
    description: 'Achieve your desired IELTS band score with our intensive preparation course covering all four modules: Listening, Reading, Writing, and Speaking.',
    instructor: {
        name: 'Raihan Chowdhury',
        title: 'Certified IELTS Trainer',
        avatarUrl: 'https://placehold.co/100x100',
        bio: 'Raihan has been teaching IELTS for over 8 years and has a proven track record of helping students achieve high scores.',
        dataAiHint: 'english teacher'
    },
    imageUrl: 'https://placehold.co/600x400',
    dataAiHint: 'ielts exam',
    category: 'Language',
    price: 'BDT 3000',
    features: [' রেকর্ডেড ক্লাস', 'লেকচার শীট', 'কুইজ' ],
    imageTitle: 'IELTS Prep'
  },
  {
    id: '4',
    title: 'Data Science with Python',
    description: 'Learn the fundamentals of data science and machine learning using Python. This course is perfect for beginners with no prior programming experience.',
    instructor: {
        name: 'Ayesha Khan',
        title: 'Data Scientist',
        avatarUrl: 'https://placehold.co/100x100',
        bio: 'Ayesha is a professional data scientist working in the tech industry, with a passion for teaching and sharing her knowledge.',
        dataAiHint: 'female programmer'
    },
    imageUrl: 'https://placehold.co/600x400',
    dataAiHint: 'python code',
    category: 'Skills',
    price: 'BDT 5500',
    features: [' রেকর্ডেড ক্লাস', 'লেকচার শীট', 'কুইজ' ],
    imageTitle: 'Data Science'
  },
  {
    id: '5',
    title: 'SSC 2025 Online Batch',
    description: 'A complete online batch for SSC 2025 candidates covering all subjects with live classes, lecture sheets, and regular exams.',
    instructor: {
      name: 'Farhan Mahmud',
      title: 'Experienced SSC Tutor',
      avatarUrl: 'https://placehold.co/100x100',
      bio: 'Farhan has been teaching for over 12 years and specializes in preparing students for public exams.',
      dataAiHint: 'male teacher'
    },
    imageUrl: 'https://placehold.co/600x400',
    dataAiHint: 'classroom students',
    category: 'SSC',
    price: 'BDT 4000',
    features: ['লাইভ ক্লাস', 'লেকচার শীট', 'প্র্যাকটিস', 'ফাইনাল মডেল টেস্ট'],
    imageTitle: 'SSC 2025'
  },
  {
    id: '6',
    title: 'HSC 2025 Online Batch',
    description: 'Join our comprehensive online batch for HSC 2025 students. Get access to live classes, solve practice problems and clear your doubts.',
    instructor: {
      name: 'Nusrat Jahan',
      title: 'HSC Specialist',
      avatarUrl: 'https://placehold.co/100x100',
      bio: 'Nusrat is a passionate educator with a knack for making complex topics easy to understand.',
      dataAiHint: 'female teacher'
    },
    imageUrl: 'https://placehold.co/600x400',
    dataAiHint: 'lecture hall',
    category: 'HSC',
    price: 'BDT 4500',
    features: ['লাইভ ক্লাস', 'লেকচার শীট', 'প্র্যাকটিস', 'ফাইনাল মডেল টেস্ট'],
    imageTitle: 'HSC 2025'
  },
  {
    id: '7',
    title: 'HSC ICT Masterclass',
    description: 'Master the HSC ICT syllabus with our recorded masterclass. Learn from the best and score high in your exams.',
    instructor: {
      name: 'Jubayer Ahmed',
      title: 'ICT Expert',
      avatarUrl: 'https://placehold.co/100x100',
      bio: 'Jubayer is a seasoned full-stack developer with over 10 years of experience building applications for high-growth startups and established tech companies.',
      dataAiHint: 'male teacher'
    },
    imageUrl: 'https://placehold.co/600x400',
    dataAiHint: 'computer circuit',
    category: 'HSC',
    price: 'BDT 2500',
    features: ['রেকর্ডেড ক্লাস', 'লেকচার শীট', 'কুইজ'],
    imageTitle: 'HSC ICT'
  },
  {
    id: '8',
    title: 'Graphic Design Fundamentals',
    description: 'Learn the basics of graphic design including Photoshop, Illustrator, and Figma. Build a strong portfolio to start your design career.',
    instructor: {
      name: 'Sadia Islam',
      title: 'Professional Graphic Designer',
      avatarUrl: 'https://placehold.co/100x100',
      bio: 'Sadia is a creative designer with a passion for visual storytelling and teaching design principles.',
      dataAiHint: 'female artist'
    },
    imageUrl: 'https://placehold.co/600x400',
    dataAiHint: 'graphic design',
    category: 'Skills',
    price: 'BDT 3500',
    features: ['ফটোশপ', 'ইলাস্ট্রেটর', 'ফিigma'],
    imageTitle: 'Graphics'
  },
  {
    id: '9',
    title: 'Engineering Admission',
    description: 'Prepare for engineering university admission tests with our specialized course. Cover Physics, Chemistry, and Higher Math in detail.',
    instructor: {
      name: 'Jubayer Ahmed',
      title: 'Engineering Admission Expert',
      avatarUrl: 'https://placehold.co/100x100',
      bio: 'Jubayer is a seasoned full-stack developer with over 10 years of experience building applications for high-growth startups and established tech companies.',
      dataAiHint: 'male engineer'
    },
    imageUrl: 'https://placehold.co/600x400',
    dataAiHint: 'engineering drawing',
    category: 'Admission',
    price: 'BDT 5000',
    features: ['ফিজিক্স', 'ক্যামিস্ট্রি', 'হায়ার ম্যাথ'],
    imageTitle: 'Engineering'
  },
  {
    id: '10',
    title: 'University (Ka unit) Admission',
    description: 'A complete guide for Dhaka University Ka-unit admission test. Prepare with the best mentors and materials.',
    instructor: {
      name: 'Farhan Mahmud',
      title: 'DU Admission Mentor',
      avatarUrl: 'https://placehold.co/100x100',
      bio: 'Farhan has been teaching for over 12 years and specializes in preparing students for public exams.',
      dataAiHint: 'male teacher'
    },
    imageUrl: 'https://placehold.co/600x400',
    dataAiHint: 'university building',
    category: 'Admission',
    price: 'BDT 5000',
    features: ['বিষয়ভিত্তিক ক্লাস', 'প্রশ্নব্যাংক সলভ', 'ফাইনাল মডেল টেস্ট'],
    imageTitle: 'DU Ka Unit'
  },
  {
    id: '11',
    title: 'BCS Preliminary Course',
    description: 'Prepare for the BCS preliminary exam with our comprehensive course covering all subjects.',
    instructor: {
      name: 'Raihan Chowdhury',
      title: 'BCS Cadre Officer',
      avatarUrl: 'https://placehold.co/100x100',
      bio: 'Raihan has been teaching for over 8 years and has a proven track record of helping students achieve high scores.',
      dataAiHint: 'government official'
    },
    imageUrl: 'https://placehold.co/600x400',
    dataAiHint: 'government building',
    category: 'Job Prep',
    price: 'BDT 4000',
    features: ['লাইভ ক্লাস', 'লেকচার শীট', 'ডেইলি এক্সাম'],
    imageTitle: 'BCS Preli'
  },
  {
    id: '12',
    title: 'Bank Job Preparation',
    description: 'A complete course for bank job seekers. Cover math, english, general knowledge and analytical skills.',
    instructor: {
      name: 'Ayesha Khan',
      title: 'Bank Officer',
      avatarUrl: 'https://placehold.co/100x100',
      bio: 'Ayesha is a professional data scientist working in the tech industry, with a passion for teaching and sharing her knowledge.',
      dataAiHint: 'female banker'
    },
    imageUrl: 'https://placehold.co/600x400',
    dataAiHint: 'bank interior',
    category: 'Job Prep',
    price: 'BDT 3500',
    features: ['লাইভ ক্লাস', 'লেকচার শীট', 'ডেইলি এক্সাম'],
    imageTitle: 'Bank Job'
  },
  {
    id: '13',
    title: 'HSC 25 Online Batch - Arts',
    category: 'এইচএসসি ২৫ অনলাইন ব্যাচ',
    features: ['লাইভ ক্লাস', 'লেকচার শীট', 'প্র্যাকটিস', 'ফাইনাল মডেল টেস্ট'],
    price: '৳ ১২৫০',
    imageTitle: 'বাংলা ঐচ্ছিক',
    imageUrl: 'https://placehold.co/300x400',
    dataAiHint: 'bangla literature',
    description: 'A complete online batch for HSC 2025 Arts students covering all subjects with live classes, lecture sheets, and regular exams.',
    instructor: {
      name: 'Nusrat Jahan',
      title: 'HSC Specialist',
      avatarUrl: 'https://placehold.co/100x100',
      bio: 'Nusrat is a passionate educator with a knack for making complex topics easy to understand.',
      dataAiHint: 'female teacher'
    },
  },
  {
    id: '14',
    title: 'HSC Physics Subject Course',
    category: 'বিষয়ভিত্তিক কোর্স',
    price: '৳ ৭৫০',
    imageTitle: 'PHYSICS',
    imageUrl: 'https://placehold.co/300x400',
    dataAiHint: 'physics equation',
    features: ['রেকর্ডেড ক্লাস', 'লেকচার শীট', 'কুইজ'],
    description: 'Master Physics for your HSC exams with our detailed subject-based course. Access recorded classes, lecture sheets, and quizzes anytime.',
    instructor: {
      name: 'Jubayer Ahmed',
      title: 'Physics Expert',
      avatarUrl: 'https://placehold.co/100x100',
      bio: 'Jubayer is a seasoned full-stack developer with over 10 years of experience building applications for high-growth startups and established tech companies.',
      dataAiHint: 'male teacher'
    },
  },
   {
    id: '15',
    title: 'টেস্ট পেপার সলভ - বিজ্ঞান',
    category: 'টেস্ট পেপার সলভ',
    price: '৳ ৯৫০',
    imageTitle: 'বিজ্ঞান শাখা',
    imageUrl: 'https://placehold.co/300x400',
    dataAiHint: 'exam paper',
    features: ['ফিজিক্স', 'ক্যামিস্ট্রি', 'বায়োলজি'],
    description: 'Solve test papers for the science stream with our expert teachers. Get ready for your final exams with confidence.',
    instructor: {
        name: 'Sadia Islam',
        title: 'Exam Specialist',
        avatarUrl: 'https://placehold.co/100x100',
        bio: 'Sadia is a doctor and an experienced instructor who has helped hundreds of students get into their dream medical colleges.',
        dataAiHint: 'female doctor'
    },
  },
  {
    id: '16',
    title: 'মাস্টার কোর্স - ওয়েব ডেভেলপমেন্ট',
    category: 'মাস্টার কোর্স',
    price: 'Free',
    imageTitle: 'ওয়েব ডেভেলপমেন্ট',
    imageUrl: 'https://placehold.co/300x400',
    dataAiHint: 'programming code',
    features: ['HTML', 'CSS', 'JavaScript'],
    description: 'Learn the basics of web development for free. Start your journey into the world of coding with our master course.',
    instructor: {
        name: 'Jubayer Ahmed',
        title: 'Lead Developer & Instructor',
        avatarUrl: 'https://placehold.co/100x100',
        bio: 'Jubayer is a seasoned full-stack developer with over 10 years of experience building applications for high-growth startups and established tech companies.',
        dataAiHint: 'male teacher'
    },
  }
];

export const blogPosts: BlogPost[] = [
    {
        slug: "study-tips-for-hsc",
        title: "Effective Study Tips for HSC Candidates",
        excerpt: "Discover proven strategies to boost your preparation for the upcoming HSC exams and achieve your desired results.",
        imageUrl: "https://placehold.co/600x400",
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
        imageUrl: "https://placehold.co/600x400",
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
        imageUrl: "https://placehold.co/600x400",
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
