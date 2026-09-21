import { cva, cx } from "class-variance-authority";

export const tabItemVariants = cva(
  cx(
    "inline-block px-4 py-2 cursor-pointer",
    "text-sm text-neutral-600 transition-colors duration-200",
    "hover:text-neutral-900",
  ),
  {
    variants: {
      isActive: {
        true: "text-neutral-900 font-medium",
      },
    },
    defaultVariants: {
      isActive: false,
    },
  },
);

export const activeLineVariants = cx(
  "h-0.75 bg-neutral-400",
  "transition-all duration-300 ease-out",
);
