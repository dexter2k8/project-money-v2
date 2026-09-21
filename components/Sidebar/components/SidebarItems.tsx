import { cx } from "class-variance-authority";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Tooltip } from "react-tooltip";
import type { ISidebarProps } from "..";

interface ISidebarItemProps extends ISidebarProps {
  isCollapsed: boolean;
}

export default function SidebarItems({ items, isCollapsed }: ISidebarItemProps) {
  const pathname = usePathname();

  return (
    <ul className="flex flex-col gap-4">
      {items.map(({ label, path, icon }, i) => (
        <li
          key={i}
          data-tooltip-id={label}
          className={cx(pathname === path ? "bg-violet-200" : "hover:bg-violet-100")}
        >
          <Link className="flex items-center" href={path}>
            <figure className="px-4.5">{icon}</figure>
            <h4>{label}</h4>
          </Link>

          {isCollapsed && <Tooltip className="z-50" id={label} place="right" content={label} />}
        </li>
      ))}
    </ul>
  );
}
