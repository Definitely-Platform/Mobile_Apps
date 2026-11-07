#!/usr/bin/env node

/**
 * Definitely Mobile Ecosystem — Firebase App Distribution Script
 * Usage: node scripts/distribute.js [path-to-apk] [release-notes]
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const FIREBASE_APP_ID = '1:919056358557:android:7534014df2fdb48179c874';
const DEFAULT_GROUPS = 'qa-testers';

async function main() {
  console.log('\n🚀 Definitely Platform — Firebase App Distribution\n');

  let apkPath = process.argv[2];
  let releaseNotes = process.argv[3] || 'Release distributed via definitely ecosystem CLI';

  if (!apkPath) {
    // Search for common APK locations
    const candidates = [
      path.join(rootDir, 'apps/definitely-one/client/definitely-one.apk'),
      path.join(rootDir, 'definitely-one.apk'),
    ];

    for (const c of candidates) {
      if (fs.existsSync(c)) {
        apkPath = c;
        break;
      }
    }
  }

  if (!apkPath || !fs.existsSync(apkPath)) {
    console.error('❌ Error: No APK file found to distribute.');
    console.error('Usage: node scripts/distribute.js <path-to-apk> [release-notes]');
    process.exit(1);
  }

  console.log(`📦 Distributing APK: ${apkPath}`);
  console.log(`📱 App ID:           ${FIREBASE_APP_ID}`);
  console.log(`👥 Tester Groups:    ${DEFAULT_GROUPS}`);
  console.log(`📝 Release Notes:    "${releaseNotes}"\n`);

  // Check for service account key in Official_Credentials
  const credentialsCandidates = [
    path.resolve(rootDir, '../Official_Credentials/Credentials/interview-f410a-firebase-adminsdk-fbsvc-4736a37565.json'),
    path.resolve(rootDir, '../Official_Credentials/Credentials/interview-f410a-firebase-adminsdk-fbsvc-d39af24393.json'),
  ];

  let credsEnv = '';
  for (const cred of credentialsCandidates) {
    if (fs.existsSync(cred)) {
      credsEnv = `GOOGLE_APPLICATION_CREDENTIALS="${cred}" `;
      console.log(`🔑 Using service credentials: ${path.basename(cred)}`);
      break;
    }
  }

  const cmd = `${credsEnv}firebase appdistribution:distribute "${apkPath}" --app "${FIREBASE_APP_ID}" --groups "${DEFAULT_GROUPS}" --release-notes "${releaseNotes}"`;

  try {
    execSync(cmd, { stdio: 'inherit' });
    console.log('\n✅ Successfully distributed build to Firebase App Distribution!\n');
  } catch (err) {
    console.error('\n❌ Distribution failed:', err.message);
    process.exit(1);
  }
}

main().catch(console.error);
