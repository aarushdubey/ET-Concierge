# ET Concierge — Architecture Document

## System Overview

ET Concierge is an AI-powered conversational agent that serves as a personal guide to the Economic Times ecosystem. The system uses a multi-agent architecture where a single LLM (NVIDIA Llama 3.1 70B) performs multiple specialized roles within a structured prompt framework.

## Architecture Diagram

```
                    ┌─────────────────────┐
                    │     User (Browser)   │
                    └─────────┬───────────┘
                              │
                    ┌─────────▼───────────┐
                    │   Next.js Frontend   │
                    │                      │
                    │  ┌────────────────┐  │
                    │  │  Chat UI       │  │──── User messages, typing
                    │  │  Component     │  │     indicators, message
                    │  └────────────────┘  │     formatting
                    │                      │
                    │  ┌────────────────┐  │
                    │  │  Profile       │  │──── Real-time profile cards,
                    │  │  Sidebar       │  │     product recommendations,
                    │  └────────────────┘  │     match scores
                    │                      │
                    │  ┌────────────────┐  │
                    │  │  Onboarding    │  │──── Step-by-step journey
                    │  │  Modal         │  │     modal with ET products
                    │  └────────────────┘  │
                    └─────────┬───────────┘
                              │ POST /api/chat
                              │ { messages: [...] }
                    ┌─────────▼───────────┐
                    │  Next.js API Route   │
                    │                      │
                    │  ┌────────────────┐  │
                    │  │ System Prompt  │  │──── ET ecosystem knowledge,
                    │  │ Engineering    │  │     profiling instructions,
                    │  └────────────────┘  │     output format rules
                    │                      │
                    │  ┌────────────────┐  │
                    │  │ Response       │  │──── Extracts <PROFILE_UPDATE>
                    │  │ Parser         │  │     JSON from LLM response,
                    │  └────────────────┘  │     separates display text
                    └─────────┬───────────┘
                              │ HTTPS POST
                              │ (NVIDIA API)
                    ┌─────────▼───────────┐
                    │  NVIDIA AI Platform  │
                    │                      │
                    │  Llama 3.1 70B       │
                    │  Instruct            │
                    │                      │
                    │  Multi-Role Agent:   │
                    │  • Profiling Agent   │
                    │  • Product Matcher   │
                    │  • Onboarding Agent  │
                    │  • Cross-sell Agent  │
                    └─────────────────────┘
```

## Agent Roles & Communication

### 1. Profiling Agent
- **Input**: User's chat messages
- **Output**: Structured JSON with extracted attributes (profession, goals, risk profile, interests, experience)
- **Logic**: The LLM analyzes conversational cues to classify users into profiles without asking explicit form-like questions

### 2. Product Matching Agent
- **Input**: Accumulated user profile
- **Output**: Ranked list of ET products with match scores (0-100%)
- **Logic**: Cross-references profile attributes against ET product features — e.g., a beginner investor with wealth-building goals gets ET Wealth (85%) and ET Markets (90%)

### 3. Onboarding Agent
- **Input**: User profile + matched products
- **Output**: Ordered step-by-step journey (typically 3-5 steps)
- **Logic**: Generates a personalized onboarding path once sufficient profile data is gathered (usually 2-3 exchanges)

### 4. Cross-sell Agent
- **Input**: Real-time conversation context
- **Output**: Natural product mentions woven into conversation
- **Logic**: When a user mentions specific needs (e.g., "I want to learn about leadership"), the agent naturally connects them to relevant ET products (ET Masterclasses)

## Data Flow

```
User Message → API Route → System Prompt + Context → NVIDIA LLM
                                                        │
                                                        ▼
                                              Response + <PROFILE_UPDATE>
                                                        │
                                                        ▼
                                              API Route Parser
                                              ├── Display text → Chat UI
                                              └── Profile JSON → Sidebar
```

## Error Handling

| Error Scenario | Handling |
|---------------|----------|
| NVIDIA API down | Graceful error message in chat, retryable |
| Profile JSON malformed | Silently ignored, previous profile preserved |
| Rate limiting | User sees loading state, automatic retry |
| Network failure | Friendly error message with retry suggestion |

## Technology Choices

| Decision | Choice | Rationale |
|----------|--------|-----------|
| LLM | Llama 3.1 70B (via NVIDIA) | Best balance of quality, speed, and cost for conversational AI |
| Framework | Next.js App Router | API routes co-located with frontend, fast development |
| State Management | React useState | Sufficient for single-session concierge; no need for external state |
| Styling | Vanilla CSS | Full design control, no framework overhead |
| Deployment | Vercel | Zero-config Next.js deployment, edge functions for API |
