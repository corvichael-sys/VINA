import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { useSession } from "@/context/SessionContext";
import { useState } from "react";

interface DeleteAllTransactionsDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

export const DeleteAllTransactionsDialog = ({ isOpen, onOpenChange }: DeleteAllTransactionsDialogProps) => {
  const { user } = useSession();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!user) {
      toast({ variant: "destructive", title: "Error", description: "You must be logged in to perform this action." });
      return;
    }

    setIsDeleting(true);
    const { error } = await supabase
      .from("transactions")
      .delete()
      .eq("user_id", user.id);

    setIsDeleting(false);

    if (error) {
      toast({ variant: "destructive", title: "Failed to delete transactions", description: error.message });
    } else {
      toast({ title: "Success!", description: "All transaction history has been deleted." });
      // Invalidate all queries that might depend on transactions to refresh the entire app state
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["debts"] });
      queryClient.invalidateQueries({ queryKey: ["newDebts"] });
      queryClient.invalidateQueries({ queryKey: ["paychecks"] });
      queryClient.invalidateQueries({ queryKey: ["budgets"] });
      queryClient.invalidateQueries({ queryKey: ["paymentPlans"] });
      queryClient.invalidateQueries({ queryKey: ["plan_items"] });
    }
    onOpenChange(false);
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete your entire transaction history. All associated data on your dashboard and payment plans will be affected.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction asChild>
            <Button onClick={handleDelete} disabled={isDeleting} variant="destructive">
              {isDeleting ? "Deleting..." : "Yes, delete all transactions"}
            </Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};