import { memo, useMemo } from "react";
import dynamic from "next/dynamic";
import type * as echarts from "echarts";

const ReactECharts = dynamic(() => import("echarts-for-react"), { ssr: false });

interface IChartLineAllPeriodProps {
  title?: string;
  labels: string[];
  credits: number[];
  debits: number[];
  saldo: number[];
}

function ChartLineAllPeriod({ title, labels, credits, debits, saldo }: IChartLineAllPeriodProps) {
  const chartOptions: echarts.EChartsOption = useMemo(
    () => ({
      tooltip: {
        trigger: "axis",
        formatter: (params) => {
          const list = Array.isArray(params) ? params : [params];
          const labelIndex = list[0]?.dataIndex ?? 0;
          const label = labels[labelIndex] ?? "";
          let html = `<div style="font-size:12px"><strong>${label}</strong><br/>`;
          list.forEach((p) => {
            const raw = Number(p.value);
            const displayValue = raw <= 0.01 ? 0 : raw;
            const value = displayValue.toLocaleString("pt-BR", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            });
            html += `<span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:${p.color};margin-right:4px"></span>${p.seriesName}: R$ ${value}<br/>`;
          });
          return html + "</div>";
        },
      },
      legend: { bottom: 0, textStyle: { fontSize: 10 } },
      grid: { left: "3%", right: "4%", bottom: "12%", top: 8, containLabel: true },
      xAxis: {
        type: "category",
        boundaryGap: false,
        data: labels,
        axisLabel: { fontSize: 10, rotate: 45 },
      },
      yAxis: [
        {
          type: "value",
          min: 0,
          axisLabel: {
            fontSize: 10,
            formatter: (v: number) =>
              v.toLocaleString("pt-BR", { notation: "compact", compactDisplay: "short" }),
          },
          splitLine: { lineStyle: { type: "dashed" } },
        },
        {
          type: "value",
          min: 1,
          axisLabel: {
            fontSize: 10,
            formatter: (v: number) =>
              v.toLocaleString("pt-BR", { notation: "compact", compactDisplay: "short" }),
          },
          splitLine: { show: false },
        },
      ],
      series: [
        {
          name: "Débitos",
          type: "line",
          data: debits.map((v) => (v === 0 ? 0.01 : v)),
          color: "#E3595A",
        },
        {
          name: "Créditos",
          type: "line",
          data: credits.map((v) => (v === 0 ? 0.01 : v)),
          color: "#8AD562",
        },
        {
          name: "Saldo",
          type: "bar",
          yAxisIndex: 1,
          data: saldo,
          color: "#3B82F6",
        },
      ],
    }),
    [labels, credits, debits, saldo],
  );

  return (
    <div className="p-2 border border-neutral-200 w-full h-full flex flex-col min-h-0 rounded">
      {title && <h3 className="px-2 pb-2 text-sm font-medium">{title}</h3>}
      <div className="flex-1 min-h-0">
        <ReactECharts option={chartOptions} style={{ width: "100%", height: "100%" }} />
      </div>
    </div>
  );
}

export default memo(ChartLineAllPeriod);
