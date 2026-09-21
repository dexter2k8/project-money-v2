import { useMemo } from "react";
import { useSWR } from "@/app/hooks/useSWR";
import { useBalance } from "@/app/providers/BalanceProvider";
import { parseDateUTC } from "@/app/utils/dates";
import { API } from "@/app/utils/paths";
import type { TGetAccountResponse, TTransaction } from "@/app/api/accounts/types";
import type { IResponse } from "@/app/api/types";

export interface ITransactionsAndSaldos {
  transactions: TTransaction[];
  allSaldos: { id: string; balance: number; enddate: string }[];
  isLoading: boolean;
}

export function useTransactionsAndSaldos(): ITransactionsAndSaldos {
  const { balance, accountId } = useBalance();

  const canFetch = accountId != null;
  const params = canFetch ? { accountId, years: "2" } : undefined;

  const { response } = useSWR<IResponse<TGetAccountResponse>>(
    canFetch ? API.TRANSACTIONS.GET_TRANSACTIONS : undefined,
    params,
  );

  const allSaldos = useMemo(() => balance?.data?.[0]?.saldos ?? [], [balance]);

  const transactions: TTransaction[] = useMemo(() => {
    const all = response?.data?.[0]?.extratos ?? [];
    return [...all].sort(
      (a, b) => parseDateUTC(a.dtposted).getTime() - parseDateUTC(b.dtposted).getTime(),
    );
  }, [response]);

  const isLoading = !response && canFetch;

  return { transactions, allSaldos, isLoading };
}

export function findPreviousBalance(
  allSaldos: { balance: number; enddate: string }[],
  referenceDate: Date,
): number {
  if (allSaldos.length === 0) return 0;

  let prevMonth = referenceDate.getUTCMonth() - 1;
  let prevYear = referenceDate.getUTCFullYear();
  if (prevMonth < 0) {
    prevMonth = 11;
    prevYear -= 1;
  }

  const prevEntry = allSaldos.find((s) => {
    const date = parseDateUTC(s.enddate);
    return date.getUTCMonth() === prevMonth && date.getUTCFullYear() === prevYear;
  });

  return prevEntry?.balance ?? 0;
}
