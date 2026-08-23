// Edge Function: generate-content
// وسيط آمن لاستدعاء Lovable AI Gateway دون كشف المفتاح في المتصفح.

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const AI_BASE_URL = "https://ai.gateway.lovable.dev/v1";
const DEFAULT_MODEL = Deno.env.get("VITE_AI_MODEL") || "google/gemini-3-flash-preview";

// النماذج المسموح بها فقط (allowlist) لمنع تمرير قيم عشوائية من العميل.
const ALLOWED_MODELS = new Set([
  "google/gemini-3-flash-preview",
  "google/gemini-3.5-flash",
  "google/gemini-3.1-flash-lite",
  "google/gemini-3.1-pro-preview",
  "google/gemini-2.5-pro",
  "google/gemini-2.5-flash",
  "google/gemini-2.5-flash-lite",
]);

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const apiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!apiKey) {
      return json({ error: "LOVABLE_API_KEY غير مضبوط في الخادم. أضِفه من Supabase → Edge Functions → Secrets." }, 500);
    }

    const body = await req.json().catch(() => null);
    const prompt = body?.prompt;
    const system = body?.system;
    const requestedModel = typeof body?.model === "string" ? body.model : undefined;

    if (!prompt || typeof prompt !== "string") {
      return json({ error: "الحقل prompt مطلوب" }, 400);
    }

    const model = requestedModel && ALLOWED_MODELS.has(requestedModel) ? requestedModel : DEFAULT_MODEL;

    // معاملات التوليد تصل من العميل مضبوطة حسب فئة النموذج — نحصرها ضمن مدى آمن.
    const num = (v: unknown, fallback: number, min: number, max: number) =>
      typeof v === "number" && Number.isFinite(v) ? Math.min(max, Math.max(min, v)) : fallback;

    const isPro = model.includes("-pro");
    const isLite = model.includes("-lite");
    const defaults = isPro
      ? { temperature: 0.9, top_p: 0.97, frequency_penalty: 0.2, presence_penalty: 0.3 }
      : isLite
      ? { temperature: 0.6, top_p: 0.9, frequency_penalty: 0.4, presence_penalty: 0.15 }
      : { temperature: 0.75, top_p: 0.95, frequency_penalty: 0.3, presence_penalty: 0.2 };

    const params = {
      temperature: num(body?.temperature, defaults.temperature, 0, 2),
      top_p: num(body?.top_p, defaults.top_p, 0, 1),
      frequency_penalty: num(body?.frequency_penalty, defaults.frequency_penalty, -2, 2),
      presence_penalty: num(body?.presence_penalty, defaults.presence_penalty, -2, 2),
    };

    const messages: Array<{ role: string; content: string }> = [];
    if (system && typeof system === "string") messages.push({ role: "system", content: system });
    messages.push({ role: "user", content: prompt });

    const upstream = await fetch(`${AI_BASE_URL}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({ model, messages, ...params }),
    });

    if (!upstream.ok) {
      const errText = await upstream.text().catch(() => "");
      let upstreamMsg = "";
      try {
        const parsed = JSON.parse(errText);
        upstreamMsg = parsed?.error?.message || parsed?.message || parsed?.title || "";
      } catch { /* نص خام */ }

      let message: string;
      switch (upstream.status) {
        case 400:
          message = `طلب غير صالح للنموذج ${model}${upstreamMsg ? ` — ${upstreamMsg}` : ""}`;
          break;
        case 401:
          message = "مفتاح الذكاء الاصطناعي غير صالح أو منتهي — يجب تحديثه في أسرار الخادم.";
          break;
        case 402:
          message = "انتهى رصيد الذكاء الاصطناعي — أضِف رصيداً للمساحة ثم أعد المحاولة.";
          break;
        case 403:
          message = "الوصول إلى الذكاء الاصطناعي محظور بسياسة المساحة (تعطيل أو حد رصيد).";
          break;
        case 429:
          message = "تم تجاوز حد الطلبات — انتظر قليلاً ثم أعد المحاولة.";
          break;
        default:
          message = upstream.status >= 500
            ? `عطل مؤقت في مزود الذكاء الاصطناعي (${upstream.status}) — أعد المحاولة بعد لحظات.`
            : `فشل الاتصال بـ AI (${upstream.status})${upstreamMsg ? ` — ${upstreamMsg}` : ""}`;
      }
      return json({ error: message, details: upstreamMsg || errText, model, params }, upstream.status);
    }

    const data = await upstream.json();
    const text = data?.choices?.[0]?.message?.content?.trim() || "";
    return json({ text, model });
  } catch (err) {
    return json({ error: err instanceof Error ? err.message : "خطأ غير معروف" }, 500);
  }
});
