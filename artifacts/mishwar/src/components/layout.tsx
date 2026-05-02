import { Link, useLocation } from "wouter";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import {
  Car, Route, CalendarDays, Users, LayoutDashboard, LogOut, Menu,
  Share2, Key, Briefcase, Shield, UserCog, Grid3X3,
  Heart, Package, GraduationCap, Stethoscope, Building2,
  MoonStar, Palmtree, PartyPopper, MapPin, CarFront, Factory,
  Wallet,
} from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

type NavItem = {
  href: string;
  label: string;
  icon: React.ElementType;
  section?: string;
};

export function Layout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const [location] = useLocation();

  const coreNav: NavItem[] = [
    { href: "/", label: "الرحلات الفردية", icon: Car },
    { href: "/services", label: "جميع الخدمات", icon: Grid3X3 },
    { href: "/rides", label: "رحلاتي", icon: Route },
    { href: "/wallet", label: "محفظتي", icon: Wallet },
    { href: "/group-trips", label: "الرحلات الجماعية", icon: Users },
    { href: "/subscriptions", label: "اشتراكاتي", icon: CalendarDays },
    { href: "/invite-trips", label: "رحلات الدعوة", icon: Share2 },
  ];

  const servicesNav: NavItem[] = [
    { href: "/loved-ones", label: "أحبابك", icon: Heart },
    { href: "/delivery", label: "التوصيل", icon: Package },
    { href: "/school-transport", label: "نقل مدرسي", icon: GraduationCap },
    { href: "/medical-transport", label: "نقل طبي", icon: Stethoscope },
    { href: "/rentals", label: "تأجير سيارات", icon: Key },
    { href: "/hire-driver", label: "استئجار سائق", icon: Briefcase },
    { href: "/hajj-umrah", label: "الحج والعمرة", icon: MoonStar },
    { href: "/tourism", label: "رحلات سياحية", icon: Palmtree },
    { href: "/events", label: "خدمة المناسبات", icon: PartyPopper },
    { href: "/corporate", label: "عقود مؤسسية", icon: Building2 },
  ];

  const portalNav: NavItem[] = [
    { href: "/owner-portal", label: "بوابة ملاك السيارات", icon: CarFront },
    { href: "/business-portal", label: "بوابة الشركات", icon: Factory },
  ];

  const adminNav: NavItem[] = [];
  if (user?.role === "driver" || user?.role === "admin") {
    adminNav.push({ href: "/driver-portal", label: "بوابة السائق", icon: UserCog });
  }
  if (user?.role === "admin") {
    adminNav.push({ href: "/dashboard", label: "الإحصائيات", icon: LayoutDashboard });
    adminNav.push({ href: "/admin", label: "لوحة الإدارة", icon: Shield });
    adminNav.push({ href: "/drivers", label: "السائقون", icon: Users });
  }

  const NavSection = ({ title, items }: { title?: string; items: NavItem[] }) => (
    <div className="space-y-0.5">
      {title && <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest px-4 pt-4 pb-1">{title}</p>}
      {items.map((item) => (
        <Link key={item.href} href={item.href}>
          <div
            className={`flex items-center gap-3 px-4 py-2.5 rounded-xl transition-colors text-sm ${
              location === item.href
                ? "bg-primary text-primary-foreground font-semibold"
                : "hover:bg-muted text-muted-foreground hover:text-foreground"
            }`}
            data-testid={`nav-${item.href.replace(/\//g, "-").replace(/^-/, "") || "home"}`}
          >
            <item.icon className="h-4 w-4 shrink-0" />
            <span>{item.label}</span>
          </div>
        </Link>
      ))}
    </div>
  );

  const NavLinks = () => (
    <>
      <NavSection items={coreNav} />
      <NavSection title="خدماتنا" items={servicesNav} />
      <NavSection title="البوابات" items={portalNav} />
      {adminNav.length > 0 && <NavSection title="الإدارة" items={adminNav} />}
    </>
  );

  return (
    <div className="min-h-[100dvh] flex bg-background">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 border-l border-border bg-card shrink-0">
        <div className="p-5 border-b border-border">
          <h1 className="text-2xl font-black text-primary tracking-tight">مشوار</h1>
          <p className="text-xs text-muted-foreground mt-0.5">14 خدمة نقل شاملة</p>
        </div>
        <nav className="flex-1 px-3 py-3 space-y-0 overflow-y-auto">
          <NavLinks />
        </nav>
        <div className="p-4 border-t border-border">
          <div className="flex items-center justify-between px-2 py-2">
            <div className="flex flex-col">
              <span className="font-semibold text-sm">{user?.name}</span>
              <span className="text-xs text-muted-foreground">
                {user?.role === "admin" ? "مدير" : user?.role === "driver" ? "سائق" : "راكب"}
              </span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={logout}
              className="text-muted-foreground hover:text-destructive"
              data-testid="button-logout"
            >
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </aside>

      {/* Mobile Nav */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="md:hidden flex items-center justify-between p-4 border-b border-border bg-card">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72 p-0">
              <div className="p-5 border-b border-border">
                <h1 className="text-2xl font-black text-primary">مشوار</h1>
                <p className="text-xs text-muted-foreground mt-0.5">{user?.name}</p>
              </div>
              <nav className="p-3 space-y-0 overflow-y-auto max-h-[calc(100vh-120px)]">
                <NavLinks />
              </nav>
            </SheetContent>
          </Sheet>
          <h1 className="text-xl font-black text-primary">مشوار</h1>
          <Button variant="ghost" size="icon" onClick={logout}>
            <LogOut className="h-5 w-5" />
          </Button>
        </header>

        <main className="flex-1 p-4 md:p-8 overflow-auto">
          <div className="max-w-6xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
