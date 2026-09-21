import { API } from "@/app/utils/paths";
import type { TPatchBankArgs, TPostBankArgs } from "@/app/api/banks/types";

async function PostBank(data: TPostBankArgs) {
  const response = await fetch(API.BANKS.POST_BANK, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  const json = await response.json();
  if (!response.ok) throw new Error(json.error || "Erro ao criar banco");
  return json;
}

async function PatchBank(id: string, data: TPatchBankArgs) {
  const response = await fetch(API.BANKS.PATCH_BANK + id, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  const json = await response.json();
  if (!response.ok) throw new Error(json.error || "Erro ao atualizar banco");
  return json;
}

async function DeleteBank(id: string) {
  const response = await fetch(API.BANKS.DELETE_BANK + id, { method: "DELETE" });
  const json = await response.json();
  if (!response.ok) throw new Error(json.error || "Erro ao excluir banco");
  return json;
}

export { PostBank, PatchBank, DeleteBank };
