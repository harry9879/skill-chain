export const DEFAULT_PINATA_GATEWAY = "https://gateway.pinata.cloud";

export function getIpfsGatewayBase(): string {
  const gateway =
    process.env.NEXT_PUBLIC_PINATA_GATEWAY ??
    process.env.PINATA_GATEWAY ??
    DEFAULT_PINATA_GATEWAY;

  return gateway.replace(/\/$/, "");
}

export function cidToIpfsUri(cid: string): string {
  return `ipfs://${cid}`;
}

export function cidToHttp(cid: string): string {
  return `${getIpfsGatewayBase()}/ipfs/${cid}`;
}

export function ipfsToHttp(uri: string): string {
  if (!uri) return "";

  return uri.startsWith("ipfs://")
    ? `${getIpfsGatewayBase()}/ipfs/${uri.slice(7)}`
    : uri;
}
