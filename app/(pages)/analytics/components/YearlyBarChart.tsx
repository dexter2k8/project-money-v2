import { useMounted } from "@/app/hooks/useMounted";
import { useYearlyChartData } from "@/app/hooks/useYearlyChartData";
import ChartVerticalBarYearly from "./ChartVerticalBarYearly";

interface IYearlyBarChartProps {
  title?: string;
}

export default function YearlyBarChart({ title }: IYearlyBarChartProps) {
  const { months, credits, debits, saldo, year, isLoading } = useYearlyChartData();
  const mounted = useMounted();

  if (mounted && isLoading) {
    return (
      <div className="p-2 border border-neutral-200 w-full h-full flex items-center justify-center min-h-0 rounded">
        <span className="text-sm text-neutral-400">Carregando...</span>
      </div>
    );
  }

  const chartTitle = year ? `${title} - ${year}` : title;

  return (
    <ChartVerticalBarYearly
      title={chartTitle}
      labels={months}
      credits={credits}
      debits={debits}
      saldo={saldo}
    />
  );
}
