#!/usr/bin/env node
// Rewrites @/ path aliases to relative paths in the compiled output.
// Medusa's build (swc) leaves @/ aliases unresolved; this script fixes them
// so the plugin works when installed without tsconfig-paths configured.
const fs = require("fs");
const path = require("path");

// Medusa resolves plugin routes from .medusa/server/src (MEDUSA_PLUGIN_SOURCE_PATH).
// rootDir "." in tsconfig preserves the src/ prefix so the output lands there.
// @/* aliases map to src/*, which in the compiled output live at .medusa/server/src/*.
const outDir = path.resolve(__dirname, "../.medusa/server/src");

function processDir(dir) {
  for (const entry of fs.readdirSync(dir)) {
    const full = path.join(dir, entry);
    if (fs.statSync(full).isDirectory()) {
      processDir(full);
    } else if (full.endsWith(".js") || full.endsWith(".mjs") || full.endsWith(".cjs")) {
      processFile(full);
    }
  }
}

function processFile(file) {
  const src = fs.readFileSync(file, "utf8");
  const next = src.replace(
    /(['"])@\/([^'"]+)\1/g,
    (_, quote, alias) => {
      const target = path.join(outDir, alias);
      let rel = path.relative(path.dirname(file), target);
      if (!rel.startsWith(".")) rel = "./" + rel;
      return `${quote}${rel}${quote}`;
    }
  );
  if (next !== src) fs.writeFileSync(file, next);
}

processDir(outDir);
console.log("fix-aliases: @/ imports resolved in .medusa/server");
