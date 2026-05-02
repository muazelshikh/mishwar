import { useState } from "react";
import {
  useGetDriverProfile,
  useUpdateDriverAvailability,
  useGetDriverEarnings,
  useGetDriverStats,
  useGetDriverTrips,
} from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Car, Star, Wallet, TrendingUp, MapPin, Clock, CheckCircle, XCircle, User } from "lucide-react";

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  pending: { label: "بانتظار القبول", color: "bg-yellow-100 text-yellow-800" },
  accepted: { label: "مقبولة", color: "bg-blue-100 text-blue-800" },
  in_progress: { label: "جارية", color: "bg-green-100 text-green-800" },
  completed: { label: "مكتملة", color: "bg-gray-100 text-gray-800" },
  cancelled: { label: "ملغية", color: "bg-red-100 text-red-800" },
};

export default function DriverPortal() {
  const { data: profile, refetch: refetchProfile } = useGetDriverProfile();
  const { data: earnings } = useGetDriverEarnings();
  const { data: stats } = useGetDriverStats();
  const { data: tripsData } = useGetDriverTrips({});
  const availabilityMutation = useUpdateDriverAvailability();
  const { toast } = useToast();

  const trips = tripsData?.items ?? [];

  const handleToggleAvailability = async (value: boolean) => {
    await availabilityMutation.mutateAsync({ data: { isAvailable: value } });
    toast({ title: value ? "أنت الآن متاح للرحلات" : "تم إيقاف استقبال الرحلات" });
    refetchProfile();
  };

  if (!profile) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-black text-foreground">بوابة السائق</h1>
        <Card>
          <CardContent className="py-16 text-center">
            <Car className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-30" />
            <h2 className="text-xl font-bold mb-2">لم يتم تسجيلك كسائق بعد</h2>
            <p className="text-muted-foreground mb-4">يمكنك التسجيل كسائق من صفحة السائقين</p>
            <Button onClick={() => window.location.href = "/drivers"}>التسجيل كسائق</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-foreground">بوابة السائق</h1>
          <p className="text-muted-foreground mt-1">مرحباً {profile.name}</p>
        </div>
        <div className="flex items-center gap-3 bg-card border rounded-xl px-4 py-3">
          <span className="text-sm font-medium">{profile.isAvailable ? "متاح" : "غير متاح"}</span>
          <Switch
            checked={profile.isAvailable}
            onCheckedChange={handleToggleAvailability}
            disabled={availabilityMutation.isPending}
          />
        </div>
      </div>

      {/* Status Card */}
      <Card className={`border-2 ${profile.isAvailable ? "border-green-300 bg-green-50" : "border-muted"}`}>
        <CardContent className="py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`h-3 w-3 rounded-full ${profile.isAvailable ? "bg-green-500 animate-pulse" : "bg-gray-400"}`} />
              <span className="font-medium">{profile.isAvailable ? "أنت متاح للرحلات" : "أنت غير متاح حالياً"}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
              <span>{profile.rating?.toFixed(1) ?? "جديد"}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Driver Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5 text-primary" />
            معلومات السائق
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground">المركبة</p>
            <p className="font-medium">{profile.vehicleMake} {profile.vehicleModel} {profile.vehicleYear}</p>
          </div>
          <div>
            <p className="text-muted-foreground">لوحة السيارة</p>
            <p className="font-medium">{profile.vehiclePlate}</p>
          </div>
          <div>
            <p className="text-muted-foreground">نوع المركبة</p>
            <p className="font-medium">{profile.vehicleType}</p>
          </div>
          <div>
            <p className="text-muted-foreground">الحالة</p>
            <Badge variant={profile.driverStatus === "approved" ? "default" : "destructive"}>
              {profile.driverStatus === "approved" ? "معتمد" : profile.driverStatus === "pending" ? "قيد المراجعة" : "محدود"}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Earnings Cards */}
      {earnings && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: "أرباح اليوم", value: earnings.today, trips: earnings.todayTrips },
            { label: "هذا الأسبوع", value: earnings.thisWeek, trips: earnings.weekTrips },
            { label: "هذا الشهر", value: earnings.thisMonth, trips: earnings.monthTrips },
            { label: "إجمالي الأرباح", value: earnings.total, trips: null },
          ].map(({ label, value, trips: t }) => (
            <Card key={label} className="border">
              <CardContent className="pt-4 pb-3">
                <p className="text-xs text-muted-foreground">{label}</p>
                <p className="text-xl font-black text-primary mt-1">{value.toFixed(0)} <span className="text-xs font-normal">ريال</span></p>
                {t !== null && <p className="text-xs text-muted-foreground mt-0.5">{t} رحلة</p>}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-3 gap-3">
          <Card className="border text-center">
            <CardContent className="pt-4 pb-3">
              <p className="text-2xl font-black text-primary">{stats.completedTrips}</p>
              <p className="text-xs text-muted-foreground mt-1">رحلة مكتملة</p>
            </CardContent>
          </Card>
          <Card className="border text-center">
            <CardContent className="pt-4 pb-3">
              <p className="text-2xl font-black text-primary">{stats.acceptanceRate}%</p>
              <p className="text-xs text-muted-foreground mt-1">معدل القبول</p>
            </CardContent>
          </Card>
          <Card className="border text-center">
            <CardContent className="pt-4 pb-3">
              <p className="text-2xl font-black text-primary">{stats.rating?.toFixed(1) ?? "—"}</p>
              <p className="text-xs text-muted-foreground mt-1">التقييم</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* My Trips */}
      <Card>
        <CardHeader>
          <CardTitle>رحلاتي الأخيرة</CardTitle>
        </CardHeader>
        <CardContent>
          {trips.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">
              <Car className="h-10 w-10 mx-auto mb-2 opacity-30" />
              <p>لا توجد رحلات بعد</p>
            </div>
          ) : (
            <div className="space-y-3">
              {trips.slice(0, 10).map((trip) => {
                const statusInfo = STATUS_MAP[trip.status] ?? { label: trip.status, color: "" };
                return (
                  <div key={trip.id} className="flex items-start justify-between p-3 rounded-lg bg-muted">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm">
                        <MapPin className="h-3 w-3 text-primary shrink-0" />
                        <span className="truncate max-w-[200px]">{trip.fromAddress} ← {trip.toAddress}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {new Date(trip.createdAt).toLocaleDateString("ar-SA")}
                      </p>
                      {trip.finalPrice && (
                        <p className="text-xs font-medium text-primary">{trip.finalPrice} ريال</p>
                      )}
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full font-medium shrink-0 ${statusInfo.color}`}>
                      {statusInfo.label}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
