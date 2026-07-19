import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import PlatformSelector from "../components/qalami/PlatformSelector";
import ToneSelector from "../components/qalami/ToneSelector";
import PostTypeGrid from "../components/qalami/PostTypeGrid";
import ContentInput from "../components/qalami/ContentInput";
import LengthLanguageSelector from "../components/qalami/LengthLanguageSelector";
import GenerateButton from "../components/qalami/GenerateButton";
import FreeTierPill from "../components/qalami/FreeTierPill";
import BottomNav from "../components/qalami/BottomNav";
import { generateContent, getFreeTierStatus, incrementUsage } from "../lib/generationService";
import { toast } from "sonner";

export default function Home() {
  const navigate = useNavigate();
  const [selectedPlatforms, setSelectedPlatforms] = useState([]);
  const [selectedTone, setSelectedTone] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [userInput, setUserInput] = useState("");
  const [length, setLength] = useState("medium");
  const [language, setLanguage] = useState("ar");
  const [isLoading, setIsLoading] = useState(false);

  const freeTier = getFreeTierStatus();
  const togglePlatform = useCallback((id) => {
    setSelectedPlatforms((prev) => prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]);
  }, []);

  const canGenerate = selectedPlatforms.length > 0 && selectedTone && selectedType && userInput.trim().length > 0;

  const handleGenerate = async () => {
    if (!canGenerate) { toast.error("يرجى تعبئة جميع الحقول المطلوبة"); return; }
    const status = getFreeTierStatus();
    if (!status.canGenerate) { navigate("/premium"); return; }
    setIsLoading(true);
    const results = await generateContent({ platforms: selectedPlatforms, tone: selectedTone, postType: selectedType, userInput, length, language });
    incrementUsage();
    sessionStorage.setItem("qalami_results", JSON.stringify({ results, platforms: selectedPlatforms, tone: selectedTone, postType: selectedType, userInput }));
    setIsLoading(false);
    navigate("/results");
  };

  return (
    <div className="min-h-screen font-cairo pb-28" style={{ background: "#020203" }} dir="rtl">
      <div className="bg-orb w-[400px] h-[400px] top-[-100px] right-[-100px] opacity-[0.06]" style={{ background: "#7C4DFF" }} />
      <div className="glass-header sticky top-0 z-40">
        <div className="flex items-center justify-between px-5 py-3.5 max-w-lg mx-auto">
          <div className="flex items-center gap-2">
            <span className="text-xl">✒️</span>
            <span className="text-lg font-black gradient-text-white">قلمي</span>
          </div>
          <motion.button whileTap={{ scale: 0.92 }} onClick={() => navigate("/premium")}
            className="px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5"
            style={{ background: "rgba(255,215,0,0.08)", border: "1px solid rgba(255,215,0,0.25)", color: "#FFD700" }}>
            👑 Pro
          </motion.button>
        </div>
      </div>
      <div className="max-w-lg mx-auto px-5 pt-6 space-y-7 relative z-10">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
          <PlatformSelector selected={selectedPlatforms} onToggle={togglePlatform} />
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <ToneSelector selected={selectedTone} onSelect={setSelectedTone} />
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <PostTypeGrid selected={selectedType} onSelect={setSelectedType} />
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18 }}>
          <LengthLanguageSelector length={length} onLengthChange={setLength} language={language} onLanguageChange={setLanguage} />
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <ContentInput value={userInput} onChange={setUserInput} />
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
          <GenerateButton onClick={handleGenerate} isLoading={isLoading} disabled={!canGenerate} />
        </motion.div>
      </div>
      <BottomNav />
    </div>
  );
}