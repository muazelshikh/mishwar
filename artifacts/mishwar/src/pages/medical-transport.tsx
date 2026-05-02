import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useCreateRide } from "@workspace/api-client-react";
import { Heart, MapPin, Clock, Phone } from "lucide-react";

export default function MedicalTransport() {
  const { toast } = useToast();
  const createRideMutation = useCreateRide();

  const [form, setForm] = useState({
    patientName: "",
    patientPhone: "",
    facility: "",
    appointmentType: "",
    fromAddress: "",
    scheduledAt: "",
    needsCompanion: "no",
    mobilityNeeds: "",
    notes: "",
    vehicleType: "comfort" as "economy" | "comfort" | "xl",
  });

  const FACILITIES = [
    "مستشفى الملك فيصل التخصصي",
    "مستشفى الملك فهد",
    "مستشفى السلامة",
    "مستشفى بخش",
    "عيادة خاصة",
    "مركز صحي",
    "مستشفى آخر",
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.fromAddress || !form.facility) {
      toast({ title: "يرجى ملء الحقول المطلوبة", variant: "destructive" });
      return;
    }
    createRideMutation.mutate({
      data: {
        fromAddress: form.fromAddress,
        toAddress: form.facility,
        vehicleType: form.vehicleType,
        scheduledAt: form.scheduledAt || undefined,
        notes: `نقل طبي | المريض: ${form.patientName} (${form.patientPhone}) | نوع الموعد: ${form.appointmentType} | مرافق: ${form.needsCompanion === "yes" ? "نعم" : "لا"} | احتياجات: ${form.mobilityNeeds || "لا يوجد"}${form.notes ? " | " + form.notes : ""}`,
      }
    }, {
      onSuccess: () => {
        toast({ title: "✅ تم حجز رحلة النقل الطبي!", description: "سيتواصل معك السائق قبل الموعد بـ 30 دقيقة" });
        setForm({ patientName: "", patientPhone: "", facility: "", appointmentType: "", fromAddress: "", scheduledAt: "", needsCompanion: "no", mobilityNeeds: "", notes: "", vehicleType: "comfort" });
      },
      onError: () => toast({ title: "حدث خطأ، حاول مرة أخرى", variant: "destructive" }),
    });
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-red-500 to-rose-700 flex items-center justify-center text-2xl shadow-lg">🏥</div>
        <div>
          <h1 className="text-2xl font-black">النقل الطبي</h1>
          <p className="text-muted-foreground text-sm">لمواعيد المستشفيات والعيادات بأمان وراحة</p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { icon: "🚗", label: "سيارات مريحة", sub: "لكبار السن والمرضى" },
          { icon: "⏰", label: "دقة في المواعيد", sub: "لا تتأخر على موعدك" },
          { icon: "👨‍⚕️", label: "سائقون مدرّبون", sub: "على التعامل مع المرضى" },
          { icon: "🔄", label: "انتظار وعودة", sub: "خيار الانتظار متاح" },
        ].map(f => (
          <Card key={f.label} className="text-center p-3 border-red-100">
            <div className="text-xl">{f.icon}</div>
            <div className="font-bold text-sm mt-1">{f.label}</div>
            <div className="text-xs text-muted-foreground">{f.sub}</div>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2"><Heart className="h-5 w-5 text-red-500" /> بيانات الموعد الطبي</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>اسم المريض</Label>
                <Input placeholder="الاسم الكامل" value={form.patientName} onChange={e => setForm(p => ({ ...p, patientName: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <Label className="flex items-center gap-1"><Phone className="h-3.5 w-3.5" /> هاتف المريض</Label>
                <Input placeholder="05XXXXXXXX" value={form.patientPhone} onChange={e => setForm(p => ({ ...p, patientPhone: e.target.value }))} />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>المستشفى أو العيادة *</Label>
              <Select value={form.facility} onValueChange={v => setForm(p => ({ ...p, facility: v }))}>
                <SelectTrigger><SelectValue placeholder="اختر المنشأة الصحية" /></SelectTrigger>
                <SelectContent>
                  {FACILITIES.map(f => <SelectItem key={f} value={f}>{f}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label>نوع الموعد</Label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { value: "checkup", label: "🩺 كشف عام" },
                  { value: "specialist", label: "👨‍⚕️ استشاري" },
                  { value: "lab", label: "🧪 مختبر" },
                  { value: "radiology", label: "🔬 أشعة" },
                  { value: "followup", label: "📋 متابعة" },
                  { value: "surgery", label: "🏨 عملية" },
                ].map(t => (
                  <button key={t.value} type="button" onClick={() => setForm(f => ({ ...f, appointmentType: t.value }))}
                    className={`p-2 rounded-lg border-2 text-center text-xs transition-all ${form.appointmentType === t.value ? "border-red-500 bg-red-50 font-bold" : "border-border"}`}>
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5 text-green-500" /> عنوان الانطلاق *</Label>
              <Input placeholder="المنزل أو العنوان الحالي" value={form.fromAddress} onChange={e => setForm(p => ({ ...p, fromAddress: e.target.value }))} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> موعد الاستقبال *</Label>
                <Input type="datetime-local" value={form.scheduledAt} onChange={e => setForm(p => ({ ...p, scheduledAt: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <Label>نوع السيارة</Label>
                <Select value={form.vehicleType} onValueChange={v => setForm(p => ({ ...p, vehicleType: v as "economy" | "comfort" | "xl" }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="comfort">🚙 مريحة (مُوصى بها)</SelectItem>
                    <SelectItem value="xl">🚐 كبيرة (لكرسي متحرك)</SelectItem>
                    <SelectItem value="economy">🚗 اقتصادية</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>احتياجات التنقل</Label>
              <Select value={form.mobilityNeeds} onValueChange={v => setForm(p => ({ ...p, mobilityNeeds: v }))}>
                <SelectTrigger><SelectValue placeholder="هل يحتاج المريض لمساعدة خاصة؟" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="">لا توجد احتياجات خاصة</SelectItem>
                  <SelectItem value="wheelchair">🦽 كرسي متحرك</SelectItem>
                  <SelectItem value="walker">🦯 عكاز أو مشّاية</SelectItem>
                  <SelectItem value="elderly">👴 مسن يحتاج مساعدة للركوب</SelectItem>
                  <SelectItem value="stretcher">🛏️ نقّالة</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label>هل تحتاج مرافق؟</Label>
              <div className="grid grid-cols-2 gap-3">
                {[{ value: "no", label: "لا", desc: "المريض مستقل" }, { value: "yes", label: "نعم", desc: "+ 15 ر.س للمرافق" }].map(o => (
                  <button key={o.value} type="button" onClick={() => setForm(f => ({ ...f, needsCompanion: o.value }))}
                    className={`p-3 rounded-xl border-2 text-center text-sm transition-all ${form.needsCompanion === o.value ? "border-red-500 bg-red-50 font-bold" : "border-border"}`}>
                    <div>{o.label}</div>
                    <div className="text-xs text-muted-foreground">{o.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>ملاحظات للسائق</Label>
              <Textarea placeholder="معلومات إضافية مهمة عن حالة المريض..." value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} rows={2} />
            </div>

            <Button type="submit" className="w-full h-12 text-base font-bold bg-gradient-to-r from-red-500 to-rose-700" disabled={createRideMutation.isPending}>
              {createRideMutation.isPending ? "جاري الإرسال..." : "🏥 احجز رحلة النقل الطبي"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
