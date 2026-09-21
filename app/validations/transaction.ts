import * as yup from "yup";

export const transactionSchema = yup.object({
  dtposted: yup.string().required("Data é obrigatória"),
  memo: yup
    .string()
    .required("Descrição é obrigatória")
    .max(100, "Descrição deve ter no máximo 100 caracteres"),
  chknum: yup.string().optional(),
  trnamt: yup
    .number()
    .required("Valor é obrigatório")
    .typeError("Valor deve ser um número"),
  trntype: yup.string().optional(),
});

export type TTransactionFormValues = yup.InferType<typeof transactionSchema>;
