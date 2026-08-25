import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import BottomNav from "../components/qalami/BottomNav";
import { fetchCredits, toArabicDigits, PRO_MONTHLY_CREDITS, SIGNUP_CREDITS } from "../lib/creditsService";

const MONTHLY_URL = "https://imagineal.lemonsqueezy.com/checkout/buy/fc74f7a5-475a-400f-a106-4004088743c7";
const YEARLY_URL  = "https://imagineal.lemonsqueezy.com/checkout/buy/e91fa95f-213a-428f-84e2-25ac341c8ab5";

const features = [
  `${toArabicDigits(PRO_MONTHLY_CREDITS)} نقطة شهرياً تتجدد تلقائياً`,
  "فتح جميع نماذج Gemini (Flash و Pro)",
  "نقطة واحدة لكل منصة في كل توليد",
  "مكتبة لحفظ أفضل منشوراتك",
  "جميع المنصات والأساليب واللغات",
  "أولوية في السرعة والدعم",
];

export default function Premium() {
  const [selectedPlan, setSelectedPlan] = useState("yearly");
  const [credits, setCredits] = useState(null);

  useEffect(() => { fetchCredits().then(setCredits); }, []);

  const isPro = credits?.plan === "pro";

  const handleCheckout = () => {
    const url = selectedPlan === "monthly" ? MONTHLY_URL : YEARLY_URL;
    window.open(url, "_blank");
  };

  return (
    <div className="min-h-screen font-cairo pb-28 relative overflow-hidden" style={{ background: "#020203" }} dir="rtl">
      <div className="bg-orb w-[500px] h-[500px] top-[-150px] left-1/2 -translate-x-1/2 opacity-[0.07]" style={{ background: "radial-gradient(circle, #FFD700, #7C4DFF)" }} />
      <div className="max-w-lg mx-auto px-5 pt-12 relative z-10">
        <div className="text-center mb-8 space-y-3">
          <div className="text-5xl bounce-gentle inline-block">👑</div>
          <h1 className="text-4xl font-black gradient-text-gold">قلمي Pro</h1>
          <p className="text-sm text-white/35">نظام النقاط — ادفع مقابل ما تستخدمه فعلاً</p>
        </div>

        {credits && (
          <div className="rounded-2xl px-4 py-3 mb-6 flex items-center justify-between"
            style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
            <span className="text-xs font-bold text-white/40">رصيدك الحالي</span>
            <span className="text-sm font-black" style={{ color: isPro ? "#FFD700" : "#FFFFFFB3" }}>
              {toArabicDigits(credits.balance)} نقطة · {isPro ? "خطة Pro" : "خطة مجانية"}
            </span>
          </div>
        )}

        <div className="rounded-2xl px-4 py-3 mb-6 text-xs leading-relaxed text-white/45"
          style={{ background: "rgba(124,77,255,0.06)", border: "1px solid rgba(124,77,255,0.2)" }}>
          كل مستخدم جديد يحصل على <b className="text-white/70">{toArabicDigits(SIGNUP_CREDITS)} نقاط مجانية</b> تعمل على نموذج
          <b className="text-white/70"> Gemini 2.5 Flash Lite</b> فقط. بعد نفادها — أو لفتح باقي النماذج — يلزم اشتراك Pro.
        </div>

        <div className="space-y-2 mb-8">
          {features.map((f, i) => (
            <div key={i} className="flex items-center gap-3 px-4 py-3 rounded-2xl"
              style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.05)" }}>
              <span style={{ color: "#22C55E" }}>✓</span>
              <span className="text-sm font-semibold text-white/75">{f}</span>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-3 mb-6">
          {[{ id: "monthly", label: "شهري", price: "٤.٩٩$", sub: "/ شهر" }, { id: "yearly", label: "سنوي", price: "٢٩.٩٩$", sub: "/ سنة", badge: "الأوفر 🏆", save: "وفّر ٥٠٪" }].map(p => (
            <button key={p.id} onClick={() => setSelectedPlan(p.id)} className="rounded-2xl p-4 text-center space-y-1 relative transition-all"
              style={{ background: selectedPlan === p.id ? "rgba(255,215,0,0.05)" : "rgba(255,255,255,0.025)", border: selectedPlan === p.id ? "1.5px solid rgba(255,215,0,0.35)" : "1px solid rgba(255,255,255,0.07)" }}>
              {p.badge && <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full text-[10px] font-black" style={{ background: "#FFD700", color: "#020203" }}>{p.badge}</div>}
              <p className="text-xs text-white/30 font-semibold pt-1">{p.label}</p>
              <p className="text-3xl font-black gradient-text-gold">{p.price}</p>
              <p className="text-xs text-white/25">{p.sub}</p>
              {p.save && <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold" style={{ background: "rgba(34,197,94,0.15)", color: "#22C55E" }}>{p.save}</span>}
            </button>
          ))}
        </div>

        <motion.button whileTap={{ scale: 0.97 }} onClick={handleCheckout}
          className="w-full h-[62px] rounded-2xl text-lg font-black text-black flex items-center justify-center btn-generate"
          style={{ background: "linear-gradient(135deg, #FFD700, #FF6B35)" }}>
          🚀 اشترك الآن — {selectedPlan === "monthly" ? "٤.٩٩$ / شهر" : "٢٩.٩٩$ / سنة"}
        </motion.button>
        <p className="text-center text-xs text-white/20 mt-3 leading-relaxed">
          بعد إتمام الدفع يتم تفعيل باقة النقاط على حسابك خلال وقت قصير.
          <br />إن تأخر التفعيل راسلنا بالبريد المستخدم في الدفع.
        </p>
      </div>
      <BottomNav />
    </div>
  );
}
