"use client";
import { formatDateBR } from "@/app/utils/dates";
import BalanceDisplay from "@/components/BalanceDisplay";
import { AddTransactionButton } from "./components/AddTransactionButton";
import { DeleteMonthButton } from "./components/DeleteMonthButton";
import { EditTransactionButton } from "./components/EditTransactionButton";
import type { TTransaction } from "@/app/api/accounts/types";
import type { IGridColDef } from "@/components/Table";

export type TTransactionWithSaldo = TTransaction & { saldo: number };

type TColumnsArgs = {
  accountId: string;
  month: number;
  year: number;
  mutate: () => void;
  showControls: boolean;
};

export const columns = ({
  accountId,
  month,
  year,
  mutate,
  showControls,
}: TColumnsArgs): IGridColDef<TTransactionWithSaldo>[] => {
  const actionsColumn: IGridColDef<TTransactionWithSaldo> = {
    field: "id",
    header: "UID",
    className: "text-center w-10",
    renderHeader() {
      return <AddTransactionButton accountId={accountId} onSuccess={mutate} />;
    },
    render: (_value, row) => (
      <EditTransactionButton
        accountId={accountId}
        transaction={row}
        onSuccess={mutate}
      />
    ),
    renderFooter: () => (
      <DeleteMonthButton
        accountId={accountId}
        month={month}
        year={year}
      />
    ),
  };

  const baseColumns: IGridColDef<TTransactionWithSaldo>[] = [
    {
      field: "dtposted",
      header: "Data",
      className: "text-left w-28",
      render: (value) => formatDateBR(value),
    },
    { field: "memo", className: "text-left max-w-80 truncate", header: "Descrição" },
    { field: "chknum", className: "text-right w-28", header: "Documento" },
    {
      field: "trnamt",
      header: "Valor",
      className: "text-right",
      render: (value) => <BalanceDisplay value={Number(value)} />,
    },
    {
      field: "saldo",
      header: "Saldo",
      className: "text-right",
      render: (value) => <BalanceDisplay value={Number(value)} />,
    },
  ];

  return showControls ? [actionsColumn, ...baseColumns] : baseColumns;
};
