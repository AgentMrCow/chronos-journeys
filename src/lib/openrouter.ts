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

interface ProxyErrorResponse {
  error?: {
    message?: string;
  } | string;
}

const requestProxy = async <T>(action: string, body: Record<string, unknown>): Promise<T> => {
  const response = await fetch(`/api/openrouter/${action}`, {
    body: JSON.stringify(body),
    headers: {
      "Content-Type": "application/json",
    },
    method: "POST",
  });

  const payload = (await response.json()) as ProxyErrorResponse & T;
  if (!response.ok) {
    const errorMessage =
      typeof payload.error === "string"
        ? payload.error
        : payload.error?.message || "OpenRouter proxy request failed";
    throw new Error(errorMessage);
  }

  return payload;
};

export const generateCharacterReply = async (args: {
  currentNode: string;
  discoveredClues: string[];
  history: Array<{ role: "assistant" | "user"; text: string }>;
  prompt: string;
  systemPrompt: string;
}): Promise<string> => {
  const payload = await requestProxy<{ reply: string }>("character-reply", {
    currentNode: args.currentNode,
    discoveredClues: args.discoveredClues,
    history: args.history,
    prompt: args.prompt,
    systemPrompt: args.systemPrompt,
  });

  return payload.reply.trim();
};

export const generateDirectorSummary = async (args: {
  input: DirectorSummaryInput;
}): Promise<DirectorSummary> => requestProxy<DirectorSummary>("director-summary", args.input);

export const generateClueImage = async (args: {
  prompt: string;
}): Promise<GeneratedClueImage> => requestProxy<GeneratedClueImage>("clue-image", {
  prompt: args.prompt,
});
