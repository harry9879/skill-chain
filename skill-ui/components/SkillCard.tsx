"use client";

import { Calendar, Hash, Shield, User } from "lucide-react";
import { LEVEL_COLORS, LEVEL_LABELS, LEVEL_REP } from "../lib/contract";

interface SkillCardProps {
  tokenId: bigint;
  name: string;
  level: number;
  issuer: string;
  issuedAt: bigint;
  uri?: string;
}

export function SkillCard({
  tokenId,
  name,
  level,
  issuer,
  issuedAt,
}: SkillCardProps) {
  const levelLabel = LEVEL_LABELS[level] ?? "Unknown";
  const levelColor = LEVEL_COLORS[level] ?? "#64748b";
  const rep = LEVEL_REP[level] ?? 0;

  const date = new Date(Number(issuedAt) * 1000).toLocaleDateString("en-US", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  const shortIssuer = `${issuer.slice(0, 6)}...${issuer.slice(-4)}`;

  return (
    <div className="card-hover relative overflow-hidden rounded-[28px] border border-[var(--border)] bg-white p-5 shadow-[0_18px_40px_rgba(15,23,42,0.06)]">
      <div
        className="absolute inset-x-0 top-0 h-1"
        style={{
          background: `linear-gradient(90deg, ${levelColor}, rgba(255,255,255,0.9))`,
        }}
      />

      <div className="mb-5 flex items-start justify-between gap-4">
        <div
          className="rounded-full px-3 py-1 text-[11px] font-mono uppercase tracking-[0.16em]"
          style={{
            color: levelColor,
            background: `${levelColor}12`,
            border: `1px solid ${levelColor}28`,
          }}
        >
          {levelLabel}
        </div>

        <div className="rounded-full bg-[var(--surface-muted)] px-3 py-1 text-xs font-semibold text-[var(--text-soft)]">
          +{rep} REP
        </div>
      </div>

      <h3 className="font-display text-2xl tracking-tight text-[var(--text)]">
        {name}
      </h3>
      <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
        Verifiable credential stored on-chain and tied permanently to its owner.
      </p>

      <div className="mt-5 space-y-2.5 rounded-2xl bg-[var(--surface-muted)] p-4">
        <div className="flex items-center gap-2 text-sm text-[var(--text-soft)]">
          <Hash size={14} />
          <span className="font-mono">Token #{tokenId.toString()}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-[var(--text-soft)]">
          <User size={14} />
          <span className="font-mono" title={issuer}>
            {shortIssuer}
          </span>
        </div>
        <div className="flex items-center gap-2 text-sm text-[var(--text-soft)]">
          <Calendar size={14} />
          <span>{date}</span>
        </div>
      </div>

      <div className="mt-5 flex items-center gap-2 text-xs font-mono uppercase tracking-[0.16em] text-[var(--muted)]">
        <Shield size={13} />
        <span>Soulbound credential</span>
      </div>
    </div>
  );
}
