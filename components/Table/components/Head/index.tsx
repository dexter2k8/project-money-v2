import { cx } from "class-variance-authority";
import type { IGridColDef } from "../..";

export interface IHeadProps<T> {
  columns: IGridColDef<T>[];
  caption?: React.ReactNode;
}

export default function Head<T>({ columns, caption }: IHeadProps<T>) {
  return (
    <thead className="text-left sticky top-0 bg-white">
      {caption && (
        <tr className="h-10">
          <th className="px-2 whitespace-nowrap text-right font-semibold" colSpan={columns.length}>
            {caption}
          </th>
        </tr>
      )}

      <tr className="h-10">
        {columns.map((col, i) => (
          <th
            className={cx("border-b border-neutral-300 px-2 whitespace-nowrap", col.className)}
            key={i}
          >
            {col.renderHeader ? col.renderHeader(col.header) : col.header}
          </th>
        ))}
      </tr>
    </thead>
  );
}
