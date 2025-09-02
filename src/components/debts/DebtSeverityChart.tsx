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

// Define the CSS variable names
const CHART_COLOR_VAR_NAMES = [
  "--chart-1",
  "--chart-2",
  "--chart-3",
  "--chart-4",
  "--chart-5",
];

export const DebtSeverityChart = ({ debts, isLoading }: DebtSeverityChartProps) => {
  // Memoize the actual HSL color values from CSS variables
  const actualChartColors = useMemo(() => {
    // Check if window is defined to handle server-side rendering
    if (typeof window === 'undefined') return []; 
    const rootStyles = getComputedStyle(document.documentElement);
    return CHART_COLOR_VAR_NAMES.map(varName => {
      // Get the raw HSL string (e.g., "12 76% 61%")
      const hslValues = rootStyles.getPropertyValue(varName).trim();
      // Convert to a valid CSS hsl() function string for recharts
      return `hsl(${hslValues})`;
    });
  }, []); // Empty dependency array means this runs once after initial render

  const chartData = useMemo(() => {
    // Ensure colors are loaded before processing chart data
    if (!debts || actualChartColors.length === 0) return []; 
    return debts
      .filter((debt) => debt.current_balance > 0)
      .sort((a, b) => b.current_balance - a.current_balance)
      .map((debt, index) => ({
        name: debt.name,
        value: debt.current_balance,
        // Use the computed HSL values for the fill prop
        fill: actualChartColors[index % actualChartColors.length], 
      }));
  }, [debts, actualChartColors]); // Depend on actualChartColors

  const chartConfig = useMemo(() => {
    if (!chartData) return {};
    return chartData.reduce((acc, entry) => {
      acc[entry.name] = {
        label: entry.name,
        color: entry.fill, // Use the actual fill color for ChartConfig
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