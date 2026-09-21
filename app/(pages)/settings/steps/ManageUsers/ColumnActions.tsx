import { SquareMinus, SquarePen } from "lucide-react";
import { Tooltip } from "react-tooltip";
import type { IActions } from "./types";

interface ITableActionsProps extends IActions {
  id: string | number;
}

export default function ColumnActions({ id, onAction }: ITableActionsProps) {
  return (
    <div className="flex gap-4 [&_svg]:cursor-pointer">
      <span
        data-tooltip-id="edit-tooltip"
        data-tooltip-content="Edit"
        onClick={() => onAction({ action: "edit", id })}
      >
        <SquarePen size="1rem" />
      </span>
      <Tooltip id="edit-tooltip" />
      <span
        data-tooltip-id="delete-tooltip"
        data-tooltip-content="Delete"
        onClick={() => onAction({ action: "delete", id })}
      >
        <SquareMinus className="text-red-500" size="1rem" />
      </span>
      <Tooltip id="delete-tooltip" />
    </div>
  );
}
