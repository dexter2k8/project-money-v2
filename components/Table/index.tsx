import Body from "./components/Body";
import Footer from "./components/Footer";
import Head from "./components/Head";

export interface IGridColDef<T> {
  field: keyof T;
  header: string;
  className?: string;
  renderHeader?: (value?: string) => React.ReactNode;
  render?: (value: T[keyof T], row: T) => React.ReactNode;
  renderFooter?: (rows: T[]) => React.ReactNode;
}
export interface ITableProps<T> {
  columns: IGridColDef<T>[];
  rows: T[];
  caption?: React.ReactNode;
  footerFirst?: React.ReactNode;
  loading?: boolean;
  emptyMessage?: string;
}

export default function Table<T>({
  rows,
  columns,
  caption,
  footerFirst,
  loading,
  emptyMessage,
}: ITableProps<T>) {
  return (
    <table className="w-full text-sm border-separate border-spacing-0">
      <Head columns={columns} caption={caption} />
      <Body rows={rows} columns={columns} loading={loading} emptyMessage={emptyMessage} />
      <Footer rows={rows} columns={columns} footerFirst={footerFirst} />
    </table>
  );
}
