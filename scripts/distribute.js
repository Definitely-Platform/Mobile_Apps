#!/usr/bin/env node

/**
 * Definitely Mobile Ecosystem — Dynamic Multi-App Firebase App Distribution Script
 *
 * Usage:
 *   node scripts/distribute.js [app-slug] [path-to-apk] [release-notes] [tester-groups]
 *   node scripts/distribute.js definitely-one
 *   npm run distribute:one
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const DEFAULT_FIREBASE_APP_ID = '1:919056358557:android:7534014df2fdb48179c874';
const DEFAULT_GROUPS = 'qa-testers';

function resolveAppAndApk(args) {
  if (args.includes('--help') || args.includes('-h')) {
    console.log(`Usage:
  node scripts/distribute.js [app-slug] [path-to-apk] [release-notes] [tester-groups]

Examples:
  node scripts/distribute.js definitely-one
  node scripts/distribute.js prefly ./prefly.apk "v1.2.0 release"
  node scripts/distribute.js ./apps/definitely-one/client/definitely-one.apk
`);
    process.exit(0);
  }

  let appSlug = 'definitely-one';
  let apkPath = '';
  let releaseNotes = '';
  let testerGroups = DEFAULT_GROUPS;

  const arg1 = args[0];
  const arg2 = args[1];
  const arg3 = args[2];
  const arg4 = args[3];

  if (arg1) {
    if (arg1.endsWith('.apk') || fs.existsSync(arg1)) {
      apkPath = arg1;
      releaseNotes = arg2 || '';
      testerGroups = arg3 || DEFAULT_GROUPS;
    } else {
      appSlug = arg1;
      apkPath = arg2 || '';
      releaseNotes = arg3 || '';
      testerGroups = arg4 || DEFAULT_GROUPS;
    }
  }

  return { appSlug, apkPath, releaseNotes, testerGroups };
}

function getAppFirebaseMetadata(appSlug) {
  const clientDir = path.join(rootDir, 'apps', appSlug, 'client');
  let appId = '';
  let appName = appSlug;
  let groups = DEFAULT_GROUPS;

  // 1. Try reading from google-services.json
  const googleServicesPath = path.join(clientDir, 'google-services.json');
  if (fs.existsSync(googleServicesPath)) {
    try {
      const gs = JSON.parse(fs.readFileSync(googleServicesPath, 'utf8'));
      if (gs?.client?.[0]?.client_info?.mobilesdk_app_id) {
        appId = gs.client[0].client_info.mobilesdk_app_id;
      }
    } catch {}
  }

  // 2. Try reading from app.json
  const appJsonPath = path.join(clientDir, 'app.json');
  if (fs.existsSync(appJsonPath)) {
    try {
      const appJson = JSON.parse(fs.readFileSync(appJsonPath, 'utf8'));
      appName = appJson?.expo?.name || appSlug;
      if (!appId && appJson?.expo?.extra?.firebase?.appId) {
        appId = appJson.expo.extra.firebase.appId;
      }
      if (appJson?.expo?.extra?.firebase?.groups) {
        groups = appJson.expo.extra.firebase.groups;
      }
    } catch {}
  }

  return {
    appId: appId || DEFAULT_FIREBASE_APP_ID,
    appName,
    groups,
    clientDir,
  };
}

async function main() {
  console.log('\n🚀 Definitely Mobile Ecosystem — Multi-App Firebase Distribution\n');

  const { appSlug, apkPath: providedApk, releaseNotes: providedNotes, testerGroups: providedGroups } = resolveAppAndApk(process.argv.slice(2));
  const { appId, appName, groups: defaultAppGroups, clientDir } = getAppFirebaseMetadata(appSlug);
  const testerGroups = providedGroups || defaultAppGroups;

  let apkPath = providedApk;
  let releaseNotes = providedNotes || `${appName} v1.0.0 (Distributed via ecosystem CLI)`;

  if (!apkPath) {
    // Search candidates
    const candidates = [
      path.join(clientDir, `${appSlug}.apk`),
      path.join(clientDir, 'definitely-one.apk'),
      path.join(rootDir, `${appSlug}.apk`),
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
    console.error(`❌ Error: No APK file found for app '${appSlug}'.`);
    console.error(`Expected at: ${path.join(clientDir, `${appSlug}.apk`)}`);
    console.error(`Usage: node scripts/distribute.js [app-slug] [path-to-apk] [release-notes]`);
    process.exit(1);
  }

  console.log(`📱 Target App:       ${appName} (${appSlug})`);
  console.log(`📦 Distributing APK: ${apkPath}`);
  console.log(`🆔 Firebase App ID:  ${appId}`);
  console.log(`👥 Tester Groups:    ${testerGroups}`);
  console.log(`📝 Release Notes:    "${releaseNotes}"\n`);

  // Credentials lookup
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

  const cmd = `${credsEnv}firebase appdistribution:distribute "${apkPath}" --app "${appId}" --groups "${testerGroups}" --release-notes "${releaseNotes}"`;

  try {
    execSync(cmd, { stdio: 'inherit' });
    console.log(`\n✅ Successfully distributed ${appName} to Firebase App Distribution!\n`);
  } catch (err) {
    console.error(`\n❌ Distribution failed for ${appName}:`, err.message);
    process.exit(1);
  }
}

main().catch(console.error);
