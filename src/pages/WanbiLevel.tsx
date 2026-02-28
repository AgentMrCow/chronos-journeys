import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  BookOpen,
  Brain,
  CheckCircle2,
  Clock3,
  Crown,
  Gem,
  Image as ImageIcon,
  Lock,
  MessageSquare,
  Mic2,
  RefreshCcw,
  RotateCcw,
  ScrollText,
  ShieldAlert,
  Sparkles,
  Volume2,
  WandSparkles,
} from "lucide-react";
import AccessibilityPanel from "@/components/AccessibilityPanel";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { AccessibilityProvider, useAccessibility } from "@/contexts/AccessibilityContext";
import {
  type CharacterId,
  type ClueId,
  type FailStateId,
  type MissionStats,
  type NodeId,
  type ProbeTopic,
  wanbiCharacters,
  wanbiClues,
  wanbiFailStates,
  wanbiInitialStats,
  wanbiNodeOrder,
  wanbiNodes,
  wanbiVictorySummary,
} from "@/data/wanbiLevel";
import {
  DEFAULT_OPENROUTER_CHAT_MODEL,
  DEFAULT_OPENROUTER_IMAGE_MODEL,
  type DirectorSummary,
  generateCharacterReply,
  generateClueImage,
  generateDirectorSummary,
} from "@/lib/openrouter";

type GamePhase = "briefing" | "lost" | "playing" | "won";
type PanelTab = "actions" | "conversation" | "clues" | "director";

interface ChatEntry {
  id: string;
  role: "assistant" | "user";
  source: "ai" | "fallback";
  text: string;
}

interface ActionLogEntry {
  id: string;
  kind: "decision" | "probe";
  label: string;
  nodeId: NodeId;
  outcome: string;
}

interface GeneratedImageState {
  caption?: string;
  error?: string;
  imageUrl?: string;
  status: "error" | "idle" | "loading" | "ready";
}

interface SceneHotspot {
  actionId?: string;
  characterId?: CharacterId;
  description: string;
  label: string;
  tone: "gold" | "jade";
  type: "action" | "character";
  x: string;
  y: string;
}

const sceneHotspots: Record<NodeId, SceneHotspot[]> = {
  "zhao-court": [
    {
      characterId: "zhaoWang",
      description: "與趙王當面定策",
      label: "趙王",
      tone: "gold",
      type: "character",
      x: "18%",
      y: "46%",
    },
    {
      characterId: "courtScribe",
      description: "檢視秦使國書與封泥",
      label: "史官",
      tone: "jade",
      type: "character",
      x: "77%",
      y: "38%",
    },
    {
      characterId: "zhaoCourier",
      description: "確認徑道與退路",
      label: "從者",
      tone: "jade",
      type: "character",
      x: "68%",
      y: "72%",
    },
    {
      actionId: "accept-mission",
      description: "從宮門啟程入秦",
      label: "出使門",
      tone: "gold",
      type: "action",
      x: "51%",
      y: "77%",
    },
    {
      actionId: "refuse-mission",
      description: "閉門拒秦",
      label: "退守",
      tone: "gold",
      type: "action",
      x: "31%",
      y: "78%",
    },
    {
      actionId: "gift-jade",
      description: "不驗誠意先獻璧",
      label: "先獻璧",
      tone: "gold",
      type: "action",
      x: "76%",
      y: "78%",
    },
  ],
  "xianyang-audience": [
    {
      characterId: "qinWang",
      description: "直面秦王",
      label: "秦王",
      tone: "gold",
      type: "character",
      x: "52%",
      y: "25%",
    },
    {
      characterId: "palaceAttendant",
      description: "旁敲宮中侍者",
      label: "侍者",
      tone: "jade",
      type: "character",
      x: "24%",
      y: "57%",
    },
    {
      characterId: "qinHistorian",
      description: "觀察秦廷史官",
      label: "秦史官",
      tone: "jade",
      type: "character",
      x: "76%",
      y: "56%",
    },
    {
      actionId: "claim-flaw",
      description: "在玉案前奪回主導權",
      label: "玉案",
      tone: "gold",
      type: "action",
      x: "49%",
      y: "73%",
    },
    {
      actionId: "public-accusation",
      description: "空手當庭翻臉",
      label: "當庭斥責",
      tone: "gold",
      type: "action",
      x: "28%",
      y: "75%",
    },
    {
      actionId: "hand-over",
      description: "任由秦廷把玩",
      label: "放手",
      tone: "gold",
      type: "action",
      x: "71%",
      y: "76%",
    },
  ],
  "pillar-delay": [
    {
      characterId: "qinChamberlain",
      description: "試探禮制漏洞",
      label: "內侍",
      tone: "jade",
      type: "character",
      x: "22%",
      y: "44%",
    },
    {
      characterId: "qinHistorian",
      description: "看秦廷記錄者的反應",
      label: "史官",
      tone: "jade",
      type: "character",
      x: "73%",
      y: "43%",
    },
    {
      characterId: "zhaoCourier",
      description: "與心腹從者交代退路",
      label: "從者",
      tone: "jade",
      type: "character",
      x: "65%",
      y: "70%",
    },
    {
      actionId: "invoke-ritual",
      description: "借殿柱與禮法奪回時間",
      label: "殿柱前",
      tone: "gold",
      type: "action",
      x: "49%",
      y: "38%",
    },
    {
      actionId: "smash-for-real",
      description: "真的碎璧",
      label: "碎璧",
      tone: "gold",
      type: "action",
      x: "40%",
      y: "72%",
    },
    {
      actionId: "demand-now",
      description: "逼秦王立刻交城",
      label: "逼城",
      tone: "gold",
      type: "action",
      x: "61%",
      y: "71%",
    },
  ],
  "return-route": [
    {
      characterId: "palaceAttendant",
      description: "問清宮門換班",
      label: "侍者",
      tone: "jade",
      type: "character",
      x: "25%",
      y: "39%",
    },
    {
      characterId: "zhaoCourier",
      description: "交代送璧細節",
      label: "從者",
      tone: "gold",
      type: "character",
      x: "64%",
      y: "57%",
    },
    {
      actionId: "trust-qin",
      description: "把命運交回秦廷",
      label: "留璧待命",
      tone: "gold",
      type: "action",
      x: "22%",
      y: "79%",
    },
    {
      actionId: "carry-yourself",
      description: "親自帶璧闖關",
      label: "親自出城",
      tone: "gold",
      type: "action",
      x: "48%",
      y: "81%",
    },
    {
      actionId: "send-courier",
      description: "讓從者懷璧從徑道亡",
      label: "西門徑道",
      tone: "gold",
      type: "action",
      x: "74%",
      y: "78%",
    },
  ],
};

const clamp = (value: number, min = 0, max = 100) => Math.min(max, Math.max(min, value));
const createId = () =>
  `${Date.now().toString(36)}-${Math.random().toString(36).replace(".", "").slice(0, 6)}`;

const buildFallbackSummary = (args: {
  actionLog: ActionLogEntry[];
  clueIds: ClueId[];
  currentNodeId: NodeId;
  stats: MissionStats;
  timeRemaining: number;
}): DirectorSummary => {
  const nodeTimeLimit = wanbiNodes[args.currentNodeId].timeLimit;
  const timeWarningThreshold = Math.max(12, Math.ceil(nodeTimeLimit * 0.3));
  const cluePressure =
    args.clueIds.length >= 4 ? "你已掌握幾個關鍵破綻。" : "還需要補幾條能站得住的證據。";
  const average = (args.stats.composure + args.stats.insight + args.stats.leverage) / 3;
  const grade =
    average >= 82 ? "S" : average >= 72 ? "A" : average >= 58 ? "B" : average >= 45 ? "C" : "D";

  const latestAction = args.actionLog.at(-1)?.label || "剛接手此事";
  const weakest =
    args.stats.insight <= args.stats.leverage && args.stats.insight <= args.stats.composure
      ? "洞察"
      : args.stats.leverage <= args.stats.composure
      ? "籌碼"
      : "膽識";

  return {
    grade,
    judgement: `眼下局勢接在「${latestAction}」之後。${cluePressure}`,
    nextStep:
      args.timeRemaining <= timeWarningThreshold
        ? "剩下的時間不多了，別再觀望，先做最能改變局面的那一步。"
        : `下一步宜先補強${weakest}，再把本章線索補齊。`,
    strength:
      args.stats.insight >= args.stats.leverage && args.stats.insight >= args.stats.composure
        ? "你已看出秦廷的用意，判斷方向是對的。"
        : args.stats.leverage >= args.stats.composure
        ? "玉璧與節奏暫時還握在你手裡。"
        : "你還撐得住場面，秦廷暫時不敢硬來。",
    title: `${wanbiNodes[args.currentNodeId].chapter} · 局勢評估`,
    warning:
      args.timeRemaining <= timeWarningThreshold
        ? "再拖下去，門禁和侍衛會先收緊。"
        : `若${weakest}再失手，下一步就容易出錯。`,
  };
};

const buildFallbackCharacterReply = (args: {
  discoveredClueIds: ClueId[];
  prompt: string;
  selectedCharacterId: CharacterId;
}) => {
  const character = wanbiCharacters[args.selectedCharacterId];
  const clueTone =
    args.discoveredClueIds.length === 0
      ? "你手上的硬線索還不夠。"
      : `你已掌握的重點包括：${args.discoveredClueIds
          .map((clueId) => wanbiClues[clueId].title)
          .join("、")}。`;

  return `${character.intro} ${clueTone} 關於「${args.prompt.slice(0, 28)}${
    args.prompt.length > 28 ? "…" : ""
  }」，${character.name}暫時只肯說到這裡。先把這一段能問的都問清楚，再往下追會更穩妥。`;
};

const getCurrentNodeImageClue = (currentNodeId: NodeId, clueIds: ClueId[]) => {
  const currentNode = wanbiNodes[currentNodeId];
  return clueIds
    .map((clueId) => wanbiClues[clueId])
    .find(
      (clue) =>
        Boolean(clue.imagePrompt) &&
        currentNode.probeTopics.some((topic) => topic.unlockClueId === clue.id),
    );
};

const applyStatDelta = (current: MissionStats, delta?: Partial<MissionStats>): MissionStats => ({
  composure: clamp(current.composure + (delta?.composure || 0)),
  insight: clamp(current.insight + (delta?.insight || 0)),
  leverage: clamp(current.leverage + (delta?.leverage || 0)),
});

const getNodeTimeLimit = (nodeId: NodeId) => wanbiNodes[nodeId].timeLimit;
const CUSTOM_QUESTION_TIME_COST = 4;

const GameEngine = () => {
  const navigate = useNavigate();
  const { speak, ttsEnabled } = useAccessibility();
  const [phase, setPhase] = useState<GamePhase>("briefing");
  const [currentNodeId, setCurrentNodeId] = useState<NodeId>("zhao-court");
  const [completedNodeIds, setCompletedNodeIds] = useState<NodeId[]>([]);
  const [discoveredClueIds, setDiscoveredClueIds] = useState<ClueId[]>([]);
  const [usedTopicIds, setUsedTopicIds] = useState<string[]>([]);
  const [timeRemaining, setTimeRemaining] = useState(getNodeTimeLimit("zhao-court"));
  const [stats, setStats] = useState<MissionStats>(wanbiInitialStats);
  const [selectedCharacterId, setSelectedCharacterId] = useState<CharacterId>(
    wanbiNodes["zhao-court"].availableCharacters[0],
  );
  const [selectedActionId, setSelectedActionId] = useState<string | null>(
    wanbiNodes["zhao-court"].strategicActions[0]?.id ?? null,
  );
  const [panelTab, setPanelTab] = useState<PanelTab>("actions");
  const [isConsoleOpen, setIsConsoleOpen] = useState(false);
  const [chatHistory, setChatHistory] = useState<Record<string, ChatEntry[]>>({});
  const [questionDraft, setQuestionDraft] = useState("");
  const [chatError, setChatError] = useState<string | null>(null);
  const [chatLoading, setChatLoading] = useState(false);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [directorSummary, setDirectorSummary] = useState<DirectorSummary>(() =>
      buildFallbackSummary({
        actionLog: [],
        clueIds: [],
        currentNodeId: "zhao-court",
        stats: wanbiInitialStats,
        timeRemaining: getNodeTimeLimit("zhao-court"),
      }),
  );
  const [summaryMode, setSummaryMode] = useState<"ai" | "fallback">("fallback");
  const [actionLog, setActionLog] = useState<ActionLogEntry[]>([]);
  const [generatedImages, setGeneratedImages] = useState<Record<string, GeneratedImageState>>({});
  const [activeFailStateId, setActiveFailStateId] = useState<FailStateId | null>(null);

  const runtimeApiKey = import.meta.env.VITE_OPENROUTER_API_KEY || "";
  const chatModel = import.meta.env.VITE_OPENROUTER_CHAT_MODEL || DEFAULT_OPENROUTER_CHAT_MODEL;
  const imageModel = import.meta.env.VITE_OPENROUTER_IMAGE_MODEL || DEFAULT_OPENROUTER_IMAGE_MODEL;

  const currentNode = wanbiNodes[currentNodeId];
  const currentCharacter = wanbiCharacters[selectedCharacterId];
  const selectedAction =
    currentNode.strategicActions.find((entry) => entry.id === selectedActionId) ||
    currentNode.strategicActions[0] ||
    null;
  const currentHotspots = sceneHotspots[currentNodeId];
  const activeCharacterTopics = currentNode.probeTopics.filter(
    (topic) => topic.characterId === selectedCharacterId,
  );
  const activeCharacterLog = chatHistory[selectedCharacterId] || [];
  const activeFailState = activeFailStateId ? wanbiFailStates[activeFailStateId] : null;
  const displayedImageClue = getCurrentNodeImageClue(currentNodeId, discoveredClueIds);
  const displayedImageState = displayedImageClue ? generatedImages[displayedImageClue.id] : undefined;
  const hasOpenRouter = runtimeApiKey.trim().length > 0;
  const currentNodeTimeLimit = currentNode.timeLimit;
  const timerWarningThreshold = Math.max(12, Math.ceil(currentNodeTimeLimit * 0.3));
  const timerProgress = (timeRemaining / currentNodeTimeLimit) * 100;
  const timerCritical = timeRemaining <= timerWarningThreshold;
  const isClockPaused = chatLoading || summaryLoading || phase !== "playing";

  const resetMission = useCallback(() => {
    setPhase("briefing");
    setCurrentNodeId("zhao-court");
    setCompletedNodeIds([]);
    setDiscoveredClueIds([]);
    setUsedTopicIds([]);
    setTimeRemaining(getNodeTimeLimit("zhao-court"));
    setStats(wanbiInitialStats);
    setSelectedCharacterId(wanbiNodes["zhao-court"].availableCharacters[0]);
    setSelectedActionId(wanbiNodes["zhao-court"].strategicActions[0]?.id ?? null);
    setPanelTab("actions");
    setIsConsoleOpen(false);
    setChatHistory({});
    setQuestionDraft("");
    setChatError(null);
    setChatLoading(false);
    setSummaryLoading(false);
    setDirectorSummary(
      buildFallbackSummary({
        actionLog: [],
        clueIds: [],
        currentNodeId: "zhao-court",
        stats: wanbiInitialStats,
        timeRemaining: getNodeTimeLimit("zhao-court"),
      }),
    );
    setSummaryMode("fallback");
    setActionLog([]);
    setGeneratedImages({});
    setActiveFailStateId(null);
  }, []);

  const failMission = useCallback((failStateId: FailStateId) => {
    setActiveFailStateId(failStateId);
    setPhase("lost");
  }, []);

  const appendChatEntry = useCallback((characterId: CharacterId, entry: ChatEntry) => {
    setChatHistory((current) => ({
      ...current,
      [characterId]: [...(current[characterId] || []), entry],
    }));
  }, []);

  const refreshDirectorSummary = useCallback(
    async (nextState?: {
      actionLog?: ActionLogEntry[];
      clueIds?: ClueId[];
      currentNodeId?: NodeId;
      stats?: MissionStats;
      timeRemaining?: number;
    }) => {
      const summaryInput = {
        actionLog: nextState?.actionLog || actionLog,
        clueIds: nextState?.clueIds || discoveredClueIds,
        currentNodeId: nextState?.currentNodeId || currentNodeId,
        stats: nextState?.stats || stats,
        timeRemaining: nextState?.timeRemaining ?? timeRemaining,
      };

      setSummaryLoading(true);
      try {
        if (!hasOpenRouter) {
          setDirectorSummary(buildFallbackSummary(summaryInput));
          setSummaryMode("fallback");
          return;
        }

        const summary = await generateDirectorSummary({
          config: {
            apiKey: runtimeApiKey,
            chatModel,
            imageModel,
          },
          input: {
            clues: summaryInput.clueIds.map((clueId) => wanbiClues[clueId].title),
            currentNode: wanbiNodes[summaryInput.currentNodeId].title,
            missionLog: summaryInput.actionLog.map((entry) => `${entry.label}：${entry.outcome}`),
            stats: summaryInput.stats,
            timeRemaining: summaryInput.timeRemaining,
          },
        });
        setDirectorSummary(summary);
        setSummaryMode("ai");
        if (ttsEnabled) {
          speak(`${summary.title}。${summary.judgement}`, { rate: 0.96 });
        }
      } catch {
        setDirectorSummary(buildFallbackSummary(summaryInput));
        setSummaryMode("fallback");
      } finally {
        setSummaryLoading(false);
      }
    },
    [
      actionLog,
      chatModel,
      currentNodeId,
      discoveredClueIds,
      hasOpenRouter,
      imageModel,
      runtimeApiKey,
      speak,
      stats,
      timeRemaining,
      ttsEnabled,
    ],
  );

  useEffect(() => {
    setSelectedCharacterId(currentNode.availableCharacters[0]);
    setSelectedActionId(currentNode.strategicActions[0]?.id ?? null);
    setPanelTab("actions");
    setIsConsoleOpen(false);
  }, [currentNode.availableCharacters, currentNode.strategicActions]);

  useEffect(() => {
    if (phase !== "playing" || isClockPaused) return;
    const timer = window.setInterval(() => {
      setTimeRemaining((current) => (current <= 1 ? 0 : current - 1));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [isClockPaused, phase]);

  useEffect(() => {
    if (phase === "playing" && timeRemaining <= 0) {
      failMission("timeExpired");
    }
  }, [failMission, phase, timeRemaining]);

  useEffect(() => {
    if (phase !== "playing" || !ttsEnabled) return;
    speak(`${currentNode.title}。${currentNode.nodeSummary}`, { rate: 0.95 });
  }, [currentNode, phase, speak, ttsEnabled]);

  useEffect(() => {
    if (!hasOpenRouter) return;
    const imageClues = discoveredClueIds
      .map((clueId) => wanbiClues[clueId])
      .filter((clue) => clue.imagePrompt);

    imageClues.forEach((clue) => {
      const imageState = generatedImages[clue.id];
      if (imageState && (imageState.status === "loading" || imageState.status === "ready")) return;

      setGeneratedImages((current) => ({
        ...current,
        [clue.id]: { status: "loading" },
      }));

      void generateClueImage({
        config: {
          apiKey: runtimeApiKey,
          chatModel,
          imageModel,
        },
        prompt: clue.imagePrompt!,
      })
        .then((result) => {
          setGeneratedImages((current) => ({
            ...current,
            [clue.id]: {
              caption: result.caption,
              imageUrl: result.imageUrl,
              status: "ready",
            },
          }));
        })
        .catch((error) => {
          setGeneratedImages((current) => ({
            ...current,
            [clue.id]: {
              error: error instanceof Error ? error.message : "Unable to generate image",
              status: "error",
            },
          }));
        });
    });
  }, [chatModel, discoveredClueIds, generatedImages, hasOpenRouter, imageModel, runtimeApiKey]);

  const startMission = async () => {
    setPhase("playing");
    setActiveFailStateId(null);
    setIsConsoleOpen(false);
    await refreshDirectorSummary({
      actionLog: [],
      clueIds: [],
      currentNodeId: "zhao-court",
      stats: wanbiInitialStats,
      timeRemaining: getNodeTimeLimit("zhao-court"),
    });
  };

  const applyTimeCost = (cost: number) => {
    const remaining = Math.max(0, timeRemaining - cost);
    setTimeRemaining(remaining);
    return remaining;
  };

  const revealClue = (clueId?: ClueId) => {
    if (!clueId) return discoveredClueIds;
    const nextClues = discoveredClueIds.includes(clueId)
      ? discoveredClueIds
      : [...discoveredClueIds, clueId];
    setDiscoveredClueIds(nextClues);
    return nextClues;
  };

  const handleProbe = async (topic: ProbeTopic) => {
    if (phase !== "playing" || chatLoading || usedTopicIds.includes(topic.id)) return;

    const remainingAfterAction = applyTimeCost(topic.timeCost);
    const clueIdsAfterProbe = revealClue(topic.unlockClueId);
    const nextStats = applyStatDelta(
      stats,
      topic.rewardStat ? { [topic.rewardStat]: 6 } : undefined,
    );
    const nextLog: ActionLogEntry[] = [
      ...actionLog,
      {
        id: createId(),
        kind: "probe",
        label: topic.label,
        nodeId: currentNodeId,
        outcome: topic.unlockClueId
          ? `取得線索：${wanbiClues[topic.unlockClueId].title}`
          : "完成一次試探",
      },
    ];

    setStats(nextStats);
    setActionLog(nextLog);
    setUsedTopicIds((current) => [...current, topic.id]);
    setPanelTab("conversation");

    appendChatEntry(topic.characterId, {
      id: createId(),
      role: "user",
      source: "fallback",
      text: topic.prompt,
    });

    setChatError(null);
    setChatLoading(true);
    try {
      const reply = hasOpenRouter
        ? await generateCharacterReply({
            config: {
              apiKey: runtimeApiKey,
              chatModel,
              imageModel,
            },
            currentNode: currentNode.title,
            discoveredClues: clueIdsAfterProbe.map((clueId) => wanbiClues[clueId].summary),
            history: (chatHistory[topic.characterId] || []).map((entry) => ({
              role: entry.role,
              text: entry.text,
            })),
            prompt: topic.prompt,
            systemPrompt: wanbiCharacters[topic.characterId].systemPrompt,
          })
        : topic.fallbackReply;

      appendChatEntry(topic.characterId, {
        id: createId(),
        role: "assistant",
        source: hasOpenRouter ? "ai" : "fallback",
        text: reply || topic.fallbackReply,
      });
      if (ttsEnabled) {
        speak(reply || topic.fallbackReply, { rate: 0.97 });
      }
    } catch (error) {
      appendChatEntry(topic.characterId, {
        id: createId(),
        role: "assistant",
        source: "fallback",
        text: topic.fallbackReply,
      });
      setChatError(
        error instanceof Error ? `對話服務暫時無法使用：${error.message}` : "對話服務暫時無法使用。",
      );
    } finally {
      setChatLoading(false);
      if (remainingAfterAction <= 0) {
        failMission("timeExpired");
        return;
      }
      await refreshDirectorSummary({
        actionLog: nextLog,
        clueIds: clueIdsAfterProbe,
        currentNodeId,
        stats: nextStats,
        timeRemaining: remainingAfterAction,
      });
    }
  };

  const handleCustomQuestion = async () => {
    if (phase !== "playing" || chatLoading || !questionDraft.trim()) return;
    const prompt = questionDraft.trim();
    const remainingAfterAction = applyTimeCost(CUSTOM_QUESTION_TIME_COST);
    setPanelTab("conversation");
    appendChatEntry(selectedCharacterId, {
      id: createId(),
      role: "user",
      source: "fallback",
      text: prompt,
    });
    setQuestionDraft("");
    setChatError(
      hasOpenRouter ? null : "目前未連上對話服務。請確認已設定 VITE_OPENROUTER_API_KEY，並重新啟動開發伺服器。",
    );
    setChatLoading(true);

    try {
      const reply = hasOpenRouter
        ? await generateCharacterReply({
            config: {
              apiKey: runtimeApiKey,
              chatModel,
              imageModel,
            },
            currentNode: currentNode.title,
            discoveredClues: discoveredClueIds.map((clueId) => wanbiClues[clueId].summary),
            history: (chatHistory[selectedCharacterId] || []).map((entry) => ({
              role: entry.role,
              text: entry.text,
            })),
            prompt,
            systemPrompt: currentCharacter.systemPrompt,
          })
        : buildFallbackCharacterReply({
            discoveredClueIds,
            prompt,
            selectedCharacterId,
          });

      appendChatEntry(selectedCharacterId, {
        id: createId(),
        role: "assistant",
        source: hasOpenRouter ? "ai" : "fallback",
        text: reply,
      });
      if (ttsEnabled) {
        speak(reply, { rate: 0.97 });
      }
    } catch (error) {
      appendChatEntry(selectedCharacterId, {
        id: createId(),
        role: "assistant",
        source: "fallback",
        text: buildFallbackCharacterReply({
          discoveredClueIds,
          prompt,
          selectedCharacterId,
        }),
      });
      setChatError(
        error instanceof Error ? `對話服務暫時無法使用：${error.message}` : "對話服務暫時無法使用。",
      );
    } finally {
      setChatLoading(false);
      if (remainingAfterAction <= 0) {
        failMission("timeExpired");
      }
    }
  };

  const handleStrategicAction = async (actionId: string) => {
    if (phase !== "playing") return;
    const action = currentNode.strategicActions.find((entry) => entry.id === actionId);
    if (!action) return;

    const missingClues =
      action.requiredClueIds?.filter((clueId) => !discoveredClueIds.includes(clueId)) || [];
    if (missingClues.length > 0) return;

    const remainingAfterAction = applyTimeCost(action.timeCost);
    const nextStats = applyStatDelta(stats, action.statChanges);
    const nextLog: ActionLogEntry[] = [
      ...actionLog,
      {
        id: createId(),
        kind: "decision",
        label: action.label,
        nodeId: currentNodeId,
        outcome: action.consequence,
      },
    ];

    setStats(nextStats);
    setActionLog(nextLog);
    setPanelTab("actions");

    if (remainingAfterAction <= 0) {
      await refreshDirectorSummary({
        actionLog: nextLog,
        clueIds: discoveredClueIds,
        currentNodeId,
        stats: nextStats,
        timeRemaining: remainingAfterAction,
      });
      failMission("timeExpired");
      return;
    }

    if (action.failStateId) {
      await refreshDirectorSummary({
        actionLog: nextLog,
        clueIds: discoveredClueIds,
        currentNodeId,
        stats: nextStats,
        timeRemaining: remainingAfterAction,
      });
      failMission(action.failStateId);
      return;
    }

    if (action.winMission) {
      await refreshDirectorSummary({
        actionLog: nextLog,
        clueIds: discoveredClueIds,
        currentNodeId,
        stats: nextStats,
        timeRemaining: remainingAfterAction,
      });
      setPhase("won");
      return;
    }

    if (action.nextNodeId) {
      const nextCompleted = completedNodeIds.includes(currentNodeId)
        ? completedNodeIds
        : [...completedNodeIds, currentNodeId];
      const nextNodeTimeLimit = getNodeTimeLimit(action.nextNodeId);
      setCompletedNodeIds(nextCompleted);
      setCurrentNodeId(action.nextNodeId);
      setTimeRemaining(nextNodeTimeLimit);
      await refreshDirectorSummary({
        actionLog: nextLog,
        clueIds: discoveredClueIds,
        currentNodeId: action.nextNodeId,
        stats: nextStats,
        timeRemaining: nextNodeTimeLimit,
      });
      return;
    }

    await refreshDirectorSummary({
      actionLog: nextLog,
      clueIds: discoveredClueIds,
      currentNodeId,
      stats: nextStats,
      timeRemaining: remainingAfterAction,
    });
  };

  const renderHotspot = (hotspot: SceneHotspot) => {
    const toneClasses =
      hotspot.tone === "gold"
        ? "border-gold/60 bg-gold/15 text-gold shadow-gold/20"
        : "border-jade/60 bg-jade/15 text-jade shadow-jade/20";

    if (hotspot.type === "character" && hotspot.characterId) {
      const character = wanbiCharacters[hotspot.characterId];
      const selected = selectedCharacterId === hotspot.characterId && panelTab === "conversation";

      return (
        <button
          key={`${currentNodeId}-${hotspot.characterId}`}
          onClick={() => {
            setSelectedCharacterId(hotspot.characterId!);
            setPanelTab("conversation");
            setIsConsoleOpen(true);
          }}
          className={`absolute z-20 -translate-x-1/2 -translate-y-1/2 rounded-full border px-3 py-2 shadow-xl backdrop-blur-md transition-all hover:scale-105 ${toneClasses} ${
            selected ? "ring-2 ring-gold/60" : ""
          }`}
          style={{ left: hotspot.x, top: hotspot.y }}
        >
          <div className="flex items-center gap-2">
            {character.avatar ? (
              <img
                src={character.avatar}
                alt={character.name}
                className="h-10 w-10 rounded-full border border-current/40 object-cover"
              />
            ) : (
              <div className="flex h-10 w-10 items-center justify-center rounded-full border border-current/40 bg-background/50 font-serif text-base">
                {character.name.slice(0, 1)}
              </div>
            )}
            <div className="text-left">
              <p className="font-serif text-sm">{character.name}</p>
              <p className="text-[11px] text-parchment/80">{hotspot.description}</p>
            </div>
          </div>
        </button>
      );
    }

    const action = currentNode.strategicActions.find((entry) => entry.id === hotspot.actionId);
    if (!action) return null;

    const missingClues =
      action.requiredClueIds?.filter((clueId) => !discoveredClueIds.includes(clueId)) || [];
    const selected = selectedActionId === action.id && panelTab === "actions";

    return (
      <button
        key={`${currentNodeId}-${action.id}`}
        onClick={() => {
          setSelectedActionId(action.id);
          setPanelTab("actions");
          setIsConsoleOpen(true);
        }}
        className={`absolute z-20 -translate-x-1/2 -translate-y-1/2 rounded-full border px-4 py-3 shadow-xl backdrop-blur-md transition-all hover:scale-105 ${toneClasses} ${
          selected ? "ring-2 ring-gold/60" : ""
        }`}
        style={{ left: hotspot.x, top: hotspot.y }}
      >
        <div className="flex items-center gap-2">
          {missingClues.length > 0 ? <Lock className="h-4 w-4" /> : <WandSparkles className="h-4 w-4" />}
          <div className="text-left">
            <p className="font-serif text-sm">{hotspot.label}</p>
            <p className="text-[11px] text-parchment/80">{hotspot.description}</p>
          </div>
        </div>
      </button>
    );
  };

  const selectedActionMissingClues =
    selectedAction?.requiredClueIds?.filter((clueId) => !discoveredClueIds.includes(clueId)) || [];

  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      <AnimatePresence mode="wait">
        <motion.img
          key={currentNode.background}
          src={currentNode.background}
          alt=""
          initial={{ opacity: 0.2, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0.2, scale: 1.03 }}
          transition={{ duration: 0.9 }}
          className="absolute inset-0 h-full w-full object-cover"
        />
      </AnimatePresence>

      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(227,181,76,0.18),transparent_35%),linear-gradient(180deg,rgba(7,7,7,0.12),rgba(7,7,7,0.32)_32%,rgba(7,7,7,0.56)_58%,rgba(7,7,7,0.74))]" />
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(0,0,0,0.28),transparent_28%,transparent_72%,rgba(0,0,0,0.24))]" />

      <div className="relative z-10 min-h-screen">
        <div className="absolute inset-x-0 top-0 z-30 p-3 md:p-4">
          <div className="rounded-[26px] border border-gold/20 bg-background/25 px-3 py-3 backdrop-blur-lg">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="flex min-w-0 items-center gap-3">
                <button
                  onClick={() => navigate("/")}
                  className="rounded-full border border-border bg-background/35 p-2.5 text-muted-foreground transition-colors hover:border-gold/40 hover:text-gold"
                >
                  <ArrowLeft className="h-4 w-4" />
                </button>

                <div className="min-w-0">
                  <p className="text-[11px] uppercase tracking-[0.28em] text-gold/70">
                    {currentNode.chapter}
                  </p>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                    <h1 className="font-serif text-2xl text-shimmer md:text-3xl">完璧歸趙</h1>
                    <span className="text-sm text-gold">{currentNode.title}</span>
                  </div>
                  <p className="mt-1 line-clamp-1 text-xs text-parchment/85 md:max-w-2xl">
                    {currentNode.missionObjective}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-end gap-2">
                <div className="rounded-full border border-border/70 bg-background/40 px-3 py-2 text-xs">
                  <div className="mb-1 flex items-center gap-2 text-muted-foreground">
                    <Clock3 className="h-3.5 w-3.5 text-vermillion" />
                    <span>{timerCritical ? "情勢緊迫" : "尚可周旋"}</span>
                    <span className={`font-serif text-sm ${timerCritical ? "text-vermillion" : "text-gold"}`}>
                      {timeRemaining}s
                    </span>
                  </div>
                  <Progress
                    value={timerProgress}
                    className={`h-1.5 w-28 ${timerCritical ? "[&>div]:bg-vermillion" : "[&>div]:bg-gold"}`}
                  />
                </div>
                <span className="rounded-full border border-border/70 bg-background/40 px-3 py-2 text-xs text-muted-foreground">
                  本幕 {currentNodeTimeLimit}s
                </span>
                <span className="rounded-full border border-border/70 bg-background/40 px-3 py-2 text-xs text-jade">
                  洞察 {stats.insight}
                </span>
                <span className="rounded-full border border-border/70 bg-background/40 px-3 py-2 text-xs text-gold">
                  籌碼 {stats.leverage}
                </span>
                <span className="rounded-full border border-border/70 bg-background/40 px-3 py-2 text-xs text-parchment">
                  膽識 {stats.composure}
                </span>
                <span className="hidden rounded-full border border-border/70 bg-background/40 px-3 py-2 text-xs text-muted-foreground md:inline-flex">
                  線索 {discoveredClueIds.length}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="absolute inset-0 z-20 pt-20 md:pt-24">
          {phase === "playing" &&
            currentHotspots.map((hotspot) => (
              <motion.div
                key={`${currentNodeId}-${hotspot.type}-${hotspot.characterId || hotspot.actionId}`}
                initial={{ opacity: 0, scale: 0.92 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.25 }}
              >
                {renderHotspot(hotspot)}
              </motion.div>
            ))}
        </div>

        <div
          className={`absolute bottom-0 left-0 right-0 z-30 p-3 md:bottom-4 md:left-auto md:right-4 md:p-0 ${
            isConsoleOpen
              ? "md:w-[min(920px,calc(100vw-2rem))]"
              : "md:w-[min(540px,calc(100vw-2rem))]"
          }`}
        >
          <div className="rounded-[28px] border border-gold/20 bg-background/45 p-3 backdrop-blur-2xl">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap gap-2">
                {([
                  ["actions", "場景行動", WandSparkles],
                  ["conversation", "人物對談", MessageSquare],
                  ["clues", "線索卷宗", BookOpen],
                  ["director", "局勢評估", Brain],
                ] as const).map(([value, label, Icon]) => (
                  <button
                    key={value}
                    onClick={() => {
                      setPanelTab(value);
                      setIsConsoleOpen(true);
                    }}
                    className={`inline-flex items-center gap-2 rounded-full border px-3 py-2 text-xs transition-colors ${
                      panelTab === value
                        ? "border-gold/50 bg-gold/10 text-gold"
                        : "border-border/70 text-muted-foreground hover:border-gold/30 hover:text-gold"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {label}
                  </button>
                ))}
              </div>
              <button
                onClick={() => setIsConsoleOpen((current) => !current)}
                className="rounded-full border border-border/70 px-3 py-2 text-xs text-muted-foreground transition-colors hover:border-gold/30 hover:text-gold"
              >
                {isConsoleOpen ? "收合面板" : "展開面板"}
              </button>
            </div>

            {!isConsoleOpen && (
              <div className="mt-3 rounded-2xl border border-border/60 bg-background/30 px-4 py-3 text-xs text-parchment/80">
                先點場景中的人物或地點，再決定下一步。已完成章節{" "}
                {completedNodeIds.length + (phase === "briefing" ? 0 : 1)}。
              </div>
            )}

            {isConsoleOpen && (
              <div className="mt-3 max-h-[42vh] overflow-y-auto pr-1">
                {panelTab === "actions" && selectedAction && (
                  <div className="grid h-full gap-4 xl:grid-cols-[0.9fr_1.1fr]">
                    <div className="rounded-[26px] border border-border/70 bg-background/45 p-5">
                      <p className="mb-2 text-xs uppercase tracking-[0.28em] text-gold/70">
                        目前選項
                      </p>
                      <h3 className="font-serif text-2xl text-foreground">{selectedAction.label}</h3>
                      <p className="mt-3 text-sm leading-7 text-muted-foreground">
                        {selectedAction.detail}
                      </p>
                      <p className="mt-3 text-sm leading-7 text-parchment/90">
                        {selectedAction.consequence}
                      </p>

                      <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                        <span className="rounded-full border border-border px-3 py-1">
                          時間消耗 -{selectedAction.timeCost}s
                        </span>
                        {selectedAction.winMission && (
                          <span className="rounded-full border border-jade/30 px-3 py-1 text-jade">
                            關鍵行動
                          </span>
                        )}
                      </div>

                      {selectedActionMissingClues.length > 0 ? (
                        <div className="mt-4 rounded-2xl border border-border/70 bg-secondary/35 p-4">
                          <div className="mb-2 flex items-center gap-2 text-gold">
                            <Lock className="h-4 w-4" />
                            尚缺線索
                          </div>
                          <p className="text-sm leading-7 text-muted-foreground">
                            {selectedActionMissingClues
                              .map((clueId) => wanbiClues[clueId].title)
                              .join("、")}
                          </p>
                        </div>
                      ) : (
                        <button
                          onClick={() => void handleStrategicAction(selectedAction.id)}
                          disabled={phase !== "playing"}
                          className="mt-5 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-opacity disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          執行這個動作
                        </button>
                      )}
                    </div>

                    <div className="rounded-[26px] border border-border/70 bg-background/45 p-5">
                      <div className="mb-3 flex items-center gap-2 text-gold">
                        <Crown className="h-4 w-4" />
                        可選動作
                      </div>
                      <div className="grid gap-3 md:grid-cols-2">
                        {currentNode.strategicActions.map((action) => {
                          const missingClues =
                            action.requiredClueIds?.filter(
                              (clueId) => !discoveredClueIds.includes(clueId),
                            ) || [];

                          return (
                            <button
                              key={action.id}
                              onClick={() => {
                                setSelectedActionId(action.id);
                                setIsConsoleOpen(true);
                              }}
                              className={`rounded-2xl border p-4 text-left transition-colors ${
                                selectedAction.id === action.id
                                  ? "border-gold/50 bg-gold/10"
                                  : "border-border/60 bg-secondary/30 hover:border-gold/30"
                              }`}
                            >
                              <div className="mb-2 flex items-center gap-2">
                                {missingClues.length > 0 ? (
                                  <Lock className="h-4 w-4 text-muted-foreground" />
                                ) : (
                                  <WandSparkles className="h-4 w-4 text-gold" />
                                )}
                                <span className="font-serif text-lg text-foreground">
                                  {action.label}
                                </span>
                              </div>
                              <p className="text-xs leading-6 text-muted-foreground">{action.detail}</p>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}

              {panelTab === "conversation" && (
                <div className="grid h-full gap-4 xl:grid-cols-[0.88fr_1.12fr]">
                  <div className="rounded-[26px] border border-border/70 bg-background/45 p-5">
                    <div className="mb-4 grid gap-2 sm:grid-cols-2 2xl:grid-cols-2">
                      {currentNode.availableCharacters.map((characterId) => {
                        const character = wanbiCharacters[characterId];
                        const selected = selectedCharacterId === characterId;

                        return (
                          <button
                            key={character.id}
                            onClick={() => {
                              setSelectedCharacterId(characterId);
                              setIsConsoleOpen(true);
                            }}
                            className={`rounded-2xl border p-4 text-left transition-colors ${
                              selected
                                ? "border-gold/50 bg-gold/10"
                                : "border-border/60 bg-secondary/30 hover:border-gold/30"
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              {character.avatar ? (
                                <img
                                  src={character.avatar}
                                  alt={character.name}
                                  className="h-12 w-12 rounded-full border border-gold/20 object-cover"
                                />
                              ) : (
                                <div className="flex h-12 w-12 items-center justify-center rounded-full border border-gold/20 bg-background/50 font-serif text-lg text-gold">
                                  {character.name.slice(0, 1)}
                                </div>
                              )}
                              <div>
                                <p className="font-serif text-lg text-foreground">{character.name}</p>
                                <p className="text-xs text-muted-foreground">{character.role}</p>
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>

                    <div className="rounded-2xl border border-border/60 bg-secondary/30 p-4">
                      <div className="mb-2 flex items-center gap-2 text-gold">
                        <Mic2 className="h-4 w-4" />
                        {currentCharacter.name}
                      </div>
                      <p className="text-sm leading-7 text-muted-foreground">{currentCharacter.intro}</p>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2">
                      {activeCharacterTopics.length === 0 ? (
                        <p className="text-sm text-muted-foreground">
                          這名角色在這一段沒有固定線索，但還是可以直接發問。
                        </p>
                      ) : (
                        activeCharacterTopics.map((topic) => (
                          <button
                            key={topic.id}
                            onClick={() => void handleProbe(topic)}
                            disabled={phase !== "playing" || usedTopicIds.includes(topic.id) || chatLoading}
                            className={`rounded-full border px-3 py-2 text-xs transition-colors ${
                              usedTopicIds.includes(topic.id)
                                ? "cursor-not-allowed border-border/50 text-muted-foreground"
                                : "border-gold/30 text-gold hover:bg-gold/10"
                            }`}
                          >
                            {topic.label} · -{topic.timeCost}s
                          </button>
                        ))
                      )}
                    </div>
                  </div>

                  <div className="rounded-[26px] border border-border/70 bg-background/45 p-5">
                    <ScrollArea className="h-40 rounded-2xl border border-border/60 bg-secondary/30 p-4 md:h-44">
                      <div className="space-y-3 pr-3">
                        {activeCharacterLog.length === 0 ? (
                          <p className="text-sm leading-7 text-muted-foreground">
                            先點人物，或從上方問題開始問。
                          </p>
                        ) : (
                          activeCharacterLog.map((entry) => (
                            <div
                              key={entry.id}
                              className={`rounded-2xl p-3 ${
                                entry.role === "user"
                                  ? "ml-8 border border-gold/25 bg-gold/10"
                                  : "mr-4 border border-border/60 bg-background/60"
                              }`}
                            >
                              <div className="mb-1 flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                                {entry.role === "user" ? "Lin Xiangru" : currentCharacter.name}
                                {entry.source === "ai" && <Sparkles className="h-3 w-3 text-gold" />}
                              </div>
                              <p className="text-sm leading-7 text-foreground">{entry.text}</p>
                              {entry.role === "assistant" && (
                                <button
                                  onClick={() => speak(entry.text, { rate: 0.98 })}
                                  className="mt-2 flex items-center gap-1 text-xs text-muted-foreground hover:text-gold"
                                >
                                  <Volume2 className="h-3.5 w-3.5" />
                                  朗讀
                                </button>
                              )}
                            </div>
                          ))
                        )}
                      </div>
                    </ScrollArea>

                    <div className="mt-4 space-y-3">
                      <Textarea
                        value={questionDraft}
                        onChange={(event) => setQuestionDraft(event.target.value)}
                        placeholder="想問什麼，就直接開口。"
                        className="min-h-[96px] rounded-2xl bg-background/65"
                      />
                      {chatError && (
                        <p className="text-sm text-muted-foreground">{chatError}</p>
                      )}
                      <button
                        onClick={() => void handleCustomQuestion()}
                        disabled={phase !== "playing" || chatLoading || !questionDraft.trim()}
                        className="rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition-opacity disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {chatLoading ? "對方回話中…" : `發問 -${CUSTOM_QUESTION_TIME_COST}s`}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {panelTab === "clues" && (
                <div className="grid h-full gap-4 xl:grid-cols-[0.9fr_1.1fr]">
                  <div className="rounded-[26px] border border-border/70 bg-background/45 p-5">
                    <div className="mb-3 flex items-center gap-2 text-gold">
                      <BookOpen className="h-4 w-4" />
                      線索卷宗
                    </div>
                    <ScrollArea className="h-48 pr-3 md:h-56">
                      <div className="space-y-3">
                        {discoveredClueIds.length === 0 ? (
                          <p className="text-sm leading-7 text-muted-foreground">
                            目前還沒有可靠線索，先去接觸人物或地點。
                          </p>
                        ) : (
                          discoveredClueIds.map((clueId) => {
                            const clue = wanbiClues[clueId];
                            return (
                              <div
                                key={clue.id}
                                className="rounded-2xl border border-border/60 bg-secondary/30 p-4"
                              >
                                <div className="mb-2 flex items-center gap-2 text-gold">
                                  <CheckCircle2 className="h-4 w-4" />
                                  <p className="font-serif text-lg text-foreground">{clue.title}</p>
                                </div>
                                <p className="text-sm leading-7 text-foreground">{clue.summary}</p>
                                <p className="mt-2 text-xs leading-6 text-muted-foreground">
                                  {clue.historicalMeaning}
                                </p>
                              </div>
                            );
                          })
                        )}
                      </div>
                    </ScrollArea>
                  </div>

                  <div className="rounded-[26px] border border-border/70 bg-background/45 p-5">
                    <div className="mb-3 flex items-center gap-2 text-gold">
                      <ImageIcon className="h-4 w-4" />
                      參考畫面
                    </div>

                    {displayedImageClue ? (
                      <div className="space-y-3">
                        <div className="rounded-2xl border border-border/60 bg-secondary/30 p-4">
                          <p className="font-serif text-lg text-foreground">
                            {displayedImageClue.imageTitle}
                          </p>
                          <p className="mt-1 text-sm leading-7 text-muted-foreground">
                            {displayedImageClue.summary}
                          </p>
                        </div>

                        {displayedImageState?.status === "ready" ? (
                          <img
                            src={displayedImageState.imageUrl}
                            alt={displayedImageClue.imageTitle}
                            className="h-56 w-full rounded-2xl border border-gold/20 object-cover shadow-lg shadow-black/30"
                          />
                        ) : displayedImageState?.status === "loading" ? (
                          <div className="flex h-56 items-center justify-center rounded-2xl border border-border/60 bg-secondary/30 text-sm text-muted-foreground">
                            畫面準備中…
                          </div>
                        ) : displayedImageState?.status === "error" ? (
                          <div className="rounded-2xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-muted-foreground">
                            {displayedImageState.error}
                          </div>
                        ) : (
                          <div className="flex h-56 items-center justify-center rounded-2xl border border-dashed border-border/60 bg-secondary/30 text-sm text-muted-foreground">
                            {hasOpenRouter
                              ? "這條線索已解鎖，稍後會顯示對應畫面。"
                              : "目前無法顯示這條線索的畫面。"}
                          </div>
                        )}

                        <p className="text-xs leading-6 text-muted-foreground">
                          {displayedImageState?.caption || displayedImageClue.sourceReference}
                        </p>
                      </div>
                    ) : (
                      <div className="flex h-full min-h-56 items-center justify-center rounded-2xl border border-dashed border-border/60 bg-secondary/30 px-6 text-center text-sm text-muted-foreground">
                        取得帶圖像的線索後，這裡會顯示對應畫面。
                      </div>
                    )}
                  </div>
                </div>
              )}

              {panelTab === "director" && (
                <div className="grid h-full gap-4 xl:grid-cols-[0.9fr_1.1fr]">
                  <div className="rounded-[26px] border border-border/70 bg-background/45 p-5">
                    <div className="mb-3 flex items-center justify-between gap-3">
                      <div>
                        <p className="font-serif text-2xl text-foreground">{directorSummary.title}</p>
                        <p className="text-xs uppercase tracking-[0.2em] text-gold">
                          評級 {directorSummary.grade} · {summaryMode === "ai" ? "即時分析" : "本地分析"}
                        </p>
                      </div>
                      <button
                        onClick={() => void refreshDirectorSummary()}
                        disabled={summaryLoading}
                        className="rounded-full border border-border px-3 py-2 text-xs text-muted-foreground transition-colors hover:border-gold/40 hover:text-gold disabled:opacity-50"
                      >
                        <span className="inline-flex items-center gap-1">
                          <RefreshCcw className="h-3.5 w-3.5" />
                          更新
                        </span>
                      </button>
                    </div>

                    <div className="space-y-3 text-sm leading-7">
                      <p>
                        <span className="text-gold">評估：</span>
                        {directorSummary.judgement}
                      </p>
                      <p>
                        <span className="text-gold">有利處：</span>
                        {directorSummary.strength}
                      </p>
                      <p>
                        <span className="text-gold">風險：</span>
                        {directorSummary.warning}
                      </p>
                      <p>
                        <span className="text-gold">建議：</span>
                        {directorSummary.nextStep}
                      </p>
                    </div>
                  </div>

                  <div className="grid gap-4">
                    <div className="rounded-[26px] border border-border/70 bg-background/45 p-5">
                      <div className="mb-3 flex items-center gap-2 text-gold">
                        <Crown className="h-4 w-4" />
                        任務提示
                      </div>
                      <p className="text-sm leading-7 text-muted-foreground">
                        先確認秦廷是不是照交換之禮行事，再決定何時取回玉璧。若路線與門禁還沒摸清，就別急著把牌打完。
                      </p>
                    </div>

                    <div className="rounded-[26px] border border-border/70 bg-background/45 p-5">
                      <div className="mb-3 flex items-center gap-2 text-gold">
                        <Mic2 className="h-4 w-4" />
                        語音
                      </div>
                      <p className="text-sm leading-7 text-muted-foreground">
                        需要朗讀時，可用左下角設定調整聲音與字體大小。
                      </p>
                      <button
                        onClick={() => speak(directorSummary.judgement, { rate: 0.96 })}
                        className="mt-4 rounded-full border border-border px-4 py-2 text-sm text-muted-foreground transition-colors hover:border-gold/40 hover:text-gold"
                      >
                        朗讀評估
                      </button>
                    </div>

                    <div className="rounded-[26px] border border-border/70 bg-background/45 p-5">
                      <div className="mb-3 flex items-center gap-2 text-gold">
                        <RotateCcw className="h-4 w-4" />
                        重新開始
                      </div>
                      <button
                        onClick={resetMission}
                        className="rounded-full border border-border px-4 py-2 text-sm text-muted-foreground transition-colors hover:border-gold/40 hover:text-gold"
                      >
                        重設任務
                      </button>
                    </div>
                  </div>
                </div>
              )}
              </div>
            )}
          </div>
        </div>

        {phase === "briefing" && (
          <div className="absolute inset-0 z-40 flex items-center justify-center bg-black/35 p-4">
            <div className="max-w-3xl rounded-[34px] border border-gold/25 bg-background/75 p-8 backdrop-blur-2xl">
              <div className="mb-4 flex items-center gap-2 text-gold">
                <Sparkles className="h-5 w-5" />
                任務說明
              </div>
              <h2 className="font-serif text-4xl text-shimmer">完璧歸趙</h2>
              <p className="mt-4 text-sm leading-8 text-parchment/90">
                你將從趙廷出發，先查清秦國是否真肯交城，再在章臺、殿柱與舍館之間找出送璧返趙的辦法。
                時間有限，每一步都會改變後面的局勢。
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <button
                  onClick={() => void startMission()}
                  className="rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/30 transition-transform hover:scale-[1.02]"
                >
                  開始
                </button>
                <button
                  onClick={resetMission}
                  className="rounded-full border border-border px-6 py-3 text-sm text-muted-foreground transition-colors hover:border-gold/40 hover:text-gold"
                >
                  重新開始
                </button>
              </div>
            </div>
          </div>
        )}

        {phase === "lost" && activeFailState && (
          <div className="absolute inset-0 z-40 flex items-center justify-center bg-black/45 p-4">
            <div className="max-w-3xl rounded-[34px] border border-destructive/25 bg-background/80 p-8 backdrop-blur-2xl">
              <div className="mb-3 flex items-center gap-2 text-destructive">
                <ShieldAlert className="h-5 w-5" />
                任務失敗
              </div>
              <h2 className="font-serif text-4xl text-foreground">{activeFailState.title}</h2>
              <p className="mt-4 text-sm leading-8 text-parchment/90">{activeFailState.whyItFailed}</p>
              <p className="mt-4 rounded-2xl border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-muted-foreground">
                <span className="font-semibold text-destructive">歷史教訓：</span>
                {activeFailState.lesson}
              </p>
              <p className="mt-4 text-xs leading-6 text-muted-foreground">
                {activeFailState.historyReference}
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <button
                  onClick={resetMission}
                  className="rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground"
                >
                  重新開始
                </button>
                <button
                  onClick={() => navigate("/")}
                  className="rounded-full border border-border px-6 py-3 text-sm text-muted-foreground"
                >
                  返回首頁
                </button>
              </div>
            </div>
          </div>
        )}

        {phase === "won" && (
          <div className="absolute inset-0 z-40 flex items-center justify-center bg-black/45 p-4">
            <div className="max-w-3xl rounded-[34px] border border-jade/25 bg-background/80 p-8 backdrop-blur-2xl">
              <div className="mb-3 flex items-center gap-2 text-jade">
                <CheckCircle2 className="h-5 w-5" />
                {wanbiVictorySummary.subtitle}
              </div>
              <h2 className="font-serif text-5xl text-shimmer">{wanbiVictorySummary.title}</h2>
              <p className="mt-4 text-sm leading-8 text-parchment/90">
                你先確認秦國無意交城，再取回玉璧，借禮制拖住局面，最後命從者懷璧先返。
                這就是《史記》所寫的完璧歸趙。
              </p>
              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl border border-border/70 bg-background/40 p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">洞察</p>
                  <p className="font-serif text-3xl text-jade">{stats.insight}</p>
                </div>
                <div className="rounded-2xl border border-border/70 bg-background/40 p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">籌碼</p>
                  <p className="font-serif text-3xl text-gold">{stats.leverage}</p>
                </div>
                <div className="rounded-2xl border border-border/70 bg-background/40 p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">膽識</p>
                  <p className="font-serif text-3xl text-vermillion">{stats.composure}</p>
                </div>
              </div>
              <p className="mt-4 text-xs leading-6 text-muted-foreground">
                {wanbiVictorySummary.historicalReference}
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <button
                  onClick={resetMission}
                  className="rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground"
                >
                  再玩一次
                </button>
                <button
                  onClick={() => navigate("/")}
                  className="rounded-full border border-border px-6 py-3 text-sm text-muted-foreground"
                >
                  返回首頁
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <AccessibilityPanel />
    </div>
  );
};

const WanbiLevel = () => (
  <AccessibilityProvider>
    <GameEngine />
  </AccessibilityProvider>
);

export default WanbiLevel;
