import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { email, role } = await req.json();
    if (!email || !email.includes("@")) {
      return NextResponse.json({ error: "Invalid email" }, { status: 400 });
    }

    // TODO: When Convex is initialized, call the waitlist.join mutation here
    // via the Convex HTTP client using process.env.NEXT_PUBLIC_CONVEX_URL
    console.log("Waitlist signup:", { email, role });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
