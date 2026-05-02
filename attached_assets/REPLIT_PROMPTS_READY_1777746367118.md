# 🚀 برومبتات جاهزة للنسخ - Replit Agent

> **استخدم هذه البرومبتات بالترتيب. انسخ كل برومبت وألصقه في Replit Agent.**
> **انتظر اكتمال كل برومبت قبل الانتقال للتالي.**

---

## 📌 البرومبت 1: إعداد المشروع الأساسي

```
أريد منك بناء منصة نقل شاملة بإسم "مشوار" (Mishwar) - منصة مثل Uber لكن أشمل تخدم السوق السوداني والسعودي.

ابدأ بإنشاء Monorepo باستخدام Turborepo مع pnpm workspaces.

الهيكل المطلوب:
mishwar-platform/
├── apps/
│   ├── api/           (NestJS Backend)
│   ├── web/           (Next.js 15 - User Web App)
│   ├── admin/         (Next.js 15 - Admin Dashboard)
│   └── driver-portal/ (Next.js 15 - Driver Portal)
├── packages/
│   ├── database/      (Prisma)
│   ├── ui/            (Shared Components)
│   ├── types/         (TypeScript Types)
│   ├── utils/         (Helper Functions)
│   └── config/        (Shared Configs)

التقنيات:
- TypeScript (strict mode) في كل المشروع
- ESLint + Prettier
- pnpm كـ package manager
- Husky للـ git hooks

أنشئ:
1. المجلدات والهيكل الكامل
2. ملفات package.json لكل app و package
3. tsconfig.json مشترك
4. .env.example شامل
5. README.md احترافي بالعربية والإنجليزية
6. .gitignore شامل
7. turbo.json configuration

لا تبدأ في كتابة أي كود تطبيقي بعد. فقط الإعداد والهيكل.
```

---

## 📌 البرومبت 2: قاعدة البيانات (Prisma)

```
الآن أنشئ Prisma schema كامل في packages/database/prisma/schema.prisma

استخدم PostgreSQL كقاعدة بيانات.

الجداول المطلوبة (مع كل العلاقات والـ enums):

1. User - المستخدمون (rider, driver, admin, organization)
2. Driver - السائقون (مع كل بيانات الترخيص والاعتماد)
3. Vehicle - المركبات (شريكة، مملوكة، متعاقدة)
4. VehicleCategory - فئات المركبات (قابلة للتخصيص)
5. Trip - الرحلات (14 نوع: solo, group, invite, inter-state, etc.)
6. Route - المسارات الثابتة للتراحيل
7. Subscription - الاشتراكات
8. InviteTrip - الرحلات بالدعوة
9. InviteTripGuest - ضيوف الرحلات
10. Rental - تأجير السيارات
11. DriverBooking - استئجار السائقين
12. Payment - المدفوعات
13. Rating - التقييمات
14. Notification - الإشعارات
15. MaintenanceRecord - سجلات الصيانة
16. DriverCertification - شهادات السائقين
17. Setting - الإعدادات القابلة للتخصيص
18. FeatureFlag - تفعيل/تعطيل الميزات

كل جدول يحتاج:
- UUID كـ primary key
- timestamps (createdAt, updatedAt)
- enums حيث مناسب
- relations صحيحة
- indexes للأداء

بعد إنشاء الـ schema:
1. أنشئ migration أولي
2. أنشئ seed data للاختبار (10 users, 5 drivers, vehicle categories, etc.)
3. أنشئ Prisma client utilities في packages/database/src/

استخدم schema الكامل المرفق في ملف REPLIT_AGENT_PROMPT.md كمرجع.
```

---

## 📌 البرومبت 3: NestJS Backend - الأساس

```
الآن ابني NestJS Backend في apps/api/

استخدم:
- NestJS 11
- Prisma (من packages/database)
- Zod للتحقق
- JWT للمصادقة (access + refresh tokens)
- bcrypt لتشفير كلمات السر
- Swagger للتوثيق
- Helmet, CORS, rate limiting للأمان
- Pino logger

الهيكل:
apps/api/src/
├── main.ts
├── app.module.ts
├── modules/
│   ├── auth/
│   ├── users/
│   ├── drivers/
│   ├── vehicles/
│   ├── trips/
│   ├── routes/
│   ├── subscriptions/
│   ├── invite-trips/
│   ├── rentals/
│   ├── driver-bookings/
│   ├── payments/
│   ├── ratings/
│   ├── notifications/
│   ├── fleet/
│   ├── admin/
│   └── settings/
├── common/
│   ├── decorators/    (Roles, CurrentUser, etc.)
│   ├── filters/       (HttpException filter)
│   ├── guards/        (Auth guard, Roles guard)
│   ├── interceptors/  (Logging, Transform)
│   └── pipes/         (Validation pipe)
├── config/
└── shared/

ابدأ ببناء:
1. main.ts مع كل الـ middleware
2. app.module.ts مع تحميل كل الـ modules
3. config/configuration.ts (env variables)
4. common/filters و guards و interceptors

ثم:
5. Auth Module كامل:
   - POST /auth/register
   - POST /auth/login
   - POST /auth/refresh
   - POST /auth/forgot-password
   - POST /auth/reset-password
   - POST /auth/verify-otp (mock OTP)
   - POST /auth/logout

6. Users Module:
   - GET /users/me
   - PATCH /users/me
   - POST /users/me/avatar
   - GET /users/me/wallet
   - POST /users/me/wallet/topup

استخدم DTOs مع Zod validation.
أضف Swagger decorators.
اكتب التعليقات بالعربية والإنجليزية.
```

---

## 📌 البرومبت 4: NestJS Backend - الـ Modules الرئيسية

```
أكمل بناء NestJS Backend مع باقي الـ Modules:

1. Drivers Module:
   - POST /drivers/register - تسجيل سائق
   - POST /drivers/me/documents - رفع المستندات
   - GET /drivers/me/dashboard - لوحة السائق
   - PATCH /drivers/me/availability - تغيير الحالة
   - GET /drivers/me/earnings - الأرباح
   - GET /drivers/me/trips - رحلاتي
   - POST /drivers/me/withdraw - سحب الأرباح

2. Vehicles Module:
   - POST /vehicles - تسجيل مركبة
   - GET /vehicles/categories - الفئات
   - PATCH /vehicles/:id - تعديل
   - POST /vehicles/:id/photos - رفع صور

3. Trips Module:
   - POST /trips/request - طلب رحلة (مع matching algorithm)
   - GET /trips/:id - تفاصيل
   - POST /trips/:id/cancel - إلغاء
   - POST /trips/:id/accept - قبول (للسائق)
   - POST /trips/:id/start - بدء
   - POST /trips/:id/complete - إنهاء
   - GET /trips/estimate-fare - تقدير السعر
   - POST /trips/:id/rate - تقييم

4. Routes Module:
   - GET /routes
   - POST /routes (admin)
   - PATCH /routes/:id
   - POST /routes/:id/subscribe

5. Subscriptions Module:
   - GET /subscriptions/me
   - POST /subscriptions
   - PATCH /subscriptions/:id
   - DELETE /subscriptions/:id

6. Invite Trips Module:
   - POST /invite-trips - إنشاء
   - GET /invite-trips/:link - عرض دعوة
   - POST /invite-trips/:link/respond - رد
   - POST /invite-trips/:id/confirm - تأكيد
   - GET /invite-trips/me - رحلاتي

7. Rentals Module:
   - GET /rentals/available - السيارات المتاحة
   - POST /rentals/book - حجز
   - GET /rentals/:id
   - POST /rentals/:id/start - بدء التأجير
   - POST /rentals/:id/return - إرجاع

8. Driver Bookings Module:
   - GET /driver-bookings/available - السائقون المتاحون
   - POST /driver-bookings - حجز
   - GET /driver-bookings/:id
   - PATCH /driver-bookings/:id - تحديث

كل module يحتاج:
- Controller مع Swagger docs
- Service مع business logic
- DTOs مع Zod validation
- Tests (unit tests للـ services)

استخدم Prisma client من packages/database.
استخدم event emitters للأحداث المهمة.
أضف logging مناسب.
```

---

## 📌 البرومبت 5: NestJS Backend - الميزات المتقدمة

```
أضف الميزات المتقدمة للـ Backend:

1. Payments Module:
   - POST /payments/initiate - بدء دفعة
   - POST /payments/confirm - تأكيد
   - POST /payments/webhook - webhook للبوابات
   - GET /payments/me - مدفوعاتي
   
   ادعم: Cash, Wallet, Card (Stripe mock), Bankak (mock), 
         SAH (mock), STC Pay (mock), Mada (mock)

2. Notifications Module:
   - GET /notifications/me
   - PATCH /notifications/:id/read
   - POST /notifications/test (admin)
   
   نفذ: Email service (mock), SMS service (mock), 
         Push notifications (web push)

3. Real-time مع Socket.io:
   - Trip updates
   - Driver location updates
   - Notifications
   - Chat (rider <-> driver)

4. Fleet Management Module:
   - GET /fleet/vehicles - إدارة الأسطول
   - POST /fleet/vehicles - إضافة مركبة مملوكة
   - GET /fleet/maintenance - سجل الصيانة
   - POST /fleet/maintenance - تسجيل صيانة
   - GET /fleet/employees - السائقون الموظفون
   - POST /fleet/employees - توظيف سائق
   - GET /fleet/payroll - الرواتب
   - GET /fleet/analytics - تحليلات الأسطول

5. Admin Module:
   - GET /admin/dashboard - إحصائيات
   - GET /admin/users - إدارة
   - PATCH /admin/users/:id/status
   - GET /admin/drivers/pending
   - POST /admin/drivers/:id/approve
   - POST /admin/drivers/:id/reject
   - GET /admin/trips/live
   - GET /admin/reports/*
   - GET /admin/disputes

6. Settings Module:
   - GET /settings - كل الإعدادات
   - GET /settings/:key
   - PATCH /settings/:key (admin only)
   - GET /settings/category/:category

7. Feature Flags Module:
   - GET /feature-flags
   - PATCH /feature-flags/:name (admin only)
   - GET /feature-flags/check/:name (لـ frontend)

8. Background Jobs (BullMQ):
   - Send notifications
   - Process payments
   - Generate reports
   - Driver matching
   - Route optimization

9. Analytics Service:
   - Trip statistics
   - Revenue analytics
   - Driver performance
   - User behavior

أضف Swagger documentation لكل الـ endpoints.
اكتب unit tests للخدمات الحرجة.
```

---

## 📌 البرومبت 6: Frontend - Web App (Part 1)

```
الآن ابني تطبيق المستخدم في apps/web/ باستخدام Next.js 15.

التقنيات:
- Next.js 15 مع App Router
- TypeScript strict mode
- Tailwind CSS مع plugin RTL
- Shadcn/UI (نصب كل المكونات)
- Zustand للحالة العامة
- TanStack Query للـ API calls
- React Hook Form + Zod
- next-intl للترجمة (ar/en)
- next-themes للوضع الفاتح/الداكن
- Mapbox GL JS للخرائط
- Framer Motion للأنيميشن
- Lucide Icons
- Recharts للرسوم البيانية

الإعداد:
1. أعد next.config.js مع dynamic routes
2. أعد tailwind.config.js مع:
   - RTL plugin
   - Custom colors:
     primary: #0F2C59 (أزرق داكن)
     secondary: #D4AF37 (ذهبي)
     accent: #2C7873 (أخضر)
   - Custom fonts: Tajawal للعربية, Inter للإنجليزية
   - Custom animations
3. أعد middleware للترجمة
4. أنشئ ملفات الترجمة (messages/ar.json, messages/en.json)

الصفحات العامة (Public):

1. / - Landing Page
   - Hero Section بفيديو خلفية
   - Services Grid (14 خدمة بأيقونات)
   - How It Works (4 خطوات)
   - Why Choose Us (6 مميزات)
   - Testimonials
   - Stats Counter
   - For Drivers Section
   - For Business Section
   - FAQ
   - Footer

2. /about - عن مشوار
3. /services - كل الخدمات
4. /services/[type] - تفاصيل خدمة
5. /become-driver - انضم كسائق
6. /business - حلول الشركات
7. /contact - اتصل بنا
8. /blog - المدونة
9. /login - تسجيل دخول
10. /register - تسجيل
11. /forgot-password - استعادة كلمة السر
12. /verify-otp - تحقق OTP

التصميم:
- Modern, Clean, Professional
- RTL-first
- Mobile-first responsive
- Dark mode support
- Smooth animations
- High accessibility (a11y)

ابدأ بـ:
1. Layout الرئيسي مع Header/Footer
2. الصفحة الرئيسية كاملة
3. صفحات Auth (login, register)
4. middleware والـ auth flow
```

---

## 📌 البرومبت 7: Frontend - Web App (Part 2)

```
أكمل بناء Web App بـ:

الصفحات المحمية (Authenticated):

1. /dashboard - لوحة المستخدم
   - إحصائيات شخصية
   - الرحلات الأخيرة
   - الاشتراكات النشطة
   - رصيد المحفظة
   - الإشعارات

2. /dashboard/profile - الملف الشخصي
3. /dashboard/trips - رحلاتي مع filters
4. /dashboard/wallet - المحفظة
   - الرصيد
   - شحن الرصيد
   - تاريخ المعاملات
5. /dashboard/payments - المدفوعات
6. /dashboard/favorites - الأماكن المفضلة
7. /dashboard/notifications - الإشعارات
8. /dashboard/settings - الإعدادات الشخصية

صفحات الخدمات:

9. /ride/new - طلب رحلة جديدة
   - خريطة Mapbox تفاعلية
   - اختيار pickup و dropoff
   - عرض السائقين القريبين
   - اختيار فئة السيارة
   - تقدير السعر
   - تأكيد الطلب

10. /ride/[id] - تتبع الرحلة
    - خريطة لحظية بالموقع
    - معلومات السائق
    - تواصل مع السائق (chat)
    - زر الطوارئ SOS
    - مشاركة الرحلة

11. /subscriptions - الاشتراكات المتاحة
12. /subscriptions/[id] - تفاصيل
13. /subscriptions/manage - إدارة اشتراكاتي

14. /invite-trips/new - إنشاء رحلة بدعوة
    - اختيار نوع المركبة
    - تحديد الوجهة على الخريطة
    - تحديد التاريخ والوقت
    - مشاركة رابط الدعوة

15. /invite-trips/[id] - إدارة الرحلة
    - قائمة الضيوف
    - خريطة بمواقعهم
    - تأكيد الرحلة

16. /invite/[link] - صفحة الدعوة
    - تفاصيل الرحلة
    - إدخال البيانات
    - تحديد موقع الالتقاط
    - قبول/رفض

17. /rentals - تأجير السيارات
    - فلتر بالنوع، الموقع، التاريخ
    - عرض السيارات المتاحة
    - تفاصيل كاملة لكل سيارة

18. /rentals/[id] - حجز سيارة
    - اختيار المدة
    - اختيار التأمين
    - تأكيد الحجز

19. /hire-driver - استئجار سائق
    - اختيار فئة السائق
    - تحديد المدة
    - عرض السائقين المتاحين
    - حجز

20. /delivery - خدمة التوصيل
    - أنواع التوصيل
    - طلب توصيل

21. /loved-ones - أحبابك (للمغتربين)
    - إضافة أقارب
    - حجز رحلات لهم
    - متابعة

المكونات المهمة:
- MapView component (Mapbox)
- LocationPicker component
- DateTimePicker
- DriverCard
- VehicleCard
- TripCard
- PaymentSelector
- RatingComponent
- NotificationBell
- LiveTracking
- RouteOptimizer

أضف:
- Loading states
- Error boundaries
- Skeleton screens
- Empty states
- Toast notifications
- Modal dialogs
- Form validations
- Optimistic updates مع TanStack Query
```

---

## 📌 البرومبت 8: Admin Dashboard

```
ابني Admin Dashboard في apps/admin/

نفس Stack تقنيات web app + إضافات:
- @tanstack/react-table للجداول المتقدمة
- recharts للرسوم
- date-fns للتواريخ
- jsPDF لتصدير PDF
- xlsx لتصدير Excel

التصميم:
- Sidebar navigation collapsible
- Top bar مع notifications و user menu
- Dark mode افتراضي
- لوحة كاملة بـ widgets
- Tables متقدمة بـ pagination, filters, search, sort, export

الصفحات:

1. /admin/login - دخول مع 2FA

2. /admin - الرئيسية
   - KPIs cards (Total trips, revenue, users, drivers)
   - Live trips map
   - Charts (revenue, trips per day)
   - Recent activity feed
   - Heat map للطلب
   - Top performing drivers
   - Recent disputes

3. /admin/users - إدارة المستخدمين
   - جدول كامل
   - Filters متقدمة
   - View/Edit/Suspend/Block actions
   - Bulk actions
   - Export to Excel/PDF

4. /admin/drivers - إدارة السائقين
5. /admin/drivers/pending - قيد الاعتماد
   - Multi-step approval workflow
   - Document viewer
   - Approve/Reject مع reasons

6. /admin/vehicles - المركبات
7. /admin/vehicles/categories - الفئات
   - Drag-and-drop reorder
   - Configurable requirements
   - Pricing settings

8. /admin/trips - الرحلات
9. /admin/trips/live - الحية
   - Real-time map
   - Filter by status
   - Intervention tools

10. /admin/routes - المسارات الثابتة
    - Map editor لرسم المسارات
    - Schedule manager
    - Subscriber count

11. /admin/subscriptions - الاشتراكات
12. /admin/rentals - حجوزات التأجير
13. /admin/driver-bookings - حجوزات السائقين

14. /admin/payments - المدفوعات
    - Reconciliation
    - Refunds
    - Disputes

15. /admin/disputes - الشكاوى والنزاعات
    - Ticket system
    - Assign to team
    - Resolution tracking

16. /admin/fleet - إدارة الأسطول
    - Vehicle list
    - Live tracking
    - Utilization stats
    - ROI per vehicle

17. /admin/fleet/maintenance - الصيانة
18. /admin/fleet/fuel - الوقود
19. /admin/fleet/expenses - المصاريف

20. /admin/employees - الموظفون (السائقون الموظفون)
    - HR features
    - Attendance
    - Payroll
    - Performance reviews

21. /admin/reports - التقارير
22. /admin/analytics - التحليلات
    - Revenue analytics
    - Trip analytics
    - User behavior
    - Driver performance
    - Custom date ranges
    - Comparison features

23. /admin/settings - الإعدادات
24. /admin/settings/pricing - الأسعار
    - Per category
    - Surge pricing
    - Discounts
    - Commissions

25. /admin/settings/feature-flags - الميزات
    - Toggle each of 14 services
    - Rollout percentage
    - Conditions

26. /admin/settings/categories - فئات السيارات
27. /admin/settings/notifications - قوالب الإشعارات
    - Email templates editor (rich text)
    - SMS templates
    - Push notification templates

28. /admin/marketing - التسويق
29. /admin/marketing/promotions - العروض
30. /admin/marketing/coupons - الكوبونات
31. /admin/marketing/campaigns - الحملات

32. /admin/blog - إدارة المدونة
    - Rich text editor
    - SEO settings
    - Categories & tags

33. /admin/audit-logs - سجل العمليات
    - كل العمليات الإدارية
    - Filter by user, action, date

أضف:
- Permission system متقدم
- Activity logging لكل عملية
- Real-time notifications للمسؤولين
- Keyboard shortcuts
- Quick search (Cmd+K)
- Customizable dashboards
```

---

## 📌 البرومبت 9: Driver Portal

```
ابني Driver Portal في apps/driver-portal/

التصميم:
- Mobile-first (السائقون يستخدمون الهاتف غالباً)
- بسيط وسريع
- Offline-first capabilities
- Large buttons للسائق أثناء القيادة
- Voice commands support

الصفحات:

1. /driver/login - دخول
2. /driver/register - تسجيل
   - رفع مستندات
   - معلومات السيارة
   - إضافة حساب بنكي

3. /driver/onboarding - الإعداد متعدد الخطوات
   - Step 1: Personal info
   - Step 2: Documents upload
   - Step 3: Vehicle info
   - Step 4: Bank details
   - Step 5: Training videos
   - Step 6: Certification quiz

4. /driver - اللوحة الرئيسية
   - Online/Offline toggle (كبير وواضح)
   - Today's earnings
   - Today's trips count
   - Map with nearby requests
   - Quick stats (week, month)
   - Active trip card (if any)

5. /driver/trips - الرحلات
6. /driver/trips/active - الرحلة الحالية
   - Map with route
   - Customer info
   - Navigation
   - Trip controls (Start, Arrived, Complete, Cancel)
   - Emergency button

7. /driver/trips/history - السجل

8. /driver/earnings - الأرباح
   - Today/Week/Month/Year
   - Detailed breakdown
   - Charts
   - Bonuses earned

9. /driver/earnings/withdraw - سحب الأرباح
   - Available balance
   - Bank account
   - Instant/Daily/Weekly options
   - Transaction history

10. /driver/schedule - الجدول
    - Set availability
    - Preferred areas
    - Day off
    - Vacation requests

11. /driver/vehicles - مركباتي
    - Multiple vehicles support
    - Switch between vehicles
    - Maintenance reminders

12. /driver/profile - الملف الشخصي
    - Photo
    - Personal info
    - Documents (with expiry warnings)
    - Languages
    - Specializations

13. /driver/ratings - التقييمات
    - Overall rating
    - Recent reviews
    - Detailed breakdown
    - Tips to improve

14. /driver/training - الدورات التدريبية
    - Available courses
    - Completed courses
    - Certificates
    - Quizzes

15. /driver/support - الدعم
    - FAQs
    - Live chat
    - Submit ticket
    - Emergency contacts

16. /driver/community - المجتمع
    - Forum
    - Tips from peers
    - Announcements

ميزات خاصة:
- Sound notifications للطلبات الجديدة
- Vibration patterns مختلفة
- Quick accept/reject buttons
- Voice navigation integration
- Offline mode (cache trip data)
- Background location tracking
- Battery optimization mode
- Night mode (dark theme)
- Large fonts mode

استخدم:
- PWA features كاملة
- Service workers للـ offline
- IndexedDB للتخزين المحلي
- WebSockets للـ real-time
- Web Push notifications
- Geolocation API
- Wake Lock API (للحفاظ على الشاشة)
```

---

## 📌 البرومبت 10: التحسينات والتكاملات

```
أضف اللمسات النهائية للمشروع:

1. Mapbox Integration الكامل:
   - Real-time GPS tracking
   - Route drawing
   - Turn-by-turn navigation
   - Geofencing
   - Heat maps
   - Cluster markers
   - Custom map styles (للهوية البصرية)

2. Real-time Features:
   - Trip status updates
   - Driver location updates
   - Live notifications
   - Chat between rider and driver
   - Order updates (delivery)
   - Group trip coordination

3. Payment Integration (Mock للجميع):
   - Stripe (للبطاقات)
   - Bankak (للسودان)
   - SAH (للسودان)
   - Mada Pay (للسعودية)
   - STC Pay (للسعودية)
   - Apple Pay
   - Google Pay
   - Cash handling

4. Notification System:
   - Email (SendGrid mock)
   - SMS (Twilio mock)
   - Push notifications (web push)
   - In-app notifications
   - WhatsApp (mock)

5. Search & Filters:
   - Elasticsearch integration (or Postgres full-text)
   - Smart search
   - Auto-complete
   - Recent searches
   - Saved searches

6. Internationalization:
   - Arabic (default)
   - English
   - Add infrastructure for: Urdu, Tagalog, Tigrinya
   - Number formatting
   - Date formatting
   - Currency formatting (SDG, SAR, USD)
   - RTL/LTR switching

7. Performance:
   - Image optimization (Next.js Image)
   - Code splitting
   - Lazy loading
   - React Query caching
   - Service worker
   - CDN configuration
   - Database query optimization

8. SEO:
   - Meta tags
   - Open Graph
   - Twitter Cards
   - Sitemap
   - Robots.txt
   - Structured data (JSON-LD)
   - Multi-language SEO

9. PWA Features:
   - Installable
   - Offline support
   - Background sync
   - Push notifications
   - App shortcuts
   - Share target

10. Security:
    - Rate limiting
    - DDoS protection
    - Input sanitization
    - XSS protection
    - CSRF tokens
    - SQL injection prevention
    - 2FA for admins
    - Encryption at rest
    - HTTPS enforcement
    - Security headers (Helmet)

11. Monitoring & Logging:
    - Application logs (Pino)
    - Error tracking (Sentry mock)
    - Performance monitoring
    - User analytics (PostHog mock)
    - Audit trails
    - Health checks endpoints

12. Testing:
    - Unit tests (Vitest)
    - Integration tests
    - E2E tests (Playwright)
    - API tests
    - Component tests
    - Coverage > 70%

13. Documentation:
    - API documentation (Swagger)
    - Component storybook
    - README files
    - Architecture diagrams
    - Database ERD
    - Deployment guide
    - User manual

14. CI/CD:
    - GitHub Actions
    - Automated testing
    - Linting
    - Type checking
    - Build verification
    - Deployment workflows

15. Replit Deployment:
    - Configure for Replit Deployments
    - Environment variables
    - Build commands
    - Start commands
    - Custom domain support
```

---

## 📌 البرومبت 11: الإصلاحات والتحسينات النهائية

```
الآن أعمل مراجعة شاملة وإصلاح أي مشاكل:

1. Type Safety:
   - أصلح كل TypeScript errors
   - أضف type guards حيث ينقص
   - استخدم strict mode في كل المشروع
   - تجنب any إلا للضرورة القصوى

2. Code Quality:
   - شغل ESLint وأصلح كل التحذيرات
   - شغل Prettier على كل الملفات
   - احذف unused imports
   - احذف console.logs
   - أضف JSDoc للـ functions المهمة

3. Database:
   - تأكد من كل الـ indexes
   - تأكد من cascade deletes
   - أضف unique constraints حيث يحتاج
   - تأكد من validation rules
   - شغل prisma validate
   - شغل prisma format

4. API:
   - تأكد كل endpoint له:
     - DTO مع Zod validation
     - Swagger documentation
     - Error handling
     - Logging
     - Auth guard مناسب
   - تأكد من response format موحد
   - تأكد من error format موحد

5. Frontend:
   - تأكد كل page لها loading state
   - تأكد كل page لها error state
   - تأكد كل page لها empty state
   - تأكد كل forms لها validation
   - تأكد كل buttons لها loading state
   - تأكد كل API calls لها error handling
   - تأكد من accessibility (a11y)

6. Performance:
   - شغل Lighthouse على كل الصفحات
   - حسن الصور
   - حسن fonts loading
   - حسن JavaScript bundle size
   - استخدم dynamic imports حيث مناسب
   - حسن database queries

7. Security:
   - شغل npm audit
   - حدث الـ dependencies
   - تأكد من .env في .gitignore
   - تأكد من تشفير كل البيانات الحساسة
   - تأكد من CORS configuration

8. Testing:
   - أضف tests للـ critical paths
   - تأكد كل test يعمل
   - تأكد coverage معقول

9. Documentation:
   - حدث README
   - حدث API docs
   - أضف setup instructions
   - أضف deployment guide
   - أضف troubleshooting guide

10. Final Checks:
    - تأكد المشروع يعمل بـ npm run dev
    - تأكد المشروع يبني بـ npm run build
    - تأكد كل الـ tests تنجح
    - تأكد لا أخطاء في console
    - تأكد كل الميزات تعمل
    - تأكد responsive على كل الأجهزة
    - تأكد RTL يعمل بشكل صحيح
    - تأكد الترجمة كاملة
    - تأكد dark mode يعمل
```

---

## 📊 معايير القبول النهائية

تأكد بعد كل برومبت أن:

✅ الكود يعمل بدون أخطاء
✅ كل الـ TypeScript types صحيحة
✅ الواجهة RTL تعمل بشكل صحيح
✅ الترجمة كاملة (عربي/إنجليزي)
✅ التصميم responsive على كل الأجهزة
✅ الأداء جيد (Lighthouse > 80)
✅ لا توجد أخطاء في console
✅ كل الـ APIs موثقة في Swagger
✅ قاعدة البيانات بدون errors

---

## 🆘 إذا حدثت مشاكل

استخدم هذه البرومبتات للإصلاح:

**خطأ في TypeScript:**
```
Fix all TypeScript errors in the project. Make sure all types are correct.
```

**خطأ في Prisma:**
```
Run prisma generate, then prisma db push, then check the schema for any errors.
```

**مشاكل في dependencies:**
```
Delete node_modules and pnpm-lock.yaml, then reinstall everything with pnpm install.
```

**مشاكل في البناء:**
```
Run pnpm build and fix any build errors. Make sure all apps build successfully.
```

---

**نصيحة أخيرة من Claude:**

- لا تستعجل، خذ وقتك بين كل برومبت
- اختبر كل جزء قبل الانتقال للتالي
- احفظ commit بعد كل ميزة تعمل
- إذا حصل خطأ كبير، ارجع لآخر commit شغال

**بالتوفيق يا مُعاذ! 🚀**
