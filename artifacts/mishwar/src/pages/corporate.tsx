import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Building2, Users, FileText, CheckCircle } from "lucide-react";

const PLANS = [
  {
    id: "starter",
    name: "Starter",
    label: "مبتدئ",
    employees: "حتى 20 موظف",
    price: "2,500",
    features: ["20 رحلة يومية", "تقارير شهرية", "دعم عبر الواتساب"],
    color: "from-slate-400 to-gray-500",
  },
  {
    id: "business",
    name: "Business",
    label: "أعمال",
    employees: "حتى 100 موظف",
    price: "8,000",
    features: ["100 رحلة يومية", "تقارير أسبوعية", "مدير حساب مخصص", "فواتير شهرية"],
    color: "from-blue-500 to-indigo-600",
    recommended: true,
  },
  {
    id: "enterprise",
    name: "Enterprise",
    label: "مؤسسي",
    employees: "غير محدود",
    price: "تسعير خاص",
    features: ["رحلات غير محدودة", "تكامل مع ERP", "SLA مضمون 99.9%", "فريق دعم مخصص"],
    color: "from-purple-600 to-violet-700",
  },
];

export default function Corporate() {
  const { toast } = useToast();
  const [submitted, setSubmitted] = useState(false);

  const [form, setForm] = useState({
    companyName: "",
    contactName: "",
    contactPhone: "",
    contactEmail: "",
    employeeCount: "",
    sector: "",
    selectedPlan: "",
    requirements: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.companyName || !form.contactName || !form.contactPhone) {
      toast({ title: "يرجى ملء البيانات المطلوبة", variant: "destructive" });
      return;
    }
    setTimeout(() => {
      setSubmitted(true);
      toast({ title: "✅ تم استلام طلبك!", description: "سيتواصل معك فريق المبيعات خلال 24 ساعة" });
    }, 800);
  };

  if (submitted) {
    return (
      <div className="max-w-lg mx-auto text-center py-20 space-y-4">
        <div className="text-6xl">🏢</div>
        <h2 className="text-2xl font-black">تم استلام طلبك!</h2>
        <p className="text-muted-foreground">سيتواصل معك فريق المبيعات خلال ساعات العمل الرسمية لمناقشة الحل المناسب لمؤسستك.</p>
        <div className="bg-blue-50 rounded-xl p-4 text-sm text-blue-700">
          <strong>ما يحدث الآن:</strong>
          <ul className="mt-2 space-y-1 list-disc list-inside text-right">
            <li>تحليل احتياجات شركتك</li>
            <li>إعداد عرض سعر مخصص</li>
            <li>جدولة اجتماع تعريفي</li>
          </ul>
        </div>
        <Button onClick={() => setSubmitted(false)} variant="outline">إرسال طلب آخر</Button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-slate-600 to-gray-700 flex items-center justify-center text-2xl shadow-lg">🏢</div>
        <div>
          <h1 className="text-2xl font-black">العقود المؤسسية</h1>
          <p className="text-muted-foreground text-sm">حلول نقل متكاملة للشركات والمؤسسات الحكومية والخاصة</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {PLANS.map(plan => (
          <button
            key={plan.id}
            type="button"
            onClick={() => setForm(f => ({ ...f, selectedPlan: plan.id }))}
            className={`relative rounded-2xl p-5 text-right border-2 transition-all ${form.selectedPlan === plan.id ? "border-blue-500 shadow-lg scale-105" : "border-border hover:border-blue-200"}`}
          >
            {plan.recommended && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-xs px-3 py-0.5 rounded-full font-bold">الأكثر طلباً</div>
            )}
            <div className={`h-1.5 w-full rounded-full bg-gradient-to-r ${plan.color} mb-3`} />
            <div className="font-black text-lg">{plan.label}</div>
            <div className="text-xs text-muted-foreground mb-3">{plan.employees}</div>
            <div className="text-xl font-black text-primary mb-3">
              {plan.price === "تسعير خاص" ? <span className="text-base">تسعير خاص</span> : <><span>{plan.price}</span> <span className="text-sm font-normal text-muted-foreground">ر.س/شهر</span></>}
            </div>
            <ul className="space-y-1.5">
              {plan.features.map(f => (
                <li key={f} className="flex items-center gap-1.5 text-xs">
                  <CheckCircle className="h-3.5 w-3.5 text-green-500 shrink-0" />
                  <span>{f}</span>
                </li>
              ))}
            </ul>
          </button>
        ))}
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2"><FileText className="h-5 w-5 text-slate-600" /> بيانات التواصل</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="flex items-center gap-1"><Building2 className="h-3.5 w-3.5" /> اسم الشركة / المؤسسة *</Label>
                <Input placeholder="الاسم الرسمي" value={form.companyName} onChange={e => setForm(p => ({ ...p, companyName: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <Label>قطاع النشاط</Label>
                <Select value={form.sector} onValueChange={v => setForm(p => ({ ...p, sector: v }))}>
                  <SelectTrigger><SelectValue placeholder="اختر القطاع" /></SelectTrigger>
                  <SelectContent>
                    {["حكومي", "نفط وطاقة", "بناء ومقاولات", "صحة وصيدلة", "تعليم", "مال وبنوك", "تجزئة وتجارة", "تقنية", "سياحة وضيافة", "آخر"].map(s => (
                      <SelectItem key={s} value={s}>{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="flex items-center gap-1"><Users className="h-3.5 w-3.5" /> عدد الموظفين</Label>
                <Select value={form.employeeCount} onValueChange={v => setForm(p => ({ ...p, employeeCount: v }))}>
                  <SelectTrigger><SelectValue placeholder="النطاق التقريبي" /></SelectTrigger>
                  <SelectContent>
                    {["1-20", "21-50", "51-100", "101-500", "501-1000", "أكثر من 1000"].map(c => (
                      <SelectItem key={c} value={c}>{c} موظف</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>الباقة المهتم بها</Label>
                <Select value={form.selectedPlan} onValueChange={v => setForm(p => ({ ...p, selectedPlan: v }))}>
                  <SelectTrigger><SelectValue placeholder="اختر الباقة" /></SelectTrigger>
                  <SelectContent>
                    {PLANS.map(plan => <SelectItem key={plan.id} value={plan.id}>{plan.label}</SelectItem>)}
                    <SelectItem value="custom">باقة مخصصة</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>اسم المسؤول *</Label>
                <Input placeholder="الاسم الكامل" value={form.contactName} onChange={e => setForm(p => ({ ...p, contactName: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <Label>رقم الجوال *</Label>
                <Input placeholder="05XXXXXXXX" value={form.contactPhone} onChange={e => setForm(p => ({ ...p, contactPhone: e.target.value }))} />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>البريد الإلكتروني</Label>
              <Input type="email" placeholder="company@example.com" value={form.contactEmail} onChange={e => setForm(p => ({ ...p, contactEmail: e.target.value }))} />
            </div>

            <div className="space-y-1.5">
              <Label>متطلبات خاصة أو استفسارات</Label>
              <Textarea placeholder="صِف احتياجات شركتك بالتفصيل..." value={form.requirements} onChange={e => setForm(p => ({ ...p, requirements: e.target.value }))} rows={3} />
            </div>

            <Button type="submit" className="w-full h-12 text-base font-bold bg-gradient-to-r from-slate-600 to-gray-700">
              🏢 أرسل طلب العرض التجاري
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
