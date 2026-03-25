import { NextResponse } from "next/server";

const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";
const MODEL = "stepfun/step-3.5-flash:free";

export async function POST(request: Request) {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "AI service not configured." }, { status: 500 });
  }

  try {
    const { idea, founderEquity = 50 } = await request.json();

    if (!idea || typeof idea !== "string" || idea.trim().length < 10) {
      return NextResponse.json({ error: "Please provide a business idea (at least 10 characters)." }, { status: 400 });
    }

    const bountyPool = 100 - founderEquity - 5;

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
        max_tokens: 4000,
        messages: [
          {
            role: "system",
            content: `You are an expert startup advisor and technical architect. Break down a business idea into a concrete bounty board for AI agents and human contributors.

Rules:
- Create 6-8 specific, actionable bounties
- ai_only: tasks completable 100% by AI (build API, write tests, configure CI, implement features)
- ai_human: tasks requiring human judgment or real-world action (brand design, legal, interviews, strategy)
- Equity per bounty should reflect complexity (infrastructure 3-5%, features 2-4%, marketing 1-3%)
- Total equity must not exceed ${bountyPool}% (after ${founderEquity}% founder + 5% CoForge fee)
- Acceptance criteria must be specific and measurable

Respond with ONLY valid JSON, no markdown, in this exact format:
{
  "ventureName": "Short Name",
  "tagline": "One sentence value proposition",
  "bounties": [
    {
      "id": "b1",
      "title": "Action-oriented title under 60 chars",
      "description": "2-3 sentences on what to build and why",
      "equity": 3.5,
      "taskType": "ai_only",
      "skills": ["Skill1", "Skill2", "Skill3"],
      "requirements": ["Requirement 1", "Requirement 2", "Requirement 3"],
      "criteria": ["Measurable criterion 1", "Measurable criterion 2", "Measurable criterion 3"]
    }
  ]
}`,
          },
          {
            role: "user",
            content: `Generate a complete bounty board for this business idea:\n\n${idea.trim()}\n\nCover the full stack needed to launch: technical infrastructure, product features, design, go-to-market, and any real-world operations. Respond with ONLY the JSON object.`,
          },
        ],
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error("OpenRouter error:", response.status, err);
      if (response.status === 401) {
        return NextResponse.json({ error: "Invalid API key." }, { status: 401 });
      }
      if (response.status === 429) {
        return NextResponse.json({ error: "Rate limited. Please try again in a moment." }, { status: 429 });
      }
      return NextResponse.json({ error: "AI generation failed. Please try again." }, { status: 500 });
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    if (!content) {
      return NextResponse.json({ error: "No response from AI." }, { status: 500 });
    }

    // Parse the JSON response
    const cleaned = content.replace(/```json\n?|\n?```/g, "").trim();
    const result = JSON.parse(cleaned);

    return NextResponse.json(result);
  } catch (error) {
    console.error("Scaffold API error:", error);
    return NextResponse.json({ error: "Failed to generate bounty board. Please try again." }, { status: 500 });
  }
}
