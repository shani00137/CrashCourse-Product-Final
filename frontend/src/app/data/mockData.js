export const applicants = [
  { id: "MDS-2024-0123", name: "Zara Ahmed", avatar: "ZA", mobile: "+971 50 234 5678", country: "UAE", course: "Medical Dental Science", status: "Active", address: "Dubai, UAE" },
  { id: "MDS-2024-0124", name: "Khalid Al-Rashid", avatar: "KR", mobile: "+971 55 876 5432", country: "Saudi Arabia", course: "Healthcare Management", status: "Pending", address: "Abu Dhabi, UAE" },
  { id: "MDS-2024-0125", name: "Priya Nair", avatar: "PN", mobile: "+971 52 345 6789", country: "India", course: "Nursing Administration", status: "Active", address: "Sharjah, UAE" },
  { id: "MDS-2024-0126", name: "Omar Hassan", avatar: "OH", mobile: "+971 54 987 6543", country: "Egypt", course: "Medical Dental Science", status: "Expired", address: "Ajman, UAE" },
  { id: "MDS-2024-0127", name: "Sofia Martinez", avatar: "SM", mobile: "+971 56 123 4567", country: "Philippines", course: "Healthcare Management", status: "Active", address: "Dubai, UAE" },
  { id: "MDS-2024-0128", name: "Ahmed Al-Farsi", avatar: "AF", mobile: "+971 50 654 3210", country: "Oman", course: "Nursing Administration", status: "Pending", address: "Ras Al Khaimah, UAE" },
  { id: "MDS-2024-0129", name: "Lin Wei", avatar: "LW", mobile: "+971 52 789 0123", country: "China", course: "Medical Dental Science", status: "Active", address: "Dubai, UAE" },
  { id: "MDS-2024-0130", name: "Fatima Malik", avatar: "FM", mobile: "+971 55 321 0987", country: "Pakistan", course: "Healthcare Management", status: "Pending", address: "Fujairah, UAE" },
];

export const monthlyData = [
  { month: "Jan", registrations: 42, revenue: 84000 },
  { month: "Feb", registrations: 58, revenue: 116000 },
  { month: "Mar", registrations: 73, revenue: 146000 },
  { month: "Apr", registrations: 61, revenue: 122000 },
  { month: "May", registrations: 89, revenue: 178000 },
  { month: "Jun", registrations: 95, revenue: 190000 },
  { month: "Jul", registrations: 112, revenue: 224000 },
  { month: "Aug", registrations: 87, revenue: 174000 },
];

export const questions = [
  {
    id: 1,
    course: "MDS-101",
    exercise: "Module 3",
    question: "Which of the following is the primary function of the mitral valve in the human heart?",
    options: [
      "Controls blood flow between right atrium and right ventricle",
      "Controls blood flow between left atrium and left ventricle",
      "Controls blood flow between left ventricle and aorta",
      "Controls blood flow between right ventricle and pulmonary artery",
    ],
    correct: 1,
  },
  {
    id: 2,
    course: "HCM-201",
    exercise: "Module 1",
    question: "According to the DHA healthcare regulations, what is the minimum required continuing medical education (CME) hours per year?",
    options: ["10 hours", "20 hours", "30 hours", "50 hours"],
    correct: 2,
  },
  {
    id: 3,
    course: "MDS-101",
    exercise: "Module 5",
    question: "The DHCC licensing framework requires which of the following documents for initial registration?",
    options: [
      "Only passport and degree certificate",
      "Passport, degree, good standing letter, and experience certificate",
      "Passport and good standing letter only",
      "Degree certificate and experience letter only",
    ],
    correct: 1,
  },
];

export const testRecords = [
  { applicant: "Zara Ahmed", course: "MDS-101", date: "2024-10-15", questions: 40, result: 87.5, status: "Passed" },
  { applicant: "Khalid Al-Rashid", course: "HCM-201", date: "2024-10-12", questions: 35, result: 62.8, status: "Failed" },
  { applicant: "Priya Nair", course: "NRS-301", date: "2024-10-18", questions: 40, result: 92.5, status: "Passed" },
  { applicant: "Omar Hassan", course: "MDS-101", date: "2024-10-10", questions: 40, result: null, status: "Pending" },
  { applicant: "Sofia Martinez", course: "HCM-201", date: "2024-10-20", questions: 35, result: 78.3, status: "Passed" },
];

export const invoices = [
  { no: "INV-2024-0089", date: "2024-10-01", service: "Registration Fee", amount: 1500, paid: 1500, balance: 0, currency: "AED", status: "Paid" },
  { no: "INV-2024-0090", date: "2024-10-05", service: "Exam Fee - MDS-101", amount: 800, paid: 0, balance: 800, currency: "AED", status: "Unpaid" },
  { no: "INV-2024-0091", date: "2024-10-12", service: "Document Verification", amount: 350, paid: 350, balance: 0, currency: "AED", status: "Paid" },
  { no: "INV-2024-0092", date: "2024-10-20", service: "Certificate Issuance", amount: 250, paid: 125, balance: 125, currency: "AED", status: "Partial" },
];

export const mobileUsers = [
  { user: "Zara Ahmed", id: "APP-001", device: "iPhone 14 Pro", status: "Active", lastLogin: "2024-10-21 09:14" },
  { user: "Khalid Al-Rashid", id: "APP-002", device: "Samsung Galaxy S23", status: "Active", lastLogin: "2024-10-20 17:32" },
  { user: "Priya Nair", id: "APP-003", device: "iPhone 13", status: "Inactive", lastLogin: "2024-09-15 11:05" },
  { user: "Omar Hassan", id: "APP-004", device: "OnePlus 11", status: "Blocked", lastLogin: "2024-08-30 08:44" },
];

export const userAccounts = [
  { no: "USR-001", role: "Super Admin", username: "admin.system", email: "admin@dhcc.ae", created: "2024-01-01", menu: "Full Access", status: "Active" },
  { no: "USR-002", role: "Admin Staff", username: "sarah.johnson", email: "sarah.j@dhcc.ae", created: "2024-03-15", menu: "Applicants, Courses", status: "Active" },
  { no: "USR-003", role: "Exam Manager", username: "exam.manager", email: "exams@dhcc.ae", created: "2024-04-20", menu: "Exams, Questions", status: "Active" },
  { no: "USR-004", role: "Finance", username: "finance.ops", email: "finance@dhcc.ae", created: "2024-05-10", menu: "Invoices, Reports", status: "Inactive" },
];

export const screenshots = [
  { user: "Zara Ahmed", timestamp: "2024-10-21 09:42:15", id: 1 },
  { user: "Khalid Al-Rashid", timestamp: "2024-10-20 14:18:33", id: 2 },
  { user: "Priya Nair", timestamp: "2024-10-20 11:05:47", id: 3 },
  { user: "Sofia Martinez", timestamp: "2024-10-19 16:33:22", id: 4 },
  { user: "Ahmed Al-Farsi", timestamp: "2024-10-18 10:12:08", id: 5 },
  { user: "Lin Wei", timestamp: "2024-10-17 15:45:55", id: 6 },
];

export const backups = [
  { file: "backup_2024_10_21_0300.sql.gz", created: "2024-10-21 03:00", size: "142 MB" },
  { file: "backup_2024_10_20_0300.sql.gz", created: "2024-10-20 03:00", size: "139 MB" },
  { file: "backup_2024_10_19_0300.sql.gz", created: "2024-10-19 03:00", size: "137 MB" },
  { file: "backup_2024_10_18_0300.sql.gz", created: "2024-10-18 03:00", size: "135 MB" },
];
