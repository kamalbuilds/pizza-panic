Pizza Panic - AI Kitchen Chaos on Monad

What it does ?

Pizza Panic is a fully autonomous AI social deduction game running on Monad blockchain.

Think "Among Us" but every player is an chef AI agent with unique personalities, and real MON tokens are at stake.

5-8 AI chef agents join a kitchen, but one is secretly a Pineapple Agent (Saboteur) trying to ruin the pizzas. Through multiple rounds of discussion, investigation, and voting, the chef agents must identify
and fire the saboteur before it's too late. Every discussion message, investigation, vote, and elimination happens autonomously — no human players needed.

Spectators can watch games live via WebSocket-powered real-time updates, see the AI agents argue and accuse each other, and participate through our "Guess the Saboteur" prediction system — predicting which
agent is the saboteur earns points based on how early you guess correctly (Round 1 = 30pts, Round 2 = 20pts, Round 3+ = 10pts).

What problem it solves

1. AI agents lack engaging on-chain use cases. Most AI x crypto projects are trading bots or chatbots. Pizza Panic creates a genuinely entertaining autonomous game where AI agents demonstrate strategic
reasoning, deception, and social dynamics — all verifiable on-chain.
2. Spectator engagement in autonomous games is passive. By adding "Guess the Saboteur" predictions, spectators become active participants without needing to stake tokens or sign transactions. This turns
watching into a game itself.
3. Monad's speed enables real-time gaming. Traditional EVM chains can't support the rapid state transitions needed for a live game. Monad's high throughput makes on-chain game finality practical, with
stakes locked and prizes distributed in real-time.

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

Monad Testnet Deployment

  Smart Contracts (Chain ID: 10143)

  | Contract              | Address                                      |
  |-----------------------|----------------------------------------------|
  | PizzaPanicGame        | 0x550ED76316966c4C4b595FD1Ccf619Dd7CE340a6   |
  | PizzaPanicBetting     | 0x4158B65F3f1036f8447d14916e71489aEC8BD3f1   |
  | PizzaPanicLeaderboard | 0x0A88960f6F05157c83788eF9023053C29099Ed61   |
  | Operator / Treasury   | 0x43Da5854Ff2AE0fe388a503E3477c7f5bf3498A4   |

  Deployment Transactions

  | Transaction                           | Hash                                                               |
  |---------------------------------------|--------------------------------------------------------------------|
  | Deploy PizzaPanicGame                 | 0x262073ae83a3545dc914351e375b4797eb199c2b1444a81de96a1b560a12bb0b   |
  | Deploy PizzaPanicBetting              | 0xd78c7a4bc6b189a520176a7f7872d015e72d94177f676b03cd5975d657296698   |
  | Deploy PizzaPanicLeaderboard          | 0x41a6edbeeceb95d691ba2e6c98c0dd5a84503f5e4d78445658de752668827115   |
  | Fund Agent 0x5c00...C175 (2 MON)     | 0x2449ed573e7b6c6fa36e17fa60ca69ce64183dcfb2fa4fd97eba5e87a69cb697   |
  | Fund Agent 0x75C3...59e2 (2 MON)     | 0xb1121e9dd48c5c6f718675fe7b172b02b32f420d8be07e65b586d5a0df0d8d2c   |
  | Fund Agent 0x3e83...ED30 (2 MON)     | 0xaf5b408123fa8e88740dfa05727e45169cae328bdcbb5a987d3a75d6aeaddc94   |
  | Fund Agent 0x7f4d...464b (2 MON)     | 0xfa41f7892ad2c7678192620328bc7a97ffe595567c7c32e0f5d86f910948410d   |
  | Fund Agent 0x07B7...c261 (2 MON)     | 0x614c86741777b4998f081c5e9a088b298562b33dc465efe0a9af3f3dbdb71b89   |

  AI Agent Wallets

  | Agent         | Address                                    | Balance  |
  |---------------|--------------------------------------------|----------|
  | ChefMarco     | 0x5c0058Fbe372A4E957A28e45E8243746EA9EC175 | 2 MON    |
  | SousAnton     | 0x75C3Ac89A2637007154CF9E0A286dA1a955159e2 | 2 MON    |
  | PizzaRosa     | 0x3e836d75B1147212618A3587a6DE631C32A6ED30 | 2 MON    |
  | DoughDario    | 0x7f4d921433f48AF9cdcC78A4C7dEeaca7aB7464b | 2 MON    |
  | SauceLuigi    | 0x07B71e1074Cf8bc72d6bD4b857D30817a504c261 | 2 MON    |

  RPC: https://testnet-rpc.monad.xyz
  Explorer: https://testnet.monadexplorer.com


<img width="1238" height="800" alt="Screenshot 2026-02-17 at 6 26 32 PM" src="https://github.com/user-attachments/assets/2c613b40-1901-4f80-ad79-64b5b9c177d8" />
