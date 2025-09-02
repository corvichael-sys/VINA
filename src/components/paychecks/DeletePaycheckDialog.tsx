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
import { Paycheck } from "@/types/paycheck";
import { useState } from "react";
import { format } from "date-fns";

interface DeletePaycheckDialogProps {
  paycheck: Paycheck;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

export const DeletePaycheckDialog = ({ paycheck, isOpen, onOpenChange }: DeletePaycheckDialogProps) => {
  const { user } = useSession();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    const { error } = await supabase
      .from("paychecks")
      .delete()
      .eq("id", paycheck.id);

    setIsDeleting(false);

    if (error) {
      toast({ variant: "destructive", title: "Failed to delete paycheck", description: error.message });
    } else {
      toast({ title: "Success!", description: "Paycheck has been deleted." });
      queryClient.invalidateQueries({ queryKey: ["paychecks", user?.id] });
    }
    onOpenChange(false);
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete the paycheck from <span className="font-semibold">{format(new Date(paycheck.date_received), "PPP")}</span>.
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