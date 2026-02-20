import { motion } from "framer-motion";
import heroBg from "@/assets/hero-bg.jpg";

const HeroSection = () => {
  return (
    <section className="relative flex min-h-screen items-center justify-center overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <img src={heroBg} alt="" className="h-full w-full object-cover opacity-60" />
        <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/70 to-background" />
      </div>

      {/* Content */}
      <div className="relative z-10 px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
        >
          <h1 className="mb-2 font-serif text-6xl font-black tracking-tight md:text-8xl">
            <span className="text-shimmer">穿越千年</span>
          </h1>
          <p className="mb-4 font-serif text-2xl text-gold md:text-3xl">
            Chronicle Quest
          </p>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="mx-auto mb-8 max-w-xl text-lg text-muted-foreground"
        >
          無論你來自何方、年齡幾何，歷史的大門永遠為你敞開。
          <br />
          <span className="text-sm text-mist">
            Wherever you come from, whatever your age — history awaits you.
          </span>
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.6 }}
          className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center"
        >
          <a
            href="#eras"
            className="rounded-lg bg-primary px-8 py-3 font-serif text-lg text-primary-foreground shadow-lg shadow-primary/30 transition-all hover:scale-105 hover:shadow-xl hover:shadow-primary/40"
          >
            開始旅程 Start Journey
          </a>
          <a
            href="#features"
            className="rounded-lg border border-gold/30 px-8 py-3 font-serif text-lg text-gold transition-all hover:border-gold hover:bg-gold/10"
          >
            了解更多 Learn More
          </a>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="mt-16 text-muted-foreground"
        >
          <div className="mx-auto h-8 w-5 rounded-full border-2 border-muted-foreground/40">
            <div className="mx-auto mt-1 h-2 w-1 rounded-full bg-gold" />
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
