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
import { Debt } from "@/types/debt";
import { useState } from "react";

interface DeleteDebtDialogProps {
  debt: Debt;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

export const DeleteDebtDialog = ({ debt, isOpen, onOpenChange }: DeleteDebtDialogProps) => {
  const { user } = useSession();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    const { error } = await supabase
      .from("debts")
      .delete()
      .eq("id", debt.id);

    setIsDeleting(false);

    if (error) {
      toast({ variant: "destructive", title: "Failed to delete debt", description: error.message });
    } else {
      toast({ title: "Success!", description: "Debt has been deleted." });
      queryClient.invalidateQueries({ queryKey: ["debts", user?.id] });
    }
    onOpenChange(false);
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete the debt named <span className="font-semibold">{debt.name}</span>.
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