export interface Course {
  id: number;
  title: string;
  subtitle: string;
  color: string;
  bg: string;
  icon: string;
  progress: number;
  lessons: number;
  duration: string;
  students: string;
  difficulty: string;
  category: string;
}

export const allCourses: Course[] = [
  { id: 1, title: "Anatomy", subtitle: "Human Body Systems & Structures", color: "#C41E3A", bg: "#FFF0F2", icon: "🫀", progress: 72, lessons: 32, duration: "16h", students: "8.4k", difficulty: "Medium", category: "Basic Science" },
  { id: 2, title: "Pharmacology", subtitle: "Drugs, Mechanisms & Therapeutics", color: "#166534", bg: "#F0F9F0", icon: "💊", progress: 45, lessons: 28, duration: "14h", students: "7.1k", difficulty: "Hard", category: "Clinical" },
  { id: 3, title: "Pathology", subtitle: "Disease Mechanisms & Histology", color: "#0891B2", bg: "#ECFEFF", icon: "🔬", progress: 30, lessons: 24, duration: "12h", students: "6.3k", difficulty: "Hard", category: "Basic Science" },
  { id: 4, title: "Physiology", subtitle: "Body Functions & Homeostasis", color: "#7C3AED", bg: "#F5F3FF", icon: "⚡", progress: 60, lessons: 26, duration: "13h", students: "9.2k", difficulty: "Medium", category: "Basic Science" },
  { id: 5, title: "Microbiology", subtitle: "Bacteria, Viruses & Fungi", color: "#059669", bg: "#ECFDF5", icon: "🦠", progress: 20, lessons: 20, duration: "10h", students: "5.7k", difficulty: "Hard", category: "Basic Science" },
  { id: 6, title: "Biochemistry", subtitle: "Metabolism & Molecular Biology", color: "#B45309", bg: "#FFFBEB", icon: "🧬", progress: 55, lessons: 22, duration: "11h", students: "6.9k", difficulty: "Hard", category: "Basic Science" },
  { id: 7, title: "Internal Medicine", subtitle: "Diagnosis & Clinical Management", color: "#C41E3A", bg: "#FFF0F2", icon: "🩺", progress: 38, lessons: 36, duration: "20h", students: "12.1k", difficulty: "Hard", category: "Clinical" },
  { id: 8, title: "Surgery", subtitle: "Surgical Principles & Procedures", color: "#166534", bg: "#F0F9F0", icon: "🔪", progress: 15, lessons: 30, duration: "18h", students: "5.4k", difficulty: "Hard", category: "Clinical" },
  { id: 9, title: "Pediatrics", subtitle: "Child Health & Development", color: "#F59E0B", bg: "#FFFBEB", icon: "👶", progress: 42, lessons: 24, duration: "12h", students: "7.8k", difficulty: "Medium", category: "Clinical" },
  { id: 10, title: "Medical Ethics", subtitle: "Ethics, Law & Professionalism", color: "#6B7280", bg: "#F9FAFB", icon: "⚖️", progress: 80, lessons: 12, duration: "6h", students: "4.2k", difficulty: "Easy", category: "Professional" },
];

export const categories = ["All", "Basic Science", "Clinical", "Professional"];

export interface Question {
  question: string;
  options: string[];
  correct: number;
  explanation: string;
}

export const medicalQuestions: Question[] = [
  {
    question: "Which enzyme converts Angiotensin I to Angiotensin II?",
    options: ["Renin", "ACE (Angiotensin-Converting Enzyme)", "Aldosterone synthase", "Chymase"],
    correct: 1,
    explanation: "ACE (Angiotensin-Converting Enzyme) in the pulmonary vasculature converts Angiotensin I → Angiotensin II. ACE inhibitors (e.g., enalapril, ramipril) block this step and are first-line for hypertension and heart failure.",
  },
  {
    question: "Most common cause of community-acquired pneumonia (CAP) in adults?",
    options: ["Staphylococcus aureus", "Haemophilus influenzae", "Streptococcus pneumoniae", "Klebsiella pneumoniae"],
    correct: 2,
    explanation: "Streptococcus pneumoniae (pneumococcus) is the most common cause of CAP. Presents with sudden fever, productive rust-coloured sputum, pleuritic chest pain, and lobar consolidation on CXR.",
  },
  {
    question: "Which cranial nerve carries the afferent limb of the pupillary light reflex?",
    options: ["CN III (Oculomotor)", "CN II (Optic)", "CN V (Trigeminal)", "CN VII (Facial)"],
    correct: 1,
    explanation: "CN II (Optic nerve) carries the afferent signal from the retina to the pretectal nucleus. The efferent limb uses CN III to constrict the sphincter pupillae — explaining why CN III palsy causes a dilated, fixed pupil.",
  },
  {
    question: "First-line treatment for anaphylaxis is:",
    options: ["IV hydrocortisone 100 mg", "Oral cetirizine 10 mg", "IM epinephrine 0.5 mg 1:1000", "IV chlorphenamine 10 mg"],
    correct: 2,
    explanation: "IM epinephrine (adrenaline) 0.5 mg of 1:1000 into the anterolateral thigh is the FIRST and most critical treatment for anaphylaxis. IV antihistamines and steroids are adjuncts only — never give them first.",
  },
  {
    question: "Which pancreatic cells produce glucagon?",
    options: ["Alpha (α) cells", "Beta (β) cells", "Delta (δ) cells", "PP cells"],
    correct: 0,
    explanation: "Alpha (α) cells secrete glucagon (raises blood glucose). Beta (β) cells secrete insulin (lowers blood glucose). Delta (δ) cells secrete somatostatin (inhibits both). PP cells secrete pancreatic polypeptide.",
  },
];
