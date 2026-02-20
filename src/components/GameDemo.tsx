import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAccessibility } from "@/contexts/AccessibilityContext";
import eraConfucius from "@/assets/era-confucius.jpg";

interface DialogueLine {
  speaker: "npc" | "system" | "player";
  text: string;
  emotion?: string;
  hint?: string;
}

const demoDialogue: DialogueLine[] = [
  { speaker: "system", text: "你穿越到了春秋時代，眼前站著一位長者..." },
  { speaker: "npc", text: "年輕人，你從何方來？吾乃孔丘。", emotion: "🤔 好奇", hint: "孔子想了解你" },
  { speaker: "player", text: "夫子好！我從未來而來，想向您請教。" },
  { speaker: "npc", text: "哦？未來之人...有教無類，吾當不吝賜教。", emotion: "😊 欣慰", hint: "孔子很高興見到好學的人" },
  { speaker: "system", text: "🧩 謎題：孔子說「己所不欲，勿施於人」，這句話的意思是？" },
  { speaker: "player", text: "自己不想要的，也不要強加給別人。" },
  { speaker: "npc", text: "善哉！汝果然聰慧。此乃仁之本也。", emotion: "😄 讚賞", hint: "你回答正確了！" },
  { speaker: "system", text: "✅ 答對了！獲得 50 經驗值 + 成就「仁者之心」" },
];

const GameDemo = () => {
  const [currentLine, setCurrentLine] = useState(0);
  const [started, setStarted] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { speak, ttsEnabled } = useAccessibility();

  const advance = () => {
    if (currentLine < demoDialogue.length - 1) {
      const nextIdx = currentLine + 1;
      setCurrentLine(nextIdx);
      if (ttsEnabled) speak(demoDialogue[nextIdx].text);
    }
  };

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [currentLine]);

  const visibleLines = demoDialogue.slice(0, currentLine + 1);

  return (
    <section className="relative py-24">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-12 text-center"
        >
          <h2 className="mb-2 font-serif text-4xl font-bold text-foreground md:text-5xl">
            遊戲<span className="text-shimmer">體驗</span>
          </h2>
          <p className="text-muted-foreground">Game Demo · 與孔子的對話</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="mx-auto max-w-2xl overflow-hidden rounded-2xl border border-border bg-card shadow-2xl shadow-background/50"
        >
          {/* Header with NPC */}
          <div className="flex items-center gap-4 border-b border-border bg-secondary/50 p-4">
            <img src={eraConfucius} alt="孔子" className="h-12 w-12 rounded-full border-2 border-gold object-cover" />
            <div>
              <p className="font-serif font-bold text-foreground">孔子 · Confucius</p>
              <p className="text-xs text-muted-foreground">春秋時代 · 551-479 BC</p>
            </div>
            {started && visibleLines[currentLine]?.emotion && (
              <div className="ml-auto rounded-full bg-muted px-3 py-1 text-sm">
                {visibleLines[currentLine].emotion}
              </div>
            )}
          </div>

          {/* Dialogue area */}
          {!started ? (
            <div className="flex h-80 flex-col items-center justify-center gap-4 p-8">
              <p className="text-center text-muted-foreground">
                點擊開始，體驗與歷史人物的互動對話
              </p>
              <button
                onClick={() => {
                  setStarted(true);
                  if (ttsEnabled) speak(demoDialogue[0].text);
                }}
                className="rounded-lg bg-primary px-6 py-3 font-serif text-primary-foreground shadow-lg shadow-primary/30 transition-all hover:scale-105"
              >
                開始體驗 Start Demo
              </button>
            </div>
          ) : (
            <>
              <div ref={scrollRef} className="h-80 overflow-y-auto p-4">
                <AnimatePresence>
                  {visibleLines.map((line, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`mb-3 ${
                        line.speaker === "player"
                          ? "flex justify-end"
                          : line.speaker === "system"
                          ? "flex justify-center"
                          : "flex justify-start"
                      }`}
                    >
                      {line.speaker === "system" ? (
                        <div className="rounded-lg bg-muted px-4 py-2 text-center text-sm text-gold">
                          {line.text}
                        </div>
                      ) : (
                        <div className="max-w-[80%]">
                          <div
                            className={`rounded-2xl px-4 py-3 text-sm ${
                              line.speaker === "player"
                                ? "rounded-br-sm bg-primary text-primary-foreground"
                                : "rounded-bl-sm bg-secondary text-secondary-foreground"
                            }`}
                          >
                            {line.text}
                          </div>
                          {line.hint && (
                            <p className="mt-1 px-2 text-xs text-jade">
                              💡 {line.hint}
                            </p>
                          )}
                        </div>
                      )}
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              {/* Controls */}
              <div className="border-t border-border p-4">
                {currentLine < demoDialogue.length - 1 ? (
                  <button
                    onClick={advance}
                    className="w-full rounded-lg bg-secondary py-3 text-sm font-medium text-secondary-foreground transition-colors hover:bg-secondary/80"
                  >
                    繼續 Continue →
                  </button>
                ) : (
                  <div className="text-center">
                    <p className="mb-2 text-sm text-jade">🎉 體驗完成！Demo Complete!</p>
                    <button
                      onClick={() => {
                        setCurrentLine(0);
                        setStarted(false);
                      }}
                      className="text-sm text-gold underline"
                    >
                      重新開始 Restart
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
        </motion.div>
      </div>
    </section>
  );
};

export default GameDemo;
