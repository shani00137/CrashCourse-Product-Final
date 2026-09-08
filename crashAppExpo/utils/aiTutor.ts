export interface AiDomain {
  label: string;
  suggestions: string[];
  topics: string[];
}

const baseTopics = [
  "anatomy",
  "physiology",
  "cardiac",
  "heart",
  "beta",
  "blocker",
  "appendicit",
  "appendix",
  "insulin",
  "glucose",
  "diabet",
  "layer",
  "wound",
  "infection",
  "anaphylaxis",
  "vital sign",
  "blood pressure",
  "hypertension",
  "medication",
  "drug",
  "dosage",
  "side effect",
  "antibiotic",
  "nursing",
  "patient",
  "nutrition",
  "cpr",
  "resuscitation",
  "first aid",
  "precautions",
  "fever",
  "pain",
  "meningitis",
  "kidney",
  "renal",
  "liver",
  "coagulation",
  "blood",
  "hormone",
  "thyroid",
];

export const genericDomain: AiDomain = {
  label: "Medicine & Healthcare",
  suggestions: [
    "What is the mechanism of beta-blockers?",
    "Explain the cardiac cycle",
    "Symptoms of appendicitis?",
    "How does insulin regulate glucose?",
    "Layers of the heart wall",
    "Type 1 vs Type 2 diabetes",
  ],
  topics: baseTopics,
};

const domains: (AiDomain & { match: RegExp })[] = [
  {
    label: "Nursing & Patient Care",
    match: /nurse|nursing|health assistant|dha|moh|\bcare\b/i,
    suggestions: [
      "What are the normal vital sign ranges?",
      "How does insulin regulate glucose?",
      "Stages of wound healing",
      "Standard precautions in infection control",
      "Beta-blockers: mechanism & nursing care",
      "Signs and management of anaphylaxis",
    ],
    topics: [
      ...baseTopics,
      "vital signs",
      "temperature",
      "pulse",
      "respiration",
      "saturation",
      "sponge bath",
      "bedridden",
      "pressure ulcer",
      "hygiene",
      "catheter",
      "iv",
      "injection",
      "electrolyte",
      "dehydration",
      "fluid balance",
    ],
  },
  {
    label: "Paramedic & Emergency Care",
    match: /paramedic|ambulance|emergency medicine|first aid|pre-hospital/i,
    suggestions: [
      "How is anaphylaxis managed?",
      "CPR steps and compression ratio",
      "Signs of hypovolaemic shock",
      "Burn severity assessment",
      "Airway management basics",
      "How to manage a seizure",
    ],
    topics: [
      ...baseTopics,
      "trauma",
      "shock",
      "cpr",
      "airway",
      "breathing",
      "burn",
      "fracture",
      "triage",
      "seizure",
      "stroke",
      "hypothermia",
      "bleeding",
      "haemorrhage",
      "poisoning",
      "overdose",
      "thorax",
      "pneumothorax",
    ],
  },
  {
    label: "Anatomy & Physiology",
    match: /anatomy|physiology|biology|\bhap\b|human body/i,
    suggestions: [
      "Layers of the heart wall",
      "Explain the cardiac cycle",
      "Bones of the axial skeleton",
      "Function of the nephron",
      "Cranial nerves and their function",
      "Salivary glands and digestion",
    ],
    topics: [
      ...baseTopics,
      "bone",
      "skeleton",
      "muscle",
      "nephron",
      "neuron",
      "nerve",
      "crania",
      "skull",
      "vertebra",
      "joint",
      "tissue",
      "epitheli",
      "cell",
      "organ",
      "respirator",
      "digest",
      "endocrine",
      "reproductive",
      "lymph",
    ],
  },
];

export function resolveDomain(courseName?: string): AiDomain {
  if (!courseName || !courseName.trim()) return genericDomain;
  const match = domains.find((d) => d.match.test(courseName));
  return match ?? genericDomain;
}

export function isRelevant(query: string, domain: AiDomain): boolean {
  const q = query.toLowerCase();
  return domain.topics.some((t) => q.includes(t));
}

export function outOfScopeMessage(courseName: string, domain: AiDomain): string {
  const examples = domain.suggestions.slice(0, 3).map((s) => `• ${s}`).join("\n");
  return [
    "**Course-only tutor**",
    "",
    `I can only answer **read-only queries** related to your selected course:`,
    `**${courseName}** (${domain.label}).`,
    "",
    "That question is outside the scope of your course, so I can't help with it.",
    "",
    "You can ask about topics like:",
    examples,
    "",
    "_No changes are made — questions and answers only._",
  ].join("\n");
}

export function inScopeDefault(domain: AiDomain): string {
  return [
    "That's a great question for your course! Here's what I can help with:",
    "",
    `• ${domain.suggestions[0] ?? ""}`,
    `• ${domain.suggestions[1] ?? ""}`,
    `• ${domain.suggestions[2] ?? ""}`,
    `• ${domain.suggestions[3] ?? ""}`,
    "",
    `Ask something related to **${domain.label.toLowerCase()}** and I'll give you a structured, exam-ready answer. 🩺`,
  ].join("\n");
}