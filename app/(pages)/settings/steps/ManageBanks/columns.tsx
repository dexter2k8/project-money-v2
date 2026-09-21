import ColumnActions from "@/app/(pages)/settings/steps/ManageUsers/ColumnActions";
import type { IActions } from "@/app/(pages)/settings/steps/ManageUsers/types";
import type { TGetBankResponse } from "@/app/api/banks/types";
import type { IGridColDef } from "@/components/Table";

export function getColumns({ onAction }: IActions) {
  const columns: IGridColDef<TGetBankResponse>[] = [
    {
      field: "id",
      header: "ID",
    },
    {
      field: "name",
      header: "NAME",
    },
    {
      field: "alias",
      header: "ALIAS",
    },
    {
      field: "id",
      header: "ACTIONS",
      render: (value) => <ColumnActions id={value as string} onAction={onAction} />,
    },
  ];

  return columns;
}
