import { toast } from "react-toastify";

type TExportCsvOptions = {
  header: string;
  rows: string[];
  filename: string;
  emptyMessage: string;
  successMessage: string;
};

export function exportCsv({ header, rows, filename, emptyMessage, successMessage }: TExportCsvOptions) {
  if (rows.length === 0) {
    toast.info(emptyMessage);
    return;
  }

  const csv = [header, ...rows].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
  toast.success(successMessage);
}
