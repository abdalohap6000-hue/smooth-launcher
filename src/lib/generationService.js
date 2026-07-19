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
- Hook قوي في أول سطرين لإيقاف التمرير
- قسّم النص بإيموجي مناسبة (لا تفرط)
- ٥-١٠ هاشتاقات دقيقة الصلة في نهاية المنشور
- انهِ بسؤال أو CTA يشجّع التعليق`,
  tiktok: `- الطول المثالي: ٥٠-١٠٠ كلمة (كابشن قصير وضارب)
- أول جملة = hook يجبر المشاهد على إكمال الفيديو
- ٣-٥ هاشتاقات ترندينج فقط
- لهجة شبابية سريعة ومباشرة
- CTA واضح: "تابع" أو "احفظ" أو "شارك"`,
  twitter: `- الطول المثالي: أقل من ٢٨٠ حرف (تغريدة واحدة قوية)
- فكرة واحدة فقط — بلا حشو
- رأي جريء أو معلومة مفاجئة تدفع لإعادة النشر
- ١-٢ هاشتاق على الأكثر
- انهِ بنقطة تُشعل النقاش`,
  youtube: `- عنوان جذاب (أول سطر) + وصف ١٠٠-١٥٠ كلمة
- اذكر الفائدة الرئيسية في أول جملتين
- استخدم كلمات مفتاحية للبحث بشكل طبيعي
- ٣-٥ هاشتاقات في النهاية
- CTA: اشترك / فعّل الجرس / علّق`,
  snapchat: `- الطول المثالي: ٣٠-٦٠ كلمة (قصير جداً وسريع)
- لهجة عفوية شخصية كأنك تتحدث مع صديق
- إيموجي معبّرة بدل الحشو
- CTA بسيط: "سوايب أب" أو "ردّ عليّ"`,
};

const SYSTEM_PROMPT = `أنت كاتب محتوى عربي محترف متخصص في السوشيال ميديا، هدفك إنتاج محتوى دقيق واحترافي يحقق تفاعلاً حقيقياً.

قواعد الجودة (إلزامية):
١. اكتب بعربية فصيحة معاصرة سليمة الإملاء والنحو — راجع كل كلمة قبل الإخراج.
٢. السطر الأول لازم يصدم أو يثير فضولاً — ممنوع "هل تعلم" أو المقدمات المستهلكة.
٣. لا تخترع أرقاماً أو إحصائيات أو أسماء غير موجودة في المدخل — إن لم تكن متأكداً، اكتفِ بصياغة عامة.
٤. التزم بحدود الطول والأسلوب وإرشادات المنصة بدقة.
٥. لا تكرر نفس الفكرة بصياغات مختلفة — كل جملة تضيف قيمة جديدة.
٦. الإيموجي أداة تعزيز لا زخرفة — استخدمها فقط عند اللزوم.
٧. انهِ بـ call-to-action أو سؤال محفّز بلا كليشيهات.
٨. أخرج نص المنشور فقط — بلا عنوان، بلا شرح، بلا علامات اقتباس، بلا "إليك المنشور".`;

// ─── إعدادات الوسيط الخادم ────────────────────────────────────────────────
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
const DEFAULT_MODEL = import.meta.env.VITE_AI_MODEL || 'google/gemini-3-flash-preview';
const EDGE_URL = SUPABASE_URL ? `${SUPABASE_URL}/functions/v1/generate-content` : '';

export const AVAILABLE_MODELS = [
  { id: 'google/gemini-3-flash-preview', label: 'Gemini 3 Flash (الافتراضي)' },
  { id: 'google/gemini-3.5-flash', label: 'Gemini 3.5 Flash' },
  { id: 'google/gemini-3.1-flash-lite', label: 'Gemini 3.1 Flash Lite' },
  { id: 'google/gemini-3.1-pro-preview', label: 'Gemini 3.1 Pro' },
  { id: 'google/gemini-2.5-pro', label: 'Gemini 2.5 Pro' },
  { id: 'google/gemini-2.5-flash', label: 'Gemini 2.5 Flash' },
  { id: 'google/gemini-2.5-flash-lite', label: 'Gemini 2.5 Flash Lite' },
];

export function getSelectedModel() {
  return localStorage.getItem('qalami_ai_model') || DEFAULT_MODEL;
}

export function setSelectedModel(id) {
  localStorage.setItem('qalami_ai_model', id);
}

async function callAI({ system, prompt }) {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    throw new Error('إعدادات Supabase ناقصة (VITE_SUPABASE_URL أو VITE_SUPABASE_PUBLISHABLE_KEY).');
  }

  const res = await fetch(EDGE_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
    },
    body: JSON.stringify({ system, prompt, model: getSelectedModel(), temperature: 0.75 }),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.error || `فشل الاتصال (${res.status})`);
  return (data?.text || '').trim();
}

export async function generateContent({ platforms, tone, postType, userInput }) {
  const toneName = TONE_MAP[tone] || tone;
  const typeName = TYPE_MAP[postType] || postType;

  const generateForPlatform = async (platform) => {
    const platformName = PLATFORM_MAP[platform] || platform;
    const platformGuide = PLATFORM_GUIDELINES[platform] || '';

    const prompt = `المنصة: ${platformName}
الأسلوب المطلوب: ${toneName}
نوع المنشور: ${typeName}
فكرة/موضوع المستخدم: ${userInput}

إرشادات المنصة (التزم بها حرفياً):
${platformGuide}

المطلوب:
- منشور واحد مصقول جاهز للنشر مباشرة.
- التزم بالأسلوب "${toneName}" ونوع المنشور "${typeName}" بدقة.
- لا تُضِف عنواناً، ولا مقدمة تفسيرية، ولا علامات اقتباس، ولا أي نص قبل أو بعد المنشور.
- تأكد من صحة الإملاء والنحو قبل الإرسال.`;

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


// ── الاستخدام المجاني بدون اشتراك (غير محدود) ─────────────────────────────
// تمّت إزالة السقف اليومي — يمكن للمستخدم التوليد بدون اشتراك Pro.
export function getFreeTierStatus() {
  return { remaining: Infinity, used: 0, max: Infinity, canGenerate: true };
}

export function incrementUsage() {
  const today = new Date().toDateString();
  localStorage.setItem('qalami_last_gen_date', today);
  const count = parseInt(localStorage.getItem('qalami_daily_count') || '0');
  localStorage.setItem('qalami_daily_count', String(count + 1));
}
