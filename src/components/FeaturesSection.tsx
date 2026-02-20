import { motion } from "framer-motion";
import { Brain, Globe, Puzzle, MessageCircle, Accessibility, Gamepad2 } from "lucide-react";

const features = [
  {
    icon: Accessibility,
    title: "全面無障礙",
    titleEn: "Universal Access",
    desc: "為ADHD、帕金森等神經多樣性人士設計，支援字體縮放、高對比、語音朗讀",
    color: "text-jade",
  },
  {
    icon: MessageCircle,
    title: "NPC 互動對話",
    titleEn: "Interactive NPCs",
    desc: "與歷史人物即時對話，看見NPC情緒，了解他們的期望",
    color: "text-gold",
  },
  {
    icon: Puzzle,
    title: "解謎探險",
    titleEn: "Puzzle Adventures",
    desc: "沉浸式解謎、尋找線索，在故事中學習歷史",
    color: "text-vermillion",
  },
  {
    icon: Brain,
    title: "AI 學習助手",
    titleEn: "AI Assistant",
    desc: "智能AI助手根據你的需要調整難度和介面",
    color: "text-jade",
  },
  {
    icon: Globe,
    title: "多語言支援",
    titleEn: "Multilingual",
    desc: "中文、英文雙語介面，適合全球歷史愛好者",
    color: "text-gold",
  },
  {
    icon: Gamepad2,
    title: "遊戲化學習",
    titleEn: "Gamified Learning",
    desc: "積分、成就、排行榜，讓學習變成冒險",
    color: "text-vermillion",
  },
];

const FeaturesSection = () => {
  return (
    <section id="features" className="relative py-24">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-16 text-center"
        >
          <h2 className="mb-2 font-serif text-4xl font-bold text-foreground md:text-5xl">
            為<span className="text-shimmer">每一個人</span>而設計
          </h2>
          <p className="text-muted-foreground">
            Designed for Everyone · 包容、沉浸、啟發
          </p>
        </motion.div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {features.map((f, i) => (
            <motion.div
              key={f.titleEn}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="group rounded-xl border border-border bg-card p-6 transition-all hover:border-gold/30 hover:shadow-lg hover:shadow-gold/5"
            >
              <f.icon className={`mb-4 h-8 w-8 ${f.color}`} />
              <h3 className="mb-1 font-serif text-lg font-bold text-foreground">{f.title}</h3>
              <p className="mb-2 text-xs text-gold-dim">{f.titleEn}</p>
              <p className="text-sm text-muted-foreground">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
