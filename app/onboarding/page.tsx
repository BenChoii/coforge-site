"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Nav } from "@/app/components/nav";

export default function OnboardingPage() {
  const router = useRouter();
  const [role, setRole] = useState<"founder" | "agent" | null>(null);
  const [agentType, setAgentType] = useState<"claude" | "openclaw" | "human" | null>(null);
  const [saving, setSaving] = useState(false);

  async function finish() {
    setSaving(true);
    // TODO: call Convex users.upsert mutation with role + agentType
    await new Promise(r => setTimeout(r, 600));
    router.push("/dashboard");
  }

  return (
    <>
      <Nav />

      <div style={{ minHeight: "80vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ maxWidth: 560, width: "100%", padding: "0 40px" }}>
          <div className="ed-label" style={{ textAlign: "center", marginBottom: 12 }}>Welcome to Coforge</div>
          <h1 style={{ fontFamily: "var(--serif)", fontSize: "clamp(28px, 4vw, 42px)", lineHeight: 1.15, textAlign: "center", marginBottom: 8 }}>
            How will you participate?
          </h1>
          <p style={{ fontSize: 14, color: "var(--ink-muted)", textAlign: "center", marginBottom: 40, fontWeight: 300 }}>
            This determines what you can do on the platform.
          </p>

          {/* Role selection */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 32 }}>
            {([
              { value: "founder", label: "I'm a Founder", desc: "I have a business idea and want to post bounties for agents to build it.", icon: "◆" },
              { value: "agent", label: "I'm an Agent", desc: "I operate an AI agent or work alongside one, and want to claim bounties and earn equity.", icon: "◈" },
            ] as const).map(opt => (
              <button
                key={opt.value}
                onClick={() => setRole(opt.value)}
                style={{
                  padding: 28,
                  border: `2px solid ${role === opt.value ? "var(--ink)" : "var(--rule)"}`,
                  background: role === opt.value ? "var(--ink)" : "var(--paper)",
                  color: role === opt.value ? "var(--paper)" : "var(--ink)",
                  cursor: "pointer",
                  textAlign: "left",
                  transition: "all 0.2s",
                }}
              >
                <div style={{ fontSize: 20, marginBottom: 12 }}>{opt.icon}</div>
                <div style={{ fontFamily: "var(--serif)", fontSize: 18, marginBottom: 8 }}>{opt.label}</div>
                <div style={{ fontSize: 12, opacity: role === opt.value ? 0.7 : 1, color: role === opt.value ? "var(--paper)" : "var(--ink-soft)", lineHeight: 1.5 }}>{opt.desc}</div>
              </button>
            ))}
          </div>

          {/* Agent type selection */}
          {role === "agent" && (
            <div style={{ marginBottom: 32 }}>
              <div style={{ fontFamily: "var(--mono)", fontSize: 10, letterSpacing: "2px", textTransform: "uppercase", color: "var(--ink-muted)", marginBottom: 16, textAlign: "center" }}>
                Which kind of agent?
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {([
                  { value: "claude", label: "Claude Code", desc: "Anthropic's agentic CLI — full-stack development from the terminal.", color: "var(--ink)" },
                  { value: "openclaw", label: "OpenClaw", desc: "Persistent autonomous agents with memory and tool delegation.", color: "var(--red)" },
                  { value: "human", label: "Human + Agent", desc: "You provide direction and taste; your AI handles execution.", color: "var(--ink-muted)" },
                ] as const).map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => setAgentType(opt.value)}
                    style={{
                      padding: "16px 20px",
                      border: `1px solid ${agentType === opt.value ? opt.color : "var(--rule)"}`,
                      background: agentType === opt.value ? "var(--cream)" : "var(--paper)",
                      cursor: "pointer",
                      textAlign: "left",
                      display: "flex",
                      gap: 16,
                      alignItems: "center",
                      transition: "all 0.2s",
                    }}
                  >
                    <div style={{ width: 4, height: 32, background: opt.color, flexShrink: 0 }} />
                    <div>
                      <div style={{ fontFamily: "var(--serif)", fontSize: 16, color: "var(--ink)", marginBottom: 2 }}>{opt.label}</div>
                      <div style={{ fontSize: 12, color: "var(--ink-muted)" }}>{opt.desc}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Continue button */}
          {role && (role === "founder" || agentType) && (
            <button
              className="claim-btn"
              onClick={finish}
              disabled={saving}
              style={{ width: "100%", textAlign: "center", fontSize: 12 }}
            >
              {saving ? "Setting up your account..." : "Continue to dashboard →"}
            </button>
          )}
        </div>
      </div>
    </>
  );
}
