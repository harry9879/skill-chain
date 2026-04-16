"use client";

import { useAccount, useConnect, useDisconnect } from "wagmi";
import { Zap } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

export function Navbar() {
    const { address, isConnected } = useAccount();
    const { connect, connectors, isPending } = useConnect();
    const { disconnect } = useDisconnect();

    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const shortAddr = address
        ? `${address.slice(0, 6)}…${address.slice(-4)}`
        : "";

    return (
        <nav className="fixed top-0 inset-x-0 z-50 border-b border-[var(--border)] bg-[var(--void)]/80 backdrop-blur-xl">
            <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">

                {/* Logo */}
                <Link href="/" className="flex items-center gap-2 group">
                    <div className="w-8 h-8 bg-[var(--acid)] rounded flex items-center justify-center">
                        <Zap size={16} className="text-[var(--void)] fill-[var(--void)]" />
                    </div>
                    <span className="font-display text-2xl tracking-wider text-white group-hover:text-[var(--acid)] transition-colors">
                        SKILLCHAIN
                    </span>
                </Link>

                {/* Nav links */}
                <div className="hidden md:flex items-center gap-8 text-sm font-medium text-[var(--ghost)]">
                    <Link href="/">Dashboard</Link>
                    <Link href="/mint">Mint Skill</Link>
                    <Link href="/verify">Verify</Link>
                    <Link href="/profile">Profile</Link>
                </div>

                {/* Wallet */}
                <div>
                    {!mounted ? (
                        // 👇 SAME on server + client → fixes hydration
                        <button className="px-5 py-2 rounded bg-[var(--acid)] text-[var(--void)] text-sm font-semibold opacity-50">
                            Loading...
                        </button>
                    ) : isConnected ? (
                        <button
                            onClick={() => disconnect()}
                            className="flex items-center gap-2 px-4 py-2 rounded border border-[var(--border)] text-sm font-mono text-[var(--acid)] hover:border-[var(--acid)] hover:bg-[var(--acid)]/5 transition-all"
                        >
                            <span className="w-2 h-2 rounded-full bg-[var(--acid)] animate-pulse" />
                            <span>{shortAddr}</span>
                        </button>
                    ) : (
                        <button
                            onClick={() => connect({ connector: connectors[0] })}
                            disabled={isPending}
                            className="px-5 py-2 rounded bg-[var(--acid)] text-[var(--void)] text-sm font-semibold hover:opacity-90 transition-all disabled:opacity-50 glow-acid"
                        >
                            <span>{isPending ? "Connecting…" : "Connect Wallet"}</span>
                        </button>
                    )}
                </div>
            </div>
        </nav>
    );
}