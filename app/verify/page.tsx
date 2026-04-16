"use client";

import { useState } from "react";
import { useReadContract } from "wagmi";
import { CONTRACT_ADDRESS, SKILLCHAIN_ABI, LEVEL_LABELS, LEVEL_COLORS, LEVEL_REP } from "../../lib/contract";
import { Navbar } from "../../components/Navbar";
import { Search, Shield, CheckCircle, XCircle, ExternalLink } from "lucide-react";

function TokenVerifier({ tokenId }: { tokenId: bigint }) {
  const { data, isLoading, error } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: SKILLCHAIN_ABI,
    functionName: "getSkill",
    args: [tokenId],
  });

  const { data: owner } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: SKILLCHAIN_ABI,
    functionName: "ownerOf",
    args: [tokenId],
  });

  if (isLoading) {
    return (
      <div className="rounded-xl border border-[var(--border)] bg-[var(--panel)] p-6 shimmer h-64 animate-[fadeIn_0.3s_ease]" />
    );
  }

  if (error || !data) {
    return (
      <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-6 animate-[fadeIn_0.3s_ease]">
        <div className="flex items-center gap-3 text-red-400 mb-2">
          <XCircle size={20} />
          <h3 className="font-semibold">Token Not Found</h3>
        </div>
        <p className="text-sm text-red-400/70">
          No credential exists for token ID #{tokenId.toString()}
        </p>
      </div>
    );
  }

  const [name, level, issuer, issuedAt, uri] = data as [
    string,
    number,
    `0x${string}`,
    bigint,
    string
  ];

  const levelLabel = LEVEL_LABELS[level];
  const levelColor = LEVEL_COLORS[level];
  const rep = LEVEL_REP[level];

  const date = new Date(Number(issuedAt) * 1000).toLocaleString("en-US", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="rounded-xl border border-[var(--acid)]/30 bg-[var(--panel)] overflow-hidden animate-[slideUp_0.4s_ease]">
      {/* Valid header */}
      <div className="bg-[var(--acid)]/10 border-b border-[var(--acid)]/20 px-6 py-4 flex items-center gap-3">
        <CheckCircle size={20} className="text-[var(--acid)]" />
        <span className="font-semibold text-[var(--acid)]">
          Valid Credential Verified
        </span>
        <span className="ml-auto text-xs font-mono text-[var(--ghost)]">
          #{tokenId.toString()}
        </span>
      </div>

      <div className="p-6 space-y-5">
        {/* Skill name + level */}
        <div>
          <div
            className="inline-block text-[10px] font-mono px-2 py-1 rounded mb-2 uppercase tracking-widest"
            style={{
              color: levelColor,
              background: `${levelColor}18`,
              border: `1px solid ${levelColor}44`,
            }}
          >
            {levelLabel} · +{rep} REP
          </div>
          <h2 className="font-display text-3xl tracking-wide text-white">
            {name}
          </h2>
        </div>

        {/* Details grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            { label: "Token Owner", value: owner as string, mono: true },
            { label: "Issued By", value: issuer, mono: true },
            { label: "Issued At", value: date, mono: false },
            {
              label: "Metadata URI",
              value: uri,
              mono: true,
              link: uri.startsWith("ipfs://")
                ? `https://ipfs.io/ipfs/${uri.slice(7)}`
                : uri,
            },
          ].map((item) => (
            <div
              key={item.label}
              className="bg-[var(--slate)] rounded-lg p-3 border border-[var(--border)]"
            >
              <p className="text-[10px] font-mono uppercase tracking-widest text-[var(--ghost)] mb-1">
                {item.label}
              </p>
              {item.link ? (
                <a
                  href={item.link}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs font-mono text-[var(--acid)] hover:opacity-80 flex items-center gap-1 break-all"
                >
                  {item.value.length > 30
                    ? `${item.value.slice(0, 20)}…${item.value.slice(-8)}`
                    : item.value}
                  <ExternalLink size={10} />
                </a>
              ) : (
                <p
                  className={`text-sm text-white break-all ${
                    item.mono ? "font-mono text-xs" : ""
                  }`}
                >
                  {item.value}
                </p>
              )}
            </div>
          ))}
        </div>

        {/* Soulbound badge */}
        <div className="flex items-center gap-2 text-xs font-mono text-[var(--muted)]">
          <Shield size={13} />
          <span>
            Soulbound — permanently tied to {(owner as string)?.slice(0, 6)}…
            {(owner as string)?.slice(-4)}
          </span>
        </div>
      </div>
    </div>
  );
}

function WalletCredentials({ address }: { address: string }) {
  const { data: tokenIds, isLoading } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: SKILLCHAIN_ABI,
    functionName: "getUserSkills",
    args: [address as `0x${string}`],
  });

  const { data: rep } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: SKILLCHAIN_ABI,
    functionName: "getReputation",
    args: [address as `0x${string}`],
  });

  const ids = (tokenIds as bigint[] | undefined) ?? [];

  if (isLoading) {
    return (
      <div className="space-y-3 mt-4">
        {[1, 2].map((i) => (
          <div
            key={i}
            className="h-16 rounded-xl border border-[var(--border)] shimmer"
          />
        ))}
      </div>
    );
  }

  return (
    <div className="mt-4 animate-[fadeIn_0.4s_ease]">
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm text-[var(--ghost)]">
          {ids.length} credential{ids.length !== 1 ? "s" : ""} found
        </p>
        <span className="text-xs font-mono text-[var(--acid)]">
          {rep?.toString() ?? "0"} REP
        </span>
      </div>

      {ids.length === 0 ? (
        <div className="rounded-xl border border-dashed border-[var(--border)] p-8 text-center text-[var(--ghost)] text-sm">
          This wallet has no credentials
        </div>
      ) : (
        <div className="space-y-3">
          {ids.map((id) => (
            <SingleSkillRow key={id.toString()} tokenId={id} />
          ))}
        </div>
      )}
    </div>
  );
}

function SingleSkillRow({ tokenId }: { tokenId: bigint }) {
  const { data } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: SKILLCHAIN_ABI,
    functionName: "getSkill",
    args: [tokenId],
  });

  if (!data) return null;

  const [name, level] = data as [string, number, `0x${string}`, bigint, string];
  const levelColor = LEVEL_COLORS[level];
  const levelLabel = LEVEL_LABELS[level];

  return (
    <div className="flex items-center justify-between bg-[var(--panel)] border border-[var(--border)] rounded-xl px-4 py-3">
      <div className="flex items-center gap-3">
        <span
          className="w-2 h-2 rounded-full"
          style={{ background: levelColor }}
        />
        <span className="text-sm font-medium text-white">{name}</span>
      </div>
      <div className="flex items-center gap-3">
        <span
          className="text-[10px] font-mono uppercase"
          style={{ color: levelColor }}
        >
          {levelLabel}
        </span>
        <span className="text-xs font-mono text-[var(--ghost)]">
          #{tokenId.toString()}
        </span>
      </div>
    </div>
  );
}

export default function VerifyPage() {
  const [mode, setMode] = useState<"token" | "wallet">("token");
  const [tokenInput, setTokenInput] = useState("");
  const [walletInput, setWalletInput] = useState("");
  const [tokenId, setTokenId] = useState<bigint | null>(null);
  const [walletAddr, setWalletAddr] = useState("");

  const handleTokenSearch = () => {
    const id = parseInt(tokenInput);
    if (!isNaN(id) && id > 0) setTokenId(BigInt(id));
  };

  const handleWalletSearch = () => {
    if (walletInput.startsWith("0x") && walletInput.length === 42)
      setWalletAddr(walletInput);
  };

  return (
    <div className="min-h-screen">
      <Navbar />

      <main className="max-w-2xl mx-auto px-6 pt-28 pb-16">
        <div className="mb-10 animate-[slideUp_0.3s_ease]">
          <span className="text-xs font-mono uppercase tracking-[0.3em] text-[var(--acid)]">
            On-Chain Verification
          </span>
          <h1 className="font-display text-5xl tracking-wider text-white mt-2">
            VERIFY
          </h1>
          <p className="text-[var(--ghost)] mt-2">
            Verify credentials by token ID or lookup a wallet's portfolio.
          </p>
        </div>

        {/* Mode toggle */}
        <div className="flex bg-[var(--panel)] border border-[var(--border)] rounded-xl p-1 mb-6 animate-[slideUp_0.35s_ease]">
          {(["token", "wallet"] as const).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all capitalize ${
                mode === m
                  ? "bg-[var(--acid)] text-[var(--void)]"
                  : "text-[var(--ghost)] hover:text-white"
              }`}
            >
              By {m === "token" ? "Token ID" : "Wallet"}
            </button>
          ))}
        </div>

        {/* Token ID search */}
        {mode === "token" && (
          <div className="animate-[fadeIn_0.3s_ease]">
            <div className="flex gap-2 mb-6">
              <input
                type="number"
                value={tokenInput}
                onChange={(e) => setTokenInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleTokenSearch()}
                placeholder="Enter token ID (e.g. 1)"
                className="flex-1 bg-[var(--panel)] border border-[var(--border)] rounded-xl px-4 py-3 text-white font-mono text-sm outline-none focus:border-[var(--acid)] transition-colors placeholder:text-[var(--muted)]"
              />
              <button
                onClick={handleTokenSearch}
                className="px-5 py-3 bg-[var(--acid)] text-[var(--void)] rounded-xl font-semibold hover:opacity-90 transition-all flex items-center gap-2"
              >
                <Search size={16} />
                Verify
              </button>
            </div>
            {tokenId !== null && <TokenVerifier tokenId={tokenId} />}
          </div>
        )}

        {/* Wallet search */}
        {mode === "wallet" && (
          <div className="animate-[fadeIn_0.3s_ease]">
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={walletInput}
                onChange={(e) => setWalletInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleWalletSearch()}
                placeholder="0x..."
                className="flex-1 bg-[var(--panel)] border border-[var(--border)] rounded-xl px-4 py-3 text-white font-mono text-sm outline-none focus:border-[var(--acid)] transition-colors placeholder:text-[var(--muted)]"
              />
              <button
                onClick={handleWalletSearch}
                className="px-5 py-3 bg-[var(--acid)] text-[var(--void)] rounded-xl font-semibold hover:opacity-90 transition-all flex items-center gap-2"
              >
                <Search size={16} />
                Lookup
              </button>
            </div>
            {walletAddr && <WalletCredentials address={walletAddr} />}
          </div>
        )}
      </main>
    </div>
  );
}