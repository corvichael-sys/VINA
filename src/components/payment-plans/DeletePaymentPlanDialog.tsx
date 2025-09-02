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
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { PaymentPlan } from "@/types/paymentPlan";

interface DeletePaymentPlanDialogProps {
  plan: PaymentPlan;
  children: React.ReactNode;
}

export const DeletePaymentPlanDialog = ({ plan, children }: DeletePaymentPlanDialogProps) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const deleteMutation = useMutation({
    mutationFn: async (planId: string) => {
      // Due to ON DELETE CASCADE, deleting the payment_plan will also delete
      // associated plan_items and payment_plan_debts.
      const { error } = await supabase.from("payment_plans").delete().eq("id", planId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payment_plans"] });
      queryClient.invalidateQueries({ queryKey: ["plan_items"] }); // Invalidate plan items as they are cascaded
      toast({ title: "Payment plan deleted", description: `The plan "${plan.name}" has been removed.` });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Failed to delete payment plan",
        description: error.message,
      });
    },
  });

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>{children}</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete the{" "}
            <span className="font-semibold text-foreground">"{plan.name}"</span> payment plan and all its associated payment schedule items.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={() => deleteMutation.mutate(plan.id)}
            disabled={deleteMutation.isPending}
            className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
          >
            {deleteMutation.isPending ? "Deleting..." : "Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};