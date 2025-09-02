import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { PlusCircle } from "lucide-react";
import { useState } from "react";

interface CreatePaymentPlanDialogProps {
  onSuccess?: () => void; // Added onSuccess prop
}

export const CreatePaymentPlanDialog = ({ onSuccess }: CreatePaymentPlanDialogProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleSuccess = () => {
    setIsOpen(false);
    onSuccess?.();
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          Create New Plan
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Payment Plan</DialogTitle>
        </DialogHeader>
        {/* Add your form for creating a payment plan here */}
        <p>Form to create a new payment plan will go here.</p>
        <Button onClick={handleSuccess}>Simulate Create</Button> {/* Placeholder for actual form submission */}
      </DialogContent>
    </Dialog>
  );
};