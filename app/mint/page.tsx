"use client";

import { useState } from "react";
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useReadContract } from "wagmi";
import { CONTRACT_ADDRESS, SKILLCHAIN_ABI, LEVEL_LABELS, LEVEL_REP } from "../../lib/contract";
import { Navbar } from "../../components/Navbar";
import { ClientOnly } from "../../components/ClientOnly";
import { CheckCircle, AlertCircle, Loader2, Zap } from "lucide-react";

const LEVEL_OPTIONS = [
    { value: 0, label: "Beginner", rep: 10, color: "#6B7280", desc: "Foundation-level understanding" },
    { value: 1, label: "Intermediate", rep: 20, color: "#3B82F6", desc: "Hands-on working knowledge" },
    { value: 2, label: "Advanced", rep: 50, color: "#C8FF00", desc: "Expert-level mastery" },
];

export default function MintPage() {
    const { address, isConnected } = useAccount();

    const [recipient, setRecipient] = useState("");
    const [skillName, setSkillName] = useState("");
    const [level, setLevel] = useState(0);
    const [tokenURI, setTokenURI] = useState("");

    const { data: isIssuer } = useReadContract({
        address: CONTRACT_ADDRESS,
        abi: SKILLCHAIN_ABI,
        functionName: "isIssuer",
        args: [address as `0x${string}`],
        query: { enabled: !!address },
    });

    const {
        writeContract,
        data: txHash,
        isPending,
        error: writeError,
    } = useWriteContract();

    const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
        hash: txHash,
    });

    const handleMint = async () => {
        if (!recipient || !skillName || !tokenURI) return;

        writeContract({
            address: CONTRACT_ADDRESS,
            abi: SKILLCHAIN_ABI,
            functionName: "mintSkill",
            args: [recipient as `0x${string}`, skillName, level, tokenURI],
        });
    };

    const isLoading = isPending || isConfirming;
    const selectedLevel = LEVEL_OPTIONS[level];

    if (!isConnected) {
        return (
            <div className="min-h-screen">
                <ClientOnly>
                    <Navbar />
                </ClientOnly>
                <div className="flex items-center justify-center min-h-[80vh]">
                    <div className="text-center">
                        <p className="text-[var(--ghost)] mb-4">Connect your wallet to mint credentials</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen">
            <Navbar />

            <main className="max-w-2xl mx-auto px-6 pt-28 pb-16">
                {/* Header */}
                <div className="mb-10 animate-[slideUp_0.3s_ease]">
                    <span className="text-xs font-mono uppercase tracking-[0.3em] text-[var(--acid)]">
                        Issuer Portal
                    </span>
                    <h1 className="font-display text-5xl tracking-wider text-white mt-2">
                        MINT SKILL
                    </h1>
                    <p className="text-[var(--ghost)] mt-2">
                        Issue a soulbound credential to a wallet address.
                    </p>
                </div>

                {/* Issuer check */}
                {address && !isIssuer && (
                    <div className="mb-6 flex items-center gap-3 bg-yellow-500/10 border border-yellow-500/30 rounded-xl px-4 py-3 text-yellow-400 text-sm animate-[fadeIn_0.3s_ease]">
                        <AlertCircle size={16} />
                        <span>
                            Your wallet is not an approved issuer. Contact the contract owner
                            to get issuer rights.
                        </span>
                    </div>
                )}

                {/* Form */}
                <div className="space-y-5 animate-[slideUp_0.4s_ease]">
                    {/* Recipient */}
                    <div>
                        <label className="block text-xs font-mono uppercase tracking-widest text-[var(--ghost)] mb-2">
                            Recipient Address
                        </label>
                        <input
                            type="text"
                            value={recipient}
                            onChange={(e) => setRecipient(e.target.value)}
                            placeholder="0x..."
                            className="w-full bg-[var(--panel)] border border-[var(--border)] rounded-xl px-4 py-3 text-white font-mono text-sm outline-none focus:border-[var(--acid)] transition-colors placeholder:text-[var(--muted)]"
                        />
                    </div>

                    {/* Skill Name */}
                    <div>
                        <label className="block text-xs font-mono uppercase tracking-widest text-[var(--ghost)] mb-2">
                            Skill Name
                        </label>
                        <input
                            type="text"
                            value={skillName}
                            onChange={(e) => setSkillName(e.target.value)}
                            placeholder="e.g. Solidity Development"
                            className="w-full bg-[var(--panel)] border border-[var(--border)] rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-[var(--acid)] transition-colors placeholder:text-[var(--muted)]"
                        />
                    </div>

                    {/* Level */}
                    <div>
                        <label className="block text-xs font-mono uppercase tracking-widest text-[var(--ghost)] mb-2">
                            Proficiency Level
                        </label>
                        <div className="grid grid-cols-3 gap-3">
                            {LEVEL_OPTIONS.map((opt) => (
                                <button
                                    key={opt.value}
                                    onClick={() => setLevel(opt.value)}
                                    className={`relative p-4 rounded-xl border transition-all text-left ${level === opt.value
                                        ? "border-opacity-100"
                                        : "border-[var(--border)] hover:border-[var(--muted)]"
                                        }`}
                                    style={
                                        level === opt.value
                                            ? {
                                                borderColor: opt.color,
                                                background: `${opt.color}0d`,
                                            }
                                            : {}
                                    }
                                >
                                    <p
                                        className="text-sm font-semibold mb-1"
                                        style={{ color: level === opt.value ? opt.color : "white" }}
                                    >
                                        {opt.label}
                                    </p>
                                    <p className="text-[10px] text-[var(--ghost)] leading-tight">
                                        {opt.desc}
                                    </p>
                                    <div className="mt-2 flex items-center gap-1">
                                        <Zap size={10} style={{ color: opt.color, fill: opt.color }} />
                                        <span className="text-[10px] font-mono" style={{ color: opt.color }}>
                                            +{opt.rep}
                                        </span>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Token URI */}
                    <div>
                        <label className="block text-xs font-mono uppercase tracking-widest text-[var(--ghost)] mb-2">
                            IPFS Metadata URI
                        </label>
                        <input
                            type="text"
                            value={tokenURI}
                            onChange={(e) => setTokenURI(e.target.value)}
                            placeholder="ipfs://Qm..."
                            className="w-full bg-[var(--panel)] border border-[var(--border)] rounded-xl px-4 py-3 text-white font-mono text-sm outline-none focus:border-[var(--acid)] transition-colors placeholder:text-[var(--muted)]"
                        />
                        <p className="mt-1.5 text-xs text-[var(--ghost)]">
                            Should point to a JSON object on IPFS with skill metadata
                        </p>
                    </div>

                    {/* Preview */}
                    {skillName && (
                        <div
                            className="rounded-xl border p-4 transition-all animate-[fadeIn_0.3s_ease]"
                            style={{
                                borderColor: `${selectedLevel.color}44`,
                                background: `${selectedLevel.color}08`,
                            }}
                        >
                            <p className="text-xs font-mono text-[var(--ghost)] uppercase tracking-widest mb-2">
                                Preview
                            </p>
                            <p className="font-display text-2xl text-white tracking-wide">
                                {skillName}
                            </p>
                            <p
                                className="text-sm font-mono mt-1"
                                style={{ color: selectedLevel.color }}
                            >
                                {selectedLevel.label} · +{selectedLevel.rep} REP
                            </p>
                        </div>
                    )}

                    {/* Error */}
                    {writeError && (
                        <div className="flex items-start gap-3 bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 text-red-400 text-sm animate-[fadeIn_0.3s_ease]">
                            <AlertCircle size={16} className="mt-0.5 shrink-0" />
                            <span className="break-all">
                                {writeError.message?.split("(")[0] ?? "Transaction failed"}
                            </span>
                        </div>
                    )}

                    {/* Success */}
                    {isSuccess && (
                        <div className="flex items-center gap-3 bg-[var(--acid)]/10 border border-[var(--acid)]/30 rounded-xl px-4 py-3 text-[var(--acid)] text-sm animate-[fadeIn_0.3s_ease]">
                            <CheckCircle size={16} />
                            <span>
                                Credential minted successfully!{" "}
                                <a
                                    href={`https://testnet.bscscan.com/tx/${txHash}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="underline"
                                >
                                    View on Polygonscan
                                </a>
                            </span>
                        </div>
                    )}
                    {/* Submit */}
                    <button
                        onClick={handleMint}
                        disabled={isLoading || !recipient || !skillName || !tokenURI || !isIssuer}
                        className="w-full py-4 rounded-xl bg-[var(--acid)] text-[var(--void)] font-semibold text-base hover:opacity-90 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 glow-acid"
                    >
                        {isLoading ? (
                            <>
                                <Loader2 size={18} className="animate-spin" />
                                {isConfirming ? "Confirming…" : "Waiting for wallet…"}
                            </>
                        ) : (
                            <>
                                <Zap size={18} fill="currentColor" />
                                Mint Credential
                            </>
                        )}
                    </button>
                </div>
            </main>
        </div>
    );
}