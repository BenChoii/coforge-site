import { NextResponse } from "next/server";

const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";
const MODEL = "stepfun/step-3.5-flash:free";

export async function POST(request: Request) {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "AI service not configured." }, { status: 500 });
  }

  try {
    const {
      bountyTitle,
      bountyDescription,
      requirements = [],
      deliverables = [],
      criteria = [],
      submissionUrl,
      submissionNotes,
    } = await request.json();

    if (!bountyTitle || !submissionUrl) {
      return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
    }

    const response = await fetch(OPENROUTER_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://coforge.xyz",
        "X-Title": "CoForge",
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 2000,
        messages: [
          {
            role: "system",
            content: `You are a rigorous technical evaluator for a venture studio. Assess whether submitted work meets the bounty acceptance criteria.

Scoring:
- 90-100: Exceptional, exceeds criteria, production-ready
- 75-89: Meets all criteria, minor issues only
- 60-74: Mostly complete, notable gaps
- 40-59: Partial completion, significant rework needed
- Below 40: Does not meet minimum requirements

You cannot directly access URLs, but evaluate based on all available context. Be specific — reference actual requirements and criteria.

Respond with ONLY valid JSON in this exact format:
{
  "score": 87,
  "recommendation": "approve",
  "summary": "One to two sentence overall assessment.",
  "strengths": ["Specific strength 1", "Specific strength 2"],
  "issues": ["Specific issue 1 (empty array if none)"],
  "criteriaResults": [
    { "criterion": "Criterion text", "met": true, "notes": "Brief explanation" }
  ]
}

recommendation must be exactly: "approve", "request_changes", or "reject"`,
          },
          {
            role: "user",
            content: `Evaluate this bounty submission:

**Bounty:** ${bountyTitle}
${bountyDescription ? `**Description:** ${bountyDescription}\n` : ""}
**Requirements:**
${requirements.map((r: string, i: number) => `${i + 1}. ${r}`).join("\n")}

**Deliverables:**
${deliverables.map((d: string, i: number) => `${i + 1}. ${d}`).join("\n")}

**Acceptance Criteria:**
${criteria.map((c: string, i: number) => `${i + 1}. ${c}`).join("\n")}

**Submission URL:** ${submissionUrl}
${submissionNotes ? `**Submitter Notes:** ${submissionNotes}` : ""}

Respond with ONLY the JSON object.`,
          },
        ],
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error("OpenRouter error:", response.status, err);
      if (response.status === 401) return NextResponse.json({ error: "Invalid API key." }, { status: 401 });
      if (response.status === 429) return NextResponse.json({ error: "Rate limited. Please try again." }, { status: 429 });
      return NextResponse.json({ error: "AI evaluation failed. Please try again." }, { status: 500 });
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    if (!content) {
      return NextResponse.json({ error: "No response from AI." }, { status: 500 });
    }

    const cleaned = content.replace(/```json\n?|\n?```/g, "").trim();
    const result = JSON.parse(cleaned);

    return NextResponse.json(result);
  } catch (error) {
    console.error("Evaluate API error:", error);
    return NextResponse.json({ error: "Failed to evaluate submission. Please try again." }, { status: 500 });
  }
}
