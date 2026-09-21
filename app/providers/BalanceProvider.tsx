"use client";
import { createContext, useCallback, useContext, useEffect, useMemo } from "react";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { useSWR } from "../hooks/useSWR";
import { API } from "../utils/paths";
import type { PropsWithChildren } from "react";
import type { TGetAccountResponse } from "../api/accounts/types";
import type { TGetBankResponse } from "../api/banks/types";
import type { IResponse } from "../api/types";

interface IBalanceContextData {
  accounts: TGetAccountResponse[];
  banks: TGetBankResponse[];
  selectedAccount: TGetAccountResponse | null;
  selectedBank: TGetBankResponse | null;
  balance: IResponse<TGetAccountResponse> | undefined;
  accountId: string | null;
  acctid: string | null;
  setAccountId: (value: string | null) => void;
  isLoadingBanks: boolean;
  isLoadingAccounts: boolean;
  isLoadingBalance: boolean;
}

const BalanceContext = createContext<IBalanceContextData | null>(null);

export function BalanceProvider({ children }: PropsWithChildren) {
  const [storedValue, setStoredValue] = useLocalStorage<string | null>("account", null);

  const { response: allAccounts, isLoading: isLoadingAccounts } = useSWR<IResponse<TGetAccountResponse>>(
    API.BALANCES.GET_BALANCES,
    { fields: "metadata" },
  );

  const { response: banks, isLoading: isLoadingBanks } = useSWR<IResponse<TGetBankResponse>>(
    API.BANKS.GET_BANKS,
    undefined,
    { dedupingInterval: 300_000 },
  );

  const accounts = useMemo(() => allAccounts?.data ?? [], [allAccounts]);
  const bankList = useMemo(() => banks?.data ?? [], [banks]);

  const selectedAccount = useMemo(() => {
    if (!accounts.length || !storedValue) return null;
    return accounts.find((a) => a.id === storedValue)
      ?? accounts.find((a) => a.acctid === storedValue)
      ?? null;
  }, [accounts, storedValue]);

  useEffect(() => {
    if (selectedAccount && storedValue && selectedAccount.id !== storedValue) {
      setStoredValue(selectedAccount.id);
    }
  }, [selectedAccount, storedValue, setStoredValue]);

  const accountId = selectedAccount?.id ?? null;
  const acctid = selectedAccount?.acctid ?? null;

  const { response: balance, isLoading: isLoadingBalance } = useSWR<IResponse<TGetAccountResponse>>(
    accountId ? API.BALANCES.GET_BALANCES : undefined,
    accountId ? { accountId, years: "2" } : undefined,
  );

  const selectedBank = useMemo(
    () => bankList.find((b) => Number(b.id) === selectedAccount?.bankid) ?? null,
    [bankList, selectedAccount],
  );

  const handleSetAccountId = useCallback(
    (value: string | null) => {
      setStoredValue(value);
    },
    [setStoredValue],
  );

  const values = useMemo(
    () => ({
      accounts,
      banks: bankList,
      selectedAccount,
      selectedBank,
      balance,
      accountId,
      acctid,
      setAccountId: handleSetAccountId,
      isLoadingBanks,
      isLoadingAccounts,
      isLoadingBalance,
    }),
    [accounts, bankList, selectedAccount, selectedBank, balance, accountId, acctid, handleSetAccountId, isLoadingBanks, isLoadingAccounts, isLoadingBalance],
  );

  return <BalanceContext.Provider value={values}>{children}</BalanceContext.Provider>;
}

export const useBalance = () => {
  const context = useContext(BalanceContext);
  if (!context) {
    throw new Error("useBalance must be used within a BalanceProvider");
  }
  return context;
};
