export type TParsedTransaction = {
  trntype: string;
  dtposted: string;
  trnamt: number;
  memo: string;
  chknum: string;
};

export type TAccountInfo = {
  acctid: string;
  bankid: string;
  accttype: string;
};

export type TParsedFileResult = {
  transactions: TParsedTransaction[];
  accountInfo: TAccountInfo;
};

function extractTag(content: string, tag: string): string {
  const regex = new RegExp(`<${tag}>\\s*([^<\\r\\n]+)`, "i");
  const match = content.match(regex);
  return match?.[1]?.trim() ?? "";
}

function parseOfxDate(dateStr: string): string {
  const defaultOffset = "-03:00";

  if (!dateStr) {
    const now = new Date();
    return `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, "0")}-${String(now.getUTCDate()).padStart(2, "0")}T00:00:00${defaultOffset}`;
  }

  const offsetMatch = dateStr.match(/\[([+-]?\d+):/);
  const tzOffset = offsetMatch ? parseInt(offsetMatch[1], 10) : -3;
  const sign = tzOffset >= 0 ? "+" : "-";
  const absOffset = Math.abs(tzOffset);
  const offsetStr = `${sign}${String(absOffset).padStart(2, "0")}:00`;

  const clean = dateStr.replace(/[^0-9]/g, "");

  if (clean.length >= 8) {
    const y = clean.substring(0, 4);
    const m = clean.substring(4, 6);
    const d = clean.substring(6, 8);

    if (clean.length >= 14) {
      const h = clean.substring(8, 10);
      const min = clean.substring(10, 12);
      const s = clean.substring(12, 14);
      return `${y}-${m}-${d}T${h}:${min}:${s}${offsetStr}`;
    }

    return `${y}-${m}-${d}T00:00:00${offsetStr}`;
  }

  const now = new Date();
  return `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, "0")}-${String(now.getUTCDate()).padStart(2, "0")}T00:00:00${defaultOffset}`;
}

function parseOfxAccountInfo(content: string): TAccountInfo {
  const acctid = extractTag(content, "ACCTID");
  const bankid = extractTag(content, "BANKID");
  const accttype = extractTag(content, "ACCTTYPE");

  return { acctid, bankid, accttype };
}

function parseTransactions(stmtrs: string, format: "ofx" | "ofc"): TParsedTransaction[] {
  const transactions: TParsedTransaction[] = [];
  const txnRegex = /<STMTTRN>([\s\S]*?)<\/STMTTRN>/gi;
  let txnMatch;

  while ((txnMatch = txnRegex.exec(stmtrs)) !== null) {
    const txnContent = txnMatch[1];
    const trntype = extractTag(txnContent, "TRNTYPE");
    const dtposted = parseOfxDate(extractTag(txnContent, "DTPOSTED"));
    const trnamtStr = extractTag(txnContent, "TRNAMT");
    const trnamt = parseFloat(trnamtStr) || 0;
    const memo = format === "ofc"
      ? extractTag(txnContent, "NAME") || extractTag(txnContent, "MEMO")
      : extractTag(txnContent, "MEMO");
    const chknum = extractTag(txnContent, "CHECKNUM") || extractTag(txnContent, "CHKNUM");

    transactions.push({ trntype, dtposted, trnamt, memo, chknum });
  }

  return transactions;
}

export function parseOfxFile(fileContent: string): TParsedFileResult {
  const isOfx = fileContent.includes("<OFX>") || fileContent.includes("<ofx>");
  const isOfc = fileContent.includes("<STMTRS>") || fileContent.includes("<BANKTRANLIST>");

  if (!isOfx && !isOfc) {
    throw new Error("Formato de arquivo inválido. Use arquivos OFC ou OFX.");
  }

  const accountInfo = parseOfxAccountInfo(fileContent);
  const transactions = parseTransactions(fileContent, isOfx ? "ofx" : "ofc");

  return { transactions, accountInfo };
}
