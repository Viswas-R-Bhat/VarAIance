import { createReadStream, existsSync, statSync } from "node:fs";
import { createServer } from "node:http";
import { extname, join, normalize, resolve } from "node:path";

const root = resolve("dist");
const port = Number.parseInt(process.env.PORT || "4173", 10);

const mimeTypes = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".json": "application/json; charset=utf-8",
};

function resolveRequest(url) {
  const pathname = decodeURIComponent(new URL(url, "http://localhost").pathname);
  const requested = normalize(join(root, pathname));
  if (!requested.startsWith(root)) return null;
  if (existsSync(requested) && statSync(requested).isFile()) return requested;
  return join(root, "index.html");
}

const server = createServer((request, response) => {
  const filePath = resolveRequest(request.url || "/");
  if (!filePath || !existsSync(filePath)) {
    response.writeHead(404);
    response.end("Not found");
    return;
  }

  response.writeHead(200, {
    "Content-Type": mimeTypes[extname(filePath)] || "application/octet-stream",
  });
  createReadStream(filePath).pipe(response);
});

server.listen(port, "127.0.0.1", () => {
  console.log(`Serving dist at http://127.0.0.1:${port}/`);
});

setInterval(() => {}, 60_000);
