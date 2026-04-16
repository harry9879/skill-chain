"use client";

import { useAccount, useConnect, useDisconnect } from "wagmi";
import { Menu, Wallet, Zap } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/mint", label: "Mint" },
  { href: "/verify", label: "Verify" },
  { href: "/profile", label: "Profile" },
];

export function Navbar() {
  const { address, isConnected } = useAccount();
  const { connect, connectors, isPending } = useConnect();
  const { disconnect } = useDisconnect();

  const [mounted, setMounted] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const shortAddr = useMemo(
    () => (address ? `${address.slice(0, 6)}...${address.slice(-4)}` : ""),
    [address]
  );

  return (
    <nav className="sticky top-0 z-50 border-b border-[var(--border)] bg-white/72 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex h-18 min-h-[72px] items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-[var(--primary)] to-sky-400 text-white shadow-[0_12px_30px_rgba(37,99,235,0.24)]">
              <Zap size={18} />
            </div>
            <div>
              <p className="font-display text-xl tracking-tight text-[var(--text)]">
                SkillChain
              </p>
              <p className="text-xs text-[var(--muted)]">
                On-chain credentials made simple
              </p>
            </div>
          </Link>

          <div className="hidden md:flex items-center gap-2 rounded-full border border-[var(--border)] bg-white/80 p-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-full px-4 py-2 text-sm font-medium text-[var(--text-soft)] transition-colors hover:bg-[var(--bg-strong)] hover:text-[var(--text)]"
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setMobileOpen((value) => !value)}
              className="md:hidden flex h-11 w-11 items-center justify-center rounded-2xl border border-[var(--border)] bg-white/80 text-[var(--text)]"
              aria-label="Toggle menu"
            >
              <Menu size={18} />
            </button>

            {!mounted ? (
              <button className="primary-button px-5 py-3 text-sm font-semibold opacity-60">
                Loading...
              </button>
            ) : isConnected ? (
              <button
                onClick={() => disconnect()}
                className="secondary-button px-4 py-3 text-sm font-semibold"
              >
                <span className="flex h-2.5 w-2.5 rounded-full bg-[var(--success)]" />
                <span className="font-mono text-[var(--text)]">{shortAddr}</span>
              </button>
            ) : (
              <button
                onClick={() => connectors[0] && connect({ connector: connectors[0] })}
                disabled={isPending || connectors.length === 0}
                className="primary-button px-5 py-3 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Wallet size={16} />
                <span>{isPending ? "Connecting..." : "Connect Wallet"}</span>
              </button>
            )}
          </div>
        </div>

        {mobileOpen && (
          <div className="md:hidden pb-4">
            <div className="glass-panel rounded-3xl p-3">
              <div className="grid grid-cols-2 gap-2">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className="rounded-2xl border border-[var(--border)] bg-white/80 px-4 py-3 text-center text-sm font-medium text-[var(--text-soft)]"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
