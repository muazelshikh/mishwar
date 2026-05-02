import { useState } from "react";
import {
  useGetAdminStats,
  useListAdminUsers,
  useListAdminDrivers,
  useListAdminTrips,
  useUpdateUserStatus,
  useUpdateDriverStatus,
} from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import {
  Users, Car, TrendingUp, Activity, CheckCircle2, XCircle,
  AlertCircle, Search, DollarSign, MapPin, BarChart3, Shield,
} from "lucide-react";

function StatCard({ label, value, sub, icon: Icon, color = "text-primary" }: any) {
  return (
    <Card className="border">
      <CardContent className="pt-4 pb-3">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs text-muted-foreground">{label}</p>
            <p className={`text-3xl font-black mt-1 ${color}`}>{value}</p>
            {sub && <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>}
          </div>
          <Icon className={`h-8 w-8 ${color} opacity-20`} />
        </div>
      </CardContent>
    </Card>
  );
}

export default function AdminDashboard() {
  const { data: stats, refetch: refetchStats } = useGetAdminStats();
  const [userSearch, setUserSearch] = useState("");
  const [userRole, setUserRole] = useState("all");
  const [driverStatus, setDriverStatus] = useState("all");
  const { toast } = useToast();

  const { data: usersData, refetch: refetchUsers } = useListAdminUsers({
    search: userSearch || undefined,
    role: userRole !== "all" ? (userRole as any) : undefined,
  });

  const { data: driversData, refetch: refetchDrivers } = useListAdminDrivers({
    status: driverStatus !== "all" ? (driverStatus as any) : undefined,
  });

  const { data: tripsData } = useListAdminTrips({});

  const updateUserStatusMutation = useUpdateUserStatus();
  const updateDriverStatusMutation = useUpdateDriverStatus();

  const users = usersData?.items ?? [];
  const drivers = driversData?.items ?? [];
  const trips = tripsData?.items ?? [];

  const handleUserStatus = async (userId: number, status: string) => {
    await updateUserStatusMutation.mutateAsync({ userId, data: { status: status as any } });
    toast({ title: "تم تحديث حالة المستخدم" });
    refetchUsers();
    refetchStats();
  };

  const handleDriverStatus = async (driverId: number, driverStatus: string) => {
    await updateDriverStatusMutation.mutateAsync({ driverId, data: { driverStatus: driverStatus as any } });
    toast({ title: "تم تحديث حالة السائق" });
    refetchDrivers();
    refetchStats();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Shield className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-black text-foreground">لوحة الإدارة</h1>
          <p className="text-muted-foreground text-sm">إدارة شاملة للمنصة</p>
        </div>
      </div>

      {/* KPI Cards */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatCard label="إجمالي المستخدمين" value={stats.totalUsers} icon={Users} />
          <StatCard label="السائقون" value={stats.totalDrivers} sub={`${stats.activeDrivers} متاح • ${stats.pendingDrivers} بانتظار`} icon={Car} />
          <StatCard label="إجمالي الرحلات" value={stats.totalRides} sub={`${stats.activeRides} نشطة اليوم`} icon={Activity} />
          <StatCard label="الإيرادات الكلية" value={`${stats.revenueTotal.toFixed(0)} ريال`} sub={`${stats.revenueToday.toFixed(0)} ريال اليوم`} icon={DollarSign} color="text-green-600" />
        </div>
      )}

      {/* Secondary Stats */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatCard label="الرحلات الجماعية" value={stats.totalGroupTrips} sub={`${stats.activeGroupTrips} نشطة`} icon={Users} />
          <StatCard label="الاشتراكات الفعالة" value={stats.totalSubscriptions} icon={CheckCircle2} />
          <StatCard label="تأجير السيارات" value={stats.totalRentals} icon={Car} />
          <StatCard label="رحلات الدعوة" value={stats.totalInviteTrips} icon={MapPin} />
        </div>
      )}

      {/* Management Tabs */}
      <Tabs defaultValue="users">
        <TabsList className="mb-4 flex-wrap h-auto gap-1">
          <TabsTrigger value="users">المستخدمون ({usersData?.total ?? 0})</TabsTrigger>
          <TabsTrigger value="drivers">السائقون ({driversData?.total ?? 0})</TabsTrigger>
          <TabsTrigger value="trips">الرحلات ({tripsData?.total ?? 0})</TabsTrigger>
        </TabsList>

        {/* Users Tab */}
        <TabsContent value="users" className="space-y-4">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="ابحث بالاسم أو الجوال..." className="pr-9" value={userSearch} onChange={e => setUserSearch(e.target.value)} />
            </div>
            <Select value={userRole} onValueChange={setUserRole}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">الكل</SelectItem>
                <SelectItem value="passenger">راكب</SelectItem>
                <SelectItem value="driver">سائق</SelectItem>
                <SelectItem value="admin">مدير</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            {users.map((user) => (
              <div key={user.id} className="flex items-center justify-between p-3 rounded-lg bg-muted">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <Users className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">{user.name}</p>
                    <p className="text-xs text-muted-foreground">{user.phone} • {user.role === "admin" ? "مدير" : user.role === "driver" ? "سائق" : "راكب"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={(user as any).status === "active" ? "default" : "destructive"} className="text-xs">
                    {(user as any).status === "active" ? "نشط" : (user as any).status === "suspended" ? "موقوف" : "محظور"}
                  </Badge>
                  <Select
                    value={(user as any).status ?? "active"}
                    onValueChange={(v) => handleUserStatus(user.id, v)}
                  >
                    <SelectTrigger className="w-24 h-7 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">تفعيل</SelectItem>
                      <SelectItem value="suspended">إيقاف</SelectItem>
                      <SelectItem value="banned">حظر</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            ))}
            {users.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">لا توجد نتائج</div>
            )}
          </div>
        </TabsContent>

        {/* Drivers Tab */}
        <TabsContent value="drivers" className="space-y-4">
          <div className="flex gap-2">
            <Select value={driverStatus} onValueChange={setDriverStatus}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع السائقين</SelectItem>
                <SelectItem value="pending">بانتظار الاعتماد</SelectItem>
                <SelectItem value="approved">معتمد</SelectItem>
                <SelectItem value="rejected">مرفوض</SelectItem>
                <SelectItem value="suspended">موقوف</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            {drivers.map((driver: any) => (
              <div key={driver.id} className="flex items-start justify-between p-3 rounded-lg bg-muted">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <Car className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">{driver.name}</p>
                    <p className="text-xs text-muted-foreground">{driver.vehicleMake} {driver.vehicleModel} • {driver.vehiclePlate}</p>
                    <p className="text-xs text-muted-foreground">{driver.totalTrips} رحلة • تقييم: {driver.rating?.toFixed(1) ?? "—"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge
                    variant={driver.driverStatus === "approved" ? "default" : driver.driverStatus === "pending" ? "outline" : "destructive"}
                    className="text-xs"
                  >
                    {driver.driverStatus === "approved" ? "معتمد" : driver.driverStatus === "pending" ? "بانتظار" : driver.driverStatus === "rejected" ? "مرفوض" : "موقوف"}
                  </Badge>
                  <Select
                    value={driver.driverStatus ?? "pending"}
                    onValueChange={(v) => handleDriverStatus(driver.id, v)}
                  >
                    <SelectTrigger className="w-24 h-7 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="approved">اعتماد</SelectItem>
                      <SelectItem value="rejected">رفض</SelectItem>
                      <SelectItem value="suspended">إيقاف</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            ))}
            {drivers.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">لا توجد نتائج</div>
            )}
          </div>
        </TabsContent>

        {/* Trips Tab */}
        <TabsContent value="trips" className="space-y-3">
          {trips.map((trip) => {
            const colors: Record<string, string> = {
              pending: "bg-yellow-100 text-yellow-800",
              accepted: "bg-blue-100 text-blue-800",
              in_progress: "bg-green-100 text-green-800",
              completed: "bg-gray-100 text-gray-800",
              cancelled: "bg-red-100 text-red-800",
            };
            const labels: Record<string, string> = {
              pending: "بانتظار", accepted: "مقبولة", in_progress: "جارية", completed: "مكتملة", cancelled: "ملغية",
            };
            return (
              <div key={trip.id} className="flex items-start justify-between p-3 rounded-lg bg-muted">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="h-3 w-3 text-primary shrink-0" />
                    <span className="truncate max-w-[250px]">{trip.fromAddress} ← {trip.toAddress}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {new Date(trip.createdAt).toLocaleString("ar-SA")}
                    {trip.finalPrice && ` • ${trip.finalPrice} ريال`}
                  </p>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full font-medium shrink-0 ${colors[trip.status] ?? ""}`}>
                  {labels[trip.status] ?? trip.status}
                </span>
              </div>
            );
          })}
          {trips.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">لا توجد رحلات</div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
