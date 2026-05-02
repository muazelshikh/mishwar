import { Switch, Route, Router as WouterRouter, Redirect } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/lib/auth";
import { Layout } from "@/components/layout";
import NotFound from "@/pages/not-found";
import AuthPage from "@/pages/auth";

import Home from "@/pages/home";
import Services from "@/pages/services";
import Rides from "@/pages/rides";
import RideDetail from "@/pages/ride-detail";
import GroupTrips from "@/pages/group-trips";
import GroupTripDetail from "@/pages/group-trip-detail";
import Subscriptions from "@/pages/subscriptions";
import Drivers from "@/pages/drivers";
import Dashboard from "@/pages/dashboard";
import InviteTrips from "@/pages/invite-trips";
import InviteTripDetail from "@/pages/invite-trip-detail";
import InviteAccept from "@/pages/invite-accept";
import Rentals from "@/pages/rentals";
import HireDriver from "@/pages/hire-driver";
import DriverPortal from "@/pages/driver-portal";
import AdminDashboard from "@/pages/admin-dashboard";

import LovedOnes from "@/pages/loved-ones";
import Delivery from "@/pages/delivery";
import SchoolTransport from "@/pages/school-transport";
import MedicalTransport from "@/pages/medical-transport";
import Corporate from "@/pages/corporate";
import HajjUmrah from "@/pages/hajj-umrah";
import Tourism from "@/pages/tourism";
import Events from "@/pages/events";
import OwnerPortal from "@/pages/owner-portal";
import BusinessPortal from "@/pages/business-portal";
import Wallet from "@/pages/wallet";

const queryClient = new QueryClient();

function ProtectedRoute({ component: Component, adminOnly = false, driverOnly = false, ...rest }: any) {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return <div className="min-h-[100dvh] flex items-center justify-center font-bold text-primary text-xl">جاري التحميل...</div>;
  }

  if (!isAuthenticated) {
    return <Redirect to="/auth" />;
  }

  if (adminOnly && user?.role !== "admin") {
    return <Redirect to="/" />;
  }

  return (
    <Layout>
      <Component {...rest} />
    </Layout>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/auth" component={AuthPage} />
      {/* Public invite accept page — no auth needed */}
      <Route path="/invite/:code" component={InviteAccept} />

      {/* Main */}
      <Route path="/" component={() => <ProtectedRoute component={Home} />} />
      <Route path="/services" component={() => <ProtectedRoute component={Services} />} />

      {/* Rides */}
      <Route path="/rides" component={() => <ProtectedRoute component={Rides} />} />
      <Route path="/rides/:id" component={() => <ProtectedRoute component={RideDetail} />} />

      {/* Group & subscriptions */}
      <Route path="/group-trips" component={() => <ProtectedRoute component={GroupTrips} />} />
      <Route path="/group-trips/:id" component={() => <ProtectedRoute component={GroupTripDetail} />} />
      <Route path="/subscriptions" component={() => <ProtectedRoute component={Subscriptions} />} />

      {/* Invite trips */}
      <Route path="/invite-trips" component={() => <ProtectedRoute component={InviteTrips} />} />
      <Route path="/invite-trips/:id" component={() => <ProtectedRoute component={InviteTripDetail} />} />

      {/* Rentals & drivers */}
      <Route path="/rentals" component={() => <ProtectedRoute component={Rentals} />} />
      <Route path="/hire-driver" component={() => <ProtectedRoute component={HireDriver} />} />

      {/* New 8 services */}
      <Route path="/loved-ones" component={() => <ProtectedRoute component={LovedOnes} />} />
      <Route path="/delivery" component={() => <ProtectedRoute component={Delivery} />} />
      <Route path="/school-transport" component={() => <ProtectedRoute component={SchoolTransport} />} />
      <Route path="/medical-transport" component={() => <ProtectedRoute component={MedicalTransport} />} />
      <Route path="/corporate" component={() => <ProtectedRoute component={Corporate} />} />
      <Route path="/hajj-umrah" component={() => <ProtectedRoute component={HajjUmrah} />} />
      <Route path="/tourism" component={() => <ProtectedRoute component={Tourism} />} />
      <Route path="/events" component={() => <ProtectedRoute component={Events} />} />

      {/* Wallet */}
      <Route path="/wallet" component={() => <ProtectedRoute component={Wallet} />} />

      {/* Portals */}
      <Route path="/owner-portal" component={() => <ProtectedRoute component={OwnerPortal} />} />
      <Route path="/business-portal" component={() => <ProtectedRoute component={BusinessPortal} />} />

      {/* Admin & driver */}
      <Route path="/driver-portal" component={() => <ProtectedRoute component={DriverPortal} />} />
      <Route path="/dashboard" component={() => <ProtectedRoute component={Dashboard} />} />
      <Route path="/admin" component={() => <ProtectedRoute component={AdminDashboard} adminOnly />} />
      <Route path="/drivers" component={() => <ProtectedRoute component={Drivers} />} />

      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <AuthProvider>
            <Router />
          </AuthProvider>
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
