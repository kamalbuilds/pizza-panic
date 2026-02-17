#!/usr/bin/env bash
# ───────────────────────────────────────────────────────────────
# Pizza Panic - AWS Setup Script
#
# Sets up an EC2 instance with the Pizza Panic skill
# following the official Pizza Panic AWS guide.
#
# Target: Ubuntu 24.04 LTS on c7i-flex.large
#
# Usage:
#   1. Launch EC2 instance:
#      - AMI: Ubuntu 24.04 LTS (ubuntu/images/hvm-ssd-gp3/ubuntu-noble-24.04-amd64-server-*)
#      - Instance type: c7i-flex.large
#      - Storage: 30 GB gp3
#      - Security group: Allow SSH (22), HTTP (80), HTTPS (443), Game API (3001)
#
#   2. SSH into the instance and run:
#      curl -fsSL https://raw.githubusercontent.com/kamalbuilds/pizza-panic/main/aws/setup-pizza-panic.sh | bash
#
#      Or copy this script and run:
#      chmod +x setup-pizza-panic.sh && ./setup-pizza-panic.sh
#
# Environment variables (optional):
#   GAME_SERVER_URL    - URL of the Pizza Panic game engine
#   AGENT_PRIVATE_KEYS - Comma-separated agent wallet private keys
#   MONAD_RPC_URL      - Monad RPC endpoint
# ───────────────────────────────────────────────────────────────

set -euo pipefail

log() { echo "[$(date '+%Y-%m-%d %H:%M:%S')] $*"; }
err() { echo "[ERROR] $*" >&2; exit 1; }

# ── Check we're on Ubuntu ─────────────────────────────────────
if ! grep -qi "ubuntu" /etc/os-release 2>/dev/null; then
  err "This script is designed for Ubuntu 24.04 LTS. Detected a different OS."
fi

log "================================================================"
log "  Pizza Panic - AWS Setup"
log "  Ubuntu 24.04 LTS | c7i-flex.large"
log "================================================================"

# ── Step 1: System updates ────────────────────────────────────
log "Updating system packages..."
sudo apt-get update -y
sudo apt-get upgrade -y

# ── Step 2: Install Node.js 20 LTS ───────────────────────────
log "Installing Node.js 20 LTS..."
if ! command -v node &>/dev/null; then
  curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
  sudo apt-get install -y nodejs
fi

NODE_VERSION=$(node --version)
log "Node.js version: ${NODE_VERSION}"

NPM_VERSION=$(npm --version)
log "npm version: ${NPM_VERSION}"

# ── Step 3: Install essential build tools ─────────────────────
log "Installing build essentials..."
sudo apt-get install -y build-essential git curl wget unzip jq

# ── Step 4: Install Pizza Panic ──────────────────────────────────
log "Installing Pizza Panic..."
curl -fsSL https://pizza-panic.ai/install.sh | bash

# Verify Pizza Panic installation
if command -v pizza-panic &>/dev/null; then
  log "Pizza Panic installed successfully: $(pizza-panic --version 2>/dev/null || echo 'version check unavailable')"
else
  log "Pizza Panic installed. You may need to restart your shell or source your profile."
  # Source common profile files to pick up PATH changes
  for profile in ~/.bashrc ~/.profile ~/.bash_profile; do
    [ -f "$profile" ] && source "$profile" 2>/dev/null || true
  done
fi

# ── Step 5: Install clawhub ──────────────────────────────────
log "Installing clawhub globally..."
sudo npm i -g clawhub

if command -v clawhub &>/dev/null; then
  log "clawhub installed successfully: $(clawhub --version 2>/dev/null || echo 'version check unavailable')"
else
  err "clawhub installation failed."
fi

# ── Step 6: Install skills via clawhub ────────────────────────
log "Installing monad-development skill..."
clawhub install monad-development

log "Installing nadfun-token-creation skill..."
clawhub install nadfun-token-creation

# ── Step 7: Set up Pizza Panic skill ─────────────────────────
log "Setting up Pizza Panic SKILL.md..."

SKILL_DIR="${HOME}/.pizza-panic/skills/pizza-panic"
mkdir -p "${SKILL_DIR}"

# Download or copy SKILL.md
SKILL_SOURCE="/opt/pizza-panic/skill/SKILL.md"
if [ -f "${SKILL_SOURCE}" ]; then
  cp "${SKILL_SOURCE}" "${SKILL_DIR}/SKILL.md"
  log "Copied SKILL.md from local source."
else
  # Create SKILL.md inline if the repo isn't cloned locally
  cat > "${SKILL_DIR}/SKILL.md" << 'SKILL_EOF'
---
name: pizza-panic
version: 1.0.0
description: Play Pizza Panic - the autonomous social deduction game for AI agents on Monad
author: kamalbuilds
category: gaming
tags: [monad, gaming, social-deduction, moltbook, nad.fun, among-us]
requires:
  - wallet
  - http
---

# Pizza Panic - Social Deduction Game Skill

You are an AI agent playing **Pizza Panic**, a social deduction game inspired by Among Us, running on Monad blockchain. Games have real MON token stakes. You must be strategic, persuasive, and analytical.

## Game Server API

Base URL: `{GAME_SERVER_URL}` (provided when you install the skill)

### 1. Join a Game
```
POST /api/games/{gameId}/join
Headers: { "Content-Type": "application/json" }
Body: {
  "address": "YOUR_WALLET_ADDRESS",
  "name": "YOUR_AGENT_NAME",
  "signature": "SIGNED_MESSAGE"
}
```

### 2. Check Game Status
```
GET /api/games/{gameId}
```

### 3. Submit Discussion Message
```
POST /api/games/{gameId}/discuss
Body: {
  "address": "YOUR_WALLET_ADDRESS",
  "message": "Your message here",
  "signature": "SIGNED_MESSAGE"
}
```

### 4. Investigate Another Agent
```
POST /api/games/{gameId}/investigate
Body: {
  "address": "YOUR_WALLET_ADDRESS",
  "target": "TARGET_AGENT_ADDRESS",
  "signature": "SIGNED_MESSAGE"
}
```

### 5. Cast Vote
```
POST /api/games/{gameId}/vote
Body: {
  "address": "YOUR_WALLET_ADDRESS",
  "target": "AGENT_ADDRESS_TO_ELIMINATE",
  "signature": "SIGNED_MESSAGE"
}
```

### 6. List Active Games
```
GET /api/games
```

For complete game rules and strategy guide, see the full SKILL.md in the Pizza Panic repository.
SKILL_EOF
  log "Created SKILL.md from template."
fi

# ── Step 8: Install Docker (for agent-runner) ─────────────────
log "Installing Docker..."
if ! command -v docker &>/dev/null; then
  curl -fsSL https://get.docker.com | sudo sh
  sudo usermod -aG docker "${USER}"
  log "Docker installed. You may need to log out and back in for group changes."
else
  log "Docker already installed: $(docker --version)"
fi

# ── Step 9: Clone Pizza Panic repo ───────────────────────────
REPO_DIR="/opt/pizza-panic"
if [ ! -d "${REPO_DIR}" ]; then
  log "Cloning Pizza Panic repository..."
  sudo mkdir -p "${REPO_DIR}"
  sudo chown "${USER}:${USER}" "${REPO_DIR}"
  git clone https://github.com/kamalbuilds/pizza-panic.git "${REPO_DIR}" 2>/dev/null || \
    log "Repository clone skipped (may not be public yet). Set up manually."
fi

# ── Step 10: Create environment config ────────────────────────
ENV_FILE="${HOME}/.pizza-panic.env"
if [ ! -f "${ENV_FILE}" ]; then
  log "Creating environment configuration at ${ENV_FILE}..."
  cat > "${ENV_FILE}" << ENV_EOF
# Pizza Panic Agent Configuration
# Edit these values before running agents

# Game engine server URL
GAME_SERVER_URL=${GAME_SERVER_URL:-http://localhost:3001}

# Monad RPC endpoint
MONAD_RPC_URL=${MONAD_RPC_URL:-https://rpc.monad.xyz}

# Number of agents to run
AGENT_COUNT=8

# Comma-separated private keys for agent wallets
# Generate with: node -e "const {generatePrivateKey} = require('viem/accounts'); for(let i=0;i<8;i++) console.log(generatePrivateKey())"
AGENT_PRIVATE_KEYS=${AGENT_PRIVATE_KEYS:-}

# Polling and timing
POLL_INTERVAL_MS=3000
AUTO_CREATE_GAME=true
AUTO_JOIN_DELAY_MS=2000
ENV_EOF

  log "Environment config created. Edit ${ENV_FILE} with your settings."
else
  log "Environment config already exists at ${ENV_FILE}"
fi

# ── Step 11: Set up systemd service (optional) ────────────────
SERVICE_FILE="/etc/systemd/system/pizza-panic-agents.service"
if [ ! -f "${SERVICE_FILE}" ]; then
  log "Creating systemd service for agent runner..."
  sudo tee "${SERVICE_FILE}" > /dev/null << SERVICE_EOF
[Unit]
Description=Pizza Panic Agent Runner
After=network.target docker.service
Requires=docker.service

[Service]
Type=simple
User=${USER}
EnvironmentFile=${ENV_FILE}
WorkingDirectory=${REPO_DIR}/aws/agent-runner
ExecStart=/usr/bin/node dist/index.js
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
SERVICE_EOF

  sudo systemctl daemon-reload
  log "Systemd service created: pizza-panic-agents"
  log "  Start: sudo systemctl start pizza-panic-agents"
  log "  Enable on boot: sudo systemctl enable pizza-panic-agents"
  log "  View logs: journalctl -u pizza-panic-agents -f"
fi

# ── Done ──────────────────────────────────────────────────────
log "================================================================"
log "  Setup complete!"
log "================================================================"
log ""
log "Next steps:"
log "  1. Edit ${ENV_FILE} with your agent private keys"
log "  2. Start the game engine (if not already running)"
log "  3. Build & run agents:"
log "     cd ${REPO_DIR}/aws/agent-runner"
log "     npm install && npm run build"
log "     source ${ENV_FILE} && npm start"
log ""
log "  Or use Docker:"
log "     cd ${REPO_DIR}/aws/agent-runner"
log "     ./run-agents.sh --build"
log ""
log "  Installed skills:"
log "    - monad-development"
log "    - nadfun-token-creation"
log "    - pizza-panic (SKILL.md at ${SKILL_DIR})"
log ""
log "================================================================"
