// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;
import {ERC721} from "lib/openzeppelin-contracts/contracts/token/ERC721/ERC721.sol";
import {ERC721URIStorage} from "lib/openzeppelin-contracts/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import {Ownable} from "lib/openzeppelin-contracts/contracts/access/Ownable.sol";

/**
 * @title  SkillChain
 * @author SkillChain Team
 * @notice Decentralised Skill Credentialing Platform.
 *         Trusted issuers mint non-transferable (soulbound) ERC-721 NFTs.
 *         Metadata is stored on IPFS. Reputation accrues per wallet.
 *
 * Architecture
 * ─────────────────────────────────────────────────────────
 *  Owner  ──addIssuer/revokeIssuer──► Issuer Registry
 *  Issuer ──mintSkill──────────────► Token (Soulbound NFT)
 *                                    └─ IPFS metadata URI
 *                                    └─ Reputation update
 *  Anyone ──getSkill / verify──────► Read on-chain data
 * ─────────────────────────────────────────────────────────
 *
 * Security properties
 *  • Only approved issuers can mint
 *  • Tokens are non-transferable after mint (soulbound)
 *  • No duplicate skill per wallet (hasSkill guard)
 *  • Owner cannot rug issuers mid-flight (events are emitted)
 */
contract SkillChain is ERC721URIStorage, Ownable {
    // ─────────────────────────────────────────────────────────
    //  TYPES
    // ─────────────────────────────────────────────────────────

    /// @notice Skill proficiency levels
    enum Level {
        Beginner, // 0 → +10 reputation
        Intermediate, // 1 → +20 reputation
        Advanced // 2 → +50 reputation
    }

    /// @notice On-chain skill record stored per token
    struct Skill {
        string name; // Human-readable skill name
        Level level; // Proficiency level
        address issuer; // Who minted this credential
        uint256 issuedAt; // block.timestamp at mint
    }

    // ─────────────────────────────────────────────────────────
    //  CONSTANTS
    // ─────────────────────────────────────────────────────────

    uint256 public constant REP_BEGINNER = 10;
    uint256 public constant REP_INTERMEDIATE = 20;
    uint256 public constant REP_ADVANCED = 50;

    // ─────────────────────────────────────────────────────────
    //  STATE
    // ─────────────────────────────────────────────────────────

    /// @dev Auto-incrementing token ID counter (starts at 1)
    uint256 private _nextTokenId;

    /// @notice Full skill metadata per token
    mapping(uint256 => Skill) public skills;

    /// @notice All token IDs held by a user
    mapping(address => uint256[]) public userSkills;

    /// @notice Whether an address is an approved issuer
    mapping(address => bool) public isIssuer;

    /// @notice Cumulative reputation score per wallet
    mapping(address => uint256) public reputation;

    /// @notice Prevents the same skill being minted twice to the same wallet
    /// @dev    mapping(holder => mapping(skillName => alreadyMinted))
    mapping(address => mapping(string => bool)) public hasSkill;

    // ─────────────────────────────────────────────────────────
    //  ERRORS  (gas-efficient custom errors)
    // ─────────────────────────────────────────────────────────

    error NotIssuer(address caller);
    error AlreadyIssuer(address issuer);
    error NotAnIssuer(address issuer);
    error ZeroAddress();
    error EmptySkillName();
    error DuplicateSkill(address holder, string skillName);
    error Soulbound(uint256 tokenId);
    error TokenNotFound(uint256 tokenId);

    // ─────────────────────────────────────────────────────────
    //  EVENTS
    // ─────────────────────────────────────────────────────────

    event IssuerAdded(address indexed issuer);
    event IssuerRevoked(address indexed issuer);

    event SkillMinted(
        uint256 indexed tokenId,
        address indexed recipient,
        string skillName,
        Level level,
        address indexed issuer,
        string tokenURI
    );

    // ─────────────────────────────────────────────────────────
    //  MODIFIERS
    // ─────────────────────────────────────────────────────────

    modifier onlyIssuer() {
        if (!isIssuer[msg.sender]) revert NotIssuer(msg.sender);
        _;
    }

    // ─────────────────────────────────────────────────────────
    //  CONSTRUCTOR
    // ─────────────────────────────────────────────────────────

    constructor() ERC721("SkillChain Credential", "SKILL") Ownable(msg.sender) {
        _nextTokenId = 1;
    }

    // ─────────────────────────────────────────────────────────
    //  ISSUER MANAGEMENT
    // ─────────────────────────────────────────────────────────

    /**
     * @notice Grant issuer rights to an address.
     * @dev    Only callable by the contract owner (admin).
     * @param  _issuer Address to approve as an issuer.
     */
    function addIssuer(address _issuer) external onlyOwner {
        if (_issuer == address(0)) revert ZeroAddress();
        if (isIssuer[_issuer]) revert AlreadyIssuer(_issuer);

        isIssuer[_issuer] = true;
        emit IssuerAdded(_issuer);
    }

    /**
     * @notice Revoke issuer rights from an address.
     * @dev    Already-minted tokens remain valid after revocation.
     * @param  _issuer Address to revoke.
     */
    function revokeIssuer(address _issuer) external onlyOwner {
        if (!isIssuer[_issuer]) revert NotAnIssuer(_issuer);

        isIssuer[_issuer] = false;
        emit IssuerRevoked(_issuer);
    }

    // ─────────────────────────────────────────────────────────
    //  CORE — MINT
    // ─────────────────────────────────────────────────────────

    /**
     * @notice Mint a soulbound skill NFT to a recipient.
     * @dev    Caller must be an approved issuer.
     *         The IPFS URI should point to a JSON object conforming to:
     *         { "skill": string, "level": string, "issuer": string,
     *           "timestamp": number, "soulbound": true }
     *
     * @param  _to        Recipient wallet address.
     * @param  _skillName Human-readable skill name (e.g. "Solidity Development").
     * @param  _level     Proficiency level (0=Beginner, 1=Intermediate, 2=Advanced).
     * @param  _tokenURI  IPFS URI for the credential metadata JSON.
     * @return tokenId    The newly minted token ID.
     */
    function mintSkill(
        address _to,
        string calldata _skillName,
        Level _level,
        string calldata _tokenURI
    ) external onlyIssuer returns (uint256 tokenId) {
        if (_to == address(0)) revert ZeroAddress();
        if (bytes(_skillName).length == 0) revert EmptySkillName();
        if (hasSkill[_to][_skillName]) revert DuplicateSkill(_to, _skillName);

        // Assign token ID and advance counter
        tokenId = _nextTokenId++;

        // Mint + set IPFS URI
        _safeMint(_to, tokenId);
        _setTokenURI(tokenId, _tokenURI);

        // Persist skill data on-chain
        skills[tokenId] = Skill({
            name: _skillName,
            level: _level,
            issuer: msg.sender,
            issuedAt: block.timestamp
        });

        // Track user's portfolio
        userSkills[_to].push(tokenId);

        // Anti-duplicate guard
        hasSkill[_to][_skillName] = true;

        // Award reputation
        reputation[_to] += _reputationFor(_level);

        emit SkillMinted(
            tokenId,
            _to,
            _skillName,
            _level,
            msg.sender,
            _tokenURI
        );
    }

    // ─────────────────────────────────────────────────────────
    //  SOULBOUND — BLOCK ALL TRANSFERS
    // ─────────────────────────────────────────────────────────

    /**
     * @dev Override _update (OZ v5) to block every transfer except the
     *      initial mint (from == address(0)).
     *      This makes every token permanently non-transferable.
     */
    function _update(
        address to,
        uint256 tokenId,
        address auth
    ) internal override returns (address) {
        address from = _ownerOf(tokenId);
        if (from != address(0)) revert Soulbound(tokenId);
        return super._update(to, tokenId, auth);
    }

    // ─────────────────────────────────────────────────────────
    //  VIEW / QUERY
    // ─────────────────────────────────────────────────────────

    /**
     * @notice Fetch complete skill data for a token.
     * @param  _tokenId Token to query.
     * @return name     Skill name.
     * @return level    Proficiency level.
     * @return issuer   Issuer address.
     * @return issuedAt Block timestamp at mint.
     * @return uri      IPFS metadata URI.
     */
    function getSkill(
        uint256 _tokenId
    )
        external
        view
        returns (
            string memory name,
            Level level,
            address issuer,
            uint256 issuedAt,
            string memory uri
        )
    {
        if (_ownerOf(_tokenId) == address(0)) revert TokenNotFound(_tokenId);
        Skill storage s = skills[_tokenId];
        return (s.name, s.level, s.issuer, s.issuedAt, tokenURI(_tokenId));
    }

    /**
     * @notice Return all token IDs owned by a wallet.
     * @param  _user Wallet to query.
     */
    function getUserSkills(
        address _user
    ) external view returns (uint256[] memory) {
        return userSkills[_user];
    }

    /**
     * @notice Return the reputation score of a wallet.
     * @param  _user Wallet to query.
     */
    function getReputation(address _user) external view returns (uint256) {
        return reputation[_user];
    }

    /**
     * @notice Total number of credentials ever minted.
     */
    function totalSupply() external view returns (uint256) {
        return _nextTokenId - 1;
    }

    // ─────────────────────────────────────────────────────────
    //  INTERNAL HELPERS
    // ─────────────────────────────────────────────────────────

    /// @dev Returns reputation points for a given level.
    function _reputationFor(Level _level) internal pure returns (uint256) {
        if (_level == Level.Beginner) return REP_BEGINNER;
        if (_level == Level.Intermediate) return REP_INTERMEDIATE;
        return REP_ADVANCED;
    }
}
