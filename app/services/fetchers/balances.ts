import { API } from "@/app/utils/paths";
import type { TPatchBalanceArgs, TPostSingleBalanceArgs } from "@/app/api/balances/types";

async function PostBalances(accountId: string, startDate?: string) {
  const response = await fetch(API.BALANCES.POST_BALANCES, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ accountId, startDate }),
  });
  const json = await response.json();
  if (!response.ok) throw new Error(json.error || "Erro ao atualizar saldos");
  return json;
}

async function PostBalance(data: TPostSingleBalanceArgs) {
  const response = await fetch(API.BALANCES.POST_BALANCE, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  const json = await response.json();
  if (!response.ok) throw new Error(json.error || "Erro ao criar saldo");
  return json;
}

async function PatchBalance(id: string, accountId: string, data: TPatchBalanceArgs) {
  const response = await fetch(API.BALANCES.PATCH_BALANCE + id + "?accountId=" + accountId, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  const json = await response.json();
  if (!response.ok) throw new Error(json.error || "Erro ao atualizar saldo");
  return json;
}

async function DeleteBalance(id: string, accountId: string) {
  const response = await fetch(API.BALANCES.DELETE_BALANCE + id + "?accountId=" + accountId, {
    method: "DELETE",
  });
  const json = await response.json();
  if (!response.ok) throw new Error(json.error || "Erro ao excluir saldo");
  return json;
}

export { PostBalances, PostBalance, PatchBalance, DeleteBalance };
