type TStatus = "info" | "success" | "error";
type TSize = "small" | "default" | "large";

export interface ITextAreaProps extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, "size"> {
  label?: string;
  status?: TStatus;
  message?: string;
  size?: TSize;
  resizable?: boolean;
  maxLength?: number;
  showCounter?: boolean;
}
