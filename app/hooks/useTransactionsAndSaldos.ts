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
  const { accountId } = useBalance();

  const canFetch = accountId != null;
  const params = canFetch ? { accountId, years: "2" } : undefined;

  const { response } = useSWR<IResponse<TGetAccountResponse>>(
    canFetch ? API.TRANSACTIONS.GET_TRANSACTIONS : undefined,
    params,
  );

  const { response: balance } = useSWR<IResponse<TGetAccountResponse>>(
    canFetch ? API.BALANCES.GET_BALANCES : undefined,
    params,
  );

  const allSaldos = useMemo(() => balance?.data?.[0]?.saldos ?? [], [balance]);

  const transactions: TTransaction[] = useMemo(() => {
    const all = response?.data?.[0]?.extratos ?? [];
    return [...all].sort(
      (a, b) => parseDateUTC(a.dtposted).getTime() - parseDateUTC(b.dtposted).getTime(),
    );
  }, [response]);

  const isLoading = (!response || !balance) && canFetch;

  return { transactions, allSaldos, isLoading };
}

export function findPreviousBalance(
  allSaldos: { balance: number; enddate: string }[],
  referenceDate: Date,
): number {
  if (allSaldos.length === 0) return 0;

  const refYear = referenceDate.getUTCFullYear();
  const refMonth = referenceDate.getUTCMonth();

  // Closing balance of the month before `referenceDate`. Taking the LATEST
  // saldo strictly before that month (instead of the first row matching the
  // previous month) handles two cases: a month with more than one saldo row,
  // and a missing/older row when the window returned by get-balances starts
  // after the previous month — which used to seed the running sum with 0.
  let seed: { balance: number; enddate: string } | undefined;
  let seedTime = Number.NEGATIVE_INFINITY;

  for (const s of allSaldos) {
    const date = parseDateUTC(s.enddate);
    const isBeforeReferenceMonth =
      date.getUTCFullYear() < refYear ||
      (date.getUTCFullYear() === refYear && date.getUTCMonth() < refMonth);

    if (!isBeforeReferenceMonth) continue;

    const time = date.getTime();
    if (time > seedTime) {
      seed = s;
      seedTime = time;
    }
  }

  return seed?.balance ?? 0;
}
