import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useCreateRide } from "@workspace/api-client-react";
import { Users, MapPin, Clock } from "lucide-react";

const HOLY_SITES = [
  "المسجد الحرام - مكة المكرمة",
  "مسجد النبي - المدينة المنورة",
  "منى",
  "عرفات",
  "مزدلفة",
  "مطار الملك عبدالعزيز الدولي - جدة",
  "مطار الأمير محمد بن عبدالعزيز - المدينة",
  "فندق في مكة",
  "فندق في المدينة",
];

const PACKAGES = [
  { id: "umrah_single", label: "عمرة فردية", desc: "من المطار للفندق والحرم وعودة", price: 350, icon: "🕌" },
  { id: "umrah_group", label: "عمرة جماعية", desc: "مجموعة حتى 7 أشخاص بسيارة واحدة", price: 800, icon: "👥" },
  { id: "makkah_madinah", label: "مكة ↔ المدينة", desc: "رحلة بين المدينتين المقدستين", price: 600, icon: "🛣️" },
  { id: "ziyarat", label: "جولة زيارات", desc: "زيارة المواقع الإسلامية المقدسة", price: 450, icon: "🗺️" },
  { id: "hajj_package", label: "خدمة الحج", desc: "النقل بين مشاعر الحج الخمسة", price: 1200, icon: "🏕️" },
  { id: "airport_transfer", label: "نقل من/إلى المطار", desc: "استقبال وتوديع بلافتة اسمك", price: 200, icon: "✈️" },
];

export default function HajjUmrah() {
  const { toast } = useToast();
  const createRideMutation = useCreateRide();

  const [form, setForm] = useState({
    selectedPackage: "",
    pilgrimCount: "1",
    fromAddress: "",
    toAddress: "",
    scheduledAt: "",
    flightNumber: "",
    hotelName: "",
    notes: "",
  });

  const selectedPkg = PACKAGES.find(p => p.id === form.selectedPackage);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.selectedPackage || !form.fromAddress) {
      toast({ title: "يرجى اختيار الباقة وتحديد الموقع", variant: "destructive" });
      return;
    }
    createRideMutation.mutate({
      data: {
        fromAddress: form.fromAddress,
        toAddress: form.toAddress || selectedPkg?.label || "المشاعر المقدسة",
        vehicleType: parseInt(form.pilgrimCount) > 4 ? "xl" : "comfort",
        scheduledAt: form.scheduledAt || undefined,
        notes: `خدمة الحج والعمرة | الباقة: ${selectedPkg?.label} | الحجاج: ${form.pilgrimCount} | رقم الرحلة: ${form.flightNumber || "غير محدد"} | الفندق: ${form.hotelName || "غير محدد"}${form.notes ? " | " + form.notes : ""}`,
      }
    }, {
      onSuccess: () => {
        toast({ title: "✅ تم استلام طلب الحج والعمرة!", description: "سيتواصل معك منسق الرحلة قريباً" });
        setForm({ selectedPackage: "", pilgrimCount: "1", fromAddress: "", toAddress: "", scheduledAt: "", flightNumber: "", hotelName: "", notes: "" });
      },
      onError: () => toast({ title: "حدث خطأ، حاول مرة أخرى", variant: "destructive" }),
    });
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-600 to-green-800 flex items-center justify-center text-2xl shadow-lg">🕌</div>
        <div>
          <h1 className="text-2xl font-black">الحج والعمرة</h1>
          <p className="text-muted-foreground text-sm">رحلات مخصصة للحجاج والمعتمرين</p>
        </div>
      </div>

      <div className="bg-gradient-to-r from-emerald-600 to-green-700 rounded-2xl p-6 text-white text-center">
        <div className="text-4xl mb-2">🕌</div>
        <h2 className="font-black text-xl">تلبية وخدمة</h2>
        <p className="text-emerald-100 text-sm mt-1">نُيسّر رحلتك الروحانية بأسطول مريح وسائقين ملتزمين</p>
      </div>

      <div className="space-y-2">
        <Label className="text-base font-bold">اختر الباقة المناسبة</Label>
        <div className="grid grid-cols-2 gap-3">
          {PACKAGES.map(pkg => (
            <button key={pkg.id} type="button" onClick={() => setForm(f => ({ ...f, selectedPackage: pkg.id }))}
              className={`p-4 rounded-xl border-2 text-right transition-all ${form.selectedPackage === pkg.id ? "border-emerald-600 bg-emerald-50" : "border-border hover:border-emerald-200"}`}>
              <div className="text-2xl mb-1">{pkg.icon}</div>
              <div className="font-bold text-sm">{pkg.label}</div>
              <div className="text-xs text-muted-foreground mt-0.5 mb-2">{pkg.desc}</div>
              <div className="font-black text-emerald-700">يبدأ من {pkg.price} ر.س</div>
            </button>
          ))}
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">تفاصيل الرحلة</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="flex items-center gap-1"><Users className="h-3.5 w-3.5" /> عدد الحجاج</Label>
                <Select value={form.pilgrimCount} onValueChange={v => setForm(p => ({ ...p, pilgrimCount: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {["1", "2", "3", "4", "5", "6", "7", "8+"].map(n => (
                      <SelectItem key={n} value={n}>{n} {n === "1" ? "حاج/معتمر" : "حجاج/معتمرين"}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> موعد الرحلة</Label>
                <Input type="datetime-local" value={form.scheduledAt} onChange={e => setForm(p => ({ ...p, scheduledAt: e.target.value }))} />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5 text-green-500" /> موقع الانطلاق *</Label>
              <Select value={form.fromAddress} onValueChange={v => setForm(p => ({ ...p, fromAddress: v }))}>
                <SelectTrigger><SelectValue placeholder="اختر موقع الانطلاق" /></SelectTrigger>
                <SelectContent>
                  {HOLY_SITES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                  <SelectItem value="other">موقع آخر (اكتبه في الملاحظات)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5 text-red-500" /> الوجهة</Label>
              <Select value={form.toAddress} onValueChange={v => setForm(p => ({ ...p, toAddress: v }))}>
                <SelectTrigger><SelectValue placeholder="اختر الوجهة" /></SelectTrigger>
                <SelectContent>
                  {HOLY_SITES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>رقم الرحلة الجوية</Label>
                <Input placeholder="مثال: SV123" value={form.flightNumber} onChange={e => setForm(p => ({ ...p, flightNumber: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <Label>اسم الفندق</Label>
                <Input placeholder="فندق الإقامة" value={form.hotelName} onChange={e => setForm(p => ({ ...p, hotelName: e.target.value }))} />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>ملاحظات</Label>
              <Textarea placeholder="احتياجات خاصة، عدد الحقائب، ملاحظات للسائق..." value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} rows={2} />
            </div>

            {selectedPkg && (
              <div className="bg-emerald-50 rounded-xl p-4 flex items-center justify-between border border-emerald-200">
                <div>
                  <div className="font-bold text-emerald-800">{selectedPkg.icon} {selectedPkg.label}</div>
                  <div className="text-xs text-emerald-600">{selectedPkg.desc}</div>
                </div>
                <div className="text-xl font-black text-emerald-700">{selectedPkg.price} <span className="text-sm font-normal">ر.س</span></div>
              </div>
            )}

            <Button type="submit" className="w-full h-12 text-base font-bold bg-gradient-to-r from-emerald-600 to-green-700" disabled={createRideMutation.isPending}>
              {createRideMutation.isPending ? "جاري الإرسال..." : "🕌 احجز رحلة الحج / العمرة"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
