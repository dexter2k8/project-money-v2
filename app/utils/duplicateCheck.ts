import type { TTransaction } from "@/app/api/accounts/types";
import type { TParsedTransaction } from "./parseOfx";

function normalizeString(value: string | undefined | null): string {
  return (value ?? "").trim().toLowerCase();
}

function normalizeDate(dateStr: string): string {
  if (!dateStr) return "";

  const match = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (match) return `${match[1]}-${match[2]}-${match[3]}`;

  const clean = dateStr.replace(/[^0-9]/g, "");
  if (clean.length >= 8) {
    return `${clean.substring(0, 4)}-${clean.substring(4, 6)}-${clean.substring(6, 8)}`;
  }

  return dateStr;
}

function normalizeAmount(value: number): string {
  return Number(value).toFixed(2);
}

export function createTransactionKey(
  t: TParsedTransaction | TTransaction | { trntype: string; dtposted: string; trnamt: number; memo: string; chknum: string },
): string {
  const trntype = normalizeString(t.trntype);
  const dtposted = normalizeDate(t.dtposted);
  const trnamt = normalizeAmount(t.trnamt);
  const memo = normalizeString(t.memo);
  const chknum = normalizeString(t.chknum);

  return `${trntype}|${dtposted}|${trnamt}|${memo}|${chknum}`;
}

export function filterUniqueTransactions(
  parsed: TParsedTransaction[],
  existing: TTransaction[],
): TParsedTransaction[] {
  const existingKeys = new Set(existing.map(createTransactionKey));

  return parsed.filter((t) => !existingKeys.has(createTransactionKey(t)));
}
