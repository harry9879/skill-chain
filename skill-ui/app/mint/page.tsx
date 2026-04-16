"use client";

import { useRef, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  FileText,
  Link2,
  Loader2,
  ShieldCheck,
  Upload,
  Wallet,
  X,
  Zap,
} from "lucide-react";
import {
  useAccount,
  useReadContract,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi";
import { Navbar } from "../../components/Navbar";
import { CONTRACT_ADDRESS, SKILLCHAIN_ABI } from "../../lib/contract";
import { ipfsToHttp } from "../../lib/ipfs";

const LEVEL_OPTIONS = [
  {
    value: 0,
    label: "Beginner",
    rep: 10,
    color: "#64748b",
    desc: "Foundation-level understanding for early contributors.",
  },
  {
    value: 1,
    label: "Intermediate",
    rep: 20,
    color: "#2563eb",
    desc: "Reliable working knowledge with proven delivery.",
  },
  {
    value: 2,
    label: "Advanced",
    rep: 50,
    color: "#0f766e",
    desc: "High-signal expertise with strong credential value.",
  },
] as const;

type UploadResult = {
  cid: string;
  ipfsUri: string;
  gatewayUrl: string;
  name: string;
  mimeType: string | null;
};

async function uploadToPinata(file: File, name = file.name): Promise<UploadResult> {
  const formData = new FormData();
  formData.append("file", file, file.name || name);
  formData.append("name", name);

  const response = await fetch("/api/pinata", {
    method: "POST",
    body: formData,
  });

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(payload?.error ?? "Pinata upload failed. Please try again.");
  }

  return payload as UploadResult;
}

async function pinMetadataToPinata(metadata: object): Promise<UploadResult> {
  const blob = new Blob([JSON.stringify(metadata, null, 2)], {
    type: "application/json",
  });
  const file = new File([blob], "skill-metadata.json", {
    type: "application/json",
  });

  return uploadToPinata(file, "skill-metadata.json");
}

export default function MintPage() {
  const { address, isConnected } = useAccount();

  const [recipient, setRecipient] = useState("");
  const [skillName, setSkillName] = useState("");
  const [level, setLevel] = useState(0);
  const [tokenURI, setTokenURI] = useState("");
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadedMetadataUri, setUploadedMetadataUri] = useState<string | null>(null);
  const [uploadedMetadataUrl, setUploadedMetadataUrl] = useState<string | null>(null);
  const [uploadedDocumentUrl, setUploadedDocumentUrl] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const selectedLevel = LEVEL_OPTIONS[level];
  const isLoading = isPending || isConfirming;

  const handleFileUpload = async (file: File) => {
    if (!file) return;

    setUploadedFile(file);
    setUploadError(null);
    setUploadedMetadataUri(null);
    setUploadedMetadataUrl(null);
    setUploadedDocumentUrl(null);
    setIsUploading(true);

    try {
      const documentUpload = await uploadToPinata(file);
      const levelLabel = LEVEL_OPTIONS[level].label;
      const isImage = file.type.startsWith("image/");
      const metadata = {
        name: skillName || file.name,
        description: `Skill credential document: ${file.name}`,
        document: documentUpload.ipfsUri,
        documentUrl: documentUpload.gatewayUrl,
        external_url: documentUpload.gatewayUrl,
        image: isImage ? documentUpload.ipfsUri : undefined,
        animation_url: !isImage ? documentUpload.gatewayUrl : undefined,
        fileName: file.name,
        mimeType: file.type || null,
        level: levelLabel,
        uploadedAt: new Date().toISOString(),
        attributes: [
          { trait_type: "Level", value: levelLabel },
          { trait_type: "File Name", value: file.name },
          { trait_type: "MIME Type", value: file.type || "unknown" },
        ],
      };
      const metadataUpload = await pinMetadataToPinata(metadata);

      setUploadedMetadataUri(metadataUpload.ipfsUri);
      setUploadedMetadataUrl(metadataUpload.gatewayUrl);
      setUploadedDocumentUrl(documentUpload.gatewayUrl);
      setTokenURI(metadataUpload.ipfsUri);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Upload failed. Please try again.";
      setUploadError(message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFileUpload(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFileUpload(file);
  };

  const clearFile = () => {
    setUploadedFile(null);
    setUploadedMetadataUri(null);
    setUploadedMetadataUrl(null);
    setUploadedDocumentUrl(null);
    setUploadError(null);
    setTokenURI("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleMint = () => {
    if (!recipient || !skillName || !tokenURI) return;

    writeContract({
      address: CONTRACT_ADDRESS,
      abi: SKILLCHAIN_ABI,
      functionName: "mintSkill",
      args: [recipient as `0x${string}`, skillName, level, tokenURI],
    });
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <main className="mx-auto flex max-w-3xl items-center justify-center px-4 py-24 sm:px-6">
          <div className="glass-panel w-full rounded-[36px] p-10 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-[var(--primary-soft)] text-[var(--primary)]">
              <Wallet size={28} />
            </div>
            <h1 className="mt-6 text-3xl font-semibold text-[var(--text)]">
              Connect your wallet to issue a credential
            </h1>
            <p className="mt-3 text-base leading-7 text-[var(--muted)]">
              The mint flow is available only to connected wallets, and approved
              issuers can create soulbound credentials from this page.
            </p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navbar />

      <main className="mx-auto max-w-7xl px-4 pb-16 pt-8 sm:px-6">
        <section className="mb-8">
          <span className="section-label">Issuer portal</span>
          <h1 className="mt-5 font-display text-5xl tracking-tight text-[var(--text)] sm:text-6xl">
            Mint a clean, verifiable skill credential.
          </h1>
          <p className="mt-4 max-w-3xl text-lg leading-8 text-[var(--muted)]">
            Upload supporting proof, select a credibility level, and issue a
            soulbound credential that feels more polished and easier to trust.
          </p>
        </section>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <section className="glass-panel rounded-[36px] p-6 sm:p-8">
            {address && !isIssuer && (
              <div className="mb-6 rounded-[24px] border border-amber-200 bg-amber-50 px-4 py-4 text-sm text-amber-700">
                <div className="flex items-start gap-3">
                  <AlertCircle size={18} className="mt-0.5 shrink-0" />
                  <p>
                    This wallet is connected, but it is not currently approved as
                    an issuer. Ask the contract owner to grant issuer access before
                    minting.
                  </p>
                </div>
              </div>
            )}

            <div className="space-y-6">
              <div>
                <label className="mb-2 block text-xs font-mono uppercase tracking-[0.18em] text-[var(--muted)]">
                  Recipient wallet
                </label>
                <input
                  type="text"
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                  placeholder="0x..."
                  className="input-shell px-4 py-3 font-mono text-sm"
                />
              </div>

              <div>
                <label className="mb-2 block text-xs font-mono uppercase tracking-[0.18em] text-[var(--muted)]">
                  Skill title
                </label>
                <input
                  type="text"
                  value={skillName}
                  onChange={(e) => setSkillName(e.target.value)}
                  placeholder="Solidity Development"
                  className="input-shell px-4 py-3 text-sm"
                />
              </div>

              <div>
                <label className="mb-3 block text-xs font-mono uppercase tracking-[0.18em] text-[var(--muted)]">
                  Credential level
                </label>
                <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                  {LEVEL_OPTIONS.map((option) => {
                    const active = level === option.value;
                    return (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => setLevel(option.value)}
                        className="rounded-[24px] border p-4 text-left transition-all"
                        style={{
                          borderColor: active ? `${option.color}55` : "var(--border)",
                          background: active ? `${option.color}10` : "rgba(255,255,255,0.86)",
                          boxShadow: active
                            ? `0 16px 34px ${option.color}18`
                            : "none",
                        }}
                      >
                        <p
                          className="text-base font-semibold"
                          style={{ color: active ? option.color : "var(--text)" }}
                        >
                          {option.label}
                        </p>
                        <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                          {option.desc}
                        </p>
                        <p
                          className="mt-3 text-xs font-mono uppercase tracking-[0.16em]"
                          style={{ color: option.color }}
                        >
                          +{option.rep} REP
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="mb-3 block text-xs font-mono uppercase tracking-[0.18em] text-[var(--muted)]">
                  Upload credential proof
                </label>

                {!uploadedFile ? (
                  <div
                    onDragOver={(e) => {
                      e.preventDefault();
                      setIsDragging(true);
                    }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className="cursor-pointer rounded-[28px] border-2 border-dashed px-6 py-10 text-center transition-all"
                    style={{
                      borderColor: isDragging
                        ? "rgba(37, 99, 235, 0.45)"
                        : "rgba(148, 163, 184, 0.28)",
                      background: isDragging
                        ? "rgba(219, 234, 254, 0.85)"
                        : "rgba(255, 255, 255, 0.84)",
                    }}
                  >
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-3xl bg-[var(--primary-soft)] text-[var(--primary)]">
                      <Upload size={24} />
                    </div>
                    <h3 className="mt-4 text-xl font-semibold text-[var(--text)]">
                      Drop a file here or click to browse
                    </h3>
                    <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                      Supports PDF, image, JSON, and general proof files up to 100 MB.
                    </p>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="*/*"
                      className="hidden"
                      onChange={handleFileChange}
                    />
                  </div>
                ) : (
                  <div className="rounded-[28px] border border-[var(--border)] bg-white p-5 shadow-[0_12px_32px_rgba(15,23,42,0.06)]">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--primary-soft)] text-[var(--primary)]">
                          <FileText size={18} />
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-[var(--text)]">
                            {uploadedFile.name}
                          </p>
                          <p className="text-xs text-[var(--muted)]">
                            {(uploadedFile.size / 1024).toFixed(1)} KB
                          </p>
                        </div>
                      </div>

                      {!isUploading && (
                        <button
                          type="button"
                          onClick={clearFile}
                          className="rounded-xl border border-[var(--border)] bg-white p-2 text-[var(--muted)] transition-colors hover:text-[var(--text)]"
                        >
                          <X size={14} />
                        </button>
                      )}
                    </div>

                    <div className="mt-4 space-y-2">
                      {isUploading && (
                        <div className="flex items-center gap-2 text-sm text-[var(--primary)]">
                          <Loader2 size={15} className="animate-spin" />
                          Uploading the proof file and its public metadata to IPFS...
                        </div>
                      )}

                      {uploadError && (
                        <div className="flex items-start gap-2 text-sm text-[var(--danger)]">
                          <AlertCircle size={15} className="mt-0.5 shrink-0" />
                          <span>{uploadError}</span>
                        </div>
                      )}

                      {uploadedMetadataUri && !isUploading && (
                        <div className="rounded-2xl bg-[var(--surface-muted)] px-4 py-3">
                          <div className="flex items-start gap-2 text-sm text-[var(--success)]">
                            <CheckCircle2 size={15} className="mt-0.5 shrink-0" />
                            <div className="w-full">
                              <p className="font-semibold">Metadata uploaded successfully</p>
                              <p className="mt-1 break-all font-mono text-xs text-[var(--text-soft)]">
                                {uploadedMetadataUri}
                              </p>
                              <div className="mt-3 flex flex-wrap gap-3 text-xs font-semibold">
                                {uploadedMetadataUrl && (
                                  <a
                                    href={uploadedMetadataUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-[var(--primary)] underline"
                                  >
                                    Open metadata JSON
                                  </a>
                                )}
                                {uploadedDocumentUrl && (
                                  <a
                                    href={uploadedDocumentUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-[var(--primary)] underline"
                                  >
                                    Open public document
                                  </a>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="mb-2 flex items-center gap-2 text-xs font-mono uppercase tracking-[0.18em] text-[var(--muted)]">
                  <Link2 size={12} />
                  Metadata URI
                </label>
                <input
                  type="text"
                  value={tokenURI}
                  onChange={(e) => setTokenURI(e.target.value)}
                  placeholder="ipfs://metadata-cid"
                  className="input-shell px-4 py-3 font-mono text-sm"
                />
                <p className="mt-2 text-sm text-[var(--muted)]">
                  This should stay as the NFT metadata JSON URI. The actual certificate file is stored
                  inside that metadata and is exposed as a separate public document link.
                </p>
                {tokenURI && (
                  <a
                    href={ipfsToHttp(tokenURI)}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-[var(--primary)] hover:underline"
                  >
                    Open current metadata JSON
                  </a>
                )}
              </div>

              {writeError && (
                <div className="rounded-[24px] border border-rose-200 bg-rose-50 px-4 py-4 text-sm text-rose-700">
                  <div className="flex items-start gap-3">
                    <AlertCircle size={18} className="mt-0.5 shrink-0" />
                    <span>{writeError.message?.split("(")[0] ?? "Transaction failed."}</span>
                  </div>
                </div>
              )}

              {isSuccess && (
                <div className="rounded-[24px] border border-emerald-200 bg-emerald-50 px-4 py-4 text-sm text-emerald-700">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 size={18} className="mt-0.5 shrink-0" />
                    <div>
                      <p className="font-semibold">Credential minted successfully.</p>
                      <div className="mt-2 flex flex-wrap gap-3">
                        {txHash && tokenURI && (
                          <a
                            href={ipfsToHttp(tokenURI)}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 underline"
                          >
                            Open uploaded metadata
                          </a>
                        )}
                        {uploadedDocumentUrl && (
                          <a
                            href={uploadedDocumentUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 underline"
                          >
                            Open uploaded document
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <button
                type="button"
                onClick={handleMint}
                disabled={
                  isLoading ||
                  !recipient ||
                  !skillName ||
                  !tokenURI ||
                  !isIssuer ||
                  isUploading
                }
                className="primary-button w-full px-6 py-4 text-base font-semibold disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isLoading ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    {isConfirming ? "Confirming on-chain..." : "Waiting for wallet..."}
                  </>
                ) : (
                  <>
                    <Zap size={18} />
                    Mint credential
                  </>
                )}
              </button>
            </div>
          </section>

          <aside className="space-y-6">
            <div className="soft-panel rounded-[32px] p-6">
              <p className="text-xs font-mono uppercase tracking-[0.18em] text-[var(--primary)]">
                Live preview
              </p>
              <h2 className="mt-3 text-2xl font-semibold text-[var(--text)]">
                What the holder will receive
              </h2>
              <div
                className="mt-5 rounded-[28px] border p-5"
                style={{
                  borderColor: `${selectedLevel.color}2e`,
                  background: `${selectedLevel.color}0d`,
                }}
              >
                <p className="text-xs font-mono uppercase tracking-[0.18em] text-[var(--muted)]">
                  Credential title
                </p>
                <p className="mt-3 font-display text-3xl tracking-tight text-[var(--text)]">
                  {skillName || "Your skill title"}
                </p>
                <p
                  className="mt-3 text-sm font-semibold"
                  style={{ color: selectedLevel.color }}
                >
                  {selectedLevel.label} - +{selectedLevel.rep} REP
                </p>
                <p className="mt-4 text-sm leading-6 text-[var(--muted)]">
                  Wallet recipient: {recipient || "0x..."}
                </p>
              </div>
            </div>

            <div className="soft-panel rounded-[32px] p-6">
              <p className="text-xs font-mono uppercase tracking-[0.18em] text-[var(--primary)]">
                Issuer checklist
              </p>
              <div className="mt-4 space-y-4">
                {[
                  "Use a clear skill title that someone else can understand instantly.",
                  "Upload evidence first so the metadata URI and the public document link are generated together.",
                  "Choose a level that matches the strength of the proof you are attaching.",
                ].map((item) => (
                  <div key={item} className="flex items-start gap-3">
                    <div className="mt-1 flex h-6 w-6 items-center justify-center rounded-full bg-[var(--primary-soft)] text-[var(--primary)]">
                      <ShieldCheck size={13} />
                    </div>
                    <p className="text-sm leading-6 text-[var(--text-soft)]">{item}</p>
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
