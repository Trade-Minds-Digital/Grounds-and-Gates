/**
 * Production SSR & Dynamic OpenGraph Server for Grounds & Gates
 * Serves prerendered OpenGraph meta tags to social bots and crawlers (WhatsApp, Facebook, Twitter, Googlebot)
 */

import express, { Request, Response } from 'express';
import path from 'node:path';
import fs from 'node:fs';
import { INITIAL_PROPERTIES } from './src/data/properties.js';

const app = express();
const PORT = process.env.PORT || 3000;
const distDir = path.resolve(process.cwd(), 'dist');
const indexHtmlPath = path.join(distDir, 'index.html');

let baseHtml = '';
try {
  baseHtml = fs.readFileSync(indexHtmlPath, 'utf8');
} catch {
  baseHtml = '<!doctype html><html><head><title>Grounds & Gates</title></head><body><div id="root"></div></body></html>';
}

// Serve static assets with cache headers
app.use('/assets', express.static(path.join(distDir, 'assets'), { maxAge: '1y' }));
app.use(express.static(distDir, { index: false }));

// Dynamic OpenGraph handler for property routes
app.get(['/property/:idOrSlug', '/properties/:idOrSlug'], (req: Request, res: Response) => {
  const { idOrSlug } = req.params;
  const prop = INITIAL_PROPERTIES.find(p => p.id === idOrSlug || p.slug === idOrSlug);

  if (!prop) {
    return res.status(200).send(baseHtml);
  }

  const title = `${prop.title} | Grounds & Gates Tamil Nadu`;
  const description = `${prop.location}, ${prop.district} - ₹${(prop.price / 100000).toFixed(1)}L | ${prop.plotArea} ${prop.plotAreaUnit} | ${prop.approvalAuthority || 'Verified'} property.`;
  const image = prop.images[0] || 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80';
  const url = `https://groundsandgates.in/property/${prop.slug}`;

  const enrichedHtml = baseHtml
    .replace(/<title>.*?<\/title>/, `<title>${title}</title>`)
    .replace(/<meta name="description" content=".*?" \/>/, `<meta name="description" content="${description}" />`)
    .replace(/<meta property="og:title" content=".*?" \/>/, `<meta property="og:title" content="${title}" />`)
    .replace(/<meta property="og:description" content=".*?" \/>/, `<meta property="og:description" content="${description}" />`)
    .replace('</head>', `
      <meta property="og:image" content="${image}" />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:url" content="${url}" />
      <meta name="twitter:title" content="${title}" />
      <meta name="twitter:description" content="${description}" />
      <meta name="twitter:image" content="${image}" />
    </head>`);

  return res.status(200).send(enrichedHtml);
});

// Fallback for all other SPA routes
app.get('*', (_req: Request, res: Response) => {
  res.sendFile(indexHtmlPath);
});

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`🌐 Grounds & Gates SSR/OG Server running on http://localhost:${PORT}`);
  });
}

export default app;
