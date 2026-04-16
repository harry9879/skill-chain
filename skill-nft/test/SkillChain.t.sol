// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Test, console2} from "forge-std/Test.sol";
import {SkillChain} from "../src/SkillChain.sol";

/**
 * @title  SkillChainTest
 * @notice Comprehensive Foundry test suite for SkillChain.
 *
 *  Run all tests:          forge test -vvv
 *  Run specific test:      forge test --match-test testMintSkill -vvv
 *  Run with gas report:    forge test --gas-report
 *  Run fuzz tests:         forge test --match-test testFuzz -vvv
 */
contract SkillChainTest is Test {
    // ─────────────────────────────────────────────
    //  Setup
    // ─────────────────────────────────────────────

    SkillChain public sc;

    address public owner = makeAddr("owner");
    address public issuer1 = makeAddr("issuer1");
    address public issuer2 = makeAddr("issuer2");
    address public user1 = makeAddr("user1");
    address public user2 = makeAddr("user2");
    address public attacker = makeAddr("attacker");

    string constant SKILL_SOLIDITY = "Solidity Development";
    string constant SKILL_REACT = "React Development";
    string constant SKILL_SECURITY = "Smart Contract Security";
    string constant IPFS_URI_1 = "ipfs://QmTest111/metadata.json";
    string constant IPFS_URI_2 = "ipfs://QmTest222/metadata.json";
    string constant IPFS_URI_3 = "ipfs://QmTest333/metadata.json";

    function setUp() public {
        vm.prank(owner);
        sc = new SkillChain();
    }

    // ─────────────────────────────────────────────
    //  Helper
    // ─────────────────────────────────────────────

    /// Approve issuer1 and mint one skill to user1
    function _mintOneSkill() internal returns (uint256 tokenId) {
        vm.prank(owner);
        sc.addIssuer(issuer1);

        vm.prank(issuer1);
        tokenId = sc.mintSkill(
            user1,
            SKILL_SOLIDITY,
            SkillChain.Level.Advanced,
            IPFS_URI_1
        );
    }

    // ═══════════════════════════════════════════════
    //  1. DEPLOYMENT
    // ═══════════════════════════════════════════════

    function test_DeploymentState() public view {
        assertEq(sc.name(), "SkillChain Credential");
        assertEq(sc.symbol(), "SKILL");
        assertEq(sc.owner(), owner);
        assertEq(sc.totalSupply(), 0);
    }

    function test_ReputationConstants() public view {
        assertEq(sc.REP_BEGINNER(), 10);
        assertEq(sc.REP_INTERMEDIATE(), 20);
        assertEq(sc.REP_ADVANCED(), 50);
    }

    // ═══════════════════════════════════════════════
    //  2. ISSUER MANAGEMENT
    // ═══════════════════════════════════════════════

    function test_AddIssuer() public {
        vm.prank(owner);
        vm.expectEmit(true, false, false, false);
        emit SkillChain.IssuerAdded(issuer1);
        sc.addIssuer(issuer1);

        assertTrue(sc.isIssuer(issuer1));
    }

    function test_AddMultipleIssuers() public {
        vm.startPrank(owner);
        sc.addIssuer(issuer1);
        sc.addIssuer(issuer2);
        vm.stopPrank();

        assertTrue(sc.isIssuer(issuer1));
        assertTrue(sc.isIssuer(issuer2));
    }

    function test_RevertAddIssuer_NotOwner() public {
        vm.prank(attacker);
        vm.expectRevert();
        sc.addIssuer(issuer1);
    }

    function test_RevertAddIssuer_ZeroAddress() public {
        vm.prank(owner);
        vm.expectRevert(SkillChain.ZeroAddress.selector);
        sc.addIssuer(address(0));
    }

    function test_RevertAddIssuer_AlreadyIssuer() public {
        vm.startPrank(owner);
        sc.addIssuer(issuer1);
        vm.expectRevert(
            abi.encodeWithSelector(SkillChain.AlreadyIssuer.selector, issuer1)
        );
        sc.addIssuer(issuer1);
        vm.stopPrank();
    }

    function test_RevokeIssuer() public {
        vm.startPrank(owner);
        sc.addIssuer(issuer1);
        vm.expectEmit(true, false, false, false);
        emit SkillChain.IssuerRevoked(issuer1);
        sc.revokeIssuer(issuer1);
        vm.stopPrank();

        assertFalse(sc.isIssuer(issuer1));
    }

    function test_RevertRevokeIssuer_NotOwner() public {
        vm.prank(owner);
        sc.addIssuer(issuer1);

        vm.prank(attacker);
        vm.expectRevert();
        sc.revokeIssuer(issuer1);
    }

    function test_RevertRevokeIssuer_NotAnIssuer() public {
        vm.prank(owner);
        vm.expectRevert(
            abi.encodeWithSelector(SkillChain.NotAnIssuer.selector, issuer1)
        );
        sc.revokeIssuer(issuer1);
    }

    function test_RevokedIssuerCannotMint() public {
        vm.startPrank(owner);
        sc.addIssuer(issuer1);
        sc.revokeIssuer(issuer1);
        vm.stopPrank();

        vm.prank(issuer1);
        vm.expectRevert(
            abi.encodeWithSelector(SkillChain.NotIssuer.selector, issuer1)
        );
        sc.mintSkill(
            user1,
            SKILL_SOLIDITY,
            SkillChain.Level.Advanced,
            IPFS_URI_1
        );
    }

    // ═══════════════════════════════════════════════
    //  3. MINTING
    // ═══════════════════════════════════════════════

    function test_MintSkill_Basic() public {
        vm.prank(owner);
        sc.addIssuer(issuer1);

        vm.prank(issuer1);
        vm.expectEmit(true, true, false, true);
        emit SkillChain.SkillMinted(
            1,
            user1,
            SKILL_SOLIDITY,
            SkillChain.Level.Advanced,
            issuer1,
            IPFS_URI_1
        );
        uint256 tokenId = sc.mintSkill(
            user1,
            SKILL_SOLIDITY,
            SkillChain.Level.Advanced,
            IPFS_URI_1
        );

        assertEq(tokenId, 1);
        assertEq(sc.ownerOf(tokenId), user1);
        assertEq(sc.tokenURI(tokenId), IPFS_URI_1);
        assertEq(sc.totalSupply(), 1);
    }

    function test_MintSkill_StoresSkillData() public {
        uint256 tokenId = _mintOneSkill();

        (
            string memory name,
            SkillChain.Level level,
            address iss,
            uint256 issuedAt,
            string memory uri
        ) = sc.getSkill(tokenId);

        assertEq(name, SKILL_SOLIDITY);
        assertEq(uint8(level), uint8(SkillChain.Level.Advanced));
        assertEq(iss, issuer1);
        assertEq(issuedAt, block.timestamp);
        assertEq(uri, IPFS_URI_1);
    }

    function test_MintSkill_TokenIdIncrements() public {
        vm.prank(owner);
        sc.addIssuer(issuer1);

        vm.startPrank(issuer1);
        uint256 id1 = sc.mintSkill(
            user1,
            SKILL_SOLIDITY,
            SkillChain.Level.Advanced,
            IPFS_URI_1
        );
        uint256 id2 = sc.mintSkill(
            user1,
            SKILL_REACT,
            SkillChain.Level.Intermediate,
            IPFS_URI_2
        );
        uint256 id3 = sc.mintSkill(
            user2,
            SKILL_SECURITY,
            SkillChain.Level.Beginner,
            IPFS_URI_3
        );
        vm.stopPrank();

        assertEq(id1, 1);
        assertEq(id2, 2);
        assertEq(id3, 3);
        assertEq(sc.totalSupply(), 3);
    }

    function test_MintSkill_UserSkillsTracked() public {
        vm.prank(owner);
        sc.addIssuer(issuer1);

        vm.startPrank(issuer1);
        sc.mintSkill(
            user1,
            SKILL_SOLIDITY,
            SkillChain.Level.Advanced,
            IPFS_URI_1
        );
        sc.mintSkill(
            user1,
            SKILL_REACT,
            SkillChain.Level.Intermediate,
            IPFS_URI_2
        );
        vm.stopPrank();

        uint256[] memory tokens = sc.getUserSkills(user1);
        assertEq(tokens.length, 2);
        assertEq(tokens[0], 1);
        assertEq(tokens[1], 2);
    }

    function test_MintSkill_HasSkillFlagSet() public {
        uint256 tokenId = _mintOneSkill();
        (
            string memory a,
            SkillChain.Level b,
            address c,
            uint256 d,
            string memory e
        ) = sc.getSkill(tokenId);

        assertTrue(sc.hasSkill(user1, SKILL_SOLIDITY));
        assertFalse(sc.hasSkill(user1, SKILL_REACT));
        assertFalse(sc.hasSkill(user2, SKILL_SOLIDITY));
    }

    function test_RevertMint_NotIssuer() public {
        vm.prank(attacker);
        vm.expectRevert(
            abi.encodeWithSelector(SkillChain.NotIssuer.selector, attacker)
        );
        sc.mintSkill(
            user1,
            SKILL_SOLIDITY,
            SkillChain.Level.Advanced,
            IPFS_URI_1
        );
    }

    function test_RevertMint_ZeroAddress() public {
        vm.prank(owner);
        sc.addIssuer(issuer1);

        vm.prank(issuer1);
        vm.expectRevert(SkillChain.ZeroAddress.selector);
        sc.mintSkill(
            address(0),
            SKILL_SOLIDITY,
            SkillChain.Level.Advanced,
            IPFS_URI_1
        );
    }

    function test_RevertMint_EmptySkillName() public {
        vm.prank(owner);
        sc.addIssuer(issuer1);

        vm.prank(issuer1);
        vm.expectRevert(SkillChain.EmptySkillName.selector);
        sc.mintSkill(user1, "", SkillChain.Level.Advanced, IPFS_URI_1);
    }

    function test_RevertMint_DuplicateSkill() public {
        vm.prank(owner);
        sc.addIssuer(issuer1);

        vm.startPrank(issuer1);
        sc.mintSkill(
            user1,
            SKILL_SOLIDITY,
            SkillChain.Level.Advanced,
            IPFS_URI_1
        );

        vm.expectRevert(
            abi.encodeWithSelector(
                SkillChain.DuplicateSkill.selector,
                user1,
                SKILL_SOLIDITY
            )
        );
        sc.mintSkill(
            user1,
            SKILL_SOLIDITY,
            SkillChain.Level.Intermediate,
            IPFS_URI_2
        );
        vm.stopPrank();
    }

    function test_SameSkillDifferentUsers_Allowed() public {
        vm.prank(owner);
        sc.addIssuer(issuer1);

        vm.startPrank(issuer1);
        sc.mintSkill(
            user1,
            SKILL_SOLIDITY,
            SkillChain.Level.Advanced,
            IPFS_URI_1
        );
        // Should NOT revert for user2
        sc.mintSkill(
            user2,
            SKILL_SOLIDITY,
            SkillChain.Level.Advanced,
            IPFS_URI_2
        );
        vm.stopPrank();

        assertEq(sc.ownerOf(1), user1);
        assertEq(sc.ownerOf(2), user2);
    }

    function test_TwoIssuersCanBothMint() public {
        vm.startPrank(owner);
        sc.addIssuer(issuer1);
        sc.addIssuer(issuer2);
        vm.stopPrank();

        vm.prank(issuer1);
        sc.mintSkill(
            user1,
            SKILL_SOLIDITY,
            SkillChain.Level.Advanced,
            IPFS_URI_1
        );

        vm.prank(issuer2);
        sc.mintSkill(user1, SKILL_REACT, SkillChain.Level.Beginner, IPFS_URI_2);

        (, , address iss1, , ) = sc.getSkill(1);
        (, , address iss2, , ) = sc.getSkill(2);
        assertEq(iss1, issuer1);
        assertEq(iss2, issuer2);
    }

    // ═══════════════════════════════════════════════
    //  4. REPUTATION
    // ═══════════════════════════════════════════════

    function test_Reputation_Beginner() public {
        vm.prank(owner);
        sc.addIssuer(issuer1);

        vm.prank(issuer1);
        sc.mintSkill(
            user1,
            SKILL_SOLIDITY,
            SkillChain.Level.Beginner,
            IPFS_URI_1
        );

        assertEq(sc.getReputation(user1), 10);
    }

    function test_Reputation_Intermediate() public {
        vm.prank(owner);
        sc.addIssuer(issuer1);

        vm.prank(issuer1);
        sc.mintSkill(
            user1,
            SKILL_REACT,
            SkillChain.Level.Intermediate,
            IPFS_URI_1
        );

        assertEq(sc.getReputation(user1), 20);
    }

    function test_Reputation_Advanced() public {
        vm.prank(owner);
        sc.addIssuer(issuer1);

        vm.prank(issuer1);
        sc.mintSkill(
            user1,
            SKILL_SOLIDITY,
            SkillChain.Level.Advanced,
            IPFS_URI_1
        );

        assertEq(sc.getReputation(user1), 50);
    }

    function test_Reputation_Accumulates() public {
        vm.prank(owner);
        sc.addIssuer(issuer1);

        vm.startPrank(issuer1);
        sc.mintSkill(
            user1,
            SKILL_SOLIDITY,
            SkillChain.Level.Beginner,
            IPFS_URI_1
        ); // +10
        sc.mintSkill(
            user1,
            SKILL_REACT,
            SkillChain.Level.Intermediate,
            IPFS_URI_2
        ); // +20
        sc.mintSkill(
            user1,
            SKILL_SECURITY,
            SkillChain.Level.Advanced,
            IPFS_URI_3
        ); // +50
        vm.stopPrank();

        assertEq(sc.getReputation(user1), 80); // 10+20+50
    }

    function test_Reputation_IndependentPerUser() public {
        vm.prank(owner);
        sc.addIssuer(issuer1);

        vm.startPrank(issuer1);
        sc.mintSkill(
            user1,
            SKILL_SOLIDITY,
            SkillChain.Level.Advanced,
            IPFS_URI_1
        ); // user1 +50
        sc.mintSkill(
            user2,
            SKILL_REACT,
            SkillChain.Level.Intermediate,
            IPFS_URI_2
        ); // user2 +20
        vm.stopPrank();

        assertEq(sc.getReputation(user1), 50);
        assertEq(sc.getReputation(user2), 20);
    }

    function test_Reputation_ZeroForNonHolder() public view {
        assertEq(sc.getReputation(user1), 0);
    }

    // ═══════════════════════════════════════════════
    //  5. SOULBOUND — NON-TRANSFERABLE
    // ═══════════════════════════════════════════════

    function test_Soulbound_TransferFromReverts() public {
        uint256 tokenId = _mintOneSkill();

        vm.prank(user1);
        vm.expectRevert(
            abi.encodeWithSelector(SkillChain.Soulbound.selector, tokenId)
        );
        sc.transferFrom(user1, user2, tokenId);
    }

    function test_Soulbound_SafeTransferFromReverts() public {
        uint256 tokenId = _mintOneSkill();

        vm.prank(user1);
        vm.expectRevert(
            abi.encodeWithSelector(SkillChain.Soulbound.selector, tokenId)
        );
        sc.safeTransferFrom(user1, user2, tokenId);
    }

    function test_Soulbound_ApproveDoesNotBypassTransfer() public {
        uint256 tokenId = _mintOneSkill();

        vm.prank(user1);
        sc.approve(attacker, tokenId);

        vm.prank(attacker);
        vm.expectRevert(
            abi.encodeWithSelector(SkillChain.Soulbound.selector, tokenId)
        );
        sc.transferFrom(user1, attacker, tokenId);
    }

    function test_Soulbound_OwnerUnchangedAfterAttemptedTransfer() public {
        uint256 tokenId = _mintOneSkill();

        vm.prank(user1);
        try sc.transferFrom(user1, user2, tokenId) {} catch {}

        assertEq(sc.ownerOf(tokenId), user1);
    }

    // ═══════════════════════════════════════════════
    //  6. VIEW FUNCTIONS
    // ═══════════════════════════════════════════════

    function test_GetSkill_ReturnsCorrectData() public {
        uint256 tokenId = _mintOneSkill();

        (
            string memory name,
            SkillChain.Level lvl,
            address iss,
            uint256 ts,
            string memory uri
        ) = sc.getSkill(tokenId);

        assertEq(name, SKILL_SOLIDITY);
        assertEq(uint8(lvl), uint8(SkillChain.Level.Advanced));
        assertEq(iss, issuer1);
        assertEq(ts, block.timestamp);
        assertEq(uri, IPFS_URI_1);
    }

    function test_GetSkill_RevertsForNonExistentToken() public {
        vm.expectRevert(
            abi.encodeWithSelector(SkillChain.TokenNotFound.selector, 999)
        );
        sc.getSkill(999);
    }

    function test_GetUserSkills_Empty() public view {
        uint256[] memory tokens = sc.getUserSkills(user1);
        assertEq(tokens.length, 0);
    }

    function test_GetUserSkills_Multiple() public {
        vm.prank(owner);
        sc.addIssuer(issuer1);

        vm.startPrank(issuer1);
        sc.mintSkill(
            user1,
            SKILL_SOLIDITY,
            SkillChain.Level.Advanced,
            IPFS_URI_1
        );
        sc.mintSkill(
            user1,
            SKILL_REACT,
            SkillChain.Level.Intermediate,
            IPFS_URI_2
        );
        sc.mintSkill(
            user1,
            SKILL_SECURITY,
            SkillChain.Level.Beginner,
            IPFS_URI_3
        );
        vm.stopPrank();

        uint256[] memory tokens = sc.getUserSkills(user1);
        assertEq(tokens.length, 3);
        assertEq(tokens[0], 1);
        assertEq(tokens[1], 2);
        assertEq(tokens[2], 3);
    }

    function test_TotalSupply_AfterMultipleMints() public {
        vm.prank(owner);
        sc.addIssuer(issuer1);

        vm.startPrank(issuer1);
        sc.mintSkill(
            user1,
            SKILL_SOLIDITY,
            SkillChain.Level.Advanced,
            IPFS_URI_1
        );
        sc.mintSkill(
            user2,
            SKILL_REACT,
            SkillChain.Level.Intermediate,
            IPFS_URI_2
        );
        vm.stopPrank();

        assertEq(sc.totalSupply(), 2);
    }

    // ═══════════════════════════════════════════════
    //  7. FUZZ TESTS
    // ═══════════════════════════════════════════════

    function testFuzz_ReputationAccumulation(uint8 numSkills) public {
        // Cap to a reasonable range
        numSkills = uint8(bound(numSkills, 1, 20));

        vm.prank(owner);
        sc.addIssuer(issuer1);

        uint256 expectedRep;
        for (uint256 i = 0; i < numSkills; i++) {
            SkillChain.Level lvl = SkillChain.Level(i % 3);
            string memory skillName = string(
                abi.encodePacked("Skill", vm.toString(i))
            );
            string memory uri = string(
                abi.encodePacked("ipfs://QmFuzz", vm.toString(i))
            );

            vm.prank(issuer1);
            sc.mintSkill(user1, skillName, lvl, uri);

            if (lvl == SkillChain.Level.Beginner) expectedRep += 10;
            if (lvl == SkillChain.Level.Intermediate) expectedRep += 20;
            if (lvl == SkillChain.Level.Advanced) expectedRep += 50;
        }

        assertEq(sc.getReputation(user1), expectedRep);
    }

    function testFuzz_TokenIdMonotonicallyIncreases(uint8 count) public {
        count = uint8(bound(count, 1, 30));

        vm.prank(owner);
        sc.addIssuer(issuer1);

        for (uint256 i = 0; i < count; i++) {
            string memory name = string(
                abi.encodePacked("Skill", vm.toString(i))
            );
            string memory uri = string(
                abi.encodePacked("ipfs://Qm", vm.toString(i))
            );

            vm.prank(issuer1);
            uint256 tokenId = sc.mintSkill(
                user1,
                name,
                SkillChain.Level.Beginner,
                uri
            );
            assertEq(tokenId, i + 1);
        }

        assertEq(sc.totalSupply(), count);
    }

    function testFuzz_NoDuplicateSkillSameUser(string memory skillName) public {
        vm.assume(bytes(skillName).length > 0);
        vm.assume(bytes(skillName).length < 100);

        vm.prank(owner);
        sc.addIssuer(issuer1);

        vm.startPrank(issuer1);
        sc.mintSkill(user1, skillName, SkillChain.Level.Beginner, IPFS_URI_1);

        vm.expectRevert(
            abi.encodeWithSelector(
                SkillChain.DuplicateSkill.selector,
                user1,
                skillName
            )
        );
        sc.mintSkill(user1, skillName, SkillChain.Level.Advanced, IPFS_URI_2);
        vm.stopPrank();
    }

    // ═══════════════════════════════════════════════
    //  8. INVARIANT HELPERS (for invariant test file)
    // ═══════════════════════════════════════════════

    function test_OwnerNeverHoldsTokens() public {
        uint256 tokenId = _mintOneSkill();
        // Owner address is the deployer, not the holder
        assertTrue(sc.ownerOf(tokenId) != owner);
        assertEq(sc.ownerOf(tokenId), user1);
    }

    function test_TokenURIMatchesIPFS() public {
        uint256 tokenId = _mintOneSkill();
        assertEq(sc.tokenURI(tokenId), IPFS_URI_1);
    }

    function test_IssuerRecordedOnToken() public {
        uint256 tokenId = _mintOneSkill();
        (, , address recordedIssuer, , ) = sc.getSkill(tokenId);
        assertEq(recordedIssuer, issuer1);
    }

    // ═══════════════════════════════════════════════
    //  9. GAS BENCHMARKS  (run with --gas-report)
    // ═══════════════════════════════════════════════

    function test_Gas_AddIssuer() public {
        vm.prank(owner);
        sc.addIssuer(issuer1);
    }

    function test_Gas_MintSkill() public {
        vm.prank(owner);
        sc.addIssuer(issuer1);

        vm.prank(issuer1);
        sc.mintSkill(
            user1,
            SKILL_SOLIDITY,
            SkillChain.Level.Advanced,
            IPFS_URI_1
        );
    }

    function test_Gas_GetSkill() public {
        uint256 tokenId = _mintOneSkill();
        sc.getSkill(tokenId);
    }
}
