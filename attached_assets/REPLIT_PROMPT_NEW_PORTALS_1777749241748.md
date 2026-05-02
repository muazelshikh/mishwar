# 🚀 برومبت Replit Agent - إضافة البوابتين الناقصتين

> **انسخ هذا البرومبت كاملاً والصقه في Replit Agent**

---

## البرومبت الكامل:

```
أحتاج إضافة بوابتين جديدتين لمشروع Mishwar Platform:

1. Car Owners Portal (بوابة أصحاب السيارات)
2. Business Portal (بوابة الشركات)

═══════════════════════════════════════════════
البوابة الأولى: Car Owners Portal
═══════════════════════════════════════════════

المسار: apps/owner-portal/
المنفذ: 3004
الـ subdomain: owner.mishwar.com

الجمهور المستهدف:
- ملاك سيارات أفراد (لا يقودون)
- شركات نقل صغيرة (2-20 سيارة)
- شركات أساطيل كبرى (20+ سيارة)
- ملاك يبون يضمون سياراتهم للمنصة

التقنيات (نفس باقي المشروع):
- Next.js 15 (App Router)
- TypeScript strict
- Tailwind CSS مع RTL
- Shadcn/UI
- Zustand
- TanStack Query
- React Hook Form + Zod
- next-intl (ar/en)
- Mapbox GL JS

الصفحات المطلوبة:

الصفحات العامة:
- /owner - صفحة ترحيب احترافية تشرح الفائدة
- /owner/register - تسجيل مالك جديد (multi-step)
- /owner/login - تسجيل دخول
- /owner/forgot-password

عملية التسجيل (Multi-step Form):
- /owner/onboarding/step-1: نوع المالك (فرد/شركة) ومعلومات أساسية
- /owner/onboarding/step-2: معلومات الشركة (للشركات)
- /owner/onboarding/step-3: إضافة أول سيارة
- /owner/onboarding/step-4: اختيار نموذج التشغيل (4 خيارات):
  * تأجير يومي للسائقين
  * شراكة بالنسبة (60% سائق، 30% مالك، 10% منصة)
  * تخصيص للتأجير بدون سائق
  * مختلط (الكل)
- /owner/onboarding/step-5: معلومات البنك
- /owner/onboarding/step-6: العقد الإلكتروني والتوقيع

الصفحات بعد التسجيل:
- /owner/dashboard - لوحة شاملة:
  * إجمالي الإيرادات (اليوم/الشهر/السنة)
  * عدد السيارات النشطة
  * أداء كل سيارة (chart)
  * تنبيهات (صيانة، تأمين، إلخ)
  * نشاط حديث

- /owner/vehicles - إدارة السيارات:
  * قائمة كل السيارات بـ table متقدم
  * فلترة وبحث
  * إضافة سيارة (form كامل)
  * تعديل/حذف
  * تغيير نموذج التشغيل
  * إيقاف مؤقت

- /owner/vehicles/[id] - تفاصيل سيارة:
  * معلومات السيارة كاملة
  * الصور
  * السائق الحالي
  * تاريخ الإيرادات (chart)
  * جدول الصيانة
  * التقييمات
  * إحصائيات أداء

- /owner/drivers - السائقون على سياراتي:
  * قائمة السائقين
  * أداء كل سائق
  * تقييمات
  * استبدال سائق
  * تقارير

- /owner/earnings - الإيرادات:
  * dashboard مالي شامل
  * charts (يوم/أسبوع/شهر/سنة)
  * إيراد كل سيارة
  * مقارنات
  * تنبؤات (ML-based)

- /owner/payments - المدفوعات:
  * المستلمة
  * المتوقعة
  * طلب سحب
  * تاريخ السحوبات

- /owner/maintenance - الصيانة:
  * جدول لكل سيارة
  * سجل الصيانة السابقة
  * تنبيهات قادمة
  * تقدير التكاليف

- /owner/insurance - التأمينات:
  * وثائق
  * تواريخ الانتهاء
  * تجديد

- /owner/reports - التقارير:
  * شهرية
  * سنوية
  * ضريبية
  * تصدير PDF/Excel

- /owner/analytics - التحليلات:
  * أداء الأسطول
  * أوقات الذروة
  * مقارنات السوق
  * توصيات لزيادة الدخل

- /owner/contracts - العقود:
  * عقدي مع المنصة
  * عقود السائقين
  * تعديلات

- /owner/profile - الملف:
  * معلوماتي/الشركة
  * المستندات
  * البنك

- /owner/support - الدعم:
  * استفسارات
  * شكاوى
  * محادثة مباشرة

═══════════════════════════════════════════════
البوابة الثانية: Business Portal
═══════════════════════════════════════════════

المسار: apps/business-portal/
المنفذ: 3005
الـ subdomain: business.mishwar.com

الجمهور المستهدف:
- شركات (لتنقلات الموظفين)
- جامعات (للطلاب)
- مصانع (للعمالة)
- مستشفيات (للموظفين والمرضى)
- فنادق (للنزلاء)
- وكالات سفر (للسياح)
- منظمات إغاثة (في السودان)

الصفحات المطلوبة:

الصفحات العامة:
- /business - صفحة مبيعات احترافية:
  * "حلول النقل المؤسسي"
  * مميزات للشركات
  * الخدمات المتاحة
  * نماذج التسعير
  * عملاء حاليون (logos)
  * شهادات
  * نموذج طلب عرض سعر

- /business/register - طلب عرض / تسجيل
- /business/login - دخول
- /business/forgot-password

الصفحات بعد التسجيل:
- /business/dashboard - لوحة:
  * إحصائيات الاستخدام
  * إنفاق الشهر
  * موظفين نشطين
  * رحلات يومية

- /business/employees - إدارة الموظفين:
  * قائمة بـ table
  * إضافة موظفين (Bulk Upload CSV)
  * تخصيص ميزانيات
  * صلاحيات
  * فروع/أقسام

- /business/routes - المسارات المخصصة:
  * مسارات الشركة
  * جدولة
  * تخصيص باصات
  * map editor

- /business/trips - الرحلات:
  * كل رحلات الموظفين
  * فلترة متقدمة
  * تتبع لحظي

- /business/billing - الفوترة:
  * فاتورة شهرية موحدة
  * تفاصيل
  * دفع

- /business/reports - التقارير:
  * استخدام الموظفين
  * تكاليف
  * تحليلات
  * ESG reports

- /business/contracts - العقود:
  * عقدي
  * تجديد
  * تعديل

- /business/support - الدعم المخصص (priority)

- /business/settings - الإعدادات:
  * إعدادات الشركة
  * الأقسام
  * المدراء
  * صلاحيات

═══════════════════════════════════════════════
متطلبات قاعدة البيانات (Prisma Schema)
═══════════════════════════════════════════════

أضف هذه الجداول لـ packages/database/prisma/schema.prisma:

model CarOwner {
  id              String    @id @default(uuid())
  userId          String    @unique
  user            User      @relation(fields: [userId], references: [id])
  
  ownerType       OwnerType // INDIVIDUAL or COMPANY
  
  // For Individual
  nationalId      String?
  
  // For Company
  companyName     String?
  commercialReg   String?
  taxNumber       String?
  
  bankAccount     Json?     // bank details
  
  totalVehicles   Int       @default(0)
  totalEarnings   Decimal   @default(0) @db.Decimal(12, 2)
  
  status          OwnerStatus @default(PENDING)
  
  vehicles        OwnerVehicle[]
  contracts       OwnerContract[]
  earnings        OwnerEarning[]
  
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
}

enum OwnerType {
  INDIVIDUAL
  COMPANY
  ORGANIZATION
}

enum OwnerStatus {
  PENDING
  APPROVED
  SUSPENDED
  ACTIVE
}

model OwnerVehicle {
  id              String    @id @default(uuid())
  ownerId         String
  owner           CarOwner  @relation(fields: [ownerId], references: [id])
  
  vehicleId       String    @unique
  vehicle         Vehicle   @relation(fields: [vehicleId], references: [id])
  
  operationModel  OwnerOperationModel
  
  // For Daily Rental
  dailyRentalAmount Decimal? @db.Decimal(8, 2)
  
  // For Revenue Share
  ownerSharePercent Decimal? @db.Decimal(5, 2)  // 0-100
  driverSharePercent Decimal? @db.Decimal(5, 2)
  platformSharePercent Decimal? @db.Decimal(5, 2)
  
  isActive        Boolean   @default(true)
  
  earnings        OwnerEarning[]
  
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
}

enum OwnerOperationModel {
  DAILY_RENTAL
  REVENUE_SHARE
  RENTAL_ONLY
  HYBRID
}

model OwnerEarning {
  id              String    @id @default(uuid())
  ownerId         String
  owner           CarOwner  @relation(fields: [ownerId], references: [id])
  
  vehicleId       String
  vehicle         OwnerVehicle @relation(fields: [vehicleId], references: [id])
  
  tripId          String?   // related trip
  rentalId        String?   // related rental
  
  earningType     EarningType
  amount          Decimal   @db.Decimal(10, 2)
  
  earningDate     DateTime
  paymentStatus   PaymentStatus @default(PENDING)
  paidAt          DateTime?
  
  createdAt       DateTime  @default(now())
}

enum EarningType {
  DAILY_RENTAL_FEE
  TRIP_SHARE
  RENTAL_SHARE
  BONUS
}

model OwnerContract {
  id              String    @id @default(uuid())
  ownerId         String
  owner           CarOwner  @relation(fields: [ownerId], references: [id])
  
  contractType    String
  contractDoc     String    // PDF URL
  signedAt        DateTime
  validFrom       DateTime
  validUntil      DateTime?
  
  terms           Json
  status          String    @default("active")
  
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
}

// Business / Organization Models

model Organization {
  id              String    @id @default(uuid())
  userId          String    @unique
  user            User      @relation(fields: [userId], references: [id])
  
  organizationType OrgType
  
  name            String
  commercialReg   String
  taxNumber       String?
  industry        String
  size            String    // small, medium, large
  
  contactPerson   String
  contactPhone    String
  contactEmail    String
  
  address         String
  city            String
  country         Country
  
  bankAccount     Json?
  
  totalEmployees  Int       @default(0)
  monthlySpending Decimal   @default(0) @db.Decimal(12, 2)
  
  status          OrgStatus @default(PENDING)
  
  employees       Employee[]
  routes          OrgRoute[]
  contracts       OrgContract[]
  invoices        OrgInvoice[]
  
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
}

enum OrgType {
  COMPANY
  UNIVERSITY
  FACTORY
  HOSPITAL
  HOTEL
  TRAVEL_AGENCY
  RELIEF_ORG
  OTHER
}

enum OrgStatus {
  PENDING
  APPROVED
  ACTIVE
  SUSPENDED
}

model Employee {
  id              String    @id @default(uuid())
  organizationId  String
  organization    Organization @relation(fields: [organizationId], references: [id])
  
  userId          String?
  
  employeeId      String    // company's employee ID
  fullName        String
  phone           String
  email           String?
  department      String?
  
  monthlyBudget   Decimal?  @db.Decimal(8, 2)
  tripsLimit      Int?
  
  isActive        Boolean   @default(true)
  
  createdAt       DateTime  @default(now())
}

model OrgRoute {
  id              String    @id @default(uuid())
  organizationId  String
  organization    Organization @relation(fields: [organizationId], references: [id])
  
  name            String
  startPoint      Json
  endPoint        Json
  schedule        Json
  
  vehicleType     String
  capacity        Int
  
  isActive        Boolean   @default(true)
  
  createdAt       DateTime  @default(now())
}

model OrgContract {
  id              String    @id @default(uuid())
  organizationId  String
  organization    Organization @relation(fields: [organizationId], references: [id])
  
  contractNumber  String    @unique
  contractType    String
  contractDoc     String
  
  startDate       DateTime
  endDate         DateTime
  
  monthlyValue    Decimal   @db.Decimal(12, 2)
  totalValue      Decimal   @db.Decimal(12, 2)
  
  paymentTerms    String
  
  status          String    @default("active")
  
  createdAt       DateTime  @default(now())
}

model OrgInvoice {
  id              String    @id @default(uuid())
  organizationId  String
  organization    Organization @relation(fields: [organizationId], references: [id])
  
  invoiceNumber   String    @unique
  invoiceDate     DateTime
  dueDate         DateTime
  
  periodStart     DateTime
  periodEnd       DateTime
  
  totalTrips      Int
  totalAmount     Decimal   @db.Decimal(12, 2)
  taxAmount       Decimal   @db.Decimal(10, 2)
  finalAmount     Decimal   @db.Decimal(12, 2)
  
  status          String    @default("pending")
  paidAt          DateTime?
  
  invoicePdf      String?
  
  createdAt       DateTime  @default(now())
}

═══════════════════════════════════════════════
متطلبات Backend (apps/api)
═══════════════════════════════════════════════

أضف هذه الـ Modules لـ NestJS API:

1. CarOwners Module:
- POST /car-owners/register
- GET /car-owners/me
- PATCH /car-owners/me
- POST /car-owners/me/vehicles
- GET /car-owners/me/vehicles
- PATCH /car-owners/me/vehicles/:id
- DELETE /car-owners/me/vehicles/:id
- GET /car-owners/me/earnings
- POST /car-owners/me/withdraw
- GET /car-owners/me/reports

2. Organizations Module (Business):
- POST /organizations/register
- GET /organizations/me
- PATCH /organizations/me
- POST /organizations/me/employees (bulk)
- GET /organizations/me/employees
- POST /organizations/me/routes
- GET /organizations/me/trips
- GET /organizations/me/invoices
- POST /organizations/me/contracts/renew

═══════════════════════════════════════════════
متطلبات الواجهة الأمامية
═══════════════════════════════════════════════

كلتا البوابتين تحتاج:
- Layout مشترك مع sidebar وheader
- Dark mode support
- RTL/LTR support
- Responsive design
- Loading states
- Error states
- Empty states
- Form validations
- Toast notifications

═══════════════════════════════════════════════
التحديثات على الصفحة الرئيسية (Landing)
═══════════════════════════════════════════════

في apps/web/app/page.tsx:

أضف 4 أزرار CTA رئيسية في Hero Section:
1. "احجز رحلة" → /app/register
2. "انضم كسائق" → /driver/register
3. "سجل سيارتك" → /owner/register (جديد)
4. "حلول الشركات" → /business (جديد)

أضف قسم "لأصحاب السيارات" مع شرح وزر "سجل سيارتك"
أضف قسم "للشركات" مع شرح وزر "اطلب عرض"

═══════════════════════════════════════════════
ملاحظات نهائية
═══════════════════════════════════════════════

1. اتبع نفس code style لباقي المشروع
2. استخدم نفس design system
3. تأكد من الترجمة العربية والإنجليزية
4. أضف الـ environment variables المطلوبة
5. حدث turbo.json ليشمل apps الجديدة
6. حدث pnpm-workspace.yaml
7. اختبر التشغيل المتوازي للجميع

ابدأ بـ:
1. تحديث Prisma schema وتشغيل migration
2. إضافة الـ Modules في NestJS
3. إنشاء apps/owner-portal و apps/business-portal
4. تحديث Landing page
5. اختبار شامل
```

---

## 📝 ملاحظات للاستخدام:

### قبل ما تستخدم هذا البرومبت:

**1. تأكد إن المشروع الحالي يشتغل أولاً!**

قبل ما تطلب من Agent يضيف بوابتين جدد، **تأكد إن البوابات الحالية تشتغل**:
- Backend شغال على port 3000
- Web App شغال على port 3001
- Admin شغال على port 3002
- Driver Portal شغال على port 3003

**2. احفظ نسخة احتياطية على GitHub قبل البدء!**

```bash
git add .
git commit -m "Backup before adding owner and business portals"
git push
```

**3. أعطِ الأمر للـ Agent بهدوء**

انسخ البرومبت كاملاً وألصقه في Replit Agent. سيستغرق **20-40 دقيقة** للتنفيذ.

---

## ⚠️ تحذير مهم

إذا الـ Agent **اقترح حذف أو تعديل أي ملف موجود**، قل له:

```
DON'T delete or modify existing files.
ONLY ADD new files for the new portals.
Keep all existing apps (web, admin, driver-portal) untouched.
```

---

## 🎯 النتيجة المتوقعة

بعد تنفيذ هذا البرومبت، ستحصل على:

1. ✅ بوابة Owner Portal كاملة في `apps/owner-portal/`
2. ✅ بوابة Business Portal كاملة في `apps/business-portal/`
3. ✅ Backend modules جديدة للبوابات
4. ✅ Database schema محدث بالجداول الجديدة
5. ✅ Landing page محدثة بأزرار جديدة
6. ✅ النظام يدعم 6 بوابات منفصلة

---

## 🚦 الخطوات بعد التنفيذ

بعد ما يخلص Agent:

```bash
# 1. تثبيت أي dependencies جديدة
pnpm install

# 2. تحديث قاعدة البيانات
cd packages/database
npx prisma generate
npx prisma db push

# 3. تشغيل الكل
cd ../..
pnpm dev
```

ستشتغل كل البوابات على ports مختلفة:
- API: 3000
- Web: 3001
- Admin: 3002
- Driver: 3003
- **Owner: 3004** (جديد)
- **Business: 3005** (جديد)
