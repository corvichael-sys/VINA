import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Debt } from "@/types/debt";
import { useSession } from "@/context/SessionContext";

const debtFormSchema = z.object({
  name: z.string().min(1, "Debt name is required."),
  current_balance: z.coerce.number().min(0.01, "Balance must be greater than 0."),
  severity: z.enum(["Low", "Medium", "High"]).optional().nullable(),
  notes: z.string().optional().nullable(),
});

type DebtFormValues = z.infer<typeof debtFormSchema>;

interface EditDebtDialogProps {
  debt: Debt;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

export const EditDebtDialog = ({ debt, isOpen, onOpenChange }: EditDebtDialogProps) => {
  const { user } = useSession();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<DebtFormValues>({
    resolver: zodResolver(debtFormSchema),
  });

  useEffect(() => {
    if (debt) {
      form.reset({
        name: debt.name,
        current_balance: debt.current_balance,
        severity: debt.severity,
        notes: debt.notes,
      });
    }
  }, [debt, form, isOpen]);

  const onSubmit = async (data: DebtFormValues) => {
    setIsSubmitting(true);
    const { error } = await supabase
      .from("debts")
      .update({
        ...data,
        severity: data.severity || null,
        notes: data.notes || null,
      })
      .eq("id", debt.id);

    setIsSubmitting(false);

    if (error) {
      toast({ variant: "destructive", title: "Failed to update debt", description: error.message });
    } else {
      toast({ title: "Success!", description: "Debt has been updated." });
      queryClient.invalidateQueries({ queryKey: ["debts", user?.id] });
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Debt</DialogTitle>
          <DialogDescription>
            Make changes to your debt here. Click save when you're done.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Debt Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Credit Card" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="current_balance"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Current Balance</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="1500.00" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="severity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Severity</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value || ""}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select severity" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Low">Low</SelectItem>
                      <SelectItem value="Medium">Medium</SelectItem>
                      <SelectItem value="High">High</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Any additional notes..." {...field} value={field.value || ''} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save Changes"}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};