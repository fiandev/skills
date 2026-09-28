#!/usr/bin/env node
import { readdirSync, readFileSync, writeFileSync, statSync } from "node:fs";
import { join, relative, dirname, extname } from "node:path";
import { fileURLToPath } from "node:url";
import { transformSync } from "esbuild";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

const SKIP_DIRS = new Set(["node_modules", ".git", "tools", "dist"]);

function findTsFiles(dir) {
  const out = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const st = statSync(full);
    if (st.isDirectory()) {
      if (!SKIP_DIRS.has(entry) && !entry.startsWith(".")) {
        out.push(...findTsFiles(full));
      }
      continue;
    }
    if (entry.endsWith(".ts") && !entry.endsWith(".d.ts")) {
      out.push(full);
    }
  }
  return out;
}

function rewriteTsImports(code) {
  return code.replace(
    /(from\s*|import\s*\(\s*|import\s+|export\s*\*\s*from\s*)(["'])(\.\.?\/[^"']*?)\.ts(["'])/g,
    (_m, prefix, q1, spec, q2) => `${prefix}${q1}${spec}.js${q2}`
  );
}

function compile(file) {
  const source = readFileSync(file, "utf8");
  const { code, warnings } = transformSync(source, {
    loader: "ts",
    format: "esm",
    platform: "node",
    target: "node18",
    sourcemap: false,
    sourcefile: relative(ROOT, file),
  });
  for (const warning of warnings) {
    console.warn(`warn: ${relative(ROOT, file)}: ${warning.text}`);
  }
  const outFile = file.slice(0, -extname(file).length) + ".js";
  writeFileSync(outFile, rewriteTsImports(code), "utf8");
  return outFile;
}

function main() {
  const files = findTsFiles(ROOT).sort();
  if (files.length === 0) {
    console.log("build: no .ts scripts found");
    return;
  }
  let failed = 0;
  for (const file of files) {
    const rel = relative(ROOT, file);
    try {
      const outFile = compile(file);
      console.log(`build: ${rel} -> ${relative(ROOT, outFile)}`);
    } catch (error) {
      failed += 1;
      console.error(`error: ${rel}: ${error.message}`);
    }
  }
  console.log(
    `build: ${files.length - failed} compiled, ${failed} failed`
  );
  if (failed > 0) process.exit(1);
}

main();
