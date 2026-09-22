import dayjs from "dayjs";

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
  return dayjs(dateStr).format("YYYY-MM-DD");
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
    const memo =
      format === "ofc"
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
