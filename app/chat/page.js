"use client";
import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, CheckCircle2, Send, Mic, MicOff } from "lucide-react";

const QUICK_ACTIONS = [
  { icon:"📈", title:"I want to start investing", desc:"Get personalized guidance for your investment journey",
    msg:"I'm new to investing and want to start my journey. Can you help me figure out the best way to begin?" },
  { icon:"📰", title:"Stay ahead with business news", desc:"Find the best way to consume quality business intelligence",
    msg:"I want to stay updated with high-quality business news and analysis. What does ET offer?" },
  { icon:"🎓", title:"Upskill my career", desc:"Discover courses & events to accelerate growth",
    msg:"I'm looking to upskill and grow in my career. What learning opportunities does ET have?" },
  { icon:"💰", title:"Manage my wealth better", desc:"Tools & insights for personal finance and tax planning",
    msg:"I want to manage my finances better - tax planning, mutual funds, insurance. What can ET help with?" },
];

const EMOTION_CONFIG = {
  neutral: { icon:"🔵", label:"Neutral", class:"neutral" },
  normal: { icon:"🔵", label:"Listening", class:"neutral" },
  calm: { icon:"🟢", label:"Calm Mode", class:"calm" },
  calming: { icon:"🟢", label:"Calming Mode", class:"calm" },
  "fomo-guard": { icon:"🟠", label:"FOMO Guard", class:"fomo" },
  fomo: { icon:"🟠", label:"FOMO Guard", class:"fomo" },
  panic: { icon:"🔴", label:"Panic Support", class:"panic" },
  simplifier: { icon:"🟣", label:"Simplifier", class:"simplifier" },
  challenge: { icon:"🟡", label:"Challenge Mode", class:"fomo" },
};

const TWIN_TRAITS = ["age", "income", "city", "riskProfile", "lifeStage", "knowledgeLevel", "goals", "emotionalTriggers"];
const TRAIT_LABELS = { age:"Age", income:"Income", city:"City", riskProfile:"Risk Profile", lifeStage:"Life Stage", knowledgeLevel:"Knowledge Level", goals:"Goals", emotionalTriggers:"Emotional Triggers" };

const JOURNEY_STEPS = [
  { product:"ET Prime", url:"https://economictimes.indiatimes.com/prime" },
  { product:"ET Money SIP Calculator", url:"https://www.etmoney.com/tools-and-calculators/sip-calculator" },
  { product:"ET Markets Watchlist", url:"https://economictimes.indiatimes.com/markets/stocks/stock-screener" },
  { product:"ET Wealth Summit", url:"https://economictimes.indiatimes.com/wealth" },
];

const fmt = (d) => d.toLocaleTimeString("en-IN",{hour:"2-digit",minute:"2-digit",hour12:true});

export default function Home() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sidebarTab, setSidebarTab] = useState("twin");
  const [showModal, setShowModal] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [voiceLang, setVoiceLang] = useState("en-IN");
  const [mobileSidebar, setMobileSidebar] = useState(false);

  // Chat history state
  const [activeChatId, setActiveChatId] = useState(null);
  const [chatHistory, setChatHistory] = useState([]);
  const [historyLoaded, setHistoryLoaded] = useState(false);

  const [user, setUser] = useState(null);
  const router = useRouter();

  // Financial Twin state (persisted via localStorage)
  const [financialTwin, setFinancialTwin] = useState(null);
  const [twinTraits, setTwinTraits] = useState({});
  const [emotionState, setEmotionState] = useState({ detected:"neutral", mode:"normal" });
  const [goals, setGoals] = useState([]);
  const [interests, setInterests] = useState([]);
  const [recommendedProducts, setRecommendedProducts] = useState([]);
  const [onboardingPath, setOnboardingPath] = useState([]);
  const [cohortInsight, setCohortInsight] = useState(null);
  const [proactiveNudge, setProactiveNudge] = useState(null);

  // Trust cards from AI responses
  const [inlineTrustCards, setInlineTrustCards] = useState([]);

  // Journey map
  const [showJourneyMap, setShowJourneyMap] = useState(false);
  const [journeyReasons, setJourneyReasons] = useState([]);

  // Email state
  const [isEmailing, setIsEmailing] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  // Market data & RSS
  const [marketData, setMarketData] = useState(null);
  const [rssHeadlines, setRssHeadlines] = useState([]);
  const [currentHeadlineIdx, setCurrentHeadlineIdx] = useState(0);

  // Proactive alerts
  const [proactiveAlert, setProactiveAlert] = useState(null);
  const lastAlertTimeRef = useRef(0);

  // Silence intelligence
  const [silenceSignals, setSilenceSignals] = useState([]);

  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);
  const recognitionRef = useRef(null);

  // Load persisted twin on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem("et_financial_twin");
      if (saved) {
        const parsed = JSON.parse(saved);
        setTwinTraits(parsed);
      }
    } catch (e) { /* ignore */ }
  }, []);

  // Auth check + load history
  useEffect(() => {
    fetch("/api/auth/me")
      .then(res => {
        if (!res.ok) { router.push("/login"); return null; }
        return res.json();
      })
      .then(data => {
        if (data?.user) {
          setUser(data.user);
          if (data.user.name) {
            localStorage.setItem("et_user_name", data.user.name);
          }
          if (data.user.financialTwin) {
            setFinancialTwin(data.user.financialTwin);
          }
          fetchChatHistory();
        }
      }).catch(() => { router.push("/login"); });
  }, [router]);

  const fetchChatHistory = async () => {
    try {
      const res = await fetch("/api/chat/history");
      if (res.ok) {
        const json = await res.json();
        setChatHistory(json.chats || []);
        setHistoryLoaded(true);
      }
    } catch (e) { /* ignore */ }
  };

  const loadChat = async (chatId) => {
    try {
      const res = await fetch(`/api/chat/history?id=${chatId}`);
      if (!res.ok) return;
      const json = await res.json();
      if (json.chat) {
        const loaded = json.chat.messages.map(m => ({
          ...m,
          timestamp: new Date(m.timestamp)
        }));
        setMessages(loaded);
        setActiveChatId(json.chat.id);
        setMobileSidebar(false);
      }
    } catch (e) { console.error("Failed to load chat", e); }
  };

  const saveChat = async (msgs) => {
    if (!msgs || msgs.length === 0) return;
    const toSave = msgs.map(m => ({ role: m.role, content: m.content, timestamp: m.timestamp, emotionMode: m.emotionMode }));
    try {
      const res = await fetch("/api/chat/history", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chatId: activeChatId, messages: toSave }),
      });
      if (res.ok) {
        const json = await res.json();
        if (!activeChatId && json.chat?.id) setActiveChatId(json.chat.id);
        fetchChatHistory();
      }
    } catch (e) { /* ignore */ }
  };

  const deleteChatItem = async (chatId) => {
    try {
      await fetch(`/api/chat/history?id=${chatId}`, { method: "DELETE" });
      if (activeChatId === chatId) {
        setActiveChatId(null);
        setMessages([]);
      }
      fetchChatHistory();
    } catch (e) { /* ignore */ }
  };

  // Welcome back message if twin exists
  useEffect(() => {
    if (messages.length === 0) {
      try {
        const saved = localStorage.getItem("et_financial_twin");
        const userName = localStorage.getItem("et_user_name");
        if (saved) {
          const parsed = JSON.parse(saved);
          const detectedCount = TWIN_TRAITS.filter(t => parsed[t] && parsed[t] !== null).length;
          if (detectedCount > 0) {
            const name = userName || user?.name || "there";
            setMessages([{
              role: "assistant",
              content: `Welcome back, ${name}! Your twin remembers you. 🧬 I already know ${detectedCount} things about your financial profile. Let's pick up where we left off — what's on your mind today?`,
              timestamp: new Date()
            }]);
          }
        }
      } catch (e) { /* ignore */ }
    }
  }, [user]);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  };

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior:"smooth" });
  }, []);

  useEffect(() => { scrollToBottom(); }, [messages, isLoading, scrollToBottom]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = textareaRef.current.scrollHeight + "px";
    }
  }, [input]);

  // Fetch market data every 60 seconds
  useEffect(() => {
    const fetchMarket = async () => {
      try {
        const res = await fetch("/api/market");
        const json = await res.json();
        if (json.data) setMarketData(json.data);
      } catch(e) { /* ignore */ }
    };
    fetchMarket();
    const interval = setInterval(fetchMarket, 60000);
    return () => clearInterval(interval);
  }, []);

  // Fetch RSS every 5 minutes
  useEffect(() => {
    const fetchRss = async () => {
      try {
        const res = await fetch("/api/rss");
        const json = await res.json();
        if (json.headlines?.length) setRssHeadlines(json.headlines);
      } catch(e) { /* ignore */ }
    };
    fetchRss();
    const interval = setInterval(fetchRss, 300000);
    return () => clearInterval(interval);
  }, []);

  // Rotate headline every 20 seconds
  useEffect(() => {
    if (rssHeadlines.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentHeadlineIdx(prev => (prev + 1) % rssHeadlines.length);
    }, 20000);
    return () => clearInterval(interval);
  }, [rssHeadlines.length]);

  // Proactive alert system — every 90 seconds
  useEffect(() => {
    if (messages.length === 0) return;
    const checkAlerts = () => {
      const now = Date.now();
      if (now - lastAlertTimeRef.current < 300000) return; // 5 min cooldown
      if (!marketData?.sensex) return;

      const change = marketData.sensex.change;
      if (change > 1.5) {
        setProactiveAlert({
          type: "green",
          message: `SENSEX is up ${change.toFixed(1)}% today — good time to review your SIP performance`,
          action: null
        });
        lastAlertTimeRef.current = now;
      } else if (change < -1.5) {
        setProactiveAlert({
          type: "red",
          message: `⚠️ SENSEX dropped ${Math.abs(change).toFixed(1)}% — based on your profile, here's what NOT to do right now`,
          action: null
        });
        lastAlertTimeRef.current = now;
      } else if (rssHeadlines.length > 0) {
        const hl = rssHeadlines[Math.floor(Math.random() * rssHeadlines.length)];
        setProactiveAlert({
          type: "news",
          message: hl.title.length > 80 ? hl.title.substring(0, 77) + "..." : hl.title,
          action: hl.title
        });
        lastAlertTimeRef.current = now;
      }
    };
    const interval = setInterval(checkAlerts, 90000);
    return () => clearInterval(interval);
  }, [messages.length, marketData, rssHeadlines]);

  // Auto-dismiss proactive alerts after 15 seconds
  useEffect(() => {
    if (!proactiveAlert) return;
    const timeout = setTimeout(() => setProactiveAlert(null), 15000);
    return () => clearTimeout(timeout);
  }, [proactiveAlert]);

  // Voice recognition
  useEffect(() => {
    if (typeof window !== "undefined" && ("SpeechRecognition" in window || "webkitSpeechRecognition" in window)) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.onresult = (e) => {
        const transcript = Array.from(e.results).map(r => r[0].transcript).join("");
        setInput(transcript);
      };
      recognitionRef.current.onend = () => setIsRecording(false);
      recognitionRef.current.onerror = () => setIsRecording(false);
    }
  }, []);

  const toggleVoice = () => {
    if (!recognitionRef.current) return;
    if (isRecording) { recognitionRef.current.stop(); setIsRecording(false); }
    else { recognitionRef.current.lang = voiceLang; recognitionRef.current.start(); setIsRecording(true); }
  };

  const cycleLang = () => {
    const langs = ["en-IN","hi-IN","ta-IN","te-IN","bn-IN"];
    const idx = langs.indexOf(voiceLang);
    setVoiceLang(langs[(idx+1) % langs.length]);
  };

  const langLabels = {"en-IN":"EN 🇮🇳","hi-IN":"हिंदी","ta-IN":"தமிழ்","te-IN":"తెలుగు","bn-IN":"বাংলা"};

  // Persist twin traits to localStorage
  const persistTwin = useCallback((traits) => {
    setTwinTraits(prev => {
      const merged = { ...prev };
      Object.entries(traits).forEach(([k, v]) => {
        if (v !== null && v !== undefined && v !== "") merged[k] = v;
      });
      try { localStorage.setItem("et_financial_twin", JSON.stringify(merged)); } catch(e) {}
      return merged;
    });
  }, []);

  // Calculate twin progress
  const getTwinProgress = () => {
    const detected = TWIN_TRAITS.filter(t => twinTraits[t] && twinTraits[t] !== null);
    let pct = detected.length * 12;
    if (recommendedProducts.length > 0 || inlineTrustCards.length > 0) pct = Math.min(pct + 4, 100);
    return Math.min(pct, 100);
  };

  // Check if journey map should show
  const shouldShowJourney = () => {
    if (typeof window === "undefined") return false;
    if (localStorage.getItem("et_journey_shown") === "true") return false;
    return messages.length >= 6 || showJourneyMap;
  };

  const sendMessage = async (content) => {
    if (!content.trim() || isLoading) return;
    const userMsg = { role:"user", content:content.trim(), timestamp:new Date() };
    const newMsgs = [...messages, userMsg];
    setMessages(newMsgs);
    setInput("");
    setIsLoading(true);

    try {
      const apiMsgs = newMsgs.map(m => ({ role:m.role, content:m.content }));
      const res = await fetch("/api/chat", {
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body: JSON.stringify({ messages:apiMsgs, silenceData:silenceSignals, existingTwin:twinTraits }),
      });
      if (!res.ok) throw new Error("API failed");
      const data = await res.json();

      const assistantMsg = {
        role:"assistant",
        content:data.message,
        timestamp:new Date(),
        emotionMode: data.profileUpdate?.emotionState?.mode || "normal",
        trustCards: data.trustCards || []
      };
      const allMsgs = [...newMsgs, assistantMsg];
      setMessages(allMsgs);
      saveChat(allMsgs);

      // Handle twin_update
      if (data.twinUpdate) {
        persistTwin(data.twinUpdate);
      }

      // Handle trust cards
      if (data.trustCards?.length) {
        setInlineTrustCards(prev => [...prev, ...data.trustCards]);
      }

      // Handle journey_map_ready
      if (data.journeyMapReady) {
        setShowJourneyMap(true);
      }

      // Handle profile update (backward compat)
      if (data.profileUpdate) {
        const pu = data.profileUpdate;
        if (pu.financialTwin) {
          setFinancialTwin(prev => {
            const merged = { ...(prev || {}), ...pu.financialTwin };
            Object.keys(merged).forEach(k => { if (merged[k] === null && prev?.[k]) merged[k] = prev[k]; });
            return merged;
          });
          // Also persist relevant traits
          const ft = pu.financialTwin;
          const mapped = {};
          if (ft.age) mapped.age = ft.age;
          if (ft.income) mapped.income = ft.income;
          if (ft.city) mapped.city = ft.city;
          if (ft.riskPsychology) mapped.riskProfile = ft.riskPsychology;
          if (ft.lifeStage) mapped.lifeStage = ft.lifeStage;
          if (ft.knowledgeLevel) mapped.knowledgeLevel = ft.knowledgeLevel;
          if (ft.goalTimeline) mapped.goals = ft.goalTimeline;
          if (ft.emotionalTriggers?.length) mapped.emotionalTriggers = ft.emotionalTriggers.join(", ");
          if (Object.keys(mapped).length > 0) persistTwin(mapped);
        }
        if (pu.emotionState) setEmotionState(pu.emotionState);
        if (pu.goals?.length) setGoals(pu.goals);
        if (pu.interests?.length) setInterests(pu.interests);
        if (pu.recommendedProducts?.length) setRecommendedProducts(pu.recommendedProducts);
        if (pu.onboardingPath?.length) setOnboardingPath(pu.onboardingPath);
        if (pu.cohortInsight) setCohortInsight(pu.cohortInsight);
        if (pu.proactiveNudge) setProactiveNudge(pu.proactiveNudge);
        if (pu.silenceSignals?.length) setSilenceSignals(prev => [...new Set([...prev, ...pu.silenceSignals])]);
      }

      // Auto-show journey after 6 messages
      if (newMsgs.length + 1 >= 6 && !localStorage.getItem("et_journey_shown")) {
        setShowJourneyMap(true);
      }

    } catch(err) {
      console.error(err);
      setMessages([...newMsgs, { role:"assistant", content:"I'm having trouble connecting. Please try again. 🙏", timestamp:new Date() }]);
    } finally { setIsLoading(false); }
  };

  const handleKey = (e) => { if (e.key==="Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(input); } };

  const resetTwin = () => {
    localStorage.removeItem("et_financial_twin");
    localStorage.removeItem("et_journey_shown");
    localStorage.removeItem("et_user_name");
    window.location.reload();
  };

  const resetChat = () => {
    setActiveChatId(null);
    setMessages([]); setFinancialTwin(null); setEmotionState({detected:"neutral",mode:"normal"});
    setGoals([]); setInterests([]); setRecommendedProducts([]); setOnboardingPath([]);
    setCohortInsight(null); setProactiveNudge(null); setSilenceSignals([]);
    setInlineTrustCards([]); setShowJourneyMap(false); setShowModal(false);
  };

  const handleSendEmail = async () => {
    setIsEmailing(true);
    try {
      await fetch("/api/email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ twinData: twinTraits, email: user?.email })
      });
      setEmailSent(true);
      setTimeout(() => setEmailSent(false), 4000);
    } catch (e) {
      console.error(e);
    } finally {
      setIsEmailing(false);
    }
  };

  const hasTwin = financialTwin && Object.values(financialTwin).some(v => v !== null && v !== undefined && (!Array.isArray(v) || v.length > 0));
  const twinProgress = getTwinProgress();
  // Client-side initialization for initials to avoid hydration mismatch
  const [userInitials, setUserInitials] = useState("U");
  useEffect(() => {
    try {
      const name = localStorage.getItem("et_user_name") || user?.name;
      if (name) setUserInitials(name.split(" ").map(w => w[0]).join("").toUpperCase().substring(0, 2));
    } catch { /* ignore */ }
  }, [user]);

  const currentHeadline = rssHeadlines[currentHeadlineIdx] || null;
  const cleanHeadlineTitle = currentHeadline 
    ? currentHeadline.title.replace(/<!\[CDATA\[/g, "").replace(/\]\]>/g, "").trim() 
    : "";

  return (
    <>
      {/* Market Ticker */}
      {marketData && (
        <div className="market-ticker">
          <div className="ticker-track">
            {[...Object.values(marketData), ...Object.values(marketData)].map((item,i) => (
              <div key={i} className="ticker-item">
                <span className="ticker-name">{item.name}</span>
                <span className="ticker-value">{typeof item.value === 'number' ? item.value.toLocaleString("en-IN") : item.value}</span>
                <span className={`ticker-change ${item.change >= 0 ? "up" : "down"}`}>
                  {item.change >= 0 ? "▲" : "▼"} {Math.abs(item.change).toFixed(2)}%
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Mobile sidebar toggle */}
      <button className="mobile-sidebar-toggle" onClick={() => setMobileSidebar(!mobileSidebar)}>
        {mobileSidebar ? "✕" : "☰"}
      </button>

      <div className="app-container">
        {/* SIDEBAR */}
        <aside className={`sidebar ${mobileSidebar ? "open" : ""}`}>
          <div className="sidebar-header">
            <div className="sidebar-logo">ET</div>
            <div className="sidebar-brand">
              <h1>ET Concierge</h1>
              <p>AI Financial Companion</p>
            </div>
          </div>

          <div className="sidebar-tabs">
            <button className={`sidebar-tab ${sidebarTab==="twin"?"active":""}`} onClick={() => setSidebarTab("twin")}>🧬 Twin</button>
            <button className={`sidebar-tab ${sidebarTab==="history"?"active":""}`} onClick={() => setSidebarTab("history")}>💬 History</button>
            <button className={`sidebar-tab ${sidebarTab==="market"?"active":""}`} onClick={() => setSidebarTab("market")}>📈 Market</button>
          </div>

          <div className="sidebar-content">
            {sidebarTab === "twin" && (
              <>
                {/* A) Twin Progress Bar */}
                <div className="twin-progress-section">
                  <div className="twin-progress-header">
                    <div className="twin-avatar" style={{background:"#7c3aed"}} suppressHydrationWarning={true}>{userInitials}</div>
                    <div className="twin-progress-info">
                      <div className="twin-progress-label">Financial Twin — {twinProgress}% complete</div>
                      <div className="twin-progress-bar-track">
                        <div className="twin-progress-bar-fill" style={{width:`${twinProgress}%`}}></div>
                      </div>
                    </div>
                  </div>
                  <div className="twin-traits-list">
                    {TWIN_TRAITS.map(trait => (
                      <div key={trait} className="twin-trait-row">
                        <span className="twin-trait-key">{TRAIT_LABELS[trait]}</span>
                        {twinTraits[trait] ? (
                          <span className="twin-trait-value">{twinTraits[trait]}</span>
                        ) : (
                          <span className="twin-trait-detecting">detecting...</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Emotion State */}
                {emotionState.mode && emotionState.mode !== "normal" && (
                  <div className={`emotion-badge ${EMOTION_CONFIG[emotionState.mode]?.class || "neutral"}`}>
                    {EMOTION_CONFIG[emotionState.mode]?.icon || "🔵"} {EMOTION_CONFIG[emotionState.mode]?.label || emotionState.mode}
                    {emotionState.trigger && <span style={{opacity:0.7}}> — {emotionState.trigger}</span>}
                  </div>
                )}

                {/* Existing twin detail cards */}
                {hasTwin && (
                  <>
                    {financialTwin.profession && (
                      <div className="twin-card">
                        <div className="twin-card-header">
                          <div className="twin-card-icon" style={{background:"rgba(0,188,212,0.12)"}}>💼</div>
                          <div className="twin-card-title">Profession</div>
                        </div>
                        <div className="twin-card-value">{financialTwin.profession}{financialTwin.city ? ` • ${financialTwin.city}` : ""}</div>
                      </div>
                    )}
                    {financialTwin.riskPsychology && (
                      <div className="twin-card">
                        <div className="twin-card-header">
                          <div className="twin-card-icon" style={{background:"rgba(255,152,0,0.12)"}}>⚖️</div>
                          <div className="twin-card-title">Risk Psychology</div>
                        </div>
                        <div className="twin-card-value">{financialTwin.riskPsychology}</div>
                      </div>
                    )}
                    {financialTwin.investmentStyle && (
                      <div className="twin-card">
                        <div className="twin-card-header">
                          <div className="twin-card-icon" style={{background:"rgba(63,81,181,0.12)"}}>📈</div>
                          <div className="twin-card-title">Investment Style</div>
                        </div>
                        <div className="twin-card-value">{financialTwin.investmentStyle}</div>
                      </div>
                    )}
                    {financialTwin.insuranceGap && (
                      <div className="twin-card">
                        <div className="twin-card-header">
                          <div className="twin-card-icon" style={{background:"rgba(244,67,54,0.12)"}}>🛡️</div>
                          <div className="twin-card-title">Insurance Gap</div>
                        </div>
                        <div className="twin-card-value">{financialTwin.insuranceGap}</div>
                      </div>
                    )}
                  </>
                )}

                {/* Cohort Insight */}
                {cohortInsight && (
                  <div className="cohort-card">
                    <h5>👥 Peer Benchmarking</h5>
                    <p>{cohortInsight}</p>
                  </div>
                )}

                {/* Reset Twin */}
                <button className="reset-twin-btn" onClick={resetTwin}>Reset Twin & Start Fresh</button>
              </>
            )}

            {sidebarTab === "market" && (
              <>
                {/* B) Live Market Pulse */}
                <div className="twin-section-title"><span className="dot"></span> Live Market Pulse</div>
                {marketData ? (
                  <div className="market-pulse-grid">
                    {Object.values(marketData).map((item, i) => (
                      <div key={i} className="market-pulse-item">
                        <div className="market-pulse-name">{item.name}</div>
                        <div className="market-pulse-value">
                          {typeof item.value === 'number' ? item.value.toLocaleString("en-IN", {maximumFractionDigits:2}) : item.value}
                        </div>
                        <div className={`market-pulse-change ${item.change >= 0 ? "up" : "down"}`}>
                          {item.change >= 0 ? "▲" : "▼"} {Math.abs(item.change).toFixed(2)}%
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="empty-twin"><div className="icon">📊</div><p>Loading market data...</p></div>
                )}

                {/* C) ET Alert Card — RSS */}
                {currentHeadline && (
                  <>
                    <div className="twin-section-title" style={{marginTop:24}}><span className="dot" style={{background:"#d97706"}}></span> ET News Alert</div>
                    <div className="rss-alert-card">
                      <div className="rss-alert-title">
                        {cleanHeadlineTitle.length > 80 ? cleanHeadlineTitle.substring(0, 77) + "..." : cleanHeadlineTitle}
                      </div>
                      <a href={currentHeadline.link} target="_blank" rel="noopener noreferrer" className="rss-alert-link">
                        Read on ET →
                      </a>
                    </div>
                  </>
                )}
              </>
            )}

            {sidebarTab === "products" && (
              <>
                <div className="twin-section-title"><span className="dot"></span> Personalized Recommendations</div>
                {recommendedProducts.length === 0 ? (
                  <div className="empty-twin">
                    <div className="icon">📦</div>
                    <h4>No recommendations yet</h4>
                    <p>Chat with me to get personalized ET product recommendations with trust scores.</p>
                  </div>
                ) : (
                  <>
                    {recommendedProducts.map((p,i) => (
                      <div key={i} className="trust-card">
                        <div className="trust-card-top">
                          <div className="trust-card-name">
                            <span className="icon">
                              {p.name.includes("Prime") ? "⭐" :
                               p.name.includes("Market") ? "📈" :
                               p.name.includes("Wealth") ? "💰" :
                               p.name.includes("Master") ? "🎓" :
                               p.name.includes("Now") ? "📺" : "📌"}
                            </span>
                            {p.name}
                          </div>
                          <span className={`trust-match ${p.match >= 85 ? "high" : "medium"}`}>{p.match}%</span>
                        </div>
                        <div className="trust-reason">{p.reason}</div>
                        {p.trustReason && <div className="trust-evidence">🔍 {p.trustReason}</div>}
                        {p.confidence && (
                          <div className="confidence-bar">
                            <div className="confidence-fill" style={{width:`${p.confidence}%`}}></div>
                          </div>
                        )}
                      </div>
                    ))}
                    {onboardingPath.length > 0 && (
                      <button className="journey-btn" onClick={() => setShowModal(true)}>
                        🗺️ View Your Personalized Journey
                      </button>
                    )}
                  </>
                )}
              </>
            )}

            {sidebarTab === "history" && (
              <>
                <div className="twin-section-title"><span className="dot"></span> Chat History</div>
                <button className="history-new-btn" onClick={resetChat}>+ New Conversation</button>
                {chatHistory.length === 0 ? (
                  <div className="empty-twin">
                    <div className="icon">💬</div>
                    <h4>No conversations yet</h4>
                    <p>Start chatting and your conversations will be saved here automatically.</p>
                  </div>
                ) : (
                  <div className="history-list">
                    {chatHistory.map((chat) => (
                      <div key={chat.id} className={`history-item ${activeChatId === chat.id ? "active" : ""}`}>
                        <div className="history-item-content" onClick={() => loadChat(chat.id)}>
                          <div className="history-item-title">{chat.title}</div>
                          <div className="history-item-meta">
                            {chat.messageCount} messages • {timeAgo(chat.updatedAt)}
                          </div>
                        </div>
                        <button className="history-item-delete" onClick={(e) => { e.stopPropagation(); deleteChatItem(chat.id); }} title="Delete">🗑</button>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </aside>

        {/* MAIN */}
        <main className="main-content">
          <div className="chat-header">
            <div className="chat-header-left">
              <div className="chat-status">
                <span className="status-indicator"></span>
                <span>ET Concierge is online {user ? `• Welcome, ${user.name}` : ''}</span>
              </div>
              {emotionState.mode && emotionState.mode !== "normal" && emotionState.mode !== "neutral" && EMOTION_CONFIG[emotionState.mode] && (
                <span className={`emotion-badge ${EMOTION_CONFIG[emotionState.mode]?.class || "neutral"}`} style={{marginLeft:8,padding:"3px 10px",fontSize:11}}>
                  {EMOTION_CONFIG[emotionState.mode]?.icon} {EMOTION_CONFIG[emotionState.mode]?.label}
                </span>
              )}
            </div>
            <div className="chat-header-actions">
              <button className="header-btn" onClick={resetChat}>✨ New Chat</button>
              <button className="header-btn" style={{marginLeft:8, color:'#ef4444', borderColor:'#ef444433'}} onClick={handleLogout}>Log Out</button>
            </div>
          </div>

          {/* Messages */}
          <div className="messages-container">
            {messages.length === 0 ? (
              <div className="welcome-state">
                <div className="welcome-icon">🧬</div>
                <h2>Meet Your Financial Twin</h2>
                <p>I&apos;m not just a chatbot — I build a digital clone of your financial personality. Every recommendation passes through YOUR twin first.</p>
                <div className="welcome-features">
                  <span className="welcome-feature"><span className="wf-icon">🧬</span> Financial Twin AI</span>
                  <span className="welcome-feature"><span className="wf-icon">😰</span> Emotion-Aware</span>
                  <span className="welcome-feature"><span className="wf-icon">🔇</span> Silence Intelligence</span>
                  <span className="welcome-feature"><span className="wf-icon">🗣️</span> Hindi Voice</span>
                  <span className="welcome-feature"><span className="wf-icon">📈</span> Live Market Sync</span>
                </div>
                <div className="quick-actions">
                  {QUICK_ACTIONS.map((a,i) => (
                    <button key={i} className="quick-action-card" onClick={() => sendMessage(a.msg)} disabled={isLoading}>
                      <div className="qa-icon">{a.icon}</div>
                      <h4>{a.title}</h4>
                      <p>{a.desc}</p>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <>
                <AnimatePresence>
                  {messages.map((msg,i) => (
                  <motion.div 
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className={`message ${msg.role}`}>
                      <div className="message-avatar">{msg.role==="assistant" ? "🧬" : "👤"}</div>
                      <div>
                        {msg.role === "assistant" && msg.emotionMode && msg.emotionMode !== "normal" && msg.emotionMode !== "neutral" && EMOTION_CONFIG[msg.emotionMode] && (
                          <div className={`emotion-indicator ${EMOTION_CONFIG[msg.emotionMode]?.class}`}>
                            {EMOTION_CONFIG[msg.emotionMode]?.icon} {EMOTION_CONFIG[msg.emotionMode]?.label}
                          </div>
                        )}
                        <div className="message-bubble" dangerouslySetInnerHTML={{__html:fmtContent(msg.content)}} />
                        <div className="message-time">{fmt(msg.timestamp)}</div>
                      </div>
                    </div>
                    {/* UPGRADE 3: Inline Trust Cards */}
                    {msg.trustCards?.length > 0 && msg.trustCards.map((tc, tci) => (
                      <motion.div 
                        key={tci} 
                        className="inline-trust-card"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.4, delay: 0.1 }}
                      >
                        <div className="itc-header">
                          <div className="itc-logo">ET</div>
                          <div className="itc-product">{tc.product}</div>
                          <div className="itc-match">{tc.match}% match</div>
                        </div>
                        <div className="itc-reason-section">
                          <div className="itc-reason-label">Why this fits you:</div>
                          <div className="itc-reason-text">{tc.reason}</div>
                        </div>
                        <div className="itc-actions">
                          <a href={tc.url} target="_blank" rel="noopener noreferrer" className="itc-btn itc-btn-primary">Learn more on ET</a>
                          <button className="itc-btn itc-btn-secondary" onClick={() => sendMessage(`Tell me more about ${tc.product} and is it right for me?`)}>Ask my twin →</button>
                        </div>
                      </motion.div>
                    ))}
                  </motion.div>
                ))}
              </AnimatePresence>
                {isLoading && (
                  <div className="typing-indicator">
                    <div className="message-avatar">🧬</div>
                    <div className="typing-dots"><span></span><span></span><span></span></div>
                  </div>
                )}

                {/* UPGRADE 2: Journey Map */}
                {shouldShowJourney() && (
                  <motion.div 
                    className="journey-map-container"
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                  >
                    <div className="journey-map-title">
                      <div>🗺️ Your Personalized ET Journey</div>
                      <button 
                        onClick={handleSendEmail} 
                        disabled={isEmailing || emailSent}
                        className="email-handoff-btn"
                        style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", padding: "6px 12px", borderRadius: "20px", background: emailSent ? "#22c55e" : "#ffeed8", color: emailSent ? "white" : "#d97706", border: "none", cursor: "pointer", transition: "all 0.2s" }}
                      >
                        {emailSent ? <CheckCircle2 size={14} /> : <Mail size={14} />}
                        {emailSent ? "Email Sent!" : isEmailing ? "Sending..." : "Email My Summary"}
                      </button>
                    </div>
                    <div className="journey-map-stepper">
                      {JOURNEY_STEPS.map((step, i) => (
                        <div key={i} className={`journey-step ${i === 0 ? "step-active" : ""}`}>
                          <div className={`journey-step-circle ${i === 0 ? "active" : ""}`}>{i + 1}</div>
                          {i < JOURNEY_STEPS.length - 1 && <div className="journey-step-connector"></div>}
                          <div className="journey-step-content">
                            <div className="journey-step-name">{step.product}</div>
                            <div className="journey-step-reason">
                              {i === 0 ? "Start here — your foundation for financial intelligence" :
                               i === 1 ? "Plan your SIP strategy based on your risk profile" :
                               i === 2 ? "Track stocks aligned with your investment personality" :
                               "Complete your wealth management ecosystem"}
                            </div>
                            <a href={step.url} target="_blank" rel="noopener noreferrer" className="journey-step-cta">
                              Visit ET →
                            </a>
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Proactive Alert (floating) */}
          {proactiveAlert && (
            <div className={`proactive-alert proactive-${proactiveAlert.type}`}>
              <div className="proactive-alert-text">{proactiveAlert.message}</div>
              <div className="proactive-alert-actions">
                {proactiveAlert.type === "news" && proactiveAlert.action && (
                  <button className="proactive-alert-ask" onClick={() => { sendMessage(`What does this mean for me: ${proactiveAlert.action}`); setProactiveAlert(null); }}>
                    Ask my twin →
                  </button>
                )}
                <button className="proactive-alert-dismiss" onClick={() => setProactiveAlert(null)}>✕</button>
              </div>
            </div>
          )}

          {/* Input */}
          <div className="input-area">
            <div className="input-wrapper">
              <textarea ref={textareaRef} value={input} onChange={e => setInput(e.target.value)} onKeyDown={handleKey}
                        placeholder={isRecording ? "🎤 Listening..." : "Tell me about yourself, your goals..."} rows={1} disabled={isLoading} />
              <button className={`voice-btn ${isRecording ? "recording" : ""}`} onClick={toggleVoice} title="Voice input">
                {isRecording ? <MicOff size={18} /> : <Mic size={18} />}
              </button>
              <button className="send-btn" onClick={() => sendMessage(input)} disabled={!input.trim() || isLoading}>
                <Send size={18} />
              </button>
            </div>
            <div className="input-hints">
              <span>Powered by NVIDIA AI • Financial Twin Engine</span>
              <button className={`lang-badge ${voiceLang !== "en-IN" ? "active" : ""}`} onClick={cycleLang}>
                🗣️ {langLabels[voiceLang]}
              </button>
            </div>
          </div>
        </main>
      </div>

      {/* Journey Modal */}
      {showModal && onboardingPath.length > 0 && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h2>🗺️ Your Personalized ET Journey</h2>
            <p>Based on your Financial Twin, here&apos;s your custom path:</p>
            {onboardingPath.map((step,i) => (
              <div key={i} className="path-step">
                <div className="step-number">{step.step}</div>
                <div className="step-content">
                  <h4>{step.title}</h4>
                  <p>{step.description}</p>
                  {step.product && <span className="step-link">→ {step.product}</span>}
                  {step.link && <a href={step.link} target="_blank" rel="noopener noreferrer" className="step-link" style={{marginLeft:8}}>Open ↗</a>}
                </div>
              </div>
            ))}
            <button className="modal-close-btn" onClick={() => setShowModal(false)}>Got it! Let&apos;s continue</button>
          </div>
        </div>
      )}
    </>
  );
}

function timeAgo(dateStr) {
  const now = new Date();
  const date = new Date(dateStr);
  const seconds = Math.floor((now - date) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

function fmtContent(content) {
  if (!content) return "";
  let c = content
    .replace(/<PROFILE_UPDATE>[\s\S]*?<\/PROFILE_UPDATE>/gi, "")
    .replace(/PROFILE_UPDATE[\s\S]*$/gi, "")
    .replace(/\{[\s\S]*?"financialTwin"[\s\S]*$/g, "")
    .replace(/\{[\s\S]*?"investorType"[\s\S]*$/g, "")
    .replace(/\{"type"\s*:\s*"twin_update"[^}]*"traits"\s*:\s*\{[^}]*\}\s*\}/g, "")
    .replace(/\{"type"\s*:\s*"trust_card"[^}]*\}/g, "")
    .replace(/journey_map_ready/g, "")
    .trim();
  return c
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/\[([^\]]+)\]\(([^)]+)\)|(https?:\/\/[^\s<]+)/g, function(match, mdText, mdUrl, bareUrl) {
      if (bareUrl) {
        return '<a href="' + bareUrl + '" target="_blank" rel="noopener noreferrer" style="color:var(--text-primary);text-decoration:underline;font-weight:600;">' + bareUrl + '</a>';
      } else {
        return '<a href="' + mdUrl + '" target="_blank" rel="noopener noreferrer" style="color:var(--text-primary);text-decoration:underline;font-weight:600;">' + mdText + '</a>';
      }
    })
    .replace(/\n/g, "<br/>")
    .replace(/^- (.*?)(<br\/>|$)/gm, "• $1<br/>")
    .replace(/^\* (.*?)(<br\/>|$)/gm, "• $1<br/>")
    .replace(/^(\d+)\. (.*?)(<br\/>|$)/gm, "$1. $2<br/>");
}
