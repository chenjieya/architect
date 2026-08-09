#!/usr/bin/env node
// 复刻 obsidian prettier 插件（Alvis 二次开发版）的完整格式化管线：
//   1. prettier@3.6.2 markdown 格式化，参数与插件 data.json 的 formatOptions 完全一致：
//      --no-semi --single-quote --tab-width 2（插件为 semi:false / singleQuote:true / tabWidth:2）
//   2. adjustHeaderLevels   : headerStartLevel=2，把整篇最小标题级别抬到 ##
//   3. addHeaderNumbering   : autoNumbering，按层级给标题插入 1. / 1.1 编号
// 图片上传（图床）步骤刻意跳过：AI 不允许碰图床。
//
// 用法:
//   node tools/format.mjs                 # 格式化 wiki/ 下所有 .md（raw/ 只读，排除）
//   node tools/format.mjs 文件或目录...     # 只格式化指定路径（raw/ 仍会被排除）

import { execSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import { readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const HEADER_START_LEVEL = 2;
const FENCE_RE = /^```/;
const RAW_SEGMENT_RE = /(^|\/|\\)raw(\/|\\|$)/;

// 人类笔记保护：读 frontmatter 跳过 ai_editable:false（默认只读）
function isAIMaintainable(p) {
  try {
    const head = readFileSync(p, 'utf8').slice(0, 1000);
    const m = head.match(/^ai_editable:\s*(true|false)/m);
    return m ? m[1] === 'true' : false;
  } catch {
    return false;
  }
}

function collectFiles(paths) {
  const out = [];
  const walk = (p) => {
    const st = statSync(p);
    if (st.isDirectory()) {
      for (const name of readdirSync(p)) walk(join(p, name));
    } else if (p.endsWith('.md')) {
      if (!RAW_SEGMENT_RE.test(p) && isAIMaintainable(p)) out.push(p);
    }
  };
  for (const p of paths) walk(p);
  return [...new Set(out)];
}

function adjustHeaderLevels(text) {
  const lines = text.split('\n');
  let inCode = false;
  let minLevel = 100;
  let hasHeader = false;
  for (const line of lines) {
    if (line.trim().match(FENCE_RE)) inCode = !inCode;
    if (!inCode) {
      const m = line.match(/^(\s*)(#+)(\s+)/);
      if (m) { hasHeader = true; if (m[2].length < minLevel) minLevel = m[2].length; }
    }
  }
  if (!hasHeader) return text;
  const shift = HEADER_START_LEVEL - minLevel;
  if (shift === 0) return text;
  inCode = false;
  return lines.map((line) => {
    if (line.trim().match(FENCE_RE)) { inCode = !inCode; return line; }
    if (!inCode) {
      const m = line.match(/^(\s*)(#+)(\s+)/);
      if (m) {
        const newLevel = m[2].length + shift;
        if (newLevel >= 1 && newLevel <= 6) {
          return m[1] + '#'.repeat(newLevel) + line.slice(m[1].length + m[2].length);
        }
      }
    }
    return line;
  }).join('\n');
}

function addHeaderNumbering(text) {
  const lines = text.split('\n');
  let inCode = false;
  let minLevel = 100;
  for (const line of lines) {
    if (line.trim().match(FENCE_RE)) inCode = !inCode;
    if (!inCode) {
      const m = line.match(/^(\s*)(#+)(\s+)/);
      if (m && m[2].length < minLevel) minLevel = m[2].length;
    }
  }
  if (minLevel === 100) return text;
  let counters = [];
  inCode = false;
  const out = [];
  for (const line of lines) {
    if (line.trim().match(FENCE_RE)) { inCode = !inCode; out.push(line); continue; }
    if (!inCode) {
      const m = line.match(/^(\s*)(#+)(\s+)(.*)$/);
      if (m) {
        const level = m[2].length - minLevel + 1;
        if (level > counters.length) { while (counters.length < level) counters.push(1); }
        else { counters = counters.slice(0, level); counters[level - 1]++; }
        let prefix = counters.join('.');
        if (level === 1) prefix += '.';
        const textPart = m[4];
        const tm = textPart.match(/^([\d\.]+)(?:\s+(.*))?$/);
        if (tm) {
          const existing = tm[1];
          if (existing !== prefix) {
            out.push(m[1] + m[2] + m[3] + prefix + textPart.slice(existing.length));
          } else {
            out.push(line);
          }
        } else {
          out.push(m[1] + m[2] + m[3] + prefix + ' ' + textPart);
        }
        continue;
      }
    }
    out.push(line);
  }
  return out.join('\n');
}

function main() {
  const args = process.argv.slice(2);
  const paths = args.length ? args : ['wiki'];
  const files = collectFiles(paths);
  if (!files.length) { console.log('没有找到 .md 文件'); return; }

  const quoted = files.map((f) => `"${f}"`).join(' ');
  console.log(`[1/2] prettier 格式化 ${files.length} 个文件 ...`);
  // 与插件 data.json 的 formatOptions 对齐：semi:false、singleQuote:true、tabWidth:2
  // （prettier CLI 布尔选项写法为 --no-semi / --single-quote / --tab-width）
  execSync(
    `npx --yes prettier@3.6.2 --write --no-semi --single-quote --tab-width 2 ${quoted}`,
    { stdio: 'inherit' }
  );

  console.log('[2/2] 标题级别调整 + 自动编号 ...');
  let touched = 0;
  for (const f of files) {
    const before = readFileSync(f, 'utf8');
    const adjusted = adjustHeaderLevels(before);
    const numbered = addHeaderNumbering(adjusted);
    if (numbered !== before) { writeFileSync(f, numbered); touched++; }
  }
  console.log(`完成：共处理 ${files.length} 个文件，其中 ${touched} 个标题有改动`);
}

main();
