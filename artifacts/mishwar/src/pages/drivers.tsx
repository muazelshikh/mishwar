import { useListDrivers } from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, Car, Phone } from "lucide-react";

export default function Drivers() {
  const { data: driversData, isLoading } = useListDrivers();

  if (isLoading) return <div className="p-12 text-center">جاري التحميل...</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-black text-primary">السائقين</h1>
        <p className="text-muted-foreground mt-1">قائمة السائقين المسجلين في المنصة</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {driversData?.items.map(driver => (
          <Card key={driver.id} className="overflow-hidden">
            <div className="bg-primary/5 p-4 border-b flex items-center gap-4">
              <div className="h-16 w-16 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-black text-2xl">
                {driver.name.charAt(0)}
              </div>
              <div>
                <h3 className="font-bold text-lg">{driver.name}</h3>
                <div className="flex items-center gap-1 text-muted-foreground text-sm">
                  <Phone className="h-3 w-3" />
                  <span dir="ltr">{driver.phone}</span>
                </div>
              </div>
            </div>
            <CardContent className="p-4 space-y-4">
              <div className="flex justify-between items-center bg-muted/30 p-3 rounded-lg">
                <div className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                  <span className="font-bold">{driver.rating ? driver.rating.toFixed(1) : 'جديد'}</span>
                </div>
                <div className="text-center">
                  <span className="font-bold text-primary block">{driver.totalTrips}</span>
                  <span className="text-xs text-muted-foreground">رحلة</span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Car className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">{driver.vehicleMake} {driver.vehicleModel} ({driver.vehicleYear})</span>
                </div>
                <div className="flex gap-2">
                  <Badge variant="outline" className="font-mono bg-background">{driver.vehiclePlate}</Badge>
                  <Badge variant="secondary">
                    {driver.vehicleType === 'economy' ? 'اقتصادية' : 
                     driver.vehicleType === 'comfort' ? 'مريحة' : 
                     driver.vehicleType === 'bus' ? 'حافلة' : 
                     driver.vehicleType === 'van' ? 'فان' : driver.vehicleType}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
