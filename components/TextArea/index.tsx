"use client";
import { useState } from "react";
import { counterVariants, labelVariants, messageVariants, textareaVariants } from "./constants";
import CheckCircle from "../Input/Icons/check-circle";
import ExclamationCircle from "../Input/Icons/exclamation-circle";
import InfoCircle from "../Input/Icons/info-circle";
import type { ITextAreaProps } from "./types";
export type { ITextAreaProps } from "./types";
import { ControlledTextArea } from "./ControlledTextArea";

type TStatus = "info" | "success" | "error";

const messageIcon = (status: TStatus) => {
  const icon = {
    info: <InfoCircle />,
    success: <CheckCircle />,
    error: <ExclamationCircle />,
  };
  return icon[status];
};

function TextAreaBasic({
  label,
  status = "info",
  message,
  placeholder,
  size = "default",
  disabled,
  resizable = false,
  maxLength,
  showCounter = false,
  value,
  onChange,
  ...props
}: ITextAreaProps) {
  const [internalValue, setInternalValue] = useState(value ?? "");
  const currentValue = value ?? internalValue;
  const charCount = String(currentValue).length;
  const isOverLimit = maxLength !== undefined && charCount > maxLength;

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInternalValue(e.target.value);
    onChange?.(e);
  };

  const counterStatus: TStatus = isOverLimit ? "error" : status;

  return (
    <div className="relative w-full">
      <textarea
        className={textareaVariants({ size, disabled, resizable, status })}
        placeholder={(label && " ") || placeholder}
        disabled={disabled}
        value={currentValue}
        onChange={handleChange}
        maxLength={maxLength}
        {...props}
      />

      <label className={labelVariants({ size, disabled, status })}>{label}</label>

      {showCounter && maxLength !== undefined && (
        <div className={counterVariants({ status: counterStatus })}>
          <span>
            {charCount}/{maxLength}
          </span>
        </div>
      )}

      {message && (
        <p className={messageVariants({ status })}>
          {messageIcon(status)} {message}
        </p>
      )}
    </div>
  );
}

const TextArea = TextAreaBasic as React.FC<ITextAreaProps> & {
  Controlled: typeof ControlledTextArea;
};
TextArea.Controlled = ControlledTextArea;

export default TextArea;
