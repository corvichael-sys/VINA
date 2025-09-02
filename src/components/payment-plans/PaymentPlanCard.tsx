import { Link } from "react-router-dom";
import { PaymentPlan } from "@/types/paymentPlan";
import { PlanItem } from "@/types/planItem";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface PaymentPlanCardProps {
  plan: PaymentPlan;
  items: PlanItem[];
}

const formatCurrency = (amount: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount);

export const PaymentPlanCard = ({ plan, items }: PaymentPlanCardProps) => {
  const paidItems = items.filter(item => item.paid);
  const progress = items.length > 0 ? (paidItems.length / items.length) * 100 : 0;
  const amountPaid = paidItems.reduce((sum, item) => sum + item.amount_planned, 0);

  return (
    <Link to={`/payment-plans/${plan.id}`}>
      <Card className="hover:border-primary transition-colors">
        <CardHeader>
          <CardTitle>{plan.name}</CardTitle>
          <CardDescription>
            {formatCurrency(plan.total_amount || 0)} total
          </CardDescription>
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
    </Link>
  );
};