"use client";
import { useState, useRef, useEffect, useCallback } from "react";

/* ============ CONSTANTS ============ */
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

const fmt = (d) => d.toLocaleTimeString("en-IN",{hour:"2-digit",minute:"2-digit",hour12:true});

/* ============ MAIN COMPONENT ============ */
export default function Home() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sidebarTab, setSidebarTab] = useState("twin"); // twin | products
  const [showModal, setShowModal] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [voiceLang, setVoiceLang] = useState("en-IN");

  // Financial Twin state
  const [financialTwin, setFinancialTwin] = useState(null);
  const [emotionState, setEmotionState] = useState({ detected:"neutral", mode:"normal" });
  const [goals, setGoals] = useState([]);
  const [interests, setInterests] = useState([]);
  const [recommendedProducts, setRecommendedProducts] = useState([]);
  const [onboardingPath, setOnboardingPath] = useState([]);
  const [cohortInsight, setCohortInsight] = useState(null);
  const [proactiveNudge, setProactiveNudge] = useState(null);

  // Market data
  const [marketData, setMarketData] = useState(null);
  const [marketAlert, setMarketAlert] = useState(null);

  // Silence intelligence
  const [silenceSignals, setSilenceSignals] = useState([]);

  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);
  const recognitionRef = useRef(null);

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

  // Fetch market data periodically
  useEffect(() => {
    const fetchMarket = async () => {
      try {
        const res = await fetch("/api/market");
        const json = await res.json();
        setMarketData(json.data);
        if (json.alert && messages.length > 0) setMarketAlert(json.alert);
      } catch(e) { /* ignore */ }
    };
    fetchMarket();
    const interval = setInterval(fetchMarket, 15000);
    return () => clearInterval(interval);
  }, [messages.length]);

  // Voice recognition setup
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
    if (isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
    } else {
      recognitionRef.current.lang = voiceLang;
      recognitionRef.current.start();
      setIsRecording(true);
    }
  };

  const cycleLang = () => {
    const langs = ["en-IN","hi-IN","ta-IN","te-IN","bn-IN"];
    const labels = {"en-IN":"EN","hi-IN":"हि","ta-IN":"த","te-IN":"తె","bn-IN":"বা"};
    const idx = langs.indexOf(voiceLang);
    const next = langs[(idx+1) % langs.length];
    setVoiceLang(next);
    return labels[next];
  };

  const langLabels = {"en-IN":"EN 🇮🇳","hi-IN":"हिंदी","ta-IN":"தமிழ்","te-IN":"తెలుగు","bn-IN":"বাংলা"};

  /* ============ SEND MESSAGE ============ */
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
        body: JSON.stringify({ messages:apiMsgs, silenceData:silenceSignals }),
      });
      if (!res.ok) throw new Error("API failed");
      const data = await res.json();
      const assistantMsg = { role:"assistant", content:data.message, timestamp:new Date(),
        emotionMode: data.profileUpdate?.emotionState?.mode || "normal" };
      setMessages([...newMsgs, assistantMsg]);

      // Update all profile states
      if (data.profileUpdate) {
        const pu = data.profileUpdate;
        if (pu.financialTwin) {
          setFinancialTwin(prev => {
            const merged = { ...(prev || {}), ...pu.financialTwin };
            // Remove null values from merge
            Object.keys(merged).forEach(k => { if (merged[k] === null && prev?.[k]) merged[k] = prev[k]; });
            return merged;
          });
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
    } catch(err) {
      console.error(err);
      setMessages([...newMsgs, { role:"assistant", content:"I'm having trouble connecting. Please try again. 🙏", timestamp:new Date() }]);
    } finally { setIsLoading(false); }
  };

  const handleKey = (e) => { if (e.key==="Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(input); } };

  const resetChat = () => {
    setMessages([]); setFinancialTwin(null); setEmotionState({detected:"neutral",mode:"normal"});
    setGoals([]); setInterests([]); setRecommendedProducts([]); setOnboardingPath([]);
    setCohortInsight(null); setProactiveNudge(null); setSilenceSignals([]);
    setMarketAlert(null); setShowModal(false);
  };

  const hasTwin = financialTwin && Object.values(financialTwin).some(v => v !== null && v !== undefined && (!Array.isArray(v) || v.length > 0));

  /* ============ RENDER ============ */
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

      <div className="app-container">
        {/* ============ SIDEBAR ============ */}
        <aside className="sidebar">
          <div className="sidebar-header">
            <div className="sidebar-logo">ET</div>
            <div className="sidebar-brand">
              <h1>ET Concierge</h1>
              <p>AI Financial Companion</p>
            </div>
          </div>

          <div className="sidebar-tabs">
            <button className={`sidebar-tab ${sidebarTab==="twin"?"active":""}`} onClick={() => setSidebarTab("twin")}>🧬 Financial Twin</button>
            <button className={`sidebar-tab ${sidebarTab==="products"?"active":""}`} onClick={() => setSidebarTab("products")}>📦 Products</button>
          </div>

          <div className="sidebar-content">
            {sidebarTab === "twin" ? (
              <>
                {/* Emotion State */}
                {emotionState.mode && emotionState.mode !== "normal" && (
                  <div className={`emotion-badge ${EMOTION_CONFIG[emotionState.mode]?.class || "neutral"}`}>
                    {EMOTION_CONFIG[emotionState.mode]?.icon || "🔵"} {EMOTION_CONFIG[emotionState.mode]?.label || emotionState.mode}
                    {emotionState.trigger && <span style={{opacity:0.7}}> — {emotionState.trigger}</span>}
                  </div>
                )}

                <div className="twin-section-title"><span className="dot"></span> Financial Twin — Live</div>

                {!hasTwin ? (
                  <div className="empty-twin">
                    <div className="icon">🧬</div>
                    <h4>Building your Financial Twin...</h4>
                    <p>Start chatting and I&apos;ll create a digital clone of your financial personality — no forms, just conversation.</p>
                  </div>
                ) : (
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
                    {(financialTwin.age || financialTwin.income) && (
                      <div className="twin-card">
                        <div className="twin-card-header">
                          <div className="twin-card-icon" style={{background:"rgba(76,175,80,0.12)"}}>📊</div>
                          <div className="twin-card-title">Demographics</div>
                        </div>
                        <div className="twin-card-value">
                          {financialTwin.age && `Age: ${financialTwin.age}`}
                          {financialTwin.age && financialTwin.income && " • "}
                          {financialTwin.income && `Income: ${financialTwin.income}`}
                        </div>
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
                    {financialTwin.spendingPersonality && (
                      <div className="twin-card">
                        <div className="twin-card-header">
                          <div className="twin-card-icon" style={{background:"rgba(233,30,99,0.12)"}}>💳</div>
                          <div className="twin-card-title">Spending Style</div>
                        </div>
                        <div className="twin-card-value">{financialTwin.spendingPersonality}</div>
                      </div>
                    )}
                    {financialTwin.knowledgeLevel && (
                      <div className="twin-card">
                        <div className="twin-card-header">
                          <div className="twin-card-icon" style={{background:"rgba(156,39,176,0.12)"}}>🧠</div>
                          <div className="twin-card-title">Knowledge Level</div>
                        </div>
                        <div className="twin-card-value">{financialTwin.knowledgeLevel}</div>
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
                    {financialTwin.lifeStage && (
                      <div className="twin-card">
                        <div className="twin-card-header">
                          <div className="twin-card-icon" style={{background:"rgba(255,87,34,0.12)"}}>🏠</div>
                          <div className="twin-card-title">Life Stage</div>
                        </div>
                        <div className="twin-card-value">{financialTwin.lifeStage}</div>
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
                    {financialTwin.emotionalTriggers?.length > 0 && (
                      <div className="twin-card">
                        <div className="twin-card-header">
                          <div className="twin-card-icon" style={{background:"rgba(255,193,7,0.12)"}}>😰</div>
                          <div className="twin-card-title">Emotional Triggers</div>
                        </div>
                        <div className="profile-tags">
                          {financialTwin.emotionalTriggers.map((t,i) => <span key={i} className="profile-tag">{t}</span>)}
                        </div>
                      </div>
                    )}

                    {goals.length > 0 && (
                      <div className="twin-card">
                        <div className="twin-card-header">
                          <div className="twin-card-icon" style={{background:"rgba(33,150,243,0.12)"}}>🎯</div>
                          <div className="twin-card-title">Financial Goals</div>
                        </div>
                        <div className="profile-tags">
                          {goals.map((g,i) => <span key={i} className="profile-tag">{g}</span>)}
                        </div>
                      </div>
                    )}
                    {interests.length > 0 && (
                      <div className="twin-card">
                        <div className="twin-card-header">
                          <div className="twin-card-icon" style={{background:"rgba(121,85,72,0.12)"}}>💡</div>
                          <div className="twin-card-title">Interests</div>
                        </div>
                        <div className="profile-tags">
                          {interests.map((int,i) => <span key={i} className="profile-tag">{int}</span>)}
                        </div>
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

                {/* Proactive Nudge */}
                {proactiveNudge && (
                  <div className="nudge-card">
                    <h5>🔔 Smart Nudge</h5>
                    <p>{proactiveNudge}</p>
                  </div>
                )}
              </>
            ) : (
              /* Products Tab */
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
                        {p.trustReason && (
                          <div className="trust-evidence">🔍 {p.trustReason}</div>
                        )}
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
          </div>
        </aside>

        {/* ============ MAIN ============ */}
        <main className="main-content">
          <div className="chat-header">
            <div className="chat-header-left">
              <div className="chat-status">
                <span className="status-indicator"></span>
                <span>ET Concierge is online</span>
              </div>
              {emotionState.mode && emotionState.mode !== "normal" && emotionState.mode !== "neutral" && (
                <span className={`emotion-badge ${EMOTION_CONFIG[emotionState.mode]?.class || "neutral"}`} style={{marginLeft:8,padding:"3px 10px",fontSize:11}}>
                  {EMOTION_CONFIG[emotionState.mode]?.icon} {EMOTION_CONFIG[emotionState.mode]?.label}
                </span>
              )}
            </div>
            <div className="chat-header-actions">
              <button className="header-btn" onClick={resetChat}>✨ New Chat</button>
            </div>
          </div>

          {/* Market Alert */}
          {marketAlert && (
            <div className={`market-alert ${marketAlert.type}`} onClick={() => sendMessage(`The market is ${marketAlert.type === "dip" ? "dropping" : "rallying"} today. How does this affect my strategy?`)}>
              <span className="alert-icon">{marketAlert.type === "dip" ? "📉" : "📈"}</span>
              <span className="alert-text">{marketAlert.message}</span>
              <button className="alert-dismiss" onClick={(e) => { e.stopPropagation(); setMarketAlert(null); }}>✕</button>
            </div>
          )}

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
                {messages.map((msg,i) => (
                  <div key={i} className={`message ${msg.role}`}>
                    <div className="message-avatar">{msg.role==="assistant" ? "🧬" : "👤"}</div>
                    <div>
                      {msg.role === "assistant" && msg.emotionMode && msg.emotionMode !== "normal" && msg.emotionMode !== "neutral" && EMOTION_CONFIG[msg.emotionMode] && (
                        <div className={`emotion-indicator ${EMOTION_CONFIG[msg.emotionMode]?.class}`}
                             style={{background: `${EMOTION_CONFIG[msg.emotionMode]?.class === "calm" ? "rgba(76,175,80,0.12)" : EMOTION_CONFIG[msg.emotionMode]?.class === "fomo" ? "rgba(255,152,0,0.12)" : EMOTION_CONFIG[msg.emotionMode]?.class === "panic" ? "rgba(244,67,54,0.12)" : "rgba(156,39,176,0.12)"}`,
                                    color: `${EMOTION_CONFIG[msg.emotionMode]?.class === "calm" ? "#81c784" : EMOTION_CONFIG[msg.emotionMode]?.class === "fomo" ? "#ffb74d" : EMOTION_CONFIG[msg.emotionMode]?.class === "panic" ? "#e57373" : "#ce93d8"}`}}>
                          {EMOTION_CONFIG[msg.emotionMode]?.icon} {EMOTION_CONFIG[msg.emotionMode]?.label}
                        </div>
                      )}
                      <div className="message-bubble" dangerouslySetInnerHTML={{__html:fmtContent(msg.content)}} />
                      <div className="message-time">{fmt(msg.timestamp)}</div>
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="typing-indicator">
                    <div className="message-avatar" style={{background:"var(--gradient-primary)",width:34,height:34,borderRadius:"var(--radius-md)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:15,boxShadow:"var(--shadow-glow)"}}>🧬</div>
                    <div className="typing-dots"><span></span><span></span><span></span></div>
                  </div>
                )}
              </>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="input-area">
            <div className="input-wrapper">
              <textarea ref={textareaRef} value={input} onChange={e => setInput(e.target.value)} onKeyDown={handleKey}
                        placeholder={isRecording ? "🎤 Listening..." : "Tell me about yourself, your goals..."} rows={1} disabled={isLoading} />
              <button className={`voice-btn ${isRecording ? "recording" : ""}`} onClick={toggleVoice} title="Voice input">
                {isRecording ? "⏹" : "🎤"}
              </button>
              <button className="send-btn" onClick={() => sendMessage(input)} disabled={!input.trim() || isLoading}>➤</button>
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

/* ============ FORMAT ============ */
function fmtContent(content) {
  if (!content) return "";
  let c = content
    .replace(/<PROFILE_UPDATE>[\s\S]*?<\/PROFILE_UPDATE>/gi, "")
    .replace(/PROFILE_UPDATE[\s\S]*$/gi, "")
    .replace(/\{[\s\S]*?"financialTwin"[\s\S]*$/g, "")
    .replace(/\{[\s\S]*?"investorType"[\s\S]*$/g, "")
    .trim();
  return c
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/\n/g, "<br/>")
    .replace(/^- (.*?)(<br\/>|$)/gm, "• $1<br/>")
    .replace(/^\* (.*?)(<br\/>|$)/gm, "• $1<br/>")
    .replace(/^(\d+)\. (.*?)(<br\/>|$)/gm, "$1. $2<br/>");
}
