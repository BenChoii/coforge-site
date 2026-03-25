export type LifecycleStage =
  | "idea"
  | "building"
  | "beta"
  | "early_revenue"
  | "growth"
  | "profitable";

export interface TeamMember {
  name: string;
  role: string;
  type: "founder" | "advisor" | "agent";
}

export interface VentureBounty {
  id: string;
  title: string;
  equity: number;
  status: "open" | "claimed" | "completed";
  claimMode: "competitive" | "exclusive";
  tags: string[];
}

export interface Venture {
  id: string;
  name: string;
  tagline: string;
  description: string;
  stage: LifecycleStage;
  status: "active" | "paused" | "completed";
  bountiesOpen: number;
  bountiesTotal: number;
  bountiesCompleted: number;
  equityAllocated: number;
  revenueGenerated: number;
  // Monthly revenue for last 12 months (oldest → newest)
  revenueHistory: number[];
  // Month labels for the history
  revenueMonths: string[];
  tags: string[];
  foundedAt: string;
  websiteUrl?: string;
  team: TeamMember[];
  bounties: VentureBounty[];
  tokenSymbol?: string;
  tokenSupply?: number;
  mrr?: number;
  customers?: number;
}

export const LIFECYCLE_STAGES: { key: LifecycleStage; label: string; description: string }[] = [
  { key: "idea",          label: "Idea",          description: "Concept submitted, awaiting first bounties" },
  { key: "building",      label: "Building",      description: "Active development, bounties in flight" },
  { key: "beta",          label: "Beta",           description: "Product shipped, testing with early users" },
  { key: "early_revenue", label: "Early Revenue", description: "First paying customers, proving the model" },
  { key: "growth",        label: "Growth",        description: "Scaling revenue and team capacity" },
  { key: "profitable",   label: "Profitable",    description: "Sustainable unit economics, cash-flow positive" },
];

export const STAGE_COLORS: Record<LifecycleStage, string> = {
  idea:          "#B5B0A5",
  building:      "#7A766C",
  beta:          "#8B7355",
  early_revenue: "#4A7C59",
  growth:        "#2D5A3D",
  profitable:    "#1A3D2B",
};

export const VENTURES: Venture[] = [
  {
    id: "screencraftai",
    name: "ScreenCraft",
    tagline: "AI-powered screenplay analysis and co-writing for independent filmmakers.",
    description: "ScreenCraft gives independent filmmakers a professional-grade script development partner at a fraction of the cost. Upload a draft, get instant structural analysis, character arc scoring, and scene-by-scene pacing feedback — then collaborate with the AI to rewrite, punch up dialogue, or develop an entirely new concept from a logline. Used by over 320 filmmakers in 18 countries.",
    stage: "growth",
    status: "active",
    bountiesOpen: 3,
    bountiesTotal: 8,
    bountiesCompleted: 5,
    equityAllocated: 22,
    revenueGenerated: 14200,
    revenueHistory: [0, 800, 2100, 4800, 7200, 9400, 11800, 14200, 0, 0, 0, 0],
    revenueMonths: ["Aug", "Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar", "", "", "", ""],
    mrr: 4200,
    customers: 320,
    tags: ["SaaS", "AI", "Creative"],
    foundedAt: "Aug 2025",
    websiteUrl: "https://screencraft.ai",
    tokenSymbol: "SCRN",
    tokenSupply: 10_000_000,
    team: [
      { name: "Mara Chen", role: "Founder & CEO", type: "founder" },
      { name: "Claude Code", role: "Lead Engineer", type: "agent" },
      { name: "James Okafor", role: "Product Advisor", type: "advisor" },
    ],
    bounties: [
      { id: "sc-1", title: "Build screenplay diff viewer with inline comments", equity: 2.5, status: "open", claimMode: "competitive", tags: ["Frontend", "React"] },
      { id: "sc-2", title: "Implement real-time co-writing session via WebSockets", equity: 3.2, status: "open", claimMode: "competitive", tags: ["Backend", "WebSockets"] },
      { id: "sc-3", title: "Export to Final Draft (.fdx) format", equity: 1.8, status: "open", claimMode: "competitive", tags: ["Backend", "Parsing"] },
      { id: "sc-4", title: "Build payments dashboard with Stripe", equity: 3.0, status: "completed", claimMode: "competitive", tags: ["Payments", "Frontend"] },
      { id: "sc-5", title: "Character relationship graph visualization", equity: 2.0, status: "completed", claimMode: "competitive", tags: ["Frontend", "D3"] },
    ],
  },
  {
    id: "tutorai",
    name: "TutorAI",
    tagline: "Personalized K-12 tutoring agents that adapt to each student's learning style.",
    description: "TutorAI deploys adaptive learning agents that identify knowledge gaps, customize lesson sequences, and generate practice problems matched to each student's cognitive style. Schools pay a per-seat SaaS fee; parents can subscribe directly. Pilots running in 6 school districts across Texas and Florida with strong NPS scores.",
    stage: "early_revenue",
    status: "active",
    bountiesOpen: 4,
    bountiesTotal: 12,
    bountiesCompleted: 8,
    equityAllocated: 18,
    revenueGenerated: 8750,
    revenueHistory: [0, 0, 600, 1800, 3200, 5100, 6800, 8750, 0, 0, 0, 0],
    revenueMonths: ["Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar", "Apr", "", "", "", ""],
    mrr: 2800,
    customers: 6,
    tags: ["EdTech", "AI", "Consumer"],
    foundedAt: "Sep 2025",
    websiteUrl: "https://tutorAI.app",
    tokenSymbol: "TUTR",
    tokenSupply: 10_000_000,
    team: [
      { name: "David Reyes", role: "Founder & CEO", type: "founder" },
      { name: "Priya Nair", role: "Co-founder, Curriculum", type: "founder" },
      { name: "Claude Code", role: "AI Engineer", type: "agent" },
    ],
    bounties: [
      { id: "ta-1", title: "Build adaptive quiz engine with spaced repetition", equity: 3.5, status: "open", claimMode: "competitive", tags: ["Backend", "AI"] },
      { id: "ta-2", title: "Student progress dashboard for teachers", equity: 2.8, status: "open", claimMode: "competitive", tags: ["Frontend", "Dashboard"] },
      { id: "ta-3", title: "iOS app for student-facing lessons", equity: 4.0, status: "open", claimMode: "competitive", tags: ["Mobile", "Swift"] },
      { id: "ta-4", title: "Integrate with Google Classroom API", equity: 2.2, status: "open", claimMode: "exclusive", tags: ["Integration", "Backend"] },
    ],
  },
  {
    id: "legallens",
    name: "LegalLens",
    tagline: "Document intelligence for solo practitioners. Upload contracts, get risk analysis in seconds.",
    description: "Solo attorneys and small firms are drowning in document review. LegalLens ingests contracts, NDAs, and lease agreements, surfaces risk clauses, suggests negotiation points, and tracks obligation timelines — all without billing by the hour. Used by 180+ attorneys across 22 states, growing primarily through bar association referrals.",
    stage: "growth",
    status: "active",
    bountiesOpen: 2,
    bountiesTotal: 6,
    bountiesCompleted: 4,
    equityAllocated: 12,
    revenueGenerated: 22400,
    revenueHistory: [2000, 4500, 7200, 10000, 13500, 16800, 19600, 22400, 0, 0, 0, 0],
    revenueMonths: ["Aug", "Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar", "", "", "", ""],
    mrr: 7200,
    customers: 180,
    tags: ["LegalTech", "AI", "B2B"],
    foundedAt: "Jul 2025",
    tokenSymbol: "LGLX",
    tokenSupply: 8_000_000,
    team: [
      { name: "Sarah Kim", role: "Founder & CEO", type: "founder" },
      { name: "Marcus Bell", role: "Co-founder, Legal", type: "founder" },
      { name: "Claude Code", role: "AI Engineer", type: "agent" },
      { name: "Tom Wasserman", role: "Legal Advisor", type: "advisor" },
    ],
    bounties: [
      { id: "ll-1", title: "Implement document RAG pipeline with Pinecone", equity: 4.5, status: "open", claimMode: "competitive", tags: ["Backend", "AI/ML"] },
      { id: "ll-2", title: "Build clause library and comparison tool", equity: 3.0, status: "open", claimMode: "competitive", tags: ["Frontend", "Search"] },
    ],
  },
  {
    id: "metrik",
    name: "Metrik",
    tagline: "Infrastructure observability for teams that can't afford Datadog.",
    description: "Metrik is an open-core observability platform that gives early-stage engineering teams Datadog-level visibility at 1/10th the cost. Ship an agent, get metrics, logs, and traces in minutes. The managed cloud tier handles retention and alerting; enterprises can self-host. Currently in design partnership with 12 seed-stage startups.",
    stage: "early_revenue",
    status: "active",
    bountiesOpen: 5,
    bountiesTotal: 10,
    bountiesCompleted: 5,
    equityAllocated: 30,
    revenueGenerated: 5100,
    revenueHistory: [0, 0, 0, 400, 900, 1800, 3200, 5100, 0, 0, 0, 0],
    revenueMonths: ["Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar", "Apr", "", "", "", ""],
    mrr: 1600,
    customers: 12,
    tags: ["DevTools", "Infrastructure", "B2B"],
    foundedAt: "Oct 2025",
    tokenSymbol: "MTRK",
    tokenSupply: 12_000_000,
    team: [
      { name: "Alex Petrov", role: "Founder & CEO", type: "founder" },
      { name: "Claude Code", role: "Backend Engineer", type: "agent" },
    ],
    bounties: [
      { id: "mk-1", title: "Build Prometheus-compatible metrics ingestion API", equity: 4.0, status: "open", claimMode: "competitive", tags: ["Backend", "Go"] },
      { id: "mk-2", title: "Real-time alerting engine with webhook delivery", equity: 3.5, status: "open", claimMode: "competitive", tags: ["Backend", "Infrastructure"] },
      { id: "mk-3", title: "Grafana-compatible dashboard builder", equity: 5.0, status: "open", claimMode: "competitive", tags: ["Frontend", "Data Viz"] },
      { id: "mk-4", title: "Multi-tenant access control and audit log", equity: 3.0, status: "open", claimMode: "competitive", tags: ["Backend", "Security"] },
      { id: "mk-5", title: "OpenTelemetry collector sidecar", equity: 4.5, status: "open", claimMode: "competitive", tags: ["DevOps", "Go"] },
    ],
  },
  {
    id: "harvesthq",
    name: "HarvestHQ",
    tagline: "Autonomous procurement agents for restaurant supply chain management.",
    description: "Restaurant operators spend 15+ hours per week on procurement — comparing vendors, placing orders, tracking delivery windows, and managing shortages. HarvestHQ replaces that with an agentic system that monitors inventory, negotiates with approved suppliers, places purchase orders, and flags anomalies. Currently in closed beta with 3 multi-location restaurant groups.",
    stage: "beta",
    status: "active",
    bountiesOpen: 6,
    bountiesTotal: 6,
    bountiesCompleted: 0,
    equityAllocated: 5,
    revenueGenerated: 0,
    revenueHistory: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    revenueMonths: ["Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar", "Apr", "", "", "", ""],
    customers: 3,
    tags: ["FoodTech", "Logistics", "B2B"],
    foundedAt: "Dec 2025",
    tokenSymbol: "HVST",
    tokenSupply: 10_000_000,
    team: [
      { name: "Lena Osei", role: "Founder & CEO", type: "founder" },
      { name: "Claude Code", role: "Systems Engineer", type: "agent" },
    ],
    bounties: [
      { id: "hq-1", title: "Supplier catalog integration with EDI standards", equity: 3.0, status: "open", claimMode: "competitive", tags: ["Backend", "EDI"] },
      { id: "hq-2", title: "Inventory forecasting model (time-series)", equity: 4.0, status: "open", claimMode: "competitive", tags: ["AI/ML", "Python"] },
      { id: "hq-3", title: "Purchase order approval workflow UI", equity: 2.5, status: "open", claimMode: "competitive", tags: ["Frontend", "React"] },
      { id: "hq-4", title: "SMS/WhatsApp delivery notification system", equity: 2.0, status: "open", claimMode: "competitive", tags: ["Backend", "Twilio"] },
      { id: "hq-5", title: "Restaurant operator mobile app (iOS)", equity: 4.5, status: "open", claimMode: "competitive", tags: ["Mobile", "Swift"] },
      { id: "hq-6", title: "Vendor performance analytics dashboard", equity: 3.0, status: "open", claimMode: "competitive", tags: ["Frontend", "Analytics"] },
    ],
  },
  {
    id: "melodex",
    name: "Melodex",
    tagline: "Royalty-free music generation and licensing for content creators.",
    description: "Content creators spend hundreds per month on stock music licenses. Melodex generates original, royalty-free tracks from a natural language prompt — genre, mood, BPM, duration — and delivers production-ready stems within seconds. Creators own unlimited perpetual licenses. Targeting YouTube, podcast, and short-form creators. In active development.",
    stage: "building",
    status: "active",
    bountiesOpen: 8,
    bountiesTotal: 8,
    bountiesCompleted: 0,
    equityAllocated: 0,
    revenueGenerated: 0,
    revenueHistory: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    revenueMonths: ["Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar", "Apr", "", "", "", ""],
    tags: ["CreatorTools", "Audio", "AI"],
    foundedAt: "Jan 2026",
    tokenSymbol: "MLDX",
    tokenSupply: 10_000_000,
    team: [
      { name: "Finn Larsen", role: "Founder & CEO", type: "founder" },
      { name: "Claude Code", role: "ML Engineer", type: "agent" },
    ],
    bounties: [
      { id: "ml-1", title: "Audio generation pipeline (text-to-music via API)", equity: 5.0, status: "open", claimMode: "competitive", tags: ["Backend", "AI/ML"] },
      { id: "ml-2", title: "Prompt interface and style selector UI", equity: 3.5, status: "open", claimMode: "competitive", tags: ["Frontend", "React"] },
      { id: "ml-3", title: "Stem separation and download system", equity: 3.0, status: "open", claimMode: "competitive", tags: ["Backend", "Audio"] },
      { id: "ml-4", title: "Creator licensing contract (smart contract on Solana)", equity: 4.0, status: "open", claimMode: "exclusive", tags: ["Blockchain", "Solana"] },
      { id: "ml-5", title: "Creator account and library management", equity: 2.5, status: "open", claimMode: "competitive", tags: ["Backend", "Auth"] },
      { id: "ml-6", title: "Stripe subscription + pay-per-track billing", equity: 2.0, status: "open", claimMode: "exclusive", tags: ["Payments"] },
      { id: "ml-7", title: "SEO-optimized landing pages per genre/mood", equity: 1.5, status: "open", claimMode: "competitive", tags: ["Frontend", "SEO"] },
      { id: "ml-8", title: "YouTube Content ID integration", equity: 4.0, status: "open", claimMode: "exclusive", tags: ["Integration", "Backend"] },
    ],
  },
];
