import { useRoute } from "wouter";
import { useGetInviteTrip, useUpdateInviteTrip, useConfirmInviteTrip } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Copy, MapPin, Calendar, Users, Check, X, AlertCircle, Share2 } from "lucide-react";

export default function InviteTripDetail() {
  const [, params] = useRoute("/invite-trips/:id");
  const id = parseInt(params?.id ?? "0");
  const { data: trip, refetch } = useGetInviteTrip(id);
  const updateMutation = useUpdateInviteTrip();
  const confirmMutation = useConfirmInviteTrip();
  const { toast } = useToast();

  if (!trip) {
    return (
      <div className="flex items-center justify-center min-h-[200px] text-muted-foreground">
        جاري التحميل...
      </div>
    );
  }

  const copyLink = () => {
    const url = `${window.location.origin}/invite/${trip.inviteCode}`;
    navigator.clipboard.writeText(url);
    toast({ title: "تم نسخ رابط الدعوة!" });
  };

  const handleConfirm = async () => {
    await confirmMutation.mutateAsync({ inviteTripId: id });
    toast({ title: "تم تأكيد الرحلة!" });
    refetch();
  };

  const handleCancel = async () => {
    await updateMutation.mutateAsync({ inviteTripId: id, data: { status: "cancelled" } });
    toast({ title: "تم إلغاء الرحلة" });
    refetch();
  };

  const guests = trip.guests ?? [];
  const accepted = guests.filter((g: any) => g.status === "accepted");
  const pending = guests.filter((g: any) => g.status === "pending");
  const declined = guests.filter((g: any) => g.status === "declined");

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-foreground">{trip.title}</h1>
          <Badge className="mt-1">{trip.status}</Badge>
        </div>
        <Button variant="outline" onClick={copyLink} className="gap-2">
          <Copy className="h-4 w-4" />
          مشاركة الرابط
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>تفاصيل الرحلة</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-2 text-sm">
            <MapPin className="h-4 w-4 text-primary" />
            <span>{trip.fromAddress} ← {trip.toAddress}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="h-4 w-4 text-primary" />
            <span>{new Date(trip.scheduledAt).toLocaleString("ar-SA")}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Users className="h-4 w-4 text-primary" />
            <span>الضيوف: {accepted.length} / {trip.maxGuests}</span>
          </div>
          {trip.notes && (
            <div className="flex items-start gap-2 text-sm text-muted-foreground bg-muted p-3 rounded-lg">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{trip.notes}</span>
            </div>
          )}
          <div className="pt-2 p-3 rounded-lg bg-muted flex items-center gap-3">
            <Share2 className="h-4 w-4 text-primary" />
            <div className="flex-1 min-w-0">
              <p className="text-xs text-muted-foreground mb-1">رابط الدعوة</p>
              <p className="text-sm font-mono truncate">{window.location.origin}/invite/{trip.inviteCode}</p>
            </div>
            <Button size="sm" variant="ghost" onClick={copyLink}>نسخ</Button>
          </div>
        </CardContent>
      </Card>

      {/* Guests */}
      <Card>
        <CardHeader>
          <CardTitle>قائمة الضيوف ({guests.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {guests.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">لا يوجد ضيوف بعد. شارك الرابط!</p>
          ) : (
            <div className="space-y-3">
              {guests.map((guest: any) => (
                <div key={guest.id} className="flex items-center justify-between p-3 rounded-lg bg-muted">
                  <div>
                    <p className="font-medium text-sm">{guest.name}</p>
                    <p className="text-xs text-muted-foreground">{guest.phone}</p>
                    {guest.pickupAddress && (
                      <p className="text-xs text-muted-foreground mt-0.5">نقطة الالتقاط: {guest.pickupAddress}</p>
                    )}
                  </div>
                  <div>
                    {guest.status === "accepted" && (
                      <span className="flex items-center gap-1 text-xs text-green-600 font-medium">
                        <Check className="h-3 w-3" /> قبل
                      </span>
                    )}
                    {guest.status === "declined" && (
                      <span className="flex items-center gap-1 text-xs text-red-600 font-medium">
                        <X className="h-3 w-3" /> رفض
                      </span>
                    )}
                    {guest.status === "pending" && (
                      <span className="text-xs text-yellow-600 font-medium">بانتظار الرد</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {trip.status === "open" && (
        <div className="flex gap-3">
          <Button onClick={handleConfirm} className="flex-1" disabled={confirmMutation.isPending}>
            {confirmMutation.isPending ? "جاري التأكيد..." : "تأكيد الرحلة"}
          </Button>
          <Button variant="destructive" onClick={handleCancel} className="flex-1" disabled={updateMutation.isPending}>
            إلغاء الرحلة
          </Button>
        </div>
      )}
    </div>
  );
}
