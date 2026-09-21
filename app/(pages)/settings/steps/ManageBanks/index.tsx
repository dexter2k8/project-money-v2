"use client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { yupResolver } from "@hookform/resolvers/yup";
import { SquarePlus } from "lucide-react";
import { useForm } from "react-hook-form";
import { useSWR } from "@/app/hooks/useSWR";
import { useAuth } from "@/app/providers/AuthProvider";
import { DeleteBank, PatchBank, PostBank } from "@/app/services/fetchers/banks";
import { DEMO_USER_ID } from "@/app/utils/paths";
import { API } from "@/app/utils/paths";
import { editBankSchema, postBankSchema } from "@/app/validations/banks";
import Modal from "@/components/Modal";
import Table from "@/components/Table";
import AddOrEditForm from "./AddOrEditForm";
import { getColumns } from "./columns";
import { containerVariants } from "./constants";
import type { Resolver, SubmitHandler } from "react-hook-form";
import type { TPostBankArgs } from "@/app/api/banks/types";
import type { IResponse } from "@/app/api/types";
import type { IActionsProps } from "./types";

export function ManageBanks() {
  const { selfUser } = useAuth();
  const isDemoUser = selfUser?.uid === DEMO_USER_ID;
  const [action, setAction] = useState<IActionsProps>();
  const [loading, setLoading] = useState(false);

  const deleteTriggerRef = useRef<HTMLSpanElement>(null);
  const addOrEditTriggerRef = useRef<HTMLSpanElement>(null);

  const handleAction = useCallback((a: IActionsProps) => setAction(a), []);
  const columns = useMemo(() => getColumns({ onAction: handleAction }), [handleAction]);

  const actionSchema = useMemo(
    () => (action?.action === "add" ? postBankSchema : editBankSchema),
    [action?.action],
  );

  const defaultValues: TPostBankArgs = useMemo(
    () => ({
      id: "",
      name: "",
      alias: "",
    }),
    [],
  );

  const {
    control,
    handleSubmit,
    setValue,
    reset,
    formState: { isDirty },
  } = useForm<TPostBankArgs>({
    resolver: yupResolver(actionSchema) as Resolver<TPostBankArgs>,
    defaultValues,
  });

  const { response, isLoading, mutate } = useSWR<IResponse<TPostBankArgs>>(API.BANKS.GET_BANKS);

  const bankData = useMemo(
    () => response?.data.find((t) => t.id === action?.id),
    [response, action?.id],
  );

  const handleDelete = async () => {
    if (!action?.id) return;
    setLoading(true);
    try {
      await DeleteBank(String(action.id));
      mutate();
      setAction(undefined);
    } finally {
      setLoading(false);
    }
  };

  const onSubmit: SubmitHandler<TPostBankArgs> = async (data: TPostBankArgs) => {
    if (!action?.id && action?.action === "edit") return;
    setLoading(true);
    try {
      if (action?.action === "add") await PostBank(data);
      if (action?.action === "edit") await PatchBank(data.id, data);
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
    if (!bankData) return reset(defaultValues);
    if (bankData?.id) setValue("id", bankData.id);
    if (bankData?.name) setValue("name", bankData.name);
    if (bankData?.alias) setValue("alias", bankData.alias);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bankData]);

  return (
    <div className={containerVariants({ isDemoUser })}>
      <div className="flex items-center justify-between py-1 px-4 shrink-0">
        <h4>Banks</h4>
        <SquarePlus
          className="cursor-pointer"
          size="2rem"
          onClick={() => setAction({ action: "add", id: undefined })}
        />
      </div>
      <div className="h-0 flex-1 min-h-0 overflow-auto">
        <Table loading={isLoading} columns={columns} rows={response?.data || []} />
      </div>

      <Modal
        title={action?.action === "add" ? "Add Bank" : "Edit Bank"}
        className="w-96"
        onApply={handleApply}
        onClose={handleCancel}
        content={<AddOrEditForm control={control} action={action?.action} />}
        loadingApply={loading}
        disabledApply={!isDirty}
      >
        <span ref={addOrEditTriggerRef} className="hidden" />
      </Modal>

      <Modal
        title="Delete Bank"
        subtitle="Are you sure you want to delete this bank?"
        onClose={() => setAction(undefined)}
        onApply={handleDelete}
        loadingApply={loading}
      >
        <span ref={deleteTriggerRef} className="hidden" />
      </Modal>
    </div>
  );
}
