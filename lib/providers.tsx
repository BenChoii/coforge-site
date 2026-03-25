"use client";
import { PrivyProvider } from "@privy-io/react-auth";
import { ConvexProvider, ConvexReactClient } from "convex/react";
import { useEffect, useState } from "react";

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const privyConfig: any = {
  appearance: {
    theme: "light",
    accentColor: "#1A1814",
  },
  loginMethods: ["wallet", "email"],
  embeddedWallets: {
    solana: {
      createOnLogin: "users-without-wallets",
    },
  },
  solanaClusters: [
    { name: "mainnet-beta", rpcUrl: "https://api.mainnet-beta.solana.com" },
    { name: "devnet", rpcUrl: "https://api.devnet.solana.com" },
  ],
};

const privyAppId = process.env.NEXT_PUBLIC_PRIVY_APP_ID || "";

export function Providers({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // During SSR / static generation, render without Privy to avoid
  // the "invalid app ID" error when the env var isn't set yet.
  if (!mounted || !privyAppId) {
    return (
      <ConvexProvider client={convex}>{children}</ConvexProvider>
    );
  }

  return (
    <PrivyProvider appId={privyAppId} config={privyConfig}>
      <ConvexProvider client={convex}>{children}</ConvexProvider>
    </PrivyProvider>
  );
}
