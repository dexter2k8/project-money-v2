import { cva, cx } from "class-variance-authority";

export interface ICheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  indeterminate?: boolean;
}

export default function Checkbox({ indeterminate = false, ...props }: ICheckboxProps) {
  const checkboxVariants = cva("m-0 min-w-4 h-4 cursor-pointer accent-neutral-800", {
    variants: {
      indeterminate: {
        true: cx(
          "appearance-none relative bg-neutral-800 rounded-xs",
          "[&::after]:content-['─'] [&::after]:text-white [&::after]:absolute [&::after]:left-0.75",
        ),
      },
    },
    defaultVariants: {
      indeterminate: false,
    },
  });

  return <input className={checkboxVariants({ indeterminate })} type="checkbox" {...props} />;
}
