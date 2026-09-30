const fs = require('fs');
const path = require('path');
const { createHash } = require('crypto');
const { execFileSync } = require('child_process');
const ts = require('typescript');

const projectDir = path.resolve(__dirname, '..');
const configPath = path.join(projectDir, 'tsconfig.json');
const cacheDir = path.join(projectDir, 'node_modules/.cache/tsc');
const cachedOutputDir = path.join(cacheDir, 'output');
const manifestPath = path.join(cacheDir, 'manifest.json');
const buildDir = path.join(projectDir, 'build');

const config = ts.readConfigFile(configPath, ts.sys.readFile);
if (config.error) {
  throw new Error(ts.flattenDiagnosticMessageText(config.error.messageText, '\n'));
}

const parsed = ts.parseJsonConfigFileContent(config.config, ts.sys, projectDir);
if (parsed.errors.length) {
  throw new Error(ts.formatDiagnosticsWithColorAndContext(parsed.errors, {
    getCanonicalFileName: (fileName) => fileName,
    getCurrentDirectory: () => projectDir,
    getNewLine: () => '\n',
  }));
}

// TypeScript does not remove output for deleted source files in incremental mode.
const manifest = JSON.stringify({
  config: fs.readFileSync(configPath, 'utf8'),
  dependencies: createHash('sha256')
    .update(fs.readFileSync(path.join(projectDir, 'package.json')))
    .update(fs.readFileSync(path.join(projectDir, 'yarn.lock')))
    .digest('hex'),
  sources: parsed.fileNames.map((fileName) => path.relative(projectDir, fileName)).sort(),
  typescript: ts.version,
});
if (!fs.existsSync(manifestPath) || fs.readFileSync(manifestPath, 'utf8') !== manifest) {
  fs.rmSync(cacheDir, { recursive: true, force: true });
}
fs.mkdirSync(cacheDir, { recursive: true });

try {
  execFileSync(path.join(projectDir, 'node_modules/.bin/tsc'), [
    '--incremental',
    '--tsBuildInfoFile', path.join(cacheDir, 'tsconfig.tsbuildinfo'),
    '--outDir', cachedOutputDir,
  ], { cwd: projectDir, stdio: 'inherit' });
} catch (error) {
  fs.rmSync(cacheDir, { recursive: true, force: true });
  throw error;
}

fs.writeFileSync(manifestPath, manifest);
fs.rmSync(buildDir, { recursive: true, force: true });
fs.cpSync(cachedOutputDir, buildDir, { recursive: true });
