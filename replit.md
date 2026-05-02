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
9. **لوحة الإدارة** — إدارة شاملة (admin فقط)
10. **الإحصائيات** — إحصاءات المنصة (admin فقط)

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
- `GET/PATCH /api/admin/*` — لوحة الإدارة (admin فقط)
- `GET /api/stats/*` — الإحصائيات

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
