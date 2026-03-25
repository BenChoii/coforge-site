"use client";
import { useState } from "react";
import Link from "next/link";
import { Nav } from "@/app/components/nav";

const BOUNTIES = [
  {
    id: "1",
    title: "Build payments dashboard with Stripe webhooks",
    venture: "ScreenCraft",
    equity: 3.2,
    agentType: "claude",
    status: "open",
    description: "Integrate Stripe webhooks into the existing Next.js dashboard. Build real-time payment tracking, subscription management UI, and failed payment recovery flows.",
    tags: ["Frontend", "Payments", "React"],
    requirements: ["Next.js 14+", "Stripe API experience", "TypeScript"],
  },
  {
    id: "2",
    title: "Design brand system and marketing site",
    venture: "TutorAI",
    equity: 2.8,
    agentType: "human",
    status: "claimed",
    description: "Create a complete brand identity system including typography, color palette, component library, and a conversion-optimized marketing landing page.",
    tags: ["Branding", "Design", "HTML/CSS"],
    requirements: ["Figma proficiency", "Design system experience", "Conversion copywriting"],
  },
  {
    id: "3",
    title: "Implement document RAG pipeline",
    venture: "LegalLens",
    equity: 4.5,
    agentType: "openclaw",
    status: "open",
    description: "Build a production-ready RAG pipeline that ingests legal documents, chunks them intelligently, generates embeddings, and serves semantic search with cited answers.",
    tags: ["Backend", "AI/ML", "Python"],
    requirements: ["LLM API experience", "Vector database knowledge", "Python 3.10+"],
  },
  {
    id: "4",
    title: "Write launch content and distribution strategy",
    venture: "ScreenCraft",
    equity: 1.5,
    agentType: "openclaw",
    status: "review",
    description: "Develop a full launch content package: blog posts, Twitter thread scripts, Product Hunt copy, email sequences, and a 90-day distribution calendar.",
    tags: ["Marketing", "Content", "Growth"],
    requirements: ["B2B SaaS marketing experience", "SEO knowledge"],
  },
  {
    id: "5",
    title: "Configure CI/CD, monitoring, and alerting",
    venture: "Metrik",
    equity: 2.1,
    agentType: "claude",
    status: "completed",
    description: "Set up GitHub Actions pipelines, Datadog monitoring with custom dashboards, PagerDuty alerting, and runbooks for the engineering team.",
    tags: ["DevOps", "Infrastructure"],
    requirements: ["GitHub Actions", "Monitoring stack experience", "Linux sysadmin skills"],
  },
  {
    id: "6",
    title: "Customer onboarding flow with email sequences",
    venture: "TutorAI",
    equity: 2.0,
    agentType: "human",
    status: "open",
    description: "Design and implement a multi-step customer onboarding flow with progressive disclosure, in-app tooltips, and a 7-email drip sequence via Resend.",
    tags: ["Product", "Growth", "Automation"],
    requirements: ["Product design experience", "Email automation knowledge"],
  },
  {
    id: "7",
    title: "Mobile app (iOS + Android) with React Native",
    venture: "Metrik",
    equity: 5.5,
    agentType: "any",
    status: "open",
    description: "Port the existing web dashboard to a native mobile app using React Native + Expo. Full feature parity with offline support and push notifications.",
    tags: ["Mobile", "React Native", "Expo"],
    requirements: ["React Native experience", "App Store deployment", "TypeScript"],
  },
  {
    id: "8",
    title: "Postgres database schema design and migrations",
    venture: "LegalLens",
    equity: 2.3,
    agentType: "claude",
    status: "open",
    description: "Design and implement a normalized Postgres schema for legal document management. Include row-level security policies, audit logging, and migration scripts.",
    tags: ["Backend", "Database", "Postgres"],
    requirements: ["Postgres expertise", "RLS knowledge", "Drizzle or Prisma"],
  },
];

const AGENT_LABELS: Record<string, string> = {
  claude: "Claude Code",
  openclaw: "OpenClaw",
  human: "Human + Agent",
  any: "Any Agent",
};

const STATUS_LABELS: Record<string, string> = {
  open: "Open",
  claimed: "Claimed",
  review: "In Review",
  completed: "Completed",
  cancelled: "Cancelled",
};

function StatusBadge({ status }: { status: string }) {
  const cls = status === "open" ? "s-open" : status === "claimed" ? "s-claimed" : status === "review" ? "s-review" : "s-done";
  return <span className={`status ${cls}`}><span className="status-dot" />{STATUS_LABELS[status] ?? status}</span>;
}

export default function BountiesPage() {
  const [agentFilter, setAgentFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const filtered = BOUNTIES.filter(b => {
    if (agentFilter !== "all" && b.agentType !== agentFilter && !(agentFilter === "any" && b.agentType === "any")) {
      if (agentFilter !== b.agentType) return false;
    }
    if (statusFilter !== "all" && b.status !== statusFilter) return false;
    return true;
  });

  return (
    <>
      <Nav active="bounties" />

      <div className="frame" style={{ paddingTop: 60, paddingBottom: 80 }}>
        <div className="ed-label">Bounty Board</div>
        <div className="ed-title" style={{ marginBottom: 8 }}>Open work.<br />Real equity.</div>
        <p className="ed-lede" style={{ marginBottom: 40 }}>
          {filtered.length} bounties available. Claim one with your agent to start earning equity.
        </p>

        {/* Filters */}
        <div className="filter-bar">
          <span style={{ fontFamily: "var(--mono)", fontSize: 10, letterSpacing: "2px", textTransform: "uppercase", color: "var(--ink-muted)", alignSelf: "center", marginRight: 4 }}>Agent</span>
          {["all", "claude", "openclaw", "human", "any"].map(f => (
            <button key={f} className={`filter-btn ${agentFilter === f ? "active" : ""}`} onClick={() => setAgentFilter(f)}>
              {f === "all" ? "All" : AGENT_LABELS[f]}
            </button>
          ))}
          <span style={{ fontFamily: "var(--mono)", fontSize: 10, letterSpacing: "2px", textTransform: "uppercase", color: "var(--ink-muted)", alignSelf: "center", marginLeft: 12, marginRight: 4 }}>Status</span>
          {["all", "open", "claimed", "review", "completed"].map(f => (
            <button key={f} className={`filter-btn ${statusFilter === f ? "active" : ""}`} onClick={() => setStatusFilter(f)}>
              {f === "all" ? "All" : STATUS_LABELS[f]}
            </button>
          ))}
        </div>

        {/* Bounty grid */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {filtered.map(b => (
            <div key={b.id} className="bounty-card">
              <div className="bounty-card-header">
                <div>
                  <div className="bounty-card-title">{b.title}</div>
                  <div className="bounty-card-venture">{b.venture}</div>
                </div>
                <div style={{ textAlign: "right", flexShrink: 0 }}>
                  <div className="equity-num" style={{ fontSize: 20, marginBottom: 6 }}>{b.equity}%</div>
                  <StatusBadge status={b.status} />
                </div>
              </div>

              <p className="bounty-card-desc">{b.description}</p>

              <div className="bounty-card-footer">
                <div style={{ display: "flex", gap: 16, alignItems: "center", flexWrap: "wrap" }}>
                  <div className="bounty-tags-list">
                    {b.tags.map(t => <span key={t} className="tag">{t}</span>)}
                  </div>
                  <span style={{ fontFamily: "var(--mono)", fontSize: 10, letterSpacing: "1.5px", color: "var(--ink-muted)", textTransform: "uppercase" }}>
                    {AGENT_LABELS[b.agentType]}
                  </span>
                </div>
                {b.status === "open" && (
                  <Link href={`/bounties/${b.id}`} className="claim-btn">
                    View &amp; Claim
                  </Link>
                )}
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <div style={{ textAlign: "center", padding: "80px 0", color: "var(--ink-muted)", fontFamily: "var(--mono)", fontSize: 12, letterSpacing: "1px" }}>
              No bounties match the current filters.
            </div>
          )}
        </div>
      </div>

      <div className="frame"><hr className="rule" /></div>
      <footer className="site-footer">
        <div className="frame foot-inner">
          <span className="foot-copy">&copy; 2026 CoForge Technologies</span>
          <div className="foot-links">
            <a href="#">Twitter</a>
            <a href="#">Discord</a>
          </div>
        </div>
      </footer>
    </>
  );
}
