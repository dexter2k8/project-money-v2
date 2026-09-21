import { useMemo } from "react";
import { findPreviousBalance,useTransactionsAndSaldos } from "@/app/hooks/useTransactionsAndSaldos";
import { parseDateUTC } from "@/app/utils/dates";
import type { TTransaction } from "@/app/api/accounts/types";

interface IMonthlyChartData {
  days: number[];
  credits: number[];
  debits: number[];
  saldo: number[];
  month: number;
  year: number;
  isLoading: boolean;
}

export function useMonthlyChartData(): IMonthlyChartData {
  const { transactions: allTxn, allSaldos, isLoading } = useTransactionsAndSaldos();

  const { month, year } = useMemo(() => {
    if (allTxn.length === 0) return { month: 0, year: 0 };
    const latestDate = allTxn.reduce((max, t) => {
      const d = parseDateUTC(t.dtposted);
      return d > max ? d : max;
    }, new Date(0));
    return { month: latestDate.getUTCMonth(), year: latestDate.getUTCFullYear() };
  }, [allTxn]);

  const transactions: TTransaction[] = useMemo(() => {
    if (allTxn.length === 0) return [];

    return allTxn
      .filter((t) => {
        const d = parseDateUTC(t.dtposted);
        return d.getUTCFullYear() === year && d.getUTCMonth() === month;
      })
      .sort((a, b) => parseDateUTC(a.dtposted).getTime() - parseDateUTC(b.dtposted).getTime());
  }, [allTxn, month, year]);

  const previousBalance = useMemo(() => {
    if (allSaldos.length === 0 || transactions.length === 0) return 0;
    return findPreviousBalance(allSaldos, parseDateUTC(transactions[0].dtposted));
  }, [allSaldos, transactions]);

  const { days, credits, debits, saldo } = useMemo(() => {
    const daySet = new Set<number>();
    const creditsMap: Record<number, number> = {};
    const debitsMap: Record<number, number> = {};
    const saldoMap: Record<number, number> = {};
    let running = previousBalance;

    for (const t of transactions) {
      const day = parseDateUTC(t.dtposted).getUTCDate();
      daySet.add(day);
      running += t.trnamt;

      if (t.trnamt > 0) creditsMap[day] = (creditsMap[day] || 0) + t.trnamt;
      if (t.trnamt < 0) debitsMap[day] = (debitsMap[day] || 0) + Math.abs(t.trnamt);
      saldoMap[day] = running;
    }

    const sortedDays = Array.from(daySet).sort((a, b) => a - b);

    return {
      days: sortedDays,
      credits: sortedDays.map((d) => creditsMap[d] ?? 0),
      debits: sortedDays.map((d) => debitsMap[d] ?? 0),
      saldo: sortedDays.map((d) => saldoMap[d] ?? 0),
    };
  }, [transactions, previousBalance]);

  return { days, credits, debits, saldo, month, year, isLoading };
}
