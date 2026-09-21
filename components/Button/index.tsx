import { cx } from "class-variance-authority";
import { buttonVariants } from "./constants";
import Loading from "./loading";

export type TButtonVariant = "default" | "default-reverse" | "primary" | "link" | "link-reverse";
export type TButtonSize = "sm" | "default" | "lg";

export interface IButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: TButtonVariant;
  size?: TButtonSize;
  loading?: boolean;
}

export default function Button({
  className,
  children,
  variant = "default",
  size = "default",
  loading,
  disabled,
  ...props
}: IButtonProps) {
  return (
    <button
      className={cx(buttonVariants({ variant, size }), className)}
      disabled={disabled || loading}
      {...props}
    >
      {children}
      {loading && <Loading />}
    </button>
  );
}
