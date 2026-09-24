"use client";
import { useCallback, useRef, useState } from "react";
import { toast } from "react-toastify";
import { mutate } from "swr";
import { parseOfxFile } from "@/app/utils/parseOfx";
import { API } from "@/app/utils/paths";
import Button from "@/components/Button";

type TImportOfxButtonProps = {
  acctid: string;
  accountId: string;
  onImported?: () => void | Promise<void>;
};

export function ImportOfxButton({ acctid, accountId, onImported }: TImportOfxButtonProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file || !accountId) return;

      setIsUploading(true);

      try {
        const buffer = await file.arrayBuffer();
        const decoder = new TextDecoder("iso-8859-1");
        const content = decoder.decode(buffer);
        const { transactions: parsed, accountInfo } = parseOfxFile(content);

        if (accountInfo.acctid && accountInfo.acctid !== acctid) {
          toast.error(
            `Arquivo é da conta ${accountInfo.acctid}, mas a conta selecionada é ${acctid}.`,
          );
          return;
        }

        if (parsed.length === 0) {
          toast.warning("Nenhuma transação encontrada no arquivo.");
          return;
        }

        const response = await fetch(API.TRANSACTIONS.POST_TRANSACTION, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ accountId, transactions: parsed }),
        });

        if (!response.ok) {
          const json = await response.json().catch(() => ({}));
          throw new Error(json.error || "Erro ao salvar transações");
        }

        const result = await response.json();

        const earliestDate = parsed.reduce((min, t) => {
          return t.dtposted < min ? t.dtposted : min;
        }, parsed[0].dtposted);

        // Always recompute, even when every transaction already existed: a
        // re-import then repairs stale/incorrect saldo rows. A failed recompute
        // must also surface — it used to fail silently, leaving a wrong saldo
        // in place while the transaction table looked fine.
        const balancesResponse = await fetch(API.BALANCES.POST_BALANCES, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ accountId, startDate: earliestDate }),
        });

        if (!balancesResponse.ok) {
          const json = await balancesResponse.json().catch(() => ({}));
          throw new Error(json.error || "Erro ao atualizar saldos");
        }

        if (result.count === 0) {
          toast.info("Nenhuma transação nova; saldos recalculados.");
        } else {
          toast.success(`${result.count} transação(ões) importada(s) com sucesso!`);
        }

        const date = new Date(earliestDate);
        const month = date.getUTCMonth() + 1;
        const year = date.getUTCFullYear();
        mutate(`${API.TRANSACTIONS.GET_TRANSACTIONS}?accountId=${accountId}&month=${month}&year=${year}`);

        // The saldo/years refresh lives in the page: it revalidates
        // get-balances exactly once — either on the current key or, when a new
        // period makes the selection move, on the remounted key (never both).
        await onImported?.();
      } catch (error) {
        console.error("Import error:", error);
        const message = error instanceof Error ? error.message : "Erro ao importar arquivo. Verifique o formato.";
        toast.error(message);
      } finally {
        setIsUploading(false);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      }
    },
    [acctid, accountId, onImported],
  );

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept=".ofc,.ofx"
        className="hidden"
        onChange={handleChange}
      />
      <Button variant="primary" onClick={handleClick} disabled={isUploading}>
        {isUploading ? "Importando..." : "Importar OFC/OFX"}
      </Button>
    </>
  );
}
