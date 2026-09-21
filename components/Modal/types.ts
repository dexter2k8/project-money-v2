import type { ReactNode } from "react";

export interface IModalProps {
  isOpen: boolean;
  children: ReactNode;
  title?: string;
  subtitle?: string;
  cross?: boolean;
  onClose?: () => void;
  onApply?: () => void | boolean | Promise<boolean | void>;
  loadingApply?: boolean;
  disabledApply?: boolean;
  labelApply?: string;
  className?: string;
}

export interface IModalWrapperProps extends Omit<IModalProps, "isOpen"> {
  content?: ReactNode;
  closeRef?: React.RefObject<{ close: () => void } | null>;
}
