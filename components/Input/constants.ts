import { cva, cx } from "class-variance-authority";

export const inputVariants = cva(
  cx(
    "peer relative box-border",
    "w-full border border-solid outline-none transition-all duration-300 ease-in-out",
    "placeholder-neutral-400 autofill:shadow-[inset_0_0_0_30px_#fff]",
  ),
  {
    variants: {
      size: {
        small: "rounded-sm h-6 text-xs px-2.5",
        default: "rounded-lg h-8 text-sm px-2.5",
        large: "rounded-lg h-10 text-base px-2.5",
      },
      status: {
        info: "border-neutral-300 hover:border-violet-400 focus:border-violet-600 focus:ring-2 focus:ring-violet-500/10",
        success:
          "border-green-200 hover:border-green-600 focus:border-green-600 focus:ring-2 focus:ring-green-600/10",
        error:
          "border-red-200 hover:border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/10",
      },
      disabled: {
        true: "bg-neutral-100 text-neutral-300 border-neutral-200! cursor-not-allowed hover:border-neutral-200!",
        false: "",
      },
      isPassword: {
        true: "pr-8",
        false: "",
      },
    },
    defaultVariants: {
      size: "default",
      status: "info",
      disabled: false,
      isPassword: false,
    },
  },
);

export const labelVariants = cva(
  cx(
    "absolute pointer-events-none z-10 text-neutral-400 origin-top-left",
    "transition-all duration-300 ease-in-out",
    "px-0.5 bg-white rounded-sm",
    "peer-focus:px-0.5 peer-focus:bg-white peer-focus:rounded-sm",
    "peer-autofill:px-0.5 peer-autofill:bg-white peer-autofill:rounded-sm",
  ),
  {
    variants: {
      size: {
        small: cx(
          "-top-1.5 left-2 text-xs leading-3",
          "peer-focus:-top-1.5",
          "peer-placeholder-shown:top-1.5",
          "peer-autofill:-top-1.5",
        ),
        default: cx(
          "-top-2 left-2 text-sm leading-4",
          "peer-focus:-top-2",
          "peer-placeholder-shown:top-2",
          "peer-autofill:-top-2",
        ),
        large: cx(
          "-top-3 text-base left-2",
          "peer-focus:-top-3",
          "peer-placeholder-shown:top-2",
          "peer-autofill:-top-3",
        ),
      },
      disabled: {
        true: "text-neutral-300!",
        false: "",
      },
      status: {
        info: "peer-focus:text-violet-800",
        success: "peer-focus:text-green-700",
        error: "peer-focus:text-red-600",
      },
    },
    defaultVariants: {
      size: "default",
      disabled: false,
      status: "info",
    },
  },
);

export const iconVariants = cva("absolute right-2 top-2", {
  variants: {
    disabled: {
      true: "cursor-not-allowed text-neutral-200",
      false: "cursor-pointer",
    },
  },
  defaultVariants: {
    disabled: false,
  },
});

export const messageVariants = cva(cx("flex items-center gap-1 mt-0.5 text-xs"), {
  variants: {
    status: {
      info: "text-violet-800",
      success: "text-green-700",
      error: "text-red-600",
    },
  },
  defaultVariants: {
    status: "info",
  },
});
