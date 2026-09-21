import { useMemo } from "react";
import {
  findPreviousBalance,
  useTransactionsAndSaldos,
} from "@/app/hooks/useTransactionsAndSaldos";
import { MONTH_NAMES, parseDateUTC } from "@/app/utils/dates";
import type { TTransaction } from "@/app/api/accounts/types";

interface IYearlyChartData {
  months: string[];
  credits: number[];
  debits: number[];
  saldo: number[];
  year: number;
  isLoading: boolean;
}

export function useYearlyChartData(): IYearlyChartData {
  const { transactions: allTxn, allSaldos, isLoading } = useTransactionsAndSaldos();

  const transactions: TTransaction[] = useMemo(() => {
    if (allTxn.length === 0) return [];

    const latestDate = allTxn.reduce((max, t) => {
      const d = parseDateUTC(t.dtposted);
      return d > max ? d : max;
    }, new Date(0));

    const latestYear = latestDate.getUTCFullYear();

    return allTxn
      .filter((t) => parseDateUTC(t.dtposted).getUTCFullYear() === latestYear)
      .sort((a, b) => parseDateUTC(a.dtposted).getTime() - parseDateUTC(b.dtposted).getTime());
  }, [allTxn]);

  const previousBalance = useMemo(() => {
    if (allSaldos.length === 0 || transactions.length === 0) return 0;
    const firstDate = parseDateUTC(transactions[0].dtposted);
    return findPreviousBalance(allSaldos, firstDate);
  }, [allSaldos, transactions]);

  const { months, credits, debits, saldo } = useMemo(() => {
    const monthSet = new Set<number>();
    const creditsMap: Record<number, number> = {};
    const debitsMap: Record<number, number> = {};
    const saldoMap: Record<number, number> = {};
    let running = previousBalance;

    for (const t of transactions) {
      const month = parseDateUTC(t.dtposted).getUTCMonth();
      monthSet.add(month);
      running += t.trnamt;

      if (t.trnamt > 0) creditsMap[month] = (creditsMap[month] || 0) + t.trnamt;
      if (t.trnamt < 0) debitsMap[month] = (debitsMap[month] || 0) + Math.abs(t.trnamt);
      saldoMap[month] = running;
    }

    const sortedMonths = Array.from(monthSet).sort((a, b) => a - b);

    return {
      months: sortedMonths.map((m) => MONTH_NAMES[m]),
      credits: sortedMonths.map((m) => creditsMap[m] ?? 0),
      debits: sortedMonths.map((m) => debitsMap[m] ?? 0),
      saldo: sortedMonths.map((m) => saldoMap[m] ?? 0),
    };
  }, [transactions, previousBalance]);

  const year = useMemo(() => {
    if (allTxn.length === 0) return new Date().getUTCFullYear();
    const latestDate = allTxn.reduce((max, t) => {
      const d = parseDateUTC(t.dtposted);
      return d > max ? d : max;
    }, new Date(0));
    return latestDate.getUTCFullYear();
  }, [allTxn]);

  return { months, credits, debits, saldo, year, isLoading };
}
