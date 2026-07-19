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

    const messages: Array<{ role: string; content: string }> = [];
    if (system && typeof system === "string") messages.push({ role: "system", content: system });
    messages.push({ role: "user", content: prompt });

    const upstream = await fetch(`${AI_BASE_URL}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({ model, messages }),
    });

    if (!upstream.ok) {
      const errText = await upstream.text().catch(() => "");
      let message = `فشل الاتصال بـ AI (${upstream.status})`;
      if (upstream.status === 429) message = "تم تجاوز حد الطلبات. حاول لاحقاً.";
      else if (upstream.status === 402) message = "انتهى الرصيد. يرجى إضافة رصيد للحساب.";
      return json({ error: message, details: errText, model }, upstream.status);
    }

    const data = await upstream.json();
    const text = data?.choices?.[0]?.message?.content?.trim() || "";
    return json({ text, model });
  } catch (err) {
    return json({ error: err instanceof Error ? err.message : "خطأ غير معروف" }, 500);
  }
});
