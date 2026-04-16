import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const name = formData.get("name") as string;

    if (!file || !name) {
      return NextResponse.json({ error: "Missing file or name" }, { status: 400 });
    }

    // Upload image to Pinata
    const data = new FormData();
    data.append("file", file);

    const imageRes = await fetch("https://api.pinata.cloud/pinning/pinFileToIPFS", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.PINATA_JWT}`, // 🔒 NOT public
      },
      body: data,
    });

    if (!imageRes.ok) {
      throw new Error("Image upload failed");
    }

    const imageData = await imageRes.json();

    // Create metadata
    const metadata = {
      name,
      description: "SkillChain Credential",
      image: `ipfs://${imageData.IpfsHash}`,
    };

    const metaRes = await fetch("https://api.pinata.cloud/pinning/pinJSONToIPFS", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.PINATA_JWT}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(metadata),
    });

    if (!metaRes.ok) {
      throw new Error("Metadata upload failed");
    }

    const metaData = await metaRes.json();

    return NextResponse.json({
      uri: `ipfs://${metaData.IpfsHash}`,
    });

  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}