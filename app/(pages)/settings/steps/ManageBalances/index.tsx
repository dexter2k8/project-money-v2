"use client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { yupResolver } from "@hookform/resolvers/yup";
import { SquarePlus } from "lucide-react";
import { useForm } from "react-hook-form";
import { useSWR } from "@/app/hooks/useSWR";
import { useBalance } from "@/app/providers/BalanceProvider";
import { DeleteBalance, PatchBalance, PostBalance } from "@/app/services/fetchers/balances";
import { API } from "@/app/utils/paths";
import { createBalanceSchema, editBalanceSchema } from "@/app/validations/balances";
import Modal from "@/components/Modal";
import Table from "@/components/Table";
import AddOrEditForm from "./AddOrEditForm";
import { getColumns } from "./columns";
import type { Resolver, SubmitHandler } from "react-hook-form";
import type { TFlatBalanceResponse, TPatchBalanceArgs, TPostSingleBalanceArgs } from "@/app/api/balances/types";
import type { IResponse } from "@/app/api/types";
import type { IActionsProps } from "./types";

export function ManageBalances() {
  const { selectedAccount } = useBalance();
  const [action, setAction] = useState<IActionsProps>();
  const [loading, setLoading] = useState(false);

  const deleteTriggerRef = useRef<HTMLSpanElement>(null);
  const addOrEditTriggerRef = useRef<HTMLSpanElement>(null);

  const handleAction = useCallback((a: IActionsProps) => setAction(a), []);

  const actionSchema = useMemo(() => {
    if (action?.action === "create") return createBalanceSchema;
    return editBalanceSchema;
  }, [action?.action]);

  const defaultValues: TPostSingleBalanceArgs | TPatchBalanceArgs = useMemo(
    () => ({ balance: 0, enddate: "" }),
    [],
  );

  const {
    control,
    handleSubmit,
    setValue,
    reset,
    formState: { isDirty },
  } = useForm<TPostSingleBalanceArgs | TPatchBalanceArgs>({
    resolver: yupResolver(actionSchema) as Resolver<TPostSingleBalanceArgs | TPatchBalanceArgs>,
    defaultValues,
  });

  const { response, isLoading, mutate } = useSWR<IResponse<TFlatBalanceResponse>>(
    selectedAccount?.id ? API.BALANCES.GET_BALANCES + "?flatten=true&accountId=" + selectedAccount.id : undefined,
  );

  const columns = useMemo(() => getColumns({ onAction: handleAction }), [handleAction]);

  const balanceData = useMemo(
    () => response?.data.find((t) => t.id === action?.id),
    [response, action?.id],
  ) as TFlatBalanceResponse | undefined;

  const handleDelete = async () => {
    if (!action?.id || !action?.accountId) return;
    setLoading(true);
    try {
      await DeleteBalance(String(action.id), action.accountId);
      mutate();
      setAction(undefined);
    } finally {
      setLoading(false);
    }
  };

  const onSubmit: SubmitHandler<TPostSingleBalanceArgs | TPatchBalanceArgs> = async (
    data: TPostSingleBalanceArgs | TPatchBalanceArgs,
  ) => {
    if (!action?.id && action?.action === "edit") return;
    setLoading(true);
    try {
      if (action?.action === "create")
        await PostBalance({ ...(data as TPostSingleBalanceArgs), accountId: action.accountId ?? "" });
      if (action?.action === "edit")
        await PatchBalance(String(action.id), action.accountId ?? "", data as TPatchBalanceArgs);
      mutate();
      reset(defaultValues);
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async () => {
    let isValid = true;
    await handleSubmit(onSubmit, () => (isValid = false))();
    return isValid;
  };

  const handleCancel = () => {
    reset(defaultValues);
    setAction(undefined);
  };

  useEffect(() => {
    if (action?.action === "delete") {
      deleteTriggerRef.current?.click();
    }
    if (action?.action === "create" || action?.action === "edit") {
      addOrEditTriggerRef.current?.click();
    }
  }, [action]);

  useEffect(() => {
    if (action?.action !== "edit" || !balanceData) return reset(defaultValues);
    if (balanceData.balance != null) setValue("balance", balanceData.balance);
    if (balanceData.enddate) {
      setValue("enddate", balanceData.enddate);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [balanceData]);

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between py-1 px-4 shrink-0">
        <h4>Balances</h4>
        {selectedAccount?.id && (
          <SquarePlus
            className="cursor-pointer"
            size="2rem"
            onClick={() => setAction({ action: "create", id: undefined, accountId: selectedAccount?.id })}
          />
        )}
      </div>
      <div className="h-0 flex-1 min-h-0 overflow-auto">
        {!selectedAccount?.id ? (
          <p className="text-sm text-gray-500 p-4">Select an account in the sidebar to view balances.</p>
        ) : (
          <Table<TFlatBalanceResponse> loading={isLoading} columns={columns} rows={response?.data || []} />
        )}
      </div>

      <Modal
        title={action?.action === "create" ? "Add Balance" : "Edit Balance"}
        className="w-96"
        onApply={handleApply}
        onClose={handleCancel}
        content={<AddOrEditForm control={control} action={action?.action} />}
        loadingApply={loading}
        disabledApply={action?.action === "edit" && !isDirty}
      >
        <span ref={addOrEditTriggerRef} className="hidden" />
      </Modal>

      <Modal
        title="Delete Balance"
        subtitle="Are you sure you want to delete this balance?"
        onClose={() => setAction(undefined)}
        onApply={handleDelete}
        loadingApply={loading}
      >
        <span ref={deleteTriggerRef} className="hidden" />
      </Modal>
    </div>
  );
}
