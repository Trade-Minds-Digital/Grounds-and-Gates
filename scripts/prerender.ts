/**
 * Prerender Script for Grounds & Gates
 * Generates dist/404.html for SPA fallback routing.
 * Does NOT bake hardcoded demo or sample properties into static HTML files,
 * ensuring an honest empty state when the database has no published listings.
 */

import fs from 'node:fs';
import path from 'node:path';

const distDir = path.resolve(process.cwd(), 'dist');
const templatePath = path.join(distDir, 'index.html');

if (!fs.existsSync(templatePath)) {
  console.log('dist/index.html not found! Skipping prerender.');
  process.exit(0);
}

// 1. Remove any legacy statically-baked property pages to guarantee honest dynamic rendering
const propertyDir = path.join(distDir, 'property');
if (fs.existsSync(propertyDir)) {
  try {
    fs.rmSync(propertyDir, { recursive: true, force: true });
    console.log('🧹 Cleaned up legacy baked static property files from dist/property.');
  } catch (err) {
    console.warn('Warning: Could not remove dist/property:', err);
  }
}

// 2. Generate dist/404.html by copying dist/index.html to support SPA fallback on GitHub Pages & static CDNs
fs.copyFileSync(templatePath, path.join(distDir, '404.html'));
console.log('✅ Generated dist/404.html for SPA client-side deep linking and fallback.');
