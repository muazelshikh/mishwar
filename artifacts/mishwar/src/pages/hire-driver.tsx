import { useState } from "react";
import { useListDriverBookings, useCreateDriverBooking, useListDrivers } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Star, User, Plus, Clock } from "lucide-react";

const STATUS_LABELS: Record<string, string> = {
  pending: "قيد المراجعة", confirmed: "مؤكد", active: "نشط", completed: "مكتمل", cancelled: "ملغي",
};
const STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800", confirmed: "bg-blue-100 text-blue-800",
  active: "bg-green-100 text-green-800", completed: "bg-gray-100 text-gray-800", cancelled: "bg-red-100 text-red-800",
};

export default function HireDriver() {
  const { data: driversData } = useListDrivers({});
  const { data: bookingsData, refetch } = useListDriverBookings();
  const createMutation = useCreateDriverBooking();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState<any>(null);
  const [form, setForm] = useState({
    purpose: "",
    startDatetime: "",
    endDatetime: "",
    location: "",
    notes: "",
  });

  const drivers = driversData?.items ?? [];
  const bookings = bookingsData?.items ?? [];

  const calcHours = () => {
    if (!form.startDatetime || !form.endDatetime) return 0;
    return Math.max(1, (new Date(form.endDatetime).getTime() - new Date(form.startDatetime).getTime()) / (1000 * 60 * 60));
  };

  const hourlyRate = 50;

  const handleBook = async () => {
    if (!form.purpose || !form.startDatetime || !form.endDatetime || !form.location) {
      toast({ title: "يرجى ملء جميع الحقول المطلوبة", variant: "destructive" });
      return;
    }
    await createMutation.mutateAsync({
      data: {
        ...form,
        driverId: selectedDriver?.id,
        startDatetime: new Date(form.startDatetime).toISOString(),
        endDatetime: new Date(form.endDatetime).toISOString(),
      },
    });
    toast({ title: "تم إرسال طلب حجز السائق!" });
    setOpen(false);
    refetch();
    setForm({ purpose: "", startDatetime: "", endDatetime: "", location: "", notes: "" });
    setSelectedDriver(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-foreground">استئجار سائق</h1>
          <p className="text-muted-foreground mt-1">احجز سائقاً خاصاً للرحلات والمناسبات</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              حجز سائق
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg" dir="rtl">
            <DialogHeader>
              <DialogTitle>حجز سائق خاص</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              {selectedDriver && (
                <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                  <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center">
                    <User className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">{selectedDriver.name}</p>
                    <p className="text-xs text-muted-foreground">{selectedDriver.vehicleMake} {selectedDriver.vehicleModel}</p>
                  </div>
                  <Button size="sm" variant="ghost" onClick={() => setSelectedDriver(null)} className="mr-auto">تغيير</Button>
                </div>
              )}
              <div>
                <Label>الغرض من الحجز *</Label>
                <Input placeholder="مثال: رحلة عمل، مناسبة خاصة..." value={form.purpose} onChange={e => setForm(p => ({ ...p, purpose: e.target.value }))} />
              </div>
              <div>
                <Label>الموقع / المنطقة *</Label>
                <Input placeholder="المدينة أو الحي" value={form.location} onChange={e => setForm(p => ({ ...p, location: e.target.value }))} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>البداية *</Label>
                  <Input type="datetime-local" value={form.startDatetime} onChange={e => setForm(p => ({ ...p, startDatetime: e.target.value }))} />
                </div>
                <div>
                  <Label>النهاية *</Label>
                  <Input type="datetime-local" value={form.endDatetime} onChange={e => setForm(p => ({ ...p, endDatetime: e.target.value }))} />
                </div>
              </div>
              {form.startDatetime && form.endDatetime && calcHours() > 0 && (
                <div className="p-3 bg-primary/10 rounded-lg flex justify-between items-center">
                  <span className="text-sm font-medium">{calcHours().toFixed(1)} ساعة × {hourlyRate} ريال</span>
                  <span className="font-bold text-primary">{(calcHours() * hourlyRate).toFixed(0)} ريال</span>
                </div>
              )}
              <div>
                <Label>ملاحظات</Label>
                <Textarea placeholder="أي تعليمات أو متطلبات خاصة..." value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} />
              </div>
              <Button className="w-full" onClick={handleBook} disabled={createMutation.isPending}>
                {createMutation.isPending ? "جاري الإرسال..." : "إرسال طلب الحجز"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="drivers">
        <TabsList className="mb-4">
          <TabsTrigger value="drivers">السائقون المتاحون</TabsTrigger>
          <TabsTrigger value="my-bookings">حجوزاتي</TabsTrigger>
        </TabsList>

        <TabsContent value="drivers" className="space-y-3">
          <p className="text-sm text-muted-foreground">اختر سائقاً أو اترك الاختيار لنا</p>
          <div className="grid gap-3 md:grid-cols-2">
            {drivers.filter(d => d.isAvailable).map((driver) => (
              <Card key={driver.id} className={`border hover:shadow-md transition-shadow cursor-pointer ${selectedDriver?.id === driver.id ? "border-primary ring-2 ring-primary/20" : ""}`}
                onClick={() => setSelectedDriver(driver)}>
                <CardContent className="pt-4">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <User className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold truncate">{driver.name}</p>
                      <p className="text-sm text-muted-foreground">{driver.vehicleMake} {driver.vehicleModel} {driver.vehicleYear}</p>
                      <div className="flex items-center gap-1 mt-1">
                        <Star className="h-3 w-3 text-yellow-400 fill-yellow-400" />
                        <span className="text-xs">{driver.rating?.toFixed(1) ?? "جديد"}</span>
                        <span className="text-xs text-muted-foreground">• {driver.totalTrips} رحلة</span>
                      </div>
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-bold text-primary">{hourlyRate} ريال</p>
                      <p className="text-xs text-muted-foreground">/ ساعة</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          <Button className="w-full" variant="outline" onClick={() => { setSelectedDriver(null); setOpen(true); }}>
            احجز بدون تحديد سائق (سنختار لك)
          </Button>
        </TabsContent>

        <TabsContent value="my-bookings" className="space-y-3">
          {bookings.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                <Clock className="h-12 w-12 mx-auto mb-3 opacity-30" />
                <p>لا توجد حجوزات سائق</p>
              </CardContent>
            </Card>
          ) : (
            bookings.map((booking) => (
              <Card key={booking.id} className="border">
                <CardContent className="pt-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-bold">{booking.purpose}</p>
                      <p className="text-sm text-muted-foreground">{booking.location}</p>
                      <p className="text-sm text-muted-foreground mt-0.5">
                        {new Date(booking.startDatetime).toLocaleString("ar-SA")}
                      </p>
                      <p className="text-sm font-medium text-primary mt-1">{booking.totalPrice} ريال ({booking.totalHours} ساعة)</p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${STATUS_COLORS[booking.status] ?? ""}`}>
                      {STATUS_LABELS[booking.status] ?? booking.status}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
