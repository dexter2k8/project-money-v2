import { cx } from "class-variance-authority";

export const OVERLAY = cx(
  "fixed inset-0 bg-black/50 flex items-center justify-center z-50",
  "animate-[modal-fade-in_0.3s_forwards]",
);

export const CONTENT = cx(
  "relative bg-white rounded-xl shadow-lg",
  "animate-[modal-content-in_0.3s_ease-out]",
);
