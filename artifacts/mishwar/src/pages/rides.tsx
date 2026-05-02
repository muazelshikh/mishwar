import { useState } from "react";
import { Link } from "wouter";
import { useListRides, getListRidesQueryKey } from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Car, MapPin, ChevronLeft, Calendar, ArrowDownCircle } from "lucide-react";

export default function Rides() {
  const [statusFilter, setStatusFilter] = useState<string>("all");
  
  const { data: ridesData, isLoading } = useListRides({
    status: statusFilter !== "all" ? statusFilter as any : undefined
  });

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'pending': return { label: 'قيد الانتظار', class: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' };
      case 'accepted': return { label: 'تم القبول', class: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' };
      case 'in_progress': return { label: 'جارية الآن', class: 'bg-primary/20 text-primary' };
      case 'completed': return { label: 'مكتملة', class: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' };
      case 'cancelled': return { label: 'ملغية', class: 'bg-destructive/20 text-destructive' };
      default: return { label: status, class: 'bg-muted' };
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-primary">رحلاتي</h1>
          <p className="text-muted-foreground mt-1">سجل رحلاتك السابقة والحالية</p>
        </div>

        <div className="w-full sm:w-48">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="bg-card" data-testid="select-filter">
              <SelectValue placeholder="تصفية حسب الحالة" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">جميع الرحلات</SelectItem>
              <SelectItem value="pending">قيد الانتظار</SelectItem>
              <SelectItem value="accepted">تم القبول</SelectItem>
              <SelectItem value="in_progress">جارية الآن</SelectItem>
              <SelectItem value="completed">مكتملة</SelectItem>
              <SelectItem value="cancelled">ملغية</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center p-12 text-muted-foreground">جاري التحميل...</div>
      ) : ridesData?.items.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center p-12 text-center">
            <div className="bg-muted p-4 rounded-full mb-4">
              <Car className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-bold mb-2">لا توجد رحلات</h3>
            <p className="text-muted-foreground mb-6">لم تقم بأي رحلات تطابق هذا الفلتر.</p>
            <Link href="/">
              <Button>احجز رحلة جديدة</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {ridesData?.items.map(ride => {
            const statusConfig = getStatusConfig(ride.status);
            return (
              <Link key={ride.id} href={`/rides/${ride.id}`}>
                <Card className="hover:border-primary/50 transition-colors cursor-pointer group">
                  <CardContent className="p-0">
                    <div className="flex flex-col sm:flex-row">
                      <div className="p-5 flex-1 space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-sm text-muted-foreground font-medium">
                            <Calendar className="h-4 w-4" />
                            <span>{new Date(ride.createdAt).toLocaleString('ar-SA')}</span>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-xs font-bold ${statusConfig.class}`}>
                            {statusConfig.label}
                          </span>
                        </div>

                        <div className="relative pl-6 space-y-6">
                          <div className="absolute right-[5px] top-2 bottom-2 w-0.5 bg-muted-foreground/20 rounded-full" />
                          <div className="relative flex items-start gap-4">
                            <div className="absolute -right-1 mt-1 h-3 w-3 rounded-full bg-primary ring-4 ring-background" />
                            <div>
                              <p className="font-bold text-lg">{ride.fromAddress}</p>
                              <p className="text-sm text-muted-foreground">نقطة الانطلاق</p>
                            </div>
                          </div>
                          <div className="relative flex items-start gap-4">
                            <div className="absolute -right-1 mt-1 h-3 w-3 rounded-full border-2 border-primary bg-background ring-4 ring-background" />
                            <div>
                              <p className="font-bold text-lg">{ride.toAddress}</p>
                              <p className="text-sm text-muted-foreground">نقطة الوصول</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="bg-muted/30 p-5 sm:w-48 sm:border-r border-t sm:border-t-0 flex flex-row sm:flex-col justify-between items-center text-center">
                        <div>
                          <p className="text-sm text-muted-foreground mb-1">السعر التقريبي</p>
                          <p className="font-black text-xl text-primary">{ride.estimatedPrice ? `${ride.estimatedPrice} ﷼` : 'يحدد لاحقاً'}</p>
                        </div>
                        <Button variant="ghost" size="sm" className="group-hover:translate-x-[-4px] transition-transform text-primary">
                          التفاصيل <ChevronLeft className="mr-1 h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
