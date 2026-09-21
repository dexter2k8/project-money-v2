import { Controller } from "react-hook-form";
import Input from "@/components/Input";
import Select from "@/components/Select";
import type { Control } from "react-hook-form";
import type { TPostAccountArgs } from "@/app/api/accounts/types";
import type { TGetBankResponse } from "@/app/api/banks/types";

interface IAccountModalProps {
  control: Control<TPostAccountArgs>;
  banks: TGetBankResponse[];
}

export default function AddOrEditForm({ control, banks }: IAccountModalProps) {
  const bankOptions = banks.map((b) => ({
    value: String(Number(b.id)),
    label: `${b.id} - ${b.name}`,
  }));

  return (
    <form className="flex flex-col gap-4 p-4 w-full">
      <Input.Controlled label="Account ID" type="search" control={control} name="acctid" />

      <Input.Controlled label="Account Type" type="search" control={control} name="accttype" />

      <Controller
        control={control}
        name="bankid"
        render={({ field, fieldState: { error } }) => {
          const selectedValue = field.value != null ? String(field.value) : "";
          return (
            <div className="relative flex flex-col gap-1 z-20">
              <Select
                key={selectedValue}
                options={bankOptions}
                value={selectedValue}
                onChange={(v) => field.onChange(Number(v))}
                placeholder="Select a bank"
              />
              {error && <p className="text-xs text-red-500">{error.message}</p>}
            </div>
          );
        }}
      />

      <Input.Controlled label="Branch ID" type="search" control={control} name="branchid" />

      <Input.Controlled label="Description" type="search" control={control} name="description" />
    </form>
  );
}
