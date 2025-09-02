import { useNavigate } from "react-router-dom";
import { PaymentPlan } from "@/types/paymentPlan";
import { PlanItem } from "@/types/planItem";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DeletePaymentPlanDialog } from "./DeletePaymentPlanDialog";

interface PaymentPlanCardProps {
  plan: PaymentPlan;
  items: PlanItem[];
  onSuccess: () => void;
}

const formatCurrency = (amount: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount);

export const PaymentPlanCard = ({ plan, items, onSuccess }: PaymentPlanCardProps) => {
  const navigate = useNavigate();
  const paidItems = items.filter(item => item.paid);
  const progress = items.length > 0 ? (paidItems.length / items.length) * 100 : 0;
  const amountPaid = paidItems.reduce((sum, item) => sum + item.amount_planned, 0);

  return (
    <Card className="hover:border-primary transition-colors cursor-pointer" onClick={() => navigate(`/payment-plans/${plan.id}`)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle>{plan.name}</CardTitle>
          <CardDescription>
            {formatCurrency(plan.total_amount || 0)} total
          </CardDescription>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8 dropdown-menu-trigger" onClick={(e) => e.stopPropagation()}>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
            <DeletePaymentPlanDialog plan={plan} onSuccess={onSuccess}>
              <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DeletePaymentPlanDialog>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <Progress value={progress} />
          <p className="text-sm text-muted-foreground">{progress.toFixed(0)}% Complete</p>
        </div>
      </CardContent>
      <CardFooter>
        <p className="text-sm font-medium">
          {formatCurrency(amountPaid)} paid of {formatCurrency(plan.total_amount || 0)}
        </p>
      </CardFooter>
    </Card>
  );
};