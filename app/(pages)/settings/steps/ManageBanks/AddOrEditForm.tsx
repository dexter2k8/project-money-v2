import Input from "@/components/Input";
import type { Control } from "react-hook-form";
import type { TPostBankArgs } from "@/app/api/banks/types";
import type { TAction } from "./types";

interface IUserModalProps {
  control: Control<TPostBankArgs>;
  action?: TAction;
}

export default function AddOrEditForm({ control, action }: IUserModalProps) {
  return (
    <form className="flex flex-col gap-4 p-4 w-full">
      {action === "add" && (
        <Input.Controlled label="ID" type="search" control={control} name="id" />
      )}

      <Input.Controlled label="Name" type="search" control={control} name="name" />

      <Input.Controlled label="Alias" type="search" control={control} name="alias" />
    </form>
  );
}
