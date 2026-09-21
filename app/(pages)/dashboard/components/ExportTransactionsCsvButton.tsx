"use client";
import { useCallback } from "react";
import { toast } from "react-toastify";
import { API } from "@/app/utils/paths";
import Button from "@/components/Button";
import { exportCsv } from "../utils/exportCsv";
import type { TGetAccountResponse } from "@/app/api/accounts/types";
import type { IResponse } from "@/app/api/types";

type TExportTransactionsCsvButtonProps = {
  accountId: string;
};

export function ExportTransactionsCsvButton({ accountId }: TExportTransactionsCsvButtonProps) {
  const handleClick = useCallback(async () => {
    try {
      const params = new URLSearchParams({ accountId });
      const response = await fetch(`${API.TRANSACTIONS.GET_TRANSACTIONS}?${params}`);

      if (!response.ok) {
        const json = await response.json().catch(() => ({}));
        throw new Error(json.error || "Erro ao buscar transações");
      }

      const result: IResponse<TGetAccountResponse> = await response.json();
      const allTransactions = result.data?.[0]?.extratos ?? [];

      exportCsv({
        header: "ID;TRNTYPE;DTPOSTED;TRNAMT;CHKNUM;MEMO",
        rows: allTransactions.map(
          (t) => `${t.id};${t.trntype};${t.dtposted.split("T")[0]};${t.trnamt};${t.chknum};${t.memo}`,
        ),
        filename: `extrato_${accountId}.csv`,
        emptyMessage: "Nenhuma transação para exportar.",
        successMessage: `${allTransactions.length} transação(ões) exportada(s) com sucesso!`,
      });
    } catch (error) {
      console.error("Export CSV error:", error);
      const message = error instanceof Error ? error.message : "Erro ao exportar CSV.";
      toast.error(message);
    }
  }, [accountId]);

  return (
    <Button variant="primary" onClick={handleClick} disabled={!accountId}>
      Exportar Transações
    </Button>
  );
}
