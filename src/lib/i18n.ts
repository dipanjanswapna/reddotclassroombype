
/**
 * @fileOverview Internationalization (i18n) Dictionary.
 * This file contains a central dictionary of translations for the application.
 * It uses a simple object structure where each key maps to an object containing
 * translations for different languages (e.g., 'en' for English, 'bn' for Bengali).
 * This allows for easy and centralized management of all UI text, making it
 * straightforward to switch languages across the application.
 */
export const t = {
  // Header
  nav_rdc_store: { en: 'RDC Store', bn: 'RDC স্টোর' },
  nav_class_6_12: { en: 'Class 6-12', bn: 'ক্লাস ৬-১২' },
  nav_skills: { en: 'Skills', bn: 'স্কিলস' },
  nav_admission_test: { en: 'Admission Test', bn: 'ভর্তি পরীক্ষা' },
  nav_online_batch: { en: 'Offline Hub', bn: 'অফলাইন হাব' },
  nav_more: { en: 'More', bn: 'আরও' },
  nav_blog: { en: 'Blog', bn: 'ব্লগ' },
  nav_faq: { en: 'FAQ', bn: 'জিজ্ঞাসা' },
  nav_about: { en: 'About Us', bn: 'আমাদের সম্পর্কে' },
  nav_contact: { en: 'Contact', bn: 'যোগাযোগ' },
  hotline: { en: 'Hotline', bn: 'হটলাইন' },
  login: { en: 'Login', bn: 'লগইন' },
  signup: { en: 'Sign Up', bn: 'সাইন আপ' },
  or_login_with_roll: { en: 'Or Login with Class Roll', bn: 'অথবা ক্লাস রোল দিয়ে লগইন করুন' },
  class_roll: { en: 'Class Roll', bn: 'ক্লাস রোল' },
  or_login_with_staff_id: { en: 'Or Login with Staff ID', bn: 'অথবা স্টাফ আইডি দিয়ে লগইন করুন' },
  login_with_staff_id: { en: 'Login with Staff ID', bn: 'স্টাফ আইডি লগইন' },
  staff_id: { en: 'Staff ID', bn: 'স্টাফ আইডি' },
  email_login: { en: 'Login with Email', bn: 'ইমেইল লগইন' },


  // Footer
  footer_tagline: { en: 'Empowering learners across Bangladesh with quality education. Powered by PRANGONS ECOSYSTEM.', bn: 'গুণগত শিক্ষা দিয়ে শিক্ষার্থীদের ক্ষমতায়ন। Powered by PRANGONS ECOSYSTEM.' },
  quick_links: { en: 'Quick Links', bn: 'কুইক লিঙ্ক' },
  rdc_shop: { en: 'Courses', bn: 'কোর্সসমূহ' },
  for_students: { en: 'For Students', bn: 'শিক্ষার্থীদের জন্য' },
  register: { en: 'Register', bn: 'রেজিস্টার' },
  dashboard: { en: 'Dashboard', bn: 'ড্যাশবোর্ড' },
  for_teachers: { en: 'For Teachers', bn: 'শিক্ষকদের জন্য'},
  teacher_login: { en: 'Teacher Login', bn: 'শিক্ষক লগইন'},
  become_a_teacher: { en: 'Become a Teacher', bn: 'শিক্ষক হন' },
  become_a_seller: { en: 'Become a Seller', bn: 'বিক্রেতা হন' },
  seller_login: { en: 'Seller Login', bn: 'বিক্রেতা লগইন' },
  legal: { en: 'Legal', bn: 'আইন' },
  privacy_policy: { en: 'Privacy Policy', bn: 'প্রাইভেসি পলিসি' },
  terms_of_service: { en: 'Terms of Service', bn: 'ব্যবহারের শর্তাবলী' },
  copyright: { en: 'All rights reserved.', bn: 'সর্বস্বত্ব সংরক্ষিত।' },
  student_guardian_login: { en: 'Student/Guardian Login', bn: 'শিক্ষার্থী/অভিভাবক লগইন' },
  join_us: { en: 'Join Us', bn: 'আমাদের সাথে যোগ দিন' },
  teacher_seller_staff_login: { en: 'Staff/Seller Login', bn: 'স্টাফ/বিক্রেতা লগইন' },
  become_an_affiliate: { en: 'Become an Affiliate', bn: 'অ্যাফিলিয়েট হন' },
  become_a_moderator: { en: 'Become a Moderator', bn: 'মডারেটর হন' },

  // Login Page
  login_welcome: { en: 'Welcome Back!', bn: 'স্বাগতম!' },
  login_desc: { en: 'Enter your credentials to access your account.', bn: 'আপনার অ্যাকাউন্টে প্রবেশ করতে লগইন করুন।' },
  email: { en: 'Email', bn: 'ইমেইল' },
  password: { en: 'Password', bn: 'পাসওয়ার্ড' },
  phone_number: { en: 'Phone', bn: 'ফোন' },
  login_with_phone: { en: 'Login with Phone', bn: 'ফোন দিয়ে লগইন করুন' },
  remember_me: { en: 'Remember me', bn: 'মনে রাখুন' },
  forgot_password: { en: 'Forgot password?', bn: 'পাসওয়ার্ড ভুলে গেছেন?' },
  or_continue_with: { en: 'Or continue with', bn: 'অথবা এর মাধ্যমে' },
  login_with_google: { en: 'Login with Google', bn: 'Google দিয়ে লগইন করুন' },
  no_account: { en: "Don't have an account?", bn: 'অ্যাকাউন্ট নেই?' },
  student: { en: 'Student', bn: 'শিক্ষার্থী' },
  teacher: { en: 'Teacher', bn: 'শিক্ষক' },
  guardian: { en: 'Guardian', bn: 'অভিভাবক' },
  admin: { en: 'Admin', bn: 'অ্যাডমিন' },
  affiliate: { en: 'Affiliate', bn: 'অ্যাফিলিয়েট' },
  moderator: { en: 'Moderator', bn: 'মডারেটর' },
  seller: { en: 'Seller', bn: 'বিক্রেতা' },

  // Signup Page
  create_account: { en: 'Create an Account', bn: 'অ্যাকাউন্ট তৈরি করুন' },
  signup_desc: { en: 'Join our community and start your learning journey!', bn: 'আমাদের সম্প্রদায়ে যোগ দিন এবং আপনার শেখার যাত্রা শুরু করুন!' },
  want_to_be_teacher: { en: 'Want to be a Teacher?', bn: 'শিক্ষক হতে চান?' },
  apply_to_be_instructor: { en: 'Apply to become an instructor.', bn: 'প্রশিক্ষক হতে আবেদন করুন।' },
  click_here: { en: 'Click here!', bn: 'এখানে ক্লিক করুন!' },
  full_name: { en: 'Full Name', bn: 'পুরো নাম' },
  registering_as: { en: 'I am registering as a...', bn: 'আমি হিসেবে নিবন্ধন করছি...' },
  accept_terms: { en: 'Accept terms and conditions', bn: 'শর্তাবলী মেনে নিন' },
  you_agree_to: { en: 'You agree to our', bn: 'আপনি আমাদের' },
  and: { en: 'and', bn: 'এবং' },
  signup_with_google: { en: 'Sign up with Google', bn: 'Google দিয়ে সাইন আপ করুন' },
  already_have_account: { en: 'Already have an account?', bn: 'ইতিমধ্যে একটি অ্যাকাউন্ট আছে?' },
  
  // Teacher Signup
  teacher_signup_desc: { en: "Apply to become an instructor on our platform.", bn: "আমাদের প্ল্যাটফর্মে একজন প্রশিক্ষক হতে আবেদন করুন।" },
  confirm_password: { en: 'Confirm Password', bn: 'পাসওয়ার্ড নিশ্চিত করুন' },
  expertise_title: { en: 'Expertise / Title', bn: 'দক্ষতা / পদবি' },
  your_bio: { en: 'Your Bio', bn: 'আপনার বায়ো' },
  submit_application: { en: 'Submit Application', bn: 'আবেদন জমা দিন' },
  
  // Affiliate & Moderator Signup
  affiliate_signup_desc: { en: 'Apply to join our affiliate program and earn by promoting RDC.', bn: 'আমাদের অ্যাফিলিয়েট প্রোগ্রামে যোগ দিতে আবেদন করুন এবং RDC প্রচার করে উপার্জন করুন।' },
  moderator_signup_desc: { en: 'Apply to become a moderator and help maintain our community.', bn: 'মডারেটর হতে আবেদন করুন এবং আমাদের কমিউনিটি পরিচালনায় সহায়তা করুন।' },

  // Password Reset
  forgot_password_q: { en: 'Forgot Password?', bn: 'পাসওয়ার্ড ভুলে গেছেন?' },
  password_reset_desc: { en: "No worries, we'll send you reset instructions.", bn: 'চিন্তার কারণ নেই, আমরা আপনাকে রিসেট করার নির্দেশনা পাঠাবো।' },
  send_reset_link: { en: 'Send Reset Link', bn: 'রিসেট লিঙ্ক পাঠান' },
  back_to_login: { en: 'Back to Login', bn: 'লগইনে ফিরে যান' },
};
