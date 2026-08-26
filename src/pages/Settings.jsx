import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ChevronLeft, LogOut } from "lucide-react";
import BottomNav from "../components/qalami/BottomNav";
import { isAdmin } from "../lib/creditsService";
import { toast } from "sonner";
import { useAuth, signOut } from "@/hooks/useAuth";


const items = [
  { id: "reminders", icon: "🔔", label: "التذكيرات اليومية", type: "toggle" },
  { id: "language",  icon: "🌐", label: "اللغة",             type: "value", value: "العربية ✓" },
  { id: "d1", type: "divider" },
  { id: "share",   icon: "📤", label: "شارك التطبيق مع أصدقائك", type: "link" },
  { id: "contact", icon: "📧", label: "تواصل معنا",               type: "link" },
  { id: "privacy", icon: "📄", label: "سياسة الخصوصية",          type: "link" },
];

export default function Settings() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [toggles, setToggles] = useState({ reminders: true });
  const [admin, setAdmin] = useState(false);

  useEffect(() => {
    isAdmin().then(setAdmin);
  }, []);


  const handleClick = (id) => {
    if (id === "share" && navigator.share) navigator.share({ title: "قلمي AI", url: window.location.origin });
    if (id === "contact") window.location.href = "mailto:support@example.com?subject=تواصل معنا — قلمي AI";
  };


  const handleSignOut = async () => {
    await signOut();
    toast.success("تم تسجيل الخروج");
    navigate("/auth", { replace: true });
  };

  return (
    <div className="min-h-screen font-cairo pb-28" style={{ background: "#020203" }} dir="rtl">
      <div className="glass-header sticky top-0 z-40">
        <div className="px-5 py-4 max-w-lg mx-auto">
          <h1 className="text-xl font-black gradient-text-white">الإعدادات ⚙️</h1>
        </div>
      </div>
      <div className="max-w-lg mx-auto px-5 pt-5 space-y-1 relative z-10">
        {/* الحساب */}
        {user && (
          <div className="px-4 py-4 rounded-2xl mb-3"
               style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-lg shrink-0"
                     style={{ background: "linear-gradient(135deg, rgba(124,77,255,0.3), rgba(59,130,246,0.2))" }}>
                  👤
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-white/40">مسجّل الدخول باسم</p>
                  <p className="text-sm font-semibold text-white/85 truncate" dir="ltr">{user.email}</p>
                </div>
              </div>
              <button onClick={handleSignOut}
                className="px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shrink-0"
                style={{ background: "rgba(248,113,113,0.08)", border: "1px solid rgba(248,113,113,0.25)", color: "#f87171" }}>
                <LogOut className="w-3.5 h-3.5" /> خروج
              </button>
            </div>
          </div>
        )}


        {/* النقاط والاشتراك */}
        <div className="px-4 py-4 rounded-2xl mb-3"
             style={{ background: "rgba(255,215,0,0.05)", border: "1px solid rgba(255,215,0,0.2)" }}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-white/80">⚡ النقاط والاشتراك</span>
            <span className="text-xs font-black" style={{ color: credits?.plan === "pro" ? "#FFD700" : "rgba(255,255,255,0.5)" }}>
              {credits?.plan === "pro" ? "Pro" : "مجاني"}
            </span>
          </div>
          <p className="text-[12px] text-white/55">
            الرصيد المتبقي: <b className="text-white/85">{toArabicDigits(credits?.balance ?? 0)}</b> نقطة
          </p>
          {credits?.renews_at && (
            <p className="text-[11px] text-white/35 mt-1">
              التجديد القادم: {new Date(credits.renews_at).toLocaleDateString("ar")}
            </p>
          )}
          <p className="text-[11px] text-white/35 mt-2 leading-relaxed">
            نقطة واحدة لكل منصة في كل عملية توليد. النموذج المجاني: Gemini 2.5 Flash Lite.
          </p>
          <button onClick={() => navigate("/premium")}
            className="w-full mt-3 py-2.5 rounded-xl text-sm font-black text-black"
            style={{ background: "linear-gradient(135deg, #FFD700, #FF6B35)" }}>
            {credits?.plan === "pro" ? "إدارة الاشتراك" : "ترقية إلى Pro 👑"}
          </button>
        </div>

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
              <option key={m.id} value={m.id} disabled={isModelLocked(m.id, credits?.plan)} className="bg-[#020203]">
                {m.label}{isModelLocked(m.id, credits?.plan) ? " 🔒 Pro" : ""}
              </option>
            ))}
          </select>
          <p className="text-[11px] text-white/40 mt-2 leading-relaxed">
            يُطبَّق النموذج فور اختياره على كل توليد جديد. النماذج المقفلة تحتاج اشتراك Pro.
          </p>
        </div>

        {admin && (
          <div onClick={() => navigate("/admin")}
            className="flex items-center justify-between px-4 py-4 rounded-2xl mb-3 cursor-pointer"
            style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.07)" }}>
            <div className="flex items-center gap-3">
              <span className="text-base">🛠️</span>
              <span className="text-sm font-semibold text-white/75">لوحة الأدمن — الاشتراكات</span>
            </div>
            <ChevronLeft className="w-4 h-4 text-white/20" />
          </div>
        )}


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
