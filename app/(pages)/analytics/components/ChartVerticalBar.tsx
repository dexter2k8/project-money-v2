import { memo, useMemo } from "react";
import dynamic from "next/dynamic";
import type * as echarts from "echarts";

const ReactECharts = dynamic(() => import("echarts-for-react"), { ssr: false });

interface IChartBarProps {
  title?: string;
  days: number[];
  credits: number[];
  debits: number[];
  saldo?: number[];
}

function ChartVerticalBar({ title, days, credits, debits, saldo }: IChartBarProps) {
  const chartOptions: echarts.EChartsOption = useMemo(
    () => ({
      tooltip: {
        trigger: "axis",
        axisPointer: { type: "shadow" },
        formatter: (params) => {
          const list = Array.isArray(params) ? params : [params];
          const dayIndex = list[0]?.dataIndex ?? 0;
          const dayLabel = days[dayIndex] ?? "";
          let html = `<div style="font-size:12px"><strong>Dia ${dayLabel}</strong><br/>`;
          list.forEach((p) => {
            const raw = Number(p.value);
            const displayValue = raw <= 0.01 ? 0 : raw;
            const value =
              p.seriesName === "Saldo"
                ? displayValue.toFixed(2)
                : displayValue.toLocaleString("pt-BR", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  });
            html += `<span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:${p.color};margin-right:4px"></span>${p.seriesName}: R$ ${value}<br/>`;
          });
          return html + "</div>";
        },
      },
      legend: { bottom: 0, textStyle: { fontSize: 10 } },
      grid: { left: 8, right: 8, top: 8, bottom: 32, containLabel: true },
      xAxis: {
        type: "category",
        data: days,
        axisLabel: { fontSize: 10 },
      },
      yAxis: {
        type: "log",
        min: 1,
        axisLabel: {
          fontSize: 10,
          formatter: (v: number) =>
            v.toLocaleString("pt-BR", { notation: "compact", compactDisplay: "short" }),
        },
        splitLine: { lineStyle: { type: "dashed" } },
      },
      series: [
        {
          name: "Débitos",
          type: "bar",
          stack: "total",
          data: debits.map((v) => (v === 0 ? 0.01 : v)),
          color: "#E3595A",
        },
        {
          name: "Créditos",
          type: "bar",
          stack: "total",
          data: credits.map((v) => (v === 0 ? 0.01 : v)),
          color: "#8AD562",
        },
        ...(saldo
          ? [
              {
                name: "Saldo",
                type: "line" as const,
                data: saldo,
                color: "#3B82F6",
                smooth: true,
                symbol: "circle",
                symbolSize: 6,
              },
            ]
          : []),
      ],
    }),
    [days, credits, debits, saldo],
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

export default memo(ChartVerticalBar);
