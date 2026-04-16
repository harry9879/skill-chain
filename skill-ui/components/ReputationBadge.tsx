"use client";

import { useReadContract } from "wagmi";
import { Sparkles } from "lucide-react";
import { CONTRACT_ADDRESS, SKILLCHAIN_ABI } from "../lib/contract";

interface ReputationBadgeProps {
  address: `0x${string}`;
  large?: boolean;
}

export function ReputationBadge({
  address,
  large = false,
}: ReputationBadgeProps) {
  const { data: rep } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: SKILLCHAIN_ABI,
    functionName: "getReputation",
    args: [address],
  });

  const score = Number(rep ?? 0);

  const tier =
    score >= 200
      ? { label: "Elite", color: "#2563eb", bg: "#dbeafe" }
      : score >= 100
      ? { label: "Expert", color: "#0f766e", bg: "#ccfbf1" }
      : score >= 50
      ? { label: "Pro", color: "#7c3aed", bg: "#ede9fe" }
      : score >= 20
      ? { label: "Rising", color: "#ea580c", bg: "#ffedd5" }
      : { label: "Novice", color: "#64748b", bg: "#f1f5f9" };

  return (
    <div
      className={`inline-flex items-center gap-2 rounded-2xl border ${
        large ? "px-4 py-3" : "px-3 py-2"
      }`}
      style={{
        borderColor: `${tier.color}24`,
        background: tier.bg,
      }}
    >
      <div
        className={`flex items-center justify-center rounded-xl ${
          large ? "h-9 w-9" : "h-7 w-7"
        }`}
        style={{ background: `${tier.color}16` }}
      >
        <Sparkles size={large ? 16 : 13} style={{ color: tier.color }} />
      </div>
      <div className="leading-tight">
        <p
          className={`font-semibold ${
            large ? "text-base" : "text-sm"
          }`}
          style={{ color: tier.color }}
        >
          {score} REP
        </p>
        <p
          className={`font-mono uppercase tracking-[0.16em] ${
            large ? "text-[0.68rem]" : "text-[0.6rem]"
          }`}
          style={{ color: tier.color }}
        >
          {tier.label}
        </p>
      </div>
    </div>
  );
}
