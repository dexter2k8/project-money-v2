import { cx } from "class-variance-authority";
import type { IGridColDef } from "../..";

interface IBodyProps<T> {
  rows: T[];
  columns: IGridColDef<T>[];
  loading?: boolean;
  emptyMessage?: string;
}

export default function Body<T>({ rows, columns, loading, emptyMessage }: IBodyProps<T>) {
  if (loading) {
    return (
      <tbody>
        <tr>
          <td className="p-4 text-center text-neutral-400" colSpan={columns.length}>
            <div className="flex items-center justify-center gap-2">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-neutral-300 border-t-violet-600" />
              Carregando...
            </div>
          </td>
        </tr>
      </tbody>
    );
  }

  if (rows.length === 0) {
    return (
      <tbody>
        <tr>
          <td className="p-4 text-center text-neutral-400" colSpan={columns.length}>
            {emptyMessage ?? "Nenhum dado disponível"}
          </td>
        </tr>
      </tbody>
    );
  }

  return (
    <tbody>
      {rows.map((row, i) => (
        <tr className="hover:bg-neutral-100" key={i}>
          {columns.map((col, j) => (
            <td
              className={cx("p-2 whitespace-nowrap border-b border-neutral-200", col.className)}
              key={j}
            >
              {col.render ? col.render(row[col.field], row) : String(row[col.field])}
            </td>
          ))}
        </tr>
      ))}
    </tbody>
  );
}
