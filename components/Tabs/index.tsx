"use client";
import { useEffect, useRef, useState } from "react";
import { activeLineVariants, tabItemVariants } from "./constants";
import type { ITabsProps } from "./types";

export type { ITabItemProps } from "./types";

export default function Tabs({ items, defaultSelected = 0, minWidth }: ITabsProps) {
  const [selected, setSelected] = useState(defaultSelected);
  const [indicator, setIndicator] = useState({ offset: 0, width: 0 });
  const activeRef = useRef<HTMLLIElement>(null);

  useEffect(() => {
    const el = activeRef.current;
    if (el) {
      setIndicator({ offset: el.offsetLeft, width: el.clientWidth });
    }
  }, [selected]);

  return (
    <div className="flex flex-col h-full">
      <ul className="relative list-none p-0 m-0 border-b border-neutral-200 shrink-0" style={{ minWidth }}>
        {items.map((item) => (
          <li
            key={item.key}
            className={tabItemVariants({ isActive: selected === item.key })}
            ref={selected === item.key ? activeRef : undefined}
            onClick={() => setSelected(item.key)}
          >
            {item.label}
          </li>
        ))}
      </ul>
      <div
        className={activeLineVariants}
        style={{ width: indicator.width, transform: `translate(${indicator.offset}px, -3px)` }}
      />
      <div className="h-0 flex-1 min-h-0">{items[selected]?.children}</div>
    </div>
  );
}
