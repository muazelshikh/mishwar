import { useState } from "react";
import { Link } from "wouter";
import { useGetMyActivity, useCreateRide } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { MapPin, Clock, Activity } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const QUICK_SERVICES = [
  { href: "/group-trips", label: "تراحيل", icon: "🚌", color: "bg-blue-50 border-blue-200 text-blue-700" },
  { href: "/loved-ones", label: "أحبابك", icon: "❤️", color: "bg-pink-50 border-pink-200 text-pink-700" },
  { href: "/delivery", label: "توصيل", icon: "📦", color: "bg-amber-50 border-amber-200 text-amber-700" },
  { href: "/school-transport", label: "مدرسي", icon: "🎒", color: "bg-green-50 border-green-200 text-green-700" },
  { href: "/medical-transport", label: "طبي", icon: "🏥", color: "bg-red-50 border-red-200 text-red-700" },
  { href: "/rentals", label: "تأجير", icon: "🔑", color: "bg-orange-50 border-orange-200 text-orange-700" },
  { href: "/hajj-umrah", label: "حج وعمرة", icon: "🕌", color: "bg-emerald-50 border-emerald-200 text-emerald-700" },
  { href: "/events", label: "مناسبات", icon: "🎉", color: "bg-purple-50 border-purple-200 text-purple-700" },
  { href: "/tourism", label: "سياحة", icon: "🌴", color: "bg-sky-50 border-sky-200 text-sky-700" },
  { href: "/corporate", label: "مؤسسات", icon: "🏢", color: "bg-slate-50 border-slate-300 text-slate-700" },
  { href: "/hire-driver", label: "سائق خاص", icon: "👨‍✈️", color: "bg-indigo-50 border-indigo-200 text-indigo-700" },
  { href: "/services", label: "كل الخدمات", icon: "⊞", color: "bg-muted border-border text-foreground" },
];

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  accepted: "bg-blue-100 text-blue-800",
  in_progress: "bg-purple-100 text-purple-800",
  completed: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
};

const STATUS_LABELS: Record<string, string> = {
  pending: "قيد الانتظار",
  accepted: "تم القبول",
  in_progress: "جارٍ التنفيذ",
  completed: "مكتملة",
  cancelled: "ملغاة",
};

export default function Home() {
  const { data: activity, isLoading } = useGetMyActivity();
  const createRideMutation = useCreateRide();
  const { toast } = useToast();

  const [fromAddress, setFromAddress] = useState("");
  const [toAddress, setToAddress] = useState("");
  const [vehicleType, setVehicleType] = useState<"economy" | "comfort" | "xl">("economy");
  const [scheduledAt, setScheduledAt] = useState("");

  const handleBookRide = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fromAddress || !toAddress) {
      toast({ title: "يرجى إدخال العناوين", variant: "destructive" });
      return;
    }
    createRideMutation.mutate({
      data: { fromAddress, toAddress, vehicleType, scheduledAt: scheduledAt || undefined }
    }, {
      onSuccess: () => {
        toast({ title: "✅ تم حجز رحلتك!", description: "سيصلك سائق قريباً" });
        setFromAddress(""); setToAddress(""); setScheduledAt("");
      },
      onError: () => toast({ title: "حدث خطأ أثناء الحجز", variant: "destructive" }),
    });
  };

  const recentRides = (activity as any)?.rides?.slice(0, 3) || [];

  return (
    <div className="space-y-8">
      {/* Booking Card */}
      <Card className="overflow-hidden border-0 shadow-lg">
        <div className="h-1.5 w-full bg-gradient-to-r from-orange-500 via-red-500 to-orange-600" />
        <CardHeader className="pb-4">
          <CardTitle className="text-xl">احجز رحلة فردية</CardTitle>
          <p className="text-sm text-muted-foreground">وصّلك لأي مكان في دقائق</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleBookRide} className="space-y-4">
            <div className="space-y-3">
              <div className="relative">
                <MapPin className="absolute right-3 top-3 h-4 w-4 text-green-500" />
                <Input
                  className="pr-9"
                  placeholder="من أين؟ — نقطة الانطلاق"
                  value={fromAddress}
                  onChange={e => setFromAddress(e.target.value)}
                />
              </div>
              <div className="relative">
                <MapPin className="absolute right-3 top-3 h-4 w-4 text-red-500" />
                <Input
                  className="pr-9"
                  placeholder="إلى أين؟ — الوجهة"
                  value={toAddress}
                  onChange={e => setToAddress(e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">نوع السيارة</Label>
                <Select value={vehicleType} onValueChange={v => setVehicleType(v as "economy" | "comfort" | "xl")}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="economy">🚗 اقتصادية</SelectItem>
                    <SelectItem value="comfort">🚙 مريحة</SelectItem>
                    <SelectItem value="xl">🚐 XL كبيرة</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground flex items-center gap-1"><Clock className="h-3 w-3" /> جدول لاحقاً</Label>
                <Input type="datetime-local" value={scheduledAt} onChange={e => setScheduledAt(e.target.value)} />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-12 text-base font-bold bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
              disabled={createRideMutation.isPending}
            >
              {createRideMutation.isPending ? "جاري البحث عن سائق..." : "🚗 احجز الآن"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Quick Services Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-black">خدماتنا الـ 14</h2>
          <Link href="/services">
            <Button variant="ghost" size="sm" className="text-primary text-sm">عرض الكل ←</Button>
          </Link>
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
          {QUICK_SERVICES.map((s) => (
            <Link key={s.href} href={s.href}>
              <div className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 cursor-pointer hover:scale-105 transition-all ${s.color}`}>
                <span className="text-2xl">{s.icon}</span>
                <span className="text-xs font-bold text-center leading-tight">{s.label}</span>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Rides */}
      {!isLoading && recentRides.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-black flex items-center gap-2"><Activity className="h-5 w-5 text-primary" /> آخر رحلاتك</h2>
            <Link href="/rides">
              <Button variant="ghost" size="sm" className="text-primary text-sm">كل الرحلات ←</Button>
            </Link>
          </div>
          <div className="space-y-2">
            {recentRides.map((ride: any) => (
              <Link key={ride.id} href={`/rides/${ride.id}`}>
                <Card className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 text-sm font-medium truncate">
                          <span className="text-green-600 shrink-0">●</span>
                          <span className="truncate">{ride.fromAddress}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground truncate mt-1">
                          <span className="text-red-500 shrink-0">●</span>
                          <span className="truncate">{ride.toAddress}</span>
                        </div>
                      </div>
                      <div className="text-left shrink-0 space-y-1">
                        <Badge className={`text-xs ${STATUS_COLORS[ride.status] || ""}`}>
                          {STATUS_LABELS[ride.status] || ride.status}
                        </Badge>
                        {ride.estimatedPrice && (
                          <div className="text-sm font-bold text-primary text-left">{ride.estimatedPrice} ر.س</div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      )}

      {!isLoading && recentRides.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="p-8 text-center text-muted-foreground">
            <div className="text-4xl mb-3">🚗</div>
            <p className="font-medium">لا رحلات بعد!</p>
            <p className="text-sm mt-1">احجز رحلتك الأولى من الأعلى</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
