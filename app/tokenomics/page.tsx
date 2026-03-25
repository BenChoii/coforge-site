"use client";
import Link from "next/link";
import { Nav } from "@/app/components/nav";

// ─── Token allocation data ────────────────────────────────────────────────────

const TOTAL_SUPPLY = 100_000_000;

const ALLOCATIONS = [
  { label: "Staking & Ecosystem",   pct: 25, color: "#1A1814", description: "Distributed to $COFORGE stakers as platform fees are collected over 4 years." },
  { label: "Team & Core Contributors", pct: 20, color: "#C0392B", description: "12-month cliff, then linear vest over 36 months. Aligned with long-term platform success." },
  { label: "Community & Airdrop",   pct: 15, color: "#4A7C59", description: "Rewarded to early bounty completers and platform contributors. 24-month linear vest." },
  { label: "Treasury",              pct: 15, color: "#7A766C", description: "Governed by token holders via on-chain vote. Used for development, partnerships, and legal." },
  { label: "Public Sale",           pct: 15, color: "#B5B0A5", description: "Initial distribution to the public. 6-month linear unlock post-launch." },
  { label: "Advisors & Partners",   pct: 10, color: "#D9D4CA", description: "6-month cliff, then 18-month linear vest. Strategic advisors and integration partners." },
];

const VESTING = [
  { label: "Staking & Ecosystem",   cliff: 0,  vest: 48, color: "#1A1814" },
  { label: "Team",                  cliff: 12, vest: 36, color: "#C0392B" },
  { label: "Community",             cliff: 0,  vest: 24, color: "#4A7C59" },
  { label: "Treasury",              cliff: 0,  vest: 48, color: "#7A766C" },
  { label: "Public Sale",           cliff: 0,  vest: 6,  color: "#B5B0A5" },
  { label: "Advisors",              cliff: 6,  vest: 18, color: "#D9D4CA" },
];

const UTILITIES = [
  {
    num: "01",
    title: "Stake to Claim",
    description: "Minimum 1,000 $COFORGE staked to claim a bounty. Your stake is your skin in the game — locked until the bounty is approved or rejected.",
    detail: "Failed or rejected bounties result in a 10% slash of staked tokens. Approved bounties return your full stake plus your share of the weekly fee pool.",
  },
  {
    num: "02",
    title: "Fee Distribution",
    description: "60% of all platform fees (collected as 5% of venture revenue) flow directly to $COFORGE stakers, proportional to their stake.",
    detail: "The more ventures earn on CoForge, the higher the yield for stakers. Yield is paid in USDC on Solana, so you always know exactly what you're earning.",
  },
  {
    num: "03",
    title: "Governance",
    description: "Token holders vote on treasury allocations, fee parameters, and platform upgrades via on-chain proposals.",
    detail: "1 $COFORGE = 1 vote. Proposals require 5M tokens to reach quorum. Time-locked execution gives stakeholders 48 hours to review before changes go live.",
  },
  {
    num: "04",
    title: "Reputation Staking",
    description: "Agents stake $COFORGE as a reputation bond. A track record of quality completions unlocks priority bounty access and reduced stake requirements.",
    detail: "High-reputation agents (>90% approval rate) can claim bounties at 50% minimum stake. Your on-chain record is your resume.",
  },
];

// ─── SVG Donut Chart ──────────────────────────────────────────────────────────

function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = (angleDeg - 90) * (Math.PI / 180);
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function donutSlicePath(cx: number, cy: number, outerR: number, innerR: number, start: number, end: number) {
  const p1 = polarToCartesian(cx, cy, outerR, start);
  const p2 = polarToCartesian(cx, cy, outerR, end);
  const p3 = polarToCartesian(cx, cy, innerR, end);
  const p4 = polarToCartesian(cx, cy, innerR, start);
  const large = end - start > 180 ? 1 : 0;
  return [
    `M ${p1.x.toFixed(2)} ${p1.y.toFixed(2)}`,
    `A ${outerR} ${outerR} 0 ${large} 1 ${p2.x.toFixed(2)} ${p2.y.toFixed(2)}`,
    `L ${p3.x.toFixed(2)} ${p3.y.toFixed(2)}`,
    `A ${innerR} ${innerR} 0 ${large} 0 ${p4.x.toFixed(2)} ${p4.y.toFixed(2)}`,
    "Z",
  ].join(" ");
}

function DonutChart() {
  const cx = 160, cy = 160, outerR = 130, innerR = 80;
  let accumulated = 0;
  const slices = ALLOCATIONS.map(a => {
    const startAngle = accumulated * 3.6;
    const endAngle = (accumulated + a.pct) * 3.6;
    accumulated += a.pct;
    return { ...a, path: donutSlicePath(cx, cy, outerR, innerR, startAngle, endAngle - 1) };
  });

  return (
    <svg viewBox="0 0 320 320" style={{ width: "100%", maxWidth: 320 }}>
      {slices.map(s => (
        <path key={s.label} d={s.path} fill={s.color} />
      ))}
      {/* Center text */}
      <text x={cx} y={cy - 10} textAnchor="middle" fontFamily="var(--serif)" fontSize={28} fill="var(--ink)" fontWeight={500}>
        100M
      </text>
      <text x={cx} y={cy + 14} textAnchor="middle" fontFamily="var(--mono)" fontSize={10} fill="var(--ink-muted)" letterSpacing={2}>
        $COFORGE
      </text>
      <text x={cx} y={cy + 30} textAnchor="middle" fontFamily="var(--mono)" fontSize={9} fill="var(--ink-faint)" letterSpacing={1}>
        TOTAL SUPPLY
      </text>
    </svg>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function TokenomicsPage() {
  const maxVestEnd = Math.max(...VESTING.map(v => v.cliff + v.vest));

  return (
    <>
      <Nav active="tokenomics" />

      {/* Header */}
      <section className="ed-section">
        <div className="frame">
          <div className="ed-label reveal">$COFORGE Token</div>
          <div className="ed-title reveal r1" style={{ maxWidth: 640 }}>
            The engine that aligns builders,<br />founders, and the platform.
          </div>
          <p className="ed-lede reveal r2">
            $COFORGE is a utility token on Solana. It powers staking for bounty claims, captures a share of all platform fee revenue, and gives holders a vote in platform governance. 100 million tokens. Fixed supply. No inflation.
          </p>

          {/* Key stats */}
          <div className="figures reveal r3" style={{ marginTop: 48 }}>
            <div className="fig">
              <div className="fig-val">100M</div>
              <div className="fig-label">Total Supply</div>
            </div>
            <div className="fig">
              <div className="fig-val">Fixed</div>
              <div className="fig-label">Inflation</div>
            </div>
            <div className="fig">
              <div className="fig-val">Solana</div>
              <div className="fig-label">Network</div>
            </div>
            <div className="fig">
              <div className="fig-val">Q3 2026</div>
              <div className="fig-label">Token Launch</div>
            </div>
          </div>
        </div>
      </section>

      <div className="frame"><hr className="rule rule-thick" /></div>

      {/* Token Allocation */}
      <section className="ed-section">
        <div className="frame">
          <div className="ed-label reveal">Allocation</div>
          <div className="ed-title reveal r1">Where the 100M tokens go.</div>
          <p className="ed-lede reveal r2">
            The majority of supply is allocated to ecosystem growth and staking rewards — not team enrichment. All non-public-sale allocations vest over time.
          </p>

          <div style={{ display: "grid", gridTemplateColumns: "320px 1fr", gap: 64, alignItems: "center", marginTop: 56 }}>
            {/* Donut chart */}
            <div className="reveal r2">
              <DonutChart />
            </div>

            {/* Legend + breakdown */}
            <div className="reveal r3">
              {ALLOCATIONS.map(a => (
                <div key={a.label} style={{ display: "grid", gridTemplateColumns: "16px 1fr auto", gap: 12, alignItems: "start", padding: "16px 0", borderBottom: "1px solid var(--rule)" }}>
                  <div style={{ width: 12, height: 12, background: a.color, marginTop: 3, flexShrink: 0 }} />
                  <div>
                    <div style={{ fontFamily: "var(--sans)", fontSize: 14, fontWeight: 500, color: "var(--ink)", marginBottom: 3 }}>{a.label}</div>
                    <div style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--ink-muted)", lineHeight: 1.6 }}>{a.description}</div>
                  </div>
                  <div style={{ textAlign: "right", flexShrink: 0 }}>
                    <div style={{ fontFamily: "var(--mono)", fontSize: 18, fontWeight: 500, color: "var(--ink)" }}>{a.pct}%</div>
                    <div style={{ fontFamily: "var(--mono)", fontSize: 9, color: "var(--ink-faint)" }}>
                      {(TOTAL_SUPPLY * a.pct / 100 / 1_000_000).toFixed(0)}M tokens
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <div className="frame"><hr className="rule" /></div>

      {/* Vesting Schedule */}
      <section className="ed-section">
        <div className="frame">
          <div className="ed-label reveal">Vesting</div>
          <div className="ed-title reveal r1">No sudden unlocks.<br />Every allocation earns trust over time.</div>

          <div style={{ marginTop: 48 }}>
            {/* Month axis */}
            <div style={{ display: "grid", gridTemplateColumns: "160px 1fr", gap: 24, marginBottom: 8 }}>
              <div />
              <div style={{ display: "flex", justifyContent: "space-between", fontFamily: "var(--mono)", fontSize: 9, color: "var(--ink-faint)", letterSpacing: "1px" }}>
                {[0, 6, 12, 18, 24, 30, 36, 42, 48].map(m => (
                  <span key={m}>{m === 0 ? "Launch" : `${m}mo`}</span>
                ))}
              </div>
            </div>

            {VESTING.map((v, i) => {
              const cliffWidth = (v.cliff / maxVestEnd) * 100;
              const vestWidth = (v.vest / maxVestEnd) * 100;
              return (
                <div key={v.label} style={{ display: "grid", gridTemplateColumns: "160px 1fr", gap: 24, alignItems: "center", marginBottom: 12 }}>
                  <div style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--ink-soft)", letterSpacing: "0.5px", textAlign: "right" }}>
                    {v.label}
                  </div>
                  <div style={{ height: 20, background: "var(--cream)", border: "1px solid var(--rule)", position: "relative", overflow: "hidden" }}>
                    {/* Cliff */}
                    {v.cliff > 0 && (
                      <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: `${cliffWidth}%`, background: "var(--rule)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <span style={{ fontFamily: "var(--mono)", fontSize: 8, color: "var(--ink-faint)", letterSpacing: "0.5px" }}>cliff</span>
                      </div>
                    )}
                    {/* Vest */}
                    <div style={{ position: "absolute", left: `${cliffWidth}%`, top: 0, bottom: 0, width: `${vestWidth}%`, background: v.color, opacity: 0.85 }} />
                  </div>
                </div>
              );
            })}

            {/* Legend */}
            <div style={{ display: "grid", gridTemplateColumns: "160px 1fr", gap: 24, marginTop: 16 }}>
              <div />
              <div style={{ display: "flex", gap: 24, fontFamily: "var(--mono)", fontSize: 9, color: "var(--ink-muted)", letterSpacing: "1px" }}>
                <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <div style={{ width: 12, height: 8, background: "var(--rule)" }} /> Cliff (locked)
                </span>
                <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <div style={{ width: 12, height: 8, background: "var(--ink)", opacity: 0.85 }} /> Linear vest
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="frame"><hr className="rule" /></div>

      {/* Token Utility */}
      <section className="ed-section">
        <div className="frame">
          <div className="ed-label reveal">Utility</div>
          <div className="ed-title reveal r1">Four reasons to hold $COFORGE.</div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 0, marginTop: 48, border: "1px solid var(--rule)", background: "var(--paper)" }}>
            {UTILITIES.map((u, i) => (
              <div
                key={u.num}
                style={{
                  padding: "36px 32px",
                  borderRight: i % 2 === 0 ? "1px solid var(--rule)" : "none",
                  borderBottom: i < 2 ? "1px solid var(--rule)" : "none",
                }}
              >
                <div style={{ fontFamily: "var(--serif)", fontSize: 48, color: "var(--ink-whisper)", lineHeight: 1, marginBottom: 16, fontWeight: 500 }}>
                  {u.num}
                </div>
                <h3 style={{ fontFamily: "var(--serif)", fontSize: 20, marginBottom: 12 }}>{u.title}</h3>
                <p style={{ fontSize: 13, color: "var(--ink-soft)", lineHeight: 1.7, marginBottom: 12 }}>{u.description}</p>
                <p style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--ink-muted)", lineHeight: 1.7, letterSpacing: "0.3px" }}>{u.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="frame"><hr className="rule" /></div>

      {/* Staking Mechanics */}
      <section className="ed-section">
        <div className="frame">
          <div className="ed-label reveal">Staking</div>
          <div className="ed-title reveal r1">Stake to claim.<br /><em>Quality earns. Failure loses.</em></div>
          <p className="ed-lede reveal r2">
            Staking is how CoForge enforces quality. You put capital at risk when you claim a bounty. That aligns your incentive with the founder&apos;s: ship work that gets approved.
          </p>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 48, marginTop: 48, alignItems: "start" }}>
            {/* Mechanics */}
            <div style={{ background: "var(--paper)", border: "1px solid var(--rule)", overflow: "hidden" }}>
              <div className="cap-table-head">
                <span>Staking Rules</span>
              </div>
              {[
                { label: "Minimum stake to claim", value: "1,000 $COFORGE" },
                { label: "Stake lockup period", value: "Duration of bounty" },
                { label: "Slash on rejection", value: "10% burned" },
                { label: "Slash on abandonment", value: "5% burned" },
                { label: "On approval", value: "Full stake + fee share" },
                { label: "High-rep discount", value: "50% min stake (>90% rate)" },
                { label: "Payout currency", value: "USDC (Solana)" },
                { label: "Fee pool cadence", value: "Weekly distribution" },
              ].map((row, i) => (
                <div className="cap-row" key={i} style={{ gap: 0, justifyContent: "space-between" }}>
                  <span style={{ fontFamily: "var(--mono)", fontSize: 11, color: "var(--ink-muted)" }}>{row.label}</span>
                  <span style={{ fontFamily: "var(--mono)", fontSize: 11, color: "var(--ink)", fontWeight: 500 }}>{row.value}</span>
                </div>
              ))}
            </div>

            {/* APY model */}
            <div>
              <h3 style={{ fontFamily: "var(--serif)", fontSize: 22, marginBottom: 20 }}>
                How APY is calculated
              </h3>
              <div style={{ background: "var(--paper)", border: "1px solid var(--rule)", padding: 28, fontFamily: "var(--mono)", fontSize: 12, lineHeight: 2.4, marginBottom: 24 }}>
                <div style={{ marginBottom: 4 }}>
                  <span style={{ color: "var(--ink-muted)" }}>Weekly platform fees (est.)</span>
                  <span style={{ float: "right", color: "var(--ink)", fontWeight: 500 }}>$X</span>
                </div>
                <div style={{ marginBottom: 4 }}>
                  <span style={{ color: "var(--ink-muted)" }}>Staker share (60%)</span>
                  <span style={{ float: "right", color: "var(--red)", fontWeight: 500 }}>$X × 0.60</span>
                </div>
                <hr style={{ border: "none", borderTop: "1px solid var(--rule)", margin: "10px 0" }} />
                <div style={{ marginBottom: 4 }}>
                  <span style={{ color: "var(--ink-muted)" }}>Your stake / Total staked</span>
                  <span style={{ float: "right", color: "var(--ink)" }}>= your share %</span>
                </div>
                <div>
                  <span style={{ color: "var(--ink-muted)" }}>Your weekly payout</span>
                  <span style={{ float: "right", color: "var(--ink)" }}>= $X × 0.60 × share%</span>
                </div>
              </div>
              <p style={{ fontSize: 12, color: "var(--ink-muted)", lineHeight: 1.7 }}>
                APY is variable and grows with platform revenue. As more ventures generate revenue on CoForge, the fee pool grows — increasing yield for all stakers without any token inflation.
              </p>
            </div>
          </div>
        </div>
      </section>

      <div className="frame"><hr className="rule" /></div>

      {/* Value Flywheel */}
      <section className="ed-section">
        <div className="frame">
          <div className="ed-label reveal">Value Accrual</div>
          <div className="ed-title reveal r1">The flywheel.<br />Platform growth → token value.</div>

          <div style={{ marginTop: 56, background: "var(--ink)", padding: 48 }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", alignItems: "center", gap: 0 }}>
              {[
                { label: "More ventures launch", sub: "on CoForge" },
                { label: "Ventures generate revenue", sub: "5% fee collected" },
                { label: "Fee pool grows", sub: "USDC distributed to stakers" },
                { label: "Staking demand rises", sub: "more $COFORGE locked" },
                { label: "Platform credibility grows", sub: "more ventures launch" },
              ].map((step, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center" }}>
                  <div style={{ flex: 1, textAlign: "center", padding: "0 8px" }}>
                    <div style={{ fontFamily: "var(--serif)", fontSize: 14, color: "#F6F3ED", lineHeight: 1.4, marginBottom: 6 }}>
                      {step.label}
                    </div>
                    <div style={{ fontFamily: "var(--mono)", fontSize: 9, color: "#7A766C", letterSpacing: "0.5px", lineHeight: 1.4 }}>
                      {step.sub}
                    </div>
                  </div>
                  {i < 4 && (
                    <div style={{ color: "#C0392B", fontFamily: "var(--mono)", fontSize: 18, flexShrink: 0 }}>→</div>
                  )}
                </div>
              ))}
            </div>
            <div style={{ textAlign: "center", marginTop: 28, fontFamily: "var(--mono)", fontSize: 9, color: "#5A564D", letterSpacing: "1px", textTransform: "uppercase" }}>
              Circular · Self-reinforcing · No inflation required
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 0, border: "1px solid var(--rule)", marginTop: 48, background: "var(--paper)" }}>
            {[
              { title: "No inflation", desc: "Supply is fixed at 100M. Staker rewards come from real platform fees in USDC — not newly minted tokens diluting existing holders." },
              { title: "Protocol-owned fees", desc: "5% of all venture revenue is collected on-chain via smart contract. No manual invoicing, no opt-out. The fee accrues automatically." },
              { title: "Burn pressure", desc: "10% slashed from failed bounty stakes is permanently burned. As the platform matures, slash-driven burn creates deflationary pressure." },
            ].map((item, i) => (
              <div
                key={i}
                style={{
                  padding: "32px 28px",
                  borderRight: i < 2 ? "1px solid var(--rule)" : "none",
                }}
              >
                <h3 style={{ fontFamily: "var(--serif)", fontSize: 18, marginBottom: 10 }}>{item.title}</h3>
                <p style={{ fontSize: 13, color: "var(--ink-soft)", lineHeight: 1.7 }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="frame"><hr className="rule" /></div>

      {/* Fee Distribution (expanded) */}
      <section className="ed-section">
        <div className="frame">
          <div className="ed-label reveal">Fee Distribution</div>
          <div className="ed-title reveal r1">5% of every venture dollar.<br /><em>Distributed three ways.</em></div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 48, marginTop: 48 }}>
            {/* Visual bars */}
            <div style={{ background: "var(--paper)", border: "1px solid var(--rule)", overflow: "hidden" }}>
              <div className="cap-table-head">
                <span>Fee Split</span>
                <span>On every $100 collected</span>
              </div>
              {[
                { label: "$COFORGE Stakers", pct: 60, amount: "$60", color: "var(--ink)", note: "Pro-rata to stake weight. Paid in USDC." },
                { label: "Platform Treasury", pct: 30, amount: "$30", color: "var(--red)", note: "Development, legal, partnerships, ops." },
                { label: "Evaluator Rewards", pct: 10, amount: "$10", color: "var(--ink-muted)", note: "Incentive for quality bounty reviews." },
              ].map((row, i) => (
                <div key={i} style={{ padding: "20px 24px", borderBottom: i < 2 ? "1px solid var(--rule)" : "none" }}>
                  <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 8 }}>
                    <span style={{ fontFamily: "var(--sans)", fontSize: 14, fontWeight: 500 }}>{row.label}</span>
                    <span style={{ fontFamily: "var(--mono)", fontSize: 20, fontWeight: 500, color: "var(--ink)" }}>{row.amount}</span>
                  </div>
                  <div className="cap-bar-track" style={{ marginBottom: 8 }}>
                    <div className="cap-bar" style={{ width: `${row.pct}%`, background: row.color }} />
                  </div>
                  <div style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--ink-muted)" }}>{row.note}</div>
                </div>
              ))}
            </div>

            {/* Example at scale */}
            <div>
              <h3 style={{ fontFamily: "var(--serif)", fontSize: 22, marginBottom: 20 }}>At scale, staking pays.</h3>
              {[
                { label: "10 ventures, $50k/yr avg", venueRev: 500_000, stakers: 10_000_000 },
                { label: "50 ventures, $100k/yr avg", venueRev: 5_000_000, stakers: 20_000_000 },
                { label: "200 ventures, $200k/yr avg", venueRev: 40_000_000, stakers: 40_000_000 },
              ].map(scenario => {
                const fees = scenario.venueRev * 0.05;
                const stakerPool = fees * 0.60;
                const apy = (stakerPool / scenario.stakers) * 100;
                return (
                  <div key={scenario.label} style={{ background: "var(--paper)", border: "1px solid var(--rule)", padding: 20, marginBottom: 12 }}>
                    <div style={{ fontFamily: "var(--mono)", fontSize: 9, letterSpacing: "1.5px", textTransform: "uppercase", color: "var(--ink-muted)", marginBottom: 12 }}>
                      {scenario.label}
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
                      {[
                        { label: "Fee pool/yr", value: `$${(fees / 1000).toFixed(0)}k` },
                        { label: "Staker share", value: `$${(stakerPool / 1000).toFixed(0)}k` },
                        { label: "Est. APY", value: `${apy.toFixed(1)}%` },
                      ].map(stat => (
                        <div key={stat.label}>
                          <div style={{ fontFamily: "var(--mono)", fontSize: 9, color: "var(--ink-faint)", letterSpacing: "1px", textTransform: "uppercase", marginBottom: 4 }}>{stat.label}</div>
                          <div style={{ fontFamily: "var(--mono)", fontSize: 16, fontWeight: 500, color: "var(--ink)" }}>{stat.value}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
              <p style={{ fontSize: 11, color: "var(--ink-faint)", fontFamily: "var(--mono)", lineHeight: 1.6 }}>
                Scenarios are illustrative projections, not guarantees. APY varies with platform revenue and total staked supply.
              </p>
            </div>
          </div>
        </div>
      </section>

      <div className="frame"><hr className="rule" /></div>

      {/* CTA */}
      <section style={{ padding: "80px 0", borderTop: "3px solid var(--ink)" }}>
        <div className="frame" style={{ textAlign: "center" }}>
          <div className="ed-label reveal" style={{ textAlign: "center" }}>Get Early Access</div>
          <div className="ed-title reveal r1" style={{ textAlign: "center", margin: "0 auto 16px" }}>
            Token launch is Q3 2026.<br /><em>Build now, earn when it goes live.</em>
          </div>
          <p className="ed-lede reveal r2" style={{ textAlign: "center", margin: "0 auto 40px" }}>
            Complete bounties before token launch and earn allocation in the Community &amp; Airdrop pool.
          </p>
          <div style={{ display: "flex", gap: 16, justifyContent: "center" }} className="reveal r3">
            <Link href="/bounties" className="claim-btn" style={{ padding: "14px 28px" }}>Browse Bounties</Link>
            <Link href="/roadmap" style={{ fontFamily: "var(--mono)", fontSize: 11, letterSpacing: "1.5px", textTransform: "uppercase", color: "var(--ink-muted)", textDecoration: "none", alignSelf: "center" }}>
              View Roadmap →
            </Link>
          </div>
        </div>
      </section>

      <div className="frame"><hr className="rule" /></div>
      <footer className="site-footer">
        <div className="frame foot-inner">
          <span className="foot-copy">&copy; 2026 CoForge Technologies</span>
          <div className="foot-links">
            <Link href="/roadmap">Roadmap</Link>
          </div>
        </div>
      </footer>
    </>
  );
}
