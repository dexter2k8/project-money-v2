import { useState } from "react";
import { Tooltip } from "react-tooltip";
import Checkbox from "@/components/Checkbox";
import Input from "@/components/Input";
import type { Control } from "react-hook-form";
import type { TAction, TManageUserArgs } from "./types";

interface IUserModalProps {
  action?: TAction;
  control: Control<TManageUserArgs>;
}

export default function AddOrEditForm({ control, action }: IUserModalProps) {
  const [checked, setChecked] = useState(false);

  return (
    <form className="flex flex-col gap-4 p-4 w-full">
      <Input.Controlled label="Name" type="search" control={control} name="displayName" />

      <Input.Controlled label="Email" type="search" control={control} name="email" />

      <div className="flex items-center gap-2">
        {action === "edit" && (
          <Checkbox
            data-tooltip-id="checkbox-password"
            data-tooltip-content="Check this if you want to set a new password"
            checked={checked}
            onChange={() => setChecked(!checked)}
          />
        )}
        <Input.Controlled
          label="Password"
          disabled={action === "edit" && !checked}
          type="password"
          control={control}
          name="password"
          autoComplete="new-password"
        />
        <Tooltip className="z-50" id="checkbox-password" style={{ maxWidth: "12rem" }} />
      </div>

      <Input.Controlled
        label="Avatar URL (Optional)"
        type="search"
        control={control}
        name="photoURL"
      />
    </form>
  );
}
