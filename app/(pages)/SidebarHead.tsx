"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { cx } from "class-variance-authority";
import { Loader2 } from "lucide-react";
import { useLocalStorage } from "@/app/hooks/useLocalStorage";
import Button from "@/components/Button";
import Modal from "@/components/Modal";
import Select from "@/components/Select";
import { buttonWrapperVariants, TRANSITION } from "./constants";
import { useBalance } from "../providers/BalanceProvider";

export default function SidebarHead(isCollapsed: boolean) {
  const { accounts, banks, selectedAccount, selectedBank, accountId, setAccountId, isLoadingBanks, isLoadingAccounts } = useBalance();
  const [pendingAccountId, setPendingAccountId] = useState<string | null>(null);
  const triggerRef = useRef<HTMLSpanElement>(null);
  const [hiddenAccounts, setHiddenAccounts] = useLocalStorage<string[]>("hidden-accounts", []);

  useEffect(() => {
    if (!accounts.length || !hiddenAccounts.length) return;
    const idSet = new Set(accounts.map((a) => a.id));
    const needsMigration = hiddenAccounts.some((v) => !idSet.has(v));
    if (!needsMigration) return;
    const migrated = hiddenAccounts
      .map((v) => accounts.find((a) => a.id === v)?.id ?? accounts.find((a) => a.acctid === v)?.id ?? v)
      .filter((v): v is string => v !== undefined);
    setHiddenAccounts(migrated);
  }, [accounts, hiddenAccounts, setHiddenAccounts]);

  const accountOptions = useMemo(() => {
    const bankMap = new Map(banks.map((b) => [Number(b.id), b]));
    return accounts
      .filter((account) => !hiddenAccounts.includes(account.id))
      .map((account) => {
        const bank = bankMap.get(account.bankid);
        return {
          value: account.id,
          label: `${account.acctid} - ${bank?.name ?? "Unknown"}`,
        };
      });
  }, [accounts, banks, hiddenAccounts]);

  const handleOpenModal = () => {
    setPendingAccountId(accountId);
    triggerRef.current?.click();
  };

  const handleApply = () => {
    setAccountId(pendingAccountId);
  };

  const modalContent = (
    <div className="p-4">
      <Select
        options={accountOptions}
        value={pendingAccountId ?? ""}
        onChange={(id) => setPendingAccountId(id)}
        placeholder="Choose an account"
      />
    </div>
  );

  return (
    <div className="flex items-center">
      <div className={buttonWrapperVariants({ isCollapsed })}>
        <Button className="max-w-10" size="lg" onClick={handleOpenModal}>
          {selectedBank?.alias?.slice(0, 2).toUpperCase() || "??"}
        </Button>
      </div>
      <div className={cx(isCollapsed && "opacity-0", "w-full", TRANSITION)}>
        {isLoadingBanks ? (
          <p className="flex items-center gap-2 truncate">
            <Loader2 className="animate-spin" size={14} />
            Loading banks...
          </p>
        ) : (
          <p className="truncate">{selectedBank?.name || "Select a bank"}</p>
        )}
        <div className="whitespace-nowrap flex items-center justify-between gap-2">
          {isLoadingAccounts ? (
            <small className="flex items-center gap-2">
              <Loader2 className="animate-spin" size={12} />
              Loading...
            </small>
          ) : (
            <small>{selectedAccount ? `CC: ${selectedAccount.acctid} AG: ${selectedAccount.branchid}` : "CC: ---- AG: ----"}</small>
          )}
          <Button variant="link" onClick={handleOpenModal} disabled={isLoadingBanks || isLoadingAccounts}>
            Change
          </Button>
        </div>
      </div>

      <Modal
        title="Select Bank"
        content={modalContent}
        className="w-96"
        labelApply="Confirm"
        onApply={handleApply}
      >
        <span ref={triggerRef} className="hidden" />
      </Modal>
    </div>
  );
}
