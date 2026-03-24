import { NextResponse } from "next/server";

// Simulated market data — in production, connect to NSE WebSocket or Yahoo Finance API
const MARKET_DATA = {
  sensex: { name: "SENSEX", value: 73892.45, change: -1.2, prev: 74790.12 },
  nifty: { name: "NIFTY 50", value: 22420.15, change: -0.9, prev: 22623.85 },
  niftyBank: { name: "BANK NIFTY", value: 47125.30, change: -1.5, prev: 47842.10 },
  gold: { name: "GOLD", value: 71250, change: 0.8, prev: 70685 },
  usdInr: { name: "USD/INR", value: 84.92, change: 0.15, prev: 84.79 },
};

function getRandomFluctuation(base, maxPercent = 0.3) {
  const fluctuation = (Math.random() - 0.5) * 2 * (maxPercent / 100) * base;
  return +(base + fluctuation).toFixed(2);
}

export async function GET() {
  // Add small random fluctuations to simulate live data
  const liveData = {};
  for (const [key, data] of Object.entries(MARKET_DATA)) {
    const newValue = getRandomFluctuation(data.value);
    const change = +(((newValue - data.prev) / data.prev) * 100).toFixed(2);
    liveData[key] = {
      ...data,
      value: newValue,
      change,
      timestamp: new Date().toISOString(),
    };
  }

  // Generate market alert if significant movement
  let alert = null;
  if (Math.abs(liveData.sensex.change) > 1) {
    alert = {
      type: liveData.sensex.change < 0 ? "dip" : "rally",
      message:
        liveData.sensex.change < 0
          ? `Sensex is down ${Math.abs(liveData.sensex.change).toFixed(1)}% today. Don't panic — let me check how this affects your portfolio.`
          : `Markets rallying! Sensex up ${liveData.sensex.change.toFixed(1)}%. Good time to review your investment targets.`,
      severity: Math.abs(liveData.sensex.change) > 2 ? "high" : "medium",
    };
  }

  return NextResponse.json({ data: liveData, alert });
}
