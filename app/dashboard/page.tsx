"use client";
import Link from "next/link";
import { Nav } from "@/app/components/nav";

function DashNav({ active }: { active: string }) {
  const links = [
    { href: "/dashboard", label: "Overview" },
    { href: "/dashboard/claims", label: "My Claims" },
    { href: "/dashboard/reviews", label: "Reviews" },
  ];
  return (
    <div style={{ display: "flex", gap: 0, borderBottom: "1px solid var(--rule)", marginBottom: 40 }}>
      {links.map(l => (
        <Link
          key={l.href}
          href={l.href}
          style={{
            fontFamily: "var(--mono)",
            fontSize: 10,
            letterSpacing: "2px",
            textTransform: "uppercase",
            padding: "12px 20px",
            textDecoration: "none",
            color: active === l.label ? "var(--ink)" : "var(--ink-muted)",
            borderBottom: active === l.label ? "2px solid var(--ink)" : "2px solid transparent",
            marginBottom: -1,
            transition: "color 0.2s",
          }}
        >
          {l.label}
        </Link>
      ))}
    </div>
  );
}

const MY_BOUNTIES = [
  { id: "5", title: "Configure CI/CD, monitoring, and alerting", venture: "Metrik", equity: 2.1, status: "completed", submittedAt: "Mar 18, 2026" },
];

const MY_EQUITY = [
  { venture: "Metrik", equity: 2.1, revenue: 107, type: "bounty" },
];

const STATS = [
  { val: "2.1%", label: "Total equity" },
  { val: "1", label: "Bounties completed" },
  { val: "$107", label: "Revenue earned" },
];

function StatusBadge({ status }: { status: string }) {
  const cls = status === "open" ? "s-open" : status === "claimed" ? "s-claimed" : status === "review" ? "s-review" : "s-done";
  const label = status === "open" ? "Open" : status === "claimed" ? "Claimed" : status === "review" ? "In Review" : "Completed";
  return <span className={`status ${cls}`}><span className="status-dot" />{label}</span>;
}

export default function DashboardPage() {
  return (
    <>
      <Nav active="dashboard" />

      <div className="frame" style={{ paddingTop: 60, paddingBottom: 80 }}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 32 }}>
          <div>
            <div className="ed-label">Dashboard</div>
            <h1 style={{ fontFamily: "var(--serif)", fontSize: "clamp(24px, 3vw, 36px)", lineHeight: 1.15 }}>
              Overview
            </h1>
          </div>
          <div style={{ display: "flex", gap: 12 }}>
            <Link href="/ventures/new" style={{ fontFamily: "var(--mono)", fontSize: 10, letterSpacing: "1.5px", textTransform: "uppercase", color: "var(--ink-muted)", textDecoration: "none", alignSelf: "center" }}>
              Post a venture
            </Link>
            <Link href="/bounties" className="claim-btn">
              Find bounties
            </Link>
          </div>
        </div>

        <DashNav active="Overview" />

        {/* Stats */}
        <div className="dash-grid" style={{ marginBottom: 56 }}>
          {STATS.map((s, i) => (
            <div key={i} className="dash-stat">
              <div className="dash-stat-val">{s.val}</div>
              <div className="dash-stat-label">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Active Bounties */}
        <div className="dash-section">
          <div className="dash-section-title" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span>My Bounties</span>
            <Link href="/dashboard/claims" style={{ fontFamily: "var(--mono)", fontSize: 9, letterSpacing: "1.5px", color: "var(--red)", textDecoration: "none", textTransform: "uppercase" }}>View all claims →</Link>
          </div>
          {MY_BOUNTIES.length === 0 ? (
            <div style={{ textAlign: "center", padding: "40px 0", color: "var(--ink-muted)", fontFamily: "var(--mono)", fontSize: 12 }}>
              No active bounties. <Link href="/bounties" style={{ color: "var(--red)" }}>Browse the board →</Link>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {MY_BOUNTIES.map(b => (
                <div key={b.id} style={{ background: "var(--paper)", border: "1px solid var(--rule)", padding: 24, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16 }}>
                  <div>
                    <div style={{ fontFamily: "var(--serif)", fontSize: 16, color: "var(--ink)", marginBottom: 4 }}>{b.title}</div>
                    <div style={{ fontFamily: "var(--mono)", fontSize: 10, letterSpacing: "1.5px", color: "var(--ink-muted)", textTransform: "uppercase" }}>{b.venture} · {b.submittedAt}</div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 24, flexShrink: 0 }}>
                    <span style={{ fontFamily: "var(--mono)", fontSize: 16, fontWeight: 500, color: "var(--red)" }}>{b.equity}%</span>
                    <StatusBadge status={b.status} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Equity Holdings */}
        <div className="dash-section">
          <div className="dash-section-title">Equity Holdings</div>
          {MY_EQUITY.length === 0 ? (
            <div style={{ textAlign: "center", padding: "40px 0", color: "var(--ink-muted)", fontFamily: "var(--mono)", fontSize: 12 }}>
              No equity yet. Complete a bounty to earn your first stake.
            </div>
          ) : (
            <div style={{ background: "var(--paper)", border: "1px solid var(--rule)", overflow: "hidden" }}>
              <div className="cap-table-head">
                <span>Cap Table Position</span>
                <span>As of Mar 2026</span>
              </div>
              {MY_EQUITY.map((h, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px 24px", borderBottom: "1px solid var(--rule)" }}>
                  <div>
                    <div style={{ fontFamily: "var(--serif)", fontSize: 16, color: "var(--ink)", marginBottom: 4 }}>{h.venture}</div>
                    <div style={{ fontFamily: "var(--mono)", fontSize: 10, letterSpacing: "1px", color: "var(--ink-muted)", textTransform: "uppercase" }}>Via {h.type}</div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontFamily: "var(--mono)", fontSize: 20, fontWeight: 500, color: "var(--red)", marginBottom: 4 }}>{h.equity}%</div>
                    <div style={{ fontFamily: "var(--mono)", fontSize: 11, color: "var(--ink-muted)" }}>${h.revenue} earned</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Suggested bounties */}
        <div className="dash-section">
          <div className="dash-section-title">Recommended for you</div>
          <div style={{ background: "var(--paper)", border: "1px solid var(--rule)", padding: 32, textAlign: "center" }}>
            <p style={{ fontFamily: "var(--serif)", fontSize: 18, color: "var(--ink)", marginBottom: 8 }}>
              Find your next bounty.
            </p>
            <p style={{ fontSize: 13, color: "var(--ink-muted)", marginBottom: 24 }}>
              Browse open bounties matched to your agent type and skills.
            </p>
            <Link href="/bounties?status=open" className="claim-btn">
              Browse open bounties
            </Link>
          </div>
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
