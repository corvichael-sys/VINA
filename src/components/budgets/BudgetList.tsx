import { Budget } from "@/types/budget";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { useState } from "react";
import { MoreHorizontal } from "lucide-react";
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { EditBudgetDialog } from "./EditBudgetDialog.tsx";
import { DeleteBudgetDialog } from "./DeleteBudgetDialog.tsx";
import { format } from "date-fns";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { Badge } from "@/components/ui/badge";

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
};

interface BudgetListProps {
  budgets: Budget[];
}

export const BudgetList = ({ budgets }: BudgetListProps) => {
  const [isEditDialogOpen, setEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedBudget, setSelectedBudget] = useState<Budget | null>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const handleEditClick = (budget: Budget) => {
    setSelectedBudget(budget);
    setEditDialogOpen(true);
  };

  const handleDeleteClick = (budget: Budget) => {
    setSelectedBudget(budget);
    setDeleteDialogOpen(true);
  };

  const markBudgetStatusMutation = useMutation({
    mutationFn: async ({ budget, newStatus }: { budget: Budget; newStatus: boolean }) => {
      const { error: budgetError } = await supabase
        .from('budgets')
        .update({ paid: newStatus })
        .eq('id', budget.id);
      if (budgetError) throw budgetError;

      if (newStatus) { // Marking as paid
        const { error: transactionError } = await supabase.from('transactions').insert({
          user_id: budget.user_id,
          date: new Date().toISOString(),
          type: 'expense',
          category: budget.category,
          amount: budget.planned_amount,
          memo: `Budgeted expense for ${budget.category}`,
          linked_budget_id: budget.id,
        });
        if (transactionError) {
          await supabase.from('budgets').update({ paid: false }).eq('id', budget.id);
          throw transactionError;
        }
      } else { // Marking as unpaid
        const { error: transactionError } = await supabase
          .from('transactions')
          .delete()
          .eq('linked_budget_id', budget.id);
        if (transactionError) {
          console.warn(`Failed to delete linked transaction for budget ${budget.id}:`, transactionError.message);
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["budgets"] });
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      toast({ title: "Budget status updated!" });
    },
    onError: (error: Error) => {
      toast({ variant: "destructive", title: "Failed to update budget status", description: error.message });
    },
  });

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Budget Entries</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Month</TableHead>
                <TableHead>Category</TableHead>
                <TableHead className="text-right">Planned Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {budgets.map((budget) => (
                <TableRow key={budget.id} className={budget.paid ? "text-muted-foreground" : ""}>
                  <TableCell className="font-medium">{format(new Date(budget.month + "-01"), "MMMM yyyy")}</TableCell>
                  <TableCell>{budget.category}</TableCell>
                  <TableCell className="text-right">{formatCurrency(budget.planned_amount)}</TableCell>
                  <TableCell>
                    <Badge variant={budget.paid ? 'default' : 'secondary'}>
                      {budget.paid ? 'Paid' : 'Pending'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          onClick={() => markBudgetStatusMutation.mutate({ budget, newStatus: !budget.paid })}
                          disabled={markBudgetStatusMutation.isPending}
                        >
                          {budget.paid ? 'Mark as Unpaid' : 'Mark as Paid'}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleEditClick(budget)}>
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDeleteClick(budget)} className="text-destructive focus:bg-destructive/90 focus:text-destructive-foreground">
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      {selectedBudget && (
        <>
          <EditBudgetDialog
            budget={selectedBudget}
            isOpen={isEditDialogOpen}
            onOpenChange={setEditDialogOpen}
          />
          <DeleteBudgetDialog
            budget={selectedBudget}
            isOpen={isDeleteDialogOpen}
            onOpenChange={setDeleteDialogOpen}
          />
        </>
      )}
    </>
  );
};