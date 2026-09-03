import { Question } from "./data";

export interface AvailableTest {
  id: number;
  title: string;
  subject: string;
  questions: number;
  time: number;
  color: string;
  bg: string;
  icon: string;
  difficulty: string;
}

export const availableTests: AvailableTest[] = [
  { id: 1, title: "Pharmacology Essentials", subject: "Pharmacology", questions: 5, time: 10, color: "#166534", bg: "#F0F9F0", icon: "💊", difficulty: "Hard" },
  { id: 2, title: "Anatomy Quick Fire", subject: "Anatomy", questions: 5, time: 8, color: "#C41E3A", bg: "#FFF0F2", icon: "🫀", difficulty: "Medium" },
  { id: 3, title: "Clinical Diagnosis", subject: "Internal Medicine", questions: 5, time: 10, color: "#0891B2", bg: "#ECFEFF", icon: "🩺", difficulty: "Hard" },
  { id: 4, title: "Physiology Fundamentals", subject: "Physiology", questions: 5, time: 8, color: "#7C3AED", bg: "#F5F3FF", icon: "⚡", difficulty: "Medium" },
];

export const testQuestionBank: Question[] = [
  {
    question: "Which enzyme converts angiotensin I to angiotensin II?",
    options: ["Renin", "ACE (Angiotensin-Converting Enzyme)", "Aldosterone synthase", "Chymase"],
    correct: 1,
    explanation: "ACE (Angiotensin-Converting Enzyme) converts angiotensin I → angiotensin II in the pulmonary vasculature. ACE inhibitors (e.g., enalapril) block this step.",
  },
  {
    question: "What is the most common cause of community-acquired pneumonia (CAP) in adults?",
    options: ["Staphylococcus aureus", "Haemophilus influenzae", "Streptococcus pneumoniae", "Klebsiella pneumoniae"],
    correct: 2,
    explanation: "Streptococcus pneumoniae is the most common cause of CAP in adults, presenting with fever, productive cough, and lobar consolidation on CXR.",
  },
  {
    question: "Which nerve is damaged in 'Saturday night palsy' (wrist drop)?",
    options: ["Median nerve", "Ulnar nerve", "Radial nerve", "Musculocutaneous nerve"],
    correct: 2,
    explanation: "The Radial nerve is compressed in the spiral groove of the humerus causing wrist drop. Often seen after prolonged arm compression (e.g., sleeping on the arm).",
  },
  {
    question: "First-line treatment for anaphylaxis is:",
    options: ["IV hydrocortisone", "Oral antihistamine", "IM epinephrine 0.5mg 1:1000", "IV chlorphenamine"],
    correct: 2,
    explanation: "IM epinephrine (adrenaline) 0.5mg of 1:1000 into the anterolateral thigh is the FIRST-LINE treatment for anaphylaxis. Steroids and antihistamines are adjuncts only.",
  },
  {
    question: "Which cells produce glucagon in the pancreas?",
    options: ["Alpha (α) cells", "Beta (β) cells", "Delta (δ) cells", "PP cells"],
    correct: 0,
    explanation: "Alpha (α) cells of the islets of Langerhans secrete glucagon. Beta (β) cells produce insulin. Delta (δ) cells produce somatostatin.",
  },
  {
    question: "The Frank-Starling law of the heart states that:",
    options: [
      "Heart rate increases with increased venous return",
      "Stroke volume increases with increased preload (end-diastolic volume)",
      "Cardiac output decreases with increased afterload",
      "Contractility is inversely related to fiber length",
    ],
    correct: 1,
    explanation: "Frank-Starling: within physiological limits, the greater the end-diastolic volume (preload), the greater the stroke volume — the heart pumps what it receives.",
  },
  {
    question: "Which vitamin deficiency causes Wernicke's encephalopathy?",
    options: ["Vitamin B12", "Vitamin B1 (Thiamine)", "Vitamin B6", "Vitamin C"],
    correct: 1,
    explanation: "Thiamine (Vitamin B1) deficiency causes Wernicke's encephalopathy — triad of ophthalmoplegia, ataxia, and confusion. Common in alcoholics and malnourished patients.",
  },
  {
    question: "Trousseau's sign is associated with:",
    options: ["Hyperkalaemia", "Hypocalcaemia", "Hyponatraemia", "Hypermagnesaemia"],
    correct: 1,
    explanation: "Trousseau's sign (carpal spasm on BP cuff inflation) indicates hypocalcaemia. Also associated: Chvostek's sign (facial muscle twitch on tapping the facial nerve).",
  },
];
