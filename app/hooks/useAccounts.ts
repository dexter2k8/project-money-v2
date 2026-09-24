"use client";
import { useMemo } from "react";
import { useSWR } from "@/app/hooks/useSWR";
import { API } from "@/app/utils/paths";
import type { KeyedMutator } from "swr";
import type { TGetAccountResponse } from "@/app/api/accounts/types";
import type { IResponse } from "@/app/api/types";

export interface IUseAccountsResult {
  accounts: TGetAccountResponse[];
  isLoading: boolean;
  mutate: KeyedMutator<IResponse<TGetAccountResponse>>;
}

export function useAccounts(): IUseAccountsResult {
  const { response, isLoading, mutate } = useSWR<IResponse<TGetAccountResponse>>(
    API.ACCOUNTS.GET_ACCOUNTS,
    { fields: "metadata" },
  );

  const accounts = useMemo(() => response?.data ?? [], [response]);

  return { accounts, isLoading, mutate };
}
