import { cva } from "class-variance-authority";

export const sidebarVariants = cva(
  "flex flex-col justify-between bg-white h-full overflow-hidden transition-all duration-300 ease-in-out",
  {
    variants: {
      isCollapsed: {
        true: "min-w-15 max-w-15",
        false: "min-w-64 max-w-64",
      },
    },
    defaultVariants: {
      isCollapsed: false,
    },
  },
);
