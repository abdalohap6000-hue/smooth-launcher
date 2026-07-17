// ─────────────────────────────────────────────────────────────────────────────
// generationService.js — standalone version
//
// REPLACE the generateForPlatform function body with your own LLM API call.
// Example using OpenAI:
//
//   const response = await fetch('https://api.openai.com/v1/chat/completions', {
//     method: 'POST',
//     headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${YOUR_KEY}` },
//     body: JSON.stringify({ model: 'gpt-4o', messages: [{ role: 'user', content: prompt }] }),
//   });
//   const data = await response.json();
//   return data.choices[0].message.content;
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

// ─── إعدادات API من متغيرات البيئة ────────────────────────────────────────
const AI_API_KEY = import.meta.env.VITE_AI_API_KEY;
const AI_BASE_URL = import.meta.env.VITE_AI_BASE_URL || 'https://ai.gateway.lovable.dev/v1';
const AI_MODEL = import.meta.env.VITE_AI_MODEL || 'google/gemini-3-flash-preview';

async function callAI(prompt) {
  if (!AI_API_KEY) {
    throw new Error('مفتاح AI غير مضبوط. أضف VITE_AI_API_KEY في ملف .env');
  }

  const res = await fetch(`${AI_BASE_URL}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${AI_API_KEY}`,
    },
    body: JSON.stringify({
      model: AI_MODEL,
      messages: [{ role: 'user', content: prompt }],
    }),
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => '');
    if (res.status === 429) throw new Error('تم تجاوز حد الطلبات. حاول لاحقاً.');
    if (res.status === 402) throw new Error('انتهت الرصيد. يرجى إضافة رصيد للحساب.');
    throw new Error(`فشل الاتصال بـ AI (${res.status}): ${errText}`);
  }

  const data = await res.json();
  return data.choices?.[0]?.message?.content?.trim() || '';
}

export async function generateContent({ platforms, tone, postType, userInput }) {
  const toneName = TONE_MAP[tone] || tone;
  const typeName = TYPE_MAP[postType] || postType;

  const generateForPlatform = async (platform) => {
    const platformName = PLATFORM_MAP[platform] || platform;
    const platformGuide = PLATFORM_GUIDELINES[platform] || '';

    const prompt = `${SYSTEM_PROMPT}

المنصة: ${platformName}
الأسلوب: ${toneName}
نوع المنشور: ${typeName}
الفكرة: ${userInput}

إرشادات المنصة:
${platformGuide}

اكتب المنشور مباشرة بلا عنوان ولا مقدمة.`;

    try {
      const text = await callAI(prompt);
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