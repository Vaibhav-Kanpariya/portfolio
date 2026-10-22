/**
 * Single source of truth for portfolio content.
 * Both the 3D galaxy and the recruiter view read from here, so updating a
 * job, project, or skill only happens in this file.
 */

export const profile = {
  name: "Vaibhav Kanpariya",
  firstName: "Vaibhav",
  lastName: "Kanpariya",
  role: "Full Stack Engineer",
  focus: "Agentic systems",
  location: "Surat, Gujarat, India",
  email: "kanpariyavaibhav966@gmail.com",
  github: "https://github.com/Vaibhav-Kanpariya",
  linkedin: "https://www.linkedin.com/in/vaibhav-kanpariya/",
  resume: "/Vaibhav_Kanpariya_Resume.pdf",
  headline:
    "I build autonomous AI agents and the event-driven backends that keep them reliable in production.",
  summary:
    "Full stack engineer with 3 years building AI-powered web platforms from 0-to-1 to production scale. I specialize in agentic workflows: autonomous LLM agents, event-driven pipelines, and DLQ-backed reliability, alongside React, TypeScript, and Node.js.",
};

/* ───────────────────────── clusters & skills ───────────────────────── */

export type ClusterId = "ai" | "cloud" | "backend" | "frontend" | "observability";

export const clusters: Record<
  ClusterId,
  { label: string; color: string; recruiterLabel: string }
> = {
  ai: { label: "Agents & AI", recruiterLabel: "AI & agentic workflows", color: "#B9A2FF" },
  cloud: { label: "Distributed systems", recruiterLabel: "Distributed systems & cloud", color: "#FFB877" },
  backend: { label: "Backend & data", recruiterLabel: "Backend, languages & data", color: "#7FDDB0" },
  frontend: { label: "Frontend", recruiterLabel: "Frontend", color: "#FF8FB4" },
  observability: { label: "Product analytics", recruiterLabel: "Observability & analytics", color: "#F3E07C" },
};

export type Skill = { id: string; label: string; cluster: ClusterId };

export const skills: Skill[] = [
  // Agents & AI
  { id: "langchain", label: "LangChain", cluster: "ai" },
  { id: "langgraph", label: "LangGraph", cluster: "ai" },
  { id: "openai", label: "OpenAI API", cluster: "ai" },
  { id: "whisper", label: "Whisper", cluster: "ai" },
  { id: "agents", label: "LLM agents", cluster: "ai" },
  { id: "rag", label: "RAG", cluster: "ai" },
  { id: "qdrant", label: "Qdrant", cluster: "ai" },
  // Distributed systems & cloud
  { id: "sqs", label: "SQS / SNS", cluster: "cloud" },
  { id: "kafka", label: "Kafka", cluster: "cloud" },
  { id: "pubsub", label: "Pub/Sub", cluster: "cloud" },
  { id: "dlq", label: "DLQ & retry", cluster: "cloud" },
  { id: "lambda", label: "Lambda", cluster: "cloud" },
  { id: "fargate", label: "Fargate", cluster: "cloud" },
  { id: "stepfn", label: "Step Functions", cluster: "cloud" },
  { id: "s3", label: "S3", cluster: "cloud" },
  { id: "ses", label: "SES", cluster: "cloud" },
  { id: "docker", label: "Docker", cluster: "cloud" },
  { id: "cicd", label: "CI/CD", cluster: "cloud" },
  // Backend & data
  { id: "node", label: "Node.js", cluster: "backend" },
  { id: "express", label: "Express", cluster: "backend" },
  { id: "fastapi", label: "FastAPI", cluster: "backend" },
  { id: "python", label: "Python", cluster: "backend" },
  { id: "rest", label: "REST API design", cluster: "backend" },
  { id: "mysql", label: "MySQL", cluster: "backend" },
  { id: "mongodb", label: "MongoDB", cluster: "backend" },
  { id: "firebase", label: "Firebase", cluster: "backend" },
  { id: "gmail", label: "Gmail API", cluster: "backend" },
  { id: "cpp", label: "C++", cluster: "backend" },
  { id: "c", label: "C", cluster: "backend" },
  // Frontend
  { id: "react", label: "React", cluster: "frontend" },
  { id: "nextjs", label: "Next.js", cluster: "frontend" },
  { id: "typescript", label: "TypeScript", cluster: "frontend" },
  { id: "javascript", label: "JavaScript", cluster: "frontend" },
  { id: "tailwind", label: "Tailwind CSS", cluster: "frontend" },
  // Product analytics
  { id: "mixpanel", label: "Mixpanel", cluster: "observability" },
  { id: "ga", label: "Google Analytics", cluster: "observability" },
  { id: "posthog", label: "PostHog", cluster: "observability" },
];

/* ───────────────────────── projects ───────────────────────── */

export type Project = {
  id: string;
  label: string;
  /** one-line description of what it is */
  kind: string;
  uses: string[];
  /** section anchor this star scrolls to when clicked */
  section?: string;
};

export const projects: Project[] = [
  {
    id: "mastermind",
    label: "Mastermind",
    kind: "Autonomous creator-matching agent",
    section: "mastermind",
    uses: ["agents", "rag", "openai", "whisper", "qdrant", "langchain", "stepfn", "sqs", "s3", "fargate", "typescript"],
  },
  {
    id: "ntn",
    label: "NTN",
    kind: "Autonomous negotiation system",
    section: "ntn",
    uses: ["agents", "langchain", "gmail", "dlq", "sqs", "pubsub", "mixpanel", "node", "typescript"],
  },
  {
    id: "influenzer",
    label: "Influenzer.ai",
    kind: "0-to-1 influencer marketing platform",
    section: "impact",
    uses: ["react", "typescript", "node", "express", "mysql", "rest", "s3", "ses"],
  },
  {
    id: "steroids",
    label: "Steroids.ai",
    kind: "Agent-execution backend",
    section: "career-culturex",
    uses: ["sqs", "pubsub", "dlq", "kafka", "lambda", "docker", "node", "langgraph"],
  },
  {
    id: "analytics",
    label: "Analytics layer",
    kind: "100+ tracked product events",
    section: "impact",
    uses: ["mixpanel", "ga", "posthog", "javascript", "nextjs", "tailwind"],
  },
  {
    id: "urc",
    label: "Universal Rest Client",
    kind: "SIEM integration automation",
    section: "career-crest",
    uses: ["python", "fastapi", "rest", "cicd"],
  },
];

/* ───────────────────────── career ───────────────────────── */

export type Job = {
  id: string;
  region: string;
  label: string;
  title: string;
  org: string;
  orgNote?: string;
  place: string;
  start: string;
  end: string;
  points: string[];
  links: string[];
};

/** Chronological: the camera travels forward in time. */
export const career: Job[] = [
  {
    id: "charusat",
    region: "career-charusat",
    label: "CHARUSAT",
    title: "B.E. Computer Science & Engineering",
    org: "Charotar University of Science and Technology",
    place: "Anand, India",
    start: "2019",
    end: "2023",
    points: ["Graduated with a CGPA of 9.04 out of 10."],
    links: ["cpp", "c", "python", "javascript"],
  },
  {
    id: "crest",
    region: "career-crest",
    label: "Crest Data",
    title: "Software Developer Intern",
    org: "Crest Data Systems",
    place: "Ahmedabad, India",
    start: "Dec 2022",
    end: "Jun 2023",
    points: [
      "Co-developed the Universal Rest Client, which automates SIEM platform integrations and cut developer workload by 70%.",
      "Built RESTful APIs in Python and FastAPI across the full development lifecycle.",
    ],
    links: ["urc", "python", "fastapi", "rest"],
  },
  {
    id: "culturex",
    region: "career-culturex",
    label: "CultureX",
    title: "Full Stack Developer",
    org: "CultureX Entertainment",
    orgNote: "Influenzer.ai and Steroids.ai",
    place: "Ahmedabad, India",
    start: "Aug 2023",
    end: "Present",
    points: [
      "Took Influenzer.ai from concept to a live product used by 200+ brands, across 8 releases.",
      "Own the backend behind Steroids.ai's AI agents: queues, worker patterns, DLQ handling, and Pub/Sub for asynchronous agent runs.",
      "Resolved high-priority production outages and stabilized the Gmail, YouTube, and Facebook integrations.",
      "Primary backend reviewer; onboarded backend interns into active contributors.",
    ],
    links: ["influenzer", "steroids", "mastermind", "ntn", "analytics"],
  },
];

/* ───────────────────────── impact ───────────────────────── */

export const impact = [
  { value: "100K+", text: "API requests a day on Influenzer.ai, held at 99.8% uptime." },
  { value: "200+", text: "brands using a product I took from concept to launch in 8 releases." },
  { value: "1.2M+", text: "analytics calls a day across 100+ tracked product events." },
  { value: "35%", text: "lower customer-acquisition cost and a 20% lift in conversions, driven by that data." },
];

/* ───────────────────────── flagship projects ───────────────────────── */

export const mastermind = {
  title: "Mastermind",
  tagline: "The matching agent at the heart of Influenzer.ai.",
  intro:
    "A brand writes a brief in plain language. Mastermind plans its own retrieval and reasoning, then narrows a pool of 2,000+ creators down to the best 100–200, with no one curating by hand. I was its sole architect.",
  stages: [
    {
      title: "Watch, listen, read",
      text: "Whisper transcribes each reel's audio, a vision model describes its thumbnails, and captions come in as text. The three signals are fused into one OpenAI embedding per creator in Qdrant.",
    },
    {
      title: "Retrieve and reason",
      text: "A multi-stage RAG core matches on what creators actually make, not keywords or follower counts.",
    },
    {
      title: "Learn from every rejection",
      text: "An AWS Step Functions loop keeps each brand's decision history and re-ranks after every rejection, so results get sharper with use.",
    },
    {
      title: "Process at scale",
      text: "S3, SQS/SNS and Fargate process thousands of media assets in parallel.",
    },
  ],
  stack: ["TypeScript", "LangChain", "Qdrant", "OpenAI", "Whisper", "AWS"],
};

export const ntn = {
  title: "NTN",
  fullTitle: "No-Touch Negotiation",
  tagline: "AI agents that negotiate creator deals over email.",
  intro:
    "NTN takes people out of the deal-closing loop. When a creator replies, an event wakes the agent, which reads the whole thread and responds on its own.",
  points: [
    "Email ingestion and context storage feed the agents, so negotiations stay coherent across many turns.",
    "A DLQ-based retry path catches failed sends and processes them again, so no reply is dropped.",
    "Gmail quota, rate-limit and watch-renewal handling keeps large volumes of events flowing, with Mixpanel tracking every step.",
  ],
  stack: ["TypeScript", "LangChain", "AWS", "Gmail API"],
};

export const education = career[0];

/* ───────────────────────── regions (scroll stops) ───────────────────────── */

export type RegionId =
  | "intro"
  | "impact"
  | "career-charusat"
  | "career-crest"
  | "career-culturex"
  | "mastermind"
  | "ntn"
  | "skills"
  | "contact";

/** Order matters: this is the order the camera visits them while scrolling. */
export const regionOrder: RegionId[] = [
  "intro",
  "impact",
  "career-charusat",
  "career-crest",
  "career-culturex",
  "mastermind",
  "ntn",
  "skills",
  "contact",
];

/** Items in the side navigation (career sub-stops share one entry). */
export const navItems: { label: string; region: RegionId; matches: RegionId[] }[] = [
  { label: "Intro", region: "intro", matches: ["intro"] },
  { label: "Impact", region: "impact", matches: ["impact"] },
  { label: "Career", region: "career-charusat", matches: ["career-charusat", "career-crest", "career-culturex"] },
  { label: "Mastermind", region: "mastermind", matches: ["mastermind"] },
  { label: "NTN", region: "ntn", matches: ["ntn"] },
  { label: "Skills", region: "skills", matches: ["skills"] },
  { label: "Contact", region: "contact", matches: ["contact"] },
];
