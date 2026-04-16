"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useReadContract } from "wagmi";
import {
  ArrowLeft,
  Check,
  CheckCircle2,
  Copy,
  ExternalLink,
  File,
  FileText,
  Globe,
} from "lucide-react";
import { Navbar } from "../../../../components/Navbar";
import {
  CONTRACT_ADDRESS,
  LEVEL_COLORS,
  LEVEL_LABELS,
  LEVEL_REP,
  SKILLCHAIN_ABI,
} from "../../../../lib/contract";
import { ipfsToHttp } from "../../../../lib/ipfs";

function guessFileType(
  uri: string,
  mimeType?: string | null
): "image" | "pdf" | "other" {
  if (mimeType?.startsWith("image/")) return "image";
  if (mimeType === "application/pdf") return "pdf";

  const lower = uri.toLowerCase();
  if (lower.match(/\.(png|jpg|jpeg|gif|webp|svg)$/)) return "image";
  if (lower.match(/\.pdf$/)) return "pdf";
  return "other";
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  return (
    <button
      type="button"
      onClick={() => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }}
      className="rounded-xl border border-[var(--border)] bg-white p-2 text-[var(--muted)] transition-colors hover:text-[var(--text)]"
    >
      {copied ? <Check size={14} /> : <Copy size={14} />}
    </button>
  );
}

function DocumentViewer({
  uri,
  mimeType,
}: {
  uri: string;
  mimeType?: string | null;
}) {
  const url = ipfsToHttp(uri);
  const type = guessFileType(uri, mimeType);

  if (type === "image") {
    return (
      <div className="overflow-hidden rounded-[28px] border border-[var(--border)] bg-white">
        <img src={url} alt="Credential file" className="max-h-96 w-full object-contain" />
      </div>
    );
  }

  if (type === "pdf") {
    return (
      <div className="overflow-hidden rounded-[28px] border border-[var(--border)] bg-white">
        <iframe src={url} className="h-96 w-full" title="Credential PDF" />
      </div>
    );
  }

  return (
    <a
      href={url}
      target="_blank"
      rel="noreferrer"
      className="card-hover flex items-center gap-4 rounded-[28px] border border-[var(--border)] bg-white p-5 shadow-[0_10px_26px_rgba(15,23,42,0.05)]"
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--primary-soft)] text-[var(--primary)]">
        <File size={20} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-[var(--text)]">
          Attached proof file
        </p>
        <p className="mt-1 truncate font-mono text-xs text-[var(--muted)]">
          {uri}
        </p>
      </div>
      <ExternalLink size={16} className="text-[var(--primary)]" />
    </a>
  );
}

function MetadataDocument({ uri }: { uri: string }) {
  type Metadata = {
    name?: string;
    description?: string;
    image?: string;
    document?: string;
    documentUrl?: string;
    external_url?: string;
    mimeType?: string;
    level?: string;
    uploadedAt?: string;
    attributes?: { trait_type?: string; value?: string | number }[];
  };

  const [meta, setMeta] = useState<Metadata | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const fetchUrl = ipfsToHttp(uri);

  useEffect(() => {
    if (!uri) return;

    setLoading(true);
    setError(false);

    fetch(fetchUrl)
      .then(async (response) => {
        if (!response.ok) {
          throw new Error("Metadata request failed.");
        }

        return response.json();
      })
      .then((data) => setMeta(data))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [fetchUrl, uri]);

  if (loading) {
    return <div className="shimmer h-72 rounded-[32px] border border-[var(--border)]" />;
  }

  if (error || !meta) {
    return (
      <div className="soft-panel rounded-[32px] p-6">
        <p className="text-sm text-[var(--muted)]">
          Metadata could not be loaded automatically.
        </p>
        <a
          href={fetchUrl}
          target="_blank"
          rel="noreferrer"
          className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-[var(--primary)] hover:underline"
        >
          Open metadata directly
          <ExternalLink size={14} />
        </a>
      </div>
    );
  }

  const documentUri =
    meta.documentUrl ?? meta.external_url ?? meta.document ?? meta.image ?? null;

  return (
    <div className="soft-panel rounded-[32px] p-6">
      <div className="mb-5 flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-mono uppercase tracking-[0.16em] text-[var(--primary)]">
            Metadata
          </p>
          <h3 className="mt-2 text-2xl font-semibold text-[var(--text)]">
            Attached proof and credential details
          </h3>
        </div>
        <a
          href={fetchUrl}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--primary)] hover:underline"
        >
          <Globe size={14} />
          Open metadata source
        </a>
      </div>

      <div className="space-y-5">
        {documentUri && <DocumentViewer uri={documentUri} mimeType={meta.mimeType} />}

        {documentUri && (
          <a
            href={ipfsToHttp(documentUri)}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--primary)] hover:underline"
          >
            Open public proof file
            <ExternalLink size={14} />
          </a>
        )}

        {meta.name && (
          <div>
            <p className="text-xs font-mono uppercase tracking-[0.16em] text-[var(--muted)]">
              Name
            </p>
            <p className="mt-2 text-lg font-semibold text-[var(--text)]">
              {meta.name}
            </p>
          </div>
        )}

        {meta.description && (
          <div>
            <p className="text-xs font-mono uppercase tracking-[0.16em] text-[var(--muted)]">
              Description
            </p>
            <p className="mt-2 text-sm leading-7 text-[var(--text-soft)]">
              {meta.description}
            </p>
          </div>
        )}

        {(meta.level || meta.uploadedAt || meta.mimeType) && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {meta.level && (
              <div className="rounded-[24px] border border-[var(--border)] bg-white p-4">
                <p className="text-xs font-mono uppercase tracking-[0.16em] text-[var(--muted)]">
                  Level
                </p>
                <p className="mt-2 text-sm font-semibold text-[var(--text)]">
                  {meta.level}
                </p>
              </div>
            )}
            {meta.uploadedAt && (
              <div className="rounded-[24px] border border-[var(--border)] bg-white p-4">
                <p className="text-xs font-mono uppercase tracking-[0.16em] text-[var(--muted)]">
                  Uploaded
                </p>
                <p className="mt-2 text-sm font-semibold text-[var(--text)]">
                  {new Date(meta.uploadedAt).toLocaleDateString("en-US", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}
                </p>
              </div>
            )}
            {meta.mimeType && (
              <div className="rounded-[24px] border border-[var(--border)] bg-white p-4">
                <p className="text-xs font-mono uppercase tracking-[0.16em] text-[var(--muted)]">
                  File type
                </p>
                <p className="mt-2 break-all text-sm font-semibold text-[var(--text)]">
                  {meta.mimeType}
                </p>
              </div>
            )}
          </div>
        )}

        {Array.isArray(meta.attributes) && meta.attributes.length > 0 && (
          <div>
            <p className="text-xs font-mono uppercase tracking-[0.16em] text-[var(--muted)]">
              Attributes
            </p>
            <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {meta.attributes.map((attr, index) => (
                <div
                  key={`${attr.trait_type}-${index}`}
                  className="rounded-[24px] border border-[var(--border)] bg-white p-4"
                >
                  <p className="text-xs font-mono uppercase tracking-[0.16em] text-[var(--muted)]">
                    {attr.trait_type ?? "Trait"}
                  </p>
                  <p className="mt-2 text-sm font-semibold text-[var(--text)]">
                    {String(attr.value ?? "")}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function InfoCard({
  label,
  value,
  mono = false,
  accent,
  copyable = false,
}: {
  label: string;
  value: string;
  mono?: boolean;
  accent?: string;
  copyable?: boolean;
}) {
  return (
    <div className="rounded-[24px] border border-[var(--border)] bg-white p-4">
      <p className="text-xs font-mono uppercase tracking-[0.16em] text-[var(--muted)]">
        {label}
      </p>
      <div className="mt-2 flex items-start gap-2">
        <p
          className={`flex-1 break-all text-sm text-[var(--text)] ${
            mono ? "font-mono" : ""
          }`}
          style={accent ? { color: accent } : undefined}
        >
          {value}
        </p>
        {copyable && <CopyButton text={value} />}
      </div>
    </div>
  );
}

export default function SkillDetailPage({
  params,
}: {
  params: { tokenId: string };
}) {
  const tokenId = BigInt(params.tokenId);

  const { data, isLoading } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: SKILLCHAIN_ABI,
    functionName: "getSkill",
    args: [tokenId],
  });

  const { data: owner } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: SKILLCHAIN_ABI,
    functionName: "ownerOf",
    args: [tokenId],
  });

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <main className="mx-auto max-w-5xl px-4 pb-16 pt-8 sm:px-6">
          <div className="space-y-4">
            <div className="shimmer h-10 w-40 rounded-2xl border border-[var(--border)]" />
            <div className="shimmer h-64 rounded-[32px] border border-[var(--border)]" />
            <div className="shimmer h-72 rounded-[32px] border border-[var(--border)]" />
          </div>
        </main>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <main className="mx-auto max-w-4xl px-4 pb-16 pt-8 sm:px-6">
          <Link
            href="/verify"
            className="secondary-button inline-flex px-4 py-3 text-sm font-semibold"
          >
            <ArrowLeft size={16} />
            Back to verify
          </Link>
          <div className="mt-6 rounded-[32px] border border-rose-200 bg-rose-50 p-8 text-center">
            <p className="text-lg font-semibold text-rose-700">Credential not found</p>
            <p className="mt-2 text-sm text-rose-600">
              No token exists with ID #{params.tokenId}.
            </p>
          </div>
        </main>
      </div>
    );
  }

  const [name, level, issuer, issuedAt, uri] = data as [
    string,
    number,
    `0x${string}`,
    bigint,
    string
  ];

  const date = new Date(Number(issuedAt) * 1000).toLocaleString("en-US", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="min-h-screen">
      <Navbar />

      <main className="mx-auto max-w-5xl px-4 pb-16 pt-8 sm:px-6">
        <Link
          href="/verify"
          className="secondary-button inline-flex px-4 py-3 text-sm font-semibold"
        >
          <ArrowLeft size={16} />
          Back to verify
        </Link>

        <section className="glass-panel mt-6 overflow-hidden rounded-[36px]">
          <div className="flex flex-wrap items-center gap-3 border-b border-[var(--border)] bg-[var(--primary-soft)]/60 px-6 py-4">
            <CheckCircle2 size={18} className="text-[var(--primary)]" />
            <span className="font-semibold text-[var(--primary-strong)]">
              Credential detail
            </span>
            <span className="ml-auto rounded-full bg-white px-3 py-1 text-xs font-mono text-[var(--text-soft)]">
              Token #{params.tokenId}
            </span>
          </div>

          <div className="p-6 sm:p-8">
            <div
              className="inline-flex rounded-full px-3 py-1 text-[11px] font-mono uppercase tracking-[0.16em]"
              style={{
                color: LEVEL_COLORS[level],
                background: `${LEVEL_COLORS[level]}12`,
                border: `1px solid ${LEVEL_COLORS[level]}22`,
              }}
            >
              {LEVEL_LABELS[level]} - +{LEVEL_REP[level]} REP
            </div>

            <h1 className="mt-5 font-display text-5xl tracking-tight text-[var(--text)]">
              {name}
            </h1>
            <p className="mt-4 max-w-3xl text-lg leading-8 text-[var(--muted)]">
              A full, human-friendly view of the on-chain credential and its supporting proof.
            </p>

            <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <InfoCard label="Token owner" value={owner as string} mono copyable />
              <InfoCard label="Issued by" value={issuer} mono copyable />
              <InfoCard label="Issued at" value={date} />
              <InfoCard
                label="Metadata URI"
                value={uri}
                mono
                accent="var(--primary)"
                copyable
              />
            </div>

            <a
              href={ipfsToHttp(uri)}
              target="_blank"
              rel="noreferrer"
              className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-[var(--primary)] hover:underline"
            >
              <FileText size={15} />
              Open metadata in a new tab
              <ExternalLink size={14} />
            </a>
          </div>
        </section>

        <div className="mt-6">
          <MetadataDocument uri={uri} />
        </div>
      </main>
    </div>
  );
}
