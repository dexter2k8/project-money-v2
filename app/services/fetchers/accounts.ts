import { API } from "@/app/utils/paths";
import type { TPatchAccountArgs, TPostAccountArgs } from "@/app/api/accounts/types";

async function PostAccount(data: TPostAccountArgs) {
  const response = await fetch(API.ACCOUNTS.POST_ACCOUNT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  const json = await response.json();
  if (!response.ok) throw new Error(json.error || "Erro ao criar conta");
  return json;
}

async function PatchAccount(id: string, data: TPatchAccountArgs) {
  const response = await fetch(API.ACCOUNTS.PATCH_ACCOUNT + id, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  const json = await response.json();
  if (!response.ok) throw new Error(json.error || "Erro ao atualizar conta");
  return json;
}

async function DeleteAccount(id: string) {
  const response = await fetch(API.ACCOUNTS.DELETE_ACCOUNT + id, { method: "DELETE" });
  const json = await response.json();
  if (!response.ok) throw new Error(json.error || "Erro ao excluir conta");
  return json;
}

export { PostAccount, PatchAccount, DeleteAccount };
