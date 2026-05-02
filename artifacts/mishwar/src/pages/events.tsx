import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useCreateRide } from "@workspace/api-client-react";
import { PartyPopper, Car, Users, MapPin, Clock } from "lucide-react";

const EVENT_TYPES = [
  { value: "wedding", label: "💒 حفل زفاف", desc: "سيارات فاخرة للعريس والعروس والضيوف" },
  { value: "graduation", label: "🎓 حفل تخرج", desc: "إيصال المتخرجين وذويهم" },
  { value: "birthday", label: "🎂 عيد ميلاد", desc: "سيارة مزينة مع سائق خاص" },
  { value: "conference", label: "🏛️ مؤتمر وفعالية", desc: "نقل المشاركين بين الفنادق والقاعات" },
  { value: "corporate", label: "💼 حفل شركة", desc: "نقل منظم للموظفين والضيوف" },
  { value: "vip", label: "👑 استقبال VIP", desc: "استقبال ضيوف مميزين بطابور سيارات" },
  { value: "airport", label: "✈️ نقل المطار", desc: "استقبال وتوديع ضيوف المناسبة" },
  { value: "other", label: "🎉 مناسبة أخرى", desc: "أي مناسبة خاصة بك" },
];

const VEHICLE_OPTIONS = [
  { value: "economy", label: "🚗 اقتصادية", capacity: "4 أشخاص", pricePerCar: 80 },
  { value: "comfort", label: "🚙 مريحة", capacity: "4 أشخاص", pricePerCar: 120 },
  { value: "xl", label: "🚐 فان كبيرة", capacity: "7 أشخاص", pricePerCar: 180 },
  { value: "luxury", label: "🏎️ فاخرة", capacity: "4 أشخاص", pricePerCar: 350 },
  { value: "limo", label: "🚘 ليموزين", capacity: "6 أشخاص", pricePerCar: 500 },
];

export default function Events() {
  const { toast } = useToast();
  const createRideMutation = useCreateRide();

  const [form, setForm] = useState({
    eventType: "",
    eventName: "",
    guestCount: "",
    carsNeeded: "1",
    vehiclePreference: "comfort",
    eventDate: "",
    eventTime: "",
    fromAddress: "",
    toAddress: "",
    decorations: "no",
    notes: "",
  });

  const selectedVehicle = VEHICLE_OPTIONS.find(v => v.value === form.vehiclePreference);
  const estimatedPrice = selectedVehicle ? selectedVehicle.pricePerCar * parseInt(form.carsNeeded || "1") : 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.eventType || !form.fromAddress || !form.toAddress) {
      toast({ title: "يرجى ملء الحقول المطلوبة", variant: "destructive" });
      return;
    }
    createRideMutation.mutate({
      data: {
        fromAddress: form.fromAddress,
        toAddress: form.toAddress,
        vehicleType: form.vehiclePreference === "luxury" || form.vehiclePreference === "limo" ? "comfort" : form.vehiclePreference as "economy" | "comfort" | "xl",
        scheduledAt: form.eventDate && form.eventTime ? `${form.eventDate}T${form.eventTime}` : undefined,
        notes: `خدمة مناسبات | النوع: ${form.eventType} | المناسبة: ${form.eventName} | الضيوف: ${form.guestCount} | السيارات: ${form.carsNeeded} (${form.vehiclePreference}) | تزيين: ${form.decorations === "yes" ? "نعم" : "لا"}${form.notes ? " | " + form.notes : ""}`,
      }
    }, {
      onSuccess: () => {
        toast({ title: "✅ تم استلام طلب المناسبة!", description: "سيتواصل معك منسق المناسبات قريباً" });
        setForm({ eventType: "", eventName: "", guestCount: "", carsNeeded: "1", vehiclePreference: "comfort", eventDate: "", eventTime: "", fromAddress: "", toAddress: "", decorations: "no", notes: "" });
      },
      onError: () => toast({ title: "حدث خطأ، حاول مرة أخرى", variant: "destructive" }),
    });
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-fuchsia-500 to-purple-700 flex items-center justify-center text-2xl shadow-lg">🎉</div>
        <div>
          <h1 className="text-2xl font-black">خدمة المناسبات</h1>
          <p className="text-muted-foreground text-sm">نجعل مناسبتك لا تُنسى — أعراس، تخرجات، مؤتمرات</p>
        </div>
      </div>

      <div className="space-y-2">
        <Label className="text-base font-bold">نوع المناسبة</Label>
        <div className="grid grid-cols-2 gap-3">
          {EVENT_TYPES.map(et => (
            <button key={et.value} type="button" onClick={() => setForm(f => ({ ...f, eventType: et.value }))}
              className={`p-3 rounded-xl border-2 text-right transition-all ${form.eventType === et.value ? "border-fuchsia-500 bg-fuchsia-50" : "border-border hover:border-fuchsia-200"}`}>
              <div className="font-bold text-sm">{et.label}</div>
              <div className="text-xs text-muted-foreground mt-0.5">{et.desc}</div>
            </button>
          ))}
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2"><PartyPopper className="h-5 w-5 text-fuchsia-500" /> تفاصيل المناسبة</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>اسم المناسبة</Label>
                <Input placeholder="زفاف أحمد وفاطمة..." value={form.eventName} onChange={e => setForm(p => ({ ...p, eventName: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <Label className="flex items-center gap-1"><Users className="h-3.5 w-3.5" /> عدد الضيوف</Label>
                <Input type="number" min="1" placeholder="عدد تقريبي" value={form.guestCount} onChange={e => setForm(p => ({ ...p, guestCount: e.target.value }))} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> تاريخ المناسبة</Label>
                <Input type="date" value={form.eventDate} onChange={e => setForm(p => ({ ...p, eventDate: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <Label>وقت المناسبة</Label>
                <Input type="time" value={form.eventTime} onChange={e => setForm(p => ({ ...p, eventTime: e.target.value }))} />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5 text-green-500" /> نقطة الانطلاق *</Label>
              <Input placeholder="الفندق، المنزل، أو القاعة" value={form.fromAddress} onChange={e => setForm(p => ({ ...p, fromAddress: e.target.value }))} />
            </div>

            <div className="space-y-1.5">
              <Label className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5 text-red-500" /> الوجهة *</Label>
              <Input placeholder="قاعة الأفراح، الفندق، المطار..." value={form.toAddress} onChange={e => setForm(p => ({ ...p, toAddress: e.target.value }))} />
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-1"><Car className="h-3.5 w-3.5" /> نوع السيارات</Label>
              <div className="space-y-2">
                {VEHICLE_OPTIONS.map(v => (
                  <button key={v.value} type="button" onClick={() => setForm(f => ({ ...f, vehiclePreference: v.value }))}
                    className={`w-full p-3 rounded-xl border-2 flex items-center justify-between text-sm transition-all ${form.vehiclePreference === v.value ? "border-fuchsia-500 bg-fuchsia-50 font-bold" : "border-border"}`}>
                    <div className="flex items-center gap-2">
                      <span>{v.label}</span>
                      <span className="text-xs text-muted-foreground">({v.capacity})</span>
                    </div>
                    <span className="font-bold text-fuchsia-600">{v.pricePerCar} ر.س/سيارة</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>عدد السيارات المطلوبة</Label>
                <Select value={form.carsNeeded} onValueChange={v => setForm(p => ({ ...p, carsNeeded: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"].map(n => (
                      <SelectItem key={n} value={n}>{n} سيارة{parseInt(n) > 2 ? "ات" : ""}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>تزيين السيارات</Label>
                <div className="grid grid-cols-2 gap-2">
                  {[{ value: "yes", label: "✅ نعم + 50 ر.س" }, { value: "no", label: "❌ لا" }].map(o => (
                    <button key={o.value} type="button" onClick={() => setForm(f => ({ ...f, decorations: o.value }))}
                      className={`p-2 rounded-lg border-2 text-center text-xs transition-all ${form.decorations === o.value ? "border-fuchsia-500 bg-fuchsia-50 font-bold" : "border-border"}`}>
                      {o.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>تعليمات خاصة</Label>
              <Textarea placeholder="تفاصيل إضافية، ألوان التزيين، بروتوكول الاستقبال..." value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} rows={2} />
            </div>

            {estimatedPrice > 0 && (
              <div className="bg-fuchsia-50 rounded-xl p-4 flex items-center justify-between border border-fuchsia-200">
                <div>
                  <div className="font-bold text-fuchsia-800">تقدير إجمالي</div>
                  <div className="text-xs text-fuchsia-600">{form.carsNeeded} سيارة × {selectedVehicle?.pricePerCar} ر.س{form.decorations === "yes" ? " + 50 تزيين" : ""}</div>
                </div>
                <div className="text-xl font-black text-fuchsia-700">
                  {estimatedPrice + (form.decorations === "yes" ? 50 : 0)} <span className="text-sm font-normal">ر.س</span>
                </div>
              </div>
            )}

            <Button type="submit" className="w-full h-12 text-base font-bold bg-gradient-to-r from-fuchsia-500 to-purple-700" disabled={createRideMutation.isPending}>
              {createRideMutation.isPending ? "جاري الإرسال..." : "🎉 احجز خدمة المناسبة"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
