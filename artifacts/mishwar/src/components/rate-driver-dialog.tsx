import { useState } from "react";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { customFetch } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";

interface Props {
  rideId: number;
  ratedName: string;
  trigger?: React.ReactNode;
}

export function RateDriverDialog({ rideId, ratedName, trigger }: Props) {
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();
  const qc = useQueryClient();

  async function submit() {
    if (rating < 1) {
      toast({ title: "اختر تقييماً من نجمة إلى 5 نجوم", variant: "destructive" });
      return;
    }
    setSubmitting(true);
    try {
      await customFetch("/api/ratings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rideId, rating, comment: comment || undefined }),
      });
      toast({ title: "شكراً لتقييمك!" });
      setOpen(false);
      setRating(0);
      setComment("");
      qc.invalidateQueries();
    } catch (e: any) {
      const msg = e?.message?.includes("409") ? "لقد قمت بتقييم هذه الرحلة مسبقاً" : "تعذر إرسال التقييم";
      toast({ title: msg, variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? <Button variant="outline" size="lg">قيّم الرحلة</Button>}
      </DialogTrigger>
      <DialogContent dir="rtl">
        <DialogHeader>
          <DialogTitle>قيّم {ratedName}</DialogTitle>
          <DialogDescription>كيف كانت تجربتك؟ تقييمك يساعد الآخرين.</DialogDescription>
        </DialogHeader>
        <div className="flex flex-col items-center gap-4 py-4">
          <div className="flex gap-2" dir="ltr">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                type="button"
                onMouseEnter={() => setHover(n)}
                onMouseLeave={() => setHover(0)}
                onClick={() => setRating(n)}
                className="transition-transform hover:scale-110"
                aria-label={`تقييم ${n} نجوم`}
                data-testid={`star-${n}`}
              >
                <Star
                  className={`h-10 w-10 ${
                    n <= (hover || rating) ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground/40"
                  }`}
                />
              </button>
            ))}
          </div>
          <p className="text-sm text-muted-foreground h-5">
            {rating > 0 && ["", "ضعيف", "مقبول", "جيد", "ممتاز", "رائع"][rating]}
          </p>
          <Textarea
            placeholder="اترك تعليقاً (اختياري)"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            maxLength={500}
            className="resize-none"
            rows={3}
          />
        </div>
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => setOpen(false)} disabled={submitting}>إلغاء</Button>
          <Button onClick={submit} disabled={submitting || rating < 1}>
            {submitting ? "جاري الإرسال..." : "إرسال التقييم"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
