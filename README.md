# قلمي AI — Standalone Version

## التثبيت
```bash
npm install
npm run dev
```

## ربط الذكاء الاصطناعي
افتح `src/lib/generationService.js` وعدّل دالة `generateForPlatform` لتستخدم API الخاص بك.

### مثال مع OpenAI:
```js
const response = await fetch('https://api.openai.com/v1/chat/completions', {
  method: 'POST',
  headers: { Authorization: `Bearer ${import.meta.env.VITE_OPENAI_KEY}` },
  body: JSON.stringify({ model: 'gpt-4o', messages: [{ role: 'user', content: prompt }] }),
});
const data = await response.json();
return [platform, data.choices[0].message.content];
```

### مثال مع Anthropic Claude:
```js
const response = await fetch('https://api.anthropic.com/v1/messages', {
  method: 'POST',
  headers: { 'x-api-key': import.meta.env.VITE_ANTHROPIC_KEY, 'anthropic-version': '2023-06-01' },
  body: JSON.stringify({ model: 'claude-3-5-sonnet-20241022', max_tokens: 1024, messages: [{ role: 'user', content: prompt }] }),
});
const data = await response.json();
return [platform, data.content[0].text];
```

## بوابة الدفع
تم ربط خطتي Lemon Squeezy الفعليتين في `src/pages/Premium.jsx`:

- الشهري: `https://imagineal.lemonsqueezy.com/checkout/buy/fc74f7a5-475a-400f-a106-4004088743c7`
- السنوي: `https://imagineal.lemonsqueezy.com/checkout/buy/e91fa95f-213a-428f-84e2-25ac341c8ab5`

يمكن استبدال الرابطين عند الحاجة باستخدام `VITE_LEMON_SQUEEZY_MONTHLY_URL` و
`VITE_LEMON_SQUEEZY_YEARLY_URL`. يجب أن يكون الرابطان روابط Checkout من Lemon
Squeezy بصيغة `https://<store>.lemonsqueezy.com/checkout/...`؛ إذا غاب رابط أو
كان غير صالح، يتعطل زر الشراء لهذه الخطة بدلاً من فتح رابط مكسور.

لإرجاع المستخدم بعد الدفع، اضبط `redirect_url` في إعدادات كل Checkout إلى:
`https://<نطاق-التطبيق>/premium?checkout=success`
تتعرف صفحة Premium على حالتي `checkout=success` و`checkout=cancelled`، ثم تنظف
معامل الحالة من العنوان حتى لا تظهر رسالة النجاح مجدداً عند تحديث الصفحة.

## التخزين
المكتبة تستخدم `localStorage` بدلاً من قاعدة بيانات خارجية.
لاستبدالها بـ Supabase أو Firebase، عدّل `src/lib/savedPostsService.js`.