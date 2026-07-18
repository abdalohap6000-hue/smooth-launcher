import { useState } from "react";
import { motion } from "framer-motion";
import { ChevronLeft } from "lucide-react";
import BottomNav from "../components/qalami/BottomNav";
import { AVAILABLE_MODELS, getSelectedModel, setSelectedModel } from "../lib/generationService";
import { toast } from "sonner";

const items = [
  { id: "reminders", icon: "🔔", label: "التذكيرات اليومية", type: "toggle" },
  { id: "language",  icon: "🌐", label: "اللغة",             type: "value", value: "العربية ✓" },
  { id: "d1", type: "divider" },
  { id: "share",   icon: "📤", label: "شارك التطبيق مع أصدقائك", type: "link" },
  { id: "contact", icon: "📧", label: "تواصل معنا",               type: "link" },
  { id: "privacy", icon: "📄", label: "سياسة الخصوصية",          type: "link" },
];

export default function Settings() {
  const [toggles, setToggles] = useState({ reminders: true });
  const [model, setModel] = useState(getSelectedModel());

  const handleClick = (id) => {
    if (id === "share" && navigator.share) navigator.share({ title: "قلمي AI", url: window.location.origin });
    if (id === "contact") window.location.href = "mailto:support@example.com?subject=تواصل معنا — قلمي AI";
  };

  const handleModelChange = (e) => {
    const value = e.target.value;
    setModel(value);
    setSelectedModel(value);
    toast.success("تم تحديث النموذج");
  };

  return (
    <div className="min-h-screen font-cairo pb-28" style={{ background: "#020203" }} dir="rtl">
      <div className="glass-header sticky top-0 z-40">
        <div className="px-5 py-4 max-w-lg mx-auto">
          <h1 className="text-xl font-black gradient-text-white">الإعدادات ⚙️</h1>
        </div>
      </div>
      <div className="max-w-lg mx-auto px-5 pt-5 space-y-1 relative z-10">
        {/* اختيار نموذج الذكاء الاصطناعي */}
        <div className="px-4 py-4 rounded-2xl mb-3"
             style={{ background: "rgba(124,77,255,0.06)", border: "1px solid rgba(124,77,255,0.2)" }}>
          <div className="flex items-center gap-3 mb-3">
            <span className="text-base">🤖</span>
            <span className="text-sm font-semibold text-white/80">نموذج الذكاء الاصطناعي</span>
          </div>
          <select
            value={model}
            onChange={handleModelChange}
            className="w-full bg-black/40 text-white/90 text-sm rounded-xl px-3 py-2.5 border border-white/10 focus:outline-none focus:border-purple-400"
            dir="rtl"
          >
            {AVAILABLE_MODELS.map((m) => (
              <option key={m.id} value={m.id} className="bg-[#020203]">{m.label}</option>
            ))}
          </select>
          <p className="text-[11px] text-white/40 mt-2 leading-relaxed">
            يُطبَّق النموذج فور اختياره على كل توليد جديد.
          </p>
        </div>

        {items.map((item, i) => {
          if (item.type === "divider") return <div key={item.id} className="my-3 h-px" style={{ background: "rgba(255,255,255,0.05)" }} />;
          return (
            <motion.div key={item.id} initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}
              onClick={() => handleClick(item.id)}
              className="flex items-center justify-between px-4 py-4 rounded-2xl mb-1.5 cursor-pointer hover:bg-white/[0.03]"
              style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.05)" }}>
              <div className="flex items-center gap-3">
                <span className="text-base">{item.icon}</span>
                <span className="text-sm font-semibold text-white/75">{item.label}</span>
              </div>
              {item.type === "toggle" && (
                <button onClick={(e) => { e.stopPropagation(); setToggles(p => ({ ...p, [item.id]: !p[item.id] })); }}
                  className="w-10 h-6 rounded-full transition-colors relative"
                  style={{ background: toggles[item.id] ? "#7C4DFF" : "rgba(255,255,255,0.1)" }}>
                  <span className="absolute top-1 w-4 h-4 rounded-full bg-white transition-all" style={{ left: toggles[item.id] ? "22px" : "2px" }} />
                </button>
              )}
              {item.type === "value" && <span className="text-xs text-white/30 font-semibold">{item.value}</span>}
              {item.type === "link" && <ChevronLeft className="w-4 h-4 text-white/20" />}
            </motion.div>
          );
        })}
        <div className="text-center pt-10 pb-4">
          <p className="text-[11px] text-white/15">Version 1.0.0 — قلمي AI ✒️</p>
        </div>
      </div>
      <BottomNav />
    </div>
  );
}
