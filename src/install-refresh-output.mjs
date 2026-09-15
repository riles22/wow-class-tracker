/* The agent controls its artifact and upload process. Never extract it over trusted
   checkout code: inspect an isolated download and admit only HEAD's data/log paths. */
import { execFileSync } from 'node:child_process';
import { lstatSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const isHistory = file => file.startsWith('data/history/');
const isLog = file => /^\.claude\/skills\/[^/]+\/log\.md$/.test(file);
function inventory(root, prefix = '') {
  return readdirSync(path.join(root, prefix), { withFileTypes: true }).flatMap(entry => {
    const relative = prefix ? `${prefix}/${entry.name}` : entry.name;
    if (entry.isSymbolicLink() || (!entry.isFile() && !entry.isDirectory()))
      throw new Error(`Untrusted refresh output contains a nonregular path: ${relative}`);
    return entry.isDirectory() ? inventory(root, relative) : [relative];
  });
}
export function installRefreshOutput({ root, input }) {
  for (const directory of [root, input]) {
    const stat = lstatSync(directory);
    if (stat.isSymbolicLink() || !stat.isDirectory()) throw new Error('Refresh roots must be real directories');
  }
  const tracked = execFileSync('git', ['ls-tree', '-r', '--name-only', '-z', 'HEAD', '--', 'data/', '.claude/skills/'],
    { cwd: root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).split('\0').filter(Boolean);
  const allowed = tracked.filter(file => (file.startsWith('data/') && !isHistory(file)) || isLog(file));
  if (!allowed.includes('data/specs.json') || !allowed.includes('data/run-manifest.json'))
    throw new Error('Trusted refresh allowlist is incomplete');
  const incoming = inventory(input);
  const unknown = incoming.filter(file => !isHistory(file) && !allowed.includes(file));
  if (unknown.length) throw new Error(`Unapproved paths in refresh artifact: ${unknown.map(JSON.stringify).join(', ')}`);
  const missing = allowed.filter(file => !incoming.includes(file));
  if (missing.length) throw new Error(`Refresh artifact omitted required data/log files: ${missing.map(JSON.stringify).join(', ')}`);
  let totalBytes = 0;
  const files = allowed.map(file => {
    const source = path.join(input, file);
    const size = lstatSync(source).size;
    totalBytes += size;
    if (size > 8 * 1024 * 1024 || totalBytes > 32 * 1024 * 1024) throw new Error('Refresh artifact exceeds bounded data/log size');
    const parts = file.split('/');
    let current = root;
    for (const [index, part] of parts.entries()) {
      current = path.join(current, part);
      const stat = lstatSync(current);
      if (stat.isSymbolicLink() || (index === parts.length - 1 ? !stat.isFile() : !stat.isDirectory()))
        throw new Error(`Unsafe refresh overlay destination: ${file}`);
    }
    return [file, readFileSync(source)];
  });
  // No destination changes until the complete inventory, sizes and path types pass.
  for (const [file, bytes] of files) writeFileSync(path.join(root, file), bytes);
  return { installed: files.length, ignoredHistory: incoming.filter(isHistory).length };
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
    const input = process.env.REFRESH_OUTPUT_DIR;
    if (!input || !path.isAbsolute(input)) throw new Error('Absolute REFRESH_OUTPUT_DIR is required');
    const result = installRefreshOutput({ root, input });
    console.log(`Admitted ${result.installed} data/log files; ignored ${result.ignoredHistory} agent history files`);
  } catch (error) { console.error(error.message); process.exitCode = 1; }
}
