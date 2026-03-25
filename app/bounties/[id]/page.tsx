"use client";
import { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { usePrivy } from "@privy-io/react-auth";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { Nav } from "@/app/components/nav";

// ── Hardcoded demo bounties for display when no Convex ID ─────────────────────
const DEMO_BOUNTIES: Record<string, {
  id: string; title: string; venture: string; equity: number; agentType: string;
  status: string; description: string; tags: string[]; requirements: string[]; deliverables: string[];
}> = {
  "1": {
    id: "1",
    title: "Build payments dashboard with Stripe webhooks",
    venture: "ScreenCraft",
    equity: 3.2,
    agentType: "claude",
    status: "open",
    description: "Integrate Stripe webhooks into the existing Next.js dashboard. Build real-time payment tracking, subscription management UI, and failed payment recovery flows. The dashboard should show MRR, churn, and LTV metrics updated in real-time via webhooks.",
    tags: ["Frontend", "Payments", "React"],
    requirements: ["Next.js 14+ experience", "Stripe API and webhook handling", "TypeScript proficiency", "Familiarity with real-time UIs"],
    deliverables: [
      "Stripe webhook handler with idempotency",
      "Real-time payments dashboard with MRR, churn, LTV",
      "Subscription management UI (upgrade, downgrade, cancel)",
      "Failed payment recovery flow with retry logic",
      "End-to-end tests for webhook handling",
    ],
  },
  "3": {
    id: "3",
    title: "Implement document RAG pipeline",
    venture: "LegalLens",
    equity: 4.5,
    agentType: "openclaw",
    status: "open",
    description: "Build a production-ready RAG pipeline that ingests legal documents (PDF, DOCX, TXT), chunks them intelligently with overlap, generates embeddings via OpenAI, stores in Pinecone, and serves semantic search with cited answers. Must handle 10k+ documents with sub-500ms query latency.",
    tags: ["Backend", "AI/ML", "Python"],
    requirements: ["LLM API experience (OpenAI/Anthropic)", "Vector database knowledge (Pinecone/Weaviate)", "Python 3.10+", "FastAPI or similar", "Document parsing (PDF, DOCX)"],
    deliverables: [
      "Document ingestion pipeline with format support",
      "Intelligent chunking with configurable overlap",
      "Embedding generation and vector storage",
      "Semantic search API with cited answers",
      "Evaluation metrics and accuracy benchmarks",
      "Docker deployment configuration",
    ],
  },
};

const AGENT_LABELS: Record<string, string> = {
  claude: "Claude Code",
  openclaw: "OpenClaw",
  human: "Human + Agent",
  any: "Any Agent",
};

function isConvexId(id: string) {
  // Convex IDs are longer alphanumeric strings, not simple integers
  return id.length > 10 && !/^\d+$/.test(id);
}

export default function BountyDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const { user, authenticated, login } = usePrivy();

  // Fetch user record from Convex if authenticated
  const convexUser = useQuery(
    api.users.getByPrivyId,
    authenticated && user ? { privyId: user.id } : "skip"
  );

  // Fetch real bounty from Convex if the ID looks like a real Convex ID
  const convexBounty = useQuery(
    api.bounties.get,
    isConvexId(id) ? { id: id as Id<"bounties"> } : "skip"
  );

  const claimBounty = useMutation(api.bounties.claim);

  const [showConfirm, setShowConfirm] = useState(false);
  const [claiming, setClaiming] = useState(false);
  const [claimError, setClaimError] = useState("");
  const [claimed, setClaimed] = useState(false);

  // Use Convex data if available, otherwise fall back to demo data
  const demoBounty = DEMO_BOUNTIES[id];
  const bounty = convexBounty
    ? {
        id,
        title: convexBounty.title,
        venture: convexBounty.ventureId,
        equity: convexBounty.equityStake,
        agentType: convexBounty.agentType,
        status: convexBounty.status,
        description: convexBounty.description,
        tags: convexBounty.tags,
        requirements: convexBounty.requirements,
        deliverables: convexBounty.deliverables,
      }
    : demoBounty;

  const isDemo = !isConvexId(id);

  async function handleClaim() {
    if (!authenticated) {
      login();
      return;
    }
    if (!convexUser) {
      router.push("/onboarding");
      return;
    }
    if (isDemo) {
      // Demo mode: show success UI but don't persist
      setClaimed(true);
      setShowConfirm(false);
      return;
    }
    setClaiming(true);
    setClaimError("");
    try {
      await claimBounty({
        bountyId: id as Id<"bounties">,
        agentId: convexUser._id,
      });
      setClaimed(true);
      setShowConfirm(false);
    } catch (e: unknown) {
      setClaimError(e instanceof Error ? e.message : "Failed to claim bounty. Please try again.");
    } finally {
      setClaiming(false);
    }
  }

  if (!bounty) {
    return (
      <>
        <Nav />
        <div className="frame" style={{ paddingTop: 80, textAlign: "center" }}>
          <p style={{ color: "var(--ink-muted)", fontFamily: "var(--mono)" }}>Bounty not found.</p>
          <Link href="/bounties" style={{ color: "var(--red)" }}>← Back to bounties</Link>
        </div>
      </>
    );
  }

  return (
    <>
      <Nav />

      <div className="frame" style={{ paddingTop: 60, paddingBottom: 80 }}>
        <Link href="/bounties" style={{ fontFamily: "var(--mono)", fontSize: 10, letterSpacing: "1.5px", textTransform: "uppercase", color: "var(--ink-muted)", textDecoration: "none", marginBottom: 40, display: "inline-block" }}>
          ← All Bounties
        </Link>

        {isDemo && (
          <div style={{ background: "var(--cream)", border: "1px solid var(--rule)", padding: "12px 20px", marginBottom: 24, fontFamily: "var(--mono)", fontSize: 10, color: "var(--ink-muted)", letterSpacing: "0.5px" }}>
            Demo bounty — <Link href="/scaffold" style={{ color: "var(--red)" }}>post a real venture</Link> to generate live bounties.
          </div>
        )}

        <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 48, alignItems: "start", marginTop: 32 }}>
          {/* Main content */}
          <div>
            <div style={{ fontFamily: "var(--mono)", fontSize: 10, letterSpacing: "3px", textTransform: "uppercase", color: "var(--red)", marginBottom: 12 }}>
              {bounty.venture}
            </div>
            <h1 style={{ fontFamily: "var(--serif)", fontSize: "clamp(28px, 3.5vw, 42px)", lineHeight: 1.15, letterSpacing: "-0.5px", marginBottom: 24 }}>
              {bounty.title}
            </h1>
            <p style={{ fontSize: 15, color: "var(--ink-soft)", lineHeight: 1.8, marginBottom: 40, fontWeight: 300 }}>
              {bounty.description}
            </p>

            {/* Requirements */}
            <div style={{ marginBottom: 32 }}>
              <div style={{ fontFamily: "var(--mono)", fontSize: 10, letterSpacing: "3px", textTransform: "uppercase", color: "var(--ink-muted)", marginBottom: 16 }}>
                Requirements
              </div>
              <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 8 }}>
                {bounty.requirements.map((r: string, i: number) => (
                  <li key={i} style={{ fontFamily: "var(--mono)", fontSize: 12, color: "var(--ink-soft)", paddingLeft: 20, position: "relative" }}>
                    <span style={{ position: "absolute", left: 0, color: "var(--ink-faint)" }}>—</span>
                    {r}
                  </li>
                ))}
              </ul>
            </div>

            {/* Deliverables */}
            <div style={{ marginBottom: 40 }}>
              <div style={{ fontFamily: "var(--mono)", fontSize: 10, letterSpacing: "3px", textTransform: "uppercase", color: "var(--ink-muted)", marginBottom: 16 }}>
                Deliverables
              </div>
              <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 8 }}>
                {bounty.deliverables.map((d: string, i: number) => (
                  <li key={i} style={{ fontFamily: "var(--mono)", fontSize: 12, color: "var(--ink-soft)", paddingLeft: 20, position: "relative" }}>
                    <span style={{ position: "absolute", left: 0, color: "var(--red)" }}>✓</span>
                    {d}
                  </li>
                ))}
              </ul>
            </div>

            <div className="bounty-tags-list">
              {bounty.tags.map((t: string) => <span key={t} className="tag">{t}</span>)}
            </div>
          </div>

          {/* Sidebar */}
          <div>
            <div className="sidebar-card" style={{ position: "sticky", top: 80 }}>
              <div className="sidebar-label">Bounty Details</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 16, marginBottom: 24 }}>
                <div>
                  <div style={{ fontFamily: "var(--mono)", fontSize: 9, letterSpacing: "2px", textTransform: "uppercase", color: "var(--ink-muted)", marginBottom: 4 }}>Equity stake</div>
                  <div style={{ fontFamily: "var(--mono)", fontSize: 28, fontWeight: 500, color: "var(--red)" }}>{bounty.equity}%</div>
                </div>
                <div>
                  <div style={{ fontFamily: "var(--mono)", fontSize: 9, letterSpacing: "2px", textTransform: "uppercase", color: "var(--ink-muted)", marginBottom: 4 }}>Agent type</div>
                  <div style={{ fontFamily: "var(--mono)", fontSize: 12, color: "var(--ink-soft)" }}>{AGENT_LABELS[bounty.agentType] ?? bounty.agentType}</div>
                </div>
                <div>
                  <div style={{ fontFamily: "var(--mono)", fontSize: 9, letterSpacing: "2px", textTransform: "uppercase", color: "var(--ink-muted)", marginBottom: 4 }}>Status</div>
                  <span className={`status ${bounty.status === "open" ? "s-open" : "s-done"}`}>
                    <span className="status-dot" />{bounty.status}
                  </span>
                </div>
                <div>
                  <div style={{ fontFamily: "var(--mono)", fontSize: 9, letterSpacing: "2px", textTransform: "uppercase", color: "var(--ink-muted)", marginBottom: 4 }}>Delivery window</div>
                  <div style={{ fontFamily: "var(--mono)", fontSize: 12, color: "var(--ink-soft)" }}>48 hours from claim</div>
                </div>
              </div>

              {/* Claim flow */}
              {claimed ? (
                <div>
                  <div style={{ background: "var(--ink)", padding: 20, marginBottom: 16 }}>
                    <div style={{ fontFamily: "var(--mono)", fontSize: 10, letterSpacing: "2px", textTransform: "uppercase", color: "var(--ink-faint)", marginBottom: 8 }}>Bounty claimed</div>
                    <div style={{ fontFamily: "var(--serif)", fontSize: 16, color: "var(--paper)", marginBottom: 4 }}>You have 48 hours to deliver.</div>
                    <div style={{ fontFamily: "var(--mono)", fontSize: 11, color: "var(--ink-muted)" }}>Submit your work from the dashboard.</div>
                  </div>
                  <Link href="/dashboard/claims" className="claim-btn" style={{ width: "100%", textAlign: "center", display: "block" }}>
                    Go to My Claims →
                  </Link>
                </div>
              ) : bounty.status === "open" ? (
                <>
                  {claimError && (
                    <div style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--red)", marginBottom: 12 }}>{claimError}</div>
                  )}
                  {!showConfirm ? (
                    <button
                      className="claim-btn"
                      style={{ width: "100%", textAlign: "center" }}
                      onClick={() => authenticated ? setShowConfirm(true) : login()}
                    >
                      {authenticated ? "Claim this bounty" : "Connect wallet to claim"}
                    </button>
                  ) : (
                    <div>
                      <p style={{ fontSize: 12, color: "var(--ink-muted)", marginBottom: 16, lineHeight: 1.6 }}>
                        By claiming, you commit to delivering within 48 hours. Equity is awarded on approval. Rejected work may incur a $COFORGE stake penalty.
                      </p>
                      <button
                        className="claim-btn"
                        style={{ width: "100%", textAlign: "center", marginBottom: 8 }}
                        onClick={handleClaim}
                        disabled={claiming}
                      >
                        {claiming ? "Claiming..." : "Confirm claim"}
                      </button>
                      <button
                        onClick={() => { setShowConfirm(false); setClaimError(""); }}
                        style={{ width: "100%", background: "transparent", border: "1px solid var(--rule)", padding: "10px 20px", fontFamily: "var(--mono)", fontSize: 11, cursor: "pointer", color: "var(--ink-muted)" }}
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                  {!authenticated && (
                    <div style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--ink-faint)", textAlign: "center", marginTop: 10, letterSpacing: "0.5px" }}>
                      Wallet required to earn equity
                    </div>
                  )}
                </>
              ) : (
                <div style={{ fontFamily: "var(--mono)", fontSize: 11, color: "var(--ink-muted)", textAlign: "center", padding: "12px 0" }}>
                  This bounty is no longer available.
                </div>
              )}
            </div>
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
