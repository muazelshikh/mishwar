# 🚗 مشوار - منصة النقل الشاملة | Replit Agent Build Prompt

> **استخدم هذا الملف مع Replit Agent لبناء المشروع كاملاً.**
> **التقسيم المقترح: 4 جلسات منفصلة (راجع نهاية الملف).**

---

## 📋 نظرة عامة على المشروع

أريد بناء **منصة نقل شاملة** بإسم "مشوار" تخدم السوقين السوداني والسعودي. التطبيق هو منصة Web شاملة (سيتحول لتطبيق موبايل لاحقاً) تشمل **14 خدمة متكاملة** تحت سقف واحد:

1. الرحلات الفردية (مثل أوبر/كريم)
2. التراحيل الجماعية بمسارات ثابتة (اشتراكات)
3. الرحلات الجماعية بالدعوة (سيارات كبيرة)
4. النقل بين الولايات/المدن
5. خدمة المغتربين "أحبابك"
6. خدمات التوصيل (طعام، طرود، بقالة)
7. النقل المدرسي
8. النقل الطبي
9. العقود المؤسسية B2B
10. خدمات الحج والعمرة
11. تأجير السيارات بدون سائق
12. استئجار سائق بدون سيارة
13. الرحلات السياحية
14. خدمة المناسبات

---

## 🎯 المتطلبات التقنية

### Stack التقنية المطلوبة:

**Backend:**
- Node.js + NestJS (TypeScript)
- PostgreSQL + Prisma ORM
- Redis للتخزين المؤقت
- Socket.io للتتبع المباشر
- JWT للمصادقة + Refresh Tokens
- BullMQ لمهام الخلفية

**Frontend:**
- Next.js 15 (App Router)
- TypeScript (strict mode)
- Tailwind CSS مع دعم RTL
- Shadcn/UI للمكونات
- Zustand لإدارة الحالة
- React Hook Form + Zod للنماذج
- TanStack Query لطلبات API
- Mapbox GL JS للخرائط
- Recharts للرسوم البيانية

**أدوات إضافية:**
- ESLint + Prettier
- Husky للـ git hooks
- Vitest للاختبارات

### مواصفات أساسية:
- **اللغة الأساسية:** العربية (RTL)
- **اللغة الثانوية:** الإنجليزية
- **الخط:** Tajawal أو IBM Plex Sans Arabic
- **الألوان:** أزرق داكن (#0F2C59) + ذهبي (#D4AF37) + أبيض
- **الواجهة:** حديثة، نظيفة، احترافية
- **التصميم:** Mobile-first responsive

---

## 🏗️ هيكل المشروع المطلوب

```
mishwar-platform/
├── apps/
│   ├── web/                    # موقع المستخدمين
│   ├── driver-portal/          # بوابة السائقين
│   ├── admin/                  # لوحة الإدارة
│   └── api/                    # Backend API
├── packages/
│   ├── database/               # Prisma schema
│   ├── ui/                     # مكونات مشتركة
│   ├── types/                  # TypeScript types
│   ├── utils/                  # دوال مساعدة
│   └── config/                 # إعدادات
├── docs/
└── README.md
```

استخدم **Turborepo** لإدارة الـ Monorepo.

---

# 📦 الجلسة 1: الإعداد والـ Backend الأساسي

## المهمة 1: إعداد المشروع

أنشئ مشروع Monorepo بإسم `mishwar-platform` باستخدام:

```bash
npx create-turbo@latest mishwar-platform
```

ثم أضف:
- Workspace setup مع pnpm
- ESLint + Prettier configurations
- TypeScript configuration مشترك
- ملف `.env.example` شامل
- ملف `README.md` احترافي بالعربية والإنجليزية

## المهمة 2: قاعدة البيانات (Prisma Schema)

أنشئ `packages/database/prisma/schema.prisma` بالجداول التالية:

### الجداول الأساسية (Core):

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// =====================================
// USERS & AUTHENTICATION
// =====================================

model User {
  id              String    @id @default(uuid())
  phone           String    @unique
  email           String?   @unique
  passwordHash    String?
  fullName        String
  profilePhoto    String?
  dateOfBirth     DateTime?
  gender          Gender?
  language        Language  @default(AR)
  country         Country
  city            String?
  address         String?
  
  userType        UserType  @default(RIDER)
  status          UserStatus @default(ACTIVE)
  isVerified      Boolean   @default(false)
  
  rating          Float     @default(5.0)
  totalRatings    Int       @default(0)
  walletBalance   Decimal   @default(0) @db.Decimal(10, 2)
  
  emergencyContacts Json?   // Array of contacts
  preferences     Json?     // User preferences
  
  // Relations
  driver          Driver?
  trips           Trip[]    @relation("RiderTrips")
  ratings         Rating[]  @relation("RatingFromUser")
  receivedRatings Rating[]  @relation("RatingToUser")
  payments        Payment[]
  notifications   Notification[]
  subscriptions   Subscription[]
  invitedTrips    InviteTripGuest[]
  organizedTrips  InviteTrip[]
  rentals         Rental[]
  driverBookings  DriverBooking[] @relation("DriverBookingClient")
  
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
  
  @@index([phone])
  @@index([email])
  @@index([userType])
  @@index([country, city])
}

enum Gender {
  MALE
  FEMALE
}

enum Language {
  AR
  EN
}

enum Country {
  SUDAN
  SAUDI_ARABIA
  UAE
  KUWAIT
  BAHRAIN
  OMAN
  EGYPT
}

enum UserType {
  RIDER
  DRIVER
  ADMIN
  ORGANIZATION
}

enum UserStatus {
  ACTIVE
  SUSPENDED
  BLOCKED
  PENDING_VERIFICATION
}

// =====================================
// DRIVERS
// =====================================

model Driver {
  id                 String    @id @default(uuid())
  userId             String    @unique
  user               User      @relation(fields: [userId], references: [id])
  
  licenseNumber      String    @unique
  licenseExpiry      DateTime
  licenseDocument    String?
  
  nationalIdDocument String
  experience         Int       // سنوات الخبرة
  
  driverCategory     DriverCategory @default(ECONOMY)
  
  status             DriverStatus @default(PENDING)
  verificationLevel  Int       @default(0) // 0-6 stages
  
  totalTrips         Int       @default(0)
  totalEarnings      Decimal   @default(0) @db.Decimal(12, 2)
  
  isAvailableForRent Boolean   @default(false) // تأجير سائق
  hourlyRate         Decimal?  @db.Decimal(8, 2)
  dailyRate          Decimal?  @db.Decimal(8, 2)
  weeklyRate         Decimal?  @db.Decimal(10, 2)
  monthlyRate        Decimal?  @db.Decimal(10, 2)
  
  languages          String[]
  specializations    String[]
  
  bankInfo           Json?     // معلومات البنك للتحويل
  
  vehicles           Vehicle[]
  trips              Trip[]    @relation("DriverTrips")
  driverBookings     DriverBooking[] @relation("DriverBookingDriver")
  certifications     DriverCertification[]
  
  createdAt          DateTime  @default(now())
  updatedAt          DateTime  @updatedAt
  
  @@index([status])
  @@index([driverCategory])
}

enum DriverCategory {
  ECONOMY
  PROFESSIONAL
  EXECUTIVE
  INTERNATIONAL
  FEMALE
  SPECIALIZED
  EVENT
}

enum DriverStatus {
  PENDING
  UNDER_REVIEW
  APPROVED
  REJECTED
  SUSPENDED
  ACTIVE
  OFFLINE
}

model DriverCertification {
  id             String   @id @default(uuid())
  driverId       String
  driver         Driver   @relation(fields: [driverId], references: [id])
  
  certificationName String
  issuedDate     DateTime
  expiryDate     DateTime?
  certificateUrl String
  status         String   @default("active")
  
  createdAt      DateTime @default(now())
}

// =====================================
// VEHICLES
// =====================================

model Vehicle {
  id                String    @id @default(uuid())
  ownerType         VehicleOwnerType
  driverId          String?
  driver            Driver?   @relation(fields: [driverId], references: [id])
  
  categoryId        String
  category          VehicleCategory @relation(fields: [categoryId], references: [id])
  
  make              String
  model             String
  year              Int
  plateNumber       String    @unique
  vinNumber         String?   @unique
  color             String
  
  registrationDoc   String
  insuranceDoc      String
  insuranceExpiry   DateTime
  inspectionDoc     String?
  inspectionExpiry  DateTime?
  
  photos            String[]  // مصفوفة روابط الصور
  
  maxPassengers     Int
  features          Json?     // ميزات السيارة (تكييف، GPS، إلخ)
  
  // For Owned Fleet
  purchaseDate      DateTime?
  purchasePrice     Decimal?  @db.Decimal(12, 2)
  currentValue      Decimal?  @db.Decimal(12, 2)
  operationModel    OperationModel?
  
  // For Rental
  isAvailableForRent Boolean  @default(false)
  hourlyRate        Decimal?  @db.Decimal(8, 2)
  dailyRate         Decimal?  @db.Decimal(8, 2)
  weeklyRate        Decimal?  @db.Decimal(10, 2)
  monthlyRate       Decimal?  @db.Decimal(10, 2)
  depositAmount     Decimal?  @db.Decimal(10, 2)
  
  status            VehicleStatus @default(PENDING)
  currentLocation   Json?     // {lat, lng}
  totalKm           Int       @default(0)
  
  trips             Trip[]
  rentals           Rental[]
  maintenanceRecords MaintenanceRecord[]
  
  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt
  
  @@index([status])
  @@index([categoryId])
  @@index([ownerType])
}

enum VehicleOwnerType {
  PARTNER_DRIVER  // سائق شريك يملك السيارة
  COMPANY_OWNED   // مملوكة للشركة
  CONTRACTED      // متعاقد عليها
}

enum OperationModel {
  EMPLOYED        // سائق موظف
  DAILY_RENTAL    // تأجير يومي للسائق
  REVENUE_SHARE   // شراكة بالنسبة
  LEASE_TO_OWN    // إيجار تمويلي
}

enum VehicleStatus {
  PENDING
  ACTIVE
  IN_TRIP
  IN_MAINTENANCE
  RENTED
  SUSPENDED
  RETIRED
}

model VehicleCategory {
  id              String   @id @default(uuid())
  name            String   @unique
  nameEn          String
  description     String?
  icon            String?
  parentId        String?  // للفئات الفرعية
  
  basePrice       Decimal  @db.Decimal(8, 2)
  pricePerKm      Decimal  @db.Decimal(6, 2)
  pricePerMinute  Decimal  @db.Decimal(6, 2)
  
  minSeats        Int
  maxSeats        Int
  
  requirements    Json     // متطلبات الفئة
  isActive        Boolean  @default(true)
  
  vehicles        Vehicle[]
  
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}

// =====================================
// TRIPS
// =====================================

model Trip {
  id                String    @id @default(uuid())
  tripType          TripType
  
  riderId           String
  rider             User      @relation("RiderTrips", fields: [riderId], references: [id])
  
  driverId          String?
  driver            Driver?   @relation("DriverTrips", fields: [driverId], references: [id])
  
  vehicleId         String?
  vehicle           Vehicle?  @relation(fields: [vehicleId], references: [id])
  
  pickupLocation    Json      // {lat, lng, address}
  dropoffLocation   Json      // {lat, lng, address}
  waypoints         Json?     // نقاط متوسطة
  
  distance          Float?    // بالكيلومترات
  duration          Int?      // بالدقائق
  
  baseFare          Decimal?  @db.Decimal(8, 2)
  surgeMultiplier   Float     @default(1.0)
  totalFare         Decimal?  @db.Decimal(8, 2)
  
  status            TripStatus @default(REQUESTED)
  
  scheduledFor      DateTime?
  requestedAt       DateTime  @default(now())
  acceptedAt        DateTime?
  startedAt         DateTime?
  completedAt       DateTime?
  cancelledAt       DateTime?
  cancellationReason String?
  
  paymentMethod     PaymentMethod
  paymentStatus     PaymentStatus @default(PENDING)
  
  notes             String?
  routeData         Json?     // GPS tracking data
  
  payment           Payment?
  ratings           Rating[]
  
  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt
  
  @@index([status])
  @@index([tripType])
  @@index([riderId])
  @@index([driverId])
}

enum TripType {
  SOLO              // رحلة فردية
  GROUP_SUBSCRIPTION // اشتراك جماعي
  INVITE_TRIP       // رحلة بدعوة
  INTER_STATE       // بين المدن
  LOVED_ONES        // أحبابك
  DELIVERY          // توصيل
  SCHOOL            // مدرسي
  MEDICAL           // طبي
  B2B               // مؤسسي
  HAJJ_UMRAH        // حج وعمرة
  TOURISM           // سياحي
  EVENT             // مناسبة
}

enum TripStatus {
  REQUESTED
  SEARCHING_DRIVER
  DRIVER_ASSIGNED
  DRIVER_ARRIVING
  DRIVER_ARRIVED
  IN_PROGRESS
  COMPLETED
  CANCELLED_BY_RIDER
  CANCELLED_BY_DRIVER
  NO_SHOW
}

enum PaymentMethod {
  CASH
  WALLET
  CARD
  BANKAK
  SAH
  STC_PAY
  APPLE_PAY
  MADA_PAY
  OTHER
}

enum PaymentStatus {
  PENDING
  PROCESSING
  COMPLETED
  FAILED
  REFUNDED
  PARTIALLY_REFUNDED
}

// =====================================
// GROUP SUBSCRIPTIONS (التراحيل)
// =====================================

model Route {
  id              String    @id @default(uuid())
  name            String
  startPoint      Json      // {lat, lng, address}
  endPoint        Json
  waypoints       Json?     // نقاط توقف
  
  schedule        Json      // أيام الأسبوع والأوقات
  
  monthlyPrice    Decimal   @db.Decimal(8, 2)
  weeklyPrice     Decimal   @db.Decimal(8, 2)
  
  totalSeats      Int
  availableSeats  Int
  
  vehicleCategoryId String
  
  isActive        Boolean   @default(true)
  
  subscriptions   Subscription[]
  
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
}

model Subscription {
  id              String    @id @default(uuid())
  userId          String
  user            User      @relation(fields: [userId], references: [id])
  
  routeId         String
  route           Route     @relation(fields: [routeId], references: [id])
  
  planType        SubscriptionPlan
  startDate       DateTime
  endDate         DateTime
  
  totalAmount     Decimal   @db.Decimal(8, 2)
  paidAmount      Decimal   @db.Decimal(8, 2)
  
  status          SubscriptionStatus @default(ACTIVE)
  
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
}

enum SubscriptionPlan {
  MONTHLY_FIXED      // شهري ثابت
  WEEKLY_FLEXIBLE    // أسبوعي مرن
  CREDIT_BASED       // رصيد
}

enum SubscriptionStatus {
  ACTIVE
  PAUSED
  EXPIRED
  CANCELLED
}

// =====================================
// INVITE TRIPS (الرحلات بالدعوة)
// =====================================

model InviteTrip {
  id                String    @id @default(uuid())
  organizerId       String
  organizer         User      @relation(fields: [organizerId], references: [id])
  
  vehicleType       String    // نوع المركبة المطلوبة
  destination       Json      // الوجهة
  scheduledDate     DateTime
  
  expectedPassengers Int
  invitationLink    String    @unique
  
  paymentMethod     InvitePaymentMethod
  totalEstimatedFare Decimal? @db.Decimal(8, 2)
  
  status            InviteTripStatus @default(DRAFT)
  
  guests            InviteTripGuest[]
  
  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt
}

enum InvitePaymentMethod {
  ORGANIZER_PAYS    // المنظم يدفع
  EQUAL_SPLIT       // تقسيم متساوٍ
  DISTANCE_BASED    // حسب المسافة
  INDIVIDUAL_PAY    // كل راكب يدفع
}

enum InviteTripStatus {
  DRAFT
  COLLECTING_GUESTS
  CONFIRMED
  IN_PROGRESS
  COMPLETED
  CANCELLED
}

model InviteTripGuest {
  id              String    @id @default(uuid())
  tripId          String
  trip            InviteTrip @relation(fields: [tripId], references: [id])
  
  userId          String?
  user            User?     @relation(fields: [userId], references: [id])
  
  guestName       String
  guestPhone      String
  pickupLocation  Json
  numberOfPeople  Int       @default(1)
  notes           String?
  
  status          GuestStatus @default(INVITED)
  responseAt      DateTime?
  
  createdAt       DateTime  @default(now())
}

enum GuestStatus {
  INVITED
  ACCEPTED
  DECLINED
  PICKED_UP
  COMPLETED
}

// =====================================
// CAR RENTAL (تأجير السيارات)
// =====================================

model Rental {
  id              String    @id @default(uuid())
  userId          String
  user            User      @relation(fields: [userId], references: [id])
  
  vehicleId       String
  vehicle         Vehicle   @relation(fields: [vehicleId], references: [id])
  
  rentalType      RentalType
  startDateTime   DateTime
  endDateTime     DateTime
  
  pickupLocation  Json
  returnLocation  Json
  
  totalAmount     Decimal   @db.Decimal(10, 2)
  depositAmount   Decimal   @db.Decimal(10, 2)
  insuranceType   InsuranceType
  
  status          RentalStatus @default(PENDING)
  contractSignedAt DateTime?
  contractPdfUrl  String?
  
  pickupInspection Json?    // فحص الاستلام
  returnInspection Json?    // فحص الإرجاع
  
  damages         Json?
  finalCharges    Json?
  
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
}

enum RentalType {
  HOURLY
  DAILY
  WEEKLY
  MONTHLY
  LONG_TERM
}

enum InsuranceType {
  BASIC
  STANDARD
  COMPREHENSIVE
}

enum RentalStatus {
  PENDING
  CONFIRMED
  ACTIVE
  COMPLETED
  CANCELLED
  OVERDUE
}

// =====================================
// DRIVER BOOKING (استئجار سائق)
// =====================================

model DriverBooking {
  id              String    @id @default(uuid())
  clientId        String
  client          User      @relation("DriverBookingClient", fields: [clientId], references: [id])
  
  driverId        String
  driver          Driver    @relation("DriverBookingDriver", fields: [driverId], references: [id])
  
  bookingType     DriverBookingType
  startDateTime   DateTime
  endDateTime     DateTime
  
  vehicleMake     String
  vehicleModel    String
  vehiclePlate    String
  
  pickupLocation  Json
  
  totalAmount     Decimal   @db.Decimal(10, 2)
  
  status          DriverBookingStatus @default(PENDING)
  specialRequests String?
  additionalServices Json?
  
  serviceTracking Json?     // GPS tracking data
  
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
}

enum DriverBookingType {
  HOURLY
  DAILY
  WEEKLY
  MONTHLY
  EVENT
  EMERGENCY
}

enum DriverBookingStatus {
  PENDING
  CONFIRMED
  ACTIVE
  COMPLETED
  CANCELLED
}

// =====================================
// PAYMENTS
// =====================================

model Payment {
  id              String    @id @default(uuid())
  userId          String
  user            User      @relation(fields: [userId], references: [id])
  
  tripId          String?   @unique
  trip            Trip?     @relation(fields: [tripId], references: [id])
  
  amount          Decimal   @db.Decimal(10, 2)
  currency        String    @default("SDG")
  method          PaymentMethod
  status          PaymentStatus @default(PENDING)
  
  transactionId   String?
  gatewayResponse Json?
  
  refundedAmount  Decimal?  @db.Decimal(10, 2)
  refundedAt      DateTime?
  
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
}

// =====================================
// RATINGS
// =====================================

model Rating {
  id              String    @id @default(uuid())
  tripId          String
  trip            Trip      @relation(fields: [tripId], references: [id])
  
  fromUserId      String
  fromUser        User      @relation("RatingFromUser", fields: [fromUserId], references: [id])
  
  toUserId        String
  toUser          User      @relation("RatingToUser", fields: [toUserId], references: [id])
  
  score           Int       // 1-5
  comment         String?
  
  // Detailed ratings
  drivingSkills   Int?
  customerService Int?
  punctuality     Int?
  cleanliness     Int?
  
  createdAt       DateTime  @default(now())
}

// =====================================
// NOTIFICATIONS
// =====================================

model Notification {
  id              String    @id @default(uuid())
  userId          String
  user            User      @relation(fields: [userId], references: [id])
  
  type            NotificationType
  title           String
  message         String
  data            Json?
  
  isRead          Boolean   @default(false)
  readAt          DateTime?
  
  createdAt       DateTime  @default(now())
  
  @@index([userId, isRead])
}

enum NotificationType {
  TRIP_UPDATE
  PAYMENT
  PROMOTION
  SYSTEM
  RATING
  SUBSCRIPTION
}

// =====================================
// FLEET MANAGEMENT
// =====================================

model MaintenanceRecord {
  id              String    @id @default(uuid())
  vehicleId       String
  vehicle         Vehicle   @relation(fields: [vehicleId], references: [id])
  
  maintenanceType String    // routine, repair, accident
  description     String
  cost            Decimal   @db.Decimal(10, 2)
  performedAt     DateTime
  performedBy     String?
  
  partsReplaced   Json?
  mileageAtService Int
  nextDueDate     DateTime?
  
  documentsUrls   String[]
  
  createdAt       DateTime  @default(now())
}

// =====================================
// SETTINGS (قابلة للتخصيص)
// =====================================

model Setting {
  id              String    @id @default(uuid())
  key             String    @unique
  value           String
  valueType       String    // string, number, boolean, json
  category        String
  description     String?
  isPublic        Boolean   @default(false)
  
  updatedBy       String?
  updatedAt       DateTime  @updatedAt
  createdAt       DateTime  @default(now())
}

// =====================================
// FEATURE FLAGS
// =====================================

model FeatureFlag {
  id              String    @id @default(uuid())
  name            String    @unique
  description     String?
  isEnabled       Boolean   @default(false)
  
  conditions      Json?     // شروط التفعيل
  rolloutPercentage Int     @default(0)
  
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
}
```

## المهمة 3: NestJS Backend Structure

أنشئ `apps/api` بهيكل NestJS التالي:

```
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
│   ├── decorators/
│   ├── filters/
│   ├── guards/
│   ├── interceptors/
│   ├── pipes/
│   └── middleware/
├── config/
└── shared/
```

كل module يحتوي على:
- `*.module.ts`
- `*.controller.ts`
- `*.service.ts`
- `dto/` (مع Zod validation)
- `entities/`

### الـ Endpoints الأساسية المطلوبة:

**Auth Module:**
- POST `/auth/register` - تسجيل مستخدم
- POST `/auth/login` - تسجيل دخول
- POST `/auth/refresh` - تجديد التوكن
- POST `/auth/forgot-password`
- POST `/auth/reset-password`
- POST `/auth/verify-otp` - تحقق OTP

**Users Module:**
- GET `/users/me` - بياناتي
- PATCH `/users/me` - تحديث بياناتي
- POST `/users/me/avatar` - رفع صورة
- GET `/users/me/wallet` - المحفظة
- POST `/users/me/wallet/topup` - شحن المحفظة
- GET `/users/me/trips` - رحلاتي

**Drivers Module:**
- POST `/drivers/register` - تسجيل سائق
- POST `/drivers/me/documents` - رفع المستندات
- GET `/drivers/me/dashboard` - لوحة السائق
- PATCH `/drivers/me/availability` - تغيير الحالة
- GET `/drivers/me/earnings` - الأرباح
- POST `/drivers/me/withdraw` - سحب الأرباح

**Trips Module:**
- POST `/trips/request` - طلب رحلة
- GET `/trips/:id` - تفاصيل رحلة
- POST `/trips/:id/cancel` - إلغاء
- POST `/trips/:id/start` - بدء (للسائق)
- POST `/trips/:id/complete` - إنهاء
- GET `/trips/estimate-fare` - تقدير السعر

**Routes Module:**
- GET `/routes` - المسارات المتاحة
- POST `/routes` - إنشاء مسار (admin)
- POST `/routes/:id/subscribe` - اشتراك

**Invite Trips Module:**
- POST `/invite-trips` - إنشاء رحلة بدعوة
- GET `/invite-trips/:link` - عرض دعوة
- POST `/invite-trips/:link/join` - قبول دعوة
- POST `/invite-trips/:id/confirm` - تأكيد

**Rentals Module:**
- GET `/rentals/available-vehicles` - السيارات المتاحة
- POST `/rentals/book` - حجز
- GET `/rentals/:id` - تفاصيل الحجز

**Driver Bookings Module:**
- GET `/driver-bookings/available-drivers` - السائقون المتاحون
- POST `/driver-bookings/book` - حجز سائق
- GET `/driver-bookings/:id` - تفاصيل

**Admin Module:**
- GET `/admin/dashboard` - لوحة الإحصائيات
- GET `/admin/users` - إدارة المستخدمين
- GET `/admin/drivers` - إدارة السائقين
- POST `/admin/drivers/:id/approve` - اعتماد سائق
- GET `/admin/vehicles` - إدارة المركبات
- GET `/admin/trips` - مراقبة الرحلات
- PATCH `/admin/settings/:key` - تعديل الإعدادات
- PATCH `/admin/feature-flags/:name` - تفعيل/تعطيل ميزة

## المهمة 4: المصادقة والصلاحيات

نفذ:
- JWT Authentication مع Access + Refresh tokens
- OTP عبر SMS (استخدم mock للبداية)
- Role-based Access Control (RBAC)
- Guards للحماية
- Rate limiting

## المهمة 5: الإعدادات والـ Feature Flags

أنشئ خدمة `SettingsService` تخزن:
- أسعار الفئات
- العمولات
- شروط التسجيل
- نصوص الواجهة
- إعدادات النظام

و `FeatureFlagService` لتفعيل/تعطيل:
- `solo_rides`
- `group_subscriptions`
- `invite_trips`
- `inter_state_travel`
- `loved_ones_service`
- `delivery`
- `school_transport`
- `medical_transport`
- `b2b_enterprise`
- `hajj_umrah`
- `car_rental`
- `driver_on_demand`
- `tourism`
- `events`

---

# 🎨 الجلسة 2: الواجهة الأمامية (Web App)

## المهمة 1: إعداد Next.js

أنشئ `apps/web` بـ:
- Next.js 15 مع App Router
- TypeScript strict mode
- Tailwind CSS مع دعم RTL
- Shadcn/UI مع كل المكونات الأساسية
- Zustand للحالة
- TanStack Query
- React Hook Form + Zod
- next-intl للترجمة (عربي/إنجليزي)
- next-themes للوضع الفاتح/الداكن

## المهمة 2: نظام التصميم

```css
/* الألوان الرئيسية */
--primary: #0F2C59       /* أزرق داكن */
--secondary: #D4AF37     /* ذهبي */
--accent: #2C7873        /* أخضر */
--background: #FAFAFA
--foreground: #1A1A1A

/* الخطوط */
--font-arabic: 'Tajawal', sans-serif
--font-english: 'Inter', sans-serif

/* الحدود والظلال */
--radius: 0.75rem
```

## المهمة 3: الصفحات المطلوبة

### الصفحات العامة (Public):
- `/` - الصفحة الرئيسية (Landing)
- `/about` - عن مشوار
- `/services` - الخدمات
- `/services/[type]` - تفاصيل خدمة معينة
- `/become-driver` - انضم كسائق
- `/business` - حلول الشركات
- `/contact` - اتصل بنا
- `/blog` - المدونة
- `/login` - تسجيل دخول
- `/register` - تسجيل
- `/forgot-password` - استعادة كلمة السر

### صفحات المستخدم (Authenticated):
- `/dashboard` - لوحة المستخدم
- `/dashboard/profile` - الملف الشخصي
- `/dashboard/trips` - رحلاتي
- `/dashboard/wallet` - المحفظة
- `/dashboard/payments` - المدفوعات
- `/dashboard/favorites` - المفضلات
- `/dashboard/notifications` - الإشعارات

### صفحات الخدمات (Authenticated):
- `/ride/new` - طلب رحلة جديدة
- `/ride/[id]` - تتبع رحلة
- `/subscriptions` - الاشتراكات
- `/subscriptions/[id]` - تفاصيل اشتراك
- `/invite-trips/new` - إنشاء رحلة بدعوة
- `/invite-trips/[id]` - إدارة رحلة
- `/invite/[link]` - صفحة الدعوة
- `/rentals` - تأجير سيارات
- `/rentals/[id]` - حجز
- `/hire-driver` - استئجار سائق
- `/delivery` - خدمة التوصيل
- `/loved-ones` - أحبابك (للمغتربين)

## المهمة 4: المكونات الأساسية

أنشئ مكونات قابلة لإعادة الاستخدام في `packages/ui`:

- `Button` - بأنواع متعددة
- `Input` - مع validation
- `Select` - قائمة منسدلة
- `DatePicker` - منتقي التاريخ
- `MapView` - خريطة Mapbox
- `LocationPicker` - اختيار الموقع
- `DriverCard` - بطاقة السائق
- `VehicleCard` - بطاقة المركبة
- `TripCard` - بطاقة الرحلة
- `RouteCard` - بطاقة المسار
- `RatingStars` - النجوم
- `PaymentMethod` - طرق الدفع
- `NotificationBell` - الإشعارات
- `LanguageSwitcher` - تبديل اللغة
- `ThemeToggle` - تبديل الثيم

## المهمة 5: ميزات RTL والترجمة

- دعم كامل لـ RTL
- ملفات ترجمة `ar.json` و `en.json`
- تبديل اللغة بسلاسة
- تحويل الأرقام (هندية/عربية)

---

# 🎯 الجلسة 3: لوحة الإدارة وبوابة السائقين

## المهمة 1: لوحة الإدارة (Admin Dashboard)

أنشئ `apps/admin` بـ:

### الصفحات:
- `/admin/login` - دخول
- `/admin` - الإحصائيات الرئيسية
- `/admin/users` - إدارة المستخدمين
- `/admin/drivers` - إدارة السائقين
- `/admin/drivers/pending` - السائقون قيد الاعتماد
- `/admin/vehicles` - إدارة المركبات
- `/admin/vehicles/categories` - فئات المركبات
- `/admin/trips` - مراقبة الرحلات
- `/admin/trips/live` - الرحلات الحية
- `/admin/routes` - المسارات الثابتة
- `/admin/subscriptions` - الاشتراكات
- `/admin/rentals` - حجوزات التأجير
- `/admin/driver-bookings` - حجوزات السائقين
- `/admin/payments` - المدفوعات
- `/admin/disputes` - النزاعات والشكاوى
- `/admin/fleet` - إدارة الأسطول
- `/admin/fleet/maintenance` - الصيانة
- `/admin/employees` - الموظفون
- `/admin/reports` - التقارير
- `/admin/analytics` - التحليلات
- `/admin/settings` - الإعدادات
- `/admin/settings/pricing` - الأسعار
- `/admin/settings/feature-flags` - الميزات
- `/admin/settings/categories` - الفئات
- `/admin/settings/notifications` - قوالب الإشعارات
- `/admin/marketing` - التسويق
- `/admin/marketing/promotions` - العروض
- `/admin/marketing/coupons` - الكوبونات
- `/admin/blog` - إدارة المدونة

### الميزات الأساسية:
- لوحة إحصائيات تفاعلية
- خرائط حرارية للطلب
- جداول بيانات متقدمة (pagination, filters, search, sort, export)
- نظام الموافقات (السائقين، المركبات)
- محرر إعدادات بصري
- تقارير قابلة للتخصيص
- نظام تذاكر للشكاوى

## المهمة 2: بوابة السائقين (Driver Portal)

أنشئ `apps/driver-portal` بـ:

### الصفحات:
- `/driver/login` - دخول
- `/driver/register` - تسجيل
- `/driver/onboarding` - الإعداد
- `/driver/onboarding/documents` - رفع المستندات
- `/driver/onboarding/training` - التدريب
- `/driver` - اللوحة الرئيسية
- `/driver/trips` - الرحلات
- `/driver/trips/active` - الرحلة الحالية
- `/driver/earnings` - الأرباح
- `/driver/earnings/withdraw` - سحب
- `/driver/schedule` - الجدول
- `/driver/vehicles` - مركباتي
- `/driver/profile` - الملف الشخصي
- `/driver/ratings` - التقييمات
- `/driver/training` - الدورات
- `/driver/support` - الدعم

### الميزات:
- خريطة لحظية بالطلبات القريبة
- قبول/رفض الطلبات
- ملاحة مدمجة
- تتبع المسار والدخل
- تنبيهات صوتية للطلبات
- محفظة السائق
- نظام التدريب والشهادات

---

# 📱 الجلسة 4: الميزات المتقدمة والاختبار

## المهمة 1: نظام الإشعارات الفوري

نفذ:
- Web Push Notifications
- Real-time updates عبر WebSockets
- Notification center
- Email notifications (SendGrid/Resend)
- SMS notifications (Twilio - mock للبداية)

## المهمة 2: نظام الدفع المتعدد

نفذ Mock Payment Gateways لـ:
- بطاقة ائتمان (Stripe)
- بنكك (Bankak) - السودان
- صاح (SAH) - السودان
- مدى Pay - السعودية
- Apple Pay
- STC Pay
- المحفظة الداخلية
- الدفع نقداً

## المهمة 3: الخرائط والتتبع

- Mapbox integration
- Real-time GPS tracking
- Route optimization
- Geofencing
- Heat maps للطلب

## المهمة 4: الذكاء الاصطناعي

- مساعد محادثة (AI Chatbot) للدعم
- توقع أوقات الذروة
- تحسين المسارات
- اكتشاف القيادة الخطرة

## المهمة 5: الأمان

- Rate limiting
- CORS configuration
- Helmet security headers
- Input sanitization
- SQL injection prevention
- XSS protection
- CSRF protection
- 2FA للمسؤولين

## المهمة 6: الاختبارات

اكتب اختبارات لـ:
- Unit tests (Vitest)
- Integration tests
- E2E tests (Playwright)
- API tests

## المهمة 7: التوثيق

- API documentation (Swagger)
- README شامل
- Architecture documentation
- Database schema docs
- Deployment guide

## المهمة 8: التحسين والنشر

- Performance optimization
- SEO optimization
- PWA configuration
- Docker setup
- CI/CD configuration
- Replit Deployment configuration

---

# 🚀 تعليمات التنفيذ لـ Replit Agent

## الترتيب المقترح:

**ابدأ بـ:**

```
أنشئ مشروع Monorepo جديد في Replit بإسم mishwar-platform
باستخدام Turborepo و pnpm workspaces.

أعد قاعدة البيانات PostgreSQL والـ Prisma schema المرفقة.

ابني NestJS backend مع كل الـ modules المذكورة 
(Auth, Users, Drivers, Vehicles, Trips, Routes,
Subscriptions, InviteTrips, Rentals, DriverBookings, 
Payments, Ratings, Notifications, Fleet, Admin, Settings).

استخدم TypeScript strict mode، Zod للتحقق، 
JWT للمصادقة، Prisma للقاعدة.

بعد ذلك سأطلب منك بناء الـ frontend والـ admin والـ driver portal.
```

## نصائح للتعامل مع الـ Agent:

1. **قسّم المهام:** لا تطلب كل شيء مرة واحدة
2. **اختبر بعد كل جزء:** تأكد إن الجزء يعمل قبل التالي
3. **احفظ التقدم:** Git commit بعد كل ميزة
4. **اطلب التحسينات:** بعد البناء الأولي، اطلب تحسينات محددة
5. **راجع الكود:** لا تثق ثقة عمياء، اقرأ ما يكتبه

## الأخطاء الشائعة وحلولها:

- **Agent يبني كثير دفعة واحدة:** أوقفه واطلب التركيز على جزء واحد
- **أخطاء TypeScript:** اطلب منه إصلاحها بـ "Fix all TypeScript errors"
- **مشاكل Prisma:** اطلب `prisma generate` و `prisma db push`
- **مشاكل dependencies:** اطلب `pnpm install` في الجذر

---

# 📊 معايير النجاح

بعد انتهاء الـ Agent، تأكد من:

- [ ] Backend يعمل على port 3000
- [ ] Frontend يعمل على port 3001
- [ ] Admin يعمل على port 3002
- [ ] Driver Portal يعمل على port 3003
- [ ] قاعدة البيانات متصلة وتعمل
- [ ] يمكن التسجيل والدخول
- [ ] يمكن طلب رحلة (mock)
- [ ] يمكن للسائق قبول الرحلة
- [ ] لوحة الإدارة تعرض البيانات
- [ ] الترجمة تعمل (عربي/إنجليزي)
- [ ] RTL يعمل بشكل صحيح
- [ ] التصميم متجاوب
- [ ] لا توجد أخطاء console خطيرة

---

# 🎁 ملاحظات إضافية

- استخدم **best practices** في كل الكود
- اكتب **comments** بالعربية والإنجليزية
- استخدم **type-safe** dependencies
- اتبع **clean architecture**
- اجعل الكود **testable** و **maintainable**
- ضع كل القيم الحساسة في `.env`
- استخدم **error boundaries** في React
- استخدم **error handling** شامل في NestJS

---

**نهاية ملف البرومبت**

> هذا الملف شامل وكافٍ لبناء النظام الكامل.
> ابدأ بالجلسة 1، ثم انتقل تدريجياً.
> بالتوفيق يا مُعاذ! 🚗💨
