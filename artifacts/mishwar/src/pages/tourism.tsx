import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useCreateRide } from "@workspace/api-client-react";
import { MapPin, Users, Calendar, Star } from "lucide-react";

const DESTINATIONS = [
  { id: "neom", name: "نيوم & تبوك", icon: "🏗️", desc: "مدينة المستقبل ورؤية 2030" },
  { id: "alula", name: "العُلا", icon: "🏛️", desc: "الحجر وهيغرا والمدائن" },
  { id: "asir", name: "عسير & أبها", icon: "⛰️", desc: "الجبال والشلالات والهواء النقي" },
  { id: "diriyah", name: "الدرعية", icon: "🏰", desc: "منبع الدولة السعودية التاريخي" },
  { id: "riyadh_tour", name: "الرياض السياحية", icon: "🏙️", desc: "المسمك، مركز الملك عبدالله، موسم" },
  { id: "jeddah_hist", name: "جدة التاريخية", icon: "🌊", desc: "البلد والكورنيش والأسواق القديمة" },
  { id: "taif", name: "الطائف", icon: "🌹", desc: "مدينة الورد والفاكهة" },
  { id: "custom", name: "وجهة مخصصة", icon: "🗺️", desc: "اكتب وجهتك في الملاحظات" },
];

const TRIP_TYPES = [
  { value: "day_trip", label: "رحلة يومية", duration: "يوم واحد" },
  { value: "weekend", label: "عطلة نهاية الأسبوع", duration: "يومان" },
  { value: "week", label: "رحلة أسبوع", duration: "5-7 أيام" },
  { value: "custom", label: "مدة مخصصة", duration: "حسب طلبك" },
];

export default function Tourism() {
  const { toast } = useToast();
  const createRideMutation = useCreateRide();

  const [form, setForm] = useState({
    destination: "",
    tripType: "",
    groupSize: "2",
    startDate: "",
    guide: "yes",
    fromCity: "",
    preferences: "",
    notes: "",
  });

  const selectedDest = DESTINATIONS.find(d => d.id === form.destination);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.destination || !form.fromCity) {
      toast({ title: "يرجى اختيار الوجهة ومدينة الانطلاق", variant: "destructive" });
      return;
    }
    createRideMutation.mutate({
      data: {
        fromAddress: form.fromCity,
        toAddress: selectedDest?.name || form.destination,
        vehicleType: parseInt(form.groupSize) > 4 ? "xl" : "comfort",
        scheduledAt: form.startDate || undefined,
        notes: `رحلة سياحية | الوجهة: ${selectedDest?.name} | المجموعة: ${form.groupSize} أشخاص | النوع: ${form.tripType} | مرشد: ${form.guide === "yes" ? "نعم" : "لا"} | التفضيلات: ${form.preferences}${form.notes ? " | " + form.notes : ""}`,
      }
    }, {
      onSuccess: () => {
        toast({ title: "✅ تم استلام طلب الرحلة السياحية!", description: "سيرسل لك المنسق عرض سعر مفصل" });
        setForm({ destination: "", tripType: "", groupSize: "2", startDate: "", guide: "yes", fromCity: "", preferences: "", notes: "" });
      },
      onError: () => toast({ title: "حدث خطأ، حاول مرة أخرى", variant: "destructive" }),
    });
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-sky-500 to-blue-600 flex items-center justify-center text-2xl shadow-lg">🌴</div>
        <div>
          <h1 className="text-2xl font-black">الرحلات السياحية</h1>
          <p className="text-muted-foreground text-sm">جولات سياحية منظمة مع مرشد متخصص</p>
        </div>
      </div>

      <div className="space-y-2">
        <Label className="text-base font-bold">اختر الوجهة السياحية</Label>
        <div className="grid grid-cols-2 gap-3">
          {DESTINATIONS.map(dest => (
            <button key={dest.id} type="button" onClick={() => setForm(f => ({ ...f, destination: dest.id }))}
              className={`p-4 rounded-xl border-2 text-right transition-all ${form.destination === dest.id ? "border-sky-500 bg-sky-50" : "border-border hover:border-sky-200"}`}>
              <div className="text-2xl mb-1">{dest.icon}</div>
              <div className="font-bold text-sm">{dest.name}</div>
              <div className="text-xs text-muted-foreground mt-0.5">{dest.desc}</div>
            </button>
          ))}
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2"><MapPin className="h-5 w-5 text-sky-500" /> تفاصيل الرحلة</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <Label>نوع الرحلة</Label>
              <div className="grid grid-cols-2 gap-3">
                {TRIP_TYPES.map(t => (
                  <button key={t.value} type="button" onClick={() => setForm(f => ({ ...f, tripType: t.value }))}
                    className={`p-3 rounded-xl border-2 text-right text-sm transition-all ${form.tripType === t.value ? "border-sky-500 bg-sky-50 font-bold" : "border-border"}`}>
                    <div>{t.label}</div>
                    <div className="text-xs text-muted-foreground">{t.duration}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="flex items-center gap-1"><Users className="h-3.5 w-3.5" /> حجم المجموعة</Label>
                <Select value={form.groupSize} onValueChange={v => setForm(p => ({ ...p, groupSize: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {["1", "2", "3", "4", "5", "6", "7", "8+"].map(n => (
                      <SelectItem key={n} value={n}>{n} {parseInt(n) === 1 ? "شخص" : "أشخاص"}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" /> تاريخ البداية</Label>
                <Input type="date" value={form.startDate} onChange={e => setForm(p => ({ ...p, startDate: e.target.value }))} />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5 text-green-500" /> مدينة الانطلاق *</Label>
              <Input placeholder="الرياض، جدة، الدمام..." value={form.fromCity} onChange={e => setForm(p => ({ ...p, fromCity: e.target.value }))} />
            </div>

            <div className="space-y-1.5">
              <Label className="flex items-center gap-1"><Star className="h-3.5 w-3.5" /> هل تحتاج مرشداً سياحياً؟</Label>
              <div className="grid grid-cols-2 gap-3">
                {[{ value: "yes", label: "✅ نعم", desc: "مرشد معتمد يشرح التاريخ والمواقع" }, { value: "no", label: "🚗 لا", desc: "سائق فقط بدون مرشد" }].map(o => (
                  <button key={o.value} type="button" onClick={() => setForm(f => ({ ...f, guide: o.value }))}
                    className={`p-3 rounded-xl border-2 text-right text-sm transition-all ${form.guide === o.value ? "border-sky-500 bg-sky-50 font-bold" : "border-border"}`}>
                    <div>{o.label}</div>
                    <div className="text-xs text-muted-foreground">{o.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>تفضيلاتك</Label>
              <div className="flex flex-wrap gap-2">
                {["تاريخ وثقافة", "طبيعة وجبال", "شواطئ وبحر", "مطاعم وطعام", "تسوق", "مغامرة", "عائلي", "رومانسي"].map(pref => (
                  <button key={pref} type="button"
                    onClick={() => setForm(f => ({ ...f, preferences: f.preferences.includes(pref) ? f.preferences.replace(pref, "").replace("،،", "،").trim() : f.preferences ? f.preferences + "، " + pref : pref }))}
                    className={`px-3 py-1.5 rounded-full text-sm border transition-all ${form.preferences.includes(pref) ? "bg-sky-500 text-white border-sky-500" : "border-border hover:border-sky-300"}`}>
                    {pref}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>ملاحظات وطلبات خاصة</Label>
              <Textarea placeholder="أي طلبات أو متطلبات خاصة لرحلتك..." value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} rows={2} />
            </div>

            <Button type="submit" className="w-full h-12 text-base font-bold bg-gradient-to-r from-sky-500 to-blue-600" disabled={createRideMutation.isPending}>
              {createRideMutation.isPending ? "جاري الإرسال..." : "🌴 احجز رحلتك السياحية"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
