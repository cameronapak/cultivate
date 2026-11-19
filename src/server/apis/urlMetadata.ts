import { type GetUrlMetadata } from 'wasp/server/api';
import type { Request, Response } from 'express';
import { lookup } from 'node:dns/promises';
import { BlockList, isIP } from 'node:net';
import urlMetadata from 'url-metadata';
import { MiddlewareConfigFn } from "wasp/server";

// This is speficially for CORS. (https://wasp.sh/docs/advanced/apis#making-sure-cors-works)
export const urlMetadataNamespaceMiddlewareFn: MiddlewareConfigFn = (config) => {
  return config;
};

const blockedAddresses = new BlockList();
for (const [network, prefix] of [
  ['0.0.0.0', 8],
  ['10.0.0.0', 8],
  ['100.64.0.0', 10],
  ['127.0.0.0', 8],
  ['169.254.0.0', 16],
  ['172.16.0.0', 12],
  ['192.0.0.0', 24],
  ['192.168.0.0', 16],
  ['198.18.0.0', 15],
  ['224.0.0.0', 3],
] as const) {
  blockedAddresses.addSubnet(network, prefix, 'ipv4');
}
for (const [network, prefix] of [
  ['::', 128],
  ['::1', 128],
  ['64:ff9b::', 96],
  ['fc00::', 7],
  ['fe80::', 10],
  ['ff00::', 8],
] as const) {
  blockedAddresses.addSubnet(network, prefix, 'ipv6');
}

function isBlockedAddress(address: string) {
  const family = isIP(address);
  if (family === 0) return true;
  return blockedAddresses.check(address, family === 4 ? 'ipv4' : 'ipv6');
}

async function assertPublicHttpUrl(rawUrl: string) {
  const parsed = new URL(rawUrl);
  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    throw new Error(`Blocked URL scheme: ${parsed.protocol}`);
  }
  const hostname = parsed.hostname.replace(/^\[|\]$/g, '').toLowerCase().replace(/\.$/, '');
  if (hostname === 'localhost' || hostname.endsWith('.localhost') || hostname.endsWith('.internal')) {
    throw new Error(`Blocked host: ${hostname}`);
  }
  const addresses = isIP(hostname) ? [{ address: hostname }] : await lookup(hostname, { all: true });
  if (addresses.length === 0 || addresses.some(({ address }) => isBlockedAddress(address))) {
    throw new Error(`Blocked host: ${hostname}`);
  }
}

const MAX_REDIRECTS = 3;

// Follows redirects manually so every hop passes assertPublicHttpUrl.
// url-metadata's request-filtering agent also rejects private IPs at connect time.
async function fetchPublicUrlMetadata(url: string) {
  let currentUrl = url;
  for (let hop = 0; hop <= MAX_REDIRECTS; hop++) {
    await assertPublicHttpUrl(currentUrl);
    try {
      return await urlMetadata(currentUrl, {
        maxRedirects: 0,
        timeout: 5000,
        size: 1024 * 1024,
        requestFilteringAgentOptions: {
          allowPrivateIPAddress: false,
          allowMetaIPAddress: false,
        },
      });
    } catch (error) {
      const redirectError = error as { unfollowedRedirect?: boolean; url?: string };
      if (!redirectError.unfollowedRedirect || !redirectError.url) throw error;
      currentUrl = redirectError.url;
    }
  }
  throw new Error('Too many redirects');
}

// https://wasp.sh/docs/advanced/apis#defining-the-apis-nodejs-implementation
export const getUrlMetadata: GetUrlMetadata<{ url: string }> = async (req: Request, res: Response, _context: any) => {
  const url = typeof req.query.url === 'string' ? req.query.url : '';
  try {
    const metadata = await fetchPublicUrlMetadata(url);
    const result = {
      title: metadata.title || '',
      description: metadata.description || '',
      image: metadata.image || '',
      favicon: metadata.favicons?.[0]?.href || '',
      siteName: metadata['og:site_name'] || '',
      url: metadata.url || url,
    };
    res.json(result);
  } catch (error) {
    console.error('Error fetching URL metadata:', error);
    res.json({
      title: url,
      description: '',
      image: '',
      favicon: '',
      siteName: '',
      url: url,
    });
  }
};
