"use client";

import { useReadContract } from "wagmi";
import { CONTRACT_ADDRESS, SKILLCHAIN_ABI } from "../lib/contract";
import { Zap } from "lucide-react";

interface ReputationBadgeProps {
  address: `0x${string}`;
  large?: boolean;
}

export function ReputationBadge({ address, large = false }: ReputationBadgeProps) {
  const { data: rep } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: SKILLCHAIN_ABI,
    functionName: "getReputation",
    args: [address],
  });

  const score = Number(rep ?? 0);

  const tier =
    score >= 200
      ? { label: "Elite", color: "#C8FF00" }
      : score >= 100
      ? { label: "Expert", color: "#A78BFA" }
      : score >= 50
      ? { label: "Pro", color: "#60A5FA" }
      : score >= 20
      ? { label: "Rising", color: "#34D399" }
      : { label: "Novice", color: "#6B7280" };

  return (
    <div
      className={`flex items-center gap-2 ${
        large ? "px-4 py-2" : "px-3 py-1"
      } rounded-lg border`}
      style={{
        borderColor: `${tier.color}44`,
        background: `${tier.color}0d`,
      }}
    >
      <Zap
        size={large ? 16 : 13}
        style={{ color: tier.color, fill: tier.color }}
      />
      <span
        className={`font-mono font-semibold ${large ? "text-base" : "text-xs"}`}
        style={{ color: tier.color }}
      >
        {score} REP
      </span>
      <span
        className={`font-mono uppercase tracking-widest ${
          large ? "text-xs" : "text-[10px]"
        } opacity-60`}
        style={{ color: tier.color }}
      >
        · {tier.label}
      </span>
    </div>
  );
}