import { cva } from "class-variance-authority";

export const containerVariants = cva("flex flex-col h-full", {
  variants: {
    isDemoUser: {
      true: "opacity-50 pointer-events-none",
    },
  },
  defaultVariants: {
    isDemoUser: false,
  },
});
