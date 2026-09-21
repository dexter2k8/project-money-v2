import { cva } from "class-variance-authority";

export const containerVariants = cva("flex flex-col items-center justify-center gap-8 h-full", {
  variants: {
    isDemoUser: {
      true: "opacity-50 pointer-events-none",
    },
  },
  defaultVariants: {
    isDemoUser: false,
  },
});
