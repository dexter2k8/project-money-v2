"use client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { yupResolver } from "@hookform/resolvers/yup";
import { SquarePlus } from "lucide-react";
import { useForm } from "react-hook-form";
import { useSWR } from "@/app/hooks/useSWR";
import { DeleteUser, PatchUser, PostUser } from "@/app/services/fetchers/auth";
import { API } from "@/app/utils/paths";
import { editUserSchema, postUserSchema } from "@/app/validations/auth";
import Modal from "@/components/Modal";
import Table from "@/components/Table";
import AddOrEditForm from "./AddOrEditForm";
import { getColumns } from "./columns";
import type { Resolver, SubmitHandler } from "react-hook-form";
import type { IUser } from "@/app/api/auth/get-self-user/types";
import type { TPostUserArgs } from "@/app/api/auth/post-user/types";
import type { IActionsProps, TManageUserArgs } from "./types";

export function ManageUsers() {
  const [action, setAction] = useState<IActionsProps>();
  const [loading, setLoading] = useState(false);

  const deleteTriggerRef = useRef<HTMLSpanElement>(null);
  const addOrEditTriggerRef = useRef<HTMLSpanElement>(null);

  const handleAction = useCallback((a: IActionsProps) => setAction(a), []);
  const columns = useMemo(() => getColumns({ onAction: handleAction }), [handleAction]);

  const actionSchema = useMemo(
    () => (action?.action === "add" ? postUserSchema : editUserSchema),
    [action?.action],
  );

  const defaultValues = useMemo(
    () => ({
      displayName: "",
      email: "",
      password: "",
      photoURL: "",
    }),
    [],
  );

  const {
    control,
    handleSubmit,
    setValue,
    reset,
    formState: { isDirty },
  } = useForm<TManageUserArgs>({
    resolver: yupResolver(actionSchema) as Resolver<TManageUserArgs>,
    defaultValues,
  });

  const { response: userList, isLoading, mutate } = useSWR<IUser[]>(API.AUTH.LIST_USERS);

  const userData = useMemo(
    () => userList?.find((t) => t.uid === action?.id),
    [userList, action?.id],
  );

  const handleDelete = async () => {
    if (!action?.id) return;
    setLoading(true);
    try {
      await DeleteUser(String(action.id));
      mutate();
      setAction(undefined);
    } finally {
      setLoading(false);
    }
  };

  const onSubmit: SubmitHandler<TManageUserArgs> = async (data: TManageUserArgs) => {
    if (!action?.id && action?.action === "edit") return;
    setLoading(true);
    try {
      if (action?.action === "add") await PostUser(data as TPostUserArgs);
      if (action?.action === "edit") await PatchUser(String(action.id), data);
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
    if (!userData) return reset(defaultValues);
    if (userData?.displayName) setValue("displayName", userData.displayName);
    if (userData?.email) setValue("email", userData.email);
    if (userData?.photoURL) setValue("photoURL", userData.photoURL);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userData]);

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between py-1 px-4 shrink-0">
        <h4>Users</h4>
        <SquarePlus
          className="cursor-pointer"
          size="2rem"
          onClick={() => setAction({ action: "add", id: undefined })}
        />
      </div>
      <div className="h-0 flex-1 min-h-0 overflow-auto">
        <Table loading={isLoading} columns={columns} rows={userList || []} />
      </div>

      <Modal
        title={action?.action === "add" ? "Add User" : "Edit User"}
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
        title="Delete User"
        subtitle="Are you sure you want to delete this user?"
        onClose={() => setAction(undefined)}
        onApply={handleDelete}
        loadingApply={loading}
      >
        <span ref={deleteTriggerRef} className="hidden" />
      </Modal>
    </div>
  );
}
