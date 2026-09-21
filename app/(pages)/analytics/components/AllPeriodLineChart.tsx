import { useAllPeriodChartData } from "@/app/hooks/useAllPeriodChartData";
import { useMounted } from "@/app/hooks/useMounted";
import ChartLineAllPeriod from "./ChartLineAllPeriod";

interface IAllPeriodLineChartProps {
  title?: string;
}

export default function AllPeriodLineChart({ title }: IAllPeriodLineChartProps) {
  const { months, credits, debits, saldo, isLoading } = useAllPeriodChartData();
  const mounted = useMounted();

  if (mounted && isLoading) {
    return (
      <div className="p-2 border border-neutral-200 w-full h-full flex items-center justify-center min-h-0 rounded">
        <span className="text-sm text-neutral-400">Carregando...</span>
      </div>
    );
  }

  return (
    <ChartLineAllPeriod
      title={title}
      labels={months}
      credits={credits}
      debits={debits}
      saldo={saldo}
    />
  );
}
