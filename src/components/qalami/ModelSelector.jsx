import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, ChevronDown } from "lucide-react";
import GeminiLogo from "./GeminiLogo";
import { AVAILABLE_MODELS, getSelectedModel, setSelectedModel } from "../../lib/generationService";

const TIER_STYLE = {
  lite: { color: "#9CA3AF", bg: "rgba(156,163,175,0.12)" },
  flash: { color: "#38BDF8", bg: "rgba(56,189,248,0.12)" },
  pro: { color: "#FFD700", bg: "rgba(255,215,0,0.12)" },
};

export default function ModelSelector({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const [internal, setInternal] = useState(getSelectedModel());
  const model = value || internal;
  const ref = useRef(null);

  useEffect(() => {
    const onDown = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);

  const current = AVAILABLE_MODELS.find((m) => m.id === model) || AVAILABLE_MODELS[0];

  const pick = (id) => { setInternal(id); setSelectedModel(id); onChange?.(id); setOpen(false); };

  return (
    <div className="relative" ref={ref} dir="rtl">
      <motion.button
        whileTap={{ scale: 0.96 }}
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-[11px] font-bold text-white/70"
        style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.09)" }}
      >
        <GeminiLogo size={13} />
        <span className="max-w-[130px] truncate">{current.label}</span>
        <ChevronDown className="w-3 h-3 text-white/35" />
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            className="absolute left-0 mt-2 w-[268px] rounded-2xl overflow-hidden z-50 p-1"
            style={{
              background: "rgba(10,10,14,0.97)",
              border: "1px solid rgba(255,255,255,0.09)",
              boxShadow: "0 18px 40px rgba(0,0,0,0.6)",
              backdropFilter: "blur(14px)",
            }}
          >
            {AVAILABLE_MODELS.map((m) => {
              const tier = TIER_STYLE[m.tier] || TIER_STYLE.flash;
              const active = m.id === model;
              return (
                <button
                  key={m.id}
                  onClick={() => pick(m.id)}
                  className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-right transition-colors hover:bg-white/[0.05]"
                  style={{ background: active ? "rgba(124,77,255,0.12)" : "transparent" }}
                >
                  <GeminiLogo size={16} />
                  <span className="flex-1 min-w-0">
                    <span className="block text-[12px] font-bold text-white/85 truncate">{m.label}</span>
                    <span className="block text-[10px] text-white/35 truncate">{m.desc}</span>
                  </span>
                  <span
                    className="px-1.5 py-0.5 rounded-md text-[9px] font-black uppercase"
                    style={{ background: tier.bg, color: tier.color }}
                  >
                    {m.tier}
                  </span>
                  {active && <Check className="w-3.5 h-3.5 text-purple-300" />}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
