import { cva, cx } from "class-variance-authority";

export const switchTrackVariants = cva(
  cx(
    "relative inline-flex h-5 w-9 shrink-0 rounded-full transition-colors duration-200 ease-in-out",
  ),
  {
    variants: {
      checked: {
        true: "bg-violet-600",
        false: "bg-neutral-300",
      },
      disabled: {
        true: "pointer-events-none",
      },
    },
    defaultVariants: {
      checked: false,
    },
  },
);

export const switchLabelVariants = cva(
  cx("flex items-center gap-2 select-none"),
  {
    variants: {
      disabled: {
        true: "opacity-50 cursor-not-allowed",
        false: "cursor-pointer",
      },
    },
    defaultVariants: {
      disabled: false,
    },
  },
);

export const switchThumbVariants = cva(
  cx(
    "pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out",
    "mt-0.5",
  ),
  {
    variants: {
      checked: {
        true: "translate-x-4.5",
        false: "translate-x-0.5",
      },
    },
    defaultVariants: {
      checked: false,
    },
  },
);
