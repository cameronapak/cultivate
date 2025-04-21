import { HttpError } from 'wasp/server';
import { type GetUrlMetadata } from 'wasp/server/api';
import type { Request, Response } from 'express';
import urlMetadata from 'url-metadata';
import { MiddlewareConfigFn } from "wasp/server";

// This is speficially for CORS. (https://wasp.sh/docs/advanced/apis#making-sure-cors-works)
export const urlMetadataNamespaceMiddlewareFn: MiddlewareConfigFn = (config) => {
  return config;
};

// https://wasp.sh/docs/advanced/apis#defining-the-apis-nodejs-implementation
export const getUrlMetadata: GetUrlMetadata<{ url: string }> = async (req: Request, res: Response, _context: any) => {
  try {
    const url = decodeURIComponent(req.query.url as string);
    const metadata = await urlMetadata(url);
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
    throw new HttpError(400, 'Failed to fetch URL metadata');
  }
}; 