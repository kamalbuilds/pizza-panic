// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Script.sol";

/// @notice Sends MON to all agent wallets so they can stake in games.
contract FundAgents is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envOr("PRIVATE_KEY", uint256(0));
        require(deployerPrivateKey != 0, "Set PRIVATE_KEY env var");

        // Amount to send to each agent (2 MON each for staking + gas)
        uint256 amountPerAgent = 2 ether;

        // Agent wallet addresses (from EC2 agent-runner)
        address[5] memory agents = [
            0x5c0058Fbe372A4E957A28e45E8243746EA9EC175,
            0x75C3Ac89A2637007154CF9E0A286dA1a955159e2,
            0x3e836d75B1147212618A3587a6DE631C32A6ED30,
            0x7f4d921433f48AF9cdcC78A4C7dEeaca7aB7464b,
            0x07B71e1074Cf8bc72d6bD4b857D30817a504c261
        ];

        vm.startBroadcast(deployerPrivateKey);

        for (uint256 i = 0; i < agents.length; i++) {
            (bool success,) = agents[i].call{value: amountPerAgent}("");
            require(success, "Transfer failed");
            console.log("Funded agent:", agents[i]);
        }

        vm.stopBroadcast();

        console.log("All 5 agents funded with 2 MON each (10 MON total)");
    }
}
