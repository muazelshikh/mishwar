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
14. **التقييمات** — تقييم السائق بعد كل رحلة (1-5 نجوم + تعليق)
15. **OTP عبر SMS** — تسجيل دخول/تسجيل بدون كلمة مرور (مع mock في dev)

## نظام المحفظة (Wallet System)

- **الجداول**: `wallets`, `wallet_transactions`, `payments`
- **العملة**: مخزّنة كـ `integer` بوحدة الهلل/القرش (1 ر.س = 100 هلل) لتجنب أخطاء التقريب العشري
- **الـ API**: `/api/wallet/{me, summary, transactions, payments, topup}`
- **الواجهة**: `artifacts/mishwar/src/pages/wallet.tsx`
- **خدمة المحفظة الذرية** (`artifacts/api-server/src/lib/wallet-service.ts`):
  - `creditWallet()` و `debitWallet()` تعملان داخل `db.transaction` مع `SELECT ... FOR UPDATE`
  - `InsufficientFundsError` عند الرصيد غير الكافي → HTTP 402
  - تُنشئ سجلات `wallet_transactions` تلقائياً (positive للإيداع، negative للخصم)
- **الخصم التلقائي**: عند `PATCH /api/rides/:id` بـ `status="completed"`:
  - يُخصم `final_price * 100` (هلل) من محفظة الراكب
  - يُودَع 80% منها في محفظة السائق (`DRIVER_SHARE_PERCENT`)
  - حماية ضد الخصم المزدوج: التحقق من `existing.status !== "completed"` قبل الخصم
- **حالة معالج الدفع**: 
  - الجداول جاهزة بأعمدة `stripe_payment_intent_id` و `stripe_checkout_session_id`
  - **Stripe لم يُربط بعد** — رفض المستخدم اقتراح الربط في 2026-05-02
  - شحن المحفظة عبر `/topup` ينشئ payment بحالة `pending` ينتظر معالج خارجي
  - **خيارات لاحقة**: Stripe، Tap/HyperPay/Moyasar، أو تحويل بنكي + تأكيد إداري

## نظام التقييمات (Ratings)

- **الجدول**: `ratings` (rideId, raterId, ratedUserId, rating 1-5, comment)
- **قيد فريد**: `(rater_id, ride_id)` — تقييم واحد لكل راكب لكل رحلة (idempotent)
- **الـ API**:
  - `POST /api/ratings` — إنشاء تقييم (يتحقق من ملكية الرحلة، يُحدّث متوسط `users.rating`)
  - `GET /api/ratings/user/:userId` — قائمة تقييمات مستخدم
  - `GET /api/ratings/ride/:rideId` — تقييمات رحلة
- **الواجهة**: `artifacts/mishwar/src/components/rate-driver-dialog.tsx` (5 نجوم + تعليق)

## نظام OTP

- **الجدول**: `otp_codes` (phone, code_hash SHA256, purpose, expires_at, used_at)
- **الكود**: 6 أرقام عشوائية عبر `crypto.randomInt`، صالح 5 دقائق
- **التخزين**: hash فقط (لا يُخزن الكود الأصلي) لحماية ضد تسرب DB
- **حد المعدل**: 5 طلبات لكل رقم في الساعة → 429
- **الـ API**:
  - `POST /api/auth/otp/request` — يرسل SMS (mock في dev، Twilio/Unifonic في prod)
  - `POST /api/auth/otp/verify` — يتحقق من الكود، يُرجع توكن إذا `purpose=login`
- **مزود SMS**: `artifacts/api-server/src/lib/sms.ts` — يدعم console (dev) / Twilio / Unifonic عبر `SMS_PROVIDER` env

## نظام السجلات (Audit Logs)

- **الجدول**: `audit_logs` (actor_id, action, entity_type, entity_id, diff, ip, user_agent)
- **المساعد**: `artifacts/api-server/src/lib/audit.ts` → `audit({...})`
- **الاستخدام المستقبلي**: تسجيل عمليات admin، تغيير الحالات الحساسة

## الأمان (Security Hardening)

- **Password hashing**: `bcrypt` (12 rounds) — يُرقّي تلقائياً hashes القديمة (SHA256-HMAC) عند تسجيل الدخول
- **JWT**: `iat` + `exp` إجباريان (TTL = 7 أيام)، رفض tokens بدون `exp`
- **SESSION_SECRET**: يجب ≥16 حرف وليس من القائمة المحظورة، الخادم يرفض البدء وإلا
- **Constant-time compare**: `crypto.timingSafeEqual` لتوقيعات JWT وكلمات السر القديمة
- **OTP rate limit**: SQL count على آخر ساعة (يُمنع الإغراق)

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
- `GET /api/wallet/{me,summary,transactions,payments}` + `POST /api/wallet/topup`
- `POST /api/ratings`, `GET /api/ratings/user/:id`, `GET /api/ratings/ride/:id`
- `POST /api/auth/otp/request`, `POST /api/auth/otp/verify`

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
