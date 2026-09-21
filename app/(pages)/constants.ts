import { cva, cx } from "class-variance-authority";

export const TRANSITION = cx("transition-all duration-300 ease-in-out");

export const PAGE_CONTAINER = cx(
  "flex flex-1 w-full overflow-hidden",
  "bg-linear-to-r from-neutral-200 to-indigo-200",
);

export const buttonWrapperVariants = cva("w-0 px-0.5 py-4", {
  variants: {
    isCollapsed: {
      true: "w-10",
      false: "opacity-0 pointer-events-none",
    },
  },
  defaultVariants: {
    isCollapsed: false,
  },
});
