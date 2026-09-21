export type TPostSingleBalanceArgs = {
  accountId: string;
  balance: number;
  enddate: string;
};

export type TPatchBalanceArgs = {
  balance: number;
  enddate: string;
};

export type TFlatBalanceResponse = {
  id: string;
  acctid: string;
  description: string;
  balance: number;
  enddate: string;
  accountId: string;
};
