/**
 * Prerender Script for Grounds & Gates
 * Generates static HTML pages with dynamic OpenGraph meta tags for all property listings
 * Used for GitHub Pages and static CDNs to enable rich WhatsApp / Social Link Previews
 */

import fs from 'node:fs';
import path from 'node:path';
import { INITIAL_PROPERTIES } from '../src/data/properties.js';

const distDir = path.resolve(process.cwd(), 'dist');
const templatePath = path.join(distDir, 'index.html');

if (!fs.existsSync(templatePath)) {
  console.error('dist/index.html not found! Run "npm run build" first.');
  process.exit(1);
}

const template = fs.readFileSync(templatePath, 'utf8');

console.log(`Prerendering dynamic OpenGraph pages for ${INITIAL_PROPERTIES.length} listings...`);

let generatedCount = 0;

for (const prop of INITIAL_PROPERTIES) {
  const title = `${prop.title} | Grounds & Gates Tamil Nadu`;
  const description = `${prop.location}, ${prop.district} - ₹${(prop.price / 100000).toFixed(1)}L | ${prop.plotArea} ${prop.plotAreaUnit} | ${prop.approvalAuthority || 'Approved'} property listing.`;
  const image = prop.images[0] || 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80';
  const url = `https://groundsandgates.in/property/${prop.slug}`;

  // Replace default OG tags with property-specific metadata
  let html = template
    .replace(/<title>.*?<\/title>/, `<title>${title}</title>`)
    .replace(/<meta name="description" content=".*?" \/>/, `<meta name="description" content="${description}" />`)
    .replace(/<meta property="og:title" content=".*?" \/>/, `<meta property="og:title" content="${title}" />`)
    .replace(/<meta property="og:description" content=".*?" \/>/, `<meta property="og:description" content="${description}" />`);

  const dynamicMetaTags = `
    <!-- Dynamic OpenGraph & Twitter Tags for Listing: ${prop.id} -->
    <meta property="og:image" content="${image}" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta property="og:url" content="${url}" />
    <meta name="twitter:title" content="${title}" />
    <meta name="twitter:description" content="${description}" />
    <meta name="twitter:image" content="${image}" />
    <!-- Structured Data (JSON-LD) for Real Estate Listing -->
    <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "SingleFamilyResidence",
      "name": "${prop.title}",
      "description": "${description}",
      "image": "${image}",
      "address": {
        "@type": "PostalAddress",
        "addressLocality": "${prop.location}",
        "addressRegion": "${prop.district}",
        "addressCountry": "IN"
      },
      "offers": {
        "@type": "Offer",
        "price": "${prop.price}",
        "priceCurrency": "INR"
      }
    }
    </script>
  </head>`;

  html = html.replace('</head>', dynamicMetaTags);

  // Write by slug: /property/<slug>/index.html
  const slugDir = path.join(distDir, 'property', prop.slug);
  fs.mkdirSync(slugDir, { recursive: true });
  fs.writeFileSync(path.join(slugDir, 'index.html'), html, 'utf8');

  // Also write by id: /property/<id>/index.html
  const idDir = path.join(distDir, 'property', prop.id);
  fs.mkdirSync(idDir, { recursive: true });
  fs.writeFileSync(path.join(idDir, 'index.html'), html, 'utf8');

  generatedCount++;
}

console.log(`✅ Successfully generated ${generatedCount * 2} prerendered pages with dynamic OpenGraph tags!`);
