"use client";
import { useState } from "react";
import Link from "next/link";
import { usePrivy } from "@privy-io/react-auth";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
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

type Claim = {
  _id: Id<"claims">;
  bountyId: Id<"bounties">;
  agentId: Id<"users">;
  status: "active" | "submitted" | "approved" | "rejected";
  submissionUrl?: string;
  submissionNotes?: string;
  claimedAt: number;
  submittedAt?: number;
  reviewedAt?: number;
  reviewNotes?: string;
  bounty: {
    _id: Id<"bounties">;
    title: string;
    equityStake: number;
    status: string;
    claimedAt?: number;
  } | null;
  venture: { name: string } | null;
};

function hoursLeft(claimedAt: number) {
  const elapsed = (Date.now() - claimedAt) / 1000 / 60 / 60;
  const left = 48 - elapsed;
  if (left <= 0) return "Overdue";
  if (left < 1) return `${Math.round(left * 60)}m left`;
  return `${Math.floor(left)}h left`;
}

function StatusPill({ status }: { status: Claim["status"] }) {
  const map: Record<string, { label: string; color: string; bg: string }> = {
    active:    { label: "In Progress", color: "var(--ink)", bg: "var(--cream)" },
    submitted: { label: "Under Review", color: "var(--paper)", bg: "var(--ink)" },
    approved:  { label: "Approved", color: "#1A3D2B", bg: "#D4EDDA" },
    rejected:  { label: "Rejected", color: "var(--red)", bg: "var(--red-soft)" },
  };
  const s = map[status] ?? map.active;
  return (
    <span style={{ fontFamily: "var(--mono)", fontSize: 9, letterSpacing: "1.5px", textTransform: "uppercase", padding: "4px 10px", background: s.bg, color: s.color, border: "none" }}>
      {s.label}
    </span>
  );
}

function SubmitForm({ claim, onDone }: { claim: Claim; onDone: () => void }) {
  const submitWork = useMutation(api.bounties.submit);
  const [url, setUrl] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit() {
    if (!url.trim()) { setError("Submission URL is required."); return; }
    setSubmitting(true);
    setError("");
    try {
      await submitWork({
        bountyId: claim.bountyId,
        claimId: claim._id,
        submissionUrl: url.trim(),
        submissionNotes: notes.trim() || undefined,
      });
      onDone();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to submit. Please try again.");
      setSubmitting(false);
    }
  }

  return (
    <div style={{ marginTop: 20, borderTop: "1px solid var(--rule)", paddingTop: 20 }}>
      <div style={{ fontFamily: "var(--mono)", fontSize: 10, letterSpacing: "2px", textTransform: "uppercase", color: "var(--ink-muted)", marginBottom: 16 }}>
        Submit Your Work
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <div>
          <label style={{ fontFamily: "var(--mono)", fontSize: 9, letterSpacing: "1.5px", textTransform: "uppercase", color: "var(--ink-muted)", display: "block", marginBottom: 6 }}>
            Submission URL <span style={{ color: "var(--red)" }}>*</span>
          </label>
          <input
            type="url"
            value={url}
            onChange={e => setUrl(e.target.value)}
            placeholder="https://github.com/your-repo/pull/1"
            style={{ width: "100%", padding: "10px 14px", border: "1px solid var(--rule)", background: "var(--cream)", fontFamily: "var(--mono)", fontSize: 12, color: "var(--ink)", outline: "none" }}
          />
          <div style={{ fontFamily: "var(--mono)", fontSize: 9, color: "var(--ink-faint)", marginTop: 4 }}>
            GitHub PR, Loom video, deployed URL, or any verifiable link.
          </div>
        </div>
        <div>
          <label style={{ fontFamily: "var(--mono)", fontSize: 9, letterSpacing: "1.5px", textTransform: "uppercase", color: "var(--ink-muted)", display: "block", marginBottom: 6 }}>
            Notes (optional)
          </label>
          <textarea
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder="Describe what you built, any known limitations, or testing instructions..."
            rows={4}
            style={{ width: "100%", padding: "10px 14px", border: "1px solid var(--rule)", background: "var(--cream)", fontFamily: "var(--mono)", fontSize: 12, color: "var(--ink)", outline: "none", resize: "vertical" }}
          />
        </div>
        {error && <div style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--red)" }}>{error}</div>}
        <button
          className="claim-btn"
          onClick={handleSubmit}
          disabled={submitting}
          style={{ alignSelf: "flex-start" }}
        >
          {submitting ? "Submitting..." : "Submit for Review →"}
        </button>
      </div>
    </div>
  );
}

function ClaimCard({ claim }: { claim: Claim }) {
  const [expanded, setExpanded] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const isActive = claim.status === "active";
  const deadline = isActive ? hoursLeft(claim.claimedAt) : null;
  const isOverdue = deadline === "Overdue";

  return (
    <div style={{ background: "var(--paper)", border: `1px solid ${isOverdue ? "var(--red)" : "var(--rule)"}`, padding: 24, transition: "border-color 0.2s" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16, marginBottom: 12 }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: "var(--mono)", fontSize: 9, letterSpacing: "1.5px", textTransform: "uppercase", color: "var(--ink-muted)", marginBottom: 6 }}>
            {claim.venture?.name ?? "Unknown Venture"}
          </div>
          <div style={{ fontFamily: "var(--serif)", fontSize: 17, color: "var(--ink)", marginBottom: 4 }}>
            {claim.bounty?.title ?? "Bounty"}
          </div>
          {claim.status === "approved" && (
            <div style={{ fontFamily: "var(--mono)", fontSize: 11, color: "#1A3D2B" }}>
              {claim.bounty?.equityStake}% equity minted to your wallet
            </div>
          )}
          {claim.status === "rejected" && claim.reviewNotes && (
            <div style={{ fontFamily: "var(--mono)", fontSize: 11, color: "var(--red)", marginTop: 4 }}>
              Reason: {claim.reviewNotes}
            </div>
          )}
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8, flexShrink: 0 }}>
          <div style={{ fontFamily: "var(--mono)", fontSize: 18, fontWeight: 500, color: "var(--red)" }}>
            {claim.bounty?.equityStake}%
          </div>
          <StatusPill status={submitted ? "submitted" : claim.status} />
          {isActive && deadline && (
            <div style={{ fontFamily: "var(--mono)", fontSize: 9, color: isOverdue ? "var(--red)" : "var(--ink-faint)", letterSpacing: "0.5px" }}>
              {deadline}
            </div>
          )}
        </div>
      </div>

      {/* Submitted URL */}
      {claim.submissionUrl && (
        <div style={{ fontFamily: "var(--mono)", fontSize: 11, color: "var(--ink-muted)", marginBottom: 8 }}>
          Submission: <a href={claim.submissionUrl} target="_blank" rel="noopener noreferrer" style={{ color: "var(--ink)", textDecoration: "underline" }}>{claim.submissionUrl}</a>
        </div>
      )}

      {/* Submission form for active claims */}
      {isActive && !submitted && (
        <div>
          {!expanded ? (
            <button
              onClick={() => setExpanded(true)}
              style={{ fontFamily: "var(--mono)", fontSize: 10, letterSpacing: "1.5px", textTransform: "uppercase", color: "var(--red)", background: "transparent", border: "none", cursor: "pointer", padding: 0, marginTop: 8 }}
            >
              Submit work →
            </button>
          ) : (
            <SubmitForm claim={claim} onDone={() => { setExpanded(false); setSubmitted(true); }} />
          )}
        </div>
      )}

      {(submitted || claim.status === "submitted") && !expanded && (
        <div style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--ink-muted)", marginTop: 8 }}>
          Awaiting founder review. You'll be notified when a decision is made.
        </div>
      )}
    </div>
  );
}

export default function ClaimsPage() {
  const { user, authenticated, login } = usePrivy();

  const convexUser = useQuery(
    api.users.getByPrivyId,
    authenticated && user ? { privyId: user.id } : "skip"
  );

  const claims = useQuery(
    api.claims.getByAgent,
    convexUser ? { agentId: convexUser._id } : "skip"
  ) as Claim[] | undefined;

  const active = claims?.filter(c => c.status === "active") ?? [];
  const submitted = claims?.filter(c => c.status === "submitted") ?? [];
  const completed = claims?.filter(c => c.status === "approved" || c.status === "rejected") ?? [];

  if (!authenticated) {
    return (
      <>
        <Nav active="dashboard" />
        <div className="frame" style={{ paddingTop: 60, paddingBottom: 80 }}>
          <DashNav active="My Claims" />
          <div style={{ textAlign: "center", padding: "80px 0" }}>
            <div style={{ fontFamily: "var(--serif)", fontSize: 24, marginBottom: 12 }}>Connect your wallet to see your claims.</div>
            <p style={{ fontSize: 14, color: "var(--ink-muted)", marginBottom: 32 }}>Your claims and equity are tied to your wallet address.</p>
            <button className="claim-btn" onClick={login}>Connect Wallet</button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Nav active="dashboard" />

      <div className="frame" style={{ paddingTop: 60, paddingBottom: 80 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 32 }}>
          <div>
            <div className="ed-label">Dashboard</div>
            <h1 style={{ fontFamily: "var(--serif)", fontSize: "clamp(24px, 3vw, 36px)", lineHeight: 1.15 }}>My Claims</h1>
          </div>
          <Link href="/bounties" className="claim-btn">Find bounties</Link>
        </div>

        <DashNav active="My Claims" />

        {claims === undefined ? (
          <div style={{ fontFamily: "var(--mono)", fontSize: 11, color: "var(--ink-faint)", textAlign: "center", padding: "60px 0" }}>Loading...</div>
        ) : claims.length === 0 ? (
          <div style={{ textAlign: "center", padding: "80px 0" }}>
            <div style={{ fontFamily: "var(--serif)", fontSize: 22, marginBottom: 12 }}>No active claims.</div>
            <p style={{ fontSize: 14, color: "var(--ink-muted)", marginBottom: 32 }}>Browse the bounty board to find work that matches your skills.</p>
            <Link href="/bounties?status=open" className="claim-btn">Browse open bounties</Link>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 40 }}>
            {/* Active */}
            {active.length > 0 && (
              <div>
                <div style={{ fontFamily: "var(--mono)", fontSize: 10, letterSpacing: "3px", textTransform: "uppercase", color: "var(--ink-muted)", marginBottom: 16, paddingBottom: 12, borderBottom: "1px solid var(--rule)" }}>
                  In Progress — {active.length}
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {active.map(c => <ClaimCard key={c._id} claim={c} />)}
                </div>
              </div>
            )}

            {/* Submitted */}
            {submitted.length > 0 && (
              <div>
                <div style={{ fontFamily: "var(--mono)", fontSize: 10, letterSpacing: "3px", textTransform: "uppercase", color: "var(--ink-muted)", marginBottom: 16, paddingBottom: 12, borderBottom: "1px solid var(--rule)" }}>
                  Under Review — {submitted.length}
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {submitted.map(c => <ClaimCard key={c._id} claim={c} />)}
                </div>
              </div>
            )}

            {/* Completed */}
            {completed.length > 0 && (
              <div>
                <div style={{ fontFamily: "var(--mono)", fontSize: 10, letterSpacing: "3px", textTransform: "uppercase", color: "var(--ink-muted)", marginBottom: 16, paddingBottom: 12, borderBottom: "1px solid var(--rule)" }}>
                  Completed — {completed.length}
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {completed.map(c => <ClaimCard key={c._id} claim={c} />)}
                </div>
              </div>
            )}
          </div>
        )}
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
