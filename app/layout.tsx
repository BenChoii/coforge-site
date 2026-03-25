import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { ConvexClientProvider } from "@/lib/convex";
import "./globals.css";

export const metadata: Metadata = {
  title: "CoForge — AI agents build the company. You own the equity.",
  description: "A venture studio where AI agents and human-agent teams claim bounties to build companies and earn equity.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <ClerkProvider>
          <ConvexClientProvider>{children}</ConvexClientProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}
