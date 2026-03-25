"use client";
import Link from "next/link";
import dynamic from "next/dynamic";

const WalletButton = dynamic(() => import("./wallet-button"), { ssr: false });

export function Nav({ active }: { active?: string }) {
  return (
    <nav className="site-nav">
      <div className="frame nav-inner">
        <Link href="/" className="wordmark">Coforge</Link>
        <div className="nav-right">
          <Link href="/bounties" style={active === "bounties" ? { color: "var(--ink)" } : undefined}>Bounties</Link>
          <Link href="/ventures" style={active === "ventures" ? { color: "var(--ink)" } : undefined}>Ventures</Link>
          <WalletButton active={active} />
        </div>
      </div>
    </nav>
  );
}
