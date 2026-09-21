import type { TSignInResponse } from "../sign-in/types";

export type TPostUserArgs = {
  email: string;
  password: string;
  confirmPassword: string;
  displayName?: string;
  photoURL?: string;
};

export type TPostUserResponse = TSignInResponse;
