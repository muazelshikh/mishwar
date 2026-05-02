import { useState } from "react";
import { useRoute } from "wouter";
import { useGetInviteTripByCode, useRespondToInvite } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { MapPin, Calendar, Car, Users, CheckCircle2, XCircle, Share2 } from "lucide-react";

const VEHICLE_LABELS: Record<string, string> = {
  economy: "اقتصادية", comfort: "مريحة", xl: "كبيرة XL",
  van: "فان", bus: "حافلة", minibus: "ميني باص",
};

export default function InviteAccept() {
  const [, params] = useRoute("/invite/:code");
  const code = params?.code ?? "";
  const { data: trip, isLoading } = useGetInviteTripByCode(code);
  const respondMutation = useRespondToInvite();
  const { toast } = useToast();
  const [responded, setResponded] = useState(false);
  const [form, setForm] = useState({ name: "", phone: "", pickupAddress: "" });

  const handleRespond = async (response: "accepted" | "declined") => {
    if (response === "accepted" && (!form.name || !form.phone)) {
      toast({ title: "يرجى إدخال الاسم ورقم الجوال", variant: "destructive" });
      return;
    }
    await respondMutation.mutateAsync({
      inviteCode: code,
      data: { ...form, response },
    });
    toast({ title: response === "accepted" ? "تم قبول الدعوة!" : "تم رفض الدعوة" });
    setResponded(true);
  };

  if (isLoading) {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center bg-muted">
        <p className="text-muted-foreground">جاري التحميل...</p>
      </div>
    );
  }

  if (!trip) {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center bg-muted" dir="rtl">
        <Card className="max-w-sm w-full mx-4">
          <CardContent className="py-10 text-center">
            <XCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <h2 className="text-xl font-bold">رابط غير صالح</h2>
            <p className="text-muted-foreground mt-2">هذا الرابط غير صالح أو انتهت صلاحيته</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] bg-gradient-to-b from-primary/5 to-background flex items-center justify-center p-4" dir="rtl">
      <div className="w-full max-w-md space-y-4">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-black text-primary">مشوار</h1>
          <p className="text-muted-foreground mt-1">دعوة لرحلة خاصة</p>
        </div>

        {/* Trip Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Share2 className="h-5 w-5 text-primary" />
              {trip.title}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-2 text-sm">
              <MapPin className="h-4 w-4 text-primary shrink-0" />
              <div>
                <p className="font-medium">{trip.fromAddress}</p>
                <p className="text-muted-foreground">← {trip.toAddress}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4 text-primary shrink-0" />
              <span>{new Date(trip.scheduledAt).toLocaleString("ar-SA")}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Car className="h-4 w-4 text-primary shrink-0" />
              <span>{VEHICLE_LABELS[trip.vehicleType] ?? trip.vehicleType}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Users className="h-4 w-4 text-primary shrink-0" />
              <span>
                {trip.guests?.filter((g: any) => g.status === "accepted").length ?? 0} / {trip.maxGuests} مقعد محجوز
              </span>
            </div>
            {trip.notes && (
              <div className="bg-muted p-3 rounded-lg text-sm text-muted-foreground">
                {trip.notes}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Response form */}
        {responded ? (
          <Card>
            <CardContent className="py-10 text-center">
              <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-3" />
              <h3 className="text-xl font-bold">شكراً!</h3>
              <p className="text-muted-foreground mt-1">تم تسجيل ردك بنجاح</p>
            </CardContent>
          </Card>
        ) : trip.status !== "open" ? (
          <Card>
            <CardContent className="py-8 text-center">
              <p className="text-muted-foreground">هذه الرحلة لم تعد تقبل ردوداً</p>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>هل تريد المشاركة؟</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>الاسم *</Label>
                <Input placeholder="اسمك الكامل" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
              </div>
              <div>
                <Label>رقم الجوال *</Label>
                <Input placeholder="05XXXXXXXX" value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} />
              </div>
              <div>
                <Label>نقطة الالتقاط (اختياري)</Label>
                <Input placeholder="عنوان تريد الالتقاط منه" value={form.pickupAddress} onChange={e => setForm(p => ({ ...p, pickupAddress: e.target.value }))} />
              </div>
              <div className="flex gap-3">
                <Button className="flex-1" onClick={() => handleRespond("accepted")} disabled={respondMutation.isPending}>
                  قبول الدعوة
                </Button>
                <Button variant="outline" className="flex-1" onClick={() => handleRespond("declined")} disabled={respondMutation.isPending}>
                  رفض
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
