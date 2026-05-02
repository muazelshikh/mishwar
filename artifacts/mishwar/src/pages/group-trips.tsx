import { useState } from "react";
import { Link } from "wouter";
import { useListGroupTrips } from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Users, MapPin, Clock, Search, ArrowLeft, Bus, CalendarDays } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function GroupTrips() {
  const [search, setSearch] = useState("");
  const [scheduleType, setScheduleType] = useState<string>("all");

  const { data: tripsData, isLoading } = useListGroupTrips({
    scheduleType: scheduleType !== "all" ? scheduleType as any : undefined
  });

  const filteredTrips = tripsData?.items?.filter(trip => 
    search === "" || 
    trip.title.includes(search) || 
    trip.fromCity.includes(search) || 
    trip.toCity.includes(search)
  ) || [];

  return (
    <div className="space-y-8">
      <div className="bg-primary/5 rounded-3xl p-8 border border-primary/10">
        <h1 className="text-3xl md:text-4xl font-black text-primary mb-4">الرحلات الجماعية</h1>
        <p className="text-lg text-muted-foreground mb-8 max-w-2xl">
          اشترك في رحلات مجدولة للذهاب للعمل أو الجامعة. وفر المال والجهد مع رحلات مشتركة موثوقة.
        </p>

        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute right-3 top-3 h-5 w-5 text-muted-foreground" />
            <Input 
              placeholder="ابحث عن مسار (مثال: من الرياض إلى الدمام)" 
              className="pr-10 h-12 bg-background border-0 shadow-sm"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              data-testid="input-search"
            />
          </div>
          <Select value={scheduleType} onValueChange={setScheduleType}>
            <SelectTrigger className="w-full sm:w-48 h-12 bg-background border-0 shadow-sm" data-testid="select-type">
              <SelectValue placeholder="نوع الرحلة" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">الكل</SelectItem>
              <SelectItem value="weekly">يومي/أسبوعي</SelectItem>
              <SelectItem value="monthly">شهري</SelectItem>
              <SelectItem value="one_time">لمرة واحدة</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center p-12 text-muted-foreground">جاري التحميل...</div>
      ) : filteredTrips.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center p-12 text-center">
            <Bus className="h-12 w-12 text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-bold mb-2">لا توجد رحلات متاحة</h3>
            <p className="text-muted-foreground">لم نتمكن من العثور على رحلات تطابق بحثك حالياً.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredTrips.map(trip => (
            <Card key={trip.id} className="overflow-hidden hover:shadow-lg transition-all group flex flex-col">
              <div className="bg-primary p-4 text-primary-foreground flex justify-between items-center">
                <h3 className="font-bold text-lg truncate">{trip.title}</h3>
                <Badge variant="secondary" className="bg-white/20 hover:bg-white/30 text-white border-0">
                  {trip.scheduleType === 'weekly' ? 'أسبوعي' : trip.scheduleType === 'monthly' ? 'شهري' : 'لمرة واحدة'}
                </Badge>
              </div>
              <CardContent className="p-5 flex-1 flex flex-col">
                <div className="flex items-center justify-between mb-6 relative">
                  <div className="text-center flex-1 z-10 bg-card rounded-lg px-2">
                    <p className="text-xl font-bold">{trip.fromCity}</p>
                  </div>
                  <div className="absolute left-0 right-0 top-1/2 h-0.5 bg-muted-foreground/20 -translate-y-1/2">
                    <ArrowLeft className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground bg-card px-1" />
                  </div>
                  <div className="text-center flex-1 z-10 bg-card rounded-lg px-2">
                    <p className="text-xl font-bold">{trip.toCity}</p>
                  </div>
                </div>

                <div className="space-y-3 mb-6 flex-1">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Clock className="h-4 w-4 mr-2 ml-2 text-primary" />
                    <span>وقت الانطلاق: </span>
                    <span className="font-bold text-foreground mx-1" dir="ltr">{trip.departureTime}</span>
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <CalendarDays className="h-4 w-4 mr-2 ml-2 text-primary" />
                    <span>الأيام: </span>
                    <span className="font-bold text-foreground mx-1 truncate">{trip.scheduleDays || 'محدد'}</span>
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Users className="h-4 w-4 mr-2 ml-2 text-primary" />
                    <span>المقاعد المتاحة: </span>
                    <span className="font-bold text-foreground mx-1">{trip.capacity - trip.registeredCount} / {trip.capacity}</span>
                  </div>
                </div>

                <div className="pt-4 border-t flex items-center justify-between mt-auto">
                  <div>
                    <span className="text-2xl font-black text-primary">{trip.pricePerSeat}</span>
                    <span className="text-sm text-muted-foreground ml-1">﷼ للمقعد</span>
                  </div>
                  <Link href={`/group-trips/${trip.id}`}>
                    <Button variant="outline" className="group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                      التفاصيل والاشتراك
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
