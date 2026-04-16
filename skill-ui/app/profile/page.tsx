"use client";

import { useEffect, useState } from "react";
import { useAccount, useReadContract } from "wagmi";
import {
  CheckCheck,
  Copy,
  ExternalLink,
  Hash,
  ShieldCheck,
  Sparkles,
  User,
} from "lucide-react";
import { ClientOnly } from "../../components/ClientOnly";
import { Navbar } from "../../components/Navbar";
import { ReputationBadge } from "../../components/ReputationBadge";
import {
  CONTRACT_ADDRESS,
  LEVEL_COLORS,
  LEVEL_LABELS,
  SKILLCHAIN_ABI,
} from "../../lib/contract";

function shortAddr(addr: string) {
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  return (
    <button
      type="button"
      onClick={() => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }}
      className="rounded-xl border border-[var(--border)] bg-white p-2 text-[var(--muted)] transition-colors hover:text-[var(--text)]"
    >
      {copied ? <CheckCheck size={14} /> : <Copy size={14} />}
    </button>
  );
}

function SkillRow({ tokenId }: { tokenId: bigint }) {
  const { data } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: SKILLCHAIN_ABI,
    functionName: "getSkill",
    args: [tokenId],
  });

  if (!data) return null;

  const [name, level, issuer, issuedAt] = data as [
    string,
    number,
    `0x${string}`,
    bigint,
    string
  ];

  const date = new Date(Number(issuedAt) * 1000).toLocaleDateString("en-US", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  return (
    <div className="card-hover rounded-[28px] border border-[var(--border)] bg-white p-5 shadow-[0_10px_26px_rgba(15,23,42,0.05)]">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div
            className="inline-flex rounded-full px-3 py-1 text-[11px] font-mono uppercase tracking-[0.16em]"
            style={{
              color: LEVEL_COLORS[level],
              background: `${LEVEL_COLORS[level]}12`,
              border: `1px solid ${LEVEL_COLORS[level]}22`,
            }}
          >
            {LEVEL_LABELS[level]}
          </div>
          <h3 className="mt-3 text-xl font-semibold text-[var(--text)]">{name}</h3>
          <p className="mt-2 text-sm text-[var(--muted)]">
            Issued on {date} by {shortAddr(issuer)}
          </p>
        </div>

        <div className="rounded-2xl bg-[var(--surface-muted)] px-4 py-3 text-right">
          <p className="text-xs font-mono uppercase tracking-[0.16em] text-[var(--muted)]">
            Token
          </p>
          <p className="mt-1 font-mono text-sm text-[var(--text)]">
            #{tokenId.toString()}
          </p>
        </div>
      </div>
    </div>
  );
}

function ProfileContent({ address }: { address: `0x${string}` }) {
  const { data: tokenIds } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: SKILLCHAIN_ABI,
    functionName: "getUserSkills",
    args: [address],
  });

  const { data: rep } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: SKILLCHAIN_ABI,
    functionName: "getReputation",
    args: [address],
  });

  const { data: isIssuerRaw } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: SKILLCHAIN_ABI,
    functionName: "isIssuer",
    args: [address],
  });

  const ids = (tokenIds as bigint[] | undefined) ?? [];
  const reputation = (rep as bigint | undefined) ?? BigInt(0);
  const isIssuer = Boolean(isIssuerRaw);

  const statItems = [
    { label: "Credentials", value: ids.length.toString() },
    { label: "Reputation", value: `${reputation.toString()} REP` },
    { label: "Role", value: isIssuer ? "Approved issuer" : "Holder" },
  ];

  return (
    <div className="space-y-8 animate-[fadeIn_0.4s_ease]">
      <section className="glass-panel rounded-[36px] p-6 sm:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <span className="section-label">
              <Sparkles size={12} />
              Wallet identity
            </span>
            <h2 className="mt-5 font-display text-4xl tracking-tight text-[var(--text)] sm:text-5xl">
              Your on-chain profile, cleaned up and easy to scan.
            </h2>
            <div className="mt-5 flex flex-wrap items-center gap-3">
              <div className="rounded-[24px] bg-white px-4 py-3 shadow-[0_10px_26px_rgba(15,23,42,0.05)]">
                <p className="text-xs font-mono uppercase tracking-[0.16em] text-[var(--muted)]">
                  Wallet
                </p>
                <p className="mt-1 break-all font-mono text-sm text-[var(--text)]">
                  {address}
                </p>
              </div>
              <CopyButton text={address} />
              <ReputationBadge address={address} large />
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3 lg:w-[420px] lg:grid-cols-1">
            {statItems.map((item) => (
              <div
                key={item.label}
                className="rounded-[24px] border border-[var(--border)] bg-white px-5 py-4 shadow-[0_10px_26px_rgba(15,23,42,0.05)]"
              >
                <p className="text-xs font-mono uppercase tracking-[0.16em] text-[var(--muted)]">
                  {item.label}
                </p>
                <p className="mt-2 text-lg font-semibold text-[var(--text)]">
                  {item.value}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.25fr_0.75fr]">
        <section>
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-mono uppercase tracking-[0.16em] text-[var(--muted)]">
                Credential timeline
              </p>
              <h3 className="mt-1 text-3xl font-semibold text-[var(--text)]">
                Portfolio history
              </h3>
            </div>
            <div className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-[var(--text-soft)] shadow-[0_10px_25px_rgba(15,23,42,0.05)]">
              {ids.length} total
            </div>
          </div>

          {ids.length === 0 ? (
            <div className="rounded-[32px] border border-dashed border-[var(--border-strong)] bg-white/70 p-12 text-center">
              <p className="text-lg font-semibold text-[var(--text)]">
                No credentials yet
              </p>
              <p className="mt-2 text-[var(--muted)]">
                Mint a credential to start building this profile.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {ids.map((id) => (
                <SkillRow key={id.toString()} tokenId={id} />
              ))}
            </div>
          )}
        </section>

        <aside className="space-y-6">
          <div className="soft-panel rounded-[32px] p-6">
            <p className="text-xs font-mono uppercase tracking-[0.16em] text-[var(--primary)]">
              Profile summary
            </p>
            <div className="mt-4 space-y-4">
              {[
                {
                  icon: <ShieldCheck size={16} />,
                  text: isIssuer
                    ? "This wallet is allowed to issue new credentials."
                    : "This wallet currently holds credentials as a recipient.",
                },
                {
                  icon: <Hash size={16} />,
                  text: "Each credential stays attached to the wallet and remains publicly verifiable.",
                },
                {
                  icon: <User size={16} />,
                  text: "The profile view is meant to be easier for teammates, recruiters, and communities to scan.",
                },
              ].map((item) => (
                <div key={item.text} className="flex items-start gap-3">
                  <div className="mt-1 flex h-8 w-8 items-center justify-center rounded-2xl bg-[var(--primary-soft)] text-[var(--primary)]">
                    {item.icon}
                  </div>
                  <p className="text-sm leading-6 text-[var(--text-soft)]">
                    {item.text}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="soft-panel rounded-[32px] p-6">
            <p className="text-xs font-mono uppercase tracking-[0.16em] text-[var(--primary)]">
              Contract reference
            </p>
            <p className="mt-3 font-mono text-sm text-[var(--text)]">
              {shortAddr(CONTRACT_ADDRESS)}
            </p>
            <a
              href={`https://testnet.bscscan.com/address/${CONTRACT_ADDRESS}`}
              target="_blank"
              rel="noreferrer"
              className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-[var(--primary)] hover:underline"
            >
              Open contract explorer
              <ExternalLink size={14} />
            </a>
          </div>
        </aside>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  const { isConnected, address } = useAccount();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="min-h-screen">
      <ClientOnly>
        <Navbar />
      </ClientOnly>

      <main className="mx-auto max-w-7xl px-4 pb-16 pt-8 sm:px-6">
        <section className="mb-8">
          <span className="section-label">Profile</span>
          <h1 className="mt-5 font-display text-5xl tracking-tight text-[var(--text)] sm:text-6xl">
            A lighter view of your skill reputation.
          </h1>
          <p className="mt-4 max-w-3xl text-lg leading-8 text-[var(--muted)]">
            The profile page now focuses on readability first so wallet identity,
            reputation, and credentials are easier to understand at a glance.
          </p>
        </section>

        {!mounted ? (
          <div className="space-y-4">
            {[1, 2, 3].map((item) => (
              <div key={item} className="shimmer h-24 rounded-[28px] border border-[var(--border)]" />
            ))}
          </div>
        ) : !isConnected || !address ? (
          <div className="glass-panel rounded-[36px] p-12 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-[var(--primary-soft)] text-[var(--primary)]">
              <User size={28} />
            </div>
            <h2 className="mt-6 text-3xl font-semibold text-[var(--text)]">
              No wallet connected
            </h2>
            <p className="mt-3 text-base leading-7 text-[var(--muted)]">
              Connect your wallet from the top-right action to view the profile dashboard.
            </p>
          </div>
        ) : (
          <ProfileContent address={address} />
        )}
      </main>
    </div>
  );
}
