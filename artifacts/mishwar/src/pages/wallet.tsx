import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { customFetch } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import {
  Wallet as WalletIcon,
  Plus,
  ArrowDownCircle,
  ArrowUpCircle,
  CreditCard,
  TrendingUp,
  Receipt,
  Clock,
  CheckCircle2,
  XCircle,
} from "lucide-react";

const formatSAR = (halalas: number) => {
  const sar = halalas / 100;
  return new Intl.NumberFormat("ar-SA", { style: "currency", currency: "SAR", minimumFractionDigits: 2 }).format(sar);
};

const formatDate = (s: string) => new Intl.DateTimeFormat("ar-SA", { dateStyle: "medium", timeStyle: "short" }).format(new Date(s));

const txTypeLabel: Record<string, string> = {
  topup: "شحن المحفظة",
  ride_payment: "دفع رحلة",
  subscription_payment: "دفع اشتراك",
  rental_payment: "دفع إيجار",
  refund: "استرداد",
  payout: "صرف للسائق",
  adjustment: "تسوية",
};

const statusLabel: Record<string, { label: string; color: string }> = {
  pending: { label: "قيد المعالجة", color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200" },
  completed: { label: "مكتمل", color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" },
  succeeded: { label: "ناجح", color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" },
  failed: { label: "فشل", color: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200" },
  reversed: { label: "ملغى", color: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200" },
  refunded: { label: "مسترد", color: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200" },
  canceled: { label: "ملغى", color: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200" },
  processing: { label: "جاري المعالجة", color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200" },
};

function StatCard({ title, value, icon: Icon, color = "text-primary", sub }: any) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className={`text-2xl font-bold mt-1 ${color}`}>{value}</p>
            {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
          </div>
          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
            <Icon className="h-6 w-6 text-primary" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function TopUpCard() {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [customAmount, setCustomAmount] = useState("");

  const topup = useMutation({
    mutationFn: (sar: number) =>
      customFetch("/api/wallet/topup", {
        method: "POST",
        body: JSON.stringify({ amount: Math.round(sar * 100) }),
        headers: { "Content-Type": "application/json" },
      }).then((r: Response) => r.json()),
    onSuccess: () => {
      toast({ title: "تم إنشاء طلب الشحن", description: "سيتم تحويلك لصفحة الدفع بمجرد ربط Stripe" });
      qc.invalidateQueries({ queryKey: ["/api/wallet/payments"] });
      qc.invalidateQueries({ queryKey: ["/api/wallet/me"] });
      setCustomAmount("");
    },
    onError: () => toast({ title: "فشل إنشاء طلب الشحن", variant: "destructive" }),
  });

  const quickAmounts = [50, 100, 200, 500];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Plus className="h-5 w-5" /> شحن المحفظة
        </CardTitle>
        <CardDescription>اختر مبلغ الشحن أو أدخله يدوياً</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {quickAmounts.map((amt) => (
            <Button
              key={amt}
              variant="outline"
              onClick={() => topup.mutate(amt)}
              disabled={topup.isPending}
              data-testid={`button-topup-${amt}`}
              className="h-12 font-bold"
            >
              {amt} ر.س
            </Button>
          ))}
        </div>
        <div className="flex items-end gap-2">
          <div className="flex-1">
            <Label htmlFor="custom-amount">مبلغ مخصص (ر.س)</Label>
            <Input
              id="custom-amount"
              type="number"
              min="10"
              max="10000"
              step="1"
              value={customAmount}
              onChange={(e) => setCustomAmount(e.target.value)}
              placeholder="أدخل المبلغ بالريال"
              className="mt-1"
              data-testid="input-custom-amount"
            />
          </div>
          <Button
            onClick={() => {
              const n = Number(customAmount);
              if (!n || n < 10) {
                toast({ title: "أدخل مبلغاً 10 ر.س فأكثر", variant: "destructive" });
                return;
              }
              topup.mutate(n);
            }}
            disabled={topup.isPending}
            className="h-10"
            data-testid="button-topup-custom"
          >
            <CreditCard className="h-4 w-4 ml-2" /> شحن
          </Button>
        </div>
        <p className="text-xs text-muted-foreground bg-muted/50 rounded-lg p-3">
          ⚡ الدفع آمن عبر Stripe. سيتم إضافة المبلغ للمحفظة فور إتمام الدفع.
        </p>
      </CardContent>
    </Card>
  );
}

function TransactionsList() {
  const { data, isLoading } = useQuery<{ items: any[] }>({
    queryKey: ["/api/wallet/transactions"],
    queryFn: () => customFetch("/api/wallet/transactions").then((r: Response) => r.json()),
  });

  if (isLoading) return <div className="text-center py-8 text-muted-foreground">جاري التحميل...</div>;
  const items = data?.items ?? [];
  if (items.length === 0)
    return (
      <Card>
        <CardContent className="py-12 text-center text-muted-foreground">
          <Receipt className="h-12 w-12 mx-auto mb-3 opacity-30" />
          <p>لا توجد معاملات بعد</p>
        </CardContent>
      </Card>
    );

  return (
    <div className="space-y-2">
      {items.map((tx: any) => {
        const isCredit = tx.amount > 0;
        const Icon = isCredit ? ArrowDownCircle : ArrowUpCircle;
        const color = isCredit ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400";
        const status = statusLabel[tx.status] ?? { label: tx.status, color: "bg-gray-100 text-gray-800" };
        return (
          <Card key={tx.id} data-testid={`tx-${tx.id}`}>
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`h-10 w-10 rounded-full flex items-center justify-center bg-muted shrink-0`}>
                    <Icon className={`h-5 w-5 ${color}`} />
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold truncate">{txTypeLabel[tx.type] ?? tx.type}</p>
                    <p className="text-xs text-muted-foreground">{formatDate(tx.createdAt)}</p>
                    {tx.description && <p className="text-xs text-muted-foreground truncate">{tx.description}</p>}
                  </div>
                </div>
                <div className="text-left shrink-0">
                  <p className={`font-bold ${color}`}>
                    {isCredit ? "+" : ""}
                    {formatSAR(tx.amount)}
                  </p>
                  <Badge variant="outline" className={`text-[10px] ${status.color}`}>
                    {status.label}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

function PaymentsList() {
  const { data, isLoading } = useQuery<{ items: any[] }>({
    queryKey: ["/api/wallet/payments"],
    queryFn: () => customFetch("/api/wallet/payments").then((r: Response) => r.json()),
  });
  if (isLoading) return <div className="text-center py-8 text-muted-foreground">جاري التحميل...</div>;
  const items = data?.items ?? [];
  if (items.length === 0)
    return (
      <Card>
        <CardContent className="py-12 text-center text-muted-foreground">
          <CreditCard className="h-12 w-12 mx-auto mb-3 opacity-30" />
          <p>لا توجد عمليات دفع بعد</p>
        </CardContent>
      </Card>
    );
  return (
    <div className="space-y-2">
      {items.map((p: any) => {
        const status = statusLabel[p.status] ?? { label: p.status, color: "bg-gray-100 text-gray-800" };
        const StatusIcon = p.status === "succeeded" ? CheckCircle2 : p.status === "failed" ? XCircle : Clock;
        return (
          <Card key={p.id} data-testid={`payment-${p.id}`}>
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <StatusIcon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold">{p.purpose === "wallet_topup" ? "شحن المحفظة" : p.purpose}</p>
                    <p className="text-xs text-muted-foreground">{formatDate(p.createdAt)}</p>
                    <p className="text-xs text-muted-foreground">عبر {p.provider === "stripe" ? "Stripe" : "يدوي"}</p>
                  </div>
                </div>
                <div className="text-left">
                  <p className="font-bold">{formatSAR(p.amount)}</p>
                  <Badge variant="outline" className={`text-[10px] ${status.color}`}>
                    {status.label}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

export default function WalletPage() {
  const { data: summary } = useQuery<any>({
    queryKey: ["/api/wallet/summary"],
    queryFn: () => customFetch("/api/wallet/summary").then((r: Response) => r.json()),
  });

  return (
    <div className="space-y-6" data-testid="page-wallet">
      <div>
        <h1 className="text-3xl font-black tracking-tight flex items-center gap-2">
          <WalletIcon className="h-7 w-7 text-primary" /> محفظتي
        </h1>
        <p className="text-muted-foreground mt-1">شحن، دفع، ومتابعة جميع معاملاتك المالية</p>
      </div>

      <Card className="bg-gradient-to-l from-primary to-primary/80 text-primary-foreground">
        <CardContent className="pt-6">
          <p className="text-sm opacity-90">الرصيد الحالي</p>
          <p className="text-4xl font-black mt-1" data-testid="text-balance">
            {summary ? formatSAR(summary.balance ?? 0) : "—"}
          </p>
          <p className="text-xs opacity-80 mt-2">{summary?.transactionCount ?? 0} معاملة منذ الانضمام</p>
        </CardContent>
      </Card>

      <div className="grid sm:grid-cols-2 gap-4">
        <StatCard
          title="إجمالي الشحن"
          value={summary ? formatSAR(summary.totalTopup ?? 0) : "—"}
          icon={TrendingUp}
          color="text-green-600 dark:text-green-400"
        />
        <StatCard
          title="إجمالي المصروف"
          value={summary ? formatSAR(summary.totalSpent ?? 0) : "—"}
          icon={Receipt}
          color="text-red-600 dark:text-red-400"
        />
      </div>

      <TopUpCard />

      <Tabs defaultValue="transactions">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="transactions" data-testid="tab-transactions">سجل المعاملات</TabsTrigger>
          <TabsTrigger value="payments" data-testid="tab-payments">عمليات الدفع</TabsTrigger>
        </TabsList>
        <TabsContent value="transactions" className="mt-4">
          <TransactionsList />
        </TabsContent>
        <TabsContent value="payments" className="mt-4">
          <PaymentsList />
        </TabsContent>
      </Tabs>
    </div>
  );
}
