// Edge Function: generate-content
// وسيط آمن لاستدعاء Lovable AI Gateway دون كشف المفتاح في المتصفح.

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const AI_BASE_URL = "https://ai.gateway.lovable.dev/v1";
const AI_MODEL = Deno.env.get("AI_MODEL") || "google/gemini-3-flash-preview";

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const apiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: "LOVABLE_API_KEY غير مضبوط في الخادم" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const body = await req.json().catch(() => null);
    const prompt = body?.prompt;
    const system = body?.system;

    if (!prompt || typeof prompt !== "string") {
      return new Response(
        JSON.stringify({ error: "الحقل prompt مطلوب" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const messages: Array<{ role: string; content: string }> = [];
    if (system && typeof system === "string") {
      messages.push({ role: "system", content: system });
    }
    messages.push({ role: "user", content: prompt });

    const upstream = await fetch(`${AI_BASE_URL}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({ model: AI_MODEL, messages }),
    });

    if (!upstream.ok) {
      const errText = await upstream.text().catch(() => "");
      let message = `فشل الاتصال بـ AI (${upstream.status})`;
      if (upstream.status === 429) message = "تم تجاوز حد الطلبات. حاول لاحقاً.";
      else if (upstream.status === 402) message = "انتهى الرصيد. يرجى إضافة رصيد للحساب.";
      return new Response(
        JSON.stringify({ error: message, details: errText }),
        { status: upstream.status, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const data = await upstream.json();
    const text = data?.choices?.[0]?.message?.content?.trim() || "";

    return new Response(
      JSON.stringify({ text }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : "خطأ غير معروف" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
