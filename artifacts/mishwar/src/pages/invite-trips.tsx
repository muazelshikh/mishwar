import { useState } from "react";
import { useListInviteTrips, useCreateInviteTrip } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Plus, MapPin, Calendar, Users, Copy, Share2, CheckCircle2, Clock, XCircle } from "lucide-react";
import { Link } from "wouter";

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  open: { label: "مفتوحة", color: "bg-green-100 text-green-800" },
  confirmed: { label: "مؤكدة", color: "bg-blue-100 text-blue-800" },
  completed: { label: "مكتملة", color: "bg-gray-100 text-gray-800" },
  cancelled: { label: "ملغية", color: "bg-red-100 text-red-800" },
};

export default function InviteTrips() {
  const { data, refetch } = useListInviteTrips();
  const createMutation = useCreateInviteTrip();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    title: "",
    fromAddress: "",
    toAddress: "",
    vehicleType: "economy",
    scheduledAt: "",
    maxGuests: "4",
    notes: "",
  });

  const trips = data?.items ?? [];

  const handleCreate = async () => {
    if (!form.title || !form.fromAddress || !form.toAddress || !form.scheduledAt) {
      toast({ title: "يرجى ملء جميع الحقول المطلوبة", variant: "destructive" });
      return;
    }
    await createMutation.mutateAsync({
      data: {
        ...form,
        vehicleType: form.vehicleType as "economy" | "comfort" | "xl" | "bus" | "van" | "minibus",
        maxGuests: parseInt(form.maxGuests),
        scheduledAt: new Date(form.scheduledAt).toISOString() as unknown as string,
      },
    });
    toast({ title: "تم إنشاء رحلة الدعوة بنجاح!" });
    setOpen(false);
    refetch();
    setForm({ title: "", fromAddress: "", toAddress: "", vehicleType: "economy", scheduledAt: "", maxGuests: "4", notes: "" });
  };

  const copyLink = (code: string) => {
    const url = `${window.location.origin}/invite/${code}`;
    navigator.clipboard.writeText(url);
    toast({ title: "تم نسخ رابط الدعوة!" });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-foreground">رحلات الدعوة</h1>
          <p className="text-muted-foreground mt-1">أنشئ رحلة وادعو أصدقاءك برابط خاص</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              رحلة دعوة جديدة
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg" dir="rtl">
            <DialogHeader>
              <DialogTitle>إنشاء رحلة دعوة</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>عنوان الرحلة *</Label>
                <Input placeholder="مثال: رحلة للمطار" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} />
              </div>
              <div>
                <Label>نقطة الانطلاق *</Label>
                <Input placeholder="الموقع الأول" value={form.fromAddress} onChange={e => setForm(p => ({ ...p, fromAddress: e.target.value }))} />
              </div>
              <div>
                <Label>الوجهة *</Label>
                <Input placeholder="الوجهة النهائية" value={form.toAddress} onChange={e => setForm(p => ({ ...p, toAddress: e.target.value }))} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>نوع المركبة</Label>
                  <Select value={form.vehicleType} onValueChange={v => setForm(p => ({ ...p, vehicleType: v }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="economy">اقتصادية</SelectItem>
                      <SelectItem value="comfort">مريحة</SelectItem>
                      <SelectItem value="xl">XL كبيرة</SelectItem>
                      <SelectItem value="van">فان</SelectItem>
                      <SelectItem value="bus">حافلة</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>عدد المقاعد المتاحة</Label>
                  <Input type="number" min="1" max="20" value={form.maxGuests} onChange={e => setForm(p => ({ ...p, maxGuests: e.target.value }))} />
                </div>
              </div>
              <div>
                <Label>وقت الرحلة *</Label>
                <Input type="datetime-local" value={form.scheduledAt} onChange={e => setForm(p => ({ ...p, scheduledAt: e.target.value }))} />
              </div>
              <div>
                <Label>ملاحظات</Label>
                <Textarea placeholder="أي تعليمات للضيوف..." value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} />
              </div>
              <Button onClick={handleCreate} className="w-full" disabled={createMutation.isPending}>
                {createMutation.isPending ? "جاري الإنشاء..." : "إنشاء رحلة الدعوة"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {trips.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center text-muted-foreground">
            <Share2 className="h-12 w-12 mx-auto mb-4 opacity-30" />
            <p className="text-lg font-medium">لا توجد رحلات دعوة بعد</p>
            <p className="text-sm mt-1">أنشئ رحلة وادعو أصدقاءك برابط خاص</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {trips.map((trip) => {
            const statusInfo = STATUS_MAP[trip.status] ?? STATUS_MAP.open;
            const acceptedGuests = trip.guests?.filter((g: any) => g.status === "accepted") ?? [];
            return (
              <Card key={trip.id} className="border hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg">{trip.title}</CardTitle>
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${statusInfo.color}`}>{statusInfo.label}</span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4 text-primary shrink-0" />
                    <span>{trip.fromAddress} ← {trip.toAddress}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4 text-primary shrink-0" />
                    <span>{new Date(trip.scheduledAt).toLocaleString("ar-SA")}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Users className="h-4 w-4 text-primary shrink-0" />
                    <span>{acceptedGuests.length} / {trip.maxGuests} ضيف</span>
                  </div>
                  <div className="flex gap-2 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 gap-2"
                      onClick={() => copyLink(trip.inviteCode)}
                    >
                      <Copy className="h-3 w-3" />
                      نسخ الرابط
                    </Button>
                    <Link href={`/invite-trips/${trip.id}`}>
                      <Button size="sm" className="flex-1">إدارة الرحلة</Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
