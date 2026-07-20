# خطة: تسجيل دخول + مكتبة لكل مستخدم

## 1) قاعدة البيانات (Supabase migration)

- إنشاء `public.profiles` مرتبط بـ `auth.users(id)` (ON DELETE CASCADE) مع `full_name`, `avatar_url`, `created_at`.
  - GRANTs + RLS: كل مستخدم يقرأ/يحدّث ملفه فقط.
  - Trigger `on_auth_user_created` يستدعي `handle_new_user()` لإنشاء صف profile تلقائياً عند التسجيل.
- إنشاء `public.saved_posts` بحقول: `id`, `user_id (uuid, NOT NULL, references auth.users)`, `platform`, `tone`, `post_type`, `user_input`, `content`, `created_at`.
  - GRANTs لـ `authenticated` و `service_role` فقط (لا anon).
  - RLS: `auth.uid() = user_id` لعمليات SELECT/INSERT/UPDATE/DELETE.

## 2) OAuth مع Google

- تفعيل Google provider في Supabase (المستخدم يضيف Client ID/Secret من Google Cloud Console).
- سأعرض رابط الإعدادات وخطوات Google Cloud بعد الموافقة.

## 3) تأكيد البريد

- سيبقى مُفعّلاً افتراضياً في Supabase — رسالة "تحقق من بريدك" بعد التسجيل، ودخول لا يتم قبل التأكيد.

## 4) الواجهة (Frontend)

- إنشاء `src/hooks/useAuth.js`: يوفر `user`, `session`, `loading` عبر `onAuthStateChange` + `getSession`.
- إنشاء `src/pages/Auth.jsx`: تبويبان (تسجيل دخول / حساب جديد) + زر Google. يستخدم `signInWithPassword`, `signUp` (مع `emailRedirectTo: window.location.origin`), و `signInWithOAuth`.
- إنشاء `src/components/ProtectedRoute.jsx`: يحوّل لـ `/auth` إذا لا يوجد جلسة.
- تعديل `src/App.jsx`: إضافة مسار `/auth` وحماية `/home`, `/results`, `/history`, `/settings`, `/premium`.
- تعديل `src/pages/Splash.jsx`: بعد التحميل يوجّه لـ `/home` إن كان مسجّلاً، وإلا `/auth`.
- تعديل `src/pages/Settings.jsx`: عرض البريد + زر تسجيل الخروج.
- تعديل `src/components/qalami/BottomNav.jsx` (إن لزم) لعرض حالة الحساب.

## 5) خدمة المكتبة

- إعادة كتابة `src/lib/savedPostsService.js`:
  - `list()` → `supabase.from('saved_posts').select().order('created_at', desc).limit(50)`.
  - `create(data)` → إدراج مع `user_id: (await supabase.auth.getUser()).data.user.id`.
  - `delete(id)` → حذف بـ `id` (RLS تضمن الملكية).
- حذف الاعتماد على `localStorage` للمكتبة (نبقيه فقط لتفضيلات النموذج/اللغة).

## 6) بعد موافقتك

1. تشغيل migration لإنشاء الجداول + السياسات + الـ trigger.
2. كتابة/تعديل الملفات أعلاه.
3. توجيهك لتفعيل Google provider في Supabase Dashboard مع الرابط المباشر.

## تفاصيل تقنية

- **لن نضع الأدوار في `profiles`** — لا حاجة الآن لـ user_roles؛ سأضيفه لاحقاً إن طُلبت صلاحيات إدارة.
- **جلسة موثوقة**: أي فحص للهوية داخل التطبيق يستخدم `supabase.auth.getUser()` عند الحاجة، و `onAuthStateChange` لتحديث الحالة.
- **إعادة توجيه OAuth**: `redirectTo: ${window.location.origin}/home`.
- لن أتعامل مع نسيان كلمة المرور في هذه الخطة (يمكن إضافته لاحقاً بصفحة `/reset-password`).
