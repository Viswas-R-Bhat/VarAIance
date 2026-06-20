// ============================================================================
// VarAInce — single source of content for the site.
// Real event data (winners, judges, dates) is kept verbatim so the site reads
// as a credible record of what the club has actually run.
// ============================================================================

export const nav = [
  ["About", "about"],
  ["Pillars", "pillars"],
  ["Events", "events"],
  ["Team", "team"],
  ["Contact", "contact"],
];

export const stats = [
  { value: 122, suffix: "+", label: "Builders hosted", hint: "across CodeForge" },
  { value: 37, suffix: "", label: "Teams shipped", hint: "teams of three" },
  { value: 15, prefix: "₹", suffix: "k", label: "Prize pool", hint: "CodeForge 2025" },
  { value: 2022, suffix: "", label: "Founded", hint: "with the department", plain: true },
];

export const pillars = [
  {
    icon: "BrainCircuit",
    title: "Applied Intelligence",
    body: "Workshops and labs that turn model theory into systems you can actually run — preprocessing, training, failure, and a shipped result.",
    tag: "Labs · Workshops",
  },
  {
    icon: "Cpu",
    title: "Build Culture",
    body: "Hackathons on compressed timelines with mentorship, live judging, and demos. The clock is the point — you ship something or you don't.",
    tag: "Hackathons",
  },
  {
    icon: "Users",
    title: "Student Network",
    body: "A connective layer across batches, roles, and campuses — so the next collaborator is one introduction away, not a semester away.",
    tag: "Community",
  },
];

export const timeline = [
  {
    year: "2022",
    title: "Department and club, together",
    body: "BMSCE opens its Artificial Intelligence & Data Science department. VarAInce forms alongside it as the department's student club — a place to apply what's taught in lecture before next semester's syllabus catches up.",
  },
  {
    year: "2025",
    title: "First flagship events",
    body: "CodeForge Hackathon and ML Arena run back-to-back on April 4 — a hackathon judged by industry leaders and a hands-on ML workshop co-run with the ISE Student Club.",
  },
  {
    year: "2026",
    title: "Going inter-college",
    body: "VarAInce conducts AI-VERSE, an inter-college fest for AI & ML innovation, with Dr. Indiramma M as guest of honour — the club's first event built for an audience beyond BMSCE.",
  },
];

export const events = [
  {
    type: "Hackathon",
    title: "CodeForge",
    date: "April 4, 2025",
    theme: "AI for Productivity",
    detail:
      "A single-day build sprint — 9 AM briefing, mentored build time, 4:30 PM submission, then live demos in front of an industry judging panel.",
    metrics: [
      ["122", "participants"],
      ["37", "teams of 3"],
      ["₹15,000", "prize pool"],
    ],
    winners: [
      ["1st", "Dyslexia Math Aide", "Pratyush Thakur · Aryan Raj · Harsh Kumar"],
      ["2nd", "Smart Inventory Management", "Rahul Hongekar · Bramha Bajannavar · Abhijna S"],
    ],
    footnote:
      "Judged by Prerit Chandra & Sushant V. Pai (Poorit Technologies) and Piyush Mohanty (Explicate Inc.).",
    icon: "Code2",
  },
  {
    type: "Workshop",
    title: "ML Arena",
    date: "April 4, 2025 · with ISE Student Club",
    theme: "Supervised → Unsupervised, hands-on",
    detail:
      "A 2-hour ML workshop followed by a 2-hour challenge: stock-price prediction on a real Kaggle dataset. Covered regression, classification, preprocessing, and a first look at neural networks.",
    metrics: [
      ["35", "participants"],
      ["4 hrs", "total format"],
      ["IoT Lab", "PJ Block, 6F"],
    ],
    winners: [],
    footnote: "Co-organised with the ISE Student Club.",
    icon: "FlaskConical",
  },
  {
    type: "Fest",
    title: "AI-VERSE",
    date: "2026 · Dayananda Sagar Academy of Technology",
    theme: "Inter-college AI & ML innovation",
    detail:
      "An inter-college tech fest for AI & ML innovation, creativity, and collaboration — bringing students from across Bengaluru's colleges onto one stage.",
    metrics: [
      ["Inter", "college scale"],
      ["2026", "edition"],
    ],
    winners: [],
    footnote: "Dr. Indiramma M, invited as guest of honour.",
    icon: "Network",
  },
];

// Placeholder roster — swap in real names, photos, and LinkedIn links before launch.
export const team = [
  { name: "Aditi Rao", role: "President", initials: "AR" },
  { name: "Karthik Iyer", role: "Vice President", initials: "KI" },
  { name: "Sneha Bhat", role: "Technical Lead", initials: "SB" },
  { name: "Rohan Mehta", role: "Design Lead", initials: "RM" },
  { name: "Ishita Sharma", role: "Events Lead", initials: "IS" },
  { name: "Varun Nair", role: "Social Media Lead", initials: "VN" },
];

export const marqueeItems = [
  "Machine Learning",
  "Hackathons",
  "Data Science",
  "Neural Networks",
  "Workshops",
  "AI for Productivity",
  "Inter-college Fests",
  "Model Building",
  "BMSCE",
];

export const campus = {
  handle: "@varaince_bmsce",
  instagram: "https://www.instagram.com/varaince_bmsce/",
  address:
    "B.M.S. College of Engineering, Bull Temple Road, Basavanagudi, Bengaluru – 560 019",
  mapEmbed:
    "https://maps.google.com/maps?q=BMS%20College%20of%20Engineering%2C%20Bull%20Temple%20Road%2C%20Basavanagudi%2C%20Bengaluru&t=&z=15&ie=UTF8&iwloc=&output=embed",
  mapLink:
    "https://www.google.com/maps/search/?api=1&query=BMS+College+of+Engineering+Bull+Temple+Road+Basavanagudi+Bengaluru",
};
