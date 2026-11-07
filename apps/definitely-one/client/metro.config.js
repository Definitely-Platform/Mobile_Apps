const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

// 1. Find the project and monorepo roots
const projectRoot = __dirname;
const monorepoRoot = path.resolve(projectRoot, '../../..');

const config = getDefaultConfig(projectRoot);

// 2. Watch all files in packages/* and the root node_modules
config.watchFolders = [monorepoRoot];

// 3. Let Metro know where to look for node_modules (app first, then monorepo root)
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(monorepoRoot, 'node_modules'),
];

// 4. Force single version of react and react-native
config.resolver.disableHierarchicalLookup = true;

module.exports = config;
