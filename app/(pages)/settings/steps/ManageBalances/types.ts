export type TAction = "create" | "edit" | "delete";

export interface IActions {
  onAction: (props: IActionsProps) => void;
}

export interface IActionsProps {
  action: TAction;
  id?: string | number;
  accountId?: string;
}
