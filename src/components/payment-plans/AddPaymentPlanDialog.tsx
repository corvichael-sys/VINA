import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { useState } from "react";
import { useSession } from "@/context/SessionContext";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { PlusCircle, CalendarIcon } from "lucide-react";
import { format, addMonths } from "date-fns";
import { cn } from "@/lib/utils";
import { Debt } from "@/types/debt";
import { ResponsiveDialog } from "@/components/ui/responsive-dialog";
import { DrawerClose } from "@/components/ui/drawer";

const planFormSchema = z.object({
  name: z.string().min(1, "Plan name is required."),
  total_amount: z.coerce.number().min(1, "Total amount must be greater than 0."),
  number_of_payments: z.coerce.number().min(1, "Select the number of payments."),
  final_due_date: z.date({ required_error: "A final due date is required." }),
  debt_id: z.string().optional().nullable(),
});

type PlanFormValues = z.infer<typeof planFormSchema>;

const fetchDebts = async (userId: string) => {
  const { data, error } = await supabase.from("debts").select("id, name").eq("user_id", userId).eq("status", "active");
  if (error) throw error;
  return data as Pick<Debt, "id" | "name">[];
};

export const AddPaymentPlanDialog = () => {
  const { user } = useSession();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<PlanFormValues>({
    resolver: zodResolver(planFormSchema),
    defaultValues: {
      debt_id: "",
    },
  });

  const { data: debts, isLoading: areDebtsLoading } = useQuery({
    queryKey: ["debts", user?.id],
    queryFn: () => fetchDebts(user!.id),
    enabled: !!user,
  });

  const onSubmit = async (data: PlanFormValues) => {
    if (!user) return;
    setIsSubmitting(true);

    const planData = {
      user_id: user.id,
      name: data.name,
      total_amount: data.total_amount,
      number_of_payments: data.number_of_payments,
      final_due_date: format(data.final_due_date, 'yyyy-MM-dd'),
      strategy: 'simple',
    };

    const { data: newPlan, error: planError } = await supabase
      .from("payment_plans")
      .insert(planData)
      .select()
      .single();

    if (planError || !newPlan) {
      toast({ variant: "destructive", title: "Failed to create plan", description: planError?.message });
      setIsSubmitting(false);
      return;
    }

    const paymentAmount = data.total_amount / data.number_of_payments;
    const planItems = Array.from({ length: data.number_of_payments }, (_, i) => {
      const paymentDate = addMonths(data.final_due_date, -(data.number_of_payments - 1 - i));
      return {
        plan_id: newPlan.id,
        user_id: user.id,
        scheduled_date: format(paymentDate, 'yyyy-MM-dd'),
        amount_planned: paymentAmount,
        paid: false,
        debt_id: data.debt_id || null,
      };
    });

    const { error: itemsError } = await supabase.from("plan_items").insert(planItems);

    setIsSubmitting(false);

    if (itemsError) {
      toast({ variant: "destructive", title: "Failed to create plan payments", description: itemsError.message });
    } else {
      toast({ title: "Success!", description: "Your new payment plan has been created." });
      queryClient.invalidateQueries({ queryKey: ["payment_plans"] });
      queryClient.invalidateQueries({ queryKey: ["plan_items"] });
      form.reset();
      setOpen(false);
    }
  };

  return (
    <ResponsiveDialog
      open={open}
      onOpenChange={setOpen}
      trigger={
        <Button>
          <PlusCircle className="mr-2" />
          Create New Plan
        </Button>
      }
      title="Create a New Payment Plan"
      description="Fill out the details below to set up your plan."
      drawerFooter={
        <DrawerClose asChild>
          <Button variant="outline">Cancel</Button>
        </DrawerClose>
      }
    >
      <div className="pt-4 sm:pt-0">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField control={form.control} name="name" render={({ field }) => (
              <FormItem>
                <FormLabel>Plan Name</FormLabel>
                <FormControl><Input placeholder="e.g., New Laptop Fund" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="total_amount" render={({ field }) => (
              <FormItem>
                <FormLabel>Total Amount</FormLabel>
                <FormControl><Input type="number" placeholder="1200.00" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="number_of_payments" render={({ field }) => (
              <FormItem>
                <FormLabel>Number of Payments</FormLabel>
                <Select onValueChange={(value) => field.onChange(parseInt(value))} defaultValue={String(field.value)}>
                  <FormControl><SelectTrigger><SelectValue placeholder="Select frequency" /></SelectTrigger></FormControl>
                  <SelectContent>
                    <SelectItem value="3">3 Payments</SelectItem>
                    <SelectItem value="6">6 Payments</SelectItem>
                    <SelectItem value="12">12 Payments</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="final_due_date" render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Final Due Date</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button variant={"outline"} className={cn("pl-3 text-left font-normal", !field.value && "text-muted-foreground")}>
                        {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="debt_id" render={({ field }) => (
              <FormItem>
                <FormLabel>Link to Debt (Optional)</FormLabel>
                <Select onValueChange={field.onChange} value={field.value || ""}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder={areDebtsLoading ? "Loading debts..." : "Select a debt"} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="">No Debt</SelectItem>
                    {debts?.map((debt) => (
                      <SelectItem key={debt.id} value={debt.id}>
                        {debt.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )} />
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Creating Plan..." : "Create Plan"}
            </Button>
          </form>
        </Form>
      </div>
    </ResponsiveDialog>
  );
};