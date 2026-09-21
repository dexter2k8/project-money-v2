import { Controller } from "react-hook-form";
import Input from "..";
import type { Control, FieldValues, Path } from "react-hook-form";
import type { IInputProps } from "..";

interface IControlledInputProps<T extends FieldValues> extends IInputProps {
  name: Path<T>;
  control: Control<T>;
}

export const ControlledInput = <T extends FieldValues>({
  name,
  control,
  ...props
}: IControlledInputProps<T>) => (
  <Controller
    control={control}
    name={name}
    render={({ field, fieldState: { error } }) => (
      <Input
        {...field}
        {...props}
        value={field.value ?? ""}
        status={error ? "error" : "info"}
        message={error?.message}
      />
    )}
  />
);
