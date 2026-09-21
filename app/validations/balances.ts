import * as yup from "yup";
import type { TPatchBalanceArgs, TPostSingleBalanceArgs } from "../api/balances/types";

export const createBalanceSchema = yup.object({
  balance: yup.number().required("Balance is required").typeError("Balance must be a number"),
  enddate: yup.string().required("End date is required"),
}) satisfies yup.Schema<Omit<TPostSingleBalanceArgs, "accountId">>;

export const editBalanceSchema = yup.object({
  balance: yup.number().required("Balance is required").typeError("Balance must be a number"),
  enddate: yup.string().required("End date is required"),
}) satisfies yup.Schema<TPatchBalanceArgs>;
