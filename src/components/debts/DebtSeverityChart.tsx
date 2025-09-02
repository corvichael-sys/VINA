import { PieChart, Pie, Cell, Tooltip } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart";
import { Debt } from "@/types/debt";
import { Skeleton } from "../ui/skeleton";

interface DebtSeverityChartProps {
  debts: Debt[] | undefined;
  isLoading: boolean;
}

const chartConfig = {
  High: { label: "High", color: "hsl(var(--destructive))" },
  Medium: { label: "Medium", color: "hsl(var(--secondary-foreground))" },
  Low: { label: "Low", color: "hsl(var(--muted-foreground))" },
  Unassigned: { label: "Unassigned", color: "hsl(var(--border))" },
};

export const DebtSeverityChart = ({ debts, isLoading }: DebtSeverityChartProps) => {
  if (isLoading) {
    return <Skeleton className="h-80 w-full" />;
  }

  if (!debts || debts.length === 0) {
    return (
      <Card className="flex flex-col h-full">
        <CardHeader>
          <CardTitle>Debt Severity</CardTitle>
          <CardDescription>Distribution of debts by severity level.</CardDescription>
        </CardHeader>
        <CardContent className="flex-1 flex items-center justify-center">
          <p className="text-muted-foreground">No data to display.</p>
        </CardContent>
      </Card>
    );
  }

  const severityCounts = debts.reduce((acc, debt) => {
    const severity = debt.severity || 'Unassigned';
    acc[severity] = (acc[severity] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const chartData = Object.entries(severityCounts).map(([name, value]) => ({
    name,
    value,
    fill: chartConfig[name as keyof typeof chartConfig]?.color || chartConfig.Unassigned.color,
  }));

  return (
    <Card className="flex flex-col h-full">
      <CardHeader>
        <CardTitle>Debt Severity</CardTitle>
        <CardDescription>Distribution of debts by severity level.</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-[300px]"
        >
          <PieChart>
            <Tooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Pie
              data={chartData}
              dataKey="value"
              nameKey="name"
              innerRadius={60}
              strokeWidth={5}
            >
              {chartData.map((entry) => (
                <Cell key={`cell-${entry.name}`} fill={entry.fill} />
              ))}
            </Pie>
            <ChartLegend content={<ChartLegendContent nameKey="name" />} />
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};