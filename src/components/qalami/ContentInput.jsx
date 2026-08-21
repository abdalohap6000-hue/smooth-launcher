import { useState } from "react";
import { X } from "lucide-react";
import { motion } from "framer-motion";
import ModelSelector from "./ModelSelector";

const inspirations = ["منتج جديد 🛒", "نصيحة حياتية 💡", "إنجاز شخصي 🏆", "عرض لفترة محدودة ⚡", "سؤال للجمهور 🎤", "قصة نجاح 🌟"];

export default function ContentInput({ value, onChange, model, onModelChange }) {
  const [focused, setFocused] = useState(false);

  return (
    <div>
      <div className="flex items-center justify-between gap-3 mb-3">
        <p className="text-xs font-bold text-white/40 uppercase tracking-widest">فكرتك</p>
        <ModelSelector value={model} onChange={onModelChange} />
      </div>
      <div className="relative rounded-2xl transition-all duration-300"
        style={{ background: "rgba(255,255,255,0.025)",
          border: `1.5px solid ${focused ? "rgba(124,77,255,0.55)" : "rgba(255,255,255,0.07)"}`,
          boxShadow: focused ? "0 0 0 4px rgba(124,77,255,0.1)" : "none" }}>
        <textarea value={value} onChange={(e) => e.target.value.length <= 200 && onChange(e.target.value)}
          onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
          placeholder="اكتب فكرتك هنا… مثال: أريد الترويج لكورسي الجديد في التصميم"
          dir="rtl" rows={4}
          className="w-full bg-transparent resize-none text-sm text-white/85 placeholder-white/20 p-4 pb-2 outline-none leading-relaxed" />
        <div className="flex items-center justify-between px-4 pb-3">
          <span className="text-[11px] font-semibold" style={{ color: value.length > 180 ? "#F87171" : "rgba(255,255,255,0.2)" }}>
            {value.length}/200
          </span>
          {value && (
            <motion.button initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} onClick={() => onChange("")}
              className="w-6 h-6 rounded-full flex items-center justify-center" style={{ background: "rgba(255,255,255,0.08)" }}>
              <X className="w-3 h-3 text-white/50" />
            </motion.button>
          )}
        </div>
      </div>
      <div className="flex flex-wrap gap-2 mt-3">
        {inspirations.map((chip) => (
          <button key={chip} onClick={() => onChange(chip.split(" ")[0])}
            className="px-3 py-1 rounded-full text-[11px] font-semibold transition-all hover:text-white/60"
            style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", color: "rgba(255,255,255,0.3)" }}>
            {chip}
          </button>
        ))}
      </div>
    </div>
  );
}