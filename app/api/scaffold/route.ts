import { NextResponse } from "next/server";

const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";
const MODEL = "stepfun/step-3.5-flash:free";

function extractJSON(text: string): unknown {
  // Remove markdown code blocks
  let cleaned = text.replace(/```json\n?|\n?```/g, "").trim();
  // Remove BOM
  cleaned = cleaned.replace(/^\uFEFF/, "").trim();
  // Try direct parse first
  try {
    return JSON.parse(cleaned);
  } catch {
    // Try to find JSON object in the response
    const match = cleaned.match(/\{[\s\S]*\}/);
    if (match) {
      return JSON.parse(match[0]);
    }
    throw new Error("Could not extract JSON from response");
  }
}

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
            content: `You are an expert startup advisor building AI-operated businesses. Every venture on CoForge must be fully operable by AI agents after launch — no human staff, no physical operations. Break down the idea into two types of bounties: build bounties (one-time, to create the product) and operation bounties (recurring, to run the business month after month).

Rules:
- Create 8-10 bounties total: at least 4 build bounties and at least 3 operation bounties
- bountyType: "build" for one-time delivery (product, infrastructure, brand); "operation" for recurring ongoing work (monthly content, weekly support, campaigns)
- Operation bounties are claimed repeatedly by agents — title should make clear it repeats (e.g. "Write 4 SEO articles — [month]", "Handle customer support tickets this week")
- ai_only: completable 100% by AI; ai_human: requires human judgment (legal, strategy, taste)
- claimMode: "competitive" for build/creative work where best submission wins; "exclusive" for legal/financial/blockchain tasks
- Equity: build bounties 2-5%, operation bounties 0.1-0.5% (recurring, so compounds)
- Total equity must not exceed ${bountyPool}% (after ${founderEquity}% founder + 5% CoForge fee)
- Only include businesses that can be run entirely by AI: SaaS, digital services, content, education, consulting, API businesses. No physical products, no brick-and-mortar.
- Acceptance criteria must be specific and measurable

Respond with ONLY valid JSON, no markdown, in this exact format:
{
  "ventureName": "Short Name",
  "tagline": "One sentence value proposition",
  "businessCategory": "SaaS | Digital Services | Education | Content | Consulting | API",
  "bounties": [
    {
      "id": "b1",
      "title": "Action-oriented title under 60 chars",
      "description": "2-3 sentences on what to build/do and why",
      "equity": 3.5,
      "bountyType": "build",
      "taskType": "ai_only",
      "claimMode": "competitive",
      "skills": ["Skill1", "Skill2", "Skill3"],
      "requirements": ["Requirement 1", "Requirement 2", "Requirement 3"],
      "criteria": ["Measurable criterion 1", "Measurable criterion 2", "Measurable criterion 3"]
    }
  ]
}`,
          },
          {
            role: "user",
            content: `Generate a complete bounty board for this AI-operated business idea:\n\n${idea.trim()}\n\nInclude both build bounties (to create the product) and recurring operation bounties (to run it month after month with AI agents). The business must be fully operable by AI — no human staff required after launch. Respond with ONLY the JSON object.`,
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
    let result: unknown;
    try {
      result = extractJSON(content);
    } catch {
      console.error("Scaffold JSON parse error. Raw content:", content.slice(0, 500));
      return NextResponse.json({ error: "AI returned malformed data. Please try again." }, { status: 500 });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Scaffold API error:", error);
    const isNetworkError =
      error instanceof TypeError &&
      (error.message === "fetch failed" || error.message.includes("network"));
    if (isNetworkError) {
      return NextResponse.json({ error: "Could not reach AI service. Please try again later." }, { status: 503 });
    }
    return NextResponse.json({ error: "Failed to generate bounty board. Please try again." }, { status: 500 });
  }
}
