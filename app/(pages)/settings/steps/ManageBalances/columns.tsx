import ColumnActions from "@/app/(pages)/settings/steps/ManageUsers/ColumnActions";
import { formatDateBR } from "@/app/utils/dates";
import type { TFlatBalanceResponse } from "@/app/api/balances/types";
import type { IGridColDef } from "@/components/Table";
import type { IActions, IActionsProps } from "./types";

export function getColumns({ onAction }: IActions) {
  const columns: IGridColDef<TFlatBalanceResponse>[] = [
    {
      field: "balance",
      header: "BALANCE",
      render: (value) => Number(value).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
    },
    {
      field: "enddate",
      header: "END DATE",
      render: (value) => formatDateBR(value),
    },
    {
      field: "id",
      header: "ACTIONS",
      render: (value, row) => (
        <ColumnActions
          id={value as string}
          onAction={(a) => onAction({ ...(a as unknown as IActionsProps), accountId: row.accountId })}
        />
      ),
    },
  ];

  return columns;
}
