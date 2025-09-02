import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { PaymentPlan } from "@/types/paymentPlan";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface DeletePaymentPlanDialogProps {
  plan: PaymentPlan;
  children: React.ReactNode;
  onSuccess: () => void;
}

export const DeletePaymentPlanDialog = ({ plan, children, onSuccess }: DeletePaymentPlanDialogProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleDelete = async () => {
    const { error } = await supabase.from("payment_plans").delete().eq("id", plan.id);

    if (error) {
      toast.error("Failed to delete payment plan. Please try again.");
    } else {
      toast.success("Payment plan deleted successfully.");
      onSuccess();
      setIsOpen(false);
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogTrigger asChild>{children}</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure you want to delete this payment plan?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete the "{plan.name}" payment plan and all associated data.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction asChild>
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};