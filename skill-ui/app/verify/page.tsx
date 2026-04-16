"use client";

import Link from "next/link";
import { useState } from "react";
import { useReadContract } from "wagmi";
import {
  CheckCircle2,
  ChevronRight,
  ExternalLink,
  Search,
  ShieldCheck,
  XCircle,
} from "lucide-react";
import { Navbar } from "../../components/Navbar";
import {
  CONTRACT_ADDRESS,
  LEVEL_COLORS,
  LEVEL_LABELS,
  LEVEL_REP,
  SKILLCHAIN_ABI,
} from "../../lib/contract";
import { ipfsToHttp } from "../../lib/ipfs";

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
    return <div className="shimmer h-72 rounded-[32px] border border-[var(--border)]" />;
  }

  if (error || !data) {
    return (
      <div className="rounded-[32px] border border-rose-200 bg-rose-50 p-8">
        <div className="flex items-center gap-3 text-rose-700">
          <XCircle size={20} />
          <h3 className="text-lg font-semibold">Credential not found</h3>
        </div>
        <p className="mt-2 text-sm text-rose-600">
          No on-chain credential exists for token ID #{tokenId.toString()}.
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
    <div className="glass-panel overflow-hidden rounded-[32px]">
      <div className="flex flex-wrap items-center gap-3 border-b border-[var(--border)] bg-[var(--primary-soft)]/60 px-6 py-4">
        <CheckCircle2 size={18} className="text-[var(--primary)]" />
        <span className="font-semibold text-[var(--primary-strong)]">
          Credential verified
        </span>
        <span className="ml-auto rounded-full bg-white px-3 py-1 text-xs font-mono text-[var(--text-soft)]">
          #{tokenId.toString()}
        </span>
      </div>

      <div className="space-y-6 p-6">
        <div>
          <div
            className="inline-flex rounded-full px-3 py-1 text-[11px] font-mono uppercase tracking-[0.16em]"
            style={{
              color: levelColor,
              background: `${levelColor}12`,
              border: `1px solid ${levelColor}22`,
            }}
          >
            {levelLabel} - +{rep} REP
          </div>
          <h2 className="mt-4 font-display text-4xl tracking-tight text-[var(--text)]">
            {name}
          </h2>
          <p className="mt-3 text-base leading-7 text-[var(--muted)]">
            Publicly visible proof with a permanent, wallet-bound ownership record.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {[
            { label: "Token owner", value: owner as string, mono: true },
            { label: "Issued by", value: issuer, mono: true },
            { label: "Issued at", value: date, mono: false },
            { label: "Metadata JSON", value: uri, mono: true, link: ipfsToHttp(uri) },
          ].map((item) => (
            <div
              key={item.label}
              className="rounded-[24px] border border-[var(--border)] bg-white p-4"
            >
              <p className="text-xs font-mono uppercase tracking-[0.16em] text-[var(--muted)]">
                {item.label}
              </p>
              {item.link ? (
                <a
                  href={item.link}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-2 inline-flex break-all text-sm font-mono text-[var(--primary)] hover:underline"
                >
                  {item.value.length > 34
                    ? `${item.value.slice(0, 26)}...${item.value.slice(-6)}`
                    : item.value}
                  <ExternalLink size={13} className="ml-1 mt-0.5 shrink-0" />
                </a>
              ) : (
                <p
                  className={`mt-2 break-all text-sm text-[var(--text)] ${
                    item.mono ? "font-mono" : ""
                  }`}
                >
                  {item.value}
                </p>
              )}
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <Link
            href={`/verify/skill/${tokenId.toString()}`}
            className="primary-button px-5 py-3 text-sm font-semibold"
          >
            Open full credential
            <ChevronRight size={16} />
          </Link>
          <div className="secondary-button px-5 py-3 text-sm font-medium">
            <ShieldCheck size={16} className="text-[var(--primary)]" />
            Soulbound to {(owner as string)?.slice(0, 6)}...
            {(owner as string)?.slice(-4)}
          </div>
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
      <div className="mt-4 space-y-3">
        {[1, 2, 3].map((item) => (
          <div key={item} className="shimmer h-20 rounded-[24px] border border-[var(--border)]" />
        ))}
      </div>
    );
  }

  return (
    <div className="mt-5 animate-[fadeIn_0.35s_ease]">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-[var(--text)]">
            {ids.length} credential{ids.length === 1 ? "" : "s"} found
          </p>
          <p className="text-sm text-[var(--muted)]">
            Reputation score: {rep?.toString() ?? "0"} REP
          </p>
        </div>
        <span className="rounded-full bg-[var(--primary-soft)] px-4 py-2 text-sm font-semibold text-[var(--primary)]">
          Wallet view
        </span>
      </div>

      {ids.length === 0 ? (
        <div className="rounded-[28px] border border-dashed border-[var(--border-strong)] bg-white/70 p-10 text-center text-[var(--muted)]">
          This wallet does not have any credentials yet.
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
    <Link href={`/verify/skill/${tokenId.toString()}`} className="block">
      <div className="card-hover flex items-center justify-between rounded-[24px] border border-[var(--border)] bg-white px-5 py-4 shadow-[0_10px_26px_rgba(15,23,42,0.05)]">
        <div className="flex items-center gap-3">
          <span
            className="h-3 w-3 rounded-full"
            style={{ background: levelColor }}
          />
          <div>
            <p className="font-semibold text-[var(--text)]">{name}</p>
            <p className="text-sm text-[var(--muted)]">{levelLabel}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="font-mono text-xs text-[var(--muted)]">
            #{tokenId.toString()}
          </span>
          <ChevronRight size={16} className="text-[var(--primary)]" />
        </div>
      </div>
    </Link>
  );
}

export default function VerifyPage() {
  const [mode, setMode] = useState<"token" | "wallet">("token");
  const [tokenInput, setTokenInput] = useState("");
  const [walletInput, setWalletInput] = useState("");
  const [tokenId, setTokenId] = useState<bigint | null>(null);
  const [walletAddr, setWalletAddr] = useState("");

  const handleTokenSearch = () => {
    const value = Number(tokenInput);
    if (!Number.isNaN(value) && value > 0) {
      setTokenId(BigInt(value));
    }
  };

  const handleWalletSearch = () => {
    if (walletInput.startsWith("0x") && walletInput.length === 42) {
      setWalletAddr(walletInput);
    }
  };

  return (
    <div className="min-h-screen">
      <Navbar />

      <main className="mx-auto max-w-5xl px-4 pb-16 pt-8 sm:px-6">
        <section className="mb-8">
          <span className="section-label">Verification</span>
          <h1 className="mt-5 font-display text-5xl tracking-tight text-[var(--text)] sm:text-6xl">
            Verify a token or explore a wallet portfolio.
          </h1>
          <p className="mt-4 max-w-3xl text-lg leading-8 text-[var(--muted)]">
            This page makes credential checking feel simple and credible, whether
            you are validating one token or reviewing an entire wallet history.
          </p>
        </section>

        <section className="glass-panel rounded-[36px] p-6 sm:p-8">
          <div className="mb-6 inline-flex rounded-full border border-[var(--border)] bg-white/80 p-1">
            {(["token", "wallet"] as const).map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setMode(item)}
                className={`rounded-full px-5 py-2.5 text-sm font-semibold transition-all ${
                  mode === item
                    ? "bg-[var(--primary)] text-white shadow-[0_10px_22px_rgba(37,99,235,0.2)]"
                    : "text-[var(--text-soft)]"
                }`}
              >
                {item === "token" ? "Search by token" : "Search by wallet"}
              </button>
            ))}
          </div>

          {mode === "token" ? (
            <div className="animate-[fadeIn_0.3s_ease]">
              <div className="mb-6 flex flex-col gap-3 sm:flex-row">
                <input
                  type="number"
                  value={tokenInput}
                  onChange={(e) => setTokenInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleTokenSearch()}
                  placeholder="Enter token ID"
                  className="input-shell flex-1 px-4 py-3 text-sm font-mono"
                />
                <button
                  type="button"
                  onClick={handleTokenSearch}
                  className="primary-button px-5 py-3 text-sm font-semibold"
                >
                  <Search size={16} />
                  Verify token
                </button>
              </div>

              {tokenId !== null && <TokenVerifier tokenId={tokenId} />}
            </div>
          ) : (
            <div className="animate-[fadeIn_0.3s_ease]">
              <div className="mb-6 flex flex-col gap-3 sm:flex-row">
                <input
                  type="text"
                  value={walletInput}
                  onChange={(e) => setWalletInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleWalletSearch()}
                  placeholder="0x..."
                  className="input-shell flex-1 px-4 py-3 text-sm font-mono"
                />
                <button
                  type="button"
                  onClick={handleWalletSearch}
                  className="primary-button px-5 py-3 text-sm font-semibold"
                >
                  <Search size={16} />
                  Lookup wallet
                </button>
              </div>

              {walletAddr && <WalletCredentials address={walletAddr} />}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
