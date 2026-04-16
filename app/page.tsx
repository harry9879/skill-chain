"use client";

import { useAccount, useReadContract } from "wagmi";
import { CONTRACT_ADDRESS, SKILLCHAIN_ABI } from "../lib/contract";
import { Navbar } from "../components/Navbar";
import { StatsBar } from "../components/StatsBar";
import { SkillCard } from "../components/SkillCard";
import { ReputationBadge } from "../components/ReputationBadge";
import Link from "next/link";
import { ArrowRight, Plus, Search } from "lucide-react";
import { useState, useEffect } from "react";


function UserDashboard({ address }: { address: `0x${string}` }) {
    const { data: tokenIds } = useReadContract({
        address: CONTRACT_ADDRESS,
        abi: SKILLCHAIN_ABI,
        functionName: "getUserSkills",
        args: [address],
    });

    const ids = (tokenIds as bigint[] | undefined) ?? [];

    return (
        <div className="space-y-6 animate-[fadeIn_0.5s_ease]">
            {/* Welcome strip */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[var(--panel)] border border-[var(--border)] rounded-xl p-5">
                <div>
                    <p className="text-xs font-mono text-[var(--ghost)] uppercase tracking-widest mb-1">
                        Connected Wallet
                    </p>
                    <p className="font-mono text-sm text-white">{address}</p>
                </div>
                <ReputationBadge address={address} large />
            </div>

            {/* Actions */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Link
                    href="/mint"
                    className="flex items-center justify-between bg-[var(--acid)] text-[var(--void)] rounded-xl px-5 py-4 font-semibold hover:opacity-90 transition-all group glow-acid"
                >
                    <span>Mint New Skill</span>
                    <Plus size={20} className="group-hover:rotate-90 transition-transform" />
                </Link>
                <Link
                    href="/verify"
                    className="flex items-center justify-between bg-[var(--panel)] border border-[var(--border)] text-white rounded-xl px-5 py-4 font-semibold hover:border-[var(--acid)] transition-all group"
                >
                    <span>Verify Credential</span>
                    <Search size={18} className="text-[var(--ghost)] group-hover:text-[var(--acid)] transition-colors" />
                </Link>
            </div>

            {/* Skills grid */}
            <div>
                <div className="flex items-center justify-between mb-4">
                    <h2 className="font-display text-2xl tracking-wide">
                        YOUR CREDENTIALS
                        <span className="ml-2 text-base font-mono font-normal text-[var(--ghost)]">
                            ({ids.length})
                        </span>
                    </h2>
                </div>

                {ids.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-[var(--border)] p-12 text-center">
                        <p className="text-[var(--ghost)] mb-3">No credentials yet</p>
                        <Link
                            href="/mint"
                            className="text-[var(--acid)] text-sm font-medium hover:opacity-80 transition-opacity"
                        >
                            Mint your first skill →
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {ids.map((id) => (
                            <SkillCardLoader key={id.toString()} tokenId={id} />
                        ))}
                    </div>
                )}
            </div>
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
        return (
            <div className="rounded-xl border border-[var(--border)] bg-[var(--panel)] p-5 h-48 shimmer" />
        );
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
    return (
        <div className="min-h-[80vh] flex flex-col items-center justify-center text-center px-4 animate-[fadeIn_0.6s_ease]">
            {/* Glow orb */}
            <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-[var(--acid)] opacity-[0.04] blur-[100px] pointer-events-none" />

            <div className="relative z-10">
                <span className="inline-block text-xs font-mono uppercase tracking-[0.3em] text-[var(--acid)] mb-6 px-3 py-1 rounded border border-[var(--acid)]/30 bg-[var(--acid)]/5">
                    Soulbound · On-Chain · Verifiable
                </span>

                <h1 className="font-display text-7xl sm:text-9xl tracking-wider text-white mb-4 text-glow">
                    SKILL
                    <br />
                    <span className="text-[var(--acid)]">CHAIN</span>
                </h1>

                <p className="text-[var(--ghost)] max-w-md mx-auto mb-10 text-lg leading-relaxed">
                    Decentralised skill credentials. Permanently tied to your wallet.
                    Impossible to fake. Impossible to transfer.
                </p>

                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Link
                        href="/mint"
                        className="flex items-center justify-center gap-2 px-8 py-3 bg-[var(--acid)] text-[var(--void)] rounded-xl font-semibold hover:opacity-90 transition-all glow-acid"
                    >
                        Get Started
                        <ArrowRight size={18} />
                    </Link>
                    <Link
                        href="/verify"
                        className="px-8 py-3 border border-[var(--border)] text-white rounded-xl font-semibold hover:border-[var(--acid)] transition-all"
                    >
                        Verify a Credential
                    </Link>
                </div>
            </div>
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

            <main className="max-w-7xl mx-auto px-6 pt-24 pb-16">
                {/* Stats always visible */}
                <div className="mb-8 animate-[slideUp_0.4s_ease]">
                    <StatsBar />
                </div>

                {!mounted ? (
                    <LandingHero />
                ) : isConnected && address ? (
                    <UserDashboard address={address} />
                ) : (
                    <LandingHero />
                )}
            </main>
        </div>
    );
}