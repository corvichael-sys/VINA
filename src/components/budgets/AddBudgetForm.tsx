import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import { useState } from "react";
import { useSession } from "@/context/SessionContext";
import { useQueryClient } from "@tanstack/react-query";
import { PlusCircle } from "lucide-react";
import { format } from "date-fns";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const budgetFormSchema = z.object({
  month: z.string().min(1, "Month is required."),
  category: z.string().min(1, "Category is required."),
  planned_amount: z.coerce.number().min(0.01, "Amount must be greater than 0."),
});

type BudgetFormValues = z.infer<typeof budgetFormSchema>;

const generateMonthOptions = () => {
  const options = [];
  const today = new Date();
  for (let i = -6; i <= 12; i++) { // 6 months in the past, 12 months in the future
    const date = new Date(today.getFullYear(), today.getMonth() + i, 1);
    options.push({
      value: format(date, "yyyy-MM"),
      label: format(date, "MMMM yyyy"),
    });
  }
  return options;
};

export const AddBudgetForm = () => {
  const { user } = useSession();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<BudgetFormValues>({
    resolver: zodResolver(budgetFormSchema),
    defaultValues: {
      month: format(new Date(), "yyyy-MM"), // Default to current month
      category: "",
      planned_amount: 0,
    },
  });

  const onSubmit = async (data: BudgetFormValues) => {
    if (!user) {
      toast({ variant: "destructive", title: "Error", description: "You must be logged in." });
      return;
    }
    setIsSubmitting(true);

    const { error } = await supabase.from("budgets").insert([
      {
        ...data,
        user_id: user.id,
      },
    ]);

    setIsSubmitting(false);

    if (error) {
      toast({ variant: "destructive", title: "Failed to add budget", description: error.message });
    } else {
      toast({ title: "Success!", description: "Your new budget entry has been added." });
      queryClient.invalidateQueries({ queryKey: ["budgets", user.id] });
      form.reset({
        month: format(new Date(), "yyyy-MM"),
        category: "",
        planned_amount: 0,
      });
      setOpen(false);
    }
  };

  const monthOptions = generateMonthOptions();

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <PlusCircle className="mr-2" />
          Add Budget
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add a New Budget Entry</DialogTitle>
          <DialogDescription>
            Enter the details for your budget below.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="month"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Month</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a month" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {monthOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Groceries, Rent" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="planned_amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Planned Amount</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="500.00" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Adding..." : "Add Budget"}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};