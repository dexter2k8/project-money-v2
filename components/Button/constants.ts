import { cva, cx } from "class-variance-authority";

export const buttonVariants = cva(
  cx(
    "inline-flex items-center justify-center gap-2",
    "rounded-lg cursor-pointer focus:animate-[pulse-button_0.5s] active:animate-none",
    "transition-all duration-200 ease-in-out",
    "disabled:cursor-not-allowed disabled:opacity-50",
  ),
  {
    variants: {
      variant: {
        default: "border border-violet-200 text-slate-900 enabled:hover:border-violet-400",
        "default-reverse":
          "border border-violet-200 text-indigo-200 enabled:hover:border-violet-400",
        primary: "bg-violet-800 border border-violet-200 text-white enabled:hover:bg-violet-600",
        link: "bg-transparent text-indigo-600 enabled:hover:text-indigo-200 focus:animate-none",
        "link-reverse":
          "bg-transparent text-indigo-200 enabled:hover:text-indigo-400 focus:animate-none",
      },
      size: {
        default: "text-xs h-8 px-2",
        sm: "text-xs h-6 px-1",
        lg: "h-10 px-3",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);
