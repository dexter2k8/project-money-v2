import { useMonthlyChartData } from "@/app/hooks/useMonthlyChartData";
import { useMounted } from "@/app/hooks/useMounted";
import { MONTH_NAMES } from "@/app/utils/dates";
import ChartVerticalBar from "./ChartVerticalBar";

interface IMonthlyBarChartProps {
  title?: string;
}

export default function MonthlyBarChart({ title }: IMonthlyBarChartProps) {
  const { days, credits, debits, saldo, month, year, isLoading } = useMonthlyChartData();
  const mounted = useMounted();

  if (mounted && isLoading) {
    return (
      <div className="p-2 border border-neutral-200 w-full h-full flex items-center justify-center min-h-0 rounded">
        <span className="text-sm text-neutral-400">Carregando...</span>
      </div>
    );
  }

  const chartTitle = year ? `${title} - ${MONTH_NAMES[month]}/${year}` : title;

  return (
    <ChartVerticalBar
      title={chartTitle}
      days={days}
      credits={credits}
      debits={debits}
      saldo={saldo}
    />
  );
}
