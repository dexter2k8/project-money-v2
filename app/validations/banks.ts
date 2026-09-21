import * as yup from "yup";
import type { TPatchBankArgs, TPostBankArgs } from "../api/banks/types";

export const postBankSchema = yup.object({
  id: yup.string().required("ID is required"),
  name: yup.string().required("Name is required"),
  alias: yup.string().required("Alias is required"),
}) satisfies yup.Schema<TPostBankArgs>;

export const editBankSchema = yup.object({
  id: yup.string().optional(),
  name: yup.string().required("Name is required"),
  alias: yup.string().required("Alias is required"),
}) satisfies yup.Schema<Omit<TPatchBankArgs, "id">>;
