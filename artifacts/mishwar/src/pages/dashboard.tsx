import { useGetDashboardStats } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Car, Users, TrendingUp, CalendarDays, Route } from "lucide-react";

export default function Dashboard() {
  const { data: stats, isLoading } = useGetDashboardStats();

  if (isLoading) return <div className="p-12 text-center">جاري التحميل...</div>;
  if (!stats) return <div className="p-12 text-center text-destructive">خطأ في جلب الإحصائيات</div>;

  const statCards = [
    { title: "إجمالي الركاب", value: stats.totalPassengers, icon: Users, color: "text-blue-500", bg: "bg-blue-500/10" },
    { title: "إجمالي السائقين", value: stats.totalDrivers, icon: Car, color: "text-orange-500", bg: "bg-orange-500/10" },
    { title: "رحلات اليوم", value: stats.completedRidesToday, icon: Route, color: "text-green-500", bg: "bg-green-500/10" },
    { title: "أرباح الشهر", value: `${stats.revenueThisMonth} ﷼`, icon: TrendingUp, color: "text-primary", bg: "bg-primary/10" },
    { title: "الرحلات النشطة", value: stats.activeRides, icon: Car, color: "text-purple-500", bg: "bg-purple-500/10" },
    { title: "إجمالي الرحلات", value: stats.totalRides, icon: Route, color: "text-gray-500", bg: "bg-gray-500/10" },
    { title: "الاشتراكات الفعالة", value: stats.totalSubscriptions, icon: CalendarDays, color: "text-pink-500", bg: "bg-pink-500/10" },
    { title: "الرحلات الجماعية النشطة", value: stats.activeGroupTrips, icon: Users, color: "text-teal-500", bg: "bg-teal-500/10" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-3 bg-primary/10 rounded-xl">
          <BarChart className="h-8 w-8 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-black text-primary">لوحة القيادة</h1>
          <p className="text-muted-foreground mt-1">نظرة عامة على أداء منصة مشوار</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat, i) => (
          <Card key={i} className="border-0 shadow-sm overflow-hidden">
            <CardContent className="p-6 flex items-center gap-4">
              <div className={`p-4 rounded-2xl ${stat.bg}`}>
                <stat.icon className={`h-6 w-6 ${stat.color}`} />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">{stat.title}</p>
                <h3 className="text-2xl font-black">{stat.value}</h3>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
