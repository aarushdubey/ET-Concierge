"use client";
import React, { useState, useEffect } from "react";

export default function LandingPage() {
  const [marketData, setMarketData] = useState(null);
  const [activeSection, setActiveSection] = useState("home");

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setActiveSection(entry.target.id);
        }
      });
    }, {
      root: null,
      threshold: 0.5
    });

    const sections = ['home', 'solutions', 'how-it-works', 'impact', 'contact'];
    sections.forEach(id => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    fetch("/api/market").then(res => res.json()).then(json => setMarketData(json.data)).catch(console.error);
    const interval = setInterval(() => {
      fetch("/api/market").then(res => res.json()).then(json => setMarketData(json.data)).catch(console.error);
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-surface font-body text-on-surface antialiased overflow-x-hidden h-screen overflow-y-scroll snap-y snap-mandatory bg-smooth">
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes marquee {
            0% { transform: translateX(0); }
            100% { transform: translateX(-50%); }
        }
        .animate-marquee {
            display: flex;
            width: max-content;
            animation: marquee 30s linear infinite;
        }
        .animate-float {
            animation: float 6s ease-in-out infinite;
        }
        @keyframes float {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-15px); }
        }
        .material-symbols-outlined {
            font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
            vertical-align: middle;
        }
    `}} />\n
      <style dangerouslySetInnerHTML={{__html: `
        /* Hide scrollbar for Chrome, Safari and Opera */
        .overflow-y-scroll::-webkit-scrollbar {
          display: none;
        }
        /* Hide scrollbar for IE, Edge and Firefox */
        .overflow-y-scroll {
          -ms-overflow-style: none;  /* IE and Edge */
          scrollbar-width: none;  /* Firefox */
        }
        .bg-smooth { scroll-behavior: smooth; }
      `}} />

      
{/* 1. Ticker Bar (SideNavBar logic mapping) */}
{/* 1. Dynamic Market Ticker */}
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
        <a className={activeSection === "home" ? "text-primary font-semibold border-b-2 border-primary transition-all duration-300" : "text-on-surface/80 hover:text-primary border-b-2 border-transparent transition-all duration-300"} href="#home">Home</a>
        <a className={activeSection === "solutions" ? "text-primary font-semibold border-b-2 border-primary transition-all duration-300" : "text-on-surface/80 hover:text-primary border-b-2 border-transparent transition-all duration-300"} href="#solutions">Solutions</a>
        <a className={activeSection === "how-it-works" ? "text-primary font-semibold border-b-2 border-primary transition-all duration-300" : "text-on-surface/80 hover:text-primary border-b-2 border-transparent transition-all duration-300"} href="#how-it-works">How it Works</a>
        <a className={activeSection === "impact" ? "text-primary font-semibold border-b-2 border-primary transition-all duration-300" : "text-on-surface/80 hover:text-primary border-b-2 border-transparent transition-all duration-300"} href="#impact">Impact</a>
        <a className={activeSection === "contact" ? "text-primary font-semibold border-b-2 border-primary transition-all duration-300" : "text-on-surface/80 hover:text-primary border-b-2 border-transparent transition-all duration-300"} href="#contact">Contact</a>
        <a className="text-on-surface/80 hover:text-primary flex items-center gap-1 transition-all duration-300 border-b-2 border-transparent" href="https://github.com/SHIVIKA330/ET-Concierge">
            GitHub <span className="material-symbols-outlined text-sm">open_in_new</span>
        </a>
      </div>
      <a className="bg-gradient-to-br from-primary to-primary-container text-surface px-8 py-3 rounded-md font-label font-semibold text-sm hover:scale-105 transition-transform duration-300 shadow-md" href="/chat">
          Try Financial Twin
      </a>
    </div>
  </nav>
</header>
<main className="pt-32">
{/* 3. Hero Section */}
<section id="home" className="max-w-screen-2xl mx-auto px-8 md:px-16 py-20 grid md:grid-cols-2 gap-16 items-center min-h-screen snap-start flex flex-col justify-center pb-20">
<div className="space-y-8">
<div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-container/10 text-primary-container border border-primary-container/20">
<span className="relative flex h-2 w-2">
<span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-container opacity-75"></span>
<span className="relative inline-flex rounded-full h-2 w-2 bg-primary-container"></span>
</span>
<span className="text-[10px] font-bold uppercase tracking-widest">Animated LIVE</span>
</div>
<h1 className="text-6xl md:text-8xl font-headline italic leading-[0.9] tracking-tight text-on-surface">
                    Your Money Deserves a <span className="text-primary">Digital Twin</span>
</h1>
<p className="text-lg text-on-surface/70 leading-relaxed max-w-lg font-body">
                    Move beyond static dashboards. ET Concierge creates a conversation-led digital replica of your financial life—personalized, proactive, and perfectly aligned with your goals.
                </p>
<div className="flex flex-wrap gap-4 pt-4">
<a className="bg-primary text-surface px-10 py-4 rounded-md font-semibold text-sm hover:bg-primary-container transition-colors shadow-xl inline-block" href="/chat">
                        Create Your Twin
                    </a>
<button className="bg-surface-container-highest text-on-surface px-10 py-4 rounded-md font-semibold text-sm hover:bg-surface-dim transition-colors">
                        Learn More
                    </button>
</div>
<div className="grid grid-cols-3 gap-8 pt-12 border-t border-outline-variant/20">
<div>
<div className="text-4xl font-serif italic text-primary">2.4s</div>
<div className="text-[10px] uppercase tracking-widest font-bold opacity-60">Sync Latency</div>
</div>
<div>
<div className="text-4xl font-serif italic text-primary">98%</div>
<div className="text-[10px] uppercase tracking-widest font-bold opacity-60">Accuracy</div>
</div>
<div>
<div className="text-4xl font-serif italic text-primary">24/7</div>
<div className="text-[10px] uppercase tracking-widest font-bold opacity-60">Concierge</div>
</div>
</div>
</div>
<div className="relative flex justify-center items-center">
<div className="absolute inset-0 bg-primary/5 rounded-full blur-3xl scale-75"></div>
{/* Floating Card */}
<div className="animate-float relative w-full max-w-md bg-surface border border-outline-variant/30 rounded-2xl shadow-2xl p-8 backdrop-blur-sm">
<div className="flex justify-between items-start mb-10">
<div className="flex items-center gap-4">
<div className="w-14 h-14 rounded-full overflow-hidden bg-surface-container-highest border-2 border-primary">
<img alt="Profile image of a sophisticated user for a financial platform" className="w-full h-full object-cover" data-alt="portrait of a mature man with a thoughtful expression in a luxury modern office setting, warm natural sunlight" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBIMHnb0nqLrgvycsj0YCebi0qqGnkQBqV2yxWeKDTzB_wR-6Bl5lTp5MgUwTNRuyxlnxCZmyJ41MHJRjuHabyZ-jsJ36V8chLHIkVoymN80w40-V_VhMCyHfuKRdT21lPDHGmMeTthZa8Z1zqeenQVJcdp2Q7f9OtbX9SOERWKPGcFFv5VH0dpF-K4sq4pIQRwCmAWZ8NK0MQSY31mgIv4Dqxq2k3_G2YEEyJ1Lh3ADvtCEED7YASWeulxgzKpng5VaN-IbvUw8nI"/>
</div>
<div>
<h3 className="font-serif italic font-bold text-xl">Twin Profile: Alpha</h3>
<p className="text-xs font-label uppercase text-primary tracking-widest">Active Syncing</p>
</div>
</div>
<div className="px-3 py-1 bg-green-500/10 text-green-600 rounded-full border border-green-500/20 text-[10px] font-bold">
                            CALM STATE
                        </div>
</div>
<div className="space-y-6">
<div className="p-4 rounded-xl bg-surface-container-low border-l-4 border-primary">
<p className="text-sm font-serif italic italic text-on-surface-variant">"Your risk appetite is currently optimized. I've detected a shift in market sentiment—would you like to review your tech holdings?"</p>
</div>
<div className="grid grid-cols-2 gap-4">
<div className="bg-surface-container-lowest p-4 rounded-lg shadow-sm border border-outline-variant/10">
<span className="text-[10px] block opacity-60 font-bold uppercase mb-1">Emotion Pulse</span>
<div className="flex items-center gap-2">
<span className="material-symbols-outlined text-primary text-xl">favorite</span>
<span className="font-bold text-lg">Stable</span>
</div>
</div>
<div className="bg-surface-container-lowest p-4 rounded-lg shadow-sm border border-outline-variant/10">
<span className="text-[10px] block opacity-60 font-bold uppercase mb-1">Intelligence</span>
<div className="flex items-center gap-2">
<span className="material-symbols-outlined text-primary text-xl">psychology</span>
<span className="font-bold text-lg">Tier 4</span>
</div>
</div>
</div>
</div>
</div>
</div>
</section>
{/* 4. Feature Marquee */}
<section className="bg-on-surface py-12 overflow-hidden snap-start">
<div className="animate-marquee flex gap-20 items-center">
<span className="text-surface font-headline italic text-4xl opacity-80">Hyper-Personalized Intelligence</span>
<span className="text-primary-container font-headline italic text-4xl">Emotion Detection</span>
<span className="text-surface font-headline italic text-4xl opacity-80">Privacy-First Compute</span>
<span className="text-primary-container font-headline italic text-4xl">Real-Time Market Sync</span>
<span className="text-surface font-headline italic text-4xl opacity-80">Digital Heritage</span>
{/* Duplicate */}
<span className="text-surface font-headline italic text-4xl opacity-80">Hyper-Personalized Intelligence</span>
<span className="text-primary-container font-headline italic text-4xl">Emotion Detection</span>
<span className="text-surface font-headline italic text-4xl opacity-80">Privacy-First Compute</span>
<span className="text-primary-container font-headline italic text-4xl">Real-Time Market Sync</span>
<span className="text-surface font-headline italic text-4xl opacity-80">Digital Heritage</span>
</div>
</section>
{/* 5. How It Works */}
<section id="how-it-works" className="bg-surface-container-low py-32 min-h-screen snap-start flex flex-col justify-center pb-20">
<div className="max-w-screen-2xl mx-auto px-8 md:px-16">
<div className="max-w-xl mb-20">
<h2 className="text-5xl font-headline italic text-on-surface mb-6">Built for the Discerning.</h2>
<p className="text-on-surface/60">A three-step orchestration to bring your digital twin to life.</p>
</div>
<div className="grid md:grid-cols-3 gap-12">
{/* Step 1 */}
<div className="space-y-6 group">
<div className="text-8xl font-serif italic text-outline-variant/30 transition-colors group-hover:text-primary/20">01</div>
<h3 className="text-2xl font-bold font-serif italic">Identity Mapping</h3>
<p className="text-on-surface/70 leading-relaxed">Securely connect your portfolios. Our system analyzes your historical decisions to understand your 'Financial DNA'.</p>
</div>
{/* Step 2 */}
<div className="space-y-6 group">
<div className="text-8xl font-serif italic text-outline-variant/30 transition-colors group-hover:text-primary/20">02</div>
<h3 className="text-2xl font-bold font-serif italic">Persona Training</h3>
<p className="text-on-surface/70 leading-relaxed">Engage in natural conversation. The twin learns your tone, risk thresholds, and long-term legacy ambitions.</p>
</div>
{/* Step 3 */}
<div className="space-y-6 group">
<div className="text-8xl font-serif italic text-outline-variant/30 transition-colors group-hover:text-primary/20">03</div>
<h3 className="text-2xl font-bold font-serif italic">Autonomous Concierge</h3>
<p className="text-on-surface/70 leading-relaxed">Your twin now operates 24/7, monitoring global markets and flagging opportunities that match your specific intent.</p>
</div>
</div>
</div>
</section>
{/* 6. Dark 'Killers' Section */}
<section id="solutions" className="bg-on-surface py-32 text-surface overflow-hidden min-h-screen snap-start flex flex-col justify-center pb-20">
<div className="max-w-screen-2xl mx-auto px-8 md:px-16">
<div className="flex flex-col md:flex-row justify-between items-end mb-24 gap-8">
<h2 className="text-6xl font-headline italic leading-none max-w-2xl">Proprietary Engines of <span className="text-primary-container">Superiority.</span></h2>
<p className="text-surface/50 max-w-sm mb-2">Unfair advantages built into the core of your digital private office.</p>
</div>
<div className="grid md:grid-cols-3 gap-8">
{/* Killer 1 */}
<div className="bg-white/5 border border-white/10 p-10 rounded-xl hover:bg-white/[0.08] transition-all group">
<span className="material-symbols-outlined text-4xl text-primary-container mb-8">face_retouching_natural</span>
<h3 className="text-2xl font-serif italic mb-4">Emotion Detection</h3>
<p className="text-surface/60 leading-relaxed text-sm">Detecting panic or euphoria in your communication to prevent emotionally charged financial mistakes in real-time.</p>
</div>
{/* Killer 2 */}
<div className="bg-white/5 border border-white/10 p-10 rounded-xl hover:bg-white/[0.08] transition-all group">
<span className="material-symbols-outlined text-4xl text-primary-container mb-8">hub</span>
<h3 className="text-2xl font-serif italic mb-4">Twin Builder</h3>
<p className="text-surface/60 leading-relaxed text-sm">Recursive AI models that simulate thousands of future scenarios based on your current financial trajectory.</p>
</div>
{/* Killer 3 */}
<div className="bg-white/5 border border-white/10 p-10 rounded-xl hover:bg-white/[0.08] transition-all group">
<span className="material-symbols-outlined text-4xl text-primary-container mb-8">visibility_off</span>
<h3 className="text-2xl font-serif italic mb-4">Silence Intelligence</h3>
<p className="text-surface/60 leading-relaxed text-sm">Proprietary privacy layer that allows your twin to execute insights without exposing your raw data to third-party LLMs.</p>
</div>
</div>
</div>
</section>
{/* 7. Impact Section */}
<section id="impact" className="py-32 min-h-screen snap-start flex flex-col justify-center pb-20">
<div className="max-w-screen-2xl mx-auto px-8 md:px-16">
<div className="grid md:grid-cols-4 gap-6">
<div className="bg-surface-container-lowest p-8 rounded-lg shadow-sm">
<div className="text-5xl font-serif italic text-primary mb-2">$2.4B</div>
<p className="font-bold text-[10px] uppercase tracking-widest opacity-50 mb-6">Assets Modeled</p>
<div className="flex flex-wrap gap-2">
<span className="px-2 py-1 bg-surface-container text-[9px] font-bold rounded">PYTHON</span>
<span className="px-2 py-1 bg-surface-container text-[9px] font-bold rounded">LLAMA-3</span>
</div>
</div>
<div className="bg-surface-container-lowest p-8 rounded-lg shadow-sm">
<div className="text-5xl font-serif italic text-primary mb-2">12k+</div>
<p className="font-bold text-[10px] uppercase tracking-widest opacity-50 mb-6">Concierge Active</p>
<div className="flex flex-wrap gap-2">
<span className="px-2 py-1 bg-surface-container text-[9px] font-bold rounded">REACT</span>
<span className="px-2 py-1 bg-surface-container text-[9px] font-bold rounded">FASTAPI</span>
</div>
</div>
<div className="bg-surface-container-lowest p-8 rounded-lg shadow-sm">
<div className="text-5xl font-serif italic text-primary mb-2">0.02%</div>
<p className="font-bold text-[10px] uppercase tracking-widest opacity-50 mb-6">Drift Margin</p>
<div className="flex flex-wrap gap-2">
<span className="px-2 py-1 bg-surface-container text-[9px] font-bold rounded">TENSORFLOW</span>
<span className="px-2 py-1 bg-surface-container text-[9px] font-bold rounded">AWS</span>
</div>
</div>
<div className="bg-surface-container-lowest p-8 rounded-lg shadow-sm">
<div className="text-5xl font-serif italic text-primary mb-2">99.9%</div>
<p className="font-bold text-[10px] uppercase tracking-widest opacity-50 mb-6">Uptime Guarantee</p>
<div className="flex flex-wrap gap-2">
<span className="px-2 py-1 bg-surface-container text-[9px] font-bold rounded">DOCKER</span>
<span className="px-2 py-1 bg-surface-container text-[9px] font-bold rounded">REDIS</span>
</div>
</div>
</div>
</div>
</section>
{/* 7.5 Contact Section */}
<section id="contact" className="bg-surface-container-low py-32 min-h-screen snap-start flex flex-col justify-center pb-20 border-t border-outline-variant/10">
<div className="max-w-screen-2xl mx-auto px-8 md:px-16 w-full">
<div className="grid md:grid-cols-12 gap-16">
  {/* Left Column */}
  <div className="md:col-span-5 flex flex-col justify-center">
    <h2 className="text-5xl font-headline italic text-on-surface mb-6">For Queries</h2>
    <div className="w-12 h-1 bg-primary mb-6"></div>
    <p className="text-on-surface/60 mb-10 text-lg">Contact us if you have any queries.</p>
    
    <div className="space-y-6">
      <div className="bg-surface p-6 rounded-xl border border-outline-variant/20 shadow-sm flex items-start gap-4 hover:border-primary transition-colors cursor-pointer group">
        <span className="material-symbols-outlined text-primary text-3xl mt-1 opacity-80 group-hover:opacity-100 transition-opacity">support_agent</span>
        <div>
          <p className="text-xs font-bold uppercase tracking-widest opacity-60 mb-2">For more queries speak to</p>
          <a href="tel:+919990630564" className="text-xl font-serif italic text-primary">+91 - 99906 30564</a>
        </div>
      </div>
      
      <div className="bg-surface p-6 rounded-xl border border-outline-variant/20 shadow-sm flex items-start gap-4 hover:border-primary transition-colors cursor-pointer group">
        <span className="material-symbols-outlined text-primary text-3xl mt-1 opacity-80 group-hover:opacity-100 transition-opacity">mail</span>
        <div>
          <p className="text-xs font-bold uppercase tracking-widest opacity-60 mb-2">Email Us</p>
          <a href="mailto:contactus@etmasterclass.com" className="text-xl font-serif italic text-primary break-all">contactus@etmasterclass.com</a>
        </div>
      </div>
    </div>
  </div>
  
  {/* Right Column: Form */}
  <div className="md:col-span-7 bg-surface p-8 md:p-12 rounded-3xl border border-outline-variant/20 shadow-xl relative overflow-hidden flex flex-col justify-center">
    <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[80px] -z-0"></div>
    <div className="relative z-10">
      <h3 className="text-4xl font-serif italic font-bold mb-4">Get a Call Back</h3>
      <p className="text-on-surface/60 mb-8 border-b border-outline-variant/10 pb-6 text-sm">Please fill in your details to get a call back</p>
      
      <form className="grid grid-cols-1 md:grid-cols-2 gap-6" onSubmit={(e) => e.preventDefault()}>
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-widest opacity-60 ml-2">Name *</label>
          <input type="text" placeholder="Enter Name" className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl px-5 py-4 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-sm" required />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-widest opacity-60 ml-2">Mobile No. *</label>
          <input type="tel" placeholder="Enter Mobile No." className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl px-5 py-4 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-sm" required />
        </div>
        <div className="space-y-2 md:col-span-2">
          <label className="text-xs font-bold uppercase tracking-widest opacity-60 ml-2">Email *</label>
          <input type="email" placeholder="Enter Email" className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl px-5 py-4 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-sm" required />
        </div>
        <div className="space-y-2 md:col-span-2">
          <label className="text-xs font-bold uppercase tracking-widest opacity-60 ml-2">Message *</label>
          <textarea rows="4" placeholder="Enter Message" className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl px-5 py-4 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all resize-none text-sm" required></textarea>
        </div>
        <div className="md:col-span-2 mt-4">
          <button type="submit" className="w-full bg-primary text-surface font-bold py-5 rounded-xl shadow-lg hover:bg-primary-container transition-colors text-lg italic tracking-wide">
            Submit
          </button>
        </div>
      </form>
    </div>
  </div>
</div>
</div>
</section>
{/* 8. Dark CTA Banner */}
<section className="max-w-screen-2xl mx-auto px-8 md:px-16 pb-32 min-h-screen snap-start flex flex-col justify-center pb-20">
<div className="relative bg-on-surface rounded-2xl p-16 md:p-24 overflow-hidden text-center">
<div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-primary opacity-20 blur-[120px]"></div>
<div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 bg-primary-container opacity-20 blur-[120px]"></div>
<h2 className="text-5xl md:text-7xl font-headline italic text-surface mb-8 relative z-10">
                    Your Legacy, <span className="text-primary-container">Architected.</span>
</h2>
<p className="text-surface/60 max-w-2xl mx-auto mb-12 relative z-10 text-lg">
                    Join the exclusive waitlist for the digital private office that understands not just your wealth, but your soul.
                </p>
<div className="flex flex-col sm:flex-row gap-4 justify-center relative z-10">
<button className="bg-primary text-surface px-12 py-5 rounded-md font-bold text-sm shadow-2xl hover:scale-105 transition-transform">
                        Request Invitation
                    </button>
<button className="border border-surface/20 text-surface px-12 py-5 rounded-md font-bold text-sm hover:bg-surface/10 transition-colors">
                        View Documentation
                    </button>
</div>
</div>
</section>
</main>
{/* 9. Footer */}
<footer className="bg-black text-surface py-20 snap-start min-h-[50vh] flex flex-col justify-center">
<div className="grid grid-cols-1 md:grid-cols-4 gap-12 px-8 md:px-16 max-w-screen-2xl mx-auto">
<div className="col-span-1 md:col-span-1">
<div className="flex items-center gap-2 mb-8">
<div className="w-8 h-8 bg-primary-container flex items-center justify-center rounded">
<span className="text-surface font-serif italic font-bold text-lg">ET</span>
</div>
<span className="text-2xl font-serif italic font-bold text-primary-container">Financial Twin</span>
</div>
<p className="text-surface/40 text-sm leading-relaxed max-w-xs">
                    The Digital Private Office. Redefining high-net-worth management through conversational intelligence.
                </p>
</div>
<div className="space-y-4">
<h4 className="font-bold text-xs uppercase tracking-widest text-primary-container">Ecosystem</h4>
<ul className="space-y-2 text-surface/60 text-sm">
<li><a className="hover:text-surface transition-colors" href="#solutions">Solutions</a></li>
<li><a className="hover:text-surface transition-colors" href="#how-it-works">How it Works</a></li>
<li><a className="hover:text-surface transition-colors" href="#impact">Market Pulse</a></li>
<li><a className="hover:text-surface transition-colors" href="#">Privacy Model</a></li>
</ul>
</div>
<div className="space-y-4">
<h4 className="font-bold text-xs uppercase tracking-widest text-primary-container">Legal</h4>
<ul className="space-y-2 text-surface/60 text-sm">
<li><a className="hover:text-surface transition-colors" href="#">Privacy Policy</a></li>
<li><a className="hover:text-surface transition-colors" href="#">Terms of Service</a></li>
<li><a className="hover:text-surface transition-colors" href="#">Regulatory Disclosures</a></li>
<li><a className="hover:text-surface transition-colors" href="#contact">Contact</a></li>
</ul>
</div>
<div className="space-y-8">
<div className="space-y-4">
<h4 className="font-bold text-xs uppercase tracking-widest text-primary-container">Connect</h4>
<div className="flex items-center gap-4">
<a className="text-surface/60 hover:text-surface transition-colors flex items-center gap-2" href="#">
                            GitHub <span className="material-symbols-outlined text-sm">link</span>
</a>
</div>
</div>

</div>
</div>
<div className="mt-20 px-8 md:px-16 max-w-screen-2xl mx-auto border-t border-white/5 pt-10 text-center md:text-left">
<p className="text-xs text-surface/30 font-serif italic">
                © 2024 Financial Twin. The Digital Private Office. All rights reserved. Built for the era of autonomous wealth.
            </p>
</div>
</footer>

    </div>
  );
}