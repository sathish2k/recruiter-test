import { closeDb, connectDb } from "../src/db";
import { CandidateModel } from "../src/models/candidate.model";
import { ClientModel } from "../src/models/client.model";
import { EmailTemplateModel } from "../src/models/email-template.model";
import { InterviewModel } from "../src/models/interview.model";
import { JobModel } from "../src/models/job.model";
import { RolePermissionModel } from "../src/models/role-permission.model";
import { UserModel } from "../src/models/user.model";
import {
  DEFAULT_TEMPLATES,
  seedAgencyTemplates,
} from "../src/services/email-template.service";
import { seedAgencyPermissions } from "../src/services/permission.service";

const DEMO_PASSWORD = "Passw0rd123";

// Every seeded teammate shares DEMO_PASSWORD so any role can be logged into for
// testing role-scoped screens. `riya@demo.dev` is the admin ("you").
const team = [
  {
    name: "Riya Kapoor",
    email: "riya@demo.dev",
    role: "admin",
    status: "active",
  },
  { name: "Ana Novak", email: "ana@demo.dev", role: "lead", status: "active" },
  {
    name: "Marcus Reid",
    email: "marcus@demo.dev",
    role: "lead",
    status: "active",
  },
  {
    name: "Dev Shah",
    email: "dev@demo.dev",
    role: "employee",
    status: "active",
  },
  {
    name: "Mira Joshi",
    email: "mira@demo.dev",
    role: "employee",
    status: "active",
  },
  {
    name: "Leo Franco",
    email: "leo@demo.dev",
    role: "employee",
    status: "active",
  },
  {
    name: "Nora Bright",
    email: "nora@demo.dev",
    role: "client",
    status: "active",
  },
  {
    name: "sofia.pending",
    email: "sofia@demo.dev",
    role: "employee",
    status: "invited",
  },
] as const;

const AGENCY = "demo";

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];
const ymd = (d: Date) =>
  d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate();
const dayLabel = (d: Date) => `${MONTHS[d.getMonth()]} ${d.getDate()}`;
const daysAgo = (n: number) => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
};
const fromYmd = (ts: number) =>
  new Date(
    Math.floor(ts / 10000),
    Math.floor((ts % 10000) / 100) - 1,
    ts % 100,
  );
const addDays = (ts: number, n: number) => {
  const d = fromYmd(ts);
  d.setDate(d.getDate() + n);
  return d;
};
const addMonths = (ts: number, n: number) => {
  const d = fromYmd(ts);
  d.setMonth(d.getMonth() + n);
  return d;
};

const DEFAULT_SKILLS = [
  "Go",
  "PostgreSQL",
  "Kubernetes",
  "gRPC",
  "AWS",
  "System design",
];
const SKILLS_BY_CAT: Record<string, string[]> = {
  Engineering: [
    "Go",
    "PostgreSQL",
    "Kubernetes",
    "gRPC",
    "AWS",
    "System design",
  ],
  Design: [
    "Figma",
    "Design systems",
    "Prototyping",
    "User research",
    "Accessibility",
  ],
  Data: ["Python", "SQL", "dbt", "Airflow", "ML fundamentals"],
  Product: [
    "Roadmapping",
    "Discovery",
    "SQL",
    "A/B testing",
    "Stakeholder management",
  ],
};
const COMPANIES = [
  "Klerno",
  "Paylane",
  "Nuvia",
  "Bristow",
  "Quanta",
  "Helix Labs",
];
const UNIVERSITIES = [
  "University of Washington",
  "UC Berkeley",
  "Georgia Tech",
  "University of Toronto",
  "TU Munich",
];
const LOCATIONS = [
  "Seattle, WA",
  "Austin, TX",
  "New York, NY",
  "Denver, CO",
  "Lisbon, PT",
];
const SALARY_BY_LEVEL: Record<string, [string, string]> = {
  Junior: ["70,000", "90,000"],
  Mid: ["100,000", "130,000"],
  Senior: ["150,000", "180,000"],
  Staff: ["190,000", "230,000"],
};

const clients = [
  {
    name: "Nortech",
    industry: "Enterprise SaaS",
    manager: "Riya Kapoor",
    status: "hiring",
    openRoles: 8,
    hires: 6,
    sourced: 296,
    screened: 98,
    interviewing: 18,
    activity: "Last activity 2h ago",
  },
  {
    name: "Fablio",
    industry: "Consumer Fintech",
    manager: "Riya Kapoor",
    status: "hiring",
    openRoles: 6,
    hires: 4,
    sourced: 224,
    screened: 80,
    interviewing: 14,
    activity: "Last activity 4h ago",
  },
  {
    name: "Vantor",
    industry: "AI / ML Platform",
    manager: "Dev Shah",
    status: "hiring",
    openRoles: 5,
    hires: 3,
    sourced: 198,
    screened: 76,
    interviewing: 12,
    activity: "Last activity 1d ago",
  },
  {
    name: "Corely",
    industry: "HR Tech",
    manager: "Dev Shah",
    status: "hiring",
    openRoles: 3,
    hires: 2,
    sourced: 104,
    screened: 38,
    interviewing: 6,
    activity: "Last activity 1d ago",
  },
  {
    name: "Mistvale",
    industry: "Healthcare",
    manager: "Riya Kapoor",
    status: "paused",
    openRoles: 2,
    hires: 2,
    sourced: 62,
    screened: 19,
    interviewing: 3,
    activity: "Last activity 6d ago",
  },
  {
    name: "Orbex",
    industry: "Logistics",
    manager: "Dev Shah",
    status: "paused",
    openRoles: 0,
    hires: 1,
    sourced: 28,
    screened: 7,
    interviewing: 1,
    activity: "Last activity 2w ago",
  },
] as const;

const jobs = [
  {
    title: "Senior Backend Engineer",
    roleCat: "Engineering",
    level: "Senior",
    openings: 2,
    client: "Nortech",
    clientInitial: "N",
    logoBg: "#3A4A5B",
    logoFg: "#CFE3F5",
    location: "Remote",
    empType: "Full-time",
    pipeline: 412,
    matched: 38,
    posted: "Jun 12",
    postedTs: 20260612,
    status: "Active",
  },
  {
    title: "Product Designer",
    roleCat: "Design",
    level: "Mid",
    openings: 1,
    client: "Fablio",
    clientInitial: "F",
    logoBg: "#4A3A5B",
    logoFg: "#E3CFF5",
    location: "NYC",
    empType: "Full-time",
    pipeline: 318,
    matched: 26,
    posted: "Jun 15",
    postedTs: 20260615,
    status: "Active",
  },
  {
    title: "Data Scientist",
    roleCat: "Data",
    level: "Senior",
    openings: 1,
    client: "Vantor",
    clientInitial: "V",
    logoBg: "#3A5B4A",
    logoFg: "#CFF5E0",
    location: "Remote",
    empType: "Full-time",
    pipeline: 286,
    matched: 31,
    posted: "Jun 18",
    postedTs: 20260618,
    status: "Active",
  },
  {
    title: "ML Engineer",
    roleCat: "Engineering",
    level: "Staff",
    openings: 2,
    client: "Vantor",
    clientInitial: "V",
    logoBg: "#3A5B4A",
    logoFg: "#CFF5E0",
    location: "SF",
    empType: "Full-time",
    pipeline: 204,
    matched: 22,
    posted: "Jun 20",
    postedTs: 20260620,
    status: "Active",
  },
  {
    title: "Frontend Engineer",
    roleCat: "Engineering",
    level: "Mid",
    openings: 1,
    client: "Fablio",
    clientInitial: "F",
    logoBg: "#4A3A5B",
    logoFg: "#E3CFF5",
    location: "Remote",
    empType: "Contract",
    pipeline: 176,
    matched: 19,
    posted: "Jun 24",
    postedTs: 20260624,
    status: "Active",
  },
  {
    title: "Product Manager",
    roleCat: "Product",
    level: "Senior",
    openings: 1,
    client: "Corely",
    clientInitial: "C",
    logoBg: "#5B3A3A",
    logoFg: "#F5CFCF",
    location: "Austin",
    empType: "Full-time",
    pipeline: 92,
    matched: 11,
    posted: "Jul 1",
    postedTs: 20260701,
    status: "Active",
  },
  {
    title: "DevOps Engineer",
    roleCat: "Engineering",
    level: "Senior",
    openings: 1,
    client: "Nortech",
    clientInitial: "N",
    logoBg: "#3A4A5B",
    logoFg: "#CFE3F5",
    location: "Remote",
    empType: "Full-time",
    pipeline: 0,
    matched: 0,
    posted: "—",
    postedTs: 0,
    status: "Draft",
  },
  {
    title: "QA Engineer",
    roleCat: "Engineering",
    level: "Junior",
    openings: 1,
    client: "Mistvale",
    clientInitial: "M",
    logoBg: "#5B4A3A",
    logoFg: "#FFD9BC",
    location: "Boston",
    empType: "Part-time",
    pipeline: 148,
    matched: 14,
    posted: "May 2",
    postedTs: 20260502,
    status: "Closed",
  },
] as const;

const candidates = [
  {
    initials: "SN",
    name: "Savannah Nguyen",
    email: "savannah.n@gmail.com",
    avatarBg: "#4A3A5B",
    avatarFg: "#E3CFF5",
    role: "Senior Backend Engineer",
    roleCat: "Engineering",
    client: "Nortech",
    match: 94,
    exp: 9,
    applied: "Jun 14",
    appliedTs: 20260614,
    stage: "Interviewing",
    source: "LinkedIn",
  },
  {
    initials: "NH",
    name: "Noor Haddad",
    email: "noor.haddad@pm.me",
    avatarBg: "#3A5B4A",
    avatarFg: "#CFF5E0",
    role: "Senior Backend Engineer",
    roleCat: "Engineering",
    client: "Nortech",
    match: 89,
    exp: 7,
    applied: "Jun 18",
    appliedTs: 20260618,
    stage: "Shortlisted",
    source: "Referral",
  },
  {
    initials: "JL",
    name: "Jordan Lee",
    email: "jordan.lee@outlook.com",
    avatarBg: "#3A4A5B",
    avatarFg: "#CFE3F5",
    role: "Product Designer",
    roleCat: "Design",
    client: "Fablio",
    match: 88,
    exp: 5,
    applied: "Jun 20",
    appliedTs: 20260620,
    stage: "Screened",
    source: "Indeed",
  },
  {
    initials: "AK",
    name: "Alexis Kim",
    email: "alexis.kim@gmail.com",
    avatarBg: "#5B3A3A",
    avatarFg: "#F5CFCF",
    role: "Data Scientist",
    roleCat: "Data",
    client: "Vantor",
    match: 91,
    exp: 6,
    applied: "Jun 21",
    appliedTs: 20260621,
    stage: "Offer",
    source: "LinkedIn",
  },
  {
    initials: "PR",
    name: "Priya Raman",
    email: "priya.r@proton.me",
    avatarBg: "#3A5B4A",
    avatarFg: "#CFF5E0",
    role: "Frontend Engineer",
    roleCat: "Engineering",
    client: "Fablio",
    match: 87,
    exp: 6,
    applied: "Jun 24",
    appliedTs: 20260624,
    stage: "Interviewing",
    source: "Careers page",
  },
  {
    initials: "IP",
    name: "Ivan Petrov",
    email: "ivan.petrov@gmail.com",
    avatarBg: "#5B4A3A",
    avatarFg: "#FFD9BC",
    role: "Senior Backend Engineer",
    roleCat: "Engineering",
    client: "Nortech",
    match: 84,
    exp: 8,
    applied: "Jun 25",
    appliedTs: 20260625,
    stage: "Screened",
    source: "LinkedIn",
  },
  {
    initials: "EK",
    name: "Elif Kaya",
    email: "elif.kaya@gmail.com",
    avatarBg: "#4A5B3A",
    avatarFg: "#E0F5CF",
    role: "ML Engineer",
    roleCat: "Engineering",
    client: "Vantor",
    match: 81,
    exp: 4,
    applied: "Jun 28",
    appliedTs: 20260628,
    stage: "Screened",
    source: "Referral",
  },
  {
    initials: "TV",
    name: "Tomas Vieira",
    email: "tomas.v@gmail.com",
    avatarBg: "#3A5B4A",
    avatarFg: "#CFF5E0",
    role: "ML Engineer",
    roleCat: "Engineering",
    client: "Vantor",
    match: 90,
    exp: 7,
    applied: "Jul 1",
    appliedTs: 20260701,
    stage: "Interviewing",
    source: "LinkedIn",
  },
  {
    initials: "DW",
    name: "Dana Whitfield",
    email: "dana.w@outlook.com",
    avatarBg: "#4A3A5B",
    avatarFg: "#E3CFF5",
    role: "Product Manager",
    roleCat: "Product",
    client: "Corely",
    match: 78,
    exp: 5,
    applied: "Jul 2",
    appliedTs: 20260702,
    stage: "Sourced",
    source: "Indeed",
  },
  {
    initials: "MO",
    name: "Marcus Odum",
    email: "marcus.odum@gmail.com",
    avatarBg: "#5B4A3A",
    avatarFg: "#FFD9BC",
    role: "DevOps Engineer",
    roleCat: "Engineering",
    client: "Nortech",
    match: 62,
    exp: 3,
    applied: "Jul 3",
    appliedTs: 20260703,
    stage: "Rejected",
    source: "Careers page",
  },
] as const;

type SeedCandidate = (typeof candidates)[number];
type SeedJob = (typeof jobs)[number];

function enrichCandidate(c: SeedCandidate, i: number) {
  const appliedDate = daysAgo(i * 8 + 2);
  const appliedTs = ymd(appliedDate);
  const applied = dayLabel(appliedDate);
  const skills = SKILLS_BY_CAT[c.roleCat] ?? DEFAULT_SKILLS;
  const handle = c.name.toLowerCase().replace(/\s+/g, "");
  const first = c.name.split(" ")[0];
  const company = COMPANIES[i % COMPANIES.length];
  const prior = COMPANIES[(i + 2) % COMPANIES.length];
  const early = COMPANIES[(i + 4) % COMPANIES.length];
  return {
    ...c,
    applied,
    appliedTs,
    phone: `+1 (206) 555-0${(140 + i * 7).toString().padStart(3, "0")}`,
    location: LOCATIONS[i % LOCATIONS.length],
    linkedin: `linkedin.com/in/${handle}`,
    skills,
    notes: "",
    experience: [
      {
        title: c.role,
        company,
        period: "2021 – Present",
        blurb: `Leads ${skills[0]} work on ${company}'s core product; scaled the team's delivery through sustained growth.`,
      },
      {
        title: `Senior ${c.roleCat} Specialist`,
        company: prior,
        period: "2017 – 2021",
        blurb: `Built and operated ${skills[1]} systems end to end; on-call lead for critical services.`,
      },
      {
        title: `${c.roleCat} Associate`,
        company: early,
        period: "2015 – 2017",
        blurb: `Shipped foundational ${skills[2] ?? skills[0]} tooling and internal platforms.`,
      },
    ],
    education: [
      {
        icon: "school",
        title: UNIVERSITIES[i % UNIVERSITIES.length],
        sub: `B.S. in ${c.roleCat === "Engineering" ? "Computer Science" : c.roleCat} · 2011 – 2015`,
      },
      {
        icon: "certificate",
        title: `${skills[0]} Professional Certification`,
        sub: "Industry certification · 2023",
      },
    ],
    attachments: [
      {
        icon: "pdf",
        color: "#E89A9A",
        title: `${c.name.replace(/\s+/g, "_")}_Resume.pdf`,
        sub: `${140 + i * 9} KB · parsed by AI`,
        action: "download",
      },
      {
        icon: "code",
        color: "#9BB8D9",
        title: `github.com/${handle}`,
        sub: "Portfolio · external link",
        action: "open-in-new",
      },
    ],
    strengths: [
      `${c.exp} yrs production ${skills[0]}; deep ${skills[1]} experience at scale`,
      `Led platform work at ${company} through 3× growth`,
      `Comp expectation within ${c.client}'s band`,
    ],
    gaps: [
      `${skills[3] ?? skills[2]} exposure is workshop-level — probe in technical round`,
      "Limited direct client-facing experience",
    ],
    teamNotes: [
      {
        initials: "DS",
        avatarBg: "#3A4A5B",
        avatarFg: "#CFE3F5",
        text: `Very strong on ${skills[0]}. Wants clarity on on-call rotation before offer stage.`,
        author: "Dev Shah",
        when: dayLabel(addDays(appliedTs, 18)),
      },
      {
        initials: "RK",
        avatarBg: "#5B4A3A",
        avatarFg: "#FFD9BC",
        text: `Comp expectation within ${c.client}'s band. ${first} prefers remote-first teams.`,
        author: "Riya Kapoor",
        when: dayLabel(addDays(appliedTs, 16)),
      },
    ],
    milestoneNotes: [
      `${applied} · Dev`,
      dayLabel(addDays(appliedTs, 2)),
      `${dayLabel(addDays(appliedTs, 6))} · AI ${c.match}%`,
      `${dayLabel(addDays(appliedTs, 8))} · Ana`,
      "Awaiting client",
      "—",
    ],
  };
}

const SAVANNAH_OVERRIDES = {
  phone: "+1 (206) 555-0187",
  location: "Seattle, WA",
  linkedin: "linkedin.com/in/savnguyen",
  skills: [
    "Go",
    "PostgreSQL",
    "Kubernetes",
    "AWS",
    "System design",
    "gRPC",
    "Kafka",
    "Terraform",
    "Redis",
    "Team leadership",
  ],
  experience: [
    {
      title: "Staff Engineer",
      company: "Klerno",
      period: "2021 – Present",
      blurb:
        "Platform team lead (4 engineers). Scaled payments APIs through 3× traffic growth; drove Go service standards.",
    },
    {
      title: "Senior Backend Engineer",
      company: "Paylane",
      period: "2017 – 2021",
      blurb:
        "Built ledger and reconciliation services in Go/PostgreSQL; on-call lead for core transactions.",
    },
    {
      title: "Backend Engineer",
      company: "Nuvia",
      period: "2015 – 2017",
      blurb: "REST APIs and data pipelines for analytics products.",
    },
  ],
  education: [
    {
      icon: "school",
      title: "University of Washington",
      sub: "B.S. in Computer Science · 2011 – 2015",
    },
    {
      icon: "certificate",
      title: "AWS Certified Solutions Architect — Professional",
      sub: "Amazon Web Services · 2023",
    },
    {
      icon: "certificate",
      title: "CKA — Certified Kubernetes Administrator",
      sub: "Cloud Native Computing Foundation · 2022",
    },
  ],
  strengths: [
    "6 yrs production Go; deep PostgreSQL tuning at scale",
    "Led 4-engineer platform team through 3× traffic ramp",
    "Comp expectation within Nortech's band",
  ],
  gaps: [
    "gRPC exposure is workshop-level — probe in technical round",
    "No direct EKS experience (self-managed K8s only)",
  ],
  teamNotes: [
    {
      initials: "DS",
      avatarBg: "#3A4A5B",
      avatarFg: "#CFE3F5",
      text: "Very strong on distributed systems. Wants clarity on on-call rotation before offer stage.",
      author: "Dev Shah",
      when: "Jul 2",
    },
    {
      initials: "RK",
      avatarBg: "#5B4A3A",
      avatarFg: "#FFD9BC",
      text: "Comp expectation $175k base — within Nortech's band.",
      author: "Riya Kapoor",
      when: "Jun 30",
    },
  ],
};

function enrichJob(j: SeedJob, i: number) {
  const skills = SKILLS_BY_CAT[j.roleCat] ?? DEFAULT_SKILLS;
  const salary = SALARY_BY_LEVEL[j.level] ?? ["100,000", "130,000"];
  const isFlagship = i === 0;
  return {
    ...j,
    salaryMin: salary[0],
    salaryMax: salary[1],
    skills,
    description: isFlagship
      ? "The Senior Backend Engineer will own core platform services at Nortech — designing scalable APIs, improving system reliability, and shaping the platform roadmap. This role is critical to supporting Nortech's growth from 2M to 10M monthly users, and includes mentoring mid-level engineers across two product teams."
      : `The ${j.title} will own core ${j.roleCat.toLowerCase()} work at ${j.client} — raising quality, pace and reliability while partnering closely with product and the assigned recruiting team.`,
    qualifications: isFlagship
      ? [
          "7+ years of backend experience, with at least 3 years in Go on production systems at scale.",
          "Strong command of PostgreSQL — schema design, query optimization, and operational tuning.",
          "Hands-on experience running Kubernetes workloads on AWS (EKS preferred).",
          "Proven system design skills: distributed systems, gRPC service architectures, and event-driven patterns.",
          "Track record of mentoring engineers and driving technical decisions across teams.",
        ]
      : [
          `${j.level === "Senior" || j.level === "Staff" ? "6+" : "3+"} years of ${j.roleCat.toLowerCase()} experience with ${skills[0]} in production.`,
          `Strong command of ${skills[1]} and ${skills[2] ?? skills[0]}.`,
          `Comfortable operating in a fast-moving, client-facing environment at ${j.client}.`,
          "Clear written and verbal communication across product and engineering.",
          "Track record of raising the bar for quality and pace.",
        ],
    responsibilities: isFlagship
      ? [
          "Design, build, and operate core platform APIs serving 2M+ monthly active users.",
          "Lead reliability work — SLOs, observability, and incident response for platform services.",
          "Partner with product and infra teams to plan capacity and roadmap for 5× user growth.",
          "Mentor mid-level engineers through design reviews, pairing, and career coaching.",
          "Raise the engineering bar: testing standards, code review culture, and deployment safety.",
        ]
      : [
          `Own ${skills[0]}-driven delivery for ${j.client}'s ${j.roleCat.toLowerCase()} roadmap.`,
          `Ship and operate ${skills[1]} work end to end.`,
          "Partner with the assigned recruiting team on pipeline quality.",
          "Mentor peers through reviews and pairing.",
          "Report progress and risks to the profile lead weekly.",
        ],
    views: j.pipeline * 4 + 202,
    saves: Math.round(j.pipeline * 0.3),
    recruitEndTs: ymd(addMonths(j.postedTs, 3)),
    team: [
      {
        name: "Dev Shah",
        initials: "DS",
        avatarBg: "#3A4A5B",
        avatarFg: "#CFE3F5",
        roleLabel: "Employee · sources on LinkedIn",
        badge: "34/50 today",
        badgeTone: "success",
      },
      {
        name: "Ana Novak",
        initials: "AN",
        avatarBg: "#4A3A5B",
        avatarFg: "#E3CFF5",
        roleLabel: "Profile lead · reviews & submits",
        badge: "2 in queue",
        badgeTone: "primary",
      },
    ],
    screeningOn: j.status === "Active",
    screeningThreshold: 80,
  };
}

const FALLBACK_TIME = {
  when: "Tomorrow · 10:00 – 10:45 AM",
  time: "Tomorrow",
  inLabel: "tomorrow",
  hour: 10,
  plusDays: 1,
};
const INTERVIEW_TIMES = [
  {
    when: "Today · 2:00 – 2:45 PM",
    time: "2:00 PM",
    inLabel: "in 45 min",
    hour: 14,
    plusDays: 0,
  },
  {
    when: "Today · 3:30 – 4:15 PM",
    time: "3:30 PM",
    inLabel: "in 2 hrs",
    hour: 15,
    plusDays: 0,
  },
  {
    when: "Tomorrow · 10:00 – 10:45 AM",
    time: "Tomorrow",
    inLabel: "tomorrow",
    hour: 10,
    plusDays: 1,
  },
  {
    when: "Thu · 10:00 – 10:45 AM",
    time: "Thu 10 AM",
    inLabel: "Thursday",
    hour: 10,
    plusDays: 3,
  },
  {
    when: "Fri · 1:00 – 1:45 PM",
    time: "Fri 1 PM",
    inLabel: "Friday",
    hour: 13,
    plusDays: 4,
  },
];

interface InsertedCandidate {
  _id: unknown;
  name: string;
  initials: string;
  avatarBg: string;
  avatarFg: string;
  role: string;
  client: string;
  stage: string;
}

function buildInterviews(docs: InsertedCandidate[]) {
  const interviews: Record<string, unknown>[] = [];
  let slot = 0;
  for (const c of docs) {
    if (!["Interviewing", "Offer", "Shortlisted"].includes(c.stage)) continue;
    const base = {
      agencyId: AGENCY,
      candidateId: String(c._id),
      candidateName: c.name,
      initials: c.initials,
      avatarBg: c.avatarBg,
      avatarFg: c.avatarFg,
      meta: `${c.role} · ${c.client}`,
    };
    if (c.stage !== "Shortlisted") {
      const passedDate = daysAgo(10 + slot * 3);
      interviews.push({
        ...base,
        title: "Round 1 — Technical screen",
        when: dayLabel(passedDate),
        time: dayLabel(passedDate),
        ts: ymd(passedDate) * 10000,
        status: "passed",
        note: `${dayLabel(passedDate)} · Scored ${(8 + (slot % 3) * 0.5).toFixed(1)}/10 by Dev Shah`,
        badge: "Passed",
        inLabel: "",
      });
    }
    const t = INTERVIEW_TIMES[slot % INTERVIEW_TIMES.length] ?? FALLBACK_TIME;
    const upDate = daysAgo(-t.plusDays);
    interviews.push({
      ...base,
      title:
        c.stage === "Shortlisted"
          ? "Round 1 — Technical screen"
          : "Round 2 — System design",
      when: t.when,
      time: t.time,
      ts: ymd(upDate) * 10000 + t.hour * 100,
      status: "upcoming",
      note: `${t.when} · with Tom Weaver`,
      inLabel: t.inLabel,
      badge: "",
    });
    slot++;
  }
  return interviews;
}

async function seed(): Promise<void> {
  await connectDb();
  await ClientModel.deleteMany({ agencyId: AGENCY });
  await ClientModel.insertMany(
    clients.map((c) => ({ ...c, agencyId: AGENCY })),
  );
  await JobModel.deleteMany({ agencyId: AGENCY });
  await JobModel.insertMany(
    jobs.map((j, i) => ({ ...enrichJob(j, i), agencyId: AGENCY })),
  );
  await CandidateModel.deleteMany({ agencyId: AGENCY });
  const insertedCandidates = await CandidateModel.insertMany(
    candidates.map((c, i) => ({
      ...enrichCandidate(c, i),
      ...(c.name === "Savannah Nguyen" ? SAVANNAH_OVERRIDES : {}),
      agencyId: AGENCY,
    })),
  );
  await InterviewModel.deleteMany({ agencyId: AGENCY });
  const interviews = buildInterviews(
    insertedCandidates as unknown as InsertedCandidate[],
  );
  await InterviewModel.insertMany(interviews);
  await RolePermissionModel.deleteMany({ agencyId: AGENCY });
  await seedAgencyPermissions(AGENCY);
  await UserModel.deleteMany({ agencyId: AGENCY });
  const passwordHash = await Bun.password.hash(DEMO_PASSWORD);
  await UserModel.insertMany(
    team.map((m) => ({ ...m, agencyId: AGENCY, passwordHash })),
  );
  await EmailTemplateModel.deleteMany({ agencyId: AGENCY });
  await seedAgencyTemplates(AGENCY);
  console.log(
    `Seeded ${clients.length} clients, ${jobs.length} jobs, ${candidates.length} candidates, ${interviews.length} interviews, ${team.length} team members, ${DEFAULT_TEMPLATES.length} email templates, role permissions.`,
  );
  await closeDb();
}

await seed();
