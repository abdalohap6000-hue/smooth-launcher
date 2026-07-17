import { motion } from "framer-motion";

const tones = [
  { id: "exciting",     label: "🔥 مثير",   color: "#FF6B35", glow: "rgba(255,107,53,0.5)" },
  { id: "funny",        label: "😂 فكاهي",   color: "#FACC15", glow: "rgba(250,204,21,0.5)" },
  { id: "professional", label: "💼 احترافي", color: "#60A5FA", glow: "rgba(96,165,250,0.5)" },
  { id: "educational",  label: "📚 تعليمي",  color: "#34D399", glow: "rgba(52,211,153,0.5)" },
  { id: "promotional",  label: "📣 إعلاني",  color: "#C084FC", glow: "rgba(192,132,252,0.5)" },
  { id: "emotional",    label: "💜 عاطفي",   color: "#F472B6", glow: "rgba(244,114,182,0.5)" },
];

export default function ToneSelector({ selected, onSelect }) {
  return (
    <div>
      <p className="text-xs font-bold text-white/40 uppercase tracking-widest mb-3">الأسلوب</p>
      <div className="flex flex-wrap gap-2">
        {tones.map((t) => {
          const isActive = selected === t.id;
          return (
            <motion.button key={t.id} onClick={() => onSelect(t.id)} whileTap={{ scale: 0.95 }}
              className="px-4 py-2 rounded-xl text-sm font-bold transition-all duration-200"
              style={{ background: isActive ? `${t.color}15` : "rgba(255,255,255,0.03)",
                border: `1.5px solid ${isActive ? t.color : "rgba(255,255,255,0.07)"}`,
                color: isActive ? t.color : "rgba(255,255,255,0.45)",
                boxShadow: isActive ? `0 0 14px ${t.glow}` : "none" }}>
              {t.label}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}