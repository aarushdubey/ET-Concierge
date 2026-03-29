import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { updateUserTwinData } from "@/lib/db";

// AI Config - Prioritizing Groq for lowest latency (Hackathon requirement)
const GROQ_API_KEY = process.env.GROQ_API_KEY;
const NVIDIA_API_KEY = process.env.NVIDIA_API_KEY;

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
- Panic signals ("should I sell?", "market crash", "losing money") → Switch to CALMING + EDUCATIONAL mode.
- FOMO signals ("hot tip", "quick money", "which stock to buy now") → Activate FOMO-GUARD mode.
- Anxiety signals ("confused", "don't know", "overwhelmed") → Switch to SIMPLIFIER mode.
- Confidence signals ("I think I know", "been investing for years") → CHALLENGE mode.

### 🔇 3. SILENCE INTELLIGENCE
You also learn from what users DON'T engage with. If they skip topics, change subjects, or seem uninterested — you deprioritize those topics.

## ET ECOSYSTEM KNOWLEDGE

### ET Prime (₹499/mo | ₹2,499/yr)
Premium business journalism, exclusive stories, expert analysis, ad-free.
→ Best for: executives, entrepreneurs, serious business readers
→ URL: https://economictimes.indiatimes.com/prime

### ET Markets
Real-time stock/commodity/forex data. Stock screener, mutual fund research, portfolio tracking.
→ Best for: active investors, traders, market watchers
→ URL: https://economictimes.indiatimes.com/markets/stocks/stock-screener

### ET Wealth
Personal finance: tax planning, MF selection, insurance, real estate.
→ Best for: wealth builders, tax planners, first-time investors
→ URL: https://economictimes.indiatimes.com/wealth

### ET Money SIP Calculator
Calculate SIP returns, compare mutual funds, plan your investment journey.
→ Best for: SIP planners, goal-based investors
→ URL: https://www.etmoney.com/tools-and-calculators/sip-calculator

### ET Masterclasses (₹2K-15K/course)
Online courses: leadership, AI, finance, marketing.
→ Best for: professionals upskilling, aspiring leaders
→ URL: https://etmasterclass.com/

### ET Now / ET Now Swadesh
Business news TV channels. Live market coverage.
→ Best for: real-time market followers

## CONVERSATION INTELLIGENCE

### Life Stage Auto-Detection
Detect life events: marriage, baby, promotion, job loss, retirement, aging parents, starting business.

### Cohort Benchmarking
Compare users with peer groups using specific numbers for social-proof motivation.

### Trust Transparency
Every recommendation must include WHY with a confidence score.

## CRITICAL OUTPUT FORMAT RULES

You MUST follow these output rules EXACTLY:

### Rule 1: twin_update JSON (EVERY response)
At the END of every response, after your human-readable text, emit a JSON block:
{"type":"twin_update","traits":{"age":null,"income":null,"city":null,"riskProfile":null,"lifeStage":null,"knowledgeLevel":null,"goals":null,"emotionalTriggers":null}}

Fill in any traits you can infer from the conversation. Leave unknown traits as null. Examples:
{"type":"twin_update","traits":{"age":"28","income":"18 LPA","city":"Bangalore","riskProfile":"Risk-averse","lifeStage":"Newly married","knowledgeLevel":"Beginner","goals":"Buy a house in 3 years","emotionalTriggers":"Fear of loss, FOMO from friends"}}

### Rule 2: trust_card JSON (when recommending ET products)
Whenever you recommend an ET product, emit a trust_card JSON AFTER your explanation:
{"type":"trust_card","product":"ET Prime","url":"https://economictimes.indiatimes.com/prime","match":87,"reason":"Because you are risk-averse and need deep market analysis before investing"}

The 4 main products and their URLs:
1. ET Prime → {"type":"trust_card","product":"ET Prime","url":"https://economictimes.indiatimes.com/prime","match":90,"reason":"..."}
2. ET Money SIP Calculator → {"type":"trust_card","product":"ET Money SIP Calculator","url":"https://www.etmoney.com/tools-and-calculators/sip-calculator","match":85,"reason":"..."}
3. ET Markets Watchlist → {"type":"trust_card","product":"ET Markets Watchlist","url":"https://economictimes.indiatimes.com/markets/stocks/stock-screener","match":80,"reason":"..."}
4. ET Wealth → {"type":"trust_card","product":"ET Wealth","url":"https://economictimes.indiatimes.com/wealth","match":88,"reason":"..."}

### Rule 3: journey_map_ready (once, when twin is rich enough)
When the twin has 5 or more known traits AND you have made at least one product recommendation, emit this string on its own line:
journey_map_ready

### Rule 4: PROFILE_UPDATE block (for backwards compatibility)
Also emit the PROFILE_UPDATE block at the very end:

<PROFILE_UPDATE>
{
  "financialTwin": {
    "age": null, "income": null, "city": null, "profession": null,
    "riskPsychology": null, "spendingPersonality": null, "knowledgeLevel": null,
    "emotionalTriggers": [], "insuranceGap": null, "emergencyFundMonths": null,
    "investmentStyle": null, "lifeStage": null, "goalTimeline": null
  },
  "emotionState": { "detected": "neutral", "mode": "normal", "trigger": null },
  "goals": [], "interests": [], "riskProfile": null,
  "recommendedProducts": [],
  "onboardingPath": [],
  "cohortInsight": null, "proactiveNudge": null, "silenceSignals": []
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
10. ALWAYS include the twin_update JSON and PROFILE_UPDATE block at the end of EVERY response`;

export async function POST(request) {
  try {
    const { messages, silenceData, existingTwin } = await request.json();

    const API_KEY = GROQ_API_KEY || NVIDIA_API_KEY;
    const API_URL = GROQ_API_KEY ? "https://api.groq.com/openai/v1/chat/completions" : "https://integrate.api.nvidia.com/v1/chat/completions";
    const API_MODEL = GROQ_API_KEY ? "llama-3.3-70b-versatile" : "meta/llama-3.1-70b-instruct";

    if (!API_KEY) {
      return NextResponse.json(
        { error: "AI Provider API key not configured (Need GROQ_API_KEY or NVIDIA_API_KEY)" },
        { status: 500 }
      );
    }

    let contextMessage = "";

    if (existingTwin && Object.keys(existingTwin).length > 0) {
      contextMessage += `\n\nEXISTING FINANCIAL TWIN DATA: ${JSON.stringify(existingTwin)}. Use this as the user's profile. Do not re-ask questions already answered. Build on what you already know.`;
    }

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

    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({
        model: API_MODEL,
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

    let displayContent = content;
    let profileUpdate = null;
    let twinUpdate = null;
    let trustCards = [];
    let journeyMapReady = false;

    // Extract twin_update JSON blocks
    const twinUpdateRegex = /\{"type"\s*:\s*"twin_update"[^}]*"traits"\s*:\s*\{[^}]*\}\s*\}/g;
    let twinMatch;
    while ((twinMatch = twinUpdateRegex.exec(content)) !== null) {
      try {
        const parsed = JSON.parse(twinMatch[0]);
        if (parsed.type === "twin_update" && parsed.traits) {
          twinUpdate = parsed.traits;
          displayContent = displayContent.replace(twinMatch[0], "");
        }
      } catch (e) { /* skip malformed */ }
    }

    // Extract trust_card JSON blocks
    const trustCardRegex = /\{"type"\s*:\s*"trust_card"[^}]*\}/g;
    let trustMatch;
    while ((trustMatch = trustCardRegex.exec(content)) !== null) {
      try {
        const parsed = JSON.parse(trustMatch[0]);
        if (parsed.type === "trust_card") {
          trustCards.push(parsed);
          displayContent = displayContent.replace(trustMatch[0], "");
        }
      } catch (e) { /* skip malformed */ }
    }

    // Detect journey_map_ready
    if (content.includes("journey_map_ready")) {
      journeyMapReady = true;
      displayContent = displayContent.replace(/journey_map_ready/g, "");
    }

    // Parse PROFILE_UPDATE (existing format for backward compat)
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
          displayContent = displayContent.replace(match[0], "").trim();
        } catch (e) {
          const jsonObj = match[1].match(/(\{[\s\S]*\})/);
          if (jsonObj) {
            try {
              profileUpdate = JSON.parse(jsonObj[1]);
              displayContent = displayContent.replace(match[0], "").trim();
            } catch (e2) { /* continue */ }
          }
        }
      }
    }

    if (!profileUpdate) {
      const jsonBlocks = content.match(/\{[^{}]*(?:\{[^{}]*\}[^{}]*)*\}/g) || [];
      for (const block of jsonBlocks) {
        if (block.includes('"financialTwin"') || block.includes('"emotionState"') || block.includes('"recommendedProducts"')) {
          try {
            profileUpdate = JSON.parse(block);
            displayContent = displayContent.replace(block, "").trim();
            break;
          } catch(e) { /* try next */ }
        }
      }
    }

    if (!profileUpdate) {
      const ftIdx = content.indexOf('"financialTwin"');
      if (ftIdx > -1) {
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

    // Clean up display content
    displayContent = displayContent
      .replace(/<\/?PROFILE_UPDATE>/gi, "")
      .replace(/PROFILE_UPDATE\s*remains[^.]*\.?/gi, "")
      .replace(/PROFILE_UPDATE/gi, "")
      .replace(/```json[\s\S]*?```/g, "")
      .replace(/\*\*\s*$/g, "")
      .replace(/^\s*\n/gm, "\n")
      .trim();

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
      twinUpdate,
      trustCards,
      journeyMapReady,
    });
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
