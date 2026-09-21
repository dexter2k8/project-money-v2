"use client";
import { useState } from "react";
import { toast } from "react-toastify";
import { mutate as mutateSWR } from "swr";
import { DeleteTransactions } from "@/app/services/fetchers/transactions";
import { API } from "@/app/utils/paths";
import Button from "@/components/Button";
import Modal from "@/components/Modal";

type TDeleteMonthButtonProps = {
  accountId: string;
  month: number;
  year: number;
};

export function DeleteMonthButton({ accountId, month, year }: TDeleteMonthButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleApply = async () => {
    setLoading(true);
    try {
      await DeleteTransactions({ accountId, month, year });
      toast.success("Transações excluídas com sucesso!");
      mutateSWR((key: string) => typeof key === "string" && key.startsWith(API.BALANCES.GET_BALANCES));
      mutateSWR(`${API.BALANCES.GET_YEARS}?accountId=${accountId}`);
      mutateSWR((key: string) => typeof key === "string" && key.startsWith(API.TRANSACTIONS.GET_TRANSACTIONS));
    } catch (error) {
      const message = error instanceof Error ? error.message : "Erro ao excluir transações.";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      cross
      title="Delete month transactions"
      subtitle="Are you sure you want to delete all transactions for this month?"
      labelApply="Delete"
      loadingApply={loading}
      onApply={handleApply}
      content={<div />}
    >
      <Button className="px-3 bg-red-500!" variant="primary">
        -
      </Button>
    </Modal>
  );
}
