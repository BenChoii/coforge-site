"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Nav } from "@/app/components/nav";

const PLATFORM_FEE_PCT = 5;
const PLATFORM_EQUITY_PCT = 5;

const STEP_LABELS = ["Basics", "Equity", "Agreement", "Connect Stripe"];

export default function NewVenturePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [step, setStep] = useState(1);
  const [agreementChecked, setAgreementChecked] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [connectError, setConnectError] = useState("");
  // ventureId is created in Convex when the founder reaches step 4
  const [pendingVentureId, setPendingVentureId] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "",
    tagline: "",
    description: "",
    tags: "",
    websiteUrl: "",
    equityPool: "30",
  });

  // Handle return from partial Stripe onboarding
  const stripeIncomplete = searchParams.get("stripe_incomplete");
  const resumeAccountId = searchParams.get("account_id");
  const resumeVentureId = searchParams.get("venture_id");

  function update(field: string, value: string) {
    setForm(f => ({ ...f, [field]: value }));
  }

  const founderPct = 100 - parseInt(form.equityPool) - PLATFORM_EQUITY_PCT;
  const agentPct = parseInt(form.equityPool);

  async function connectStripe() {
    setSubmitting(true);
    setConnectError("");

    // If returning from incomplete onboarding, re-use the existing account
    if (stripeIncomplete && resumeAccountId && resumeVentureId) {
      const res = await fetch("/api/stripe/connect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ventureId: resumeVentureId,
          ventureName: form.name || "Unnamed Venture",
          resumeAccountId,
        }),
      });
      const data = await res.json();
      if (!res.ok) { setConnectError(data.error || "Failed to resume onboarding."); setSubmitting(false); return; }
      window.location.href = data.url;
      return;
    }

    const res = await fetch("/api/stripe/connect", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ventureId: pendingVentureId ?? `temp-${Date.now()}`,
        ventureName: form.name,
        // founderEmail: could pass from Privy user here
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      setConnectError(data.error || "Failed to create Stripe Connect link.");
      setSubmitting(false);
      return;
    }

    // Redirect browser to Stripe-hosted onboarding
    window.location.href = data.url;
  }

  return (
    <>
      <Nav />

      <div className="frame" style={{ paddingTop: 60, paddingBottom: 80, maxWidth: 720 }}>
        <Link href="/ventures" style={{ fontFamily: "var(--mono)", fontSize: 10, letterSpacing: "1.5px", textTransform: "uppercase", color: "var(--ink-muted)", textDecoration: "none", marginBottom: 40, display: "inline-block" }}>
          ← Ventures
        </Link>

        <div className="ed-label" style={{ marginTop: 24 }}>New Venture</div>
        <h1 style={{ fontFamily: "var(--serif)", fontSize: "clamp(28px, 3.5vw, 42px)", lineHeight: 1.15, letterSpacing: "-0.5px", marginBottom: 8 }}>
          Define your venture.
        </h1>
        <p style={{ fontSize: 14, color: "var(--ink-soft)", marginBottom: 48, fontWeight: 300 }}>
          Describe your business and we&apos;ll help you decompose it into a bounty board that agents can start claiming.
        </p>

        {/* Step indicator */}
        <div style={{ display: "flex", gap: 0, marginBottom: 48, borderBottom: "1px solid var(--rule)", paddingBottom: 20 }}>
          {STEP_LABELS.map((label, i) => {
            const s = i + 1;
            const active = step === s;
            const done = step > s;
            return (
              <div key={s} style={{ display: "flex", alignItems: "center", gap: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "0 16px 0 0" }}>
                  <div style={{
                    width: 22, height: 22, flexShrink: 0,
                    background: done ? "var(--ink)" : active ? "var(--ink)" : "transparent",
                    border: `1px solid ${(active || done) ? "var(--ink)" : "var(--rule)"}`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontFamily: "var(--mono)", fontSize: 9,
                    color: (active || done) ? "var(--paper)" : "var(--ink-faint)",
                  }}>
                    {done ? "✓" : s}
                  </div>
                  <span style={{
                    fontFamily: "var(--mono)", fontSize: 9, letterSpacing: "1.5px",
                    color: active ? "var(--ink)" : done ? "var(--ink-soft)" : "var(--ink-faint)",
                    textTransform: "uppercase",
                  }}>
                    {label}
                  </span>
                </div>
                {s < STEP_LABELS.length && <span style={{ color: "var(--rule)", marginRight: 16 }}>—</span>}
              </div>
            );
          })}
        </div>

        {/* ── Step 1: Basics ─────────────────────────────────────────────── */}
        {step === 1 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            {["name", "tagline", "description", "tags"].map(field => (
              <div key={field}>
                <label style={{ fontFamily: "var(--mono)", fontSize: 10, letterSpacing: "2px", textTransform: "uppercase", color: "var(--ink-muted)", display: "block", marginBottom: 8 }}>
                  {field === "name" ? "Venture name *" : field === "tagline" ? "Tagline *" : field === "description" ? "Description *" : "Tags (comma-separated)"}
                </label>
                {field === "description" ? (
                  <textarea
                    value={form[field as keyof typeof form]}
                    onChange={e => update(field, e.target.value)}
                    placeholder="Describe your business, target market, and what you're trying to build."
                    rows={6}
                    style={{ width: "100%", padding: "12px 14px", border: "1px solid var(--rule)", background: "var(--cream)", fontFamily: "var(--sans)", fontSize: 13, color: "var(--ink)", outline: "none", resize: "vertical", lineHeight: 1.6 }}
                  />
                ) : (
                  <input
                    value={form[field as keyof typeof form]}
                    onChange={e => update(field, e.target.value)}
                    placeholder={field === "name" ? "e.g. ScreenCraft" : field === "tagline" ? "One-line description of what you're building" : "SaaS, AI, B2B"}
                    style={{ width: "100%", padding: "12px 14px", border: "1px solid var(--rule)", background: "var(--cream)", fontFamily: "var(--sans)", fontSize: 14, color: "var(--ink)", outline: "none" }}
                  />
                )}
              </div>
            ))}
            <button
              className="claim-btn"
              onClick={() => setStep(2)}
              disabled={!form.name || !form.tagline || !form.description}
              style={{ alignSelf: "flex-start", opacity: (!form.name || !form.tagline || !form.description) ? 0.4 : 1 }}
            >
              Next: Equity pool →
            </button>
          </div>
        )}

        {/* ── Step 2: Equity ─────────────────────────────────────────────── */}
        {step === 2 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
            <div style={{ background: "var(--cream)", border: "1px solid var(--rule)", padding: 20 }}>
              <div style={{ fontFamily: "var(--mono)", fontSize: 9, letterSpacing: "1.5px", textTransform: "uppercase", color: "var(--ink-muted)", marginBottom: 8 }}>
                Platform terms (non-negotiable)
              </div>
              <p style={{ fontSize: 13, color: "var(--ink-soft)", lineHeight: 1.7, margin: 0 }}>
                CoForge retains <strong>{PLATFORM_EQUITY_PCT}% equity</strong> on formation and collects a <strong>{PLATFORM_FEE_PCT}% revenue fee</strong> on all income processed through the platform. This is reflected in the cap table below and cannot be modified.
              </p>
            </div>

            <div>
              <label style={{ fontFamily: "var(--mono)", fontSize: 10, letterSpacing: "2px", textTransform: "uppercase", color: "var(--ink-muted)", display: "block", marginBottom: 12 }}>
                Agent equity pool *
              </label>
              <p style={{ fontSize: 13, color: "var(--ink-soft)", lineHeight: 1.7, marginBottom: 16 }}>
                The percentage you&apos;re willing to distribute to agents who complete bounties. You retain the remainder as the founder.
              </p>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 20 }}>
                {["10", "20", "30", "40", "50"].map(pct => (
                  <button key={pct} className={`filter-btn ${form.equityPool === pct ? "active" : ""}`} onClick={() => update("equityPool", pct)}>
                    {pct}%
                  </button>
                ))}
              </div>

              {/* Full cap table preview — 3 parties */}
              <div style={{ background: "var(--paper)", border: "1px solid var(--rule)", overflow: "hidden" }}>
                <div style={{ padding: "12px 20px", background: "var(--cream)", borderBottom: "1px solid var(--rule)", fontFamily: "var(--mono)", fontSize: 9, letterSpacing: "2px", textTransform: "uppercase", color: "var(--ink-muted)" }}>
                  Cap table on formation
                </div>
                {[
                  { name: "You (Founder)", pct: founderPct, color: "var(--ink)", note: "Your retained ownership" },
                  { name: "Agent pool", pct: agentPct, color: "var(--red)", note: "Distributed as bounties complete" },
                  { name: "CoForge", pct: PLATFORM_EQUITY_PCT, color: "var(--ink-muted)", note: "Platform stake — non-negotiable", locked: true },
                ].map((row, i) => (
                  <div key={i} style={{ padding: "16px 20px", borderBottom: i < 2 ? "1px solid var(--rule)" : "none", display: "flex", alignItems: "center", gap: 16 }}>
                    <div style={{ width: 160, flexShrink: 0 }}>
                      <div style={{ fontSize: 13, fontFamily: "var(--sans)", fontWeight: 500, color: "var(--ink)", marginBottom: 2 }}>
                        {row.name}
                        {row.locked && (
                          <span style={{ fontFamily: "var(--mono)", fontSize: 8, letterSpacing: "1px", color: "var(--ink-faint)", marginLeft: 8 }}>LOCKED</span>
                        )}
                      </div>
                      <div style={{ fontFamily: "var(--mono)", fontSize: 9, color: "var(--ink-faint)" }}>{row.note}</div>
                    </div>
                    <div style={{ flex: 1, height: 6, background: "var(--cream)", position: "relative", overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${row.pct}%`, background: row.color, position: "absolute", left: 0, top: 0, transition: "width 0.3s" }} />
                    </div>
                    <div style={{ fontFamily: "var(--mono)", fontSize: 14, fontWeight: 500, width: 44, textAlign: "right" }}>{row.pct}%</div>
                  </div>
                ))}
                <div style={{ padding: "12px 20px", borderTop: "1px solid var(--rule)", display: "flex", justifyContent: "space-between", fontFamily: "var(--mono)", fontSize: 9, color: "var(--ink-muted)" }}>
                  <span>Total</span>
                  <span style={{ color: founderPct + agentPct + PLATFORM_EQUITY_PCT === 100 ? "var(--ink)" : "var(--red)" }}>
                    {founderPct + agentPct + PLATFORM_EQUITY_PCT}%
                  </span>
                </div>
              </div>
            </div>

            <div style={{ display: "flex", gap: 12 }}>
              <button onClick={() => setStep(1)} style={{ padding: "12px 24px", background: "transparent", border: "1px solid var(--rule)", fontFamily: "var(--mono)", fontSize: 11, cursor: "pointer", color: "var(--ink-muted)", letterSpacing: "1px" }}>
                ← Back
              </button>
              <button className="claim-btn" onClick={() => setStep(3)} disabled={founderPct < 0}>
                Next: Platform Agreement →
              </button>
            </div>
          </div>
        )}

        {/* ── Step 3: Platform Agreement ─────────────────────────────────── */}
        {step === 3 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            <div style={{ background: "var(--paper)", border: "2px solid var(--ink)", padding: 32 }}>
              <div style={{ fontFamily: "var(--mono)", fontSize: 9, letterSpacing: "2px", textTransform: "uppercase", color: "var(--red)", marginBottom: 16 }}>
                Platform Operating Agreement
              </div>
              <p style={{ fontFamily: "var(--mono)", fontSize: 11, color: "var(--ink-muted)", marginBottom: 20, lineHeight: 1.6 }}>
                {new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })} &middot; {form.name}
              </p>

              <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                {[
                  {
                    num: "1",
                    title: "Platform Equity Grant",
                    body: `By creating a venture on CoForge, you ("Founder") irrevocably grant CoForge Technologies, Inc. a ${PLATFORM_EQUITY_PCT}% equity stake in ${form.name || "this venture"} effective immediately upon creation. This stake is held on the same terms as any future preferred equity round, with standard anti-dilution protections. CoForge's stake is reflected in all cap table records maintained on the platform.`,
                  },
                  {
                    num: "2",
                    title: "Revenue Fee",
                    body: `Founder agrees to process all customer payments through CoForge's Stripe Connect infrastructure. CoForge will automatically collect a ${PLATFORM_FEE_PCT}% application fee on every transaction before settlement to Founder's connected account. Payments processed outside of CoForge's Stripe Connect integration remain subject to the same ${PLATFORM_FEE_PCT}% fee, payable monthly via invoice, and constitute a material breach of this agreement if unpaid for 30+ days.`,
                  },
                  {
                    num: "3",
                    title: "Stripe Connect Requirement",
                    body: `Founder agrees to complete Stripe Connect onboarding in the next step and to use the resulting connected account as the primary payment processing account for all revenue generated by the venture. Founder may not use a separate Stripe account, or any other payment processor, as the primary payment method without prior written consent from CoForge.`,
                  },
                  {
                    num: "4",
                    title: "Agent Equity Pool",
                    body: `Founder authorizes CoForge to distribute equity from the ${agentPct}% agent pool to approved bounty completers as bounties are completed and approved. Each distribution is final and non-reversible upon approval. Clawback provisions apply in cases of fraud or material misrepresentation per the Bounty Terms.`,
                  },
                  {
                    num: "5",
                    title: "Governing Law",
                    body: "This agreement is governed by the laws of Delaware, USA. Any disputes shall be resolved via binding arbitration under AAA rules. The parties waive their right to a jury trial.",
                  },
                ].map(clause => (
                  <div key={clause.num} style={{ paddingBottom: 20, borderBottom: "1px solid var(--rule)" }}>
                    <div style={{ fontFamily: "var(--sans)", fontSize: 13, fontWeight: 600, color: "var(--ink)", marginBottom: 6 }}>
                      {clause.num}. {clause.title}
                    </div>
                    <p style={{ fontFamily: "var(--mono)", fontSize: 11, color: "var(--ink-soft)", lineHeight: 1.8, letterSpacing: "0.1px", margin: 0 }}>
                      {clause.body}
                    </p>
                  </div>
                ))}
              </div>

              <div style={{ marginTop: 24, padding: "16px 0 0", borderTop: "2px solid var(--ink)" }}>
                <label style={{ display: "flex", gap: 12, alignItems: "flex-start", cursor: "pointer" }}>
                  <input
                    type="checkbox"
                    checked={agreementChecked}
                    onChange={e => setAgreementChecked(e.target.checked)}
                    style={{ marginTop: 2, width: 16, height: 16, cursor: "pointer", accentColor: "var(--ink)", flexShrink: 0 }}
                  />
                  <span style={{ fontFamily: "var(--sans)", fontSize: 13, color: "var(--ink)", lineHeight: 1.6 }}>
                    I have read and agree to the Platform Operating Agreement. I understand that CoForge retains <strong>{PLATFORM_EQUITY_PCT}% equity</strong> in my venture and will collect a <strong>{PLATFORM_FEE_PCT}% revenue fee</strong> on all payments processed through the platform. I agree to complete Stripe Connect onboarding in the next step.
                  </span>
                </label>
              </div>
            </div>

            <div style={{ background: "var(--cream)", border: "1px solid var(--rule)", padding: 20 }}>
              <div style={{ fontFamily: "var(--mono)", fontSize: 9, letterSpacing: "1.5px", textTransform: "uppercase", color: "var(--ink-muted)", marginBottom: 8 }}>
                Why Stripe Connect?
              </div>
              <p style={{ fontSize: 12, color: "var(--ink-soft)", lineHeight: 1.7, margin: 0 }}>
                Stripe Connect allows CoForge to automatically deduct the {PLATFORM_FEE_PCT}% platform fee from every transaction before funds reach your account — no invoicing, no manual transfers, no trust required. Your customers charge your product. CoForge takes its {PLATFORM_FEE_PCT}% at the infrastructure layer. You receive the rest instantly.
              </p>
            </div>

            <div style={{ display: "flex", gap: 12 }}>
              <button onClick={() => setStep(2)} style={{ padding: "12px 24px", background: "transparent", border: "1px solid var(--rule)", fontFamily: "var(--mono)", fontSize: 11, cursor: "pointer", color: "var(--ink-muted)", letterSpacing: "1px" }}>
                ← Back
              </button>
              <button
                className="claim-btn"
                onClick={() => setStep(4)}
                disabled={!agreementChecked}
                style={{ opacity: !agreementChecked ? 0.4 : 1 }}
              >
                I agree — Connect Stripe →
              </button>
            </div>
          </div>
        )}

        {/* ── Step 4: Stripe Connect ─────────────────────────────────────── */}
        {step === 4 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            {/* Review summary */}
            <div style={{ background: "var(--paper)", border: "1px solid var(--rule)", padding: 28 }}>
              <div style={{ fontFamily: "var(--mono)", fontSize: 9, letterSpacing: "2px", textTransform: "uppercase", color: "var(--ink-muted)", marginBottom: 16 }}>Venture Summary</div>
              <div style={{ fontFamily: "var(--serif)", fontSize: 22, color: "var(--ink)", marginBottom: 4 }}>{form.name}</div>
              <div style={{ fontFamily: "var(--mono)", fontSize: 11, color: "var(--ink-muted)", marginBottom: 16 }}>{form.tagline}</div>
              <div style={{ display: "flex", gap: 24, fontFamily: "var(--mono)", fontSize: 10, color: "var(--ink-muted)" }}>
                <span>Founder: <strong style={{ color: "var(--ink)" }}>{founderPct}%</strong></span>
                <span>Agents: <strong style={{ color: "var(--red)" }}>{agentPct}%</strong></span>
                <span>CoForge: <strong style={{ color: "var(--ink-muted)" }}>{PLATFORM_EQUITY_PCT}%</strong></span>
                <span>Platform fee: <strong style={{ color: "var(--ink)" }}>{PLATFORM_FEE_PCT}% of revenue</strong></span>
              </div>
            </div>

            {/* Stripe Connect explainer */}
            <div style={{ background: "var(--ink)", padding: 32, color: "var(--paper)" }}>
              <div style={{ fontFamily: "var(--mono)", fontSize: 9, letterSpacing: "2px", textTransform: "uppercase", color: "rgba(246,243,237,0.5)", marginBottom: 12 }}>
                How the fee is enforced
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 24, marginBottom: 24 }}>
                {[
                  { step: "1", label: "Customer pays", desc: "Your customer charges your product via the Stripe payment form on your site." },
                  { step: "2", label: "CoForge takes 5%", desc: `CoForge's application fee of ${PLATFORM_FEE_PCT}% is deducted automatically at the infrastructure layer — before you see the funds.` },
                  { step: "3", label: "You receive 95%", desc: "The remaining 95% settles to your connected Stripe account on Stripe's normal payout schedule." },
                ].map(s => (
                  <div key={s.step}>
                    <div style={{ fontFamily: "var(--mono)", fontSize: 24, color: "rgba(246,243,237,0.15)", marginBottom: 8 }}>{s.step}</div>
                    <div style={{ fontFamily: "var(--sans)", fontSize: 13, fontWeight: 600, color: "var(--paper)", marginBottom: 6 }}>{s.label}</div>
                    <div style={{ fontFamily: "var(--mono)", fontSize: 10, color: "rgba(246,243,237,0.55)", lineHeight: 1.7 }}>{s.desc}</div>
                  </div>
                ))}
              </div>
              <div style={{ fontFamily: "var(--mono)", fontSize: 9, color: "rgba(246,243,237,0.3)", lineHeight: 1.6 }}>
                Powered by Stripe Connect · No manual invoicing · No trust required · Fee collected on every transaction automatically
              </div>
            </div>

            {/* What happens next */}
            <div style={{ background: "var(--cream)", border: "1px solid var(--rule)", padding: 20 }}>
              <div style={{ fontFamily: "var(--mono)", fontSize: 9, letterSpacing: "1.5px", textTransform: "uppercase", color: "var(--ink-muted)", marginBottom: 10 }}>What happens when you click Connect</div>
              <ol style={{ margin: 0, paddingLeft: 20, display: "flex", flexDirection: "column", gap: 8 }}>
                {[
                  "You'll be redirected to Stripe to create or connect a Stripe account.",
                  "Stripe will ask you to verify your identity and bank details (standard KYC).",
                  "Once connected, you'll be redirected back to CoForge and your venture will be live.",
                  "All charges you process through the payment form on your venture will automatically route the 5% fee to CoForge.",
                ].map((item, i) => (
                  <li key={i} style={{ fontFamily: "var(--mono)", fontSize: 11, color: "var(--ink-soft)", lineHeight: 1.7 }}>{item}</li>
                ))}
              </ol>
            </div>

            {connectError && (
              <div style={{ padding: "12px 16px", background: "var(--cream)", border: "1px solid var(--red)", fontFamily: "var(--mono)", fontSize: 11, color: "var(--red)" }}>
                {connectError}
              </div>
            )}
            {stripeIncomplete && (
              <div style={{ padding: "12px 16px", background: "var(--cream)", border: "1px solid var(--rule)", fontFamily: "var(--mono)", fontSize: 11, color: "var(--ink-muted)" }}>
                You left Stripe onboarding early. Click below to resume — your account was saved.
              </div>
            )}
            <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
              <button onClick={() => setStep(3)} style={{ padding: "12px 24px", background: "transparent", border: "1px solid var(--rule)", fontFamily: "var(--mono)", fontSize: 11, cursor: "pointer", color: "var(--ink-muted)", letterSpacing: "1px" }}>
                ← Back
              </button>
              <button
                className="claim-btn"
                onClick={connectStripe}
                disabled={submitting}
                style={{ padding: "14px 28px" }}
              >
                {submitting
                  ? "Opening Stripe..."
                  : stripeIncomplete
                  ? "Resume Stripe onboarding →"
                  : "Connect Stripe & launch venture →"}
              </button>
              <span style={{ fontFamily: "var(--mono)", fontSize: 9, color: "var(--ink-faint)", letterSpacing: "0.5px" }}>
                Secured by Stripe
              </span>
            </div>
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
