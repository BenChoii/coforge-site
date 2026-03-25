"use client";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Nav } from "@/app/components/nav";
import {
  VENTURES,
  LIFECYCLE_STAGES,
  STAGE_COLORS,
  type Venture,
  type LifecycleStage,
} from "@/lib/ventures-data";

// ─── Revenue chart ────────────────────────────────────────────────────────────

function RevenueChart({ venture }: { venture: Venture }) {
  const data = venture.revenueHistory.filter((_, i) => venture.revenueMonths[i] !== "");
  const months = venture.revenueMonths.filter(m => m !== "");
  const W = 680, H = 200, padL = 60, padB = 32, padT = 16, padR = 16;
  const innerW = W - padL - padR;
  const innerH = H - padB - padT;
  const maxVal = Math.max(...data, 1);
  const hasRevenue = data.some(v => v > 0);

  function toX(i: number) { return padL + (i / (data.length - 1)) * innerW; }
  function toY(v: number) { return padT + innerH - (v / maxVal) * innerH; }

  const pts = data.map((v, i) => `${toX(i)},${toY(v)}`).join(" L ");
  const area = `M ${padL},${padT + innerH} L ${pts} L ${toX(data.length - 1)},${padT + innerH} Z`;
  const line = `M ${pts}`;

  // Y axis tick values
  const yTicks = [0, 0.25, 0.5, 0.75, 1].map(t => Math.round(maxVal * t));

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      style={{ width: "100%", maxWidth: W, display: "block" }}
      aria-label="Revenue over time"
    >
      <defs>
        <linearGradient id={`rg-${venture.id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--ink)" stopOpacity={hasRevenue ? 0.12 : 0} />
          <stop offset="100%" stopColor="var(--ink)" stopOpacity={0} />
        </linearGradient>
      </defs>

      {/* Grid lines */}
      {yTicks.map((v, i) => {
        const y = toY(v);
        return (
          <g key={i}>
            <line x1={padL} y1={y} x2={W - padR} y2={y} stroke="var(--rule)" strokeWidth={1} />
            <text
              x={padL - 8}
              y={y + 4}
              textAnchor="end"
              fontFamily="var(--mono)"
              fontSize={9}
              fill="var(--ink-faint)"
            >
              {v === 0 ? "$0" : v >= 1000 ? `$${(v / 1000).toFixed(0)}k` : `$${v}`}
            </text>
          </g>
        );
      })}

      {/* X axis month labels */}
      {months.map((m, i) => (
        <text
          key={i}
          x={toX(i)}
          y={H - 8}
          textAnchor="middle"
          fontFamily="var(--mono)"
          fontSize={9}
          fill="var(--ink-faint)"
        >
          {m}
        </text>
      ))}

      {/* Area fill */}
      {hasRevenue && <path d={area} fill={`url(#rg-${venture.id})`} />}

      {/* Line */}
      {hasRevenue ? (
        <path d={line} fill="none" stroke="var(--ink)" strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
      ) : (
        <line
          x1={padL} y1={padT + innerH}
          x2={W - padR} y2={padT + innerH}
          stroke="var(--rule)" strokeWidth={1.5} strokeDasharray="4 4"
        />
      )}

      {/* Data points */}
      {hasRevenue && data.map((v, i) => v > 0 && (
        <circle key={i} cx={toX(i)} cy={toY(v)} r={3} fill="var(--ink)" />
      ))}

      {/* Latest value callout */}
      {hasRevenue && (() => {
        const last = data[data.length - 1];
        const x = toX(data.length - 1);
        const y = toY(last);
        const label = last >= 1000 ? `$${(last / 1000).toFixed(1)}k` : `$${last}`;
        return (
          <g>
            <rect x={x - 26} y={y - 22} width={52} height={16} fill="var(--ink)" rx={2} />
            <text x={x} y={y - 11} textAnchor="middle" fontFamily="var(--mono)" fontSize={9} fill="var(--paper)">{label}</text>
          </g>
        );
      })()}
    </svg>
  );
}

// ─── Sparkline (small) ───────────────────────────────────────────────────────

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

// ─── Lifecycle tracker ────────────────────────────────────────────────────────

function LifecycleTracker({ current }: { current: LifecycleStage }) {
  const currentIdx = LIFECYCLE_STAGES.findIndex(s => s.key === current);
  return (
    <div style={{ marginBottom: 48 }}>
      <div style={{ fontFamily: "var(--mono)", fontSize: 10, letterSpacing: "3px", textTransform: "uppercase", color: "var(--ink-muted)", marginBottom: 20 }}>
        Venture Stage
      </div>
      <div style={{ display: "flex", gap: 0, position: "relative" }}>
        {/* connector line */}
        <div style={{ position: "absolute", top: 16, left: 16, right: 16, height: 1, background: "var(--rule)", zIndex: 0 }} />
        {LIFECYCLE_STAGES.map((stage, i) => {
          const isPast = i < currentIdx;
          const isCurrent = i === currentIdx;
          const isFuture = i > currentIdx;
          return (
            <div key={stage.key} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 10, zIndex: 1, cursor: "default" }}>
              <div
                title={stage.description}
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: "50%",
                  background: isCurrent ? "var(--ink)" : isPast ? STAGE_COLORS[stage.key] : "var(--cream)",
                  border: isFuture ? "1px solid var(--rule)" : isCurrent ? "none" : `2px solid ${STAGE_COLORS[stage.key]}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "all 0.3s",
                }}
              >
                {isPast && (
                  <svg width={12} height={12} viewBox="0 0 12 12">
                    <path d="M2 6l3 3 5-5" stroke="white" strokeWidth={1.5} fill="none" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
                {isCurrent && (
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--paper)" }} />
                )}
              </div>
              <div style={{ textAlign: "center" }}>
                <div style={{
                  fontFamily: "var(--mono)",
                  fontSize: 9,
                  letterSpacing: "1px",
                  textTransform: "uppercase",
                  color: isCurrent ? "var(--ink)" : isFuture ? "var(--ink-whisper)" : "var(--ink-muted)",
                  fontWeight: isCurrent ? 600 : 400,
                  lineHeight: 1.3,
                }}>
                  {stage.label}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function VentureDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const venture = VENTURES.find(v => v.id === id);

  if (!venture) {
    return (
      <>
        <Nav active="ventures" />
        <div className="frame" style={{ paddingTop: 80, textAlign: "center" }}>
          <div style={{ fontFamily: "var(--mono)", fontSize: 10, letterSpacing: "2px", color: "var(--ink-faint)", marginBottom: 24, textTransform: "uppercase" }}>404</div>
          <h1 style={{ fontFamily: "var(--serif)", fontSize: 28, marginBottom: 16 }}>Venture not found.</h1>
          <Link href="/ventures" style={{ fontFamily: "var(--mono)", fontSize: 11, color: "var(--red)", textDecoration: "none", letterSpacing: "1px" }}>← All Ventures</Link>
        </div>
      </>
    );
  }

  const stageColor = STAGE_COLORS[venture.stage];
  const stageDef = LIFECYCLE_STAGES.find(s => s.key === venture.stage)!;
  const openBounties = venture.bounties.filter(b => b.status === "open");
  const completedBounties = venture.bounties.filter(b => b.status === "completed");

  return (
    <>
      <Nav active="ventures" />

      <div className="frame" style={{ paddingTop: 52, paddingBottom: 80 }}>
        {/* Back link */}
        <Link
          href="/ventures"
          style={{ fontFamily: "var(--mono)", fontSize: 10, letterSpacing: "1.5px", textTransform: "uppercase", color: "var(--ink-muted)", textDecoration: "none", marginBottom: 40, display: "inline-block" }}
        >
          ← All Ventures
        </Link>

        {/* Header */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 280px", gap: 48, alignItems: "start", marginTop: 24, marginBottom: 48 }}>
          <div>
            {/* Stage badge */}
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
              <div style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "4px 12px",
                background: stageColor + "18",
                border: `1px solid ${stageColor}40`,
                fontFamily: "var(--mono)",
                fontSize: 9,
                letterSpacing: "1.5px",
                textTransform: "uppercase",
                color: stageColor,
              }}>
                <div style={{ width: 6, height: 6, borderRadius: "50%", background: stageColor }} />
                {stageDef.label}
              </div>
              <div style={{ fontFamily: "var(--mono)", fontSize: 9, color: "var(--ink-faint)", letterSpacing: "0.5px" }}>
                {stageDef.description}
              </div>
            </div>

            <h1 style={{ fontFamily: "var(--serif)", fontSize: "clamp(32px, 4vw, 52px)", lineHeight: 1.1, letterSpacing: "-1px", marginBottom: 12 }}>
              {venture.name}
            </h1>
            <p style={{ fontSize: 16, color: "var(--ink-soft)", lineHeight: 1.6, fontWeight: 300, maxWidth: 560, marginBottom: 20 }}>
              {venture.tagline}
            </p>

            <div className="bounty-tags-list" style={{ marginBottom: 0 }}>
              {venture.tags.map(t => <span key={t} className="tag">{t}</span>)}
            </div>
          </div>

          {/* Key stats sidebar */}
          <div style={{ background: "var(--paper)", border: "1px solid var(--rule)", padding: 28, position: "sticky", top: 80 }}>
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: stageColor }} />
            <div style={{ fontFamily: "var(--mono)", fontSize: 9, letterSpacing: "3px", textTransform: "uppercase", color: "var(--ink-muted)", marginBottom: 20 }}>
              At a Glance
            </div>
            {[
              { label: "Founded", value: venture.foundedAt },
              { label: "Revenue", value: venture.revenueGenerated > 0 ? `$${venture.revenueGenerated.toLocaleString()}` : "Pre-revenue" },
              { label: "MRR", value: venture.mrr ? `$${venture.mrr.toLocaleString()}` : "—" },
              { label: "Customers", value: venture.customers ? `${venture.customers}` : "—" },
              { label: "Equity allocated", value: `${venture.equityAllocated}%` },
              { label: "Open bounties", value: `${venture.bountiesOpen}` },
              { label: "Token", value: venture.tokenSymbol ?? "—" },
            ].map(({ label, value }) => (
              <div key={label} style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", padding: "10px 0", borderBottom: "1px solid var(--rule)" }}>
                <span style={{ fontFamily: "var(--mono)", fontSize: 9, letterSpacing: "1px", color: "var(--ink-muted)", textTransform: "uppercase" }}>{label}</span>
                <span style={{ fontFamily: "var(--mono)", fontSize: 12, color: "var(--ink)", fontWeight: 500 }}>{value}</span>
              </div>
            ))}

            {venture.websiteUrl && (
              <a href={venture.websiteUrl} target="_blank" rel="noopener noreferrer" style={{ display: "block", marginTop: 20, textAlign: "center", fontFamily: "var(--mono)", fontSize: 10, color: "var(--ink-muted)", letterSpacing: "1px", textDecoration: "none" }}>
                Visit website →
              </a>
            )}
          </div>
        </div>

        {/* Lifecycle tracker */}
        <LifecycleTracker current={venture.stage} />

        {/* Revenue chart */}
        <div style={{ background: "var(--paper)", border: "1px solid var(--rule)", padding: 32, marginBottom: 48 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
            <div>
              <div style={{ fontFamily: "var(--mono)", fontSize: 10, letterSpacing: "3px", textTransform: "uppercase", color: "var(--ink-muted)", marginBottom: 6 }}>
                Revenue Trajectory
              </div>
              <div style={{ fontFamily: "var(--serif)", fontSize: 28, fontWeight: 500 }}>
                {venture.revenueGenerated > 0
                  ? `$${venture.revenueGenerated.toLocaleString()}`
                  : "Pre-revenue"}
              </div>
              {venture.mrr && (
                <div style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--ink-muted)", marginTop: 4 }}>
                  ${venture.mrr.toLocaleString()} MRR
                </div>
              )}
            </div>
            {venture.revenueGenerated === 0 && (
              <div style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--ink-faint)", letterSpacing: "1px", alignSelf: "center" }}>
                Revenue begins at Early Revenue stage
              </div>
            )}
          </div>
          <RevenueChart venture={venture} />
        </div>

        {/* About */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 48, marginBottom: 48 }}>
          <div>
            <div style={{ fontFamily: "var(--mono)", fontSize: 10, letterSpacing: "3px", textTransform: "uppercase", color: "var(--ink-muted)", marginBottom: 16 }}>
              About
            </div>
            <p style={{ fontSize: 14, color: "var(--ink-soft)", lineHeight: 1.8 }}>
              {venture.description}
            </p>
          </div>

          {/* Team */}
          <div>
            <div style={{ fontFamily: "var(--mono)", fontSize: 10, letterSpacing: "3px", textTransform: "uppercase", color: "var(--ink-muted)", marginBottom: 16 }}>
              Team
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 0, border: "1px solid var(--rule)", background: "var(--paper)" }}>
              {venture.team.map((member, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 20px", borderBottom: i < venture.team.length - 1 ? "1px solid var(--rule)" : "none" }}>
                  <div>
                    <div style={{ fontFamily: "var(--serif)", fontSize: 14, marginBottom: 2 }}>{member.name}</div>
                    <div style={{ fontFamily: "var(--mono)", fontSize: 9, color: "var(--ink-muted)", letterSpacing: "0.5px" }}>{member.role}</div>
                  </div>
                  <div style={{
                    fontFamily: "var(--mono)",
                    fontSize: 8,
                    letterSpacing: "1px",
                    textTransform: "uppercase",
                    padding: "3px 8px",
                    border: "1px solid var(--rule)",
                    color: member.type === "agent" ? "var(--red)" : "var(--ink-muted)",
                  }}>
                    {member.type === "agent" ? "AI Agent" : member.type}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bounties */}
        <div style={{ marginBottom: 48 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <div style={{ fontFamily: "var(--mono)", fontSize: 10, letterSpacing: "3px", textTransform: "uppercase", color: "var(--ink-muted)" }}>
              Bounties — {openBounties.length} open · {completedBounties.length} completed
            </div>
            <Link href={`/bounties?venture=${venture.id}`} style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--red)", textDecoration: "none", letterSpacing: "1px" }}>
              View all →
            </Link>
          </div>

          <div style={{ border: "1px solid var(--rule)", background: "var(--paper)" }}>
            {venture.bounties.map((bounty, i) => (
              <div
                key={bounty.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "16px 24px",
                  borderBottom: i < venture.bounties.length - 1 ? "1px solid var(--rule)" : "none",
                  gap: 16,
                  opacity: bounty.status === "completed" ? 0.6 : 1,
                }}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontFamily: "var(--serif)", fontSize: 14, color: "var(--ink)", marginBottom: 4, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {bounty.status === "completed" && <span style={{ color: "var(--ink-faint)", marginRight: 8 }}>✓</span>}
                    {bounty.title}
                  </div>
                  <div className="bounty-tags-list" style={{ gap: 6 }}>
                    {bounty.tags.map(t => <span key={t} className="tag" style={{ fontSize: 9 }}>{t}</span>)}
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 20, flexShrink: 0 }}>
                  <div style={{ fontFamily: "var(--mono)", fontSize: 14, fontWeight: 500, color: bounty.status === "open" ? "var(--red)" : "var(--ink-faint)" }}>
                    {bounty.equity}%
                  </div>
                  {bounty.status === "open" ? (
                    <Link href={`/bounties/${bounty.id}`} className="claim-btn" style={{ fontSize: 10, padding: "6px 14px" }}>
                      Claim
                    </Link>
                  ) : (
                    <span style={{ fontFamily: "var(--mono)", fontSize: 9, color: "var(--ink-faint)", letterSpacing: "1px", textTransform: "uppercase" }}>
                      {bounty.status}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Token section */}
        {venture.tokenSymbol && (
          <div style={{ background: "var(--ink)", padding: 32, marginBottom: 48 }}>
            <div style={{ fontFamily: "var(--mono)", fontSize: 10, letterSpacing: "3px", textTransform: "uppercase", color: "#7A766C", marginBottom: 20 }}>
              Token
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 32 }}>
              {[
                { label: "Symbol", value: `$${venture.tokenSymbol}` },
                { label: "Total Supply", value: venture.tokenSupply ? `${(venture.tokenSupply / 1_000_000).toFixed(0)}M` : "—" },
                { label: "Network", value: "Solana" },
              ].map(({ label, value }) => (
                <div key={label}>
                  <div style={{ fontFamily: "var(--mono)", fontSize: 9, letterSpacing: "2px", textTransform: "uppercase", color: "#5A564D", marginBottom: 8 }}>{label}</div>
                  <div style={{ fontFamily: "var(--mono)", fontSize: 22, color: "#F6F3ED", fontWeight: 500 }}>{value}</div>
                </div>
              ))}
            </div>
            <p style={{ fontFamily: "var(--mono)", fontSize: 11, color: "#5A564D", marginTop: 24, lineHeight: 1.6 }}>
              Equity contributors receive ${venture.tokenSymbol} tokens representing their stake. Tokens vest on Solana mainnet upon bounty approval and are non-transferable for 6 months.
            </p>
          </div>
        )}

        {/* CTA */}
        <div style={{ borderTop: "3px solid var(--ink)", paddingTop: 40, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontFamily: "var(--serif)", fontSize: 22, marginBottom: 8 }}>Ready to build?</div>
            <p style={{ fontSize: 13, color: "var(--ink-muted)", fontWeight: 300 }}>Claim a bounty and earn equity in {venture.name}.</p>
          </div>
          <div style={{ display: "flex", gap: 12 }}>
            <Link href={`/bounties?venture=${venture.id}`} className="claim-btn">
              Browse bounties
            </Link>
            <Link
              href="/scaffold"
              style={{ fontFamily: "var(--mono)", fontSize: 10, letterSpacing: "1.5px", textTransform: "uppercase", color: "var(--ink-muted)", textDecoration: "none", alignSelf: "center" }}
            >
              Post a venture →
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
