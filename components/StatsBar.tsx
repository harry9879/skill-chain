"use client";

import { useReadContract } from "wagmi";
import { CONTRACT_ADDRESS, SKILLCHAIN_ABI } from "../lib/contract";
import { Layers, Award, Users } from "lucide-react";

export function StatsBar() {
  const { data: totalSupply } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: SKILLCHAIN_ABI,
    functionName: "totalSupply",
  });

  const stats = [
    {
      icon: <Layers size={16} />,
      label: "Total Credentials",
      value: totalSupply?.toString() ?? "—",
    },
    {
      icon: <Award size={16} />,
      label: "Contract",
      value: `${CONTRACT_ADDRESS.slice(0, 6)}…${CONTRACT_ADDRESS.slice(-4)}`,
      mono: true,
    },
    {
      icon: <Users size={16} />,
      label: "Network",
      value: "polygon",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {stats.map((s, i) => (
        <div
          key={i}
          className="flex items-center gap-3 bg-[var(--panel)] border border-[var(--border)] rounded-xl px-4 py-3"
        >
          <div className="text-[var(--acid)]">{s.icon}</div>
          <div>
            <p className="text-[10px] uppercase tracking-widest text-[var(--ghost)] font-mono">
              {s.label}
            </p>
            <p
              className={`text-sm font-semibold text-white ${
                s.mono ? "font-mono" : ""
              }`}
            >
              {s.value}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}