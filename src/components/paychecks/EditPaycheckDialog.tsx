import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
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
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Paycheck } from "@/types/paycheck";
import { useSession } from "@/context/SessionContext";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

const paycheckFormSchema = z.object({
  amount: z.coerce.number().min(0.01, "Amount must be greater than 0."),
  date_received: z.date({ required_error: "A date is required." }),
  notes: z.string().optional().nullable(),
});

type PaycheckFormValues = z.infer<typeof paycheckFormSchema>;

interface EditPaycheckDialogProps {
  paycheck: Paycheck;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

export const EditPaycheckDialog = ({ paycheck, isOpen, onOpenChange }: EditPaycheckDialogProps) => {
  const { user } = useSession();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<PaycheckFormValues>({
    resolver: zodResolver(paycheckFormSchema),
  });

  useEffect(() => {
    if (paycheck) {
      form.reset({
        amount: paycheck.amount,
        date_received: new Date(paycheck.date_received),
        notes: paycheck.notes,
      });
    }
  }, [paycheck, form, isOpen]);

  const onSubmit = async (data: PaycheckFormValues) => {
    setIsSubmitting(true);
    const { error } = await supabase
      .from("paychecks")
      .update({
        ...data,
        notes: data.notes || null,
      })
      .eq("id", paycheck.id);

    setIsSubmitting(false);

    if (error) {
      toast({ variant: "destructive", title: "Failed to update paycheck", description: error.message });
    } else {
      toast({ title: "Success!", description: "Paycheck has been updated." });
      queryClient.invalidateQueries({ queryKey: ["paychecks", user?.id] });
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Paycheck</DialogTitle>
          <DialogDescription>
            Make changes to your paycheck here. Click save when you're done.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Amount</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="date_received"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Date Received</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) =>
                          date > new Date() || date < new Date("1900-01-01")
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
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