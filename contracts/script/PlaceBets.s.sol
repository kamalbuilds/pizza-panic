// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Script.sol";

interface IPizzaPanicBetting {
    function placeBet(uint256 gameId, uint8 betType, address predictedAgent) external payable;
    function getBetCount(uint256 gameId) external view returns (uint256);
    function getPoolSizes(uint256 gameId) external view returns (uint256, uint256, uint256);
}

/// @notice Place bets from two different wallets on a live game.
/// @dev Usage:
///   PRIVATE_KEY=0x... WALLET2_KEY=0x... GAME_ID=0 \
///   forge script script/PlaceBets.s.sol --rpc-url https://testnet-rpc.monad.xyz --broadcast --legacy -vvv
contract PlaceBets is Script {
    // Betting contract on Monad testnet
    address constant BETTING = 0x4158B65F3f1036f8447d14916e71489aEC8BD3f1;

    // Agent wallet addresses
    address constant CHEF_MARCO  = 0x5c0058Fbe372A4E957A28e45E8243746EA9EC175;
    address constant SOUS_ANTON  = 0x75C3Ac89A2637007154CF9E0A286dA1a955159e2;
    address constant PIZZA_ROSA  = 0x3e836d75B1147212618A3587a6DE631C32A6ED30;
    address constant DOUGH_DARIO = 0x7f4d921433f48AF9cdcC78A4C7dEeaca7aB7464b;
    address constant SAUCE_LUIGI = 0x07B71e1074Cf8bc72d6bD4b857D30817a504c261;

    // Bet types
    uint8 constant BET_CHEFS_WIN = 0;
    uint8 constant BET_SABOTEUR_WINS = 1;
    uint8 constant BET_SPECIFIC_AGENT = 2;

    function run() external {
        uint256 operatorKey = vm.envUint("PRIVATE_KEY");
        uint256 wallet2Key = vm.envUint("WALLET2_KEY");
        uint256 gameId = vm.envOr("GAME_ID", uint256(0));
        uint256 betAmount = 0.01 ether;

        IPizzaPanicBetting betting = IPizzaPanicBetting(BETTING);

        // --- Operator bets 0.01 MON that DoughDario is the saboteur ---
        vm.startBroadcast(operatorKey);
        betting.placeBet{value: betAmount}(gameId, BET_SPECIFIC_AGENT, DOUGH_DARIO);
        vm.stopBroadcast();

        console.log("Operator bet 0.01 MON on DoughDario as saboteur");

        // --- Wallet2 bets 0.01 MON that PizzaRosa is the saboteur ---
        vm.startBroadcast(wallet2Key);
        betting.placeBet{value: betAmount}(gameId, BET_SPECIFIC_AGENT, PIZZA_ROSA);
        vm.stopBroadcast();

        console.log("Wallet2 bet 0.01 MON on PizzaRosa as saboteur");

        // Show pool status
        (uint256 chefsPool, uint256 sabPool, uint256 specificPool) = betting.getPoolSizes(gameId);
        console.log("Chefs pool:", chefsPool);
        console.log("Saboteur pool:", sabPool);
        console.log("Specific pool:", specificPool);
        console.log("Total bets:", betting.getBetCount(gameId));
    }
}
