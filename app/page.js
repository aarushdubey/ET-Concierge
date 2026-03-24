"use client";

import { useState, useRef, useEffect, useCallback } from "react";

const QUICK_ACTIONS = [
  {
    icon: "📈",
    title: "I want to start investing",
    description: "Get personalized guidance on where to begin your investment journey",
    message: "I'm new to investing and want to start my journey. Can you help me figure out the best way to begin?",
  },
  {
    icon: "📰",
    title: "Stay ahead with business news",
    description: "Find the best way to consume quality business intelligence",
    message: "I want to stay updated with high-quality business news and analysis. What does ET offer for this?",
  },
  {
    icon: "🎓",
    title: "Upskill my career",
    description: "Discover courses & events to accelerate your professional growth",
    message: "I'm looking to upskill and grow in my career. What learning opportunities does ET have?",
  },
  {
    icon: "💰",
    title: "Manage my wealth better",
    description: "Get tools & insights for personal finance and tax planning",
    message: "I want to manage my personal finances better — tax planning, mutual funds, insurance. What can ET help me with?",
  },
];

function formatTime(date) {
  return date.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

export default function Home() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [userProfile, setUserProfile] = useState({
    investorType: null,
    profession: null,
    goals: [],
    riskProfile: null,
    interests: [],
    experience: null,
    recommendedProducts: [],
    onboardingPath: [],
  });
  const [showOnboarding, setShowOnboarding] = useState(false);

  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading, scrollToBottom]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = textareaRef.current.scrollHeight + "px";
    }
  }, [input]);

  const sendMessage = async (content) => {
    if (!content.trim() || isLoading) return;

    const userMessage = {
      role: "user",
      content: content.trim(),
      timestamp: new Date(),
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput("");
    setIsLoading(true);

    try {
      const apiMessages = newMessages.map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: apiMessages }),
      });

      if (!response.ok) throw new Error("API request failed");

      const data = await response.json();

      const assistantMessage = {
        role: "assistant",
        content: data.message,
        timestamp: new Date(),
      };

      setMessages([...newMessages, assistantMessage]);

      // Update profile
      if (data.profileUpdate) {
        setUserProfile((prev) => {
          const updated = { ...prev };
          Object.keys(data.profileUpdate).forEach((key) => {
            const val = data.profileUpdate[key];
            if (val !== null && val !== undefined) {
              if (Array.isArray(val) && val.length > 0) {
                updated[key] = val;
              } else if (!Array.isArray(val)) {
                updated[key] = val;
              }
            }
          });
          return updated;
        });
      }
    } catch (error) {
      console.error("Error sending message:", error);
      setMessages([
        ...newMessages,
        {
          role: "assistant",
          content:
            "I apologize, but I'm having trouble connecting right now. Please try again in a moment. 🙏",
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  const handleNewChat = () => {
    setMessages([]);
    setUserProfile({
      investorType: null,
      profession: null,
      goals: [],
      riskProfile: null,
      interests: [],
      experience: null,
      recommendedProducts: [],
      onboardingPath: [],
    });
    setShowOnboarding(false);
  };

  const hasProfile =
    userProfile.investorType ||
    userProfile.profession ||
    userProfile.goals.length > 0 ||
    userProfile.interests.length > 0;

  return (
    <div className="app-container">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="sidebar-logo">ET</div>
          <div className="sidebar-brand">
            <h1>ET Concierge</h1>
            <p>Your AI Guide to ET</p>
          </div>
        </div>

        {/* Profile Section */}
        <div className="profile-section">
          <div className="profile-title">
            <span className="dot"></span>
            User Profile — Live
          </div>

          {!hasProfile ? (
            <div className="empty-profile">
              <div className="empty-profile-icon">👤</div>
              <h4>No profile yet</h4>
              <p>Start chatting and I&apos;ll build your profile as we talk — no forms needed!</p>
            </div>
          ) : (
            <>
              {userProfile.profession && (
                <div className="profile-card">
                  <div className="profile-card-header">
                    <div className="profile-card-icon experience">💼</div>
                    <div className="profile-card-title">Profession</div>
                  </div>
                  <div className="profile-card-content">
                    {userProfile.profession}
                  </div>
                </div>
              )}

              {userProfile.investorType && (
                <div className="profile-card">
                  <div className="profile-card-header">
                    <div className="profile-card-icon investor">📊</div>
                    <div className="profile-card-title">Investor Profile</div>
                  </div>
                  <div className="profile-card-content">
                    {userProfile.investorType}
                    {userProfile.riskProfile && (
                      <div style={{ marginTop: 6, fontSize: 12, color: "var(--text-tertiary)" }}>
                        Risk: <strong style={{ color: "var(--et-primary-light)" }}>{userProfile.riskProfile}</strong>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {userProfile.experience && (
                <div className="profile-card">
                  <div className="profile-card-header">
                    <div className="profile-card-icon experience">🎯</div>
                    <div className="profile-card-title">Experience Level</div>
                  </div>
                  <div className="profile-card-content">
                    {userProfile.experience}
                  </div>
                </div>
              )}

              {userProfile.goals.length > 0 && (
                <div className="profile-card">
                  <div className="profile-card-header">
                    <div className="profile-card-icon goals">🎯</div>
                    <div className="profile-card-title">Financial Goals</div>
                  </div>
                  <div className="profile-tags">
                    {userProfile.goals.map((goal, i) => (
                      <span key={i} className="profile-tag">{goal}</span>
                    ))}
                  </div>
                </div>
              )}

              {userProfile.interests.length > 0 && (
                <div className="profile-card">
                  <div className="profile-card-header">
                    <div className="profile-card-icon interests">💡</div>
                    <div className="profile-card-title">Interests</div>
                  </div>
                  <div className="profile-tags">
                    {userProfile.interests.map((interest, i) => (
                      <span key={i} className="profile-tag">{interest}</span>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Recommended Products */}
        {userProfile.recommendedProducts.length > 0 && (
          <div className="recommended-section">
            <div className="recommended-title">✨ Recommended for You</div>
            {userProfile.recommendedProducts.map((product, i) => (
              <div key={i} className="product-card">
                <div
                  className="product-icon"
                  style={{ background: `rgba(255,87,34,${0.1 + i * 0.05})` }}
                >
                  {product.name.includes("Prime") ? "⭐" :
                   product.name.includes("Market") ? "📈" :
                   product.name.includes("Wealth") ? "💰" :
                   product.name.includes("Master") ? "🎓" :
                   product.name.includes("Edge") ? "🔷" : "📌"}
                </div>
                <div className="product-info">
                  <h4>{product.name}</h4>
                  <p>{product.reason}</p>
                </div>
                <span className="product-match">{product.match}%</span>
              </div>
            ))}

            {userProfile.onboardingPath.length > 0 && (
              <button
                className="modal-close-btn"
                style={{ marginTop: 16, fontSize: 13 }}
                onClick={() => setShowOnboarding(true)}
              >
                🗺️ View Your Personalized Journey
              </button>
            )}
          </div>
        )}
      </aside>

      {/* Main Chat */}
      <main className="main-content">
        {/* Header */}
        <div className="chat-header">
          <div className="chat-header-left">
            <div className="chat-status">
              <span className="status-indicator"></span>
              <span>ET Concierge is online</span>
            </div>
          </div>
          <div className="chat-header-actions">
            <button className="header-btn" onClick={handleNewChat}>
              ✨ New Chat
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="messages-container">
          {messages.length === 0 ? (
            <div className="welcome-state">
              <div className="welcome-icon">🤝</div>
              <h2>Welcome to ET Concierge</h2>
              <p>
                I&apos;m your personal AI guide to the Economic Times ecosystem.
                Tell me a bit about yourself, and I&apos;ll create a personalized
                journey across ET&apos;s products, events, and services — just for you.
              </p>
              <div className="quick-actions">
                {QUICK_ACTIONS.map((action, i) => (
                  <button
                    key={i}
                    className="quick-action-card"
                    onClick={() => sendMessage(action.message)}
                    disabled={isLoading}
                  >
                    <div className="qa-icon">{action.icon}</div>
                    <h4>{action.title}</h4>
                    <p>{action.description}</p>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <>
              {messages.map((msg, i) => (
                <div key={i} className={`message ${msg.role}`}>
                  <div className="message-avatar">
                    {msg.role === "assistant" ? "🤝" : "👤"}
                  </div>
                  <div>
                    <div
                      className="message-bubble"
                      dangerouslySetInnerHTML={{
                        __html: formatMessageContent(msg.content),
                      }}
                    />
                    <div className="message-time">
                      {formatTime(msg.timestamp)}
                    </div>
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="typing-indicator">
                  <div className="message-avatar" style={{
                    background: "var(--gradient-primary)",
                    width: 36,
                    height: 36,
                    borderRadius: "var(--radius-md)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 16,
                    boxShadow: "var(--shadow-glow)",
                  }}>
                    🤝
                  </div>
                  <div className="typing-dots">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              )}
            </>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="input-area">
          <div className="input-wrapper">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Tell me about yourself, your goals, or what you're looking for..."
              rows={1}
              disabled={isLoading}
            />
            <button
              className="send-btn"
              onClick={() => sendMessage(input)}
              disabled={!input.trim() || isLoading}
            >
              ➤
            </button>
          </div>
          <div className="input-hint">
            Powered by NVIDIA AI • Your data stays private
          </div>
        </div>
      </main>

      {/* Onboarding Path Modal */}
      {showOnboarding && userProfile.onboardingPath.length > 0 && (
        <div className="onboarding-overlay" onClick={() => setShowOnboarding(false)}>
          <div className="onboarding-modal" onClick={(e) => e.stopPropagation()}>
            <h2>🗺️ Your Personalized ET Journey</h2>
            <p>
              Based on our conversation, here&apos;s your custom onboarding path
              through the ET ecosystem:
            </p>
            {userProfile.onboardingPath.map((step, i) => (
              <div key={i} className="path-step">
                <div className="step-number">{step.step}</div>
                <div className="step-content">
                  <h4>{step.title}</h4>
                  <p>{step.description}</p>
                  {step.product && (
                    <span className="step-link">
                      → {step.product}
                    </span>
                  )}
                </div>
              </div>
            ))}
            <button
              className="modal-close-btn"
              onClick={() => setShowOnboarding(false)}
            >
              Got it! Let&apos;s continue chatting
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// Format message content — basic markdown-like support
function formatMessageContent(content) {
  if (!content) return "";

  let html = content
    // Escape HTML
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    // Bold
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    // Line breaks
    .replace(/\n/g, "<br/>")
    // Bullet points
    .replace(/^- (.*?)(<br\/>|$)/gm, "• $1<br/>")
    // Numbered lists
    .replace(/^(\d+)\. (.*?)(<br\/>|$)/gm, "$1. $2<br/>");

  return html;
}
