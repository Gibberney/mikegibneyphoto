#!/usr/bin/env node
/* Tiny zero-dependency static server for previewing the site locally.
   Usage:  npm start   (then open http://localhost:5173)  */
import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { join, extname, normalize } from "node:path";
import { fileURLToPath } from "node:url";
import { dirname } from "node:path";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const PORT = process.env.PORT || 5173;

const TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".jpg": "image/jpeg", ".jpeg": "image/jpeg",
  ".png": "image/png", ".webp": "image/webp",
  ".avif": "image/avif", ".gif": "image/gif",
  ".svg": "image/svg+xml", ".ico": "image/x-icon",
  ".txt": "text/plain; charset=utf-8", ".xml": "application/xml",
};

createServer(async (req, res) => {
  try {
    let urlPath = decodeURIComponent(new URL(req.url, "http://x").pathname);
    if (urlPath === "/") urlPath = "/index.html";
    let filePath = normalize(join(ROOT, urlPath));
    if (!filePath.startsWith(ROOT)) { res.writeHead(403).end("Forbidden"); return; }

    let s;
    try { s = await stat(filePath); } catch { res.writeHead(404).end("Not found"); return; }
    if (s.isDirectory()) filePath = join(filePath, "index.html");

    const body = await readFile(filePath);
    res.writeHead(200, { "Content-Type": TYPES[extname(filePath).toLowerCase()] || "application/octet-stream" });
    res.end(body);
  } catch (e) {
    res.writeHead(500).end("Server error");
  }
}).listen(PORT, () => {
  console.log("▶ Serving Mike Gibney Photography at http://localhost:" + PORT);
});
