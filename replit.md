# مشوار (Mishwar) — منصة النقل الشاملة

## نظرة عامة

pnpm workspace monorepo — منصة نقل شاملة تشبه Uber مع ميزات إضافية للسوق العربي.

## Stack التقني

- **Monorepo**: pnpm workspaces
- **Node.js**: v24
- **API**: Express 5 + Drizzle ORM (PostgreSQL)
- **Frontend**: React + Vite + Wouter + TanStack Query + shadcn/ui
- **Validation**: Zod v4 + drizzle-zod
- **Auth**: JWT HMAC (signToken/verifyToken)
- **Codegen**: Orval (من OpenAPI spec)
- **Build**: esbuild (CJS bundle)
- **Theme**: RTL عربي، Tajawal font، أحمر برتقالي + أزرق داكن

## الخدمات والميزات

### ميزات المستخدم (passenger):
1. **الرئيسية** — حجز رحلة فردية فورية أو مجدولة
2. **رحلاتي** — قائمة جميع الرحلات الفردية مع التفاصيل
3. **الرحلات الجماعية** — تصفح وحجز تراحيل بين المدن (أسبوعي/شهري/مرة واحدة)
4. **اشتراكاتي** — إدارة اشتراكات التراحيل
5. **رحلات الدعوة** — إنشاء رحلة وإرسال رابط للأصدقاء
6. **تأجير سيارات** — حجز سيارة بالأيام مع قائمة سيارات متاحة
7. **استئجار سائق** — حجز سائق خاص بالساعات
8. **بوابة السائق** — لوحة تحكم للسائقين (أرباح، رحلات، توفر)
9. **بوابة ملاك السيارات** — تسجيل، إدارة الأسطول، تتبع أرباح كل سيارة
10. **بوابة الشركات** — اشتراك مؤسسي، إدارة موظفين، مسارات نقل، فواتير
11. **لوحة الإدارة** — إدارة شاملة (admin فقط)
12. **الإحصائيات** — إحصاءات المنصة (admin فقط)
13. **محفظتي** — رصيد إلكتروني، شحن، سجل معاملات، عمليات دفع

## نظام المحفظة (Wallet System)

- **الجداول**: `wallets`, `wallet_transactions`, `payments`
- **العملة**: مخزّنة كـ `integer` بوحدة الهلل/القرش (1 ر.س = 100 هلل) لتجنب أخطاء التقريب العشري
- **الـ API**: `/api/wallet/{me, summary, transactions, payments, topup}`
- **الواجهة**: `artifacts/mishwar/src/pages/wallet.tsx`
- **حالة معالج الدفع**: 
  - الجداول جاهزة بأعمدة `stripe_payment_intent_id` و `stripe_checkout_session_id`
  - **Stripe لم يُربط بعد** — رفض المستخدم اقتراح الربط في 2026-05-02
  - المحفظة تعمل ككتلة برمجية مكتملة، تنشئ سجلات `payments` بحالة `pending` وتنتظر تأكيد من معالج خارجي
  - **خيارات لاحقة**: إعادة عرض Stripe، استخدام Tap/HyperPay/Moyasar (يحتاج API keys يدوياً)، أو نظام يدوي (تحويل بنكي + تأكيد إداري)

### Invite Trip Flow:
1. المستخدم ينشئ رحلة دعوة → يحصل على رابط فريد
2. يشارك الرابط → الضيوف يفتحون `/invite/:code`
3. الضيوف يردون (قبول/رفض) بدون حساب
4. المنشئ يؤكد الرحلة

## بيانات للاختبار

- **Admin**: phone: `0501234567`, password: `password123`
- **دور المدير**: يظهر "بوابة السائق" + "لوحة الإدارة" + "الإحصائيات"

## الجداول في قاعدة البيانات

- `users` — المستخدمون (passenger, driver, admin) + status
- `drivers` — السائقون + driverStatus (pending/approved/rejected/suspended)
- `rides` — الرحلات الفردية
- `group_trips` — التراحيل الجماعية
- `group_trip_registrations` — حجوزات التراحيل
- `subscriptions` — الاشتراكات
- `invite_trips` — رحلات الدعوة
- `invite_guests` — ضيوف رحلات الدعوة
- `rental_cars` — سيارات التأجير (7 سيارات مبذورة)
- `rental_bookings` — حجوزات التأجير
- `driver_bookings` — حجوزات السائقين الخاصة
- `car_owners` / `owner_vehicles` / `owner_earnings` — بوابة ملاك السيارات
- `organizations` / `org_employees` / `org_routes` / `org_invoices` — بوابة الشركات

## أوامر مهمة

```bash
# تحديث API spec والكود المولّد
pnpm --filter @workspace/api-spec run codegen
# ملاحظة: يصحح api-zod/src/index.ts تلقائياً بعد codegen

# Push تغييرات قاعدة البيانات
pnpm --filter @workspace/db run push

# تشغيل API محلياً
pnpm --filter @workspace/api-server run dev
```

## مسارات الـ API

- `POST /api/auth/register` — تسجيل
- `POST /api/auth/login` — تسجيل دخول
- `GET/POST /api/rides` — الرحلات
- `GET/POST /api/group-trips` — التراحيل الجماعية
- `GET/POST /api/subscriptions` — الاشتراكات
- `GET/POST /api/invite-trips` — رحلات الدعوة
- `GET/POST /api/invite/:code/respond` — الرد على دعوة (عام)
- `GET/POST /api/rentals` — تأجير السيارات
- `GET/POST /api/driver-bookings` — حجوزات السائقين
- `GET/PATCH /api/driver-portal/*` — بوابة السائق
- `GET/POST/PATCH /api/owner-portal/*` — بوابة ملاك السيارات (profile, vehicles, earnings, stats)
- `GET/POST/PATCH /api/business-portal/*` — بوابة الشركات (profile, employees, routes, invoices)
- `GET/PATCH /api/admin/*` — لوحة الإدارة (admin فقط)
- `GET /api/stats/*` — الإحصائيات

## الربط مع GitHub

- متصل عبر Replit GitHub Connector (OAuth)
- المستودع: https://github.com/muazelshikh/mishwar (default branch: `main`)

## هيكل المشروع

```
artifacts/
  api-server/    — Express backend (port من PORT env)
  mishwar/       — React frontend (port من PORT env)
lib/
  api-spec/      — OpenAPI spec + orval config
  api-client-react/ — TanStack Query hooks (generated)
  api-zod/       — Zod schemas (generated)
  db/            — Drizzle ORM schema + client
```
