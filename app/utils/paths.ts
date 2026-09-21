export const API = {
  AUTH: {
    SIGN_IN: "/api/auth/sign-in",
    POST_USER: "/api/auth/post-user",
    SIGN_OUT: "/api/auth/sign-out",
    GET_SELF_USER: "/api/auth/get-self-user",
    LIST_USERS: "/api/auth/list-users",
    PATCH_USER: "/api/auth/patch-user/",
    DELETE_USER: "/api/auth/delete-user/",
    REFRESH_TOKEN: "/api/auth/refresh-token",
  },

  ACCOUNTS: {
    GET_ACCOUNTS: "/api/balances/get-balances/",
    POST_ACCOUNT: "/api/accounts/post-account",
    PATCH_ACCOUNT: "/api/accounts/patch-account/",
    DELETE_ACCOUNT: "/api/accounts/delete-account/",
  },

  BANKS: {
    GET_BANKS: "/api/banks/get-banks",
    GET_BANK: "/api/banks/get-bank/",
    POST_BANK: "/api/banks/post-bank",
    PATCH_BANK: "/api/banks/patch-bank/",
    DELETE_BANK: "/api/banks/delete-bank/",
  },

  TRANSACTIONS: {
    GET_TRANSACTIONS: "/api/transactions/get-transactions/",
    GET_TRANSACTION: "/api/transactions/get-transaction/",
    POST_TRANSACTION: "/api/transactions/post-transaction",
    PATCH_TRANSACTION: "/api/transactions/patch-transaction/",
    DELETE_TRANSACTION: "/api/transactions/delete-transaction/",
    DELETE_TRANSACTIONS: "/api/transactions/delete-transactions/",
  },

  BALANCES: {
    GET_BALANCES: "/api/balances/get-balances/",
    GET_YEARS: "/api/balances/get-years",
    POST_BALANCES: "/api/balances/post-balances",
    POST_BALANCE: "/api/balances/post-balance",
    PATCH_BALANCE: "/api/balances/patch-balances/",
    DELETE_BALANCE: "/api/balances/delete-balances/",
  },
};

export const DEMO_USER_ID = "zXwvyA8yCxSXCbuBA4eD9bekEHy2";
