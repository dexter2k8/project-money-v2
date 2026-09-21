export type TPostBankArgs = {
  id: string;
  name: string;
  alias: string;
};

export type TGetBankResponse = TPostBankArgs;

export type TPatchBankArgs = TPostBankArgs;
