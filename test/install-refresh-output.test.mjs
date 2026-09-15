import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, readFileSync, writeFileSync, rmSync, cpSync, renameSync, symlinkSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { installRefreshOutput } from '../src/install-refresh-output.mjs';

function fixture(t) {
  const dir = mkdtempSync(path.join(tmpdir(), 'refresh-artifact-test-'));
  t.after(() => rmSync(dir, { recursive: true, force: true }));
  const root = path.join(dir, 'repo'), input = path.join(dir, 'download');
  mkdirSync(root); mkdirSync(input);
  const files = ['data/specs.json', 'data/run-manifest.json', 'data/scales.json',
    'data/history/2026-09-01.json', '.claude/skills/local-run/log.md', 'src/trusted.mjs'];
  for (const file of files) {
    mkdirSync(path.dirname(path.join(root, file)), { recursive: true });
    writeFileSync(path.join(root, file), `committed ${file}`);
  }
  const git = args => execFileSync('git', args, { cwd: root, stdio: 'pipe' });
  git(['init', '-q']); git(['add', '.']);
  git(['-c', 'user.name=Fixture', '-c', 'user.email=fixture@example.invalid', 'commit', '-qm', 'trusted fixture']);
  cpSync(path.join(root, 'data'), path.join(input, 'data'), { recursive: true });
  cpSync(path.join(root, '.claude'), path.join(input, '.claude'), { recursive: true });
  writeFileSync(path.join(input, 'data/specs.json'), 'new agent values');
  return { dir, root, input };
}
function unchanged(root) {
  assert.equal(readFileSync(path.join(root, 'data/specs.json'), 'utf8'), 'committed data/specs.json');
  assert.equal(readFileSync(path.join(root, 'src/trusted.mjs'), 'utf8'), 'committed src/trusted.mjs');
}

test('refresh admission copies tracked data/log files and leaves all agent history for trusted regeneration', t => {
  const f = fixture(t);
  writeFileSync(path.join(f.input, 'data/history/2026-09-01.json'), 'forged baseline');
  writeFileSync(path.join(f.input, 'data/history/2026-09-15.json'), 'forged new history');
  const result = installRefreshOutput(f);
  assert.equal(result.installed, 4);
  assert.equal(result.ignoredHistory, 2);
  assert.equal(readFileSync(path.join(f.root, 'data/specs.json'), 'utf8'), 'new agent values');
  assert.equal(readFileSync(path.join(f.root, 'data/history/2026-09-01.json'), 'utf8'), 'committed data/history/2026-09-01.json');
});

test('a forged upload cannot overwrite trusted executable code, Git configuration, or new data paths', t => {
  for (const malicious of ['src/trusted.mjs', '.git/config', '.github/workflows/nightly.yml',
    '.claude/skills/local-run/SKILL.md', 'data/unapproved.json']) {
    const f = fixture(t);
    mkdirSync(path.dirname(path.join(f.input, malicious)), { recursive: true });
    writeFileSync(path.join(f.input, malicious), 'attacker-controlled');
    assert.throws(() => installRefreshOutput(f), /Unapproved paths/);
    unchanged(f.root);
  }
});

test('omitting a required file fails the whole overlay before any canonical writes', t => {
  const f = fixture(t);
  rmSync(path.join(f.input, 'data/scales.json'));
  assert.throws(() => installRefreshOutput(f), /omitted required/);
  unchanged(f.root);
});

test('symlink and junction artifacts cannot redirect reads into other runner files', t => {
  const f = fixture(t), saved = path.join(f.dir, 'saved-data');
  renameSync(path.join(f.input, 'data'), saved);
  symlinkSync(saved, path.join(f.input, 'data'), 'junction');
  assert.throws(() => installRefreshOutput(f), /nonregular path/);
  unchanged(f.root);
});

test('the Git index cannot extend the trusted HEAD path allowlist', t => {
  const f = fixture(t);
  writeFileSync(path.join(f.root, 'data/staged-only.json'), 'unreviewed');
  execFileSync('git', ['add', 'data/staged-only.json'], { cwd: f.root, stdio: 'pipe' });
  writeFileSync(path.join(f.input, 'data/staged-only.json'), 'injected');
  assert.throws(() => installRefreshOutput(f), /Unapproved paths/);
  unchanged(f.root);
});
