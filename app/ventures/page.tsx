"use client";
import Link from "next/link";
import { Nav } from "@/app/components/nav";
import { VENTURES, LIFECYCLE_STAGES, STAGE_COLORS, type LifecycleStage } from "@/lib/ventures-data";

function Sparkline({ data, width = 80, height = 32 }: { data: number[]; width?: number; height?: number }) {
  const filtered = data.filter(v => v >= 0);
  const max = Math.max(...filtered, 1);
  const hasRevenue = filtered.some(v => v > 0);
  if (!hasRevenue) {
    return (
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
        <line x1={0} y1={height - 2} x2={width} y2={height - 2} stroke="var(--rule)" strokeWidth={1} strokeDasharray="3 3" />
      </svg>
    );
  }
  const pts = filtered.map((v, i) => {
    const x = (i / (filtered.length - 1)) * width;
    const y = (height - 4) - (v / max) * (height - 6) + 2;
    return `${x},${y}`;
  });
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
      <path
        d={`M ${pts.join(" L ")}`}
        fill="none"
        stroke="var(--ink)"
        strokeWidth={1.5}
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  );
}

function StageBadge({ stage }: { stage: LifecycleStage }) {
  const color = STAGE_COLORS[stage];
  const label = LIFECYCLE_STAGES.find(s => s.key === stage)?.label ?? stage;
  return (
    <div style={{
      display: "inline-flex",
      alignItems: "center",
      gap: 5,
      padding: "3px 8px",
      background: color + "18",
      border: `1px solid ${color}40`,
      fontFamily: "var(--mono)",
      fontSize: 8,
      letterSpacing: "1px",
      textTransform: "uppercase",
      color,
    }}>
      <div style={{ width: 5, height: 5, borderRadius: "50%", background: color }} />
      {label}
    </div>
  );
}

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
            <div key={v.id} className="venture-card" style={{ display: "flex", flexDirection: "column", gap: 0 }}>
              {/* Top row: name + stage badge */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
                <div className="venture-name" style={{ marginBottom: 0 }}>{v.name}</div>
                <StageBadge stage={v.stage} />
              </div>

              {/* Tags */}
              <div className="bounty-tags-list" style={{ marginBottom: 10, gap: 6 }}>
                {v.tags.slice(0, 2).map(t => <span key={t} className="tag">{t}</span>)}
              </div>

              <p className="venture-tagline" style={{ marginBottom: 16 }}>{v.tagline}</p>

              {/* Revenue sparkline + figure */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16, padding: "12px 0", borderTop: "1px solid var(--rule)", borderBottom: "1px solid var(--rule)" }}>
                <div>
                  <div style={{ fontFamily: "var(--mono)", fontSize: 9, letterSpacing: "1.5px", textTransform: "uppercase", color: "var(--ink-muted)", marginBottom: 4 }}>
                    Revenue
                  </div>
                  <div style={{ fontFamily: "var(--serif)", fontSize: 20, fontWeight: 500, color: "var(--ink)" }}>
                    {v.revenueGenerated > 0
                      ? `$${v.revenueGenerated >= 1000 ? (v.revenueGenerated / 1000).toFixed(1) + "k" : v.revenueGenerated}`
                      : "Pre-revenue"}
                  </div>
                  {v.mrr && (
                    <div style={{ fontFamily: "var(--mono)", fontSize: 9, color: "var(--ink-faint)", marginTop: 2 }}>
                      ${v.mrr.toLocaleString()} MRR
                    </div>
                  )}
                </div>
                <Sparkline data={v.revenueHistory.filter((_, i) => v.revenueMonths[i] !== "")} />
              </div>

              <div className="venture-meta" style={{ marginBottom: 20 }}>
                <span>
                  <strong>{v.bountiesOpen}</strong>
                  Open bounties
                </span>
                <span>
                  <strong>{v.equityAllocated}%</strong>
                  Equity out
                </span>
                <span>
                  <strong>{v.bountiesCompleted}</strong>
                  Completed
                </span>
              </div>

              <div style={{ display: "flex", gap: 12, marginTop: "auto" }}>
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
