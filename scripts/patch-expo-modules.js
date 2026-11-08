#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const targetFile = path.join(
  rootDir,
  'node_modules/expo-modules-core/build/ensureNativeModulesAreInstalled.native.js'
);

if (fs.existsSync(targetFile)) {
  let content = fs.readFileSync(targetFile, 'utf8');
  if (content.includes("typeof window === 'undefined'")) {
    console.log('[patch-expo-modules] Applying runtime JSI readiness patch to expo-modules-core...');
    content = content.replace(
      "if (globalThis.expo || typeof window === 'undefined') {\n        return;\n    }",
      `if (globalThis.expo?.EventEmitter) {\n        return;\n    }\n    try {\n        TurboModuleRegistry.get('ExpoModulesCore')?.installModules();\n    } catch (e) {}\n    if (!globalThis.expo?.EventEmitter) {\n        try {\n            const { installExpoGlobalPolyfill } = require('./polyfill/dangerous-internal');\n            installExpoGlobalPolyfill();\n        } catch {}\n    }\n    return;`
    );
    fs.writeFileSync(targetFile, content, 'utf8');
    console.log('[patch-expo-modules] Successfully applied JSI readiness patch.');
  }
}
