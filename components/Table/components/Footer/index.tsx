import { cx } from "class-variance-authority";
import type { IGridColDef } from "../..";

export interface IFooter<T> {
  rows: T[];
  columns: IGridColDef<T>[];
  footerFirst?: React.ReactNode;
}
export default function TableFooter<T>({ rows, columns, footerFirst }: IFooter<T>) {
  const firstIndex = columns.findIndex((col) => col.renderFooter);
  if (firstIndex === -1 && !footerFirst) return null;

  const span = footerFirst
    ? 1
    : (() => {
        let s = 1;
        for (let i = firstIndex + 1; i < columns.length && !columns[i].renderFooter; i++) {
          s++;
        }
        return s;
      })();

  return (
    <tfoot className="font-semibold bg-neutral-100 sticky bottom-0">
      <tr>
        <td className="p-2 whitespace-nowrap" colSpan={span}>
          {firstIndex !== -1 && columns[firstIndex].renderFooter
            ? columns[firstIndex].renderFooter!(rows)
            : ""}
        </td>
        {footerFirst && (
          <td className="p-2 whitespace-nowrap text-right" colSpan={columns.length - span}>
            {footerFirst}
          </td>
        )}
        {!footerFirst &&
          columns.slice(firstIndex + span).map((col, i) => (
            <td className={cx("p-2 whitespace-nowrap", col.className)} key={i}>
              {col.renderFooter ? col.renderFooter(rows) : ""}
            </td>
          ))}
      </tr>
    </tfoot>
  );
}
