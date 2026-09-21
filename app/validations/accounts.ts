import * as yup from "yup";
import type { TPatchAccountArgs,TPostAccountArgs } from "../api/accounts/types";

export const postAccountSchema = yup.object({
  acctid: yup.string().required("Account ID is required"),
  accttype: yup.string().required("Account type is required"),
  bankid: yup.number().required("Bank ID is required").typeError("Bank ID must be a number"),
  branchid: yup.string().required("Branch ID is required"),
  description: yup.string().required("Description is required"),
}) satisfies yup.Schema<TPostAccountArgs>;

export const editAccountSchema = yup.object({
  acctid: yup.string().required("Account ID is required"),
  accttype: yup.string().required("Account type is required"),
  bankid: yup.number().required("Bank ID is required").typeError("Bank ID must be a number"),
  branchid: yup.string().required("Branch ID is required"),
  description: yup.string().required("Description is required"),
}) satisfies yup.Schema<TPatchAccountArgs>;
