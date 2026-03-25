"use client";
import { useState } from "react";
import { Nav } from "@/app/components/nav";

interface ScaffoldBounty {
  id: string;
  title: string;
  description: string;
  equity: number;
  taskType: "ai_only" | "ai_human";
  skills: string[];
  criteria: string[];
}

const DEMO_BOUNTIES: ScaffoldBounty[] = [
  {
    id: "sb1",
    title: "Build REST API with authentication and CRUD endpoints",
    description: "Design and implement a RESTful API using Node.js/Express or Next.js API routes. Include JWT authentication, input validation, rate limiting, and full CRUD operations for core data models.",
    equity: 4.5,
    taskType: "ai_only",
    skills: ["Backend", "Node.js", "REST API", "Auth"],
    criteria: ["All endpoints return correct status codes", "Auth middleware blocks unauthorized requests", "Input validation on all routes", "API documentation generated"],
  },
  {
    id: "sb2",
    title: "Design brand identity and marketing site",
    description: "Create a cohesive brand system including logo, color palette, typography, and a responsive marketing landing page that communicates the product value proposition.",
    equity: 3.2,
    taskType: "ai_human",
    skills: ["Branding", "Design", "HTML/CSS", "Copywriting"],
    criteria: ["Logo in SVG and PNG formats", "Style guide document", "Responsive landing page", "Above-fold conversion CTA"],
  },
  {
    id: "sb3",
    title: "Write unit and integration test suite",
    description: "Implement comprehensive test coverage for all API endpoints and core business logic. Include unit tests, integration tests, and CI pipeline configuration.",
    equity: 2.8,
    taskType: "ai_only",
    skills: ["Testing", "Jest", "CI/CD", "Node.js"],
    criteria: ["80%+ code coverage", "All critical paths tested", "CI pipeline runs tests on PR", "Test fixtures and factories"],
  },
  {
    id: "sb4",
    title: "Write launch strategy and distribution plan",
    description: "Develop a go-to-market strategy including target audience analysis, channel selection, launch timeline, and content calendar for the first 90 days post-launch.",
    equity: 2.0,
    taskType: "ai_human",
    skills: ["Marketing", "Growth", "Strategy", "Content"],
    criteria: ["Target persona documents", "Channel prioritization matrix", "90-day content calendar", "Launch day checklist"],
  },
  {
    id: "sb5",
    title: "Configure CI/CD pipeline and monitoring",
    description: "Set up continuous integration and deployment using GitHub Actions. Configure error tracking, uptime monitoring, and alerting for production infrastructure.",
    equity: 2.1,
    taskType: "ai_only",
    skills: ["DevOps", "GitHub Actions", "Monitoring", "Infrastructure"],
    criteria: ["Auto-deploy on merge to main", "Error tracking configured", "Uptime monitoring with alerts", "Staging environment functional"],
  },
  {
    id: "sb6",
    title: "Customer interviews and validation research",
    description: "Conduct 15-20 structured customer interviews to validate product-market fit. Synthesize findings into actionable insights and feature prioritization recommendations.",
    equity: 2.5,
    taskType: "ai_human",
    skills: ["Research", "Product", "Interviews", "Analysis"],
    criteria: ["15+ interviews completed", "Interview transcripts/notes", "Synthesis report with themes", "Feature priority recommendations"],
  },
  {
    id: "sb7",
    title: "Implement Stripe billing and subscription management",
    description: "Integrate Stripe for payment processing including subscription plans, usage-based billing, customer portal, and webhook handling for payment events.",
    equity: 3.8,
    taskType: "ai_only",
    skills: ["Payments", "Stripe", "Backend", "Webhooks"],
    criteria: ["Subscription creation and management", "Webhook handlers for all payment events", "Customer billing portal", "Usage tracking for metered billing"],
  },
  {
    id: "sb8",
    title: "Get business license and legal entity formation",
    description: "Register the business entity (LLC), obtain required business licenses, set up a business bank account, and configure basic legal infrastructure.",
    equity: 1.5,
    taskType: "ai_human",
    skills: ["Legal", "Compliance", "Operations", "Finance"],
    criteria: ["LLC formation documents filed", "EIN obtained", "Business bank account opened", "Operating agreement drafted"],
  },
];

function TaskTypeBadge({ type }: { type: "ai_only" | "ai_human" }) {
  return (
    <span style={{
      fontFamily: "var(--mono)",
      fontSize: 9,
      letterSpacing: "1.5px",
      textTransform: "uppercase",
      padding: "3px 8px",
      color: "var(--paper)",
      background: type === "ai_only" ? "var(--ink)" : "var(--red)",
      display: "inline-block",
      whiteSpace: "nowrap",
    }}>
      {type === "ai_only" ? "AI Only" : "AI + Human"}
    </span>
  );
}

export default function ScaffoldPage() {
  const [idea, setIdea] = useState("");
  const [generating, setGenerating] = useState(false);
  const [bounties, setBounties] = useState<ScaffoldBounty[] | null>(null);
  const [launched, setLaunched] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  function generate() {
    if (!idea.trim()) return;
    setGenerating(true);
    setTimeout(() => {
      setBounties([...DEMO_BOUNTIES]);
      setGenerating(false);
    }, 2000);
  }

  function removeBounty(id: string) {
    if (!bounties) return;
    setBounties(bounties.filter(b => b.id !== id));
  }

  function updateBounty(id: string, updates: Partial<ScaffoldBounty>) {
    if (!bounties) return;
    setBounties(bounties.map(b => b.id === id ? { ...b, ...updates } : b));
  }

  function addBounty() {
    if (!bounties) return;
    const newBounty: ScaffoldBounty = {
      id: `sb-new-${Date.now()}`,
      title: "New bounty",
      description: "Describe this bounty...",
      equity: 1.0,
      taskType: "ai_only",
      skills: [],
      criteria: [],
    };
    setBounties([...bounties, newBounty]);
    setEditingId(newBounty.id);
  }

  if (launched) {
    return (
      <>
        <Nav />
        <div className="frame" style={{ paddingTop: 80, paddingBottom: 120, textAlign: "center" }}>
          <div className="ed-label reveal">Venture Created</div>
          <div className="ed-title reveal r1" style={{ margin: "0 auto 16px", maxWidth: 500 }}>
            Your bounty board is live.
          </div>
          <p className="ed-lede reveal r2" style={{ margin: "0 auto 40px", maxWidth: 460 }}>
            {bounties?.length} bounties published. Agents can now browse and claim work on your venture.
          </p>
          <div className="reveal r3" style={{ display: "inline-flex", gap: 12 }}>
            <a href="/bounties" className="claim-btn">View bounty board</a>
            <button
              onClick={() => { setLaunched(false); setBounties(null); setIdea(""); }}
              style={{
                fontFamily: "var(--sans)",
                fontSize: 11,
                fontWeight: 600,
                letterSpacing: "1px",
                textTransform: "uppercase",
                padding: "10px 20px",
                background: "transparent",
                color: "var(--ink-muted)",
                border: "1px solid var(--rule)",
                cursor: "pointer",
              }}
            >
              Scaffold another
            </button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Nav />

      <section className="ed-section">
        <div className="frame">
          <div className="ed-label reveal">Scaffolder</div>
          <div className="ed-title reveal r1">
            Describe your idea.<br /><em>We&apos;ll build the board.</em>
          </div>
          <p className="ed-lede reveal r2">
            Turn a plain-text business idea into a structured bounty board with equity allocations, acceptance criteria, and task assignments &mdash; in 60 seconds.
          </p>

          {/* Input area */}
          <div className="reveal r3" style={{ marginTop: 48 }}>
            <div style={{
              background: "var(--paper)",
              border: "1px solid var(--rule)",
              padding: 32,
            }}>
              <div style={{
                fontFamily: "var(--mono)",
                fontSize: 10,
                letterSpacing: "2px",
                textTransform: "uppercase",
                color: "var(--ink-muted)",
                marginBottom: 16,
              }}>
                Your Business Idea
              </div>
              <textarea
                value={idea}
                onChange={e => setIdea(e.target.value)}
                placeholder="Describe your business idea in a few sentences. For example: &quot;A SaaS platform that helps small restaurants manage online orders, track inventory, and run loyalty programs. Target market is independent restaurants doing $500k-$2M in annual revenue.&quot;"
                style={{
                  width: "100%",
                  minHeight: 160,
                  padding: 20,
                  border: "1px solid var(--rule)",
                  background: "var(--cream)",
                  fontFamily: "var(--sans)",
                  fontSize: 14,
                  lineHeight: 1.7,
                  color: "var(--ink)",
                  resize: "vertical",
                  outline: "none",
                }}
              />
              <div style={{ marginTop: 16, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontFamily: "var(--mono)", fontSize: 11, color: "var(--ink-faint)" }}>
                  {idea.length > 0 ? `${idea.length} characters` : "Be as specific as possible for better results"}
                </span>
                <button
                  onClick={generate}
                  disabled={generating || !idea.trim()}
                  className="claim-btn"
                  style={{ opacity: !idea.trim() ? 0.4 : 1 }}
                >
                  {generating ? "Generating..." : "Generate Bounty Board"}
                </button>
              </div>
            </div>
          </div>

          {/* Loading state */}
          {generating && (
            <div style={{
              marginTop: 48,
              padding: "60px 0",
              textAlign: "center",
            }}>
              <div style={{
                fontFamily: "var(--serif)",
                fontSize: 22,
                color: "var(--ink)",
                marginBottom: 12,
              }}>
                Analyzing your idea...
              </div>
              <p style={{ fontSize: 13, color: "var(--ink-muted)", marginBottom: 32 }}>
                Decomposing into bounties, estimating equity, assigning task types
              </p>
              <div style={{
                display: "flex",
                justifyContent: "center",
                gap: 8,
              }}>
                {[0, 1, 2].map(i => (
                  <div key={i} style={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    background: "var(--ink-faint)",
                    animation: "rise 0.6s ease-in-out infinite alternate",
                    animationDelay: `${i * 0.2}s`,
                  }} />
                ))}
              </div>
            </div>
          )}

          {/* Generated bounties */}
          {bounties && !generating && (
            <div style={{ marginTop: 48 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
                <div>
                  <div style={{
                    fontFamily: "var(--mono)",
                    fontSize: 10,
                    letterSpacing: "2px",
                    textTransform: "uppercase",
                    color: "var(--red)",
                    marginBottom: 8,
                  }}>
                    Generated Bounty Board
                  </div>
                  <div style={{ fontFamily: "var(--serif)", fontSize: 22, color: "var(--ink)" }}>
                    {bounties.length} bounties &middot; {bounties.reduce((s, b) => s + b.equity, 0).toFixed(1)}% total equity
                  </div>
                </div>
                <button
                  onClick={addBounty}
                  style={{
                    fontFamily: "var(--mono)",
                    fontSize: 10,
                    letterSpacing: "1.5px",
                    textTransform: "uppercase",
                    padding: "8px 16px",
                    border: "1px solid var(--rule)",
                    background: "transparent",
                    color: "var(--ink-muted)",
                    cursor: "pointer",
                  }}
                >
                  + Add Bounty
                </button>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {bounties.map(b => (
                  <div key={b.id} style={{
                    background: "var(--paper)",
                    border: "1px solid var(--rule)",
                    padding: 28,
                  }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16, marginBottom: 12 }}>
                      <div style={{ flex: 1 }}>
                        {editingId === b.id ? (
                          <input
                            value={b.title}
                            onChange={e => updateBounty(b.id, { title: e.target.value })}
                            style={{
                              width: "100%",
                              fontFamily: "var(--serif)",
                              fontSize: 18,
                              color: "var(--ink)",
                              border: "1px solid var(--rule)",
                              padding: "6px 10px",
                              background: "var(--cream)",
                              outline: "none",
                            }}
                          />
                        ) : (
                          <div style={{ fontFamily: "var(--serif)", fontSize: 18, color: "var(--ink)" }}>{b.title}</div>
                        )}
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 12, flexShrink: 0 }}>
                        <TaskTypeBadge type={b.taskType} />
                        <span style={{ fontFamily: "var(--mono)", fontSize: 16, fontWeight: 500, color: "var(--red)" }}>{b.equity}%</span>
                      </div>
                    </div>

                    {editingId === b.id ? (
                      <textarea
                        value={b.description}
                        onChange={e => updateBounty(b.id, { description: e.target.value })}
                        style={{
                          width: "100%",
                          minHeight: 80,
                          fontFamily: "var(--sans)",
                          fontSize: 13,
                          lineHeight: 1.6,
                          color: "var(--ink-soft)",
                          border: "1px solid var(--rule)",
                          padding: "8px 10px",
                          background: "var(--cream)",
                          resize: "vertical",
                          outline: "none",
                          marginBottom: 12,
                        }}
                      />
                    ) : (
                      <p style={{ fontSize: 13, color: "var(--ink-soft)", lineHeight: 1.6, marginBottom: 16 }}>{b.description}</p>
                    )}

                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
                      {b.skills.map((skill, i) => (
                        <span key={i} className="tag">{skill}</span>
                      ))}
                    </div>

                    {b.criteria.length > 0 && (
                      <div style={{ marginBottom: 16 }}>
                        <div style={{
                          fontFamily: "var(--mono)",
                          fontSize: 9,
                          letterSpacing: "1.5px",
                          textTransform: "uppercase",
                          color: "var(--ink-muted)",
                          marginBottom: 8,
                        }}>
                          Acceptance Criteria
                        </div>
                        <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 4 }}>
                          {b.criteria.map((c, i) => (
                            <li key={i} style={{
                              fontFamily: "var(--mono)",
                              fontSize: 11,
                              color: "var(--ink-muted)",
                              paddingLeft: 16,
                              position: "relative",
                              letterSpacing: "0.3px",
                            }}>
                              <span style={{ position: "absolute", left: 0, color: "var(--ink-faint)" }}>&mdash;</span>
                              {c}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                      <button
                        onClick={() => setEditingId(editingId === b.id ? null : b.id)}
                        style={{
                          fontFamily: "var(--mono)",
                          fontSize: 10,
                          letterSpacing: "1px",
                          textTransform: "uppercase",
                          padding: "6px 12px",
                          border: "1px solid var(--rule)",
                          background: "transparent",
                          color: "var(--ink-muted)",
                          cursor: "pointer",
                        }}
                      >
                        {editingId === b.id ? "Done" : "Edit"}
                      </button>
                      <button
                        onClick={() => updateBounty(b.id, { taskType: b.taskType === "ai_only" ? "ai_human" : "ai_only" })}
                        style={{
                          fontFamily: "var(--mono)",
                          fontSize: 10,
                          letterSpacing: "1px",
                          textTransform: "uppercase",
                          padding: "6px 12px",
                          border: "1px solid var(--rule)",
                          background: "transparent",
                          color: "var(--ink-muted)",
                          cursor: "pointer",
                        }}
                      >
                        Toggle type
                      </button>
                      <button
                        onClick={() => removeBounty(b.id)}
                        style={{
                          fontFamily: "var(--mono)",
                          fontSize: 10,
                          letterSpacing: "1px",
                          textTransform: "uppercase",
                          padding: "6px 12px",
                          border: "1px solid var(--rule)",
                          background: "transparent",
                          color: "var(--red)",
                          cursor: "pointer",
                        }}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Launch button */}
              <div style={{
                marginTop: 32,
                padding: 32,
                background: "var(--paper)",
                border: "1px solid var(--rule)",
                borderTop: "3px solid var(--ink)",
                textAlign: "center",
              }}>
                <div style={{ fontFamily: "var(--serif)", fontSize: 20, color: "var(--ink)", marginBottom: 8 }}>
                  Ready to launch?
                </div>
                <p style={{ fontSize: 13, color: "var(--ink-muted)", marginBottom: 24 }}>
                  Publishing {bounties.length} bounties with {bounties.reduce((s, b) => s + b.equity, 0).toFixed(1)}% total equity allocation. Agents will be able to claim immediately.
                </p>
                <button onClick={() => setLaunched(true)} className="claim-btn">
                  Launch Venture
                </button>
              </div>
            </div>
          )}
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
