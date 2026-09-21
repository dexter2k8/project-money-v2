import { cva, cx } from "class-variance-authority";

const TRANSITION_600 = cx("transition-all duration-600 ease-in-out");
const SIGN_IN_OUT_PANEL = cx("absolute top-0 h-full left-0 w-1/2", TRANSITION_600);
export const PANEL_BASE = cx(
  "absolute top-0 w-1/2 h-full px-8 text-center",
  "flex flex-col items-center justify-center gap-8",
  TRANSITION_600,
);
export const FORM = cx("bg-white flex flex-col items-center justify-center gap-4 px-10 h-full");
export const CONTAINER = cx(
  "grid place-items-center min-w-screen min-h-screen",
  "bg-linear-to-r from-neutral-200 to-indigo-200",
);
export const CONTENT = cx(
  "relative bg-white shadow-xl rounded-4xl min-w-3xl min-h-120 m-8 overflow-hidden",
);

export const signUp = cva(SIGN_IN_OUT_PANEL, {
  variants: {
    isSignIn: {
      true: "opacity-0 z-10",
      false: "translate-x-full opacity-100 z-30 animate-[move_0.6s]",
    },
  },
  defaultVariants: {
    isSignIn: false,
  },
});

export const signIn = cva(cx(SIGN_IN_OUT_PANEL, "z-20"), {
  variants: {
    isSignIn: {
      true: "",
      false: "translate-x-full",
    },
  },
  defaultVariants: {
    isSignIn: true,
  },
});

export const toggleContainer = cva(
  cx("absolute top-0 left-1/2 w-1/2 h-full overflow-hidden z-100", TRANSITION_600),
  {
    variants: {
      isSignIn: {
        true: "rounded-[9rem_0_0_6rem]",
        false: "-translate-x-full rounded-[0_9rem_6rem_0]",
      },
    },
    defaultVariants: {
      isSignIn: true,
    },
  },
);

export const togglePanel = cva(
  `bg-linear-to-r from-slate-500 to-violet-800 text-white relative -left-full h-full w-[200%] ${TRANSITION_600}`,
  {
    variants: {
      isSignIn: {
        true: "translate-x-0",
        false: "translate-x-1/2",
      },
    },
    defaultVariants: {
      isSignIn: true,
    },
  },
);
