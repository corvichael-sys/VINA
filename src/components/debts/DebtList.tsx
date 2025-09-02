import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/context/SessionContext";
import { Debt } from "@/types/debt";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
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
import { EditDebtDialog } from "./EditDebtDialog";
import { DeleteDebtDialog } from "./DeleteDebtDialog";

const fetchDebts = async (userId: string | undefined): Promise<Debt[]> => {
  if (!userId) return [];

  const { data, error } = await supabase
    .from("debts")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return data as Debt[];
};

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
};

const getSeverityBadgeVariant = (severity: Debt['severity']) => {
  switch (severity) {
    case 'High':
      return 'destructive';
    case 'Medium':
      return 'secondary';
    default:
      return 'outline';
  }
};

export const DebtList = () => {
  const { user } = useSession();
  const { data: debts, isLoading, isError } = useQuery({
    queryKey: ["debts", user?.id],
    queryFn: () => fetchDebts(user?.id),
    enabled: !!user,
  });

  const [isEditDialogOpen, setEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedDebt, setSelectedDebt] = useState<Debt | null>(null);

  const handleEditClick = (debt: Debt) => {
    setSelectedDebt(debt);
    setEditDialogOpen(true);
  };

  const handleDeleteClick = (debt: Debt) => {
    setSelectedDebt(debt);
    setDeleteDialogOpen(true);
  };

  if (isLoading) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    );
  }

  if (isError) {
    return <p className="text-destructive">Failed to load debts.</p>;
  }

  if (!debts || debts.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-semibold">No Debts Yet</h3>
        <p className="text-muted-foreground">Click "Add New Debt" to get started.</p>
      </div>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Your Debts</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead className="text-right">Balance</TableHead>
                <TableHead>Severity</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {debts.map((debt) => (
                <TableRow key={debt.id}>
                  <TableCell className="font-medium">{debt.name}</TableCell>
                  <TableCell className="text-right">{formatCurrency(debt.current_balance)}</TableCell>
                  <TableCell>
                    {debt.severity && <Badge variant={getSeverityBadgeVariant(debt.severity)}>{debt.severity}</Badge>}
                  </TableCell>
                  <TableCell>
                    <Badge variant={debt.status === 'paid' ? 'default' : 'secondary'}>{debt.status}</Badge>
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
                        <DropdownMenuItem onClick={() => handleEditClick(debt)}>
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDeleteClick(debt)} className="text-destructive focus:bg-destructive/90 focus:text-destructive-foreground">
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
      {selectedDebt && (
        <>
          <EditDebtDialog
            debt={selectedDebt}
            isOpen={isEditDialogOpen}
            onOpenChange={setEditDialogOpen}
          />
          <DeleteDebtDialog
            debt={selectedDebt}
            isOpen={isDeleteDialogOpen}
            onOpenChange={setDeleteDialogOpen}
          />
        </>
      )}
    </>
  );
};