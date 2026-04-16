import { NextResponse } from "next/server";
import { cidToHttp, cidToIpfsUri } from "../../../lib/ipfs";

const PINATA_UPLOAD_URL = "https://uploads.pinata.cloud/v3/files";

export const dynamic = "force-dynamic";

function getPinataAuthHeaders(): HeadersInit {
  const jwt = process.env.PINATA_JWT ?? "";
  const apiKey = process.env.PINATA_API_KEY ?? "";
  const apiSecret = process.env.PINATA_API_SECRET ?? "";

  if (jwt) {
    return { Authorization: `Bearer ${jwt}` };
  }

  if (apiKey && apiSecret) {
    return {
      pinata_api_key: apiKey,
      pinata_secret_api_key: apiSecret,
    };
  }

  throw new Error("Pinata credentials are missing. Set PINATA_JWT or PINATA_API_KEY/PINATA_API_SECRET.");
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");
    const name = formData.get("name");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "A file is required." }, { status: 400 });
    }

    const uploadData = new FormData();
    const uploadName =
      typeof name === "string" && name.trim().length > 0
        ? name.trim()
        : file.name || "upload.bin";

    uploadData.append("file", file, file.name || uploadName);
    uploadData.append("name", uploadName);
    uploadData.append("cidVersion", "1");
    uploadData.append("network", "public");

    const pinataResponse = await fetch(PINATA_UPLOAD_URL, {
      method: "POST",
      headers: getPinataAuthHeaders(),
      body: uploadData,
      cache: "no-store",
    });

    const rawBody = await pinataResponse.text();
    let json: any = null;

    try {
      json = rawBody ? JSON.parse(rawBody) : null;
    } catch {
      json = null;
    }

    if (!pinataResponse.ok) {
      const message =
        (json && typeof json.error === "string" && json.error) || rawBody || "Unknown Pinata error.";

      return NextResponse.json(
        { error: `Pinata upload failed (${pinataResponse.status}): ${message}` },
        { status: pinataResponse.status }
      );
    }

    const cid = json?.data?.cid;

    if (!cid || typeof cid !== "string") {
      return NextResponse.json(
        { error: "Pinata response did not include a CID." },
        { status: 502 }
      );
    }

    return NextResponse.json({
      cid,
      ipfsUri: cidToIpfsUri(cid),
      gatewayUrl: cidToHttp(cid),
      name: file.name || uploadName,
      mimeType: file.type || null,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unexpected Pinata upload error.";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
