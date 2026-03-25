"use client";
import Link from "next/link";
import { Nav } from "@/app/components/nav";

const VENTURES = [
  {
    id: "screencraft",
    name: "ScreenCraft",
    tagline: "AI-powered screenplay analysis and co-writing for independent filmmakers.",
    status: "active",
    bountiesOpen: 3,
    bountiesTotal: 8,
    equityAllocated: 22,
    revenueGenerated: 14200,
    tags: ["SaaS", "AI", "Creative"],
    foundedAt: "Jan 2026",
  },
  {
    id: "tutorai",
    name: "TutorAI",
    tagline: "Personalized K-12 tutoring agents that adapt to each student's learning style.",
    status: "active",
    bountiesOpen: 4,
    bountiesTotal: 12,
    equityAllocated: 18,
    revenueGenerated: 8750,
    tags: ["EdTech", "AI", "Consumer"],
    foundedAt: "Feb 2026",
  },
  {
    id: "legallens",
    name: "LegalLens",
    tagline: "Document intelligence for solo practitioners. Upload contracts, get risk analysis in seconds.",
    status: "active",
    bountiesOpen: 2,
    bountiesTotal: 6,
    equityAllocated: 12,
    revenueGenerated: 22400,
    tags: ["LegalTech", "AI", "B2B"],
    foundedAt: "Dec 2025",
  },
  {
    id: "metrik",
    name: "Metrik",
    tagline: "Infrastructure observability for teams that can't afford Datadog.",
    status: "active",
    bountiesOpen: 5,
    bountiesTotal: 10,
    equityAllocated: 30,
    revenueGenerated: 5100,
    tags: ["DevTools", "Infrastructure", "B2B"],
    foundedAt: "Mar 2026",
  },
  {
    id: "harvesthq",
    name: "HarvestHQ",
    tagline: "Autonomous procurement agents for restaurant supply chain management.",
    status: "active",
    bountiesOpen: 6,
    bountiesTotal: 6,
    equityAllocated: 5,
    revenueGenerated: 0,
    tags: ["FoodTech", "Logistics", "B2B"],
    foundedAt: "Mar 2026",
  },
  {
    id: "melodex",
    name: "Melodex",
    tagline: "Royalty-free music generation and licensing for content creators.",
    status: "active",
    bountiesOpen: 8,
    bountiesTotal: 8,
    equityAllocated: 0,
    revenueGenerated: 0,
    tags: ["CreatorTools", "Audio", "AI"],
    foundedAt: "Mar 2026",
  },
];

export default function VenturesPage() {
  return (
    <>
      <Nav active="ventures" />

      <div className="frame" style={{ paddingTop: 60, paddingBottom: 80 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 48 }}>
          <div>
            <div className="ed-label">Ventures</div>
            <div className="ed-title" style={{ marginBottom: 8 }}>Active companies<br />being built now.</div>
            <p className="ed-lede">
              Each venture is a real business in formation. Browse open bounties, review the equity structure, and start building.
            </p>
          </div>
          <Link href="/ventures/new" className="claim-btn" style={{ flexShrink: 0 }}>
            Post a venture
          </Link>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: 24 }}>
          {VENTURES.map(v => (
            <div key={v.id} className="venture-card">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                <div className="venture-name">{v.name}</div>
                <div className="bounty-tags-list">
                  {v.tags.slice(0, 2).map(t => <span key={t} className="tag">{t}</span>)}
                </div>
              </div>
              <p className="venture-tagline">{v.tagline}</p>

              <div className="venture-meta">
                <span>
                  <strong>{v.bountiesOpen}</strong>
                  Open bounties
                </span>
                <span>
                  <strong>{v.equityAllocated}%</strong>
                  Equity allocated
                </span>
                <span>
                  <strong>${v.revenueGenerated > 0 ? (v.revenueGenerated / 1000).toFixed(1) + "k" : "0"}</strong>
                  Revenue
                </span>
              </div>

              <div style={{ display: "flex", gap: 12 }}>
                <Link
                  href={`/bounties?venture=${v.id}`}
                  className="claim-btn"
                  style={{ fontSize: 11, padding: "8px 16px" }}
                >
                  View bounties ({v.bountiesOpen})
                </Link>
                <Link
                  href={`/ventures/${v.id}`}
                  style={{
                    fontFamily: "var(--mono)",
                    fontSize: 10,
                    letterSpacing: "1.5px",
                    textTransform: "uppercase",
                    color: "var(--ink-muted)",
                    textDecoration: "none",
                    alignSelf: "center",
                    transition: "color 0.2s",
                  }}
                >
                  Details →
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="frame"><hr className="rule" /></div>
      <footer className="site-footer">
        <div className="frame foot-inner">
          <span className="foot-copy">&copy; 2026 CoForge Technologies</span>
        </div>
      </footer>
    </>
  );
}
