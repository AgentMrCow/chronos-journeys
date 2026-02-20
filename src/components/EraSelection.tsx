import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import eraQin from "@/assets/era-qin.jpg";
import eraConfucius from "@/assets/era-confucius.jpg";
import eraThreeKingdoms from "@/assets/era-three-kingdoms.jpg";
import eraTang from "@/assets/era-tang.jpg";
import { useAccessibility } from "@/contexts/AccessibilityContext";

const eras = [
  {
    id: "mianchi",
    title: "戰國·澠池之會",
    subtitle: "Meeting at Mianchi",
    period: "279 BC",
    image: eraQin,
    description: "化身藺相如謀士，以智勇保全趙國尊嚴",
    descEn: "Become Lin Xiangru's advisor — protect Zhao's honor with wit and courage",
    difficulty: "★★☆",
    status: "available",
    route: "/play/mianchi",
  },
  {
    id: "spring-autumn",
    title: "春秋戰國",
    subtitle: "Spring & Autumn",
    period: "770 - 221 BC",
    image: eraConfucius,
    description: "與孔子對話，探索百家爭鳴的智慧年代",
    descEn: "Converse with Confucius in the age of philosophical enlightenment",
    difficulty: "★★☆",
    status: "coming",
  },
  {
    id: "three-kingdoms",
    title: "三國",
    subtitle: "Three Kingdoms",
    period: "220 - 280 AD",
    image: eraThreeKingdoms,
    description: "亂世英雄，策略與智謀的巔峰對決",
    descEn: "Heroes of chaos — a clash of strategy and wit",
    difficulty: "★★★",
    status: "coming",
  },
  {
    id: "tang",
    title: "唐朝",
    subtitle: "Tang Dynasty",
    period: "618 - 907 AD",
    image: eraTang,
    description: "盛世繁華，詩詞與藝術的黃金時代",
    descEn: "The golden age of poetry, art, and prosperity",
    difficulty: "★★☆",
    status: "coming",
  },
];

const EraSelection = () => {
  const { speak } = useAccessibility();
  const navigate = useNavigate();

  return (
    <section id="eras" className="relative py-24">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-16 text-center"
        >
          <h2 className="mb-2 font-serif text-4xl font-bold text-foreground md:text-5xl">
            選擇你的<span className="text-shimmer">時代</span>
          </h2>
          <p className="text-muted-foreground">Choose Your Era · 穿越時空的大門</p>
        </motion.div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {eras.map((era, i) => (
            <motion.div
              key={era.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
              whileHover={{ y: -8, scale: 1.02 }}
              onHoverStart={() => speak(era.title)}
              className="group relative cursor-pointer overflow-hidden rounded-xl border border-border bg-card"
            >
              {/* Image */}
              <div className="relative h-64 overflow-hidden">
                <img
                  src={era.image}
                  alt={era.title}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent" />
                {era.status === "coming" && (
                  <div className="absolute right-3 top-3 rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground">
                    即將推出 Coming Soon
                  </div>
                )}
                <div className="absolute bottom-3 left-3 rounded bg-background/80 px-2 py-0.5 text-xs text-gold backdrop-blur">
                  {era.period}
                </div>
              </div>

              {/* Info */}
              <div className="p-5">
                <div className="mb-1 flex items-center justify-between">
                  <h3 className="font-serif text-xl font-bold text-foreground">{era.title}</h3>
                  <span className="text-sm text-vermillion">{era.difficulty}</span>
                </div>
                <p className="mb-1 text-xs text-gold-dim">{era.subtitle}</p>
                <p className="text-sm text-muted-foreground">{era.description}</p>
                <p className="mt-1 text-xs text-mist">{era.descEn}</p>

                {era.status === "available" && (
                  <button
                    onClick={() => (era as any).route && navigate((era as any).route)}
                    className="mt-4 w-full rounded-lg bg-primary/90 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary"
                  >
                    進入 Enter
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default EraSelection;
