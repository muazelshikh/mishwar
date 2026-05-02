import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useCreateRide } from "@workspace/api-client-react";
import { Package, MapPin, Zap, DollarSign } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const DELIVERY_TYPES = [
  { value: "food", label: "🍔 طعام ومطاعم", price: 10 },
  { value: "grocery", label: "🛒 بقالة وسوبرماركت", price: 12 },
  { value: "package", label: "📦 طرد وشحنة", price: 15 },
  { value: "document", label: "📄 وثائق وأوراق رسمية", price: 20 },
  { value: "medicine", label: "💊 أدوية وصيدلية", price: 12 },
  { value: "flowers", label: "🌸 ورود وهدايا", price: 18 },
  { value: "other", label: "📫 أخرى", price: 15 },
];

export default function Delivery() {
  const { toast } = useToast();
  const createRideMutation = useCreateRide();

  const [form, setForm] = useState({
    deliveryType: "",
    fromAddress: "",
    toAddress: "",
    recipientName: "",
    recipientPhone: "",
    description: "",
    priority: "normal",
  });

  const selectedType = DELIVERY_TYPES.find(t => t.value === form.deliveryType);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.deliveryType || !form.fromAddress || !form.toAddress) {
      toast({ title: "يرجى ملء جميع الحقول المطلوبة", variant: "destructive" });
      return;
    }
    createRideMutation.mutate({
      data: {
        fromAddress: form.fromAddress,
        toAddress: form.toAddress,
        vehicleType: "economy",
        notes: `توصيل: ${selectedType?.label} | المستلم: ${form.recipientName} (${form.recipientPhone}) | ${form.priority === "express" ? "⚡ عاجل" : "عادي"} | ${form.description}`,
      }
    }, {
      onSuccess: () => {
        toast({ title: "✅ تم استلام طلب التوصيل!", description: "سيصلك مندوب خلال دقائق" });
        setForm({ deliveryType: "", fromAddress: "", toAddress: "", recipientName: "", recipientPhone: "", description: "", priority: "normal" });
      },
      onError: () => toast({ title: "حدث خطأ، حاول مرة أخرى", variant: "destructive" }),
    });
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-yellow-600 flex items-center justify-center text-2xl shadow-lg">📦</div>
        <div>
          <h1 className="text-2xl font-black">خدمات التوصيل</h1>
          <p className="text-muted-foreground text-sm">طعام، طرود، بقالة، وثائق — نوصّل كل شيء</p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[{ label: "أسرع توصيل", value: "15 دقيقة", icon: "⚡" }, { label: "متاح", value: "24/7", icon: "🕐" }, { label: "التتبع", value: "مباشر", icon: "📍" }, { label: "التأمين", value: "مشمول", icon: "🛡️" }].map(stat => (
          <Card key={stat.label} className="text-center p-3 border-amber-100">
            <div className="text-xl">{stat.icon}</div>
            <div className="font-bold text-sm mt-1">{stat.value}</div>
            <div className="text-xs text-muted-foreground">{stat.label}</div>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2"><Package className="h-5 w-5 text-amber-500" /> تفاصيل الطلب</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <Label>نوع التوصيل *</Label>
              <div className="grid grid-cols-2 gap-2">
                {DELIVERY_TYPES.map(type => (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => setForm(p => ({ ...p, deliveryType: type.value }))}
                    className={`p-3 rounded-xl border-2 text-right text-sm transition-all ${form.deliveryType === type.value ? "border-amber-500 bg-amber-50 font-semibold" : "border-border hover:border-amber-200"}`}
                  >
                    <div>{type.label}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">يبدأ من {type.price} ر.س</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5 text-green-500" /> عنوان الاستلام *</Label>
              <Input placeholder="المطعم، المتجر، أو العنوان" value={form.fromAddress} onChange={e => setForm(p => ({ ...p, fromAddress: e.target.value }))} />
            </div>

            <div className="space-y-1.5">
              <Label className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5 text-red-500" /> عنوان التسليم *</Label>
              <Input placeholder="عنوان المستلم" value={form.toAddress} onChange={e => setForm(p => ({ ...p, toAddress: e.target.value }))} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>اسم المستلم</Label>
                <Input placeholder="اسم المستلم" value={form.recipientName} onChange={e => setForm(p => ({ ...p, recipientName: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <Label>هاتف المستلم</Label>
                <Input placeholder="05XXXXXXXX" value={form.recipientPhone} onChange={e => setForm(p => ({ ...p, recipientPhone: e.target.value }))} />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="flex items-center gap-1"><Zap className="h-3.5 w-3.5" /> الأولوية</Label>
              <div className="grid grid-cols-2 gap-3">
                {[{ value: "normal", label: "عادي", desc: "30-45 دقيقة", extra: "" }, { value: "express", label: "⚡ عاجل", desc: "15-20 دقيقة", extra: "+ 5 ر.س" }].map(p => (
                  <button key={p.value} type="button" onClick={() => setForm(f => ({ ...f, priority: p.value }))}
                    className={`p-3 rounded-xl border-2 text-right text-sm transition-all ${form.priority === p.value ? "border-amber-500 bg-amber-50 font-bold" : "border-border"}`}>
                    <div>{p.label}</div>
                    <div className="text-xs text-muted-foreground">{p.desc} {p.extra && <Badge variant="outline" className="text-xs ml-1">{p.extra}</Badge>}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>وصف الطلب</Label>
              <Textarea placeholder="تفاصيل المحتوى أو تعليمات خاصة للمندوب..." value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} rows={2} />
            </div>

            {selectedType && (
              <div className="bg-amber-50 rounded-xl p-4 flex items-center justify-between">
                <div className="text-sm text-amber-800">
                  <strong>تقدير السعر</strong><br />
                  <span className="text-xs">{form.priority === "express" ? "يشمل رسوم الخدمة العاجلة" : "سعر التوصيل العادي"}</span>
                </div>
                <div className="text-xl font-black text-amber-600 flex items-center gap-1">
                  <DollarSign className="h-5 w-5" />
                  {form.priority === "express" ? selectedType.price + 5 : selectedType.price}
                  <span className="text-sm font-normal">ر.س</span>
                </div>
              </div>
            )}

            <Button type="submit" className="w-full h-12 text-base font-bold bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700" disabled={createRideMutation.isPending}>
              {createRideMutation.isPending ? "جاري الإرسال..." : "📦 اطلب التوصيل الآن"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
