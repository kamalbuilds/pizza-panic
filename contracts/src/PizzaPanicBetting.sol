// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/// @title PizzaPanicBetting
/// @notice Side-betting contract for Pizza Panic games. Spectators can bet on outcomes.
contract PizzaPanicBetting is ReentrancyGuard {
    // -----------------------------------------------------------------------
    // Enums (mirror the game contract)
    // -----------------------------------------------------------------------

    /// @notice Bet types.
    /// 0 = ChefsWin, 1 = SaboteurWins, 2 = SpecificAgentSaboteur
    uint8 public constant BET_CHEFS_WIN = 0;
    uint8 public constant BET_SABOTEUR_WINS = 1;
    uint8 public constant BET_SPECIFIC_AGENT_SABOTEUR = 2;

    enum GameResult {
        None,
        ChefsWin,
        SaboteurWins
    }

    // -----------------------------------------------------------------------
    // Structs
    // -----------------------------------------------------------------------

    struct Bet {
        address bettor;
        uint8 betType;
        address predictedAgent; // only relevant for betType == 2
        uint256 amount;
        bool settled;
        bool won;
    }

    struct GameBettingPool {
        uint256 totalChefsPool;
        uint256 totalSaboteurPool;
        uint256 totalSpecificPool;
        bool settled;
        GameResult result;
        address revealedSaboteur;
    }

    // -----------------------------------------------------------------------
    // Constants
    // -----------------------------------------------------------------------

    /// @notice 3% fee on winnings (300 basis points).
    uint256 public constant BETTING_FEE_BPS = 300;
    uint256 public constant BPS_DENOMINATOR = 10_000;

    // -----------------------------------------------------------------------
    // State
    // -----------------------------------------------------------------------

    address public operator;
    address public treasury;

    /// @notice All bets for a game, indexed by gameId.
    mapping(uint256 => Bet[]) public gameBets;

    /// @notice Betting pool totals per game.
    mapping(uint256 => GameBettingPool) public pools;

    /// @notice Track total bet amount per bettor per game to prevent double-claiming.
    mapping(uint256 => mapping(address => uint256)) public bettorTotal;

    // -----------------------------------------------------------------------
    // Events
    // -----------------------------------------------------------------------

    event BetPlaced(uint256 indexed gameId, address indexed bettor, uint8 betType, address predictedAgent, uint256 amount);
    event BetsSettled(uint256 indexed gameId, GameResult result, address saboteur);
    event BetClaimed(uint256 indexed gameId, address indexed bettor, uint256 payout);

    // -----------------------------------------------------------------------
    // Modifiers
    // -----------------------------------------------------------------------

    modifier onlyOperator() {
        require(msg.sender == operator, "Only operator");
        _;
    }

    // -----------------------------------------------------------------------
    // Constructor
    // -----------------------------------------------------------------------

    constructor(address _operator, address _treasury) {
        require(_operator != address(0), "Zero operator");
        require(_treasury != address(0), "Zero treasury");
        operator = _operator;
        treasury = _treasury;
    }

    // -----------------------------------------------------------------------
    // External Functions
    // -----------------------------------------------------------------------

    /// @notice Place a bet on a game outcome.
    /// @param gameId The game to bet on.
    /// @param betType 0=ChefsWin, 1=SaboteurWins, 2=SpecificAgentSaboteur.
    /// @param predictedAgent Only used when betType == 2.
    function placeBet(uint256 gameId, uint8 betType, address predictedAgent) external payable {
        require(msg.value > 0, "Bet must be > 0");
        require(betType <= 2, "Invalid bet type");
        require(!pools[gameId].settled, "Game already settled");

        if (betType == BET_SPECIFIC_AGENT_SABOTEUR) {
            require(predictedAgent != address(0), "Must specify agent");
        }

        Bet memory b = Bet({
            bettor: msg.sender,
            betType: betType,
            predictedAgent: predictedAgent,
            amount: msg.value,
            settled: false,
            won: false
        });

        gameBets[gameId].push(b);

        // Update pool totals.
        if (betType == BET_CHEFS_WIN) {
            pools[gameId].totalChefsPool += msg.value;
        } else if (betType == BET_SABOTEUR_WINS) {
            pools[gameId].totalSaboteurPool += msg.value;
        } else {
            pools[gameId].totalSpecificPool += msg.value;
        }

        bettorTotal[gameId][msg.sender] += msg.value;

        emit BetPlaced(gameId, msg.sender, betType, predictedAgent, msg.value);
    }

    /// @notice Operator settles all bets for a game after it ends.
    /// @param gameId The game ID.
    /// @param result The game result.
    /// @param saboteur The revealed saboteur address (for specific-agent bets).
    function settleBets(uint256 gameId, GameResult result, address saboteur) external onlyOperator nonReentrant {
        GameBettingPool storage pool = pools[gameId];
        require(!pool.settled, "Already settled");
        require(result != GameResult.None, "Invalid result");

        pool.settled = true;
        pool.result = result;
        pool.revealedSaboteur = saboteur;

        uint256 totalPool = pool.totalChefsPool + pool.totalSaboteurPool + pool.totalSpecificPool;
        if (totalPool == 0) {
            emit BetsSettled(gameId, result, saboteur);
            return;
        }

        // Calculate winning pool size.
        uint256 winningPool = 0;
        Bet[] storage bets = gameBets[gameId];

        for (uint256 i = 0; i < bets.length; i++) {
            bool won = _isBetWinner(bets[i], result, saboteur);
            bets[i].settled = true;
            bets[i].won = won;
            if (won) {
                winningPool += bets[i].amount;
            }
        }

        // Distribute winnings proportionally.
        if (winningPool > 0) {
            uint256 fee = (totalPool * BETTING_FEE_BPS) / BPS_DENOMINATOR;
            uint256 distributable = totalPool - fee;

            // Send fee to treasury.
            (bool feeOk,) = treasury.call{value: fee}("");
            require(feeOk, "Fee transfer failed");

            for (uint256 i = 0; i < bets.length; i++) {
                if (bets[i].won) {
                    // Proportional share: (betAmount / winningPool) * distributable
                    uint256 payout = (bets[i].amount * distributable) / winningPool;
                    if (payout > 0) {
                        (bool ok,) = bets[i].bettor.call{value: payout}("");
                        require(ok, "Payout failed");
                        emit BetClaimed(gameId, bets[i].bettor, payout);
                    }
                }
            }
        } else {
            // No winners - refund everyone.
            for (uint256 i = 0; i < bets.length; i++) {
                (bool ok,) = bets[i].bettor.call{value: bets[i].amount}("");
                require(ok, "Refund failed");
            }
        }

        emit BetsSettled(gameId, result, saboteur);
    }

    // -----------------------------------------------------------------------
    // View Functions
    // -----------------------------------------------------------------------

    /// @notice Returns the number of bets for a game.
    function getBetCount(uint256 gameId) external view returns (uint256) {
        return gameBets[gameId].length;
    }

    /// @notice Returns pool sizes for a game.
    function getPoolSizes(uint256 gameId)
        external
        view
        returns (uint256 chefsPool, uint256 saboteurPool, uint256 specificPool)
    {
        GameBettingPool storage p = pools[gameId];
        return (p.totalChefsPool, p.totalSaboteurPool, p.totalSpecificPool);
    }

    // -----------------------------------------------------------------------
    // Internal
    // -----------------------------------------------------------------------

    function _isBetWinner(Bet memory b, GameResult result, address saboteur) internal pure returns (bool) {
        if (b.betType == BET_CHEFS_WIN && result == GameResult.ChefsWin) {
            return true;
        }
        if (b.betType == BET_SABOTEUR_WINS && result == GameResult.SaboteurWins) {
            return true;
        }
        if (b.betType == BET_SPECIFIC_AGENT_SABOTEUR && b.predictedAgent == saboteur && saboteur != address(0)) {
            return true;
        }
        return false;
    }

    // -----------------------------------------------------------------------
    // Admin
    // -----------------------------------------------------------------------

    function setOperator(address newOperator) external onlyOperator {
        require(newOperator != address(0), "Zero address");
        operator = newOperator;
    }

    function setTreasury(address newTreasury) external onlyOperator {
        require(newTreasury != address(0), "Zero address");
        treasury = newTreasury;
    }

    receive() external payable {}
}
