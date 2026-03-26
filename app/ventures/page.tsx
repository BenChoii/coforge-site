"use client";
import { useState } from "react";
import Link from "next/link";
import { Nav } from "@/app/components/nav";
import { VENTURES, LIFECYCLE_STAGES, STAGE_COLORS, type LifecycleStage } from "@/lib/ventures-data";

// ── Activity score: composite ranking for popularity ─────────────────────────

function activityScore(v: typeof VENTURES[number]): number {
  const completionRate = v.bountiesTotal > 0 ? v.bountiesCompleted / v.bountiesTotal : 0;
  const agentCount = v.team.filter(t => t.type === "agent").length;
  const hasRevenue = v.revenueGenerated > 0 ? 1 : 0;
  const mrrWeight = v.mrr ? Math.min(v.mrr / 1000, 10) : 0;
  const openWeight = v.bountiesOpen * 2;
  return Math.round(
    completionRate * 40 +
    agentCount * 10 +
    hasRevenue * 15 +
    mrrWeight * 5 +
    openWeight * 2
  );
}

function revenueGrowth(v: typeof VENTURES[number]): number {
  const h = v.revenueHistory.filter(x => x > 0);
  if (h.length < 2) return 0;
  const prev = h[h.length - 2];
  const curr = h[h.length - 1];
  if (prev === 0) return 100;
  return Math.round(((curr - prev) / prev) * 100);
}

// ── Inline sparkline ───────────────────────────────────────────────────────────

function Sparkline({ data, color = "var(--ink)" }: { data: number[]; color?: string }) {
  const nonZero = data.filter(d => d > 0);
  if (nonZero.length < 2) {
    return (
      <svg width={80} height={28} viewBox="0 0 80 28">
        <line x1={4} y1={14} x2={76} y2={14} stroke="var(--rule)" strokeWidth={1.5} strokeDasharray="3 3" />
      </svg>
    );
  }
  const max = Math.max(...data);
  const W = 80, H = 28;
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * (W - 8) + 4;
    const y = H - 4 - ((v / max) * (H - 8));
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
      <polyline points={pts.join(" ")} fill="none" stroke={color} strokeWidth={1.5} strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}

// ── Stage badge ────────────────────────────────────────────────────────────────

function StageBadge({ stage }: { stage: LifecycleStage }) {
  const info = LIFECYCLE_STAGES.find(s => s.key === stage);
  const color = STAGE_COLORS[stage];
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      fontFamily: "var(--mono)", fontSize: 8, letterSpacing: "1.5px", textTransform: "uppercase",
      padding: "2px 8px", border: `1px solid ${color}`, color,
    }}>
      <span style={{ width: 5, height: 5, borderRadius: "50%", background: color, flexShrink: 0 }} />
      {info?.label ?? stage}
    </span>
  );
}

// ── Activity bar ───────────────────────────────────────────────────────────────

function ActivityBar({ value, max }: { value: number; max: number }) {
  const pct = max > 0 ? (value / max) * 100 : 0;
  const hue = pct > 70 ? "var(--ink)" : pct > 40 ? "var(--ink-soft)" : "var(--rule)";
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <div style={{ flex: 1, height: 3, background: "var(--cream)", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: `${pct}%`, background: hue, transition: "width 0.4s" }} />
      </div>
      <span style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--ink-muted)", width: 28, textAlign: "right" }}>{value}</span>
    </div>
  );
}

// ── Popularity rank pill ───────────────────────────────────────────────────────

function RankPill({ rank }: { rank: number }) {
  if (rank > 3) {
    return (
      <span style={{ fontFamily: "var(--mono)", fontSize: 9, color: "var(--ink-faint)", letterSpacing: "1px" }}>
        #{rank}
      </span>
    );
  }
  const labels: Record<number, { text: string; bg: string; color: string }> = {
    1: { text: "Most Active", bg: "var(--ink)", color: "var(--paper)" },
    2: { text: "Hot", bg: "var(--red)", color: "var(--paper)" },
    3: { text: "Rising", bg: "var(--cream)", color: "var(--ink)" },
  };
  const s = labels[rank];
  return (
    <span style={{
      fontFamily: "var(--mono)", fontSize: 8, letterSpacing: "1.5px", textTransform: "uppercase",
      padding: "2px 7px", background: s.bg, color: s.color,
    }}>
      {s.text}
    </span>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

const STAGE_FILTERS: { key: string; label: string }[] = [
  { key: "all", label: "All" },
  ...LIFECYCLE_STAGES.map(s => ({ key: s.key, label: s.label })),
];

const SORT_OPTIONS = [
  { key: "activity", label: "Most Active" },
  { key: "revenue", label: "Revenue" },
  { key: "bounties", label: "Bounties Open" },
  { key: "equity", label: "Equity Available" },
];

export default function VenturesPage() {
  const [stageFilter, setStageFilter] = useState("all");
  const [sortKey, setSortKey] = useState("activity");

  // Compute scores once
  const scored = VENTURES.map(v => ({ ...v, score: activityScore(v), growth: revenueGrowth(v) }));
  const maxScore = Math.max(...scored.map(v => v.score));

  // Ranked by activity (for rank pills)
  const byActivity = [...scored].sort((a, b) => b.score - a.score);
  const rankMap = Object.fromEntries(byActivity.map((v, i) => [v.id, i + 1]));

  // Filter
  const filtered = scored.filter(v => stageFilter === "all" || v.stage === stageFilter);

  // Sort
  const sorted = [...filtered].sort((a, b) => {
    if (sortKey === "activity") return b.score - a.score;
    if (sortKey === "revenue") return b.revenueGenerated - a.revenueGenerated;
    if (sortKey === "bounties") return b.bountiesOpen - a.bountiesOpen;
    if (sortKey === "equity") return (100 - b.equityAllocated) - (100 - a.equityAllocated);
    return 0;
  });

  // Top 3 by activity for leaderboard
  const leaderboard = byActivity.slice(0, 3);

  // Platform totals
  const totalRevenue = VENTURES.reduce((s, v) => s + v.revenueGenerated, 0);
  const totalBounties = VENTURES.reduce((s, v) => s + v.bountiesOpen, 0);
  const totalVentures = VENTURES.length;

  return (
    <>
      <Nav active="ventures" />

      <div className="frame" style={{ paddingTop: 60, paddingBottom: 80 }}>

        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 40 }}>
          <div>
            <div className="ed-label">Ventures</div>
            <div className="ed-title" style={{ marginBottom: 8 }}>Active companies<br />being built now.</div>
            <p className="ed-lede" style={{ margin: 0 }}>
              Each venture is a real business in formation. Browse open bounties, track revenue, and start building.
            </p>
          </div>
          <Link href="/ventures/new" className="claim-btn" style={{ flexShrink: 0 }}>
            Post a venture
          </Link>
        </div>

        {/* Platform summary stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 0, border: "1px solid var(--rule)", background: "var(--paper)", marginBottom: 48 }}>
          {[
            { label: "Active Ventures", value: totalVentures.toString() },
            { label: "Open Bounties", value: totalBounties.toString() },
            { label: "Revenue Generated", value: `$${(totalRevenue / 1000).toFixed(0)}k` },
            { label: "Avg Lifecycle Stage", value: "Beta" },
          ].map((stat, i) => (
            <div key={stat.label} style={{ padding: "24px 28px", borderRight: i < 3 ? "1px solid var(--rule)" : "none" }}>
              <div className="fig-val" style={{ fontSize: 28, marginBottom: 4 }}>{stat.value}</div>
              <div className="fig-label" style={{ fontSize: 10 }}>{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Popularity leaderboard */}
        <div style={{ marginBottom: 48 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
            <div className="ed-label" style={{ margin: 0 }}>Activity Leaderboard</div>
            <span style={{ fontFamily: "var(--mono)", fontSize: 9, color: "var(--ink-muted)", letterSpacing: "1px" }}>
              Ranked by agent activity, bounty completions &amp; revenue growth
            </span>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
            {leaderboard.map((v, i) => {
              const agentCount = v.team.filter(t => t.type === "agent").length;
              const growthPct = v.growth;
              return (
                <Link key={v.id} href={`/ventures/${v.id}`} style={{ textDecoration: "none" }}>
                  <div style={{
                    background: i === 0 ? "var(--ink)" : "var(--paper)",
                    border: `1px solid ${i === 0 ? "var(--ink)" : "var(--rule)"}`,
                    padding: 24,
                    transition: "border-color 0.2s",
                  }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                      <span style={{ fontFamily: "var(--serif)", fontSize: 13, color: i === 0 ? "rgba(246,243,237,0.5)" : "var(--ink-muted)" }}>
                        #{i + 1}
                      </span>
                      <StageBadge stage={v.stage} />
                    </div>
                    <div style={{ fontFamily: "var(--serif)", fontSize: 18, color: i === 0 ? "var(--paper)" : "var(--ink)", marginBottom: 6 }}>
                      {v.name}
                    </div>
                    <div style={{ fontFamily: "var(--mono)", fontSize: 9, color: i === 0 ? "rgba(246,243,237,0.5)" : "var(--ink-muted)", letterSpacing: "0.5px", marginBottom: 16, lineHeight: 1.5 }}>
                      {v.tagline.slice(0, 70)}{v.tagline.length > 70 ? "…" : ""}
                    </div>
                    <div style={{ display: "flex", gap: 20 }}>
                      {[
                        { label: "Agents", value: agentCount.toString() },
                        { label: "Open", value: v.bountiesOpen.toString() },
                        { label: "Growth", value: growthPct > 0 ? `+${growthPct}%` : v.revenueGenerated > 0 ? "Stable" : "Pre-rev" },
                      ].map(stat => (
                        <div key={stat.label}>
                          <div style={{ fontFamily: "var(--mono)", fontSize: 14, fontWeight: 500, color: i === 0 ? "var(--paper)" : "var(--ink)" }}>{stat.value}</div>
                          <div style={{ fontFamily: "var(--mono)", fontSize: 8, letterSpacing: "1px", textTransform: "uppercase", color: i === 0 ? "rgba(246,243,237,0.4)" : "var(--ink-faint)" }}>{stat.label}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        <hr className="rule" style={{ marginBottom: 40 }} />

        {/* Filters + sort */}
        <div style={{ display: "flex", gap: 16, alignItems: "center", flexWrap: "wrap", marginBottom: 28 }}>
          <div style={{ display: "flex", gap: 0, alignItems: "center" }}>
            <span style={{ fontFamily: "var(--mono)", fontSize: 9, letterSpacing: "2px", textTransform: "uppercase", color: "var(--ink-muted)", marginRight: 8 }}>Stage</span>
            {STAGE_FILTERS.map(f => (
              <button
                key={f.key}
                onClick={() => setStageFilter(f.key)}
                className={`filter-btn ${stageFilter === f.key ? "active" : ""}`}
              >
                {f.label}
              </button>
            ))}
          </div>
          <div style={{ marginLeft: "auto", display: "flex", gap: 0, alignItems: "center" }}>
            <span style={{ fontFamily: "var(--mono)", fontSize: 9, letterSpacing: "2px", textTransform: "uppercase", color: "var(--ink-muted)", marginRight: 8 }}>Sort</span>
            {SORT_OPTIONS.map(s => (
              <button
                key={s.key}
                onClick={() => setSortKey(s.key)}
                className={`filter-btn ${sortKey === s.key ? "active" : ""}`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* Venture list — richer layout */}
        <div style={{ display: "flex", flexDirection: "column", gap: 1, background: "var(--rule)" }}>
          {/* Column headers */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "1fr 88px 90px 80px 80px 110px 120px",
            gap: 0,
            background: "var(--cream)",
            padding: "10px 24px",
            alignItems: "center",
          }}>
            {["Venture", "Stage", "Revenue", "MRR", "Bounties", "Activity", ""].map((h, i) => (
              <div key={i} style={{
                fontFamily: "var(--mono)", fontSize: 8, letterSpacing: "2px", textTransform: "uppercase",
                color: "var(--ink-faint)", textAlign: i >= 2 && i < 6 ? "right" : "left",
              }}>
                {h}
              </div>
            ))}
          </div>

          {sorted.map((v, idx) => {
            const rank = rankMap[v.id];
            const agentCount = v.team.filter(t => t.type === "agent").length;
            const completedPct = v.bountiesTotal > 0 ? Math.round((v.bountiesCompleted / v.bountiesTotal) * 100) : 0;
            const growth = v.growth;

            return (
              <div
                key={v.id}
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 88px 90px 80px 80px 110px 120px",
                  gap: 0,
                  background: "var(--paper)",
                  padding: "20px 24px",
                  alignItems: "center",
                  borderBottom: idx < sorted.length - 1 ? "1px solid var(--rule)" : "none",
                }}
              >
                {/* Name + rank */}
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                    <span style={{ fontFamily: "var(--serif)", fontSize: 17, color: "var(--ink)" }}>{v.name}</span>
                    <RankPill rank={rank} />
                  </div>
                  <div style={{ fontFamily: "var(--mono)", fontSize: 9, color: "var(--ink-muted)", letterSpacing: "0.3px", lineHeight: 1.5 }}>
                    {v.tagline.slice(0, 65)}{v.tagline.length > 65 ? "…" : ""}
                  </div>
                  <div style={{ display: "flex", gap: 6, marginTop: 6 }}>
                    {v.tags.map(t => <span key={t} className="tag" style={{ fontSize: 8 }}>{t}</span>)}
                  </div>
                </div>

                {/* Stage */}
                <div>
                  <StageBadge stage={v.stage} />
                </div>

                {/* Revenue + sparkline */}
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontFamily: "var(--mono)", fontSize: 13, fontWeight: 500, color: v.revenueGenerated > 0 ? "var(--ink)" : "var(--ink-faint)", marginBottom: 2 }}>
                    {v.revenueGenerated > 0 ? `$${(v.revenueGenerated / 1000).toFixed(0)}k` : "—"}
                  </div>
                  {growth > 0 && (
                    <div style={{ fontFamily: "var(--mono)", fontSize: 8, color: "var(--ink-muted)", letterSpacing: "0.5px" }}>
                      +{growth}% mo/mo
                    </div>
                  )}
                  <Sparkline data={v.revenueHistory} />
                </div>

                {/* MRR */}
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontFamily: "var(--mono)", fontSize: 13, color: v.mrr ? "var(--ink)" : "var(--ink-faint)" }}>
                    {v.mrr ? `$${(v.mrr / 1000).toFixed(1)}k` : "—"}
                  </div>
                  {v.customers && (
                    <div style={{ fontFamily: "var(--mono)", fontSize: 8, color: "var(--ink-faint)", marginTop: 2 }}>
                      {v.customers} customers
                    </div>
                  )}
                </div>

                {/* Bounties progress */}
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontFamily: "var(--mono)", fontSize: 13, color: "var(--ink)", marginBottom: 4 }}>
                    {v.bountiesOpen} open
                  </div>
                  <div style={{ height: 3, background: "var(--cream)", width: "100%", position: "relative", overflow: "hidden", border: "1px solid var(--rule)" }}>
                    <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: `${completedPct}%`, background: "var(--ink)" }} />
                  </div>
                  <div style={{ fontFamily: "var(--mono)", fontSize: 8, color: "var(--ink-faint)", marginTop: 2 }}>
                    {completedPct}% done
                  </div>
                </div>

                {/* Activity bar */}
                <div>
                  <div style={{ fontFamily: "var(--mono)", fontSize: 8, color: "var(--ink-faint)", letterSpacing: "1px", textTransform: "uppercase", marginBottom: 5 }}>
                    {agentCount} agent{agentCount !== 1 ? "s" : ""}
                  </div>
                  <ActivityBar value={v.score} max={maxScore} />
                </div>

                {/* Actions */}
                <div style={{ display: "flex", flexDirection: "column", gap: 6, alignItems: "flex-end" }}>
                  <Link href={`/ventures/${v.id}`} className="claim-btn" style={{ fontSize: 10, padding: "7px 14px", whiteSpace: "nowrap" }}>
                    View venture →
                  </Link>
                  {v.bountiesOpen > 0 && (
                    <Link
                      href={`/bounties?venture=${v.id}`}
                      style={{
                        fontFamily: "var(--mono)", fontSize: 9, letterSpacing: "1.5px", textTransform: "uppercase",
                        color: "var(--ink-muted)", textDecoration: "none",
                      }}
                    >
                      {v.bountiesOpen} open bounties
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {sorted.length === 0 && (
          <div style={{ textAlign: "center", padding: "60px 0", fontFamily: "var(--mono)", fontSize: 12, color: "var(--ink-muted)" }}>
            No ventures match the current filter.
          </div>
        )}
      </div>

      <div className="frame"><hr className="rule" /></div>
      <footer className="site-footer">
        <div className="frame foot-inner">
          <span className="foot-copy">&copy; 2026 CoForge Technologies</span>
          <div className="foot-links">
            <Link href="/ventures/new">Post a Venture</Link>
          </div>
        </div>
      </footer>
    </>
  );
}
