// ─────────────────────────────────────────────────────────────────────────────
// generationService.js — يستدعي وسيط الخادم (Supabase Edge Function)
// بدلاً من الاتصال المباشر بمزود AI، لتجنب كشف مفتاح API في المتصفح.
// ─────────────────────────────────────────────────────────────────────────────

const TONE_MAP = {
  exciting: 'مثير وجذاب', funny: 'فكاهي وممتع', professional: 'احترافي ورسمي',
  educational: 'تعليمي ومفيد', promotional: 'إعلاني وتسويقي', emotional: 'عاطفي ومؤثر',
};

const TYPE_MAP = {
  product_ad: 'إعلان منتج', golden_tip: 'نصيحة ذهبية', bold_opinion: 'رأي جريء',
  special_offer: 'عرض خاص', personal_story: 'قصة شخصية', interactive_q: 'سؤال تفاعلي',
};

const PLATFORM_MAP = {
  instagram: 'إنستغرام', tiktok: 'تيك توك', twitter: 'تويتر / X',
  youtube: 'يوتيوب', snapchat: 'سناب شات',
};

const PLATFORM_GUIDELINES = {
  instagram: `- الطول المثالي: ١٥٠-٢٢٠ كلمة
- استخدم ٥-١٠ هاشتاقات ذات صلة في نهاية المنشور
- Hook قوي في أول سطرين لإيقاف التمرير
- قسّم النص بإيموجي لتسهيل القراءة
- انهِ بسؤال يشجع التعليق`,
  tiktok: `- الطول المثالي: ٥٠-١٠٠ كلمة (كابشن قصير وضارب)
- أول جملة = hook يجبر المشاهد على إكمال الفيديو
- استخدم ٣-٥ هاشتاقات ترندينج فقط
- لهجة شبابية وسريعة ومباشرة
- CTA واضح: "اتابع" أو "احفظ" أو "شارك"`,
  twitter: `- الطول المثالي: ٢٠٠-٢٥٠ حرف (تغريدة واحدة قوية)
- فكرة واحدة فقط — لا حشو
- رأي جريء أو معلومة مفاجئة تدفع للريتويت
- لا هاشتاقات كثيرة (١-٢ على الأكثر)
- انهِ بنقطة تشعل النقاش`,
};

const SYSTEM_PROMPT = `أنت كاتب محتوى عربي محترف ومتخصص في انتاج محتوى يحقق تفاعلاً حقيقياً على السوشيال ميديا.
القواعد:
١. السطر الأول يصدم أو يثير فضولاً لا يُقاوَم
٢. لا تبدأ بـ "هل تعلم" أو مقدمة مملة
٣. اكتب بعربية عصرية مفهومة
٤. كل منشور ينتهي بـ call-to-action أو سؤال`;

// ─── إعدادات الوسيط الخادم ────────────────────────────────────────────────
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
const EDGE_URL = `${SUPABASE_URL}/functions/v1/generate-content`;

async function callAI({ system, prompt }) {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    throw new Error('إعدادات Supabase غير مضبوطة.');
  }

  const res = await fetch(EDGE_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
    },
    body: JSON.stringify({ system, prompt }),
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data?.error || `فشل الاتصال (${res.status})`);
  }

  return (data?.text || '').trim();
}

export async function generateContent({ platforms, tone, postType, userInput }) {
  const toneName = TONE_MAP[tone] || tone;
  const typeName = TYPE_MAP[postType] || postType;

  const generateForPlatform = async (platform) => {
    const platformName = PLATFORM_MAP[platform] || platform;
    const platformGuide = PLATFORM_GUIDELINES[platform] || '';

    const prompt = `المنصة: ${platformName}
الأسلوب: ${toneName}
نوع المنشور: ${typeName}
الفكرة: ${userInput}

إرشادات المنصة:
${platformGuide}

اكتب المنشور مباشرة بلا عنوان ولا مقدمة.`;

    try {
      const text = await callAI({ system: SYSTEM_PROMPT, prompt });
      return [platform, text];
    } catch (err) {
      return [platform, `⚠️ ${err.message}`];
    }
  };

  const entries = await Promise.all(platforms.map(generateForPlatform));
  return Object.fromEntries(entries);
}


// ── Free tier (localStorage) ──────────────────────────────────────────────
const MAX_FREE_DAILY = 3;

export function getFreeTierStatus() {
  const today = new Date().toDateString();
  const lastDate = localStorage.getItem('qalami_last_gen_date');
  let count = parseInt(localStorage.getItem('qalami_daily_count') || '0');
  if (lastDate !== today) {
    count = 0;
    localStorage.setItem('qalami_last_gen_date', today);
    localStorage.setItem('qalami_daily_count', '0');
  }
  return {
    remaining: Math.max(0, MAX_FREE_DAILY - count),
    used: count, max: MAX_FREE_DAILY,
    canGenerate: count < MAX_FREE_DAILY,
  };
}

export function incrementUsage() {
  const today = new Date().toDateString();
  localStorage.setItem('qalami_last_gen_date', today);
  const count = parseInt(localStorage.getItem('qalami_daily_count') || '0');
  localStorage.setItem('qalami_daily_count', String(count + 1));
}
