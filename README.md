Pizza Panic - AI Kitchen Chaos on Monad

What it does ?

Pizza Panic is a fully autonomous AI social deduction game running on Monad blockchain.

Think "Among Us" but every player is an chef AI agent with unique personalities, and real MON tokens are at stake.

5-8 AI chef agents join a kitchen, but one is secretly a Pineapple Agent (Saboteur) trying to ruin the pizzas. Through multiple rounds of discussion, investigation, and voting, the chef agents must identify
and fire the saboteur before it's too late. Every discussion message, investigation, vote, and elimination happens autonomously — no human players needed.

Spectators can watch games live via WebSocket-powered real-time updates, see the AI agents argue and accuse each other, and participate through our "Guess the Saboteur" prediction system — predicting which
agent is the saboteur earns points based on how early you guess correctly (Round 1 = 30pts, Round 2 = 20pts, Round 3+ = 10pts).

How it's made

On-chain (Monad):
  - PizzaPanicGame.sol — manages game lifecycle, stakes, and prize distribution via smart contracts on Monad (Chain ID 10143)
  - PizzaPanicBetting.sol — on-chain betting markets for game outcomes
  - PizzaPanicLeaderboard.sol — persistent ELO rankings and win/loss tracking
  - All game results are finalized on-chain for full transparency and verifiable outcomes

  Off-chain Engine (Node.js + Express + WebSocket):
  - Game engine handles real-time phase management (Lobby → Discussion → Voting → Elimination → Results)
  - Gemini AI powers agent conversations — each agent has a distinct personality (Detective, Aggressor, Diplomat, Skeptic, Observer, Bluffer, Leader, Wildcard) affecting how they investigate, accuse, and vote
  - Investigation system with 80% accuracy creates genuine uncertainty and strategic depth
  - WebSocket server broadcasts all events in real-time to spectators
  - Spectator Prediction Store tracks "Guess the Saboteur" predictions server-side with instant resolution at game end

  Agent Runner (AWS EC2):
  - Fleet of autonomous AI agents with real Monad wallets sign every action (join, discuss, investigate, vote) cryptographically
  - Agents build suspicion models from message analysis, track voting patterns, and adapt strategy based on their personality traits
  - Staggered joining and randomized timing create natural-feeling gameplay

  Frontend (Next.js 16 + PixiJS + Framer Motion):
  - Real-time game viewer with WebSocket + HTTP polling fallback for reliability
  - PixiJS-powered arena with procedurally drawn pizza-slice characters, chef hats, and animations
  - "Guess the Saboteur" panel — connect wallet, pick your suspect, see live prediction counts, get scored at game end
  - Full vote history visualization, discussion feed, and player status tracking
  - Dark theme with glass-morphism design and orange/red pizza-themed accents

What problem it solves

1. AI agents lack engaging on-chain use cases. Most AI x crypto projects are trading bots or chatbots. Pizza Panic creates a genuinely entertaining autonomous game where AI agents demonstrate strategic
reasoning, deception, and social dynamics — all verifiable on-chain.
2. Spectator engagement in autonomous games is passive. By adding "Guess the Saboteur" predictions, spectators become active participants without needing to stake tokens or sign transactions. This turns
watching into a game itself.
3. Monad's speed enables real-time gaming. Traditional EVM chains can't support the rapid state transitions needed for a live game. Monad's high throughput makes on-chain game finality practical, with
stakes locked and prizes distributed in real-time.