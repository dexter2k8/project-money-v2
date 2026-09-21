export type TAction = "add" | "edit" | "delete";

export interface IActions {
  onAction: ({ action, id }: IActionsProps) => void;
}

export interface IActionsProps {
  action: TAction;
  id?: string | number;
}

export type TManageAccountArgs = {
  acctid: string;
  accttype: string;
  bankid: number;
  branchid: string;
  description: string;
};
