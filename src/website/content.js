import { BRAND_AI_NAME, BRAND_MAIL_NAME, BRAND_NAME, BRAND_TAGLINE } from '@/config/brand'

/** Marketing copy — ScholaOne LMS landing page */
export const WEBSITE = {
  name: BRAND_NAME,
  tagline: BRAND_TAGLINE,
  description:
    'Deliver world-class learning at scale — courses, classrooms, assessments, progress tracking, and institutional admin in one breathtaking LMS built for schools and universities.',
  subdescription:
    'Empower learners, educators, and administrators with a single platform designed for clarity, connection, and growth.',
}


export const HERO_POINTS = [
  'Course builder with modules, lessons & multimedia',
  'Live classes, assignments & auto-graded assessments',
  'Learner progress, certificates & AI study assistant',
]

export const TRUST_ITEMS = [
  'Course Catalog',
  'Live Classes',
  'Assignments',
  'Quizzes & Exams',
  'Gradebook',
  'Certificates',
  'Learner Analytics',
  'AI Tutor',
  'Parent Portal',
  'Admin Dashboard',
  'Multi-School LMS',
  BRAND_MAIL_NAME,
]

export const AUDIENCES = [
  {
    title: 'Learners',
    subtitle: 'Students & professionals',
    description: 'Personalized learning paths, progress dashboards, certificates, and an AI tutor available whenever you need help.',
    icon: 'learner',
    gradient: 'from-[#3b82f6] to-[#2563eb]',
  },
  {
    title: 'Educators',
    subtitle: 'Teachers & instructors',
    description: 'Build rich courses, schedule live sessions, grade assignments, and track class performance in real time.',
    icon: 'educator',
    gradient: 'from-[#4c6fff] to-[#6366f1]',
  },
  {
    title: 'Administrators',
    subtitle: 'Schools & organizations',
    description: 'Multi-tenant control, roles, audit trails, master data, and network-wide analytics from one command center.',
    icon: 'admin',
    gradient: 'from-[#00c2ff] to-[#3b82f6]',
  },
]

export const FEATURES = [
  {
    title: 'Course Studio',
    description:
      'Design stunning courses with modules, video lessons, documents, and drip schedules. Drag-and-drop structure with preview before publish.',
    icon: 'courses',
    span: 'large',
    highlight: 'Content authoring',
  },
  {
    title: 'Live Virtual Classroom',
    description: 'Host live lectures with attendance, chat, and recordings linked back to the course timeline.',
    icon: 'classroom',
    span: 'normal',
    highlight: 'Real-time learning',
  },
  {
    title: 'Assessments & Gradebook',
    description: 'Quizzes, assignments, rubrics, and a unified gradebook — auto-graded where possible, manual where it matters.',
    icon: 'assessment',
    span: 'normal',
    highlight: 'Measure mastery',
  },
  {
    title: 'Learner Progress Hub',
    description: 'Completion rates, streaks, time-on-task, and cohort analytics so no learner falls behind unnoticed.',
    icon: 'progress',
    span: 'normal',
    highlight: 'Data-driven insight',
  },
  {
    title: 'Certificates & Credentials',
    description: 'Issue branded certificates on completion with verification links — motivate learners and prove outcomes.',
    icon: 'certificate',
    span: 'normal',
    highlight: 'Recognize achievement',
  },
  {
    title: 'AI Learning Assistant',
    description: `${BRAND_AI_NAME} answers questions, summarizes lessons, suggests study plans, and powers workflow automations.`,
    icon: 'ai',
    span: 'large',
    highlight: 'Intelligent support',
  },
]

export const STEPS = [
  {
    step: '01',
    title: 'Launch your learning portal',
    description: 'Sign in and set up your organization, schools, and academic structure — boards, classes, and sections in minutes.',
  },
  {
    step: '02',
    title: 'Publish courses & content',
    description: 'Use Course Studio to build curricula, upload materials, and schedule live classes for each cohort.',
  },
  {
    step: '03',
    title: 'Enroll learners & educators',
    description: 'Invite students and teachers, assign roles, and map permissions so everyone sees exactly what they need.',
  },
  {
    step: '04',
    title: 'Track, certify & scale',
    description: 'Monitor progress, run assessments, issue certificates, and use AI insights to improve outcomes network-wide.',
  },
]

export const MODULES = [
  'Course Catalog',
  'Course Studio',
  'Live Classes',
  'Assignments',
  'Quizzes & Exams',
  'Gradebook',
  'Learner Dashboard',
  'Certificates',
  'Progress Analytics',
  'AI Tutor',
  'Organizations',
  'Schools',
  'Users & Roles',
  'Masters Hub',
  'Audit Logs',
  BRAND_MAIL_NAME,
  'Settings',
]

export const ROLE_GUIDE = [
  {
    role: 'Learner',
    access: 'Access enrolled courses, submit assignments, join live classes, track progress, and earn certificates.',
    color: 'from-[#3b82f6] to-[#2563eb]',
  },
  {
    role: 'Educator',
    access: 'Create and manage courses, grade work, host sessions, and view class-level analytics.',
    color: 'from-[#4c6fff] to-[#6366f1]',
  },
  {
    role: 'Administrator',
    access: 'Full LMS and ERP control — tenants, schools, users, masters, compliance, and network dashboards.',
    color: 'from-[#00c2ff] to-[#3b82f6]',
  },
]

export const TESTIMONIALS = [
  {
    quote: 'Our learners finally have an LMS that feels modern and intuitive — not a clunky portal from a decade ago. Completion rates jumped within the first term.',
    author: 'Dr. Meera Kapoor',
    role: 'Academic Director',
  },
  {
    quote: 'Course creation, live classes, and grading in one place saved our faculty hours every week. The AI assistant is a game-changer for student support.',
    author: 'James Okonkwo',
    role: 'Head of Digital Learning',
  },
]

export const SAMPLE_COURSES = [
  { title: 'Advanced Mathematics', progress: 78, students: 142, color: 'from-[#3b82f6] to-[#2563eb]' },
  { title: 'English Literature', progress: 92, students: 98, color: 'from-[#4c6fff] to-[#6366f1]' },
  { title: 'Computer Science 101', progress: 65, students: 210, color: 'from-[#00c2ff] to-[#3b82f6]' },
  { title: 'Physics — Grade 12', progress: 54, students: 87, color: 'from-[#60a5fa] to-[#2563eb]' },
]
