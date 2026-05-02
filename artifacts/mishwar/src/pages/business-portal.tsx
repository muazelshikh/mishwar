import { useState } from "react";
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
import { Users, Map, FileText, Building, Plus, Trash2, CheckCircle, Clock } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

function StatCard({ title, value, icon: Icon, color = "text-primary" }: { title: string; value: string | number; icon: any; color?: string }) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className={`text-2xl font-bold mt-1 ${color}`}>{value}</p>
          </div>
          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
            <Icon className="h-6 w-6 text-primary" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

const ORG_TYPES: Record<string, string> = { company: "شركة", university: "جامعة", factory: "مصنع", hospital: "مستشفى", hotel: "فندق", travel_agency: "وكالة سفر", relief_org: "منظمة إغاثة", other: "أخرى" };
const STATUS_COLORS: Record<string, string> = { pending: "bg-yellow-100 text-yellow-700", approved: "bg-blue-100 text-blue-700", active: "bg-green-100 text-green-700", suspended: "bg-red-100 text-red-700" };
const STATUS_LABELS: Record<string, string> = { pending: "قيد المراجعة", approved: "معتمد", active: "نشط", suspended: "موقوف" };

function RegisterForm({ onSuccess }: { onSuccess: () => void }) {
  const { toast } = useToast();
  const [orgType, setOrgType] = useState("company");
  const mutation = useMutation({
    mutationFn: (data: any) => customFetch("/api/business-portal/register", { method: "POST", body: JSON.stringify(data), headers: { "Content-Type": "application/json" } }),
    onSuccess: () => { toast({ title: "✅ تم إرسال طلبك بنجاح!" }); onSuccess(); },
    onError: () => toast({ title: "حدث خطأ في التسجيل", variant: "destructive" }),
  });

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    mutation.mutate({
      name: fd.get("name"), orgType,
      commercialReg: fd.get("commercialReg"),
      industry: fd.get("industry"),
      contactPerson: fd.get("contactPerson"),
      contactPhone: fd.get("contactPhone"),
      contactEmail: fd.get("contactEmail"),
      address: fd.get("address"),
      city: fd.get("city"),
      monthlyBudget: fd.get("monthlyBudget"),
    });
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>تسجيل شركتك في مشوار</CardTitle>
          <CardDescription>احصل على حلول نقل مخصصة لموظفيك</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <Label>نوع المنشأة</Label>
              <Select value={orgType} onValueChange={setOrgType} dir="rtl">
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent dir="rtl">
                  {Object.entries(ORG_TYPES).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>اسم المنشأة</Label><Input name="name" required className="mt-1" placeholder="شركة النخبة للخدمات" /></div>
              <div><Label>رقم السجل التجاري</Label><Input name="commercialReg" required className="mt-1" /></div>
              <div><Label>قطاع العمل</Label><Input name="industry" className="mt-1" placeholder="تقنية المعلومات" /></div>
              <div><Label>الميزانية الشهرية (ر.س)</Label><Input name="monthlyBudget" type="number" className="mt-1" placeholder="50000" /></div>
              <div><Label>المسؤول المعني</Label><Input name="contactPerson" required className="mt-1" /></div>
              <div><Label>جوال المسؤول</Label><Input name="contactPhone" required className="mt-1" placeholder="05XXXXXXXX" /></div>
              <div><Label>البريد الإلكتروني</Label><Input name="contactEmail" type="email" className="mt-1" /></div>
              <div><Label>المدينة</Label><Input name="city" className="mt-1" defaultValue="الرياض" /></div>
            </div>
            <div><Label>العنوان</Label><Input name="address" className="mt-1" placeholder="حي العليا، شارع التحلية" /></div>
            <Button type="submit" className="w-full py-5 text-base" disabled={mutation.isPending}>
              {mutation.isPending ? "جاري إرسال الطلب..." : "إرسال طلب العرض"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

function AddEmployeeDialog({ onSuccess }: { onSuccess: () => void }) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const mutation = useMutation({
    mutationFn: (data: any) => customFetch("/api/business-portal/employees", { method: "POST", body: JSON.stringify(data), headers: { "Content-Type": "application/json" } }),
    onSuccess: () => { toast({ title: "✅ تمت إضافة الموظف" }); setOpen(false); onSuccess(); },
    onError: () => toast({ title: "حدث خطأ", variant: "destructive" }),
  });
  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    mutation.mutate({ fullName: fd.get("fullName"), phone: fd.get("phone"), email: fd.get("email"), department: fd.get("department"), employeeCode: fd.get("employeeCode"), monthlyBudget: fd.get("monthlyBudget"), tripsLimit: fd.get("tripsLimit") });
  };
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild><Button size="sm"><Plus className="h-4 w-4 ml-1" />إضافة موظف</Button></DialogTrigger>
      <DialogContent dir="rtl">
        <DialogHeader><DialogTitle>إضافة موظف جديد</DialogTitle></DialogHeader>
        <form onSubmit={onSubmit} className="space-y-3 mt-2">
          <div className="grid grid-cols-2 gap-3">
            <div><Label>الاسم الكامل</Label><Input name="fullName" required className="mt-1" /></div>
            <div><Label>رقم الجوال</Label><Input name="phone" required className="mt-1" placeholder="05XXXXXXXX" /></div>
            <div><Label>البريد الإلكتروني</Label><Input name="email" type="email" className="mt-1" /></div>
            <div><Label>الرقم الوظيفي</Label><Input name="employeeCode" className="mt-1" /></div>
            <div><Label>القسم / الإدارة</Label><Input name="department" className="mt-1" /></div>
            <div><Label>الميزانية الشهرية (ر.س)</Label><Input name="monthlyBudget" type="number" className="mt-1" /></div>
            <div><Label>حد الرحلات الشهري</Label><Input name="tripsLimit" type="number" className="mt-1" /></div>
          </div>
          <Button type="submit" className="w-full" disabled={mutation.isPending}>{mutation.isPending ? "جاري الإضافة..." : "إضافة"}</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function AddRouteDialog({ onSuccess }: { onSuccess: () => void }) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const mutation = useMutation({
    mutationFn: (data: any) => customFetch("/api/business-portal/routes", { method: "POST", body: JSON.stringify(data), headers: { "Content-Type": "application/json" } }),
    onSuccess: () => { toast({ title: "✅ تمت إضافة المسار" }); setOpen(false); onSuccess(); },
    onError: () => toast({ title: "حدث خطأ", variant: "destructive" }),
  });
  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    mutation.mutate({ name: fd.get("name"), startPoint: fd.get("startPoint"), endPoint: fd.get("endPoint"), scheduleTime: fd.get("scheduleTime"), scheduleDays: fd.get("scheduleDays"), vehicleType: fd.get("vehicleType"), capacity: fd.get("capacity") });
  };
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild><Button size="sm"><Plus className="h-4 w-4 ml-1" />إضافة مسار</Button></DialogTrigger>
      <DialogContent dir="rtl">
        <DialogHeader><DialogTitle>إضافة مسار جديد</DialogTitle></DialogHeader>
        <form onSubmit={onSubmit} className="space-y-3 mt-2">
          <div><Label>اسم المسار</Label><Input name="name" required className="mt-1" placeholder="مسار المقر الرئيسي" /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>نقطة الانطلاق</Label><Input name="startPoint" required className="mt-1" /></div>
            <div><Label>الوجهة</Label><Input name="endPoint" required className="mt-1" /></div>
            <div><Label>وقت الانطلاق</Label><Input name="scheduleTime" required className="mt-1" placeholder="07:30" /></div>
            <div><Label>أيام التشغيل</Label><Input name="scheduleDays" className="mt-1" defaultValue="الأحد-الخميس" /></div>
            <div><Label>نوع المركبة</Label><Input name="vehicleType" className="mt-1" defaultValue="باص" /></div>
            <div><Label>الطاقة الاستيعابية</Label><Input name="capacity" type="number" className="mt-1" defaultValue="20" /></div>
          </div>
          <Button type="submit" className="w-full" disabled={mutation.isPending}>{mutation.isPending ? "جاري الإضافة..." : "إضافة"}</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default function BusinessPortal() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [tab, setTab] = useState("dashboard");

  const { data: profile, isLoading } = useQuery({
    queryKey: ["business-profile"],
    queryFn: () => customFetch<any>("/api/business-portal/me"),
    retry: false,
  });

  const isNotRegistered = !isLoading && !profile;

  const { data: stats } = useQuery({
    queryKey: ["business-stats"],
    queryFn: () => customFetch<any>("/api/business-portal/stats"),
    enabled: !!profile,
  });

  const { data: employeesData } = useQuery({
    queryKey: ["business-employees"],
    queryFn: () => customFetch<any>("/api/business-portal/employees"),
    enabled: !!profile,
  });

  const { data: routesData } = useQuery({
    queryKey: ["business-routes"],
    queryFn: () => customFetch<any>("/api/business-portal/routes"),
    enabled: !!profile,
  });

  const { data: invoicesData } = useQuery({
    queryKey: ["business-invoices"],
    queryFn: () => customFetch<any>("/api/business-portal/invoices"),
    enabled: !!profile,
  });

  const deactivateEmployee = useMutation({
    mutationFn: (id: number) => customFetch(`/api/business-portal/employees/${id}`, { method: "DELETE" }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["business-employees"] }); toast({ title: "تم إلغاء تفعيل الموظف" }); },
  });

  if (isLoading) return <div className="flex items-center justify-center h-64 text-primary font-bold">جاري التحميل...</div>;

  if (isNotRegistered) {
    return (
      <div className="p-6 max-w-5xl mx-auto">
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">🏢</div>
          <h1 className="text-3xl font-black text-primary mb-2">حلول النقل المؤسسي</h1>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">نقل موظفيك بكفاءة واحترافية — فاتورة شهرية واحدة وتقارير تفصيلية</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { icon: "🚌", title: "مسارات مخصصة", desc: "صمّم مسارات تناسب جدول موظفيك" },
            { icon: "📊", title: "تقارير تفصيلية", desc: "تابع استخدام كل موظف ونفقاته" },
            { icon: "💳", title: "فاتورة واحدة", desc: "دفع شهري مجمّع بدون تعقيد" },
            { icon: "🛡️", title: "ضمان الأمان", desc: "سائقون معتمدون وسيارات مؤمّنة" },
          ].map((f) => (
            <Card key={f.title} className="text-center p-4">
              <div className="text-3xl mb-2">{f.icon}</div>
              <h3 className="font-bold text-sm">{f.title}</h3>
              <p className="text-xs text-muted-foreground mt-1">{f.desc}</p>
            </Card>
          ))}
        </div>
        {/* Pricing */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {[
            { name: "Starter", price: "5,000", employees: "حتى 50 موظف", features: ["مسار واحد", "تقارير شهرية", "دعم بريدي"] },
            { name: "Business", price: "15,000", employees: "حتى 200 موظف", features: ["5 مسارات", "تقارير أسبوعية", "مدير حساب", "دعم هاتفي"], highlight: true },
            { name: "Enterprise", price: "مخصص", employees: "أكثر من 200 موظف", features: ["مسارات غير محدودة", "تقارير لحظية", "SLA مخصص", "API تكامل"] },
          ].map((p) => (
            <Card key={p.name} className={p.highlight ? "border-2 border-primary" : ""}>
              <CardContent className="pt-6 text-center">
                {p.highlight && <Badge className="mb-2">الأكثر شعبية</Badge>}
                <h3 className="font-black text-xl">{p.name}</h3>
                <p className="text-3xl font-black text-primary mt-2">{p.price === "مخصص" ? p.price : `${p.price} ر.س`}</p>
                <p className="text-xs text-muted-foreground">{p.employees}</p>
                <ul className="mt-4 space-y-1 text-sm text-right">
                  {p.features.map((f) => <li key={f} className="flex items-center gap-2"><CheckCircle className="h-3 w-3 text-green-500 shrink-0" />{f}</li>)}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
        <RegisterForm onSuccess={() => queryClient.invalidateQueries({ queryKey: ["business-profile"] })} />
      </div>
    );
  }

  const employees = employeesData?.items ?? [];
  const routes = routesData?.items ?? [];
  const invoices = invoicesData?.items ?? [];

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-primary">{profile?.name}</h1>
          <div className="flex items-center gap-2 mt-1">
            <p className="text-muted-foreground text-sm">{ORG_TYPES[profile?.orgType]}</p>
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[profile?.status] ?? "bg-gray-100"}`}>
              {STATUS_LABELS[profile?.status]}
            </span>
          </div>
        </div>
        {profile?.status === "pending" && (
          <div className="flex items-center gap-2 bg-yellow-50 text-yellow-700 px-3 py-2 rounded-lg text-sm">
            <Clock className="h-4 w-4" /><span>الطلب قيد المراجعة</span>
          </div>
        )}
      </div>

      <Tabs value={tab} onValueChange={setTab} dir="rtl">
        <TabsList className="grid grid-cols-5 w-full">
          <TabsTrigger value="dashboard">📊 الرئيسية</TabsTrigger>
          <TabsTrigger value="employees">👥 الموظفون</TabsTrigger>
          <TabsTrigger value="routes">🗺️ المسارات</TabsTrigger>
          <TabsTrigger value="invoices">💳 الفواتير</TabsTrigger>
          <TabsTrigger value="profile">🏢 الشركة</TabsTrigger>
        </TabsList>

        {/* Dashboard */}
        <TabsContent value="dashboard" className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard title="إجمالي الموظفين" value={stats?.employees ?? 0} icon={Users} />
            <StatCard title="موظفون نشطون" value={stats?.activeEmployees ?? 0} icon={CheckCircle} color="text-green-600" />
            <StatCard title="المسارات النشطة" value={stats?.routes ?? 0} icon={Map} color="text-blue-600" />
            <StatCard title="الفواتير المعلقة" value={stats?.pendingInvoices ?? 0} icon={FileText} color="text-orange-600" />
          </div>

          {employees.length === 0 && routes.length === 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="text-center py-8 cursor-pointer hover:border-primary transition-colors" onClick={() => setTab("employees")}>
                <CardContent>
                  <Users className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
                  <h3 className="font-bold">أضف موظفيك</h3>
                  <p className="text-sm text-muted-foreground mt-1">ابدأ بإضافة قائمة الموظفين</p>
                </CardContent>
              </Card>
              <Card className="text-center py-8 cursor-pointer hover:border-primary transition-colors" onClick={() => setTab("routes")}>
                <CardContent>
                  <Map className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
                  <h3 className="font-bold">أضف مسارات التنقل</h3>
                  <p className="text-sm text-muted-foreground mt-1">حدد مسارات تنقل موظفيك اليومية</p>
                </CardContent>
              </Card>
            </div>
          )}

          {employees.length > 0 && (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-base">آخر الموظفين المضافين</CardTitle>
                <Button variant="ghost" size="sm" onClick={() => setTab("employees")}>عرض الكل</Button>
              </CardHeader>
              <CardContent className="space-y-2">
                {employees.slice(0, 4).map((e: any) => (
                  <div key={e.id} className="flex justify-between items-center py-2 border-b last:border-0">
                    <div>
                      <p className="font-medium text-sm">{e.fullName}</p>
                      <p className="text-xs text-muted-foreground">{e.department ?? "—"} · {e.phone}</p>
                    </div>
                    <Badge variant={e.isActive ? "default" : "secondary"}>{e.isActive ? "نشط" : "موقوف"}</Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Employees */}
        <TabsContent value="employees" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="font-bold text-lg">الموظفون ({employees.length})</h2>
            <AddEmployeeDialog onSuccess={() => queryClient.invalidateQueries({ queryKey: ["business-employees"] })} />
          </div>
          {employees.length === 0 ? (
            <Card className="text-center py-12"><CardContent>
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">لا يوجد موظفون بعد</p>
            </CardContent></Card>
          ) : (
            <div className="space-y-2">
              {employees.map((e: any) => (
                <Card key={e.id} className={e.isActive ? "" : "opacity-60"}>
                  <CardContent className="py-3 px-4">
                    <div className="flex justify-between items-center">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{e.fullName}</p>
                          {e.employeeCode && <span className="text-xs bg-gray-100 px-1.5 py-0.5 rounded">{e.employeeCode}</span>}
                        </div>
                        <p className="text-xs text-muted-foreground">{e.phone} {e.department ? `· ${e.department}` : ""} {e.monthlyBudget ? `· ${e.monthlyBudget} ر.س/شهر` : ""}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={e.isActive ? "default" : "secondary"}>{e.isActive ? "نشط" : "موقوف"}</Badge>
                        {e.isActive && (
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => deactivateEmployee.mutate(e.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Routes */}
        <TabsContent value="routes" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="font-bold text-lg">مسارات التنقل ({routes.length})</h2>
            <AddRouteDialog onSuccess={() => queryClient.invalidateQueries({ queryKey: ["business-routes"] })} />
          </div>
          {routes.length === 0 ? (
            <Card className="text-center py-12"><CardContent>
              <Map className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">لا توجد مسارات مضافة بعد</p>
            </CardContent></Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {routes.map((r: any) => (
                <Card key={r.id}>
                  <CardContent className="pt-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-bold">{r.name}</h3>
                      <Badge variant={r.isActive ? "default" : "secondary"}>{r.isActive ? "نشط" : "موقوف"}</Badge>
                    </div>
                    <div className="space-y-1 text-sm">
                      <div className="flex items-center gap-2"><span className="text-green-600">●</span><span>{r.startPoint}</span></div>
                      <div className="border-r-2 border-dashed border-muted mr-1.5 h-3" />
                      <div className="flex items-center gap-2"><span className="text-red-600">●</span><span>{r.endPoint}</span></div>
                    </div>
                    <div className="flex gap-2 mt-3 flex-wrap">
                      <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">🕐 {r.scheduleTime}</span>
                      <span className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full">{r.scheduleDays}</span>
                      <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">{r.vehicleType} · {r.capacity} مقعد</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Invoices */}
        <TabsContent value="invoices" className="space-y-4">
          <h2 className="font-bold text-lg">الفواتير</h2>
          {invoices.length === 0 ? (
            <Card className="text-center py-12"><CardContent>
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">لا توجد فواتير بعد</p>
              <p className="text-xs text-muted-foreground mt-1">ستظهر فواتيرك الشهرية هنا</p>
            </CardContent></Card>
          ) : (
            <div className="space-y-2">
              {invoices.map((inv: any) => (
                <Card key={inv.id}>
                  <CardContent className="py-4 px-4 flex justify-between items-center">
                    <div>
                      <p className="font-medium">{inv.invoiceNumber}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(inv.periodStart).toLocaleDateString("ar-SA")} — {new Date(inv.periodEnd).toLocaleDateString("ar-SA")}
                      </p>
                      <p className="text-xs text-muted-foreground">{inv.totalTrips} رحلة</p>
                    </div>
                    <div className="text-left">
                      <p className="font-bold text-lg">{inv.totalAmount} ر.س</p>
                      <Badge variant={inv.status === "paid" ? "default" : inv.status === "overdue" ? "destructive" : "secondary"}>
                        {inv.status === "paid" ? "مدفوع" : inv.status === "overdue" ? "متأخر" : "معلق"}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Profile */}
        <TabsContent value="profile" className="space-y-4">
          <Card>
            <CardHeader><CardTitle className="text-base">معلومات الشركة</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div><p className="text-xs text-muted-foreground">اسم المنشأة</p><p className="font-medium">{profile?.name}</p></div>
                <div><p className="text-xs text-muted-foreground">نوع المنشأة</p><p className="font-medium">{ORG_TYPES[profile?.orgType]}</p></div>
                <div><p className="text-xs text-muted-foreground">السجل التجاري</p><p className="font-medium">{profile?.commercialReg}</p></div>
                <div><p className="text-xs text-muted-foreground">المدينة</p><p className="font-medium">{profile?.city}</p></div>
                <div><p className="text-xs text-muted-foreground">المسؤول</p><p className="font-medium">{profile?.contactPerson}</p></div>
                <div><p className="text-xs text-muted-foreground">جوال المسؤول</p><p className="font-medium">{profile?.contactPhone}</p></div>
                {profile?.contactEmail && <div><p className="text-xs text-muted-foreground">البريد الإلكتروني</p><p className="font-medium">{profile.contactEmail}</p></div>}
                {profile?.monthlyBudget && <div><p className="text-xs text-muted-foreground">الميزانية الشهرية</p><p className="font-medium">{profile.monthlyBudget} ر.س</p></div>}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-muted rounded-lg">
                  <p className="text-2xl font-black text-primary">{profile?.totalEmployees}</p>
                  <p className="text-sm text-muted-foreground">إجمالي الموظفين</p>
                </div>
                <div className="text-center p-4 bg-muted rounded-lg">
                  <p className="text-2xl font-black text-green-600">{profile?.monthlyBudget ?? 0} ر.س</p>
                  <p className="text-sm text-muted-foreground">الميزانية الشهرية</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
