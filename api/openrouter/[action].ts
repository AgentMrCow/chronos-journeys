import { executeOpenRouterAction, isOpenRouterAction } from "./_shared.ts";

const readJsonBody = async (req: { body?: unknown }) => {
  if (typeof req.body === "string" && req.body.length > 0) {
    return JSON.parse(req.body);
  }

  if (req.body !== undefined) {
    return req.body;
  }

  return {};
};

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const action = Array.isArray(req.query?.action) ? req.query.action[0] : req.query?.action;
  if (typeof action !== "string" || !isOpenRouterAction(action)) {
    res.status(404).json({ error: "Unknown OpenRouter action" });
    return;
  }

  try {
    const body = await readJsonBody(req);
    const result = await executeOpenRouterAction(action, body, process.env);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({
      error: error instanceof Error ? error.message : "OpenRouter proxy request failed",
    });
  }
}
