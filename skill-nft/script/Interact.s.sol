// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Script, console2} from "forge-std/Script.sol";
import {SkillChain} from "../src/SkillChain.sol";

/**
 * @title  Interact
 * @notice Post-deployment interaction script.
 *         Set CONTRACT_ADDRESS in your .env before running.
 *
 *  Add an issuer:
 *    TASK=add_issuer ISSUER=0x... forge script script/Interact.s.sol --rpc-url mumbai --broadcast
 *
 *  Mint a skill:
 *    TASK=mint forge script script/Interact.s.sol --rpc-url mumbai --broadcast
 *
 *  Read user skills:
 *    TASK=read_skills forge script script/Interact.s.sol --rpc-url mumbai
 */
contract Interact is Script {

    function run() external {
        address contractAddr = vm.envAddress("CONTRACT_ADDRESS");
        uint256 deployerKey  = vm.envUint("PRIVATE_KEY");
        address deployer     = vm.addr(deployerKey);
        string memory task   = vm.envOr("TASK", string("read_skills"));

        SkillChain sc = SkillChain(contractAddr);

        console2.log("Contract :", contractAddr);
        console2.log("Caller   :", deployer);
        console2.log("Task     :", task);

        if (keccak256(bytes(task)) == keccak256("add_issuer")) {
            address issuer = vm.envAddress("ISSUER");
            vm.broadcast(deployerKey);
            sc.addIssuer(issuer);
            console2.log("Issuer added:", issuer);

        } else if (keccak256(bytes(task)) == keccak256("revoke_issuer")) {
            address issuer = vm.envAddress("ISSUER");
            vm.broadcast(deployerKey);
            sc.revokeIssuer(issuer);
            console2.log("Issuer revoked:", issuer);

        } else if (keccak256(bytes(task)) == keccak256("mint")) {
            address to       = vm.envOr("RECIPIENT", deployer);
            string memory name  = vm.envOr("SKILL_NAME", string("Solidity Development"));
            uint8  levelInt  = uint8(vm.envOr("LEVEL", uint256(2)));
            string memory uri   = vm.envOr("TOKEN_URI", string("ipfs://QmPlaceholder/metadata.json"));

            vm.broadcast(deployerKey);
            uint256 tokenId = sc.mintSkill(to, name, SkillChain.Level(levelInt), uri);
            console2.log("Minted Token ID:", tokenId);
            console2.log("Recipient      :", to);

        } else if (keccak256(bytes(task)) == keccak256("read_skills")) {
            address user     = vm.envOr("USER", deployer);
            uint256[] memory tokens = sc.getUserSkills(user);
            uint256 rep      = sc.getReputation(user);

            console2.log("User       :", user);
            console2.log("Reputation :", rep);
            console2.log("Skills     :", tokens.length);

            for (uint256 i = 0; i < tokens.length; i++) {
                (string memory name, SkillChain.Level lvl, address iss, uint256 ts, string memory uri)
                    = sc.getSkill(tokens[i]);
                console2.log("  Token #", tokens[i]);
                console2.log("    Name    :", name);
                console2.log("    Level   :", uint8(lvl));
                console2.log("    Issuer  :", iss);
                console2.log("    IssuedAt:", ts);
                console2.log("    URI     :", uri);
            }
        } else {
            console2.log("Unknown task. Set TASK=add_issuer|mint|read_skills|revoke_issuer");
        }
    }
}
