const OPENROUTER_ENDPOINT = "https://openrouter.ai/api/v1/chat/completions";

export const DEFAULT_OPENROUTER_CHAT_MODEL =
  import.meta.env.VITE_OPENROUTER_CHAT_MODEL || "openai/gpt-4.1-mini";
export const DEFAULT_OPENROUTER_IMAGE_MODEL =
  import.meta.env.VITE_OPENROUTER_IMAGE_MODEL || "google/gemini-2.5-flash-image-preview";

export interface OpenRouterRuntimeConfig {
  apiKey: string;
  appName?: string;
  chatModel?: string;
  imageModel?: string;
  referer?: string;
}

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
  type?: string;
}

interface OpenRouterResponse {
  choices?: Array<{
    message?: {
      content?: string | Array<Record<string, unknown>>;
      images?: OpenRouterImagePart[];
      role?: string;
    };
  }>;
  error?: {
    message?: string;
  };
}

export interface GeneratedClueImage {
  caption: string;
  imageUrl: string;
}

const getHeaders = (config: OpenRouterRuntimeConfig) => {
  const headers: Record<string, string> = {
    Authorization: `Bearer ${config.apiKey}`,
    "Content-Type": "application/json",
  };

  if (config.referer || import.meta.env.VITE_OPENROUTER_REFERER) {
    headers["HTTP-Referer"] = config.referer || import.meta.env.VITE_OPENROUTER_REFERER!;
  }

  if (config.appName || import.meta.env.VITE_OPENROUTER_APP_NAME) {
    headers["X-Title"] = config.appName || import.meta.env.VITE_OPENROUTER_APP_NAME!;
  }

  return headers;
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

const requestOpenRouter = async (
  config: OpenRouterRuntimeConfig,
  body: Record<string, unknown>,
): Promise<OpenRouterResponse> => {
  const response = await fetch(OPENROUTER_ENDPOINT, {
    body: JSON.stringify(body),
    headers: getHeaders(config),
    method: "POST",
  });

  const payload = (await response.json()) as OpenRouterResponse;
  if (!response.ok) {
    throw new Error(payload.error?.message || "OpenRouter request failed");
  }

  return payload;
};

export const generateCharacterReply = async (args: {
  config: OpenRouterRuntimeConfig;
  currentNode: string;
  discoveredClues: string[];
  history: Array<{ role: "assistant" | "user"; text: string }>;
  prompt: string;
  systemPrompt: string;
}): Promise<string> => {
  const messages: OpenRouterMessage[] = [
    {
      role: "system",
      content: `${args.systemPrompt}

You are inside the "完璧歸趙" historical incident.
Current node: ${args.currentNode}
Known clues: ${args.discoveredClues.join("；") || "尚未發現關鍵線索"}

Stay historically plausible, answer in Traditional Chinese, and never reveal future facts your character could not know.`,
    },
    ...args.history.map((entry) => ({
      role: entry.role,
      content: entry.text,
    })),
    {
      role: "user",
      content: args.prompt,
    },
  ];

  const payload = await requestOpenRouter(args.config, {
    max_tokens: 220,
    messages,
    model: args.config.chatModel || DEFAULT_OPENROUTER_CHAT_MODEL,
    temperature: 0.8,
  });

  return normaliseMessageText(payload.choices?.[0]?.message?.content).trim();
};

export const generateDirectorSummary = async (args: {
  config: OpenRouterRuntimeConfig;
  input: DirectorSummaryInput;
}): Promise<DirectorSummary> => {
  const payload = await requestOpenRouter(args.config, {
    max_tokens: 260,
    messages: [
      {
        role: "system",
        content:
          "You are 司馬遷 serving as a cinematic mission director. Evaluate the player's performance as Lin Xiangru. Respond only with JSON matching the schema. Write all fields in Traditional Chinese except the grade, which should be one of S, A, B, C, D.",
      },
      {
        role: "user",
        content: `Current node: ${args.input.currentNode}
Time remaining: ${args.input.timeRemaining}
Stats: insight ${args.input.stats.insight}, leverage ${args.input.stats.leverage}, composure ${args.input.stats.composure}
Clues: ${args.input.clues.join("；") || "none"}
Mission log: ${args.input.missionLog.join("；") || "mission just started"}`,
      },
    ],
    model: args.config.chatModel || DEFAULT_OPENROUTER_CHAT_MODEL,
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
            judgement: {
              type: "string",
              description: "One short assessment of how Lin Xiangru is performing.",
            },
            nextStep: {
              type: "string",
              description: "The next most important strategic move.",
            },
            strength: {
              type: "string",
              description: "The player's clearest strength right now.",
            },
            title: {
              type: "string",
              description: "A dramatic headline for the mission status.",
            },
            warning: {
              type: "string",
              description: "The main danger if the player hesitates or misreads Qin.",
            },
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

export const generateClueImage = async (args: {
  config: OpenRouterRuntimeConfig;
  prompt: string;
}): Promise<GeneratedClueImage> => {
  const payload = await requestOpenRouter(args.config, {
    image_config: {
      aspect_ratio: "16:9",
      image_size: "1K",
    },
    max_tokens: 120,
    messages: [
      {
        role: "user",
        content: args.prompt,
      },
    ],
    modalities: ["image", "text"],
    model: args.config.imageModel || DEFAULT_OPENROUTER_IMAGE_MODEL,
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
