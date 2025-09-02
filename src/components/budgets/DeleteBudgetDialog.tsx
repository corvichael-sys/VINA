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
import { Budget } from "@/types/budget";
import { useState } from "react";
import { format } from "date-fns";

interface DeleteBudgetDialogProps {
  budget: Budget;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

export const DeleteBudgetDialog = ({ budget, isOpen, onOpenChange }: DeleteBudgetDialogProps) => {
  const { user } = useSession();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    const { error } = await supabase
      .from("budgets")
      .delete()
      .eq("id", budget.id);

    setIsDeleting(false);

    if (error) {
      toast({ variant: "destructive", title: "Failed to delete budget", description: error.message });
    } else {
      toast({ title: "Success!", description: "Budget entry has been deleted." });
      queryClient.invalidateQueries({ queryKey: ["budgets", user?.id] });
    }
    onOpenChange(false);
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete the budget entry for <span className="font-semibold">{budget.category}</span> in <span className="font-semibold">{format(new Date(budget.month + "-01"), "MMMM yyyy")}</span>.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction asChild>
            <Button onClick={handleDelete} disabled={isDeleting} variant="destructive">
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};