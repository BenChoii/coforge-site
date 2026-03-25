"use client";
import Link from "next/link";
import { usePrivy } from "@privy-io/react-auth";

export default function WalletButton({ active }: { active?: string }) {
  let login: (() => void) | null = null;
  let logout: (() => Promise<void>) | null = null;
  let authenticated = false;
  let walletAddress: string | undefined;

  try {
    const privy = usePrivy();
    login = privy.login;
    logout = privy.logout;
    authenticated = privy.authenticated;
    walletAddress = privy.user?.wallet?.address;
  } catch {
    // PrivyProvider not available yet
  }

  const short = walletAddress
    ? `${walletAddress.slice(0, 4)}...${walletAddress.slice(-4)}`
    : null;

  const btnStyle = {
    background: "none",
    border: "none",
    cursor: "pointer",
    fontFamily: "inherit",
    fontSize: "inherit",
    letterSpacing: "inherit",
    textTransform: "inherit" as const,
  };

  if (authenticated) {
    return (
      <>
        <Link
          href="/dashboard"
          style={active === "dashboard" ? { color: "var(--ink)" } : undefined}
        >
          Dashboard
        </Link>
        <button onClick={() => logout?.()} className="nav-apply" style={btnStyle}>
          {short}
        </button>
      </>
    );
  }

  return (
    <button onClick={() => login?.()} className="nav-apply" style={btnStyle}>
      Connect wallet
    </button>
  );
}
