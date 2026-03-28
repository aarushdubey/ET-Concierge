import { NextResponse } from "next/server";
import yahooFinance from "yahoo-finance2";

export async function GET() {
  try {
    // Suppress yahoo warnings to keep console clean
    yahooFinance.suppressNotices(['yahooSurvey']);

    const symbols = ["^BSESN", "^NSEI", "^NSEBANK", "GC=F", "INR=X"];
    const quotes = await Promise.all(
      symbols.map((s) => yahooFinance.quote(s).catch(() => null))
    );

    const liveData = {};
    const symbolMap = {
      "^BSESN": { key: "sensex", name: "SENSEX" },
      "^NSEI": { key: "nifty", name: "NIFTY 50" },
      "^NSEBANK": { key: "niftyBank", name: "BANK NIFTY" },
      "GC=F": { key: "gold", name: "GOLD" },
      "INR=X": { key: "usdInr", name: "USD/INR" },
    };

    quotes.forEach((q) => {
      if (q && symbolMap[q.symbol]) {
        const mapping = symbolMap[q.symbol];
        liveData[mapping.key] = {
          name: mapping.name,
          value: q.regularMarketPrice,
          change: q.regularMarketChangePercent,
          prev: q.regularMarketPreviousClose,
        };
      }
    });

    // If Yahoo finance fetch completely failed or was empty, throw to trigger fallback
    if (Object.keys(liveData).length === 0) {
      throw new Error("Yahoo Finance returned no data");
    }

    let alert = null;
    if (liveData.sensex && Math.abs(liveData.sensex.change) > 1) {
      alert = {
        type: liveData.sensex.change < 0 ? "dip" : "rally",
        message: liveData.sensex.change < 0
            ? `Sensex is down ${Math.abs(liveData.sensex.change).toFixed(1)}% today. Don't panic — let me check how this affects your portfolio.`
            : `Markets rallying! Sensex up ${liveData.sensex.change.toFixed(1)}%. Good time to review your investment targets.`,
        severity: Math.abs(liveData.sensex.change) > 2 ? "high" : "medium",
      };
    }

    return NextResponse.json({ data: liveData, alert });
  } catch (error) {
    console.warn("Market API fallback triggered:", error.message || error);
    
    // Fallback static data simulator for reliable demos
    const fallbackData = {
      sensex: { name: "SENSEX", value: 73502.6, change: 1.25, prev: 72593.1 },
      nifty: { name: "NIFTY 50", value: 22332.65, change: 1.3, prev: 22045.2 },
      niftyBank: { name: "BANK NIFTY", value: 47805.4, change: 0.85, prev: 47402.1 },
      gold: { name: "GOLD", value: 65201.0, change: -0.45, prev: 65495.0 },
      usdInr: { name: "USD/INR", value: 82.85, change: -0.1, prev: 82.93 },
    };
    
    return NextResponse.json({ 
      data: fallbackData, 
      alert: {
        type: "rally",
        message: "Markets rallying! Sensex up 1.25%. Good time to review your investment targets.",
        severity: "medium"
      }
    });
  }
}
