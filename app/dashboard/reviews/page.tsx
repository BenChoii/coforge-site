"use client";
import { useState } from "react";
import Link from "next/link";
import { Nav } from "@/app/components/nav";

const PENDING_REVIEWS = [
  {
    id: "pr1",
    bountyTitle: "Build payments dashboard with Stripe webhooks",
    venture: "ScreenCraft",
    submitter: "0x7f...a3d2",
    submittedAt: "Mar 22, 2026",
    submissionUrl: "https://github.com/screencraft/payments-dashboard/pull/14",
    equity: 3.2,
    aiScore: 87,
    aiNotes: "Code quality is strong. Stripe webhook handlers cover all major events (payment_intent.succeeded, customer.subscription.updated, invoice.payment_failed). Test coverage at 82%. Minor issue: rate limiting middleware is configured but not applied to the webhook endpoint. Recommend approval with a follow-up task for rate limiting.",
  },
  {
    id: "pr2",
    bountyTitle: "Implement document RAG pipeline",
    venture: "LegalLens",
    submitter: "0x3a...f1c8",
    submittedAt: "Mar 23, 2026",
    submissionUrl: "https://github.com/legallens/rag-pipeline/pull/7",
    equity: 4.5,
    aiScore: 72,
    aiNotes: "RAG pipeline functional but retrieval accuracy is below threshold on legal document edge cases. Embedding model choice (all-MiniLM-L6-v2) may be undersized for domain-specific legal text. Chunking strategy needs refinement. Recommend requesting changes: switch to a legal-domain embedding model and add evaluation benchmarks.",
  },
];

const ACTIVE_DISPUTES = [
  {
    id: "d1",
    bountyTitle: "Design brand system and marketing site",
    venture: "TutorAI",
    disputeReason: "Delivered brand assets do not match the style direction discussed in kickoff. Color palette is inconsistent with the education vertical. Logo does not work at small sizes.",
    filedDate: "Mar 20, 2026",
    status: "under_review" as const,
    submissionUrl: "https://github.com/tutorai/brand/pull/3",
    evaluatorNotes: "Reviewing original brief against deliverables. Initial assessment suggests partial alignment \u2014 color palette matches 2 of 4 specified colors, but typography choice diverges significantly from brief.",
  },
  {
    id: "d2",
    bountyTitle: "Write launch content and distribution strategy",
    venture: "ScreenCraft",
    disputeReason: "Content was largely AI-generated without the strategic depth required. Distribution plan lacks specific channel tactics and budget allocation.",
    filedDate: "Mar 18, 2026",
    status: "escalated" as const,
    submissionUrl: "https://github.com/screencraft/content/pull/5",
    evaluatorNotes: "Escalated to human arbitration. AI evaluation flagged 67% similarity to generic templates. Awaiting founder and peer review panel decision.",
  },
  {
    id: "d3",
    bountyTitle: "Customer onboarding flow with email sequences",
    venture: "TutorAI",
    disputeReason: "Email sequences were not tested and contained broken template variables. Onboarding flow had a critical bug on step 3.",
    filedDate: "Mar 12, 2026",
    status: "resolved_clawback" as const,
    submissionUrl: "https://github.com/tutorai/onboarding/pull/9",
    evaluatorNotes: "Confirmed critical defects. 50% clawback applied. Contributor retains 1.0% equity (originally 2.0%). Remaining 1.0% returned to venture pool.",
  },
];

const COMPLETED_BOUNTIES = [
  { id: "cb1", title: "Build payments dashboard with Stripe webhooks", venture: "ScreenCraft" },
  { id: "cb2", title: "Configure CI/CD, monitoring, and alerting", venture: "Metrik" },
  { id: "cb3", title: "Customer onboarding flow with email sequences", venture: "TutorAI" },
];

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; bg: string; color: string }> = {
    under_review: { label: "Under Review", bg: "var(--ink)", color: "var(--paper)" },
    escalated: { label: "Escalated", bg: "var(--red)", color: "var(--paper)" },
    resolved_clawback: { label: "Resolved \u2014 Clawback", bg: "var(--cream)", color: "var(--ink-muted)" },
    resolved_confirmed: { label: "Resolved \u2014 Confirmed", bg: "var(--cream)", color: "var(--ink-muted)" },
  };
  const s = map[status] || { label: status, bg: "var(--cream)", color: "var(--ink-muted)" };
  return (
    <span style={{
      fontFamily: "var(--mono)",
      fontSize: 9,
      letterSpacing: "1.5px",
      textTransform: "uppercase",
      padding: "3px 8px",
      background: s.bg,
      color: s.color,
      display: "inline-block",
      whiteSpace: "nowrap",
    }}>
      {s.label}
    </span>
  );
}

export default function ReviewsPage() {
  const [expandedReview, setExpandedReview] = useState<string | null>(null);
  const [expandedDispute, setExpandedDispute] = useState<string | null>(null);
  const [reviewActions, setReviewActions] = useState<Record<string, string>>({});
  const [disputeForm, setDisputeForm] = useState({ bountyId: "", reason: "", evidenceUrl: "" });
  const [disputeFiled, setDisputeFiled] = useState(false);

  function handleReviewAction(reviewId: string, action: string) {
    setReviewActions(prev => ({ ...prev, [reviewId]: action }));
  }

  function fileDispute() {
    if (!disputeForm.bountyId || !disputeForm.reason) return;
    setDisputeFiled(true);
  }

  return (
    <>
      <Nav active="dashboard" />

      <div className="frame" style={{ paddingTop: 60, paddingBottom: 80 }}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 48 }}>
          <div>
            <div className="ed-label">Evaluations &amp; Disputes</div>
            <h1 style={{ fontFamily: "var(--serif)", fontSize: "clamp(28px, 3.5vw, 42px)", lineHeight: 1.15 }}>
              Review submissions.<br />Resolve disputes.
            </h1>
          </div>
          <Link href="/dashboard" style={{ fontFamily: "var(--mono)", fontSize: 10, letterSpacing: "1.5px", textTransform: "uppercase", color: "var(--ink-muted)", textDecoration: "none" }}>
            &larr; Back to dashboard
          </Link>
        </div>

        {/* Section 1: Pending Reviews */}
        <div className="dash-section">
          <div className="dash-section-title">Pending Reviews</div>
          {PENDING_REVIEWS.map(review => (
            <div key={review.id} style={{ background: "var(--paper)", border: "1px solid var(--rule)", marginBottom: 12 }}>
              <div
                style={{ padding: 24, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16, cursor: "pointer" }}
                onClick={() => setExpandedReview(expandedReview === review.id ? null : review.id)}
              >
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: "var(--serif)", fontSize: 16, color: "var(--ink)", marginBottom: 4 }}>{review.bountyTitle}</div>
                  <div style={{ fontFamily: "var(--mono)", fontSize: 10, letterSpacing: "1.5px", color: "var(--ink-muted)", textTransform: "uppercase" }}>
                    {review.venture} &middot; Submitted by {review.submitter} &middot; {review.submittedAt}
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 16, flexShrink: 0 }}>
                  <span style={{ fontFamily: "var(--mono)", fontSize: 16, fontWeight: 500, color: "var(--red)" }}>{review.equity}%</span>
                  <span style={{ fontFamily: "var(--mono)", fontSize: 11, color: "var(--ink-muted)" }}>
                    {expandedReview === review.id ? "\u25B2" : "Evaluate \u25BC"}
                  </span>
                </div>
              </div>

              {expandedReview === review.id && (
                <div style={{ borderTop: "1px solid var(--rule)", padding: 24 }}>
                  {/* Submission URL */}
                  <div style={{ marginBottom: 20 }}>
                    <div style={{ fontFamily: "var(--mono)", fontSize: 9, letterSpacing: "1.5px", textTransform: "uppercase", color: "var(--ink-muted)", marginBottom: 6 }}>
                      Submission
                    </div>
                    <a href={review.submissionUrl} target="_blank" rel="noopener noreferrer" style={{ fontFamily: "var(--mono)", fontSize: 12, color: "var(--red)", wordBreak: "break-all" }}>
                      {review.submissionUrl}
                    </a>
                  </div>

                  {/* AI Evaluation */}
                  <div style={{ background: "var(--cream)", border: "1px solid var(--rule)", padding: 24, marginBottom: 20 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                      <div style={{ fontFamily: "var(--mono)", fontSize: 9, letterSpacing: "1.5px", textTransform: "uppercase", color: "var(--ink-muted)" }}>
                        AI Evaluation
                      </div>
                      <div style={{ fontFamily: "var(--serif)", fontSize: 28, fontWeight: 500, color: review.aiScore >= 80 ? "var(--ink)" : "var(--red)" }}>
                        {review.aiScore}<span style={{ fontSize: 14, color: "var(--ink-muted)" }}>/100</span>
                      </div>
                    </div>
                    <p style={{ fontFamily: "var(--mono)", fontSize: 12, color: "var(--ink-soft)", lineHeight: 1.8, letterSpacing: "0.2px" }}>
                      {review.aiNotes}
                    </p>
                  </div>

                  {/* Actions */}
                  {reviewActions[review.id] ? (
                    <div style={{
                      padding: 20,
                      background: reviewActions[review.id] === "approved" ? "var(--ink)" : "var(--cream)",
                      color: reviewActions[review.id] === "approved" ? "var(--paper)" : "var(--ink)",
                      fontFamily: "var(--mono)",
                      fontSize: 12,
                      letterSpacing: "0.5px",
                    }}>
                      {reviewActions[review.id] === "approved" && (
                        <>Equity distributed. {review.equity}% minted to {review.submitter}</>
                      )}
                      {reviewActions[review.id] === "changes" && (
                        <>Changes requested. Contributor notified. Awaiting resubmission.</>
                      )}
                      {reviewActions[review.id] === "rejected" && (
                        <>Submission rejected. Bounty returned to open pool.</>
                      )}
                    </div>
                  ) : (
                    <div style={{ display: "flex", gap: 12 }}>
                      <button onClick={() => handleReviewAction(review.id, "approved")} className="claim-btn">
                        Accept
                      </button>
                      <button
                        onClick={() => handleReviewAction(review.id, "changes")}
                        style={{
                          fontFamily: "var(--sans)",
                          fontSize: 11,
                          fontWeight: 600,
                          letterSpacing: "1px",
                          textTransform: "uppercase",
                          padding: "10px 20px",
                          background: "transparent",
                          color: "var(--ink)",
                          border: "1px solid var(--ink)",
                          cursor: "pointer",
                        }}
                      >
                        Request Changes
                      </button>
                      <button
                        onClick={() => handleReviewAction(review.id, "rejected")}
                        style={{
                          fontFamily: "var(--sans)",
                          fontSize: 11,
                          fontWeight: 600,
                          letterSpacing: "1px",
                          textTransform: "uppercase",
                          padding: "10px 20px",
                          background: "transparent",
                          color: "var(--red)",
                          border: "1px solid var(--red)",
                          cursor: "pointer",
                        }}
                      >
                        Reject
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Section 2: Active Disputes */}
        <div className="dash-section">
          <div className="dash-section-title">Active Disputes</div>
          {ACTIVE_DISPUTES.map(dispute => (
            <div key={dispute.id} style={{ background: "var(--paper)", border: "1px solid var(--rule)", marginBottom: 12 }}>
              <div
                style={{ padding: 24, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16, cursor: "pointer" }}
                onClick={() => setExpandedDispute(expandedDispute === dispute.id ? null : dispute.id)}
              >
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: "var(--serif)", fontSize: 16, color: "var(--ink)", marginBottom: 4 }}>{dispute.bountyTitle}</div>
                  <div style={{ fontFamily: "var(--mono)", fontSize: 10, letterSpacing: "1.5px", color: "var(--ink-muted)", textTransform: "uppercase" }}>
                    {dispute.venture} &middot; Filed {dispute.filedDate}
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 12, flexShrink: 0 }}>
                  <StatusBadge status={dispute.status} />
                  <span style={{ fontFamily: "var(--mono)", fontSize: 11, color: "var(--ink-muted)" }}>
                    {expandedDispute === dispute.id ? "\u25B2" : "\u25BC"}
                  </span>
                </div>
              </div>

              {expandedDispute === dispute.id && (
                <div style={{ borderTop: "1px solid var(--rule)", padding: 24 }}>
                  {/* Original submission */}
                  <div style={{ marginBottom: 20 }}>
                    <div style={{ fontFamily: "var(--mono)", fontSize: 9, letterSpacing: "1.5px", textTransform: "uppercase", color: "var(--ink-muted)", marginBottom: 6 }}>
                      Original Submission
                    </div>
                    <a href={dispute.submissionUrl} target="_blank" rel="noopener noreferrer" style={{ fontFamily: "var(--mono)", fontSize: 12, color: "var(--red)", wordBreak: "break-all" }}>
                      {dispute.submissionUrl}
                    </a>
                  </div>

                  {/* Dispute reason */}
                  <div style={{ marginBottom: 20 }}>
                    <div style={{ fontFamily: "var(--mono)", fontSize: 9, letterSpacing: "1.5px", textTransform: "uppercase", color: "var(--ink-muted)", marginBottom: 6 }}>
                      Dispute Reason
                    </div>
                    <p style={{ fontSize: 13, color: "var(--ink-soft)", lineHeight: 1.6 }}>
                      {dispute.disputeReason}
                    </p>
                  </div>

                  {/* Evaluator notes */}
                  <div style={{ background: "var(--cream)", border: "1px solid var(--rule)", padding: 20, marginBottom: 20 }}>
                    <div style={{ fontFamily: "var(--mono)", fontSize: 9, letterSpacing: "1.5px", textTransform: "uppercase", color: "var(--ink-muted)", marginBottom: 8 }}>
                      Evaluator Notes
                    </div>
                    <p style={{ fontFamily: "var(--mono)", fontSize: 12, color: "var(--ink-soft)", lineHeight: 1.8, letterSpacing: "0.2px" }}>
                      {dispute.evaluatorNotes}
                    </p>
                  </div>

                  {/* Resolution options (only for active disputes) */}
                  {(dispute.status === "under_review" || dispute.status === "escalated") && (
                    <div>
                      <div style={{ fontFamily: "var(--mono)", fontSize: 9, letterSpacing: "1.5px", textTransform: "uppercase", color: "var(--ink-muted)", marginBottom: 12 }}>
                        Resolution Options
                      </div>
                      <div style={{ display: "flex", gap: 12 }}>
                        <button className="claim-btn">
                          Confirm payout
                        </button>
                        <button
                          style={{
                            fontFamily: "var(--sans)",
                            fontSize: 11,
                            fontWeight: 600,
                            letterSpacing: "1px",
                            textTransform: "uppercase",
                            padding: "10px 20px",
                            background: "transparent",
                            color: "var(--ink)",
                            border: "1px solid var(--ink)",
                            cursor: "pointer",
                          }}
                        >
                          Partial clawback (50%)
                        </button>
                        <button
                          style={{
                            fontFamily: "var(--sans)",
                            fontSize: 11,
                            fontWeight: 600,
                            letterSpacing: "1px",
                            textTransform: "uppercase",
                            padding: "10px 20px",
                            background: "transparent",
                            color: "var(--red)",
                            border: "1px solid var(--red)",
                            cursor: "pointer",
                          }}
                        >
                          Full clawback
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Section 3: File a Dispute */}
        <div className="dash-section">
          <div className="dash-section-title">File a Dispute</div>
          <div style={{ background: "var(--paper)", border: "1px solid var(--rule)", padding: 32 }}>
            {disputeFiled ? (
              <div style={{ textAlign: "center", padding: "20px 0" }}>
                <div style={{ fontFamily: "var(--serif)", fontSize: 20, color: "var(--ink)", marginBottom: 8 }}>Dispute filed.</div>
                <p style={{ fontSize: 13, color: "var(--ink-muted)", marginBottom: 20 }}>
                  Your dispute has been submitted and is under review. You&apos;ll be notified when an evaluator responds.
                </p>
                <button
                  onClick={() => { setDisputeFiled(false); setDisputeForm({ bountyId: "", reason: "", evidenceUrl: "" }); }}
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
                  File another
                </button>
              </div>
            ) : (
              <>
                {/* Bounty select */}
                <div style={{ marginBottom: 20 }}>
                  <div style={{ fontFamily: "var(--mono)", fontSize: 9, letterSpacing: "1.5px", textTransform: "uppercase", color: "var(--ink-muted)", marginBottom: 8 }}>
                    Select Completed Bounty
                  </div>
                  <select
                    value={disputeForm.bountyId}
                    onChange={e => setDisputeForm(prev => ({ ...prev, bountyId: e.target.value }))}
                    style={{
                      width: "100%",
                      padding: "12px 14px",
                      border: "1px solid var(--rule)",
                      background: "var(--cream)",
                      fontFamily: "var(--sans)",
                      fontSize: 13,
                      color: disputeForm.bountyId ? "var(--ink)" : "var(--ink-faint)",
                      outline: "none",
                    }}
                  >
                    <option value="">Choose a bounty...</option>
                    {COMPLETED_BOUNTIES.map(b => (
                      <option key={b.id} value={b.id}>{b.title} ({b.venture})</option>
                    ))}
                  </select>
                </div>

                {/* Reason */}
                <div style={{ marginBottom: 20 }}>
                  <div style={{ fontFamily: "var(--mono)", fontSize: 9, letterSpacing: "1.5px", textTransform: "uppercase", color: "var(--ink-muted)", marginBottom: 8 }}>
                    Reason for Dispute
                  </div>
                  <textarea
                    value={disputeForm.reason}
                    onChange={e => setDisputeForm(prev => ({ ...prev, reason: e.target.value }))}
                    placeholder="Describe why you are disputing this completed bounty..."
                    style={{
                      width: "100%",
                      minHeight: 120,
                      padding: "12px 14px",
                      border: "1px solid var(--rule)",
                      background: "var(--cream)",
                      fontFamily: "var(--sans)",
                      fontSize: 13,
                      lineHeight: 1.6,
                      color: "var(--ink)",
                      resize: "vertical",
                      outline: "none",
                    }}
                  />
                </div>

                {/* Evidence URL */}
                <div style={{ marginBottom: 24 }}>
                  <div style={{ fontFamily: "var(--mono)", fontSize: 9, letterSpacing: "1.5px", textTransform: "uppercase", color: "var(--ink-muted)", marginBottom: 8 }}>
                    Evidence (URL)
                  </div>
                  <input
                    type="url"
                    value={disputeForm.evidenceUrl}
                    onChange={e => setDisputeForm(prev => ({ ...prev, evidenceUrl: e.target.value }))}
                    placeholder="https://..."
                    style={{
                      width: "100%",
                      padding: "12px 14px",
                      border: "1px solid var(--rule)",
                      background: "var(--cream)",
                      fontFamily: "var(--sans)",
                      fontSize: 13,
                      color: "var(--ink)",
                      outline: "none",
                    }}
                  />
                </div>

                <button
                  onClick={fileDispute}
                  disabled={!disputeForm.bountyId || !disputeForm.reason}
                  className="claim-btn"
                  style={{ opacity: (!disputeForm.bountyId || !disputeForm.reason) ? 0.4 : 1 }}
                >
                  File Dispute
                </button>
              </>
            )}
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
