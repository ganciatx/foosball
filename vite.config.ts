import { defineConfig, loadEnv, type Plugin } from "vite";
import react from "@vitejs/plugin-react";

const CFBD_ORIGIN = "https://api.collegefootballdata.com";

/**
 * Local-only GET proxy. The browser talks to /cfbd/*; this plugin
 * forwards to CFBD and injects the server-side API key so the key
 * never ships in client JS.
 */
function cfbdProxy(apiKey: string | undefined): Plugin {
  return {
    name: "cfbd-proxy",
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (!req.url?.startsWith("/cfbd")) {
          next();
          return;
        }

        if (req.method !== "GET") {
          res.statusCode = 405;
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify({ error: "Only GET is supported" }));
          return;
        }

        if (!apiKey) {
          res.statusCode = 500;
          res.setHeader("Content-Type", "application/json");
          res.end(
            JSON.stringify({
              error: "CFBD_API_KEY is missing. Copy .env.example to .env.",
            }),
          );
          return;
        }

        const pathAndQuery = req.url.replace(/^\/cfbd/, "") || "/";
        if (pathAndQuery.includes("..") || !pathAndQuery.startsWith("/")) {
          res.statusCode = 400;
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify({ error: "Invalid CFBD path" }));
          return;
        }

        const target = `${CFBD_ORIGIN}${pathAndQuery}`;
        const started = Date.now();

        try {
          const upstream = await fetch(target, {
            headers: {
              Authorization: `Bearer ${apiKey}`,
              Accept: "application/json",
            },
          });
          const body = await upstream.text();
          res.statusCode = upstream.status;
          res.setHeader("Content-Type", "application/json; charset=utf-8");
          res.setHeader("X-Upstream-Duration-Ms", String(Date.now() - started));
          res.setHeader("X-Upstream-Path", pathAndQuery);
          res.end(body);
        } catch (error) {
          const message = error instanceof Error ? error.message : String(error);
          res.statusCode = 502;
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify({ error: "Upstream request failed", message }));
        }
      });
    },
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  return {
    base: "./",
    plugins: [react(), cfbdProxy(env.CFBD_API_KEY)],
    server: {
      // Bind the name browsers resolve first. 127.0.0.1 leaves ::1 closed,
      // so http://localhost:5173 is refused before any IPv4 fallback.
      host: "localhost",
      port: 5173,
      strictPort: true,
      // Desktop is iCloud Drive. fsevents stalls that file provider and the
      // dev server stops answering HTTP. Polling avoids the native watcher.
      watch: {
        usePolling: true,
        interval: 1000,
        ignored: ["**/.DS_Store"],
      },
    },
  };
});
