import { useListSubscriptions, useCancelSubscription } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { CalendarDays, MapPin, CreditCard, AlertCircle } from "lucide-react";

export default function Subscriptions() {
  const { data: subsData, isLoading } = useListSubscriptions();
  const cancelSubMutation = useCancelSubscription();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleCancel = (id: number) => {
    if (confirm("هل أنت متأكد من إلغاء هذا الاشتراك؟")) {
      cancelSubMutation.mutate({ subscriptionId: id }, {
        onSuccess: () => {
          toast({ title: "تم إلغاء الاشتراك" });
          queryClient.invalidateQueries({ queryKey: ["/api/subscriptions"] });
        },
        onError: () => {
          toast({ title: "حدث خطأ أثناء الإلغاء", variant: "destructive" });
        }
      });
    }
  };

  if (isLoading) return <div className="p-12 text-center">جاري التحميل...</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-black text-primary">اشتراكاتي</h1>
        <p className="text-muted-foreground mt-1">إدارة اشتراكات الرحلات الجماعية</p>
      </div>

      {!subsData?.items || subsData.items.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center p-12 text-center">
            <CalendarDays className="h-12 w-12 text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-bold mb-2">لا توجد اشتراكات</h3>
            <p className="text-muted-foreground">ليس لديك أي اشتراكات نشطة حالياً.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {subsData.items.map(sub => (
            <Card key={sub.id} className="relative overflow-hidden">
              {sub.status === 'cancelled' && (
                <div className="absolute inset-0 bg-background/50 z-10 flex items-center justify-center backdrop-blur-[1px]">
                  <Badge variant="destructive" className="text-lg px-4 py-1 rotate-12 shadow-lg">ملغى</Badge>
                </div>
              )}
              <CardHeader className="pb-3 border-b bg-muted/20">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg mb-1">{sub.groupTrip?.title}</CardTitle>
                    <Badge variant={sub.subscriptionType === 'weekly' ? 'secondary' : 'default'} className="font-normal border-0">
                      اشتراك {sub.subscriptionType === 'weekly' ? 'أسبوعي' : 'شهري'}
                    </Badge>
                  </div>
                  <div className="text-left">
                    <p className="font-black text-xl text-primary">{sub.pricePerPeriod}</p>
                    <p className="text-xs text-muted-foreground">﷼ / فترة</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-4 space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{sub.groupTrip?.fromCity}</span>
                    <span className="text-muted-foreground text-xs">إلى</span>
                    <span className="font-medium">{sub.groupTrip?.toCity}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CalendarDays className="h-4 w-4 text-muted-foreground" />
                    <span>تاريخ البدء:</span>
                    <span className="font-medium" dir="ltr">{new Date(sub.startDate).toLocaleDateString('ar-SA')}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CreditCard className="h-4 w-4 text-muted-foreground" />
                    <span>عدد المقاعد:</span>
                    <span className="font-medium">{sub.seatCount} مقاعد</span>
                  </div>
                </div>

                {sub.status === 'active' && (
                  <Button 
                    variant="outline" 
                    className="w-full text-destructive hover:bg-destructive hover:text-white"
                    onClick={() => handleCancel(sub.id)}
                    disabled={cancelSubMutation.isPending}
                  >
                    إلغاء الاشتراك
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
