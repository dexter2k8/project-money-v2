import Input from "@/components/Input";
import type { Control } from "react-hook-form";
import type { TPatchBalanceArgs, TPostSingleBalanceArgs } from "@/app/api/balances/types";
import type { TAction } from "./types";

interface IBalanceModalProps {
  control: Control<TPostSingleBalanceArgs | TPatchBalanceArgs>;
  action?: TAction;
}

export default function AddOrEditForm({ control, action }: IBalanceModalProps) {
  return (
    <form className="flex flex-col gap-4 p-4 w-full">
      {(action === "create" || action === "edit") && (
        <>
          <Input.Controlled label="Balance" type="number" control={control} name="balance" />
          <Input.Controlled label="End Date" type="date" control={control} name="enddate" />
        </>
      )}
    </form>
  );
}
