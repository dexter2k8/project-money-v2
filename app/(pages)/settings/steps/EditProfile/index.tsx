"use client";

import { useEffect, useState } from "react";
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { useAuth } from "@/app/providers/AuthProvider";
import { PatchUser } from "@/app/services/fetchers/auth";
import { DEMO_USER_ID } from "@/app/utils/paths";
import { updateUserSchema } from "@/app/validations/auth";
import Button from "@/components/Button";
import Input from "@/components/Input";
import Modal from "@/components/Modal";
import ChangePasswordForm from "./ChangePasswordForm";
import { containerVariants } from "./constants";
import type { Resolver, SubmitHandler } from "react-hook-form";
import type { IEditProfileProps } from "./types";

export default function EditProfile() {
  const { selfUser, mutate } = useAuth();
  const [loading, setLoading] = useState(false);
  const { control, setValue, handleSubmit } = useForm<IEditProfileProps>({
    resolver: yupResolver(updateUserSchema) as Resolver<IEditProfileProps>,
  });

  const isDemoUser = selfUser?.uid === DEMO_USER_ID;

  useEffect(() => {
    if (selfUser) {
      setValue("displayName", selfUser.displayName || "");
      setValue("email", selfUser.email || "");
      setValue("photoURL", selfUser.photoURL || "");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selfUser]);

  const onSubmit: SubmitHandler<IEditProfileProps> = async (data) => {
    const { password, ...rest } = data;
    const payload = password ? { ...rest, password } : rest;
    try {
      if (!selfUser?.uid) {
        toast.error("User ID is missing");
        return;
      }

      setLoading(true);
      await PatchUser(selfUser.uid, payload);
      mutate();
      toast.success("Profile updated successfully");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to update profile";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={containerVariants({ isDemoUser })}>
      <form className="flex flex-col items-center gap-4 py-4" onSubmit={handleSubmit(onSubmit)}>
        <div className="flex flex-col gap-1 w-64">
          <Input.Controlled label="Name" control={control} name="displayName" />
        </div>
        <div className="flex flex-col gap-1 w-64">
          <Input.Controlled label="Email" control={control} name="email" />
        </div>
        <div className="flex flex-col gap-1 w-64">
          <Input.Controlled label="Avatar URL" control={control} name="photoURL" />
        </div>
        <Button loading={loading} size="lg" variant="primary" className="w-64">
          Update
        </Button>
      </form>
      <Modal title="Change Password" content={<ChangePasswordForm control={control} />}>
        <Button className="w-36">Change Password</Button>
      </Modal>
    </div>
  );
}
