import type { IncomingMessage, ServerResponse } from "node:http";
import path from "path";
import { defineConfig, loadEnv, type Plugin } from "vite";
import react from "@vitejs/plugin-react-swc";
import { executeOpenRouterAction, isOpenRouterAction } from "./server/openrouter-proxy";

const readJsonBody = async (req: IncomingMessage) => {
  const chunks: Buffer[] = [];
  for await (const chunk of req) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }

  if (chunks.length === 0) {
    return {};
  }

  return JSON.parse(Buffer.concat(chunks).toString("utf8"));
};

const sendJson = (res: ServerResponse, statusCode: number, payload: unknown) => {
  res.statusCode = statusCode;
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify(payload));
};

const openRouterDevProxy = (env: Record<string, string>): Plugin => ({
  configureServer(server) {
    server.middlewares.use("/api/openrouter", async (req, res, next) => {
      if (req.method !== "POST") {
        next();
        return;
      }

      const action = (req.url || "/").split("?")[0].replace(/^\/+/, "");
      if (!isOpenRouterAction(action)) {
        next();
        return;
      }

      try {
        const body = await readJsonBody(req);
        const result = await executeOpenRouterAction(action, body, env);
        sendJson(res, 200, result);
      } catch (error) {
        sendJson(res, 500, {
          error: error instanceof Error ? error.message : "OpenRouter proxy request failed",
        });
      }
    });
  },
  name: "openrouter-dev-proxy",
});

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  return {
    server: {
      host: "::",
      port: 8080,
      hmr: {
        overlay: false,
      },
    },
    plugins: [react(), openRouterDevProxy(env)],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
  };
});
