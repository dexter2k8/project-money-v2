"use client";
import Button from "@/components/Button";
import { TransactionForm } from "./TransactionForm";

type TAddTransactionButtonProps = {
  accountId: string;
  onSuccess: () => void;
};

export function AddTransactionButton({ accountId, onSuccess }: TAddTransactionButtonProps) {
  return (
    <TransactionForm
      mode="add"
      accountId={accountId}
      onSuccess={onSuccess}
      trigger={
        <Button className="px-3" variant="primary">
          +
        </Button>
      }
    />
  );
}
