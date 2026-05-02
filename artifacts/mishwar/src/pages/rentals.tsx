import { useState } from "react";
import { useListRentals, useCreateRentalBooking, useListMyRentalBookings } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Car, Calendar, Star, Check, Clock } from "lucide-react";

const TYPE_LABELS: Record<string, string> = {
  economy: "اقتصادية", comfort: "مريحة", xl: "كبيرة", suv: "دفع رباعي", luxury: "فاخرة",
};

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  confirmed: "bg-blue-100 text-blue-800",
  active: "bg-green-100 text-green-800",
  returned: "bg-gray-100 text-gray-800",
  cancelled: "bg-red-100 text-red-800",
};
const STATUS_LABELS: Record<string, string> = {
  pending: "قيد المراجعة", confirmed: "مؤكد", active: "نشط", returned: "مُرجع", cancelled: "ملغي",
};

export default function Rentals() {
  const { data: carsData } = useListRentals({});
  const { data: bookingsData, refetch: refetchBookings } = useListMyRentalBookings();
  const createMutation = useCreateRentalBooking();
  const { toast } = useToast();
  const [selectedCar, setSelectedCar] = useState<any>(null);
  const [form, setForm] = useState({ startDate: "", endDate: "", notes: "" });
  const [filter, setFilter] = useState("all");

  const cars = carsData?.items ?? [];
  const bookings = bookingsData?.items ?? [];

  const filteredCars = filter === "all" ? cars : cars.filter(c => c.vehicleType === filter);

  const handleBook = async () => {
    if (!form.startDate || !form.endDate) {
      toast({ title: "يرجى تحديد تاريخ البداية والنهاية", variant: "destructive" });
      return;
    }
    if (new Date(form.endDate) <= new Date(form.startDate)) {
      toast({ title: "تاريخ النهاية يجب أن يكون بعد البداية", variant: "destructive" });
      return;
    }
    await createMutation.mutateAsync({
      data: { carId: selectedCar.id, startDate: form.startDate, endDate: form.endDate, notes: form.notes },
    });
    toast({ title: "تم حجز السيارة بنجاح!" });
    setSelectedCar(null);
    refetchBookings();
  };

  const calcDays = () => {
    if (!form.startDate || !form.endDate) return 0;
    return Math.max(1, Math.ceil((new Date(form.endDate).getTime() - new Date(form.startDate).getTime()) / (1000 * 60 * 60 * 24)));
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-black text-foreground">تأجير السيارات</h1>
        <p className="text-muted-foreground mt-1">احجز سيارة لأيام أو أسابيع بأسعار مناسبة</p>
      </div>

      <Tabs defaultValue="browse">
        <TabsList className="mb-4">
          <TabsTrigger value="browse">تصفح السيارات</TabsTrigger>
          <TabsTrigger value="bookings">حجوزاتي</TabsTrigger>
        </TabsList>

        <TabsContent value="browse" className="space-y-4">
          {/* Filter */}
          <div className="flex flex-wrap gap-2">
            {["all", "economy", "comfort", "suv", "luxury"].map((t) => (
              <Button
                key={t}
                size="sm"
                variant={filter === t ? "default" : "outline"}
                onClick={() => setFilter(t)}
              >
                {t === "all" ? "الكل" : TYPE_LABELS[t]}
              </Button>
            ))}
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredCars.map((car) => (
              <Card key={car.id} className={`border hover:shadow-md transition-shadow ${!car.isAvailable ? "opacity-60" : ""}`}>
                <CardContent className="pt-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-bold text-lg">{car.make} {car.model}</p>
                      <p className="text-sm text-muted-foreground">{car.year} • {car.plate}</p>
                    </div>
                    <Badge variant="outline">{TYPE_LABELS[car.vehicleType] ?? car.vehicleType}</Badge>
                  </div>
                  {car.features && (
                    <p className="text-sm text-muted-foreground">{car.features}</p>
                  )}
                  <div className="flex items-center justify-between pt-2 border-t border-border">
                    <div>
                      <span className="text-2xl font-black text-primary">{car.dailyRate}</span>
                      <span className="text-sm text-muted-foreground"> ريال/يوم</span>
                    </div>
                    <Button
                      size="sm"
                      disabled={!car.isAvailable}
                      onClick={() => setSelectedCar(car)}
                    >
                      {car.isAvailable ? "احجز الآن" : "غير متاح"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
            {filteredCars.length === 0 && (
              <div className="col-span-full text-center py-12 text-muted-foreground">
                <Car className="h-12 w-12 mx-auto mb-3 opacity-30" />
                <p>لا توجد سيارات متاحة</p>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="bookings" className="space-y-4">
          {bookings.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                <Calendar className="h-12 w-12 mx-auto mb-3 opacity-30" />
                <p>لا توجد حجوزات تأجير</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {bookings.map((booking) => (
                <Card key={booking.id} className="border">
                  <CardContent className="pt-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-bold">{(booking as any).car?.make} {(booking as any).car?.model}</p>
                        <p className="text-sm text-muted-foreground">
                          {booking.startDate} ← {booking.endDate} ({booking.totalDays} أيام)
                        </p>
                        <p className="text-sm font-medium text-primary mt-1">{booking.totalPrice} ريال</p>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${STATUS_COLORS[booking.status] ?? ""}`}>
                        {STATUS_LABELS[booking.status] ?? booking.status}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Booking Dialog */}
      <Dialog open={!!selectedCar} onOpenChange={() => setSelectedCar(null)}>
        <DialogContent dir="rtl">
          <DialogHeader>
            <DialogTitle>حجز {selectedCar?.make} {selectedCar?.model}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-3 bg-muted rounded-lg text-sm">
              <p className="font-medium">{selectedCar?.make} {selectedCar?.model} {selectedCar?.year}</p>
              <p className="text-muted-foreground">{selectedCar?.dailyRate} ريال/يوم</p>
            </div>
            <div>
              <Label>تاريخ البداية *</Label>
              <Input type="date" value={form.startDate} onChange={e => setForm(p => ({ ...p, startDate: e.target.value }))} min={new Date().toISOString().split("T")[0]} />
            </div>
            <div>
              <Label>تاريخ الإرجاع *</Label>
              <Input type="date" value={form.endDate} onChange={e => setForm(p => ({ ...p, endDate: e.target.value }))} min={form.startDate || new Date().toISOString().split("T")[0]} />
            </div>
            {form.startDate && form.endDate && calcDays() > 0 && (
              <div className="p-3 bg-primary/10 rounded-lg flex justify-between items-center">
                <span className="text-sm font-medium">المدة: {calcDays()} أيام</span>
                <span className="font-bold text-primary">{calcDays() * (selectedCar?.dailyRate ?? 0)} ريال</span>
              </div>
            )}
            <Button className="w-full" onClick={handleBook} disabled={createMutation.isPending}>
              {createMutation.isPending ? "جاري الحجز..." : "تأكيد الحجز"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
