"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight, BadgeCheck, Plus, Search, ShieldCheck, Sparkles } from "lucide-react";
import { useAccount, useReadContract } from "wagmi";
import { Navbar } from "../components/Navbar";
import { StatsBar } from "../components/StatsBar";
import { SkillCard } from "../components/SkillCard";
import { ReputationBadge } from "../components/ReputationBadge";
import { CONTRACT_ADDRESS, SKILLCHAIN_ABI } from "../lib/contract";

function UserDashboard({ address }: { address: `0x${string}` }) {
  const { data: tokenIds } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: SKILLCHAIN_ABI,
    functionName: "getUserSkills",
    args: [address],
  });

  const ids = (tokenIds as bigint[] | undefined) ?? [];

  return (
    <div className="space-y-8 animate-[fadeIn_0.45s_ease]">
      <section className="glass-panel rounded-[36px] p-6 sm:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl">
            <span className="section-label mb-4">
              <Sparkles size={12} />
              Wallet dashboard
            </span>
            <h1 className="font-display text-4xl tracking-tight text-[var(--text)] sm:text-5xl">
              Your skills, reputation, and proof all in one place.
            </h1>
            <p className="mt-4 max-w-xl text-base leading-7 text-[var(--muted)]">
              SkillChain turns credentials into clean, verifiable on-chain records
              that are easy to mint, easy to inspect, and hard to fake.
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <div className="rounded-2xl bg-[var(--surface-muted)] px-4 py-3">
                <p className="text-xs font-mono uppercase tracking-[0.18em] text-[var(--muted)]">
                  Connected wallet
                </p>
                <p className="mt-1 font-mono text-sm text-[var(--text)] break-all">
                  {address}
                </p>
              </div>
              <ReputationBadge address={address} large />
            </div>
          </div>

          <div className="grid w-full gap-3 sm:grid-cols-2 lg:max-w-xl">
            <Link
              href="/mint"
              className="primary-button rounded-[28px] px-5 py-5 text-left shadow-[0_18px_40px_rgba(37,99,235,0.2)]"
            >
              <div className="flex w-full items-center justify-between">
                <div>
                  <p className="text-lg font-semibold">Mint a new credential</p>
                  <p className="mt-1 text-sm text-blue-100">
                    Issue a verified skill to a wallet
                  </p>
                </div>
                <Plus size={20} />
              </div>
            </Link>

            <Link
              href="/verify"
              className="secondary-button rounded-[28px] px-5 py-5 text-left"
            >
              <div className="flex w-full items-center justify-between">
                <div>
                  <p className="text-lg font-semibold text-[var(--text)]">
                    Verify any credential
                  </p>
                  <p className="mt-1 text-sm text-[var(--muted)]">
                    Search by token ID or wallet
                  </p>
                </div>
                <Search size={20} className="text-[var(--primary)]" />
              </div>
            </Link>
          </div>
        </div>
      </section>

      <section>
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
              Your credentials
            </p>
            <h2 className="mt-1 font-display text-3xl tracking-tight text-[var(--text)]">
              Portfolio overview
            </h2>
          </div>
          <div className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-[var(--text-soft)] shadow-[0_10px_25px_rgba(15,23,42,0.06)]">
            {ids.length} item{ids.length === 1 ? "" : "s"}
          </div>
        </div>

        {ids.length === 0 ? (
          <div className="soft-panel rounded-[32px] p-10 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-[var(--primary-soft)] text-[var(--primary)]">
              <BadgeCheck size={28} />
            </div>
            <h3 className="mt-5 text-2xl font-semibold text-[var(--text)]">
              No credentials yet
            </h3>
            <p className="mx-auto mt-3 max-w-md text-[var(--muted)]">
              Start by minting your first skill credential and build a profile
              that can be verified instantly.
            </p>
            <Link href="/mint" className="primary-button mt-6 px-6 py-3 text-sm font-semibold">
              Mint your first credential
              <ArrowRight size={16} />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {ids.map((id) => (
              <SkillCardLoader key={id.toString()} tokenId={id} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function SkillCardLoader({ tokenId }: { tokenId: bigint }) {
  const { data, isLoading } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: SKILLCHAIN_ABI,
    functionName: "getSkill",
    args: [tokenId],
  });

  if (isLoading) {
    return <div className="shimmer h-56 rounded-[28px] border border-[var(--border)]" />;
  }

  if (!data) return null;

  const [name, level, issuer, issuedAt, uri] = data as [
    string,
    number,
    `0x${string}`,
    bigint,
    string
  ];

  return (
    <SkillCard
      tokenId={tokenId}
      name={name}
      level={level}
      issuer={issuer}
      issuedAt={issuedAt}
      uri={uri}
    />
  );
}

function LandingHero() {
  const highlights = [
    {
      icon: <ShieldCheck size={18} />,
      title: "Trusted proof",
      text: "Every credential is tied to a wallet and verifiable on-chain.",
    },
    {
      icon: <Plus size={18} />,
      title: "Easy issuing",
      text: "Mint credentials in a simple issuer flow with document uploads.",
    },
    {
      icon: <Search size={18} />,
      title: "Instant lookup",
      text: "Check a token or wallet portfolio in seconds.",
    },
  ];

  return (
    <div className="space-y-10 animate-[fadeIn_0.55s_ease]">
      <section className="relative overflow-hidden rounded-[40px] border border-white/70 bg-white/76 px-6 py-12 shadow-[0_24px_60px_rgba(15,23,42,0.08)] backdrop-blur-xl sm:px-10 lg:px-12">
        <div className="absolute -right-16 top-10 h-44 w-44 rounded-full bg-sky-200/60 blur-3xl" />
        <div className="absolute -left-10 bottom-0 h-36 w-36 rounded-full bg-teal-200/60 blur-3xl" />

        <div className="relative grid items-center gap-10 lg:grid-cols-[1.2fr_0.8fr]">
          <div>
            <span className="section-label">
              <Sparkles size={12} />
              Cleaner credential infrastructure for web3 teams
            </span>

            <h1 className="mt-6 font-display text-5xl leading-none tracking-tight text-[var(--text)] sm:text-6xl lg:text-7xl">
              Make skill credentials feel as trustworthy as the best crypto products.
            </h1>

            <p className="text-balance mt-5 max-w-2xl text-lg leading-8 text-[var(--muted)]">
              SkillChain gives communities, teams, and programs a brighter way to
              issue soulbound proof of skill with a more approachable experience.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/mint" className="primary-button px-7 py-4 text-sm font-semibold">
                Start minting
                <ArrowRight size={17} />
              </Link>
              <Link href="/verify" className="secondary-button px-7 py-4 text-sm font-semibold">
                Explore verification
              </Link>
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              {["Wallet-first", "Soulbound by default", "Verifiable metadata"].map(
                (item) => (
                  <span
                    key={item}
                    className="rounded-full border border-[var(--border)] bg-white/80 px-4 py-2 text-sm font-medium text-[var(--text-soft)]"
                  >
                    {item}
                  </span>
                )
              )}
            </div>
          </div>

          <div className="relative animate-[floatSlow_6s_ease-in-out_infinite]">
            <div className="glass-panel rounded-[32px] p-5">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <p className="text-xs font-mono uppercase tracking-[0.18em] text-[var(--muted)]">
                    Live product snapshot
                  </p>
                  <h2 className="mt-2 text-2xl font-semibold text-[var(--text)]">
                    Friendly, auditable, and wallet-native.
                  </h2>
                </div>
                <div className="rounded-2xl bg-[var(--primary-soft)] px-3 py-2 text-sm font-semibold text-[var(--primary)]">
                  Ready
                </div>
              </div>

              <div className="space-y-3">
                {highlights.map((item) => (
                  <div
                    key={item.title}
                    className="rounded-[24px] border border-[var(--border)] bg-white/88 p-4"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[var(--primary-soft)] text-[var(--primary)]">
                        {item.icon}
                      </div>
                      <div>
                        <p className="font-semibold text-[var(--text)]">{item.title}</p>
                        <p className="text-sm text-[var(--muted)]">{item.text}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {[
          {
            title: "Issuers stay in control",
            text: "Clear minting flows reduce friction for teams issuing verified skills.",
          },
          {
            title: "Holders build reputation",
            text: "Wallets collect credentials and surface reputation in a way people understand.",
          },
          {
            title: "Anyone can verify",
            text: "Token and wallet lookups make validation easy for recruiters, DAOs, and communities.",
          },
        ].map((item) => (
          <div key={item.title} className="soft-panel rounded-[30px] p-6 card-hover">
            <p className="text-xs font-mono uppercase tracking-[0.18em] text-[var(--primary)]">
              Why it works
            </p>
            <h3 className="mt-3 text-2xl font-semibold text-[var(--text)]">
              {item.title}
            </h3>
            <p className="mt-3 text-base leading-7 text-[var(--muted)]">
              {item.text}
            </p>
          </div>
        ))}
      </section>
    </div>
  );
}

export default function Home() {
  const { isConnected, address } = useAccount();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="min-h-screen">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 pb-16 pt-8 sm:px-6 lg:pt-10">
        <div className="animate-[slideUp_0.35s_ease]">
          <StatsBar />
        </div>

        <div className="mt-8">
          {!mounted ? (
            <LandingHero />
          ) : isConnected && address ? (
            <UserDashboard address={address} />
          ) : (
            <LandingHero />
          )}
        </div>
      </main>
    </div>
  );
}
