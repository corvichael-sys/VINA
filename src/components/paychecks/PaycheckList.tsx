import { Paycheck } from "@/types/paycheck";
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
import { EditPaycheckDialog } from "./EditPaycheckDialog.tsx";
import { DeletePaycheckDialog } from "./DeletePaycheckDialog.tsx";
import { format } from "date-fns";

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
};

interface PaycheckListProps {
  paychecks: Paycheck[];
}

export const PaycheckList = ({ paychecks }: PaycheckListProps) => {
  const [isEditDialogOpen, setEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedPaycheck, setSelectedPaycheck] = useState<Paycheck | null>(null);

  const handleEditClick = (paycheck: Paycheck) => {
    setSelectedPaycheck(paycheck);
    setEditDialogOpen(true);
  };

  const handleDeleteClick = (paycheck: Paycheck) => {
    setSelectedPaycheck(paycheck);
    setDeleteDialogOpen(true);
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Paycheck History</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date Received</TableHead>
                <TableHead>Notes</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paychecks.map((paycheck) => (
                <TableRow key={paycheck.id}>
                  <TableCell className="font-medium">{format(new Date(paycheck.date_received), "PPP")}</TableCell>
                  <TableCell>{paycheck.notes}</TableCell>
                  <TableCell className="text-right">{formatCurrency(paycheck.amount)}</TableCell>
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
                        <DropdownMenuItem onClick={() => handleEditClick(paycheck)}>
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDeleteClick(paycheck)} className="text-destructive focus:bg-destructive/90 focus:text-destructive-foreground">
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
      {selectedPaycheck && (
        <>
          <EditPaycheckDialog
            paycheck={selectedPaycheck}
            isOpen={isEditDialogOpen}
            onOpenChange={setEditDialogOpen}
          />
          <DeletePaycheckDialog
            paycheck={selectedPaycheck}
            isOpen={isDeleteDialogOpen}
            onOpenChange={setDeleteDialogOpen}
          />
        </>
      )}
    </>
  );
};