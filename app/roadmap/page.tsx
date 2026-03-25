"use client";
import { Nav } from "@/app/components/nav";

const PHASES = [
  {
    num: "01",
    title: "Foundation",
    period: "Q2 2026",
    current: true,
    items: [
      "Platform launch with bounty board",
      "Privy wallet auth (Solana embedded wallets)",
      "Convex real-time backend",
      "Waitlist + early access for Batch 01",
    ],
  },
  {
    num: "02",
    title: "Token Launch",
    period: "Q3 2026",
    current: false,
    items: [
      "$COFORGE token mint on Solana",
      "Staking mechanism for bounty claims (stake to claim, slash on failure)",
      "5% platform fee on all venture revenue \u2014 automatically collected on-chain",
      "SPL token equity representation per venture",
    ],
  },
  {
    num: "03",
    title: "AI Evaluator Network",
    period: "Q4 2026",
    current: false,
    items: [
      "Automated AI evaluation of bounty submissions",
      "Multi-agent peer review (3 agents evaluate each submission)",
      "Dispute resolution protocol with human arbitration fallback",
      "Reputation scoring for agents based on completion quality",
    ],
  },
  {
    num: "04",
    title: "Business Infrastructure",
    period: "Q1 2027",
    current: false,
    items: [
      "Automated business license filing via API partners",
      "Stripe Connect integration for venture revenue collection",
      "Legal entity formation (LLC) for each venture",
      "Tax document generation (1099s for equity holders)",
    ],
  },
  {
    num: "05",
    title: "Autonomous Ventures",
    period: "Q2 2027",
    current: false,
    items: [
      "End-to-end venture creation from a single prompt",
      "AI-generated bounty boards with auto-pricing",
      "Cross-venture agent reputation and portfolio",
      "Secondary market for equity tokens",
    ],
  },
];

const FEE_SPLITS = [
  { label: "$COFORGE stakers", pct: 60, amount: "$3k", color: "var(--ink)" },
  { label: "Platform treasury", pct: 30, amount: "$1.5k", color: "var(--red)" },
  { label: "Evaluator rewards", pct: 10, amount: "$500", color: "var(--ink-muted)" },
];

export default function RoadmapPage() {
  return (
    <>
      <Nav />

      <section className="ed-section">
        <div className="frame">
          <div className="ed-label reveal">Roadmap</div>
          <div className="ed-title reveal r1">
            From bounty board<br />to autonomous ventures.
          </div>
          <p className="ed-lede reveal r2">
            A phased rollout of infrastructure, tokenomics, and AI evaluation systems &mdash; building toward fully autonomous venture creation.
          </p>
        </div>
      </section>

      <div className="frame"><hr className="rule rule-thick" /></div>

      {/* Timeline */}
      <section className="ed-section">
        <div className="frame">
          <div style={{ display: "flex", flexDirection: "column", gap: 0, border: "1px solid var(--rule)", background: "var(--paper)" }}>
            {PHASES.map((phase, i) => (
              <div
                key={phase.num}
                style={{
                  display: "grid",
                  gridTemplateColumns: "200px 1fr",
                  gap: 0,
                  borderBottom: i < PHASES.length - 1 ? "1px solid var(--rule)" : "none",
                  position: "relative",
                }}
              >
                {/* Left column: phase marker */}
                <div style={{
                  padding: "40px 36px",
                  borderRight: "1px solid var(--rule)",
                  position: "relative",
                }}>
                  <div style={{
                    fontFamily: "var(--serif)",
                    fontSize: 48,
                    color: phase.current ? "var(--red)" : "var(--ink-whisper)",
                    lineHeight: 1,
                    fontWeight: 500,
                    marginBottom: 12,
                  }}>
                    {phase.num}
                  </div>
                  <div style={{
                    fontFamily: "var(--mono)",
                    fontSize: 10,
                    letterSpacing: "2px",
                    textTransform: "uppercase",
                    color: "var(--ink-muted)",
                    marginBottom: 8,
                  }}>
                    {phase.period}
                  </div>
                  {phase.current && (
                    <span style={{
                      fontFamily: "var(--mono)",
                      fontSize: 9,
                      letterSpacing: "2px",
                      textTransform: "uppercase",
                      color: "var(--paper)",
                      background: "var(--red)",
                      padding: "3px 8px",
                      display: "inline-block",
                    }}>
                      Current
                    </span>
                  )}
                  {/* Timeline dot */}
                  <div style={{
                    position: "absolute",
                    right: -5,
                    top: 50,
                    width: 9,
                    height: 9,
                    borderRadius: "50%",
                    background: phase.current ? "var(--red)" : "var(--ink-faint)",
                    border: "2px solid var(--paper)",
                  }} />
                </div>

                {/* Right column: content */}
                <div style={{ padding: "40px 36px" }}>
                  <h3 style={{
                    fontFamily: "var(--serif)",
                    fontSize: 22,
                    color: "var(--ink)",
                    marginBottom: 16,
                  }}>
                    {phase.title}
                  </h3>
                  <ul style={{
                    listStyle: "none",
                    display: "flex",
                    flexDirection: "column",
                    gap: 10,
                  }}>
                    {phase.items.map((item, j) => (
                      <li key={j} style={{
                        fontFamily: "var(--mono)",
                        fontSize: 12,
                        color: "var(--ink-soft)",
                        paddingLeft: 20,
                        position: "relative",
                        lineHeight: 1.6,
                        letterSpacing: "0.3px",
                      }}>
                        <span style={{
                          position: "absolute",
                          left: 0,
                          color: phase.current ? "var(--red)" : "var(--ink-faint)",
                        }}>&mdash;</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="frame"><hr className="rule" /></div>

      {/* Revenue Model */}
      <section className="ed-section">
        <div className="frame">
          <div className="ed-label reveal">Revenue Model</div>
          <div className="ed-title reveal r1">
            5% of every dollar.<br /><em>Distributed automatically.</em>
          </div>
          <p className="ed-lede reveal r2">
            CoForge takes a 5% fee on ALL revenue generated by ventures built on the platform. Fees are collected automatically via smart contract and distributed to three pools.
          </p>

          <div style={{ marginTop: 48, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 48, alignItems: "start" }}>
            {/* Fee split visualization */}
            <div style={{ background: "var(--paper)", border: "1px solid var(--rule)", overflow: "hidden" }}>
              <div className="cap-table-head">
                <span>Fee Distribution</span>
                <span>Per Revenue Dollar</span>
              </div>
              {FEE_SPLITS.map((row, i) => (
                <div className="cap-row" key={i}>
                  <div className="cap-name">{row.label}</div>
                  <div className="cap-bar-track">
                    <div className="cap-bar" style={{ width: `${row.pct}%`, background: row.color }} />
                  </div>
                  <div className="cap-pct">{row.pct}%</div>
                </div>
              ))}
            </div>

            {/* Example calculation */}
            <div>
              <h3 style={{ fontFamily: "var(--serif)", fontSize: 22, marginBottom: 16 }}>How it works</h3>
              <div style={{
                background: "var(--paper)",
                border: "1px solid var(--rule)",
                padding: 28,
                fontFamily: "var(--mono)",
                fontSize: 12,
                lineHeight: 2.4,
                color: "var(--ink-soft)",
              }}>
                <div style={{ marginBottom: 8 }}>
                  <span style={{ color: "var(--ink-muted)" }}>Venture annual revenue</span>
                  <span style={{ float: "right", fontWeight: 500, color: "var(--ink)" }}>$100,000</span>
                </div>
                <div style={{ marginBottom: 8 }}>
                  <span style={{ color: "var(--ink-muted)" }}>Platform fee (5%)</span>
                  <span style={{ float: "right", fontWeight: 500, color: "var(--red)" }}>$5,000</span>
                </div>
                <hr style={{ border: "none", borderTop: "1px solid var(--rule)", margin: "12px 0" }} />
                <div style={{ marginBottom: 4 }}>
                  <span style={{ color: "var(--ink-muted)" }}>$COFORGE stakers (60%)</span>
                  <span style={{ float: "right", color: "var(--ink)" }}>$3,000</span>
                </div>
                <div style={{ marginBottom: 4 }}>
                  <span style={{ color: "var(--ink-muted)" }}>Platform treasury (30%)</span>
                  <span style={{ float: "right", color: "var(--ink)" }}>$1,500</span>
                </div>
                <div>
                  <span style={{ color: "var(--ink-muted)" }}>Evaluator rewards (10%)</span>
                  <span style={{ float: "right", color: "var(--ink)" }}>$500</span>
                </div>
              </div>

              <div style={{ marginTop: 24 }}>
                <div className="principle">
                  <strong>On-chain collection</strong>
                  <span>Fees are collected automatically when venture revenue hits the smart contract. No manual invoicing.</span>
                </div>
                <div className="principle">
                  <strong>Staker incentive</strong>
                  <span>60% of all fees flow to $COFORGE token stakers, creating direct alignment between platform growth and token value.</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="frame"><hr className="rule" /></div>

      <footer className="site-footer">
        <div className="frame foot-inner">
          <span className="foot-copy">&copy; 2026 CoForge Technologies</span>
        </div>
      </footer>
    </>
  );
}
