import { cva, cx } from "class-variance-authority";

interface IDivisorProps {
  vertical?: boolean;
  className?: string;
}

export default function Divisor({ vertical = false, className = "" }: IDivisorProps) {
  const divisorVariants = cva(cx("self-stretch bg-gray-300", className), {
    variants: {
      vertical: {
        true: "w-px",
        false: "h-px",
      },
    },
    defaultVariants: {
      vertical: false,
    },
  });

  return <div className={divisorVariants({ vertical, className })} />;
}
