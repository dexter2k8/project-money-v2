"use client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { yupResolver } from "@hookform/resolvers/yup";
import { SquarePlus } from "lucide-react";
import { useForm } from "react-hook-form";
import { useLocalStorage } from "@/app/hooks/useLocalStorage";
import { useSWR } from "@/app/hooks/useSWR";
import { DeleteAccount, PatchAccount, PostAccount } from "@/app/services/fetchers/accounts";
import { API } from "@/app/utils/paths";
import { editAccountSchema, postAccountSchema } from "@/app/validations/accounts";
import Modal from "@/components/Modal";
import Table from "@/components/Table";
import AddOrEditForm from "./AddOrEditForm";
import { getColumns } from "./columns";
import type { Resolver, SubmitHandler } from "react-hook-form";
import type { TGetAccountResponse, TPostAccountArgs } from "@/app/api/accounts/types";
import type { TGetBankResponse } from "@/app/api/banks/types";
import type { IResponse } from "@/app/api/types";
import type { IActionsProps } from "./types";

export function ManageAccounts() {
  const [action, setAction] = useState<IActionsProps>();
  const [loading, setLoading] = useState(false);
  const [hiddenAccounts, setHiddenAccounts] = useLocalStorage<string[]>("hidden-accounts", []);

  const deleteTriggerRef = useRef<HTMLSpanElement>(null);
  const addOrEditTriggerRef = useRef<HTMLSpanElement>(null);

  const handleAction = useCallback((a: IActionsProps) => setAction(a), []);

  const actionSchema = useMemo(
    () => (action?.action === "add" ? postAccountSchema : editAccountSchema),
    [action?.action],
  );

  const defaultValues: TPostAccountArgs = useMemo(
    () => ({
      acctid: "",
      accttype: "",
      bankid: 0,
      branchid: "",
      description: "",
    }),
    [],
  );

  const {
    control,
    handleSubmit,
    setValue,
    reset,
    formState: { isDirty },
  } = useForm<TPostAccountArgs>({
    resolver: yupResolver(actionSchema) as Resolver<TPostAccountArgs>,
    defaultValues,
  });

  const { response, isLoading, mutate } = useSWR<IResponse<TGetAccountResponse>>(
    API.ACCOUNTS.GET_ACCOUNTS,
    { fields: "metadata" },
  );
  const { response: banksResponse } = useSWR<IResponse<TGetBankResponse>>(API.BANKS.GET_BANKS);

  const banks = useMemo(() => banksResponse?.data ?? [], [banksResponse]);

  const columns = useMemo(
    () => getColumns({ onAction: handleAction, banks, hiddenAccounts, setHiddenAccounts }),
    [handleAction, banks, hiddenAccounts, setHiddenAccounts],
  );

  const accountData = useMemo(
    () => response?.data.find((t) => t.id === action?.id),
    [response, action?.id],
  ) as TGetAccountResponse | undefined;

  const handleDelete = async () => {
    if (!action?.id) return;
    setLoading(true);
    try {
      await DeleteAccount(String(action.id));
      mutate();
      setAction(undefined);
    } finally {
      setLoading(false);
    }
  };

  const onSubmit: SubmitHandler<TPostAccountArgs> = async (data: TPostAccountArgs) => {
    if (!action?.id && action?.action === "edit") return;
    setLoading(true);
    try {
      if (action?.action === "add") await PostAccount(data);
      if (action?.action === "edit") await PatchAccount(String(action.id), data);
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
    if (action?.action === "add" || action?.action === "edit") {
      addOrEditTriggerRef.current?.click();
    }
  }, [action]);

  useEffect(() => {
    if (!accountData) return reset(defaultValues);
    if (accountData?.acctid) setValue("acctid", accountData.acctid);
    if (accountData?.accttype) setValue("accttype", accountData.accttype);
    if (accountData?.bankid) setValue("bankid", accountData.bankid);
    if (accountData?.branchid) setValue("branchid", accountData.branchid);
    if (accountData?.description) setValue("description", accountData.description);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accountData]);

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between py-1 px-4 shrink-0">
        <h4>Accounts</h4>
        <SquarePlus
          className="cursor-pointer"
          size="2rem"
          onClick={() => setAction({ action: "add", id: undefined })}
        />
      </div>
      <div className="h-0 flex-1 min-h-0 overflow-auto">
        <Table<TGetAccountResponse> loading={isLoading} columns={columns} rows={response?.data || []} />
      </div>

      <Modal
        title={action?.action === "add" ? "Add Account" : "Edit Account"}
        className="w-96"
        onApply={handleApply}
        onClose={handleCancel}
        content={<AddOrEditForm control={control} banks={banks} />}
        loadingApply={loading}
        disabledApply={!isDirty}
      >
        <span ref={addOrEditTriggerRef} className="hidden" />
      </Modal>

      <Modal
        title="Delete Account"
        subtitle="Are you sure you want to delete this account?"
        onClose={() => setAction(undefined)}
        onApply={handleDelete}
        loadingApply={loading}
      >
        <span ref={deleteTriggerRef} className="hidden" />
      </Modal>
    </div>
  );
}
