import { useParams, Link } from "wouter";
import { useGetRide, useUpdateRide } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, MapPin, Calendar, Clock, User, Car, Phone, AlertCircle, Star } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { getGetRideQueryKey } from "@workspace/api-client-react";
import { RateDriverDialog } from "@/components/rate-driver-dialog";

export default function RideDetail() {
  const { id } = useParams<{ id: string }>();
  const rideId = parseInt(id || "0", 10);
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: ride, isLoading } = useGetRide(rideId, {
    query: { enabled: !!rideId, queryKey: getGetRideQueryKey(rideId) }
  });

  const updateRideMutation = useUpdateRide();

  if (isLoading) return <div className="p-12 text-center">جاري التحميل...</div>;
  if (!ride) return <div className="p-12 text-center text-destructive">لم يتم العثور على الرحلة</div>;

  const isDriver = user?.role === 'driver';
  const isAdmin = user?.role === 'admin';

  const handleUpdateStatus = (newStatus: "accepted" | "in_progress" | "completed" | "cancelled") => {
    updateRideMutation.mutate({
      rideId,
      data: { status: newStatus }
    }, {
      onSuccess: (updatedRide) => {
        toast({ title: newStatus === "completed" ? "تم إنهاء الرحلة وخصم المبلغ من المحفظة" : "تم تحديث حالة الرحلة" });
        queryClient.setQueryData(getGetRideQueryKey(rideId), updatedRide);
        queryClient.invalidateQueries();
      },
      onError: (err: any) => {
        const status = err?.response?.status ?? err?.status;
        if (status === 402) {
          toast({
            title: "رصيد المحفظة غير كافٍ",
            description: "يرجى شحن المحفظة قبل إنهاء الرحلة",
            variant: "destructive",
          });
        } else {
          toast({ title: "تعذر تحديث حالة الرحلة", variant: "destructive" });
        }
      }
    });
  };

  const statusMap: Record<string, { label: string, color: string }> = {
    pending: { label: 'قيد الانتظار', color: 'bg-yellow-500' },
    accepted: { label: 'تم القبول', color: 'bg-blue-500' },
    in_progress: { label: 'في الطريق', color: 'bg-primary' },
    completed: { label: 'مكتملة', color: 'bg-green-500' },
    cancelled: { label: 'ملغية', color: 'bg-destructive' },
  };

  const currentStatus = statusMap[ride.status] || { label: ride.status, color: 'bg-muted' };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="flex items-center gap-4">
        <Link href="/rides">
          <Button variant="outline" size="icon" className="rounded-full">
            <ArrowRight className="h-5 w-5" />
          </Button>
        </Link>
        <h1 className="text-2xl font-bold flex-1">تفاصيل الرحلة #{ride.id}</h1>
        <Badge variant="outline" className={`text-white border-0 ${currentStatus.color} px-3 py-1 text-sm`}>
          {currentStatus.label}
        </Badge>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border-0 shadow-lg md:col-span-2">
          <CardContent className="p-6 md:p-8">
            <div className="relative pl-8 space-y-8">
              <div className="absolute right-[11px] top-3 bottom-3 w-0.5 bg-muted-foreground/20 rounded-full" />
              <div className="relative flex items-start gap-6">
                <div className="absolute -right-2.5 mt-1 h-5 w-5 rounded-full bg-primary ring-4 ring-background flex items-center justify-center">
                  <div className="h-2 w-2 bg-white rounded-full" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">من</p>
                  <p className="text-xl font-bold">{ride.fromAddress}</p>
                </div>
              </div>
              <div className="relative flex items-start gap-6">
                <div className="absolute -right-2.5 mt-1 h-5 w-5 rounded-full border-4 border-primary bg-background ring-4 ring-background" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">إلى</p>
                  <p className="text-xl font-bold">{ride.toAddress}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              معلومات الرحلة
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between py-2 border-b border-border/50">
              <span className="text-muted-foreground">تاريخ الطلب</span>
              <span className="font-semibold" dir="ltr">{new Date(ride.createdAt).toLocaleString('ar-SA')}</span>
            </div>
            {ride.scheduledAt && (
              <div className="flex justify-between py-2 border-b border-border/50">
                <span className="text-muted-foreground">موعد مجدول</span>
                <span className="font-semibold text-primary" dir="ltr">{new Date(ride.scheduledAt).toLocaleString('ar-SA')}</span>
              </div>
            )}
            <div className="flex justify-between py-2 border-b border-border/50">
              <span className="text-muted-foreground">نوع السيارة</span>
              <span className="font-semibold">
                {ride.vehicleType === 'economy' ? 'اقتصادية' : ride.vehicleType === 'comfort' ? 'مريحة' : 'عائلية XL'}
              </span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-muted-foreground">السعر المقدر</span>
              <span className="font-bold text-lg text-primary">{ride.estimatedPrice ? `${ride.estimatedPrice} ﷼` : '-'}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <User className="h-5 w-5 text-primary" />
              السائق
            </CardTitle>
          </CardHeader>
          <CardContent>
            {ride.driver ? (
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xl">
                    {ride.driver.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-bold text-lg">{ride.driver.name}</p>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Phone className="h-3 w-3" />
                      <span dir="ltr">{ride.driver.phone}</span>
                    </div>
                  </div>
                </div>
                <div className="bg-muted/50 p-3 rounded-lg flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <Car className="h-4 w-4" />
                    {ride.driver.vehicleMake} {ride.driver.vehicleModel}
                  </div>
                  <Badge variant="outline" className="font-mono">{ride.driver.vehiclePlate}</Badge>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-6 text-muted-foreground text-center">
                <AlertCircle className="h-8 w-8 mb-2 opacity-50" />
                <p>جاري البحث عن سائق...</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Actions for Driver / Admin */}
        {(isDriver || isAdmin) && ride.status !== 'completed' && ride.status !== 'cancelled' && (
          <Card className="md:col-span-2 border-primary/30 bg-primary/5">
            <CardContent className="p-6 flex flex-wrap gap-4 items-center justify-center">
              {ride.status === 'pending' && (
                <Button onClick={() => handleUpdateStatus('accepted')} size="lg" className="flex-1">
                  قبول الرحلة
                </Button>
              )}
              {ride.status === 'accepted' && (
                <Button onClick={() => handleUpdateStatus('in_progress')} size="lg" className="flex-1">
                  بدء الرحلة
                </Button>
              )}
              {ride.status === 'in_progress' && (
                <Button onClick={() => handleUpdateStatus('completed')} size="lg" variant="default" className="flex-1 bg-green-600 hover:bg-green-700 text-white">
                  إنهاء الرحلة
                </Button>
              )}
              <Button onClick={() => handleUpdateStatus('cancelled')} size="lg" variant="destructive" className="flex-1">
                إلغاء الرحلة
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Actions for Passenger */}
        {!isDriver && !isAdmin && ride.status === 'pending' && (
          <div className="md:col-span-2 flex justify-center">
            <Button onClick={() => handleUpdateStatus('cancelled')} variant="destructive">
              إلغاء الطلب
            </Button>
          </div>
        )}

        {/* Rate the driver after a completed ride (passenger only) */}
        {!isDriver && !isAdmin && ride.status === 'completed' && ride.driver && (
          <Card className="md:col-span-2 border-yellow-500/30 bg-yellow-500/5">
            <CardContent className="p-6 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Star className="h-6 w-6 text-yellow-500 fill-yellow-500" />
                <div>
                  <p className="font-bold">كيف كانت رحلتك مع {ride.driver.name}؟</p>
                  <p className="text-sm text-muted-foreground">شاركنا تقييمك ليستفيد منه الجميع</p>
                </div>
              </div>
              <RateDriverDialog rideId={ride.id} ratedName={ride.driver.name} />
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
