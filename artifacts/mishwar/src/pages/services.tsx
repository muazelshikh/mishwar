import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const services = [
  {
    href: "/",
    label: "الرحلات الفردية",
    labelEn: "Solo Rides",
    description: "رحلة خاصة من الباب للباب",
    icon: "🚗",
    color: "from-orange-500 to-red-500",
    badge: "الأكثر طلباً",
  },
  {
    href: "/group-trips",
    label: "التراحيل الجماعية",
    labelEn: "Group Trips",
    description: "مسارات ثابتة يومية واشتراكات",
    icon: "🚌",
    color: "from-blue-500 to-indigo-600",
  },
  {
    href: "/invite-trips",
    label: "رحلات الدعوة",
    labelEn: "Invite Trips",
    description: "ادع أصدقاءك وشارك الرحلة",
    icon: "👥",
    color: "from-purple-500 to-violet-600",
  },
  {
    href: "/group-trips?type=interstate",
    label: "النقل بين المدن",
    labelEn: "Interstate",
    description: "رحلات راحة بين المحافظات والمدن",
    icon: "🛣️",
    color: "from-teal-500 to-cyan-600",
  },
  {
    href: "/loved-ones",
    label: "أحبابك",
    labelEn: "Loved Ones",
    description: "نوصّل أهلك في الوطن وأنت في الخارج",
    icon: "❤️",
    color: "from-pink-500 to-rose-600",
    badge: "جديد",
  },
  {
    href: "/delivery",
    label: "خدمات التوصيل",
    labelEn: "Delivery",
    description: "توصيل طعام، طرود، بقالة، وثائق",
    icon: "📦",
    color: "from-amber-500 to-yellow-600",
    badge: "جديد",
  },
  {
    href: "/school-transport",
    label: "النقل المدرسي",
    labelEn: "School Transport",
    description: "إيصال أمان للأبناء كل يوم",
    icon: "🎒",
    color: "from-green-500 to-emerald-600",
    badge: "جديد",
  },
  {
    href: "/medical-transport",
    label: "النقل الطبي",
    labelEn: "Medical Transport",
    description: "لمواعيد المستشفيات والعيادات",
    icon: "🏥",
    color: "from-red-500 to-rose-700",
    badge: "جديد",
  },
  {
    href: "/corporate",
    label: "عقود مؤسسية",
    labelEn: "Corporate B2B",
    description: "حلول نقل متكاملة للشركات والجهات",
    icon: "🏢",
    color: "from-slate-600 to-gray-700",
    badge: "جديد",
  },
  {
    href: "/hajj-umrah",
    label: "الحج والعمرة",
    labelEn: "Hajj & Umrah",
    description: "رحلات مخصصة للحجاج والمعتمرين",
    icon: "🕌",
    color: "from-emerald-600 to-green-800",
    badge: "جديد",
  },
  {
    href: "/tourism",
    label: "الرحلات السياحية",
    labelEn: "Tourism",
    description: "جولات سياحية منظمة مع مرشد",
    icon: "🌴",
    color: "from-sky-500 to-blue-600",
    badge: "جديد",
  },
  {
    href: "/events",
    label: "خدمة المناسبات",
    labelEn: "Events",
    description: "أعراس، تخرجات، مؤتمرات، رحلات VIP",
    icon: "🎉",
    color: "from-fuchsia-500 to-purple-700",
    badge: "جديد",
  },
  {
    href: "/rentals",
    label: "تأجير سيارات",
    labelEn: "Car Rental",
    description: "سيارة بدون سائق لتتنقل بحرية",
    icon: "🔑",
    color: "from-orange-400 to-amber-600",
  },
  {
    href: "/hire-driver",
    label: "استئجار سائق",
    labelEn: "Hire a Driver",
    description: "سائق محترف لسيارتك الخاصة",
    icon: "👨‍✈️",
    color: "from-indigo-500 to-blue-700",
  },
];

export default function Services() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-black text-foreground">خدماتنا</h1>
        <p className="text-muted-foreground mt-1">14 خدمة نقل شاملة تحت سقف واحد</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {services.map((s) => (
          <Link key={s.href + s.label} href={s.href}>
            <Card className="h-full cursor-pointer hover:shadow-lg transition-all hover:-translate-y-1 group overflow-hidden border-0 shadow-sm">
              <div className={`h-2 w-full bg-gradient-to-r ${s.color}`} />
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <span className="text-4xl">{s.icon}</span>
                  {s.badge && (
                    <Badge variant="secondary" className="text-xs">
                      {s.badge}
                    </Badge>
                  )}
                </div>
                <h3 className="font-bold text-foreground text-lg leading-tight">{s.label}</h3>
                <p className="text-xs text-muted-foreground mt-0.5 mb-2">{s.labelEn}</p>
                <p className="text-sm text-muted-foreground leading-relaxed">{s.description}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
