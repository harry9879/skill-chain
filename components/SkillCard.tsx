"use client";

import { LEVEL_LABELS, LEVEL_COLORS, LEVEL_REP } from "../lib/contract";
import { Shield, Calendar, User, Hash } from "lucide-react";

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
  const levelColor = LEVEL_COLORS[level] ?? "#6B7280";
  const rep = LEVEL_REP[level] ?? 0;

  const date = new Date(Number(issuedAt) * 1000).toLocaleDateString("en-US", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  const shortIssuer = `${issuer.slice(0, 6)}…${issuer.slice(-4)}`;

  return (
    <div className="relative overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--panel)] p-5 card-hover group">
      {/* Top accent bar */}
      <div
        className="absolute top-0 left-0 right-0 h-[2px]"
        style={{ background: levelColor }}
      />

      {/* Scanline effect on hover */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-500 overflow-hidden rounded-xl">
        <div
          className="absolute left-0 right-0 h-12 opacity-5"
          style={{
            background: `linear-gradient(transparent, ${levelColor}, transparent)`,
            animation: "scanline 2s linear infinite",
          }}
        />
      </div>

      {/* Level badge */}
      <div className="flex items-start justify-between mb-4">
        <span
          className="text-[10px] font-mono font-semibold px-2 py-1 rounded uppercase tracking-widest"
          style={{
            color: levelColor,
            background: `${levelColor}18`,
            border: `1px solid ${levelColor}44`,
          }}
        >
          {levelLabel}
        </span>
        <div className="flex items-center gap-1 text-[var(--ghost)]">
          <Shield size={12} />
          <span className="text-xs font-mono">+{rep} REP</span>
        </div>
      </div>

      {/* Skill name */}
      <h3 className="font-display text-2xl tracking-wide text-white mb-4 leading-tight">
        {name}
      </h3>

      {/* Meta info */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-xs text-[var(--ghost)]">
          <Hash size={11} />
          <span className="font-mono">Token #{tokenId.toString()}</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-[var(--ghost)]">
          <User size={11} />
          <span className="font-mono" title={issuer}>
            {shortIssuer}
          </span>
        </div>
        <div className="flex items-center gap-2 text-xs text-[var(--ghost)]">
          <Calendar size={11} />
          <span>{date}</span>
        </div>
      </div>

      {/* Soulbound indicator */}
      <div className="mt-4 pt-4 border-t border-[var(--border)] flex items-center gap-2">
        <span className="text-[10px] font-mono text-[var(--muted)] uppercase tracking-widest">
          ⬡ Soulbound · Non-transferable
        </span>
      </div>
    </div>
  );
}