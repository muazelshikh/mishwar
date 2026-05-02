import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useCreateRide } from "@workspace/api-client-react";
import { GraduationCap, Shield, MapPin, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function SchoolTransport() {
  const { toast } = useToast();
  const createRideMutation = useCreateRide();

  const [form, setForm] = useState({
    studentName: "",
    grade: "",
    schoolName: "",
    homeAddress: "",
    schoolAddress: "",
    scheduleType: "",
    morningTime: "",
    afternoonTime: "",
    notes: "",
    vehicleType: "economy" as "economy" | "comfort" | "xl",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.studentName || !form.schoolName || !form.homeAddress || !form.schoolAddress) {
      toast({ title: "يرجى ملء جميع الحقول المطلوبة", variant: "destructive" });
      return;
    }
    createRideMutation.mutate({
      data: {
        fromAddress: form.homeAddress,
        toAddress: form.schoolAddress,
        vehicleType: form.vehicleType,
        notes: `نقل مدرسي | الطالب: ${form.studentName} (${form.grade}) | المدرسة: ${form.schoolName} | الجدول: ${form.scheduleType} | صباح: ${form.morningTime} | ظهر: ${form.afternoonTime}${form.notes ? " | " + form.notes : ""}`,
      }
    }, {
      onSuccess: () => {
        toast({ title: "✅ تم تسجيل طلب النقل المدرسي!", description: "سيتواصل معك فريقنا خلال ساعة" });
        setForm({ studentName: "", grade: "", schoolName: "", homeAddress: "", schoolAddress: "", scheduleType: "", morningTime: "", afternoonTime: "", notes: "", vehicleType: "economy" });
      },
      onError: () => toast({ title: "حدث خطأ، حاول مرة أخرى", variant: "destructive" }),
    });
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-2xl shadow-lg">🎒</div>
        <div>
          <h1 className="text-2xl font-black">النقل المدرسي</h1>
          <p className="text-muted-foreground text-sm">إيصال أمان للأبناء كل يوم دراسي</p>
        </div>
        <Badge className="mr-auto bg-green-100 text-green-700 border-0">سائقون معتمدون</Badge>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { icon: "🛡️", label: "سائقون معتمدون", sub: "فحص دقيق" },
          { icon: "📍", label: "تتبع مباشر", sub: "للوالدين" },
          { icon: "📞", label: "تنبيهات فورية", sub: "عند الوصول" },
          { icon: "🔒", label: "تأمين شامل", sub: "على الطلاب" },
        ].map(f => (
          <Card key={f.label} className="text-center p-3 border-green-100">
            <div className="text-xl">{f.icon}</div>
            <div className="font-bold text-sm mt-1">{f.label}</div>
            <div className="text-xs text-muted-foreground">{f.sub}</div>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2"><GraduationCap className="h-5 w-5 text-green-500" /> بيانات الطالب</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>اسم الطالب *</Label>
                <Input placeholder="الاسم الكامل" value={form.studentName} onChange={e => setForm(p => ({ ...p, studentName: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <Label>الصف الدراسي</Label>
                <Select value={form.grade} onValueChange={v => setForm(p => ({ ...p, grade: v }))}>
                  <SelectTrigger><SelectValue placeholder="اختر الصف" /></SelectTrigger>
                  <SelectContent>
                    {["الأول الابتدائي", "الثاني الابتدائي", "الثالث الابتدائي", "الرابع الابتدائي", "الخامس الابتدائي", "السادس الابتدائي",
                      "الأول المتوسط", "الثاني المتوسط", "الثالث المتوسط",
                      "الأول الثانوي", "الثاني الثانوي", "الثالث الثانوي"].map(g => (
                      <SelectItem key={g} value={g}>{g}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>اسم المدرسة *</Label>
              <Input placeholder="مدرسة / مجمع..." value={form.schoolName} onChange={e => setForm(p => ({ ...p, schoolName: e.target.value }))} />
            </div>

            <div className="space-y-1.5">
              <Label className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5 text-green-500" /> عنوان المنزل *</Label>
              <Input placeholder="الحي والشارع" value={form.homeAddress} onChange={e => setForm(p => ({ ...p, homeAddress: e.target.value }))} />
            </div>

            <div className="space-y-1.5">
              <Label className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5 text-red-500" /> عنوان المدرسة *</Label>
              <Input placeholder="موقع المدرسة" value={form.schoolAddress} onChange={e => setForm(p => ({ ...p, schoolAddress: e.target.value }))} />
            </div>

            <div className="space-y-1.5">
              <Label>نوع الاشتراك</Label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { value: "morning_only", label: "ذهاب فقط", price: "200 ر.س/شهر" },
                  { value: "afternoon_only", label: "عودة فقط", price: "200 ر.س/شهر" },
                  { value: "both", label: "ذهاب وعودة", price: "350 ر.س/شهر" },
                ].map(s => (
                  <button key={s.value} type="button" onClick={() => setForm(f => ({ ...f, scheduleType: s.value }))}
                    className={`p-3 rounded-xl border-2 text-center text-sm transition-all ${form.scheduleType === s.value ? "border-green-500 bg-green-50 font-bold" : "border-border"}`}>
                    <div>{s.label}</div>
                    <div className="text-xs text-muted-foreground mt-1">{s.price}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> وقت الذهاب</Label>
                <Input type="time" value={form.morningTime} onChange={e => setForm(p => ({ ...p, morningTime: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <Label className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> وقت العودة</Label>
                <Input type="time" value={form.afternoonTime} onChange={e => setForm(p => ({ ...p, afternoonTime: e.target.value }))} />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>ملاحظات خاصة</Label>
              <Textarea placeholder="أي تعليمات خاصة (احتياجات خاصة، ملاحظات أمان، إلخ)..." value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} rows={2} />
            </div>

            <div className="bg-green-50 rounded-xl p-4 text-sm text-green-800">
              <strong>🛡️ ضمانات الأمان:</strong>
              <ul className="mt-1 space-y-0.5 list-disc list-inside text-green-700 text-xs">
                <li>السائقون يخضعون لفحص شرطي وجنائي</li>
                <li>سيارات مرخصة ومؤمّنة بالكامل</li>
                <li>يُخطر ولي الأمر فور الوصول والمغادرة</li>
              </ul>
            </div>

            <Button type="submit" className="w-full h-12 text-base font-bold bg-gradient-to-r from-green-500 to-emerald-600" disabled={createRideMutation.isPending}>
              {createRideMutation.isPending ? "جاري الإرسال..." : "🎒 سجّل طلب النقل المدرسي"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
