"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function NewVenturePage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    name: "",
    tagline: "",
    description: "",
    tags: "",
    websiteUrl: "",
    equityPool: "30",
  });
  const [submitting, setSubmitting] = useState(false);

  function update(field: string, value: string) {
    setForm(f => ({ ...f, [field]: value }));
  }

  async function submit() {
    setSubmitting(true);
    // TODO: call Convex ventures.create mutation
    await new Promise(r => setTimeout(r, 800));
    router.push("/ventures");
  }

  return (
    <>
      <nav className="site-nav">
        <div className="frame nav-inner">
          <Link href="/" className="wordmark">Coforge</Link>
          <div className="nav-right">
            <Link href="/bounties">Bounties</Link>
            <Link href="/ventures">Ventures</Link>
            <Link href="/dashboard">Dashboard</Link>
          </div>
        </div>
      </nav>

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
        <div style={{ display: "flex", gap: 8, marginBottom: 40 }}>
          {[1, 2, 3].map(s => (
            <div key={s} style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{
                width: 24, height: 24,
                background: step >= s ? "var(--ink)" : "transparent",
                border: `1px solid ${step >= s ? "var(--ink)" : "var(--rule)"}`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontFamily: "var(--mono)", fontSize: 10, color: step >= s ? "var(--paper)" : "var(--ink-muted)",
              }}>{s}</div>
              <span style={{ fontFamily: "var(--mono)", fontSize: 10, letterSpacing: "1px", color: step >= s ? "var(--ink)" : "var(--ink-faint)", textTransform: "uppercase" }}>
                {s === 1 ? "Basics" : s === 2 ? "Equity" : "Review"}
              </span>
              {s < 3 && <span style={{ color: "var(--rule)", marginLeft: 8 }}>—</span>}
            </div>
          ))}
        </div>

        {step === 1 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            <div>
              <label style={{ fontFamily: "var(--mono)", fontSize: 10, letterSpacing: "2px", textTransform: "uppercase", color: "var(--ink-muted)", display: "block", marginBottom: 8 }}>
                Venture name *
              </label>
              <input
                value={form.name}
                onChange={e => update("name", e.target.value)}
                placeholder="e.g. ScreenCraft"
                style={{ width: "100%", padding: "12px 14px", border: "1px solid var(--rule)", background: "var(--cream)", fontFamily: "var(--sans)", fontSize: 14, color: "var(--ink)", outline: "none" }}
              />
            </div>
            <div>
              <label style={{ fontFamily: "var(--mono)", fontSize: 10, letterSpacing: "2px", textTransform: "uppercase", color: "var(--ink-muted)", display: "block", marginBottom: 8 }}>
                Tagline *
              </label>
              <input
                value={form.tagline}
                onChange={e => update("tagline", e.target.value)}
                placeholder="One-line description of what you're building"
                style={{ width: "100%", padding: "12px 14px", border: "1px solid var(--rule)", background: "var(--cream)", fontFamily: "var(--sans)", fontSize: 14, color: "var(--ink)", outline: "none" }}
              />
            </div>
            <div>
              <label style={{ fontFamily: "var(--mono)", fontSize: 10, letterSpacing: "2px", textTransform: "uppercase", color: "var(--ink-muted)", display: "block", marginBottom: 8 }}>
                Description *
              </label>
              <textarea
                value={form.description}
                onChange={e => update("description", e.target.value)}
                placeholder="Describe your business, target market, and what you're trying to build. The more detail, the better bounties we can generate."
                rows={6}
                style={{ width: "100%", padding: "12px 14px", border: "1px solid var(--rule)", background: "var(--cream)", fontFamily: "var(--sans)", fontSize: 13, color: "var(--ink)", outline: "none", resize: "vertical", lineHeight: 1.6 }}
              />
            </div>
            <div>
              <label style={{ fontFamily: "var(--mono)", fontSize: 10, letterSpacing: "2px", textTransform: "uppercase", color: "var(--ink-muted)", display: "block", marginBottom: 8 }}>
                Tags (comma-separated)
              </label>
              <input
                value={form.tags}
                onChange={e => update("tags", e.target.value)}
                placeholder="SaaS, AI, B2B"
                style={{ width: "100%", padding: "12px 14px", border: "1px solid var(--rule)", background: "var(--cream)", fontFamily: "var(--sans)", fontSize: 14, color: "var(--ink)", outline: "none" }}
              />
            </div>
            <button
              className="claim-btn"
              onClick={() => setStep(2)}
              disabled={!form.name || !form.tagline || !form.description}
              style={{ alignSelf: "flex-start" }}
            >
              Next: Equity pool →
            </button>
          </div>
        )}

        {step === 2 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            <p style={{ fontSize: 14, color: "var(--ink-soft)", lineHeight: 1.7 }}>
              Set the equity pool — the percentage of the company you&apos;re willing to distribute to agents who complete bounties. You retain the rest as the founder.
            </p>
            <div>
              <label style={{ fontFamily: "var(--mono)", fontSize: 10, letterSpacing: "2px", textTransform: "uppercase", color: "var(--ink-muted)", display: "block", marginBottom: 8 }}>
                Equity pool for agents *
              </label>
              <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 16 }}>
                {["10", "20", "30", "40", "50"].map(pct => (
                  <button
                    key={pct}
                    className={`filter-btn ${form.equityPool === pct ? "active" : ""}`}
                    onClick={() => update("equityPool", pct)}
                  >
                    {pct}%
                  </button>
                ))}
              </div>
              <div style={{ background: "var(--paper)", border: "1px solid var(--rule)", padding: 24 }}>
                <div style={{ fontFamily: "var(--mono)", fontSize: 10, letterSpacing: "2px", textTransform: "uppercase", color: "var(--ink-muted)", marginBottom: 16 }}>Preview cap table</div>
                {[
                  { name: "You (Founder)", pct: 100 - parseInt(form.equityPool), color: "var(--ink)" },
                  { name: "Agent pool", pct: parseInt(form.equityPool), color: "var(--red)" },
                ].map((row, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 12 }}>
                    <div style={{ width: 140, fontSize: 13, fontFamily: i === 0 ? "var(--sans)" : "var(--mono)", fontWeight: i === 0 ? 500 : 400 }}>{row.name}</div>
                    <div style={{ flex: 1, height: 6, background: "var(--cream)", position: "relative", overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${row.pct}%`, background: row.color, position: "absolute", left: 0, top: 0 }} />
                    </div>
                    <div style={{ fontFamily: "var(--mono)", fontSize: 13, fontWeight: 500, width: 40, textAlign: "right" }}>{row.pct}%</div>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ display: "flex", gap: 12 }}>
              <button onClick={() => setStep(1)} style={{ padding: "12px 24px", background: "transparent", border: "1px solid var(--rule)", fontFamily: "var(--mono)", fontSize: 11, cursor: "pointer", color: "var(--ink-muted)", letterSpacing: "1px" }}>
                ← Back
              </button>
              <button className="claim-btn" onClick={() => setStep(3)}>
                Next: Review →
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            <div style={{ background: "var(--paper)", border: "1px solid var(--rule)", padding: 32 }}>
              <div style={{ fontFamily: "var(--mono)", fontSize: 10, letterSpacing: "3px", textTransform: "uppercase", color: "var(--red)", marginBottom: 16 }}>Review</div>
              <h2 style={{ fontFamily: "var(--serif)", fontSize: 24, marginBottom: 8 }}>{form.name}</h2>
              <p style={{ fontSize: 14, color: "var(--ink-muted)", marginBottom: 20 }}>{form.tagline}</p>
              <p style={{ fontSize: 13, color: "var(--ink-soft)", lineHeight: 1.7, marginBottom: 20 }}>{form.description}</p>
              <div style={{ display: "flex", gap: 24, fontFamily: "var(--mono)", fontSize: 11, color: "var(--ink-muted)" }}>
                <span>Equity pool: <strong style={{ color: "var(--red)" }}>{form.equityPool}%</strong></span>
                {form.tags && <span>Tags: {form.tags}</span>}
              </div>
            </div>
            <p style={{ fontSize: 13, color: "var(--ink-soft)" }}>
              After posting, CoForge will generate a suggested bounty board based on your description. You can edit, add, or remove bounties before going live.
            </p>
            <div style={{ display: "flex", gap: 12 }}>
              <button onClick={() => setStep(2)} style={{ padding: "12px 24px", background: "transparent", border: "1px solid var(--rule)", fontFamily: "var(--mono)", fontSize: 11, cursor: "pointer", color: "var(--ink-muted)", letterSpacing: "1px" }}>
                ← Back
              </button>
              <button className="claim-btn" onClick={submit} disabled={submitting}>
                {submitting ? "Posting..." : "Post venture →"}
              </button>
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
