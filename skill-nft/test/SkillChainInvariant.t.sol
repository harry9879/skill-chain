// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Test} from "forge-std/Test.sol";
import {SkillChain} from "../src/SkillChain.sol";

/**
 * @title  SkillChainInvariantTest
 * @notice Invariant / stateful fuzz tests.
 *         Foundry will call handler functions in random order with random inputs
 *         and check all invariant_ functions after every call.
 *
 *  Run: forge test --match-contract SkillChainInvariantTest -vvv
 */
contract SkillChainHandler is Test {
    SkillChain public sc;

    address public owner   = makeAddr("owner");
    address public issuer  = makeAddr("issuer");
    address public user1   = makeAddr("user1");
    address public user2   = makeAddr("user2");

    uint256 public mintCount;
    uint256 public totalRepExpected;

    string[] private _skillNames = [
        "Solidity", "React", "Python", "Rust", "Go",
        "TypeScript", "IPFS", "ZK-Proofs", "DeFi", "GraphQL"
    ];

    mapping(address => mapping(string => bool)) private _minted;

    constructor() {
        vm.prank(owner);
        sc = new SkillChain();

        vm.prank(owner);
        sc.addIssuer(issuer);
    }

    function mintSkill(uint8 userSeed, uint8 skillSeed, uint8 levelSeed) external {
        address user      = userSeed % 2 == 0 ? user1 : user2;
        string memory skill = _skillNames[skillSeed % _skillNames.length];
        SkillChain.Level lvl = SkillChain.Level(levelSeed % 3);

        if (_minted[user][skill]) return; // skip duplicate

        string memory uri = string(abi.encodePacked("ipfs://Qm", vm.toString(mintCount)));

        vm.prank(issuer);
        sc.mintSkill(user, skill, lvl, uri);

        _minted[user][skill] = true;
        mintCount++;

        if (lvl == SkillChain.Level.Beginner)     totalRepExpected += 10;
        if (lvl == SkillChain.Level.Intermediate) totalRepExpected += 20;
        if (lvl == SkillChain.Level.Advanced)     totalRepExpected += 50;
    }
}

contract SkillChainInvariantTest is Test {
    SkillChainHandler public handler;

    function setUp() public {
        handler = new SkillChainHandler();
        targetContract(address(handler));
    }

    /// @dev Total supply always equals handler's mint count
    function invariant_TotalSupplyMatchesMintCount() public view {
        assertEq(handler.sc().totalSupply(), handler.mintCount());
    }

    /// @dev Reputation across both users always equals expected total
    function invariant_ReputationSumCorrect() public view {
        uint256 rep1 = handler.sc().getReputation(handler.user1());
        uint256 rep2 = handler.sc().getReputation(handler.user2());
        assertEq(rep1 + rep2, handler.totalRepExpected());
    }

    /// @dev Issuer address always remains approved
    function invariant_IssuerRemainsApproved() public view {
        assertTrue(handler.sc().isIssuer(handler.issuer()));
    }

    /// @dev Token IDs start at 1 and are strictly sequential
    function invariant_TokenIdsAreSequential() public view {
        uint256 supply = handler.sc().totalSupply();
        for (uint256 i = 1; i <= supply; i++) {
            assertTrue(handler.sc().ownerOf(i) != address(0));
        }
    }
}
