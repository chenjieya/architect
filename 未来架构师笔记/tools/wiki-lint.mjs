#!/usr/bin/env node

import { createHash } from 'node:crypto';
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { basename, extname, join, relative } from 'node:path';

const ROOT = process.cwd();
const WIKI_DIR = join(ROOT, 'wiki');
const RAW_DIR = join(ROOT, 'raw');
const INDEX_FILE = join(ROOT, 'index.md');
const SHOW_ALL_WARNINGS = process.argv.includes('--all');
const WARNING_LIMIT = 80;
const ASSET_EXTS = new Set([
  '.png',
  '.jpg',
  '.jpeg',
  '.gif',
  '.webp',
  '.svg',
  '.bmp',
  '.avif',
  '.pdf',
  '.doc',
  '.docx',
  '.xls',
  '.xlsx',
  '.ppt',
  '.pptx',
]);

const errors = [];
const warnings = [];

function toRepoPath(file) {
  return relative(ROOT, file).replace(/\\/g, '/');
}

function walk(dir, predicate = () => true, out = []) {
  if (!existsSync(dir)) return out;
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(full, predicate, out);
    } else if (predicate(full)) {
      out.push(full);
    }
  }
  return out;
}

function parseFrontmatter(text) {
  const match = text.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
  if (!match) return { data: {}, raw: '', body: text };
  const raw = match[1];
  const data = {};
  for (const line of raw.split(/\r?\n/)) {
    const scalar = line.match(/^([A-Za-z_][A-Za-z0-9_]*):\s*(.*)$/);
    if (scalar) data[scalar[1]] = scalar[2].replace(/\s+#.*$/, '').trim();
  }
  data.refs = parseRefs(raw);
  return { data, raw, body: text.slice(match[0].length) };
}

function parseRefs(raw) {
  const refs = { pages: [], raw: [] };
  const lines = raw.split(/\r?\n/);
  let mode = '';
  let currentRaw = null;
  for (const line of lines) {
    if (/^refs:\s*$/.test(line)) {
      mode = 'refs';
      continue;
    }
    if (mode && /^\S/.test(line)) {
      mode = '';
      currentRaw = null;
    }
    if (!mode) continue;
    if (/^\s+pages:\s*\[\]\s*$/.test(line)) {
      mode = 'pages';
      continue;
    }
    if (/^\s+raw:\s*\[\]\s*$/.test(line)) {
      mode = 'raw';
      continue;
    }
    if (/^\s+pages:\s*$/.test(line)) {
      mode = 'pages';
      continue;
    }
    if (/^\s+raw:\s*$/.test(line)) {
      mode = 'raw';
      continue;
    }
    if (mode === 'pages') {
      const page = line.match(/^\s+-\s+(.+?)\s*$/);
      if (page) refs.pages.push(stripQuotes(page[1]));
    }
    if (mode === 'raw') {
      const pathLine = line.match(/^\s+-\s+path:\s+(.+?)\s*$/);
      const hashLine = line.match(/^\s+sha256:\s+(.+?)\s*$/);
      const stringLine = line.match(/^\s+-\s+(.+?)\s*$/);
      if (pathLine) {
        currentRaw = { path: stripQuotes(pathLine[1]), sha256: '' };
        refs.raw.push(currentRaw);
      } else if (hashLine && currentRaw) {
        currentRaw.sha256 = stripQuotes(hashLine[1]);
      } else if (stringLine && !stringLine[1].includes(':')) {
        refs.raw.push({ path: stripQuotes(stringLine[1]), sha256: '' });
        currentRaw = null;
      }
    }
  }
  return refs;
}

function stripQuotes(value) {
  return value.replace(/^['"]|['"]$/g, '').trim();
}

function pageTitle(file) {
  const name = basename(file);
  return name.endsWith('.md') ? name.slice(0, -3) : name;
}

function normalizeLinkTarget(target) {
  const noAlias = target.split('|')[0].split('#')[0].trim();
  const name = basename(noAlias);
  return name.endsWith('.md') ? name.slice(0, -3) : name;
}

function extractWikiLinks(text) {
  const links = [];
  const searchable = [];
  let inFence = false;
  for (const line of text.split(/\r?\n/)) {
    if (line.trim().startsWith('```')) {
      inFence = !inFence;
      continue;
    }
    if (!inFence) searchable.push(line);
  }
  const re = /!?\[\[([^\]]+)\]\]/g;
  let match;
  while ((match = re.exec(searchable.join('\n')))) {
    const rawTarget = match[1].split('|')[0].split('#')[0].trim();
    if (!rawTarget) continue;
    if (ASSET_EXTS.has(extname(rawTarget).toLowerCase())) continue;
    links.push(normalizeLinkTarget(match[1]));
  }
  return links;
}

function sha256(file) {
  const text = readFileSync(file, 'utf8').replace(/\r\n/g, '\n');
  return createHash('sha256').update(text, 'utf8').digest('hex');
}

function checkWiki() {
  const files = walk(WIKI_DIR, (file) => file.endsWith('.md'));
  const titleMap = new Map();
  const inbound = new Map();
  const bodies = new Map();
  const metadata = new Map();
  const refsPageChecks = [];

  for (const file of files) {
    const title = pageTitle(file);
    if (!titleMap.has(title)) titleMap.set(title, []);
    titleMap.get(title).push(file);
    inbound.set(title, new Set());

    const text = readFileSync(file, 'utf8');
    const parsed = parseFrontmatter(text);
    bodies.set(file, parsed.body);
    metadata.set(file, parsed);

    if (!parsed.raw) {
      errors.push(`${toRepoPath(file)} 缺少 frontmatter，按规则会被视为人类只读页。`);
      continue;
    }

    if (parsed.data.ai_editable === 'true') {
      if (!parsed.data.summary) errors.push(`${toRepoPath(file)} 缺少 summary。`);
      if (!/^\s*refs:\s*$/m.test(parsed.raw)) errors.push(`${toRepoPath(file)} 缺少 refs。`);
      for (const page of parsed.data.refs.pages) refsPageChecks.push([file, page]);
      for (const rawRef of parsed.data.refs.raw) {
        const rawPath = join(ROOT, rawRef.path);
        if (!rawRef.path.startsWith('raw/')) {
          errors.push(`${toRepoPath(file)} 的 refs.raw 路径不是 raw/ 开头：${rawRef.path}`);
          continue;
        }
        if (!existsSync(rawPath)) {
          errors.push(`${toRepoPath(file)} 的 refs.raw 文件不存在：${rawRef.path}`);
          continue;
        }
        if (rawRef.sha256 && sha256(rawPath) !== rawRef.sha256) {
          errors.push(`${toRepoPath(file)} 的 refs.raw sha256 已变化：${rawRef.path}`);
        }
      }
    }
  }

  for (const [title, sameTitleFiles] of titleMap) {
    if (sameTitleFiles.length > 1) {
      errors.push(`存在重名页面 ${title}：${sameTitleFiles.map(toRepoPath).join('、')}`);
    }
  }

  for (const [file, page] of refsPageChecks) {
    if (!titleMap.has(page)) errors.push(`${toRepoPath(file)} 的 refs.pages 指向不存在页面：${page}`);
  }

  for (const file of files) {
    const from = pageTitle(file);
    for (const target of extractWikiLinks(bodies.get(file))) {
      if (!titleMap.has(target)) {
        const parsed = metadata.get(file);
        const message = `${toRepoPath(file)} 存在无目标双链：[[${target}]]`;
        if (parsed?.data.ai_editable === 'true') errors.push(message);
        else warnings.push(message);
      } else if (target !== from) {
        inbound.get(target).add(from);
      }
    }
  }

  for (const [title, sources] of inbound) {
    if (!sources.size) warnings.push(`${title} 没有来自其他 Wiki 页面的入链。`);
  }

  checkIndex(files, titleMap);

  console.log(`Wiki 文件：${files.length}`);
  console.log(`Raw 文件：${walk(RAW_DIR, () => true).length}`);
  console.log(`错误：${errors.length}`);
  for (const item of errors) console.log(`ERROR ${item}`);
  console.log(`警告：${warnings.length}`);
  const shownWarnings = SHOW_ALL_WARNINGS ? warnings : warnings.slice(0, WARNING_LIMIT);
  for (const item of shownWarnings) console.log(`WARN ${item}`);
  if (!SHOW_ALL_WARNINGS && warnings.length > WARNING_LIMIT) {
    console.log(`WARN 仅展示前 ${WARNING_LIMIT} 条；查看全部请运行：node tools/wiki-lint.mjs --all`);
  }

  if (errors.length) process.exitCode = 1;
}

function checkIndex(wikiFiles, titleMap) {
  if (!existsSync(INDEX_FILE)) {
    errors.push('根目录 index.md 不存在。');
    return;
  }
  const indexText = readFileSync(INDEX_FILE, 'utf8');
  const indexLinks = new Set(extractWikiLinks(indexText));

  for (const file of wikiFiles) {
    const title = pageTitle(file);
    if (!indexLinks.has(title)) errors.push(`index.md 未收录页面：${toRepoPath(file)}`);
  }

  for (const link of indexLinks) {
    if (!titleMap.has(link)) errors.push(`index.md 存在无目标双链：[[${link}]]`);
  }

  for (const line of indexText.split(/\r?\n/)) {
    if (/^\s*-\s+\[\[/.test(line) && !/\]\](?:：|:)\S/.test(line)) {
      warnings.push(`index.md 索引项缺少一句话摘要：${line.trim()}`);
    }
  }
}

checkWiki();
