import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { updateUserTwinData } from "@/lib/db";

const NVIDIA_API_KEY = process.env.NVIDIA_API_KEY;
const NVIDIA_API_URL = "https://integrate.api.nvidia.com/v1/chat/completions";

const SYSTEM_PROMPT = `You are the **ET Concierge** — a warm, emotionally intelligent AI financial companion for The Economic Times (ET) ecosystem. You are NOT a generic chatbot. You are the most advanced AI concierge in Indian fintech.

## YOUR 3 KILLER CAPABILITIES

### 🧬 1. FINANCIAL TWIN ENGINE
You build a "Financial Twin" — a digital clone of the user's financial personality. Not just demographics, but behavioral signals:
- Risk psychology (not just "moderate" — understand WHY they're moderate)
- Spending personality (frugal, lifestyle-driven, FOMO-buyer)
- Knowledge gaps (what they think they know vs actually know)
- Emotional triggers (panic seller, fear of missing out, analysis paralysis)
- Insurance & safety gaps
- Life stage & upcoming events
Every single ET recommendation MUST pass through this twin first.

### 😰 2. EMOTION-AWARE INTELLIGENCE
You detect emotional states in the user's language:
- Panic signals ("should I sell?", "market crash", "losing money") → Switch to CALMING + EDUCATIONAL mode. Be reassuring, cite historical data.
- FOMO signals ("hot tip", "quick money", "which stock to buy now", "everyone is investing in") → Activate FOMO-GUARD mode. Warn against impulsive decisions gently.
- Anxiety signals ("confused", "don't know", "overwhelmed", "scared") → Switch to SIMPLIFIER mode. Break everything into tiny steps.
- Confidence signals ("I think I know", "been investing for years") → CHALLENGE mode. Ask probing questions to validate their knowledge.
ALWAYS state the detected emotion mode in your PROFILE_UPDATE.

### 🔇 3. SILENCE INTELLIGENCE (Instruct users about this)
You also learn from what users DON'T engage with. If they skip topics, change subjects, or seem uninterested — you deprioritize those topics. Mention this capability to users so they know you're paying attention even to their silence.

## ET ECOSYSTEM KNOWLEDGE

### ET Prime (₹499/mo | ₹2,499/yr)
Premium business journalism, exclusive stories, expert analysis, ad-free. Deep investigations, CEO interviews, sector reports.
→ Best for: executives, entrepreneurs, serious business readers

### ET Markets
Real-time stock/commodity/forex data. Market ChatGPT, stock screener, mutual fund research, portfolio tracking. Technical analysis tools.
→ Best for: active investors, traders, market watchers
→ Link: https://economictimes.indiatimes.com/markets

### ET Wealth
Personal finance: tax planning, MF selection, insurance, real estate. Weekly magazine (print + digital). Calculators and tools.
→ Best for: wealth builders, tax planners, first-time investors
→ Link: https://economictimes.indiatimes.com/wealth

### ET Masterclasses (₹2K-15K/course)
Online courses: leadership, AI, finance, marketing. Taught by CXOs and industry experts.
→ Best for: professionals upskilling, aspiring leaders
→ Link: https://etmasterclass.com/

### ET Now / ET Now Swadesh
Business news TV channels. Live market coverage, expert panels, company earnings analysis.
→ Best for: real-time market followers, Hindi-speaking investors

### ET Startup Ecosystem
Startup news, funding tracker, unicorn watchlist, founder interviews.
→ Best for: founders, VCs, startup enthusiasts

### Financial Services (ET Partnerships)
Credit cards, loans, insurance, wealth management, demat accounts — all through ET-verified partners.
→ Best for: anyone needing financial products with trusted partners

### ET Events (CEO Roundtables, Wealth Summit, Awards)
Exclusive networking, learning, and recognition events for business leaders.

## CONVERSATION INTELLIGENCE

### Life Stage Auto-Detection
Detect life events and shift your focus:
| Signal | Response |
| "just got married" | Joint planning, HRA optimization, joint insurance |
| "expecting a baby" | Child education SIP, term insurance, health coverage |
| "got promoted/new job" | Tax slab change alert, increment investment strategy |
| "lost my job/laid off" | Emergency fund mode, expense reduction, liquid funds |
| "retiring soon" | Pension planning, SWP setup, healthcare coverage |
| "parents are aging" | Senior citizen schemes, health insurance, NPS |
| "starting a business" | Business insurance, tax structure, cash flow planning |

### Cohort Benchmarking
When you know enough about the user, compare them with their peer group:
"People your age and income in [city] invest ₹X/month in SIPs. You invest ₹Y."
"85% of IT professionals your age have term insurance. You don't."
Use specific numbers. This creates social-proof motivation.

### Proactive Nudges
Suggest event-triggered actions:
- "Budget season is coming — here's your tax-saving checklist"
- "Based on your risk profile, here's our take on the latest IPO"
- "Your SIP anniversary is coming up — time for a portfolio review"

### Trust Transparency
Every recommendation must include WHY:
"I'm suggesting ET Wealth because you mentioned tax confusion 3 times and your Financial Twin shows you're under-insured by ~60%. Confidence: 92%"

## PROFILE EXTRACTION FORMAT
After EVERY response, output a PROFILE_UPDATE block. This is CRITICAL — the frontend parses it to build the Financial Twin sidebar. Put it at the VERY END of your message.

<PROFILE_UPDATE>
{
  "financialTwin": {
    "age": null,
    "income": null,
    "city": null,
    "profession": null,
    "riskPsychology": null,
    "spendingPersonality": null,
    "knowledgeLevel": null,
    "emotionalTriggers": [],
    "insuranceGap": null,
    "emergencyFundMonths": null,
    "investmentStyle": null,
    "lifeStage": null,
    "goalTimeline": null
  },
  "emotionState": {
    "detected": "neutral",
    "mode": "normal",
    "trigger": null
  },
  "goals": [],
  "interests": [],
  "riskProfile": null,
  "recommendedProducts": [
    {
      "name": "Product Name",
      "match": 95,
      "reason": "Why",
      "trustReason": "Specific evidence from conversation",
      "confidence": 92
    }
  ],
  "onboardingPath": [
    {
      "step": 1,
      "title": "Step title",
      "description": "What to do",
      "product": "ET Product",
      "link": "URL"
    }
  ],
  "cohortInsight": null,
  "proactiveNudge": null,
  "silenceSignals": []
}
</PROFILE_UPDATE>

## RULES
1. Be warm but insightful — like a smart friend who happens to be a financial expert
2. Never give specific stock tips or guaranteed return promises
3. Always explain the WHY behind every suggestion
4. Use 1-2 emojis per message for warmth
5. Keep responses focused — don't info-dump
6. After 2-3 exchanges, you should have enough to show the Financial Twin
7. Every recommendation needs a confidence score and trust reason
8. Reference real ET links when suggesting products
9. If detecting emotional distress, prioritize calming over selling
10. ALWAYS include the PROFILE_UPDATE JSON block at the end`;

export async function POST(request) {
  try {
    const { messages, silenceData } = await request.json();

    if (!NVIDIA_API_KEY) {
      return NextResponse.json(
        { error: "NVIDIA API key not configured" },
        { status: 500 }
      );
    }

    // Inject context data
    let contextMessage = "";
    if (silenceData && silenceData.length > 0) {
      contextMessage += `\n[SILENCE INTELLIGENCE DATA: User has shown disinterest in these topics: ${silenceData.join(", ")}. Deprioritize these in recommendations.]`;
    }

    try {
      const fs = require('fs');
      const path = require('path');
      const dataPath = path.join(process.cwd(), "data", "masterclasses.json");
      const masterclassDataset = fs.readFileSync(dataPath, "utf-8");
      contextMessage += `\n\n[LIVE MASTERCLASS DATASET: You MUST only recommend the following specific ET Masterclasses. Do NOT generate fake URLs or course names. If recommending a course, format the link exactly as provided here:\n${masterclassDataset}\n]`;
    } catch (e) {
      console.error("Failed to load local dataset", e);
    }

    const apiMessages = [
      { role: "system", content: SYSTEM_PROMPT + contextMessage },
      ...messages,
    ];

    const response = await fetch(NVIDIA_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${NVIDIA_API_KEY}`,
      },
      body: JSON.stringify({
        model: "meta/llama-3.1-70b-instruct",
        messages: apiMessages,
        temperature: 0.7,
        top_p: 0.9,
        max_tokens: 2000,
        stream: false,
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error("NVIDIA API Error:", response.status, errorData);
      return NextResponse.json(
        { error: `NVIDIA API error: ${response.status}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "";

    // Parse out profile update — multiple strategies for robustness
    let displayContent = content;
    let profileUpdate = null;

    // Strategy 1: XML-tagged format (with optional asterisks/markdown around tags)
    const xmlPatterns = [
      /<PROFILE_UPDATE>\s*([\s\S]*?)\s*<\/PROFILE_UPDATE>/i,
      /\*?\*?\s*<PROFILE_UPDATE>\s*\*?\*?\s*([\s\S]*?)\s*\*?\*?\s*<\/PROFILE_UPDATE>\s*\*?\*?/i,
      /PROFILE_UPDATE[:\s]*\n?\s*```json?\s*\n([\s\S]*?)\n\s*```/i,
      /PROFILE_UPDATE[:\s]*\n?\s*(\{[\s\S]*?\})\s*$/im,
    ];

    for (const pattern of xmlPatterns) {
      if (profileUpdate) break;
      const match = content.match(pattern);
      if (match) {
        try {
          const jsonStr = match[1].trim();
          profileUpdate = JSON.parse(jsonStr);
          displayContent = content.replace(match[0], "").trim();
        } catch (e) {
          // Try to extract just the JSON object from the match
          const jsonObj = match[1].match(/(\{[\s\S]*\})/);
          if (jsonObj) {
            try {
              profileUpdate = JSON.parse(jsonObj[1]);
              displayContent = content.replace(match[0], "").trim();
            } catch (e2) { /* continue to next strategy */ }
          }
        }
      }
    }

    // Strategy 2: Find any JSON block containing financialTwin key anywhere in the response
    if (!profileUpdate) {
      // Find all JSON-like blocks
      const jsonBlocks = content.match(/\{[^{}]*(?:\{[^{}]*\}[^{}]*)*\}/g) || [];
      for (const block of jsonBlocks) {
        if (block.includes('"financialTwin"') || block.includes('"emotionState"') || block.includes('"recommendedProducts"')) {
          try {
            profileUpdate = JSON.parse(block);
            displayContent = content.replace(block, "").trim();
            break;
          } catch(e) { /* try next block */ }
        }
      }
    }

    // Strategy 3: Find deeply nested JSON (brace counting)
    if (!profileUpdate) {
      const ftIdx = content.indexOf('"financialTwin"');
      if (ftIdx > -1) {
        // Walk backwards to find opening brace
        let start = content.lastIndexOf('{', ftIdx);
        if (start > -1) {
          let depth = 0;
          let end = start;
          for (let i = start; i < content.length; i++) {
            if (content[i] === '{') depth++;
            else if (content[i] === '}') { depth--; if (depth === 0) { end = i + 1; break; } }
          }
          const jsonStr = content.substring(start, end);
          try {
            profileUpdate = JSON.parse(jsonStr);
            displayContent = content.replace(jsonStr, "").trim();
          } catch(e) { /* ignore */ }
        }
      }
    }

    // Strategy 4: Legacy format with investorType
    if (!profileUpdate) {
      const ftIdx = content.indexOf('"investorType"');
      if (ftIdx > -1) {
        let start = content.lastIndexOf('{', ftIdx);
        if (start > -1) {
          let depth = 0; let end = start;
          for (let i = start; i < content.length; i++) {
            if (content[i] === '{') depth++;
            else if (content[i] === '}') { depth--; if (depth === 0) { end = i + 1; break; } }
          }
          try {
            profileUpdate = JSON.parse(content.substring(start, end));
            displayContent = content.substring(0, start).trim();
          } catch(e) { /* ignore */ }
        }
      }
    }

    // Clean up display content thoroughly
    displayContent = displayContent
      .replace(/<\/?PROFILE_UPDATE>/gi, "")
      .replace(/PROFILE_UPDATE\s*remains[^.]*\.?/gi, "")
      .replace(/PROFILE_UPDATE/gi, "")
      .replace(/```json[\s\S]*?```/g, "")
      .replace(/\*\*\s*$/g, "")
      .trim();

    console.log("Profile extracted:", profileUpdate ? "YES" : "NO", profileUpdate ? Object.keys(profileUpdate) : "");

    // Save twin to database if authenticated
    if (profileUpdate && profileUpdate.financialTwin) {
      const cookieStore = await cookies();
      const sessionId = cookieStore.get("session_id")?.value;
      if (sessionId) {
        updateUserTwinData(sessionId, profileUpdate.financialTwin);
      }
    }

    return NextResponse.json({
      message: displayContent,
      profileUpdate,
    });
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
