import type { CSSProperties, ReactNode } from "react";

export interface ITabsProps {
  items: ITabItemProps[];
  defaultSelected?: number;
  minWidth?: CSSProperties["minWidth"];
}

export interface ITabItemProps {
  key: number;
  label: ReactNode;
  children?: ReactNode;
}
