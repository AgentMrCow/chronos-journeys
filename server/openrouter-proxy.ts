const OPENROUTER_ENDPOINT = "https://openrouter.ai/api/v1/chat/completions";

const DEFAULT_OPENROUTER_CHAT_MODEL = "openai/gpt-4.1-mini";
const DEFAULT_OPENROUTER_IMAGE_MODEL = "google/gemini-2.5-flash-image-preview";

export type OpenRouterAction = "character-reply" | "director-summary" | "clue-image";

export interface DirectorSummaryInput {
  clues: string[];
  currentNode: string;
  missionLog: string[];
  stats: {
    composure: number;
    insight: number;
    leverage: number;
  };
  timeRemaining: number;
}

export interface DirectorSummary {
  grade: string;
  judgement: string;
  nextStep: string;
  strength: string;
  title: string;
  warning: string;
}

export interface GeneratedClueImage {
  caption: string;
  imageUrl: string;
}

interface CharacterReplyInput {
  currentNode: string;
  discoveredClues: string[];
  history: Array<{ role: "assistant" | "user"; text: string }>;
  prompt: string;
  systemPrompt: string;
}

interface OpenRouterMessage {
  content: string | Array<Record<string, unknown>>;
  role: "assistant" | "system" | "user";
}

interface OpenRouterImagePart {
  image_url?: {
    url?: string;
  };
  imageUrl?: {
    url?: string;
  };
}

interface OpenRouterResponse {
  choices?: Array<{
    message?: {
      content?: string | Array<Record<string, unknown>>;
      images?: OpenRouterImagePart[];
    };
  }>;
  error?: {
    message?: string;
  };
}

interface OpenRouterServerEnv {
  OPENROUTER_API_KEY?: string;
  OPENROUTER_APP_NAME?: string;
  OPENROUTER_CHAT_MODEL?: string;
  OPENROUTER_IMAGE_MODEL?: string;
  OPENROUTER_REFERER?: string;
  VITE_OPENROUTER_API_KEY?: string;
  VITE_OPENROUTER_APP_NAME?: string;
  VITE_OPENROUTER_CHAT_MODEL?: string;
  VITE_OPENROUTER_IMAGE_MODEL?: string;
  VITE_OPENROUTER_REFERER?: string;
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const asString = (value: unknown, field: string) => {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new Error(`Invalid ${field}`);
  }

  return value;
};

const asStringArray = (value: unknown, field: string) => {
  if (!Array.isArray(value) || value.some((item) => typeof item !== "string")) {
    throw new Error(`Invalid ${field}`);
  }

  return value as string[];
};

const asHistory = (value: unknown) => {
  if (!Array.isArray(value)) {
    throw new Error("Invalid history");
  }

  return value.map((entry) => {
    if (!isRecord(entry)) {
      throw new Error("Invalid history");
    }

    const role = entry.role;
    const text = entry.text;
    if ((role !== "assistant" && role !== "user") || typeof text !== "string") {
      throw new Error("Invalid history");
    }

    return { role, text };
  });
};

const asDirectorSummaryInput = (value: unknown): DirectorSummaryInput => {
  if (!isRecord(value) || !isRecord(value.stats)) {
    throw new Error("Invalid director summary input");
  }

  return {
    clues: asStringArray(value.clues, "clues"),
    currentNode: asString(value.currentNode, "currentNode"),
    missionLog: asStringArray(value.missionLog, "missionLog"),
    stats: {
      composure:
        typeof value.stats.composure === "number"
          ? value.stats.composure
          : Number(value.stats.composure),
      insight:
        typeof value.stats.insight === "number" ? value.stats.insight : Number(value.stats.insight),
      leverage:
        typeof value.stats.leverage === "number"
          ? value.stats.leverage
          : Number(value.stats.leverage),
    },
    timeRemaining:
      typeof value.timeRemaining === "number" ? value.timeRemaining : Number(value.timeRemaining),
  };
};

const asCharacterReplyInput = (value: unknown): CharacterReplyInput => {
  if (!isRecord(value)) {
    throw new Error("Invalid character reply input");
  }

  return {
    currentNode: asString(value.currentNode, "currentNode"),
    discoveredClues: asStringArray(value.discoveredClues, "discoveredClues"),
    history: asHistory(value.history),
    prompt: asString(value.prompt, "prompt"),
    systemPrompt: asString(value.systemPrompt, "systemPrompt"),
  };
};

const asClueImageInput = (value: unknown) => {
  if (!isRecord(value)) {
    throw new Error("Invalid clue image input");
  }

  return {
    prompt: asString(value.prompt, "prompt"),
  };
};

const normaliseMessageText = (
  content: string | Array<Record<string, unknown>> | undefined,
): string => {
  if (!content) return "";
  if (typeof content === "string") return content;

  return content
    .map((part) => {
      if (typeof part.text === "string") return part.text;
      if (typeof part.content === "string") return part.content;
      return "";
    })
    .filter(Boolean)
    .join("\n");
};

const extractImageUrl = (images: OpenRouterImagePart[] | undefined): string | undefined => {
  if (!images || images.length === 0) return undefined;

  return images.find((image) => image.image_url?.url || image.imageUrl?.url)?.image_url?.url ||
    images.find((image) => image.image_url?.url || image.imageUrl?.url)?.imageUrl?.url;
};

const getRuntimeConfig = (env: OpenRouterServerEnv) => {
  const apiKey = env.OPENROUTER_API_KEY || env.VITE_OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error("Server is missing OPENROUTER_API_KEY");
  }

  return {
    apiKey,
    appName: env.OPENROUTER_APP_NAME || env.VITE_OPENROUTER_APP_NAME,
    chatModel:
      env.OPENROUTER_CHAT_MODEL ||
      env.VITE_OPENROUTER_CHAT_MODEL ||
      DEFAULT_OPENROUTER_CHAT_MODEL,
    imageModel:
      env.OPENROUTER_IMAGE_MODEL ||
      env.VITE_OPENROUTER_IMAGE_MODEL ||
      DEFAULT_OPENROUTER_IMAGE_MODEL,
    referer: env.OPENROUTER_REFERER || env.VITE_OPENROUTER_REFERER,
  };
};

const getHeaders = (env: OpenRouterServerEnv) => {
  const config = getRuntimeConfig(env);
  const headers: Record<string, string> = {
    Authorization: `Bearer ${config.apiKey}`,
    "Content-Type": "application/json",
  };

  if (config.referer) {
    headers["HTTP-Referer"] = config.referer;
  }

  if (config.appName) {
    headers["X-Title"] = config.appName;
  }

  return headers;
};

const requestOpenRouter = async (
  env: OpenRouterServerEnv,
  body: Record<string, unknown>,
): Promise<OpenRouterResponse> => {
  const response = await fetch(OPENROUTER_ENDPOINT, {
    body: JSON.stringify(body),
    headers: getHeaders(env),
    method: "POST",
  });

  const payload = (await response.json()) as OpenRouterResponse;
  if (!response.ok) {
    throw new Error(payload.error?.message || "OpenRouter request failed");
  }

  return payload;
};

const handleCharacterReply = async (input: CharacterReplyInput, env: OpenRouterServerEnv) => {
  const config = getRuntimeConfig(env);
  const messages: OpenRouterMessage[] = [
    {
      role: "system",
      content: `${input.systemPrompt}

You are inside the "完璧歸趙" historical incident.
Current node: ${input.currentNode}
Known clues: ${input.discoveredClues.join("；") || "尚未發現關鍵線索"}

Stay historically plausible, answer in Traditional Chinese, and never reveal future facts your character could not know.`,
    },
    ...input.history.map((entry) => ({
      role: entry.role,
      content: entry.text,
    })),
    {
      role: "user",
      content: input.prompt,
    },
  ];

  const payload = await requestOpenRouter(env, {
    max_tokens: 220,
    messages,
    model: config.chatModel,
    temperature: 0.8,
  });

  return {
    reply: normaliseMessageText(payload.choices?.[0]?.message?.content).trim(),
  };
};

const handleDirectorSummary = async (input: DirectorSummaryInput, env: OpenRouterServerEnv) => {
  const config = getRuntimeConfig(env);
  const payload = await requestOpenRouter(env, {
    max_tokens: 260,
    messages: [
      {
        role: "system",
        content:
          "You are 司馬遷 serving as a cinematic mission director. Evaluate the player's performance as Lin Xiangru. Respond only with JSON matching the schema. Write all fields in Traditional Chinese except the grade, which should be one of S, A, B, C, D.",
      },
      {
        role: "user",
        content: `Current node: ${input.currentNode}
Time remaining: ${input.timeRemaining}
Stats: insight ${input.stats.insight}, leverage ${input.stats.leverage}, composure ${input.stats.composure}
Clues: ${input.clues.join("；") || "none"}
Mission log: ${input.missionLog.join("；") || "mission just started"}`,
      },
    ],
    model: config.chatModel,
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "director_summary",
        strict: true,
        schema: {
          type: "object",
          properties: {
            grade: {
              type: "string",
              enum: ["S", "A", "B", "C", "D"],
            },
            judgement: { type: "string" },
            nextStep: { type: "string" },
            strength: { type: "string" },
            title: { type: "string" },
            warning: { type: "string" },
          },
          required: ["grade", "judgement", "nextStep", "strength", "title", "warning"],
          additionalProperties: false,
        },
      },
    },
    temperature: 0.4,
  });

  const raw = normaliseMessageText(payload.choices?.[0]?.message?.content);
  return JSON.parse(raw) as DirectorSummary;
};

const handleClueImage = async (
  input: { prompt: string },
  env: OpenRouterServerEnv,
): Promise<GeneratedClueImage> => {
  const config = getRuntimeConfig(env);
  const payload = await requestOpenRouter(env, {
    image_config: {
      aspect_ratio: "16:9",
      image_size: "1K",
    },
    max_tokens: 120,
    messages: [
      {
        role: "user",
        content: input.prompt,
      },
    ],
    modalities: ["image", "text"],
    model: config.imageModel,
    stream: false,
    temperature: 0.7,
  });

  const message = payload.choices?.[0]?.message;
  const imageUrl = extractImageUrl(message?.images);
  if (!imageUrl) {
    throw new Error("OpenRouter did not return an image");
  }

  return {
    caption: normaliseMessageText(message?.content).trim() || "AI generated clue image",
    imageUrl,
  };
};

export const isOpenRouterAction = (value: string): value is OpenRouterAction =>
  value === "character-reply" || value === "director-summary" || value === "clue-image";

export const executeOpenRouterAction = async (
  action: OpenRouterAction,
  input: unknown,
  env: OpenRouterServerEnv = process.env,
) => {
  switch (action) {
    case "character-reply":
      return handleCharacterReply(asCharacterReplyInput(input), env);
    case "director-summary":
      return handleDirectorSummary(asDirectorSummaryInput(input), env);
    case "clue-image":
      return handleClueImage(asClueImageInput(input), env);
  }
};
