export interface ISelectOptions {
  value: string;
  label: string;
  isDisabled?: boolean;
}

export interface ISelectProps {
  options: ISelectOptions[];
  value?: string;
  type?: TTypes;
  placeholder?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  className?: string;
  disabled?: boolean;
}

type TTypes = "default" | "search";
