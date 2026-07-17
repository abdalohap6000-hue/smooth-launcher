import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Zap } from "lucide-react";

const toArabic = (n) => String(n).replace(/\d/g, (d) => "٠١٢٣٤٥٦٧٨٩"[d]);

export default function FreeTierPill({ remaining }) {
  const navigate = useNavigate();
  const isLow = remaining <= 1;
  return (
    <motion.button onClick={() => navigate("/premium")} whileTap={{ scale: 0.97 }}
      className="w-full py-3 rounded-2xl flex items-center justify-center gap-2"
      style={{ background: isLow ? "rgba(251,146,60,0.07)" : "rgba(255,255,255,0.025)",
        border: `1px solid ${isLow ? "rgba(251,146,60,0.3)" : "rgba(255,255,255,0.07)"}` }}>
      <Zap className="w-3.5 h-3.5" style={{ color: isLow ? "#FB923C" : "rgba(255,255,255,0.3)" }} />
      <span className="text-xs font-semibold" style={{ color: isLow ? "#FB923C" : "rgba(255,255,255,0.3)" }}>
        {remaining === 0 ? "انتهت توليداتك المجانية — ترقَّ إلى Pro 👑" : `متبقٍّ ${toArabic(remaining)} توليد مجاني اليوم`}
      </span>
    </motion.button>
  );
}