"use client";
import { createContext, useCallback, useContext, useEffect, useMemo } from "react";
import { useAccounts } from "../hooks/useAccounts";
import { useLocalStorage } from "../hooks/useLocalStorage";
import type { PropsWithChildren } from "react";
import type { TGetAccountResponse } from "../api/accounts/types";

interface IBalanceContextData {
  selectedAccount: TGetAccountResponse | null;
  accountId: string | null;
  acctid: string | null;
  setAccountId: (value: string | null) => void;
}

const BalanceContext = createContext<IBalanceContextData | null>(null);

export function BalanceProvider({ children }: PropsWithChildren) {
  const [storedValue, setStoredValue] = useLocalStorage<string | null>("account", null);

  // Shared hook: provider, SidebarHead and ManageAccounts hit the same SWR key,
  // so the accounts list is fetched once per app load.
  const { accounts } = useAccounts();

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

  const handleSetAccountId = useCallback(
    (value: string | null) => {
      setStoredValue(value);
    },
    [setStoredValue],
  );

  const values = useMemo(
    () => ({
      selectedAccount,
      accountId,
      acctid,
      setAccountId: handleSetAccountId,
    }),
    [selectedAccount, accountId, acctid, handleSetAccountId],
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
