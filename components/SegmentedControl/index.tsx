"use client";
import { useEffect, useRef, useState } from "react";
import { containerVariants, INDICATOR, liVariants } from "./constants";

export interface ISegmentedControlItem {
  key: number;
  label: React.ReactNode;
}

interface ISegmentedControlProps {
  items: ISegmentedControlItem[];
  defaultSelected?: number;
  selected?: number;
  onSelect?: (key: number) => void;
  disabled?: boolean;
}

export default function SegmentedControl({
  items,
  defaultSelected = 0,
  selected,
  onSelect,
  disabled = false,
}: ISegmentedControlProps) {
  const [internalActive, setInternalActive] = useState<number>(defaultSelected);
  const active = selected ?? internalActive;
  const containerRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    const activeItem = container?.querySelector(".segmented-control-item--active");
    if (!container || !activeItem) return;

    const { offsetLeft, offsetWidth } = activeItem as HTMLElement;
    container.style.setProperty("--indicator-left", `${offsetLeft}px`);
    container.style.setProperty("--indicator-width", `${offsetWidth}px`);
  }, [active]);

  return (
    <ul className={containerVariants({ disabled })} ref={containerRef}>
      <div className={INDICATOR} />
      {items.map((item) => (
        <li
          key={item.key}
          className={liVariants({ active: active === item.key, disabled })}
          onClick={() => {
            if (disabled) return;
            setInternalActive(item.key);
            onSelect?.(item.key);
          }}
        >
          {item.label}
        </li>
      ))}
    </ul>
  );
}
