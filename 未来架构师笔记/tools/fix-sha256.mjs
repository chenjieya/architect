#!/usr/bin/env node

import { createHash } from 'node:crypto';
import { existsSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { join, relative } from 'node:path';

const ROOT = process.cwd();
const WIKI_DIR = join(ROOT, 'wiki');
const RAW_DIR = join(ROOT, 'raw');

function walk(dir, out = []) {
  if (!existsSync(dir)) return out;
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) walk(full, out);
    else if (entry.name.endsWith('.md')) out.push(full);
  }
  return out;
}

function sha256(file) {
  return createHash('sha256').update(readFileSync(file)).digest('hex');
}

let changedFiles = 0;
let updatedEntries = 0;

for (const wikiFile of walk(WIKI_DIR)) {
  const content = readFileSync(wikiFile, 'utf8');
  const m = content.match(/^---\n([\s\S]*?)\n---/);
  if (!m) continue;

  const frontmatter = m[1];
  const refsRawMatch = frontmatter.match(/^  raw:\n((?:    - path:.*(?:\n      sha256:.*)?\n?)+)/m);
  if (!refsRawMatch) continue;

  const block = refsRawMatch[1];
  const pathMatches = [...block.matchAll(/    - path: "?([^"\n]+?)"?\n(?:      sha256: [0-9a-f]{64})?/g)];
  if (pathMatches.length === 0) continue;

  const entries = [];
  for (const pm of pathMatches) {
    const rawPath = pm[1];
    const rawFile = join(ROOT, rawPath);
    const currentSha = existsSync(rawFile) ? sha256(rawFile) : null;
    if (!currentSha) {
      console.error(`MISSING RAW: ${rawPath} (in ${wikiFile})`);
      continue;
    }
    entries.push({ rawPath, currentSha });
  }
  if (entries.length === 0) continue;

  let newBlock = block;
  for (const { rawPath, currentSha } of entries) {
    const re = new RegExp(
      `(    - path: "?${rawPath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}"?\n)(      sha256: )[0-9a-f]{64}`,
    );
    if (re.test(newBlock)) {
      newBlock = newBlock.replace(re, `$1${'      sha256: '}${currentSha}`);
      updatedEntries++;
    } else {
      console.error(`CANNOT LOCATE sha256 for ${rawPath} in ${wikiFile}`);
    }
  }

  if (newBlock !== block) {
    const newContent = content.replace(frontmatter, frontmatter.replace(block, newBlock));
    writeFileSync(wikiFile, newContent);
    changedFiles++;
    console.log(`UPDATED: ${relative(ROOT, wikiFile)}`);
  }
}

console.log(`\nDone. files=${changedFiles} entries=${updatedEntries}`);
