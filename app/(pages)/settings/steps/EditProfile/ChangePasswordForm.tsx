import Input from "@/components/Input";
import type { Control } from "react-hook-form";
import type { IEditProfileProps } from "./types";

interface IChangePasswordFormProps {
  control: Control<IEditProfileProps>;
}

export default function ChangePasswordForm({ control }: IChangePasswordFormProps) {
  return (
    <form className="flex flex-col items-center gap-4 p-4">
      <Input.Controlled
        label="Password"
        control={control}
        name="password"
        type="password"
        autoComplete="new-password"
      />
      <Input.Controlled
        label="Confirm password"
        control={control}
        name="confirmPassword"
        type="password"
      />
    </form>
  );
}
