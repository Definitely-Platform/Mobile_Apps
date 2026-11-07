#!/usr/bin/env node

/**
 * Definitely Mobile Ecosystem — Interactive App Scaffolding Engine
 * Usage: node scripts/create-app.js [app-slug]
 */

import fs from 'fs';
import path from 'path';
import readline from 'readline';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const templateDir = path.resolve(rootDir, 'apps/_template');
const appsDir = path.resolve(rootDir, 'apps');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function ask(query) {
  return new Promise((resolve) => rl.question(query, resolve));
}

function copyDirectoryRecursive(src, dest, replacements) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }

  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      copyDirectoryRecursive(srcPath, destPath, replacements);
    } else {
      let content = fs.readFileSync(srcPath);

      // Check if text file to replace placeholders
      const isText = /\.(json|js|jsx|ts|tsx|md|html|yml|yaml|txt|env)$/i.test(entry.name);
      if (isText) {
        let text = content.toString('utf8');
        for (const [placeholder, val] of Object.entries(replacements)) {
          text = text.replaceAll(placeholder, val);
        }
        fs.writeFileSync(destPath, text, 'utf8');
      } else {
        // Binary (images, fonts)
        fs.writeFileSync(destPath, content);
      }
    }
  }
}

async function main() {
  console.log('\n🚀 Definitely Platform Ecosystem — Mobile App Scaffolder\n');

  let slug = process.argv[2];
  if (!slug) {
    slug = await ask('App Slug / Directory Name (e.g. prefly-mobile): ');
  }
  slug = slug.trim().toLowerCase().replace(/[^a-z0-9-]/g, '-');

  if (!slug) {
    console.error('❌ Error: App slug cannot be empty.');
    process.exit(1);
  }

  const targetAppDir = path.join(appsDir, slug);
  if (fs.existsSync(targetAppDir)) {
    console.error(`❌ Error: App directory "apps/${slug}" already exists.`);
    process.exit(1);
  }

  const defaultName = slug
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');

  const appName = process.argv[3] || (await ask(`Human App Title [${defaultName}]: `)) || defaultName;
  const defaultScheme = slug.replace(/[^a-z0-9]/g, '');
  const scheme = process.argv[4] || (await ask(`Deep Link Scheme [${defaultScheme}]: `)) || defaultScheme;
  const defaultPkg = `live.definitely.${scheme}`;
  const pkg = process.argv[5] || (await ask(`Android Package / Bundle ID [${defaultPkg}]: `)) || defaultPkg;

  rl.close();

  console.log('\n📦 Scaffolding new mobile app...');
  console.log(`   - Name:     ${appName}`);
  console.log(`   - Slug:     ${slug}`);
  console.log(`   - Scheme:   ${scheme}://`);
  console.log(`   - Package:  ${pkg}`);
  console.log(`   - Path:     apps/${slug}\n`);

  const replacements = {
    '{{APP_NAME}}': appName,
    '{{APP_SLUG}}': slug,
    '{{APP_SCHEME}}': scheme,
    '{{APP_PACKAGE}}': pkg,
    '{{APP_BUNDLE_ID}}': pkg,
    '@definitely/mobile-template-client': `@definitely/${slug}-client`,
    '{{APP_WORKSPACE_NAME}}': `@definitely/${slug}-client`,
  };

  copyDirectoryRecursive(templateDir, targetAppDir, replacements);

  console.log(`✅ Successfully scaffolded ${appName} at apps/${slug}!\n`);
  console.log('To start development:');
  console.log(`   cd apps/${slug}/client && npm start\n`);
  console.log('To build with EAS:');
  console.log(`   cd apps/${slug}/client && eas build -p android --profile preview\n`);
}

main().catch((err) => {
  console.error('Scaffolding failed:', err);
  process.exit(1);
});
