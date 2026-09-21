import { Controller } from "react-hook-form";
import TextArea from "..";
import type { Control, FieldValues, Path } from "react-hook-form";
import type { ITextAreaProps } from "..";

interface IControlledTextAreaProps<T extends FieldValues> extends ITextAreaProps {
  name: Path<T>;
  control: Control<T>;
}

export const ControlledTextArea = <T extends FieldValues>({
  name,
  control,
  ...props
}: IControlledTextAreaProps<T>) => (
  <Controller
    control={control}
    name={name}
    render={({ field, fieldState: { error } }) => (
      <TextArea
        {...field}
        {...props}
        value={field.value ?? ""}
        status={error ? "error" : "info"}
        message={error?.message}
      />
    )}
  />
);
