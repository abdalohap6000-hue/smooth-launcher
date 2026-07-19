import { motion } from "framer-motion";

export const LENGTHS = [
  { id: "short", label: "قصير", hint: "≈ ٥٠ كلمة" },
  { id: "medium", label: "متوسط", hint: "≈ ١٥٠ كلمة" },
  { id: "long", label: "طويل", hint: "≈ ٣٠٠ كلمة" },
];

export const LANGUAGES = [
  { id: "ar", label: "العربية", flag: "🇸🇦" },
  { id: "ar_eg", label: "عربي مصري", flag: "🇪🇬" },
  { id: "ar_gulf", label: "عربي خليجي", flag: "🇦🇪" },
  { id: "en", label: "English", flag: "🇺🇸" },
  { id: "fr", label: "Français", flag: "🇫🇷" },
];

function Pill({ active, color, onClick, children }) {
  return (
    <motion.button
      onClick={onClick}
      whileTap={{ scale: 0.95 }}
      className="px-4 py-2 rounded-xl text-sm font-bold transition-all duration-200"
      style={{
        background: active ? `${color}15` : "rgba(255,255,255,0.03)",
        border: `1.5px solid ${active ? color : "rgba(255,255,255,0.07)"}`,
        color: active ? color : "rgba(255,255,255,0.45)",
        boxShadow: active ? `0 0 14px ${color}55` : "none",
      }}
    >
      {children}
    </motion.button>
  );
}

export default function LengthLanguageSelector({ length, onLengthChange, language, onLanguageChange }) {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-bold text-white/40 uppercase tracking-widest mb-3">طول النص</p>
        <div className="flex flex-wrap gap-2">
          {LENGTHS.map((l) => (
            <Pill key={l.id} active={length === l.id} color="#38BDF8" onClick={() => onLengthChange(l.id)}>
              {l.label} <span className="opacity-60 text-[10px] font-semibold mr-1">{l.hint}</span>
            </Pill>
          ))}
        </div>
      </div>
      <div>
        <p className="text-xs font-bold text-white/40 uppercase tracking-widest mb-3">اللغة</p>
        <div className="flex flex-wrap gap-2">
          {LANGUAGES.map((lg) => (
            <Pill key={lg.id} active={language === lg.id} color="#A78BFA" onClick={() => onLanguageChange(lg.id)}>
              <span className="mr-1">{lg.flag}</span> {lg.label}
            </Pill>
          ))}
        </div>
      </div>
    </div>
  );
}
