import { useMemo } from "react";
import { findPreviousBalance,useTransactionsAndSaldos } from "@/app/hooks/useTransactionsAndSaldos";
import { MONTH_NAMES,parseDateUTC } from "@/app/utils/dates";

interface IAllPeriodChartData {
  months: string[];
  credits: number[];
  debits: number[];
  saldo: number[];
  isLoading: boolean;
}

export function useAllPeriodChartData(): IAllPeriodChartData {
  const { transactions, allSaldos, isLoading } = useTransactionsAndSaldos();

  const previousBalance = useMemo(() => {
    if (allSaldos.length === 0 || transactions.length === 0) return 0;
    return findPreviousBalance(allSaldos, parseDateUTC(transactions[0].dtposted));
  }, [allSaldos, transactions]);

  const { months, credits, debits, saldo } = useMemo(() => {
    const monthMap = new Map<string, { credits: number; debits: number; saldo: number }>();
    let running = previousBalance;

    for (const t of transactions) {
      const d = parseDateUTC(t.dtposted);
      const key = `${d.getUTCFullYear()}-${d.getUTCMonth()}`;

      if (!monthMap.has(key)) {
        monthMap.set(key, { credits: 0, debits: 0, saldo: 0 });
      }

      const entry = monthMap.get(key)!;
      running += t.trnamt;

      if (t.trnamt > 0) entry.credits += t.trnamt;
      if (t.trnamt < 0) entry.debits += Math.abs(t.trnamt);
      entry.saldo = running;
    }

    const sortedKeys = Array.from(monthMap.keys()).sort((a, b) => {
      const [aYear, aMonth] = a.split("-").map(Number);
      const [bYear, bMonth] = b.split("-").map(Number);
      return aYear === bYear ? aMonth - bMonth : aYear - bYear;
    });

    return {
      months: sortedKeys.map((key) => {
        const [year, month] = key.split("-").map(Number);
        return `${MONTH_NAMES[month]}/${year}`;
      }),
      credits: sortedKeys.map((key) => monthMap.get(key)!.credits),
      debits: sortedKeys.map((key) => monthMap.get(key)!.debits),
      saldo: sortedKeys.map((key) => monthMap.get(key)!.saldo),
    };
  }, [transactions, previousBalance]);

  return { months, credits, debits, saldo, isLoading };
}
