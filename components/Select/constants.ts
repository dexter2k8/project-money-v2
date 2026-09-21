import { cva, cx } from "class-variance-authority";

export const selectTriggerVariants = cva(
  cx(
    "box-border relative flex items-center",
    "border border-solid border-neutral-300 rounded-md",
    "h-8 text-left whitespace-nowrap",
    "shadow-sm transition-all duration-200 ease-in-out",
    "hover:border-neutral-400",
  ),
  {
    variants: {
      type: {
        default: "px-3",
        search: "px-0",
      },
      isOpen: {
        true: "shadow-sm",
        false: "",
      },
      isPlaceholder: {
        true: "text-neutral-400",
        false: "",
      },
      disabled: {
        true: "bg-neutral-100 text-neutral-400 border-neutral-200 cursor-not-allowed hover:border-neutral-300",
        false: "cursor-pointer",
      },
    },
    defaultVariants: {
      type: "default",
      isOpen: false,
      isPlaceholder: false,
      disabled: false,
    },
  },
);

export const INPUT = cx(
  "w-full h-full px-3 font-[inherit] border-none outline-none bg-transparent",
  "placeholder-neutral-400 [&::-webkit-search-cancel-button]:cursor-pointer",
);

export const selectOptionsVariants = cva(
  cx(
    "list-none absolute top-full my-0.5 ps-0 w-full",
    "border border-neutral-200 rounded-md bg-white",
    "overflow-hidden overflow-y-auto max-h-60",
    "invisible opacity-0 transition-all duration-200 ease-in-out z-10",
    "[&::-webkit-scrollbar]:w-2.5 [&::-webkit-scrollbar]:h-1",
    "[&::-webkit-scrollbar-thumb]:bg-neutral-300 [&::-webkit-scrollbar-thumb]:rounded",
  ),
  {
    variants: {
      isOpen: {
        true: "visible opacity-100",
        false: "",
      },
      isAbove: {
        true: "top-auto bottom-full",
        false: "",
      },
      isEmpty: {
        true: "opacity-0",
        false: "",
      },
    },
    defaultVariants: {
      isOpen: false,
      isAbove: false,
      isEmpty: false,
    },
  },
);

export const selectOptionVariants = cva(
  cx(
    "py-1 px-3 text-sm text-left cursor-pointer",
    "transition-all duration-200 ease-in-out",
    "hover:bg-neutral-100",
  ),
  {
    variants: {
      isSelected: {
        true: "bg-neutral-200",
        false: "",
      },
    },
    defaultVariants: {
      isSelected: false,
    },
  },
);
