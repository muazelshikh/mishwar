import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useCreateRide } from "@workspace/api-client-react";
import { Heart, Phone, User, MapPin, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function LovedOnes() {
  const { toast } = useToast();
  const createRideMutation = useCreateRide();

  const [form, setForm] = useState({
    beneficiaryName: "",
    beneficiaryPhone: "",
    relation: "",
    fromAddress: "",
    toAddress: "",
    scheduledAt: "",
    notes: "",
    vehicleType: "economy" as "economy" | "comfort" | "xl",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.beneficiaryName || !form.beneficiaryPhone || !form.fromAddress || !form.toAddress) {
      toast({ title: "يرجى ملء جميع الحقول المطلوبة", variant: "destructive" });
      return;
    }
    createRideMutation.mutate({
      data: {
        fromAddress: form.fromAddress,
        toAddress: form.toAddress,
        vehicleType: form.vehicleType,
        scheduledAt: form.scheduledAt || undefined,
        notes: `خدمة أحبابك | المستفيد: ${form.beneficiaryName} (${form.relation}) | هاتف: ${form.beneficiaryPhone}${form.notes ? " | ملاحظات: " + form.notes : ""}`,
      }
    }, {
      onSuccess: () => {
        toast({ title: "✅ تم إرسال طلبك بنجاح!", description: `سنوصّل ${form.beneficiaryName} بأمان` });
        setForm({ beneficiaryName: "", beneficiaryPhone: "", relation: "", fromAddress: "", toAddress: "", scheduledAt: "", notes: "", vehicleType: "economy" });
      },
      onError: () => toast({ title: "حدث خطأ، حاول مرة أخرى", variant: "destructive" }),
    });
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center text-2xl shadow-lg">❤️</div>
        <div>
          <h1 className="text-2xl font-black">أحبابك</h1>
          <p className="text-muted-foreground text-sm">نوصّل أهلك في الوطن وأنت في الخارج</p>
        </div>
        <Badge className="mr-auto bg-pink-100 text-pink-700 border-0">للمغتربين</Badge>
      </div>

      <Card className="border-pink-100">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2"><Heart className="h-5 w-5 text-pink-500" /> بيانات المستفيد</CardTitle>
          <CardDescription>من تريد أن نوصّله؟</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="flex items-center gap-1"><User className="h-3.5 w-3.5" /> اسم المستفيد *</Label>
                <Input placeholder="مثال: والدتي فاطمة" value={form.beneficiaryName} onChange={e => setForm(p => ({ ...p, beneficiaryName: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <Label className="flex items-center gap-1"><Phone className="h-3.5 w-3.5" /> رقم هاتفه *</Label>
                <Input placeholder="05XXXXXXXX" value={form.beneficiaryPhone} onChange={e => setForm(p => ({ ...p, beneficiaryPhone: e.target.value }))} />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>صلة القرابة</Label>
              <Select value={form.relation} onValueChange={v => setForm(p => ({ ...p, relation: v }))}>
                <SelectTrigger><SelectValue placeholder="اختر صلة القرابة" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="والد">والد</SelectItem>
                  <SelectItem value="والدة">والدة</SelectItem>
                  <SelectItem value="أخ">أخ</SelectItem>
                  <SelectItem value="أخت">أخت</SelectItem>
                  <SelectItem value="زوجة">زوجة</SelectItem>
                  <SelectItem value="ابن/ابنة">ابن/ابنة</SelectItem>
                  <SelectItem value="جد/جدة">جد/جدة</SelectItem>
                  <SelectItem value="قريب">قريب آخر</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5 text-green-500" /> نقطة الانطلاق *</Label>
              <Input placeholder="العنوان أو الحي" value={form.fromAddress} onChange={e => setForm(p => ({ ...p, fromAddress: e.target.value }))} />
            </div>

            <div className="space-y-1.5">
              <Label className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5 text-red-500" /> الوجهة *</Label>
              <Input placeholder="المستشفى، المطار، الوجهة..." value={form.toAddress} onChange={e => setForm(p => ({ ...p, toAddress: e.target.value }))} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> موعد الرحلة</Label>
                <Input type="datetime-local" value={form.scheduledAt} onChange={e => setForm(p => ({ ...p, scheduledAt: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <Label>نوع السيارة</Label>
                <Select value={form.vehicleType} onValueChange={v => setForm(p => ({ ...p, vehicleType: v as "economy" | "comfort" | "xl" }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="economy">🚗 اقتصادية</SelectItem>
                    <SelectItem value="comfort">🚙 مريحة</SelectItem>
                    <SelectItem value="xl">🚐 كبيرة</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>ملاحظات إضافية</Label>
              <Textarea placeholder="أي تعليمات للسائق عن المستفيد..." value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} rows={3} />
            </div>

            <div className="bg-pink-50 rounded-xl p-4 text-sm text-pink-800">
              <strong>💡 كيف تعمل الخدمة؟</strong>
              <ul className="mt-2 space-y-1 list-disc list-inside text-pink-700">
                <li>ستصلك رسالة واتساب بتأكيد الحجز</li>
                <li>سنتصل بالمستفيد قبل 15 دقيقة من وصول السائق</li>
                <li>سترى تتبعاً مباشراً للرحلة</li>
              </ul>
            </div>

            <Button type="submit" className="w-full h-12 text-base font-bold bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700" disabled={createRideMutation.isPending}>
              {createRideMutation.isPending ? "جاري الإرسال..." : "❤️ احجز للمستفيد"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
