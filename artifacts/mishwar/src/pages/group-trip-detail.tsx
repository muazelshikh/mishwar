import { useState } from "react";
import { useParams, Link } from "wouter";
import { 
  useGetGroupTrip, getGetGroupTripQueryKey, 
  useCreateSubscription, 
  useRegisterForGroupTrip
} from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { MapPin, Clock, CalendarDays, Users, Bus, ArrowRight, ShieldCheck, CreditCard } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function GroupTripDetail() {
  const { id } = useParams<{ id: string }>();
  const tripId = parseInt(id || "0", 10);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [isSubDialogOpen, setIsSubDialogOpen] = useState(false);
  const [subType, setSubType] = useState<"weekly" | "monthly">("weekly");
  const [seatCount, setSeatCount] = useState(1);
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);

  const [isRegDialogOpen, setIsRegDialogOpen] = useState(false);
  const [tripDate, setTripDate] = useState(new Date().toISOString().split('T')[0]);

  const { data: trip, isLoading } = useGetGroupTrip(tripId, {
    query: { enabled: !!tripId, queryKey: getGetGroupTripQueryKey(tripId) }
  });

  const createSubMutation = useCreateSubscription();
  const regMutation = useRegisterForGroupTrip();

  if (isLoading) return <div className="p-12 text-center">جاري التحميل...</div>;
  if (!trip) return <div className="p-12 text-center text-destructive">لم يتم العثور على الرحلة</div>;

  const availableSeats = trip.capacity - trip.registeredCount;

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    createSubMutation.mutate({
      data: {
        groupTripId: trip.id,
        subscriptionType: subType,
        seatCount,
        startDate
      }
    }, {
      onSuccess: () => {
        toast({ title: "تم الاشتراك بنجاح!" });
        setIsSubDialogOpen(false);
        queryClient.invalidateQueries({ queryKey: getGetGroupTripQueryKey(tripId) });
      },
      onError: () => {
        toast({ title: "فشل الاشتراك", variant: "destructive" });
      }
    });
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    regMutation.mutate({
      groupTripId: trip.id,
      data: {
        seatCount,
        tripDate,
      }
    }, {
      onSuccess: () => {
        toast({ title: "تم التسجيل للرحلة بنجاح!" });
        setIsRegDialogOpen(false);
        queryClient.invalidateQueries({ queryKey: getGetGroupTripQueryKey(tripId) });
      },
      onError: () => {
        toast({ title: "فشل التسجيل", variant: "destructive" });
      }
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex items-center gap-4">
        <Link href="/group-trips">
          <Button variant="outline" size="icon" className="rounded-full">
            <ArrowRight className="h-5 w-5" />
          </Button>
        </Link>
        <h1 className="text-2xl font-bold flex-1">{trip.title}</h1>
        <Badge variant="secondary" className="px-3 py-1">
          {trip.isActive ? 'متاحة' : 'غير متاحة'}
        </Badge>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <Card className="border-0 shadow-md">
            <CardContent className="p-6">
              <div className="relative pl-8 space-y-8">
                <div className="absolute right-[15px] top-4 bottom-4 w-0.5 bg-primary/20 rounded-full" />
                <div className="relative flex items-start gap-4">
                  <div className="absolute -right-3 mt-1 bg-background p-1">
                    <MapPin className="h-5 w-5 text-primary" />
                  </div>
                  <div className="bg-muted/30 p-4 rounded-xl flex-1">
                    <p className="text-sm font-medium text-muted-foreground mb-1">الانطلاق ({trip.fromCity})</p>
                    <p className="text-lg font-bold">{trip.fromAddress}</p>
                  </div>
                </div>
                <div className="relative flex items-start gap-4">
                  <div className="absolute -right-3 mt-1 bg-background p-1">
                    <MapPin className="h-5 w-5 text-primary" />
                  </div>
                  <div className="bg-muted/30 p-4 rounded-xl flex-1">
                    <p className="text-sm font-medium text-muted-foreground mb-1">الوصول ({trip.toCity})</p>
                    <p className="text-lg font-bold">{trip.toAddress}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">تفاصيل المسار</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground leading-relaxed">{trip.description || 'لا يوجد وصف متاح.'}</p>
              
              <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                <div className="flex items-center gap-3">
                  <div className="bg-primary/10 p-2 rounded-lg"><Clock className="h-5 w-5 text-primary" /></div>
                  <div>
                    <p className="text-xs text-muted-foreground">وقت التحرك</p>
                    <p className="font-bold" dir="ltr">{trip.departureTime}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="bg-primary/10 p-2 rounded-lg"><CalendarDays className="h-5 w-5 text-primary" /></div>
                  <div>
                    <p className="text-xs text-muted-foreground">الأيام</p>
                    <p className="font-bold text-sm">{trip.scheduleDays || 'محدد'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="bg-primary/10 p-2 rounded-lg"><Bus className="h-5 w-5 text-primary" /></div>
                  <div>
                    <p className="text-xs text-muted-foreground">المركبة</p>
                    <p className="font-bold">
                      {trip.vehicleType === 'bus' ? 'حافلة كبيرة' : trip.vehicleType === 'minibus' ? 'حافلة صغيرة' : 'فان'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="bg-primary/10 p-2 rounded-lg"><ShieldCheck className="h-5 w-5 text-primary" /></div>
                  <div>
                    <p className="text-xs text-muted-foreground">السائق</p>
                    <p className="font-bold">{trip.driver?.name || 'محدد'}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="border-primary/50 shadow-md bg-primary/5">
            <CardContent className="p-6 text-center">
              <div className="mb-6">
                <p className="text-muted-foreground mb-1">سعر المقعد</p>
                <div className="flex items-center justify-center">
                  <span className="text-4xl font-black text-primary">{trip.pricePerSeat}</span>
                  <span className="text-lg font-bold mr-1 text-primary">﷼</span>
                  <span className="text-muted-foreground mr-1">/ رحلة</span>
                </div>
              </div>

              <div className="bg-background rounded-xl p-4 mb-6 flex justify-between items-center border border-border">
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-muted-foreground" />
                  <span className="font-medium">المقاعد المتاحة</span>
                </div>
                <span className="font-bold text-lg text-primary">{availableSeats}</span>
              </div>

              {trip.isActive && availableSeats > 0 ? (
                <div className="space-y-3">
                  {(trip.scheduleType === 'weekly' || trip.scheduleType === 'monthly') && (
                    <Dialog open={isSubDialogOpen} onOpenChange={setIsSubDialogOpen}>
                      <DialogTrigger asChild>
                        <Button className="w-full h-12 text-lg" variant="default">
                          اشتراك دوري
                        </Button>
                      </DialogTrigger>
                      <DialogContent dir="rtl">
                        <DialogHeader>
                          <DialogTitle>الاشتراك في الرحلة</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleSubscribe} className="space-y-4 pt-4">
                          <div className="space-y-2">
                            <Label>نوع الاشتراك</Label>
                            <Select value={subType} onValueChange={(v: any) => setSubType(v)}>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="weekly">أسبوعي (5 رحلات)</SelectItem>
                                {trip.scheduleType === 'monthly' && <SelectItem value="monthly">شهري (20 رحلة)</SelectItem>}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label>عدد المقاعد</Label>
                            <Input 
                              type="number" 
                              min={1} 
                              max={availableSeats} 
                              value={seatCount} 
                              onChange={(e) => setSeatCount(parseInt(e.target.value))}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>تاريخ البدء</Label>
                            <Input 
                              type="date" 
                              value={startDate} 
                              onChange={(e) => setStartDate(e.target.value)}
                            />
                          </div>
                          <div className="bg-muted p-4 rounded-lg mt-4">
                            <div className="flex justify-between items-center font-bold">
                              <span>التكلفة الإجمالية:</span>
                              <span className="text-xl text-primary">
                                {trip.pricePerSeat * seatCount * (subType === 'weekly' ? 5 : 20)} ﷼
                              </span>
                            </div>
                          </div>
                          <Button type="submit" className="w-full mt-4" disabled={createSubMutation.isPending}>
                            {createSubMutation.isPending ? "جاري التأكيد..." : "تأكيد الاشتراك"}
                          </Button>
                        </form>
                      </DialogContent>
                    </Dialog>
                  )}

                  <Dialog open={isRegDialogOpen} onOpenChange={setIsRegDialogOpen}>
                    <DialogTrigger asChild>
                      <Button className="w-full h-12 text-lg" variant={trip.scheduleType === 'one_time' ? 'default' : 'outline'}>
                        حجز لمرة واحدة
                      </Button>
                    </DialogTrigger>
                    <DialogContent dir="rtl">
                      <DialogHeader>
                        <DialogTitle>حجز مقعد لمرة واحدة</DialogTitle>
                      </DialogHeader>
                      <form onSubmit={handleRegister} className="space-y-4 pt-4">
                        <div className="space-y-2">
                          <Label>تاريخ الرحلة المطلوبة</Label>
                          <Input 
                            type="date" 
                            value={tripDate} 
                            onChange={(e) => setTripDate(e.target.value)}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>عدد المقاعد</Label>
                          <Input 
                            type="number" 
                            min={1} 
                            max={availableSeats} 
                            value={seatCount} 
                            onChange={(e) => setSeatCount(parseInt(e.target.value))}
                            required
                          />
                        </div>
                        <div className="bg-muted p-4 rounded-lg mt-4">
                          <div className="flex justify-between items-center font-bold">
                            <span>التكلفة:</span>
                            <span className="text-xl text-primary">{trip.pricePerSeat * seatCount} ﷼</span>
                          </div>
                        </div>
                        <Button type="submit" className="w-full mt-4" disabled={regMutation.isPending}>
                          {regMutation.isPending ? "جاري التأكيد..." : "تأكيد الحجز"}
                        </Button>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>
              ) : (
                <div className="p-4 bg-muted rounded-lg text-muted-foreground font-bold">
                  {trip.isActive ? 'نفذت المقاعد' : 'الرحلة غير متاحة حالياً'}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
