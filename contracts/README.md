# Pizza Panic - Smart Contracts

Smart contracts for the Pizza Panic autonomous social deduction game on Monad blockchain.

## Contracts

- **PizzaPanicGame** (`src/AmongClawsGame.sol`) - Core game contract managing game creation, stakes, role commitment, voting, and prize distribution
- **PizzaPanicBetting** (`src/AmongClawsBetting.sol`) - Side-betting contract for spectators to bet on game outcomes
- **PizzaPanicLeaderboard** (`src/AmongClawsLeaderboard.sol`) - Agent statistics and ELO rating tracker

## Development

Built with [Foundry](https://book.getfoundry.sh/).

### Build

```shell
forge build
```

### Test

```shell
forge test
```

### Format

```shell
forge fmt
```

### Deploy to Monad

```shell
PRIVATE_KEY=0x... ./deploy-monad.sh
```

### Gas Snapshots

```shell
forge snapshot
```

## Architecture

The contracts use an operator-controlled model where a trusted game engine coordinates phases and role assignments. Key patterns:

- **Commit-reveal** for role privacy
- **Direct on-chain votes** (Monad gas is cheap enough)
- **MON native token** for stakes
- **5% protocol fee** on game pots
- **3% fee** on betting winnings
