const fs = require("fs");

const htmlPath = "c:\\ET-Concierge\\stitch\\code.html";
let html = fs.readFileSync(htmlPath, "utf-8");

// Extract the Tailwind config script
const configMatch = html.match(/<script id="tailwind-config">([\s\S]*?)<\/script>/);
const tailwindConfig = configMatch ? configMatch[1] : "";

// Extract the styles
const styleMatch = html.match(/<style>([\s\S]*?)<\/style>/);
const styles = styleMatch ? styleMatch[1] : "";

// Extract the body content
const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/);
let bodyContent = bodyMatch ? bodyMatch[1] : "";

// Convert HTML to JSX
bodyContent = bodyContent.replace(/class=/g, "className=");
bodyContent = bodyContent.replace(/<!--([\s\S]*?)-->/g, "{/*$1*/}");

// Strip out the hardcoded ticker and replace with our dynamic React one using the same classes
// The ticker is in <header> ... <div class="animate-marquee ...">
const headerBlockRegex = /<header className="fixed top-0 w-full z-50">([\s\S]*?)<\/header>/;
const headerMatch = bodyContent.match(headerBlockRegex);

const dynamicTicker = `{/* 1. Dynamic Market Ticker */}
<header className="fixed top-0 w-full z-50">
  <div className="bg-primary dark:bg-primary h-10 flex items-center overflow-hidden">
    <div className="animate-marquee whitespace-nowrap flex items-center gap-12">
      {[...Array(6)].map((_, loopIdx) => (
        <div key={loopIdx} className="flex items-center gap-4 text-surface font-label uppercase tracking-widest text-[10px]">
          <span className="font-bold">Market Ticker</span>
          <span className="material-symbols-outlined text-sm">trending_up</span>
          {marketData ? Object.values(marketData).map((item, i) => (
            <React.Fragment key={i}>
              <span>{item.name} {typeof item.value === 'number' ? item.value.toLocaleString("en-IN") : item.value} ({item.change >= 0 ? "+" : ""}{item.change}%)</span>
              <span className="opacity-30">|</span>
            </React.Fragment>
          )) : (
            <>
              <span>SENSEX 73,892.45 (-1.2%)</span><span className="opacity-30">|</span>
              <span>NIFTY 50 22,420.15 (-0.9%)</span><span className="opacity-30">|</span>
              <span>GOLD 71,250 (+0.8%)</span><span className="opacity-30">|</span>
              <span>USD/INR 84.92 (+0.15%)</span><span className="opacity-30">|</span>
            </>
          )}
        </div>
      ))}
    </div>
  </div>

  {/* 2. Navigation */}
  <nav className="bg-surface/80 backdrop-blur-xl shadow-sm">
    <div className="flex justify-between items-center w-full px-8 md:px-16 py-6 max-w-screen-2xl mx-auto">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-primary flex items-center justify-center rounded-lg shadow-lg rotate-3 transition-transform hover:rotate-0">
          <span className="text-surface font-serif italic font-bold text-xl">ET</span>
        </div>
        <span className="text-2xl font-serif font-bold text-primary tracking-tight">Financial Twin</span>
      </div>
      <div className="hidden md:flex items-center gap-10">
        <a className="text-primary font-semibold border-b-2 border-primary transition-all duration-300" href="#">Solutions</a>
        <a className="text-on-surface/80 hover:text-primary transition-all duration-300" href="#">How it Works</a>
        <a className="text-on-surface/80 hover:text-primary transition-all duration-300" href="#">Impact</a>
        <a className="text-on-surface/80 hover:text-primary flex items-center gap-1 transition-all duration-300" href="https://github.com/SHIVIKA330/ET-Concierge">
            GitHub <span className="material-symbols-outlined text-sm">open_in_new</span>
        </a>
      </div>
      <a className="bg-gradient-to-br from-primary to-primary-container text-surface px-8 py-3 rounded-md font-label font-semibold text-sm hover:scale-105 transition-transform duration-300 shadow-md" href="/chat">
          Try Financial Twin
      </a>
    </div>
  </nav>
</header>`;

bodyContent = bodyContent.replace(headerBlockRegex, dynamicTicker);

// Now wrap everything in the page component
const pageJs = `"use client";
import React, { useState, useEffect } from "react";

export default function LandingPage() {
  const [marketData, setMarketData] = useState(null);

  useEffect(() => {
    // Append Tailwind script to head dynamically if not present
    if (!document.getElementById("tailwind-script")) {
      const script = document.createElement("script");
      script.id = "tailwind-script";
      script.src = "https://cdn.tailwindcss.com?plugins=forms,container-queries";
      script.onload = () => {
        window.tailwind.config = {
          darkMode: "class",
          ...${tailwindConfig.replace("tailwind.config = ", "").trim()}
        };
      };
      document.head.appendChild(script);
    }
    
    // Fetch Market Data
    fetch("/api/market").then(res => res.json()).then(json => setMarketData(json.data)).catch(console.error);
    const interval = setInterval(() => {
      fetch("/api/market").then(res => res.json()).then(json => setMarketData(json.data)).catch(console.error);
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-surface font-body text-on-surface antialiased overflow-x-hidden">
      <style dangerouslySetInnerHTML={{__html: \`${styles}\`}} />
      ${bodyContent}
    </div>
  );
}`;

fs.writeFileSync("c:\\ET-Concierge\\app\\page.js", pageJs);
console.log("Successfully converted Stitch template to page.js!");
