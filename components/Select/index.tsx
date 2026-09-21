"use client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { cx } from "class-variance-authority";
import { ChevronDown } from "lucide-react";
import {
  INPUT,
  selectOptionsVariants,
  selectOptionVariants,
  selectTriggerVariants,
} from "./constants";
import type { ISelectProps } from "./types";

export default function Select({
  type = "default",
  className,
  options,
  defaultValue,
  placeholder,
  value,
  onChange,
  disabled = false,
}: ISelectProps) {
  const isControlled = value !== undefined;
  const [internalSelected, setInternalSelected] = useState(defaultValue);
  const selected = isControlled ? value : internalSelected;

  const [text, setText] = useState(options.find((t) => t.value === defaultValue)?.label ?? "");
  const [open, setOpen] = useState(false);
  const [isAbove, setIsAbove] = useState(false);
  const selectRef = useRef<HTMLDivElement>(null);

  const handleChange = useCallback(
    (newValue: string) => {
      if (!isControlled) {
        setInternalSelected(newValue);
      }
      setText(options.find((t) => t.value === newValue)?.label ?? "");
      onChange?.(newValue);
      setOpen(false);
    },
    [isControlled, options, onChange],
  );

  const handleInputFocus = useCallback(() => {
    setOpen(true);
    setText("");
  }, []);

  const filteredOptions = useMemo(
    () =>
      options.filter((option) => {
        if (type !== "search") return true;
        const label = option.label.toLowerCase();
        const searchText = text?.toLowerCase() || "";
        return label.includes(searchText);
      }),
    [options, type, text],
  );

  useEffect(() => {
    const handleScroll = () => {
      if (selectRef.current) {
        const { top } = selectRef.current.getBoundingClientRect();
        setIsAbove(top > window.innerHeight / 2);
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!selectRef.current?.contains(event.target as Node)) {
        if (type === "search") {
          setText(options.find((t) => t.value === selected)?.label || "");
        }
        setOpen(false);
      }
    };
    if (open) {
      document.addEventListener("click", handleClickOutside);
    }
    return () => document.removeEventListener("click", handleClickOutside);
  }, [open, type, options, selected]);

  const isPlaceholder = !options.some((t) => t.value === selected);

  return (
    <div className={cx("relative w-full min-w-0", className)}>
      <div
        ref={selectRef}
        className={selectTriggerVariants({
          type,
          isOpen: open,
          isPlaceholder,
          disabled,
        })}
        onClick={() => !disabled && type !== "search" && setOpen(!open)}
      >
        {type === "search" ? (
          <input
            className={INPUT}
            placeholder={placeholder}
            type="search"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onFocus={handleInputFocus}
            disabled={disabled}
          />
        ) : (
          <span className="flex-1 truncate text-sm">
            {options.find((t) => t.value === selected)?.label || placeholder}
          </span>
        )}

        {type === "default" && (
          <ChevronDown
            size={14}
            className={cx(
              "absolute right-2 text-neutral-500 transition-transform duration-200",
              open && "-rotate-180",
              disabled && "text-neutral-300",
            )}
          />
        )}
      </div>

      <ul
        className={selectOptionsVariants({
          isOpen: open,
          isAbove,
          isEmpty: !filteredOptions.length,
        })}
      >
        {filteredOptions.map((option) => (
          <li
            key={option.value}
            className={selectOptionVariants({
              isSelected: selected === option.value,
            })}
            onClick={() => handleChange(option.value)}
          >
            {option.label}
          </li>
        ))}
      </ul>
    </div>
  );
}
