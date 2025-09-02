import { useState } from "react";
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
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface ResetAccountDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

export const ResetAccountDialog = ({ isOpen, onOpenChange }: ResetAccountDialogProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleReset = async () => {
    setIsLoading(true);
    const { error } = await supabase.functions.invoke('reset-user-data');
    setIsLoading(false);

    if (error) {
      toast({
        variant: "destructive",
        title: "Error Resetting Account",
        description: error.message || "An unexpected error occurred. Please try again.",
      });
    } else {
      toast({
        title: "Account Reset Successful",
        description: "All your data has been deleted. Your account is now like new.",
      });
      // Refresh the page to reflect the changes
      window.location.reload();
    }
    onOpenChange(false);
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete all of your data,
            including debts, budgets, transactions, and payment plans. Your account will be
            reset to its initial state.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleReset} disabled={isLoading} className="bg-destructive hover:bg-destructive/90">
            {isLoading ? "Resetting..." : "Yes, reset my account"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};