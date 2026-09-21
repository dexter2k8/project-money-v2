import { cx } from "class-variance-authority";
import { ChevronRight, Loader2 } from "lucide-react";
import { useSessionTimer } from "@/app/providers/SessionTimerProvider";

interface IMenuProps {
  onClick: () => void;
  isCollapsed?: boolean;
}
export default function SidebarArrow({ onClick, isCollapsed }: IMenuProps) {
  const { remainingSeconds, isLoading } = useSessionTimer();

  return (
    <div className="flex items-end justify-between p-2">
      <p
        className={cx(
          isCollapsed ? "w-0 opacity-0" : "opacity-100",
          "whitespace-nowrap transition-all duration-300 ease-in-out",
        )}
      >
        Session: {isLoading ? <Loader2 className="inline animate-spin" size={14} /> : formatTimer(remainingSeconds)}
      </p>
      <ChevronRight
        className="dark:invert cursor-pointer transition-all duration-300 ease-in-out"
        size={36}
        onClick={onClick}
        style={{ transform: `rotateY(${isCollapsed ? "0deg" : "180deg"})` }}
      />
    </div>
  );
}

const formatTimer = (seconds: number) => {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
};
