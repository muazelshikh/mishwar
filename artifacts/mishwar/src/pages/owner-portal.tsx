import { useState } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { customFetch } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Car, DollarSign, TrendingUp, AlertCircle, Plus, CheckCircle, Clock } from "lucide-react";

function StatCard({ title, value, icon: Icon, sub, color = "text-primary" }: { title: string; value: string | number; icon: any; sub?: string; color?: string }) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className={`text-2xl font-bold mt-1 ${color}`}>{value}</p>
            {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
          </div>
          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
            <Icon className="h-6 w-6 text-primary" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function RegisterForm({ onSuccess }: { onSuccess: () => void }) {
  const { toast } = useToast();
  const [ownerType, setOwnerType] = useState("individual");
  const mutation = useMutation({
    mutationFn: (data: any) => customFetch("/api/owner-portal/register", { method: "POST", body: JSON.stringify(data), headers: { "Content-Type": "application/json" } }),
    onSuccess: () => { toast({ title: "تم التسجيل بنجاح! جاري مراجعة طلبك" }); onSuccess(); },
    onError: () => toast({ title: "حدث خطأ في التسجيل", variant: "destructive" }),
  });

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    mutation.mutate({
      ownerType,
      companyName: fd.get("companyName"),
      nationalId: fd.get("nationalId"),
      commercialReg: fd.get("commercialReg"),
    });
  };

  return (
    <div className="max-w-lg mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">التسجيل كمالك سيارة</CardTitle>
          <CardDescription>سجّل معنا واستثمر سيارتك مع مشوار</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <Label>نوع المالك</Label>
              <Select value={ownerType} onValueChange={setOwnerType} dir="rtl">
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent dir="rtl">
                  <SelectItem value="individual">فرد</SelectItem>
                  <SelectItem value="company">شركة / مؤسسة</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {ownerType === "individual" ? (
              <div>
                <Label htmlFor="nationalId">رقم الهوية الوطنية</Label>
                <Input id="nationalId" name="nationalId" required className="mt-1" placeholder="1XXXXXXXXX" />
              </div>
            ) : (
              <>
                <div>
                  <Label htmlFor="companyName">اسم الشركة / المؤسسة</Label>
                  <Input id="companyName" name="companyName" required className="mt-1" />
                </div>
                <div>
                  <Label htmlFor="commercialReg">رقم السجل التجاري</Label>
                  <Input id="commercialReg" name="commercialReg" required className="mt-1" />
                </div>
              </>
            )}
            <Button type="submit" className="w-full" disabled={mutation.isPending}>
              {mutation.isPending ? "جاري التسجيل..." : "سجّل الآن"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

function AddVehicleForm({ onSuccess }: { onSuccess: () => void }) {
  const { toast } = useToast();
  const [category, setCategory] = useState("economy");
  const [opModel, setOpModel] = useState("revenue_share");
  const mutation = useMutation({
    mutationFn: (data: any) => customFetch("/api/owner-portal/vehicles", { method: "POST", body: JSON.stringify(data), headers: { "Content-Type": "application/json" } }),
    onSuccess: () => { toast({ title: "✅ تمت إضافة السيارة بنجاح" }); onSuccess(); },
    onError: () => toast({ title: "حدث خطأ", variant: "destructive" }),
  });

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    mutation.mutate({ make: fd.get("make"), model: fd.get("model"), year: fd.get("year"), plateNumber: fd.get("plateNumber"), color: fd.get("color"), category, operationModel: opModel, dailyRentalAmount: fd.get("dailyRentalAmount"), ownerSharePercent: fd.get("ownerSharePercent") });
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div><Label>الماركة</Label><Input name="make" required className="mt-1" placeholder="تويوتا" /></div>
        <div><Label>الموديل</Label><Input name="model" required className="mt-1" placeholder="كامري" /></div>
        <div><Label>السنة</Label><Input name="year" type="number" required className="mt-1" placeholder="2022" /></div>
        <div><Label>رقم اللوحة</Label><Input name="plateNumber" required className="mt-1" placeholder="أ ب ج 1234" /></div>
        <div><Label>اللون</Label><Input name="color" className="mt-1" placeholder="أبيض" defaultValue="أبيض" /></div>
        <div>
          <Label>الفئة</Label>
          <Select value={category} onValueChange={setCategory} dir="rtl">
            <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
            <SelectContent dir="rtl">
              <SelectItem value="economy">اقتصادي</SelectItem>
              <SelectItem value="comfort">مريح</SelectItem>
              <SelectItem value="xl">XL كبير</SelectItem>
              <SelectItem value="vip">VIP</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div>
        <Label>نموذج التشغيل</Label>
        <Select value={opModel} onValueChange={setOpModel} dir="rtl">
          <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
          <SelectContent dir="rtl">
            <SelectItem value="revenue_share">شراكة بالنسبة (30% مالك / 60% سائق / 10% منصة)</SelectItem>
            <SelectItem value="daily_rental">إيجار يومي ثابت</SelectItem>
            <SelectItem value="rental_only">تأجير بدون سائق</SelectItem>
            <SelectItem value="hybrid">مختلط</SelectItem>
          </SelectContent>
        </Select>
      </div>
      {opModel === "daily_rental" && (
        <div><Label>الإيجار اليومي (ريال)</Label><Input name="dailyRentalAmount" type="number" className="mt-1" placeholder="200" /></div>
      )}
      {opModel === "revenue_share" && (
        <div><Label>نسبة المالك (%)</Label><Input name="ownerSharePercent" type="number" className="mt-1" defaultValue="30" /></div>
      )}
      <Button type="submit" className="w-full" disabled={mutation.isPending}>
        {mutation.isPending ? "جاري الإضافة..." : "إضافة السيارة"}
      </Button>
    </form>
  );
}

const MODEL_LABELS: Record<string, string> = { revenue_share: "شراكة", daily_rental: "إيجار يومي", rental_only: "تأجير بدون سائق", hybrid: "مختلط" };
const CAT_LABELS: Record<string, string> = { economy: "اقتصادي", comfort: "مريح", xl: "XL", vip: "VIP" };
const STATUS_COLORS: Record<string, string> = { pending: "bg-yellow-100 text-yellow-700", approved: "bg-blue-100 text-blue-700", active: "bg-green-100 text-green-700", suspended: "bg-red-100 text-red-700" };
const STATUS_LABELS: Record<string, string> = { pending: "قيد المراجعة", approved: "معتمد", active: "نشط", suspended: "موقوف" };

export default function OwnerPortal() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showAddVehicle, setShowAddVehicle] = useState(false);
  const [tab, setTab] = useState("dashboard");

  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ["owner-profile"],
    queryFn: () => customFetch<any>("/api/owner-portal/me"),
    retry: false,
  });

  const isNotRegistered = !profileLoading && !profile;

  const { data: stats } = useQuery({
    queryKey: ["owner-stats"],
    queryFn: () => customFetch<any>("/api/owner-portal/stats"),
    enabled: !!profile,
  });

  const { data: vehiclesData } = useQuery({
    queryKey: ["owner-vehicles"],
    queryFn: () => customFetch<any>("/api/owner-portal/vehicles"),
    enabled: !!profile,
  });

  const { data: earningsData } = useQuery({
    queryKey: ["owner-earnings"],
    queryFn: () => customFetch<any>("/api/owner-portal/earnings"),
    enabled: !!profile,
  });

  const toggleVehicle = useMutation({
    mutationFn: ({ id, isActive }: { id: number; isActive: boolean }) =>
      customFetch(`/api/owner-portal/vehicles/${id}`, { method: "PATCH", body: JSON.stringify({ isActive }), headers: { "Content-Type": "application/json" } }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["owner-vehicles"] }); queryClient.invalidateQueries({ queryKey: ["owner-stats"] }); },
  });

  if (profileLoading) return <div className="flex items-center justify-center h-64 text-primary font-bold">جاري التحميل...</div>;

  if (isNotRegistered) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">🚙</div>
          <h1 className="text-3xl font-black text-primary mb-2">بوابة أصحاب السيارات</h1>
          <p className="text-muted-foreground text-lg">استثمر سيارتك مع مشوار واكسب دخلاً ثابتاً</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {[
            { icon: "💰", title: "دخل ثابت", desc: "احصل على نسبتك من كل رحلة أو إيجار يومي ثابت" },
            { icon: "🛡️", title: "أمان تام", desc: "سياراتك مؤمّنة وسائقوها معتمدون من مشوار" },
            { icon: "📊", title: "تقارير لحظية", desc: "تابع أداء سياراتك وأرباحك في أي وقت" },
          ].map((f) => (
            <Card key={f.title} className="text-center p-4">
              <div className="text-3xl mb-2">{f.icon}</div>
              <h3 className="font-bold">{f.title}</h3>
              <p className="text-sm text-muted-foreground mt-1">{f.desc}</p>
            </Card>
          ))}
        </div>
        <RegisterForm onSuccess={() => queryClient.invalidateQueries({ queryKey: ["owner-profile"] })} />
      </div>
    );
  }

  const vehicles = vehiclesData?.items ?? [];
  const earnings = earningsData?.items ?? [];

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-primary">بوابة أصحاب السيارات</h1>
          <div className="flex items-center gap-2 mt-1">
            <p className="text-muted-foreground">{profile?.name}</p>
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[profile?.status] ?? "bg-gray-100 text-gray-700"}`}>
              {STATUS_LABELS[profile?.status] ?? profile?.status}
            </span>
          </div>
        </div>
        {profile?.status === "pending" && (
          <div className="flex items-center gap-2 bg-yellow-50 text-yellow-700 px-3 py-2 rounded-lg text-sm">
            <Clock className="h-4 w-4" />
            <span>طلبك قيد المراجعة</span>
          </div>
        )}
      </div>

      <Tabs value={tab} onValueChange={setTab} dir="rtl">
        <TabsList className="grid grid-cols-4 w-full">
          <TabsTrigger value="dashboard">📊 الرئيسية</TabsTrigger>
          <TabsTrigger value="vehicles">🚗 سياراتي</TabsTrigger>
          <TabsTrigger value="earnings">💰 الأرباح</TabsTrigger>
          <TabsTrigger value="profile">👤 ملفي</TabsTrigger>
        </TabsList>

        {/* Dashboard Tab */}
        <TabsContent value="dashboard" className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard title="إجمالي السيارات" value={stats?.totalVehicles ?? 0} icon={Car} />
            <StatCard title="السيارات النشطة" value={stats?.activeVehicles ?? 0} icon={CheckCircle} color="text-green-600" />
            <StatCard title="أرباح هذا الشهر" value={`${stats?.monthEarnings?.toFixed(0) ?? 0} ر.س`} icon={TrendingUp} color="text-blue-600" />
            <StatCard title="أرباح معلقة" value={`${stats?.pendingEarnings?.toFixed(0) ?? 0} ر.س`} icon={DollarSign} color="text-orange-600" />
          </div>

          {vehicles.length === 0 && (
            <Card className="text-center py-12">
              <CardContent>
                <div className="text-5xl mb-4">🚗</div>
                <h3 className="font-bold text-lg">أضف سيارتك الأولى</h3>
                <p className="text-muted-foreground mt-1 mb-4">ابدأ بإضافة سيارتك لتبدأ في كسب الأرباح</p>
                <Button onClick={() => setTab("vehicles")}>إضافة سيارة الآن</Button>
              </CardContent>
            </Card>
          )}

          {vehicles.length > 0 && (
            <Card>
              <CardHeader><CardTitle className="text-base">السيارات الأخيرة</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {vehicles.slice(0, 3).map((v: any) => (
                  <div key={v.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div>
                      <p className="font-medium">{v.make} {v.model} {v.year}</p>
                      <p className="text-sm text-muted-foreground">{v.plateNumber} · {CAT_LABELS[v.category]}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">{MODEL_LABELS[v.operationModel]}</span>
                      <Badge variant={v.isActive ? "default" : "secondary"}>{v.isActive ? "نشط" : "موقوف"}</Badge>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {earnings.length > 0 && (
            <Card>
              <CardHeader><CardTitle className="text-base">آخر المعاملات</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                {earnings.slice(0, 5).map((e: any) => (
                  <div key={e.id} className="flex justify-between items-center py-2 border-b last:border-0">
                    <div>
                      <p className="text-sm font-medium">{e.description ?? e.earningType}</p>
                      <p className="text-xs text-muted-foreground">{new Date(e.earningDate).toLocaleDateString("ar-SA")}</p>
                    </div>
                    <div className="text-left">
                      <p className="font-bold text-green-600">+{e.amount} ر.س</p>
                      <Badge variant={e.paymentStatus === "paid" ? "default" : "secondary"} className="text-xs">
                        {e.paymentStatus === "paid" ? "مدفوع" : "معلق"}
                      </Badge>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Vehicles Tab */}
        <TabsContent value="vehicles" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="font-bold text-lg">سياراتي ({vehicles.length})</h2>
            <Button onClick={() => setShowAddVehicle(!showAddVehicle)} size="sm">
              <Plus className="h-4 w-4 ml-1" />{showAddVehicle ? "إلغاء" : "إضافة سيارة"}
            </Button>
          </div>

          {showAddVehicle && (
            <Card>
              <CardHeader><CardTitle className="text-base">إضافة سيارة جديدة</CardTitle></CardHeader>
              <CardContent>
                <AddVehicleForm onSuccess={() => { setShowAddVehicle(false); queryClient.invalidateQueries({ queryKey: ["owner-vehicles"] }); queryClient.invalidateQueries({ queryKey: ["owner-stats"] }); }} />
              </CardContent>
            </Card>
          )}

          {vehicles.length === 0 && !showAddVehicle && (
            <Card className="text-center py-12">
              <CardContent>
                <Car className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">لا توجد سيارات مضافة بعد</p>
              </CardContent>
            </Card>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {vehicles.map((v: any) => (
              <Card key={v.id} className={v.isActive ? "" : "opacity-60"}>
                <CardContent className="pt-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-bold">{v.make} {v.model}</h3>
                      <p className="text-sm text-muted-foreground">{v.year} · {v.color} · {v.plateNumber}</p>
                    </div>
                    <Badge variant={v.isActive ? "default" : "secondary"}>{v.isActive ? "نشط" : "موقوف"}</Badge>
                  </div>
                  <div className="flex gap-2 flex-wrap mb-3">
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">{CAT_LABELS[v.category]}</span>
                    <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">{MODEL_LABELS[v.operationModel]}</span>
                    {v.operationModel === "daily_rental" && v.dailyRentalAmount && (
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">{v.dailyRentalAmount} ر.س/يوم</span>
                    )}
                    {v.operationModel === "revenue_share" && (
                      <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full">{v.ownerSharePercent}% للمالك</span>
                    )}
                  </div>
                  <Button
                    variant={v.isActive ? "outline" : "default"}
                    size="sm"
                    className="w-full"
                    onClick={() => toggleVehicle.mutate({ id: v.id, isActive: !v.isActive })}
                  >
                    {v.isActive ? "إيقاف مؤقت" : "تفعيل"}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Earnings Tab */}
        <TabsContent value="earnings" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <StatCard title="اليوم" value={`${earningsData?.stats?.today?.toFixed(0) ?? 0} ر.س`} icon={DollarSign} color="text-green-600" />
            <StatCard title="هذا الشهر" value={`${earningsData?.stats?.thisMonth?.toFixed(0) ?? 0} ر.س`} icon={TrendingUp} color="text-blue-600" />
            <StatCard title="الإجمالي" value={`${earningsData?.stats?.total?.toFixed(0) ?? 0} ر.س`} icon={DollarSign} />
          </div>

          <Card>
            <CardHeader><CardTitle className="text-base">سجل الأرباح</CardTitle></CardHeader>
            <CardContent>
              {earnings.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">لا توجد معاملات بعد</div>
              ) : (
                <div className="space-y-2">
                  {earnings.map((e: any) => (
                    <div key={e.id} className="flex justify-between items-center py-3 border-b last:border-0">
                      <div>
                        <p className="font-medium text-sm">{e.description ?? e.earningType}</p>
                        <p className="text-xs text-muted-foreground">{new Date(e.earningDate).toLocaleDateString("ar-SA")}</p>
                      </div>
                      <div className="text-left">
                        <p className="font-bold text-green-600">+{e.amount} ر.س</p>
                        <p className="text-xs text-muted-foreground">{e.paymentStatus === "paid" ? "✅ مدفوع" : "⏳ معلق"}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Profile Tab */}
        <TabsContent value="profile" className="space-y-4">
          <Card>
            <CardHeader><CardTitle className="text-base">معلوماتي</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div><p className="text-xs text-muted-foreground">الاسم</p><p className="font-medium">{profile?.name}</p></div>
                <div><p className="text-xs text-muted-foreground">الجوال</p><p className="font-medium">{profile?.phone}</p></div>
                <div><p className="text-xs text-muted-foreground">نوع المالك</p><p className="font-medium">{profile?.ownerType === "company" ? "شركة" : "فرد"}</p></div>
                <div><p className="text-xs text-muted-foreground">الحالة</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[profile?.status] ?? "bg-gray-100"}`}>
                    {STATUS_LABELS[profile?.status]}
                  </span>
                </div>
                {profile?.companyName && <div><p className="text-xs text-muted-foreground">اسم الشركة</p><p className="font-medium">{profile.companyName}</p></div>}
                {profile?.commercialReg && <div><p className="text-xs text-muted-foreground">السجل التجاري</p><p className="font-medium">{profile.commercialReg}</p></div>}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle className="text-base">إجمالي الإحصائيات</CardTitle></CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-muted rounded-lg">
                  <p className="text-2xl font-black text-primary">{profile?.totalVehicles}</p>
                  <p className="text-sm text-muted-foreground">إجمالي السيارات</p>
                </div>
                <div className="text-center p-4 bg-muted rounded-lg">
                  <p className="text-2xl font-black text-green-600">{profile?.totalEarnings?.toFixed(0)} ر.س</p>
                  <p className="text-sm text-muted-foreground">إجمالي الأرباح</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
