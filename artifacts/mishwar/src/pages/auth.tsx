import { useState } from "react";
import { useLoginUser, useRegisterUser } from "@workspace/api-client-react";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function AuthPage() {
  const { setTokenAndRedirect } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("login");

  const loginMutation = useLoginUser();
  const registerMutation = useRegisterUser();

  const onLogin = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    loginMutation.mutate(
      {
        data: {
          phone: formData.get("phone") as string,
          password: formData.get("password") as string,
        },
      },
      {
        onSuccess: (data) => {
          setTokenAndRedirect(data.token, "/");
        },
        onError: () => {
          toast({ title: "خطأ في تسجيل الدخول", variant: "destructive" });
        },
      }
    );
  };

  const onRegister = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    registerMutation.mutate(
      {
        data: {
          name: formData.get("name") as string,
          phone: formData.get("phone") as string,
          password: formData.get("password") as string,
          role: formData.get("role") as any,
        },
      },
      {
        onSuccess: (data) => {
          setTokenAndRedirect(data.token, "/");
        },
        onError: () => {
          toast({ title: "خطأ في إنشاء الحساب", variant: "destructive" });
        },
      }
    );
  };

  return (
    <div className="min-h-[100dvh] flex items-center justify-center bg-muted p-4">
      <Card className="w-full max-w-md shadow-xl border-0">
        <CardHeader className="text-center pb-8">
          <CardTitle className="text-4xl font-black text-primary">مشوار</CardTitle>
          <CardDescription className="text-base mt-2">رفيق دربك اليومي</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} dir="rtl">
            <TabsList className="grid w-full grid-cols-2 mb-8">
              <TabsTrigger value="login" data-testid="tab-login">تسجيل الدخول</TabsTrigger>
              <TabsTrigger value="register" data-testid="tab-register">حساب جديد</TabsTrigger>
            </TabsList>
            <TabsContent value="login">
              <form onSubmit={onLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="login-phone">رقم الجوال</Label>
                  <Input id="login-phone" name="phone" required placeholder="05XXXXXXXX" data-testid="input-login-phone" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="login-password">كلمة المرور</Label>
                  <Input id="login-password" name="password" type="password" required data-testid="input-login-password" />
                </div>
                <Button type="submit" className="w-full py-6 text-lg mt-4" disabled={loginMutation.isPending} data-testid="button-login">
                  {loginMutation.isPending ? "جاري الدخول..." : "دخول"}
                </Button>
              </form>
            </TabsContent>
            <TabsContent value="register">
              <form onSubmit={onRegister} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="register-name">الاسم الكامل</Label>
                  <Input id="register-name" name="name" required data-testid="input-register-name" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="register-phone">رقم الجوال</Label>
                  <Input id="register-phone" name="phone" required placeholder="05XXXXXXXX" data-testid="input-register-phone" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="register-password">كلمة المرور</Label>
                  <Input id="register-password" name="password" type="password" required data-testid="input-register-password" />
                </div>
                <div className="space-y-2">
                  <Label>نوع الحساب</Label>
                  <Select name="role" defaultValue="passenger">
                    <SelectTrigger dir="rtl" data-testid="select-role">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent dir="rtl">
                      <SelectItem value="passenger">راكب</SelectItem>
                      <SelectItem value="driver">سائق</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button type="submit" className="w-full py-6 text-lg mt-4" disabled={registerMutation.isPending} data-testid="button-register">
                  {registerMutation.isPending ? "جاري الإنشاء..." : "إنشاء حساب"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
