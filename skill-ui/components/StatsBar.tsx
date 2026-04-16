"use client";

import { useReadContract } from "wagmi";
import { Award, Layers3, ShieldCheck } from "lucide-react";
import { CONTRACT_ADDRESS, SKILLCHAIN_ABI } from "../lib/contract";

export function StatsBar() {
  const { data: totalSupply } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: SKILLCHAIN_ABI,
    functionName: "totalSupply",
  });

  const stats = [
    {
      icon: <Layers3 size={18} />,
      label: "Credentials minted",
      value: totalSupply?.toString() ?? "--",
      hint: "Live on-chain supply",
    },
    {
      icon: <ShieldCheck size={18} />,
      label: "Credential model",
      value: "Soulbound NFT",
      hint: "Non-transferable by design",
    },
    {
      icon: <Award size={18} />,
      label: "Contract",
      value: `${CONTRACT_ADDRESS.slice(0, 6)}...${CONTRACT_ADDRESS.slice(-4)}`,
      hint: "Publicly verifiable address",
      mono: true,
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="soft-panel rounded-[28px] px-5 py-5 card-hover"
        >
          <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--primary-soft)] text-[var(--primary)]">
            {stat.icon}
          </div>
          <p className="text-xs font-mono uppercase tracking-[0.18em] text-[var(--muted)]">
            {stat.label}
          </p>
          <p
            className={`mt-2 text-xl font-semibold text-[var(--text)] ${
              stat.mono ? "font-mono text-base sm:text-lg" : ""
            }`}
          >
            {stat.value}
          </p>
          <p className="mt-1 text-sm text-[var(--muted)]">{stat.hint}</p>
        </div>
      ))}
    </div>
  );
}
