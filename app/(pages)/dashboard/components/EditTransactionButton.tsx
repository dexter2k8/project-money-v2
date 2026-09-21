"use client";
import { SquarePen } from "lucide-react";
import Button from "@/components/Button";
import { TransactionForm } from "./TransactionForm";
import type { TTransaction } from "@/app/api/accounts/types";

type TEditTransactionButtonProps = {
  accountId: string;
  transaction: TTransaction;
  onSuccess: () => void;
};

export function EditTransactionButton({
  accountId,
  transaction,
  onSuccess,
}: TEditTransactionButtonProps) {
  return (
    <TransactionForm
      mode="edit"
      accountId={accountId}
      transaction={transaction}
      onSuccess={onSuccess}
      trigger={
        <Button>
          <SquarePen size={16} />
        </Button>
      }
    />
  );
}
