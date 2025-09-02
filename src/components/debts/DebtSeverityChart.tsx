import { PieChart, Pie, Cell, Tooltip } from "recharts";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  ChartConfig,
} from "@/components/ui/chart";
import { Debt } from "@/types/debt";
import { Skeleton } from "../ui/skeleton";
import { useMemo } from "react";

interface DebtSeverityChartProps {
  debts: Debt[] | undefined;
  isLoading: boolean;
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
};

const COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
];

export const DebtSeverityChart = ({ debts, isLoading }: DebtSeverityChartProps) => {
  const chartData = useMemo(() => {
    if (!debts) return [];
    return debts
      .filter((debt) => debt.current_balance > 0)
      .sort((a, b) => b.current_balance - a.current_balance)
      .map((debt, index) => ({
        name: debt.name,
        value: debt.current_balance,
        fill: COLORS[index % COLORS.length],
      }));
  }, [debts]);

  const chartConfig = useMemo(() => {
    if (!chartData) return {};
    return chartData.reduce((acc, entry) => {
      acc[entry.name] = {
        label: entry.name,
        color: entry.fill,
      };
      return acc;
    }, {} as ChartConfig);
  }, [chartData]);

  if (isLoading) {
    return <Skeleton className="h-80 w-full" />;
  }

  if (!debts || chartData.length === 0) {
    return (
      <Card className="flex flex-col h-full">
        <CardHeader>
          <CardTitle>Debts</CardTitle>
        </CardHeader>
        <CardContent className="flex-1 flex items-center justify-center">
          <p className="text-muted-foreground">No active debts to display.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="flex flex-col h-full">
      <CardHeader>
        <CardTitle>Debts</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-[300px]"
        >
          <PieChart>
            <Tooltip
              cursor={false}
              content={<ChartTooltipContent 
                hideLabel 
                formatter={(value, name) => (
                  <div className="flex flex-col gap-0.5">
                    <span className="font-medium">{name}</span>
                    <span className="text-muted-foreground">{formatCurrency(value as number)}</span>
                  </div>
                )}
              />}
            />
            <Pie
              data={chartData}
              dataKey="value"
              nameKey="name"
              innerRadius={60}
              strokeWidth={2}
            >
              {chartData.map((entry) => (
                <Cell key={`cell-${entry.name}`} fill={entry.fill} stroke={entry.fill} />
              ))}
            </Pie>
            <ChartLegend content={<ChartLegendContent nameKey="name" />} />
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};