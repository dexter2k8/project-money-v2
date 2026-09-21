export type TTransaction = {
  id: string;
  trntype: string;
  dtposted: string;
  trnamt: number;
  chknum: string;
  memo: string;
};

export type TBalance = {
  id: string;
  balance: number;
  enddate: string;
};

export type TPostAccountResponse = {
  acctid: string;
  accttype: string;
  bankid: number;
  branchid: string;
  description: string;
  id: string;
  extratos?: TTransaction[];
  saldos?: TBalance[];
};

export type TGetAccountResponse = TPostAccountResponse;

export type TPostAccountArgs = {
  acctid: string;
  accttype: string;
  bankid: number;
  branchid: string;
  description: string;
};

export type TPatchAccountArgs = TPostAccountArgs;
