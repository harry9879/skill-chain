// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Script, console2} from "forge-std/Script.sol";
import {SkillChain} from "../src/SkillChain.sol";

/**
 * @title  DeploySkillChain
 * @notice Foundry deployment script.
 *
 *  Deploy to local anvil:
 *    forge script script/Deploy.s.sol --rpc-url localhost --broadcast
 *
 *  Deploy to Polygon Mumbai:
 *    forge script script/Deploy.s.sol \
 *      --rpc-url mumbai \
 *      --broadcast \
 *      --verify \
 *      --etherscan-api-key $POLYGONSCAN_API_KEY \
 *      -vvvv
 *
 *  Simulate only (no broadcast):
 *    forge script script/Deploy.s.sol --rpc-url mumbai -vvvv
 */
contract DeploySkillChain is Script {

    // ── Addresses to approve as issuers after deploy ──
    // Fill these in before deploying to production
    address[] public initialIssuers;

    function run() external returns (SkillChain skillchain) {
        // Load deployer private key from env
        uint256 deployerKey = vm.envUint("PRIVATE_KEY");
        address deployer    = vm.addr(deployerKey);

        console2.log("==============================================");
        console2.log("  SkillChain Deployment");
        console2.log("==============================================");
        console2.log("Deployer  :", deployer);
        console2.log("Chain ID  :", block.chainid);
        console2.log("Block     :", block.number);

        vm.startBroadcast(deployerKey);

        // ── 1. Deploy ──
        skillchain = new SkillChain();
        console2.log("Contract  :", address(skillchain));

        // ── 2. Register the deployer as an issuer (for testing) ──
        skillchain.addIssuer(deployer);
        console2.log("Issuer    :", deployer, "(deployer)");

        // ── 3. Register any additional initial issuers ──
        for (uint256 i = 0; i < initialIssuers.length; i++) {
            skillchain.addIssuer(initialIssuers[i]);
            console2.log("Issuer    :", initialIssuers[i]);
        }

        // ── 4. Mint sample credentials (demo only) ──
        _mintSamples(skillchain, deployer);

        vm.stopBroadcast();

        console2.log("==============================================");
        console2.log("  Total supply:", skillchain.totalSupply());
        console2.log("  Reputation  :", skillchain.getReputation(deployer));
        console2.log("==============================================");
    }

    function _mintSamples(SkillChain sc, address to) internal {
        string[3] memory names  = ["Solidity Development", "Smart Contract Security", "Web3 Fundamentals"];
        SkillChain.Level[3] memory levels = [
            SkillChain.Level.Advanced,
            SkillChain.Level.Advanced,
            SkillChain.Level.Beginner
        ];
        string[3] memory uris = [
            "ipfs://QmSampleSolidity/metadata.json",
            "ipfs://QmSampleSecurity/metadata.json",
            "ipfs://QmSampleWeb3/metadata.json"
        ];

        for (uint256 i = 0; i < 3; i++) {
            uint256 tokenId = sc.mintSkill(to, names[i], levels[i], uris[i]);
            console2.log("Minted token", tokenId, ":", names[i]);
        }
    }
}
