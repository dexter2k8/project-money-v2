import { toast } from "react-toastify";
import { API } from "@/app/utils/paths";
import type { TPatchUserArgs } from "@/app/api/auth/patch-user/types";
import type { TPostUserArgs } from "@/app/api/auth/post-user/types";
import type { TSignInArgs } from "@/app/api/auth/sign-in/types";

async function SignIn(data: TSignInArgs) {
  try {
    const response = await fetch(API.AUTH.SIGN_IN, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const json = await response.json();
    if (!response.ok) throw new Error(json.error || "Erro ao autenticar");
    toast.success("Welcome back!");
    return true;
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Erro ao autenticar";
    toast.error(message);
    return false;
  }
}

async function SignOut() {
  try {
    const response = await fetch(API.AUTH.SIGN_OUT, { method: "POST" });
    const json = await response.json();
    if (!response.ok) throw new Error(json.error || "Erro ao sair");
    return true;
  } catch (error: unknown) {
    console.error(error);
    const message = error instanceof Error ? error.message : "Erro ao sair";
    toast.error(message);
    return false;
  }
}

async function GetSelfUser() {
  try {
    const response = await fetch(API.AUTH.GET_SELF_USER, { method: "GET" });
    const json = await response.json();
    if (!response.ok) throw new Error(json.error || "Erro ao buscar usuário");
    return json;
  } catch (error: unknown) {
    console.error(error);
    return null;
  }
}

async function PostUser(data: TPostUserArgs) {
  try {
    const { confirmPassword, ...body } = data;
    void confirmPassword;
    const response = await fetch(API.AUTH.POST_USER, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const json = await response.json();
    if (!response.ok) throw new Error(json.error || "Erro ao criar conta");
    toast.success("Account created successfully!");
    return true;
  } catch (error: unknown) {
    console.error(error);
    const message = error instanceof Error ? error.message : "Erro ao criar conta";
    toast.error(message);
    return false;
  }
}

async function PatchUser(uid: string, data: TPatchUserArgs) {
  const { confirmPassword, ...body } = data;
  void confirmPassword;
  try {
    const response = await fetch(API.AUTH.PATCH_USER + uid, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const json = await response.json();
    if (!response.ok) throw new Error(json.error || "Erro ao atualizar perfil");
    toast.success("Account updated successfully!");
    return json;
  } catch (error: unknown) {
    console.error(error);
    const message = error instanceof Error ? error.message : "Erro ao atualizar perfil";
    toast.error(message);
    return null;
  }
}

async function DeleteUser(uid: string) {
  try {
    const response = await fetch(API.AUTH.DELETE_USER + uid, { method: "DELETE" });
    const json = await response.json();
    if (!response.ok) throw new Error(json.error || "Erro ao excluir conta");
    toast.success("Account deleted successfully!");
    return json;
  } catch (error: unknown) {
    console.error(error);
    const message = error instanceof Error ? error.message : "Erro ao excluir conta";
    toast.error(message);
    return null;
  }
}

async function RefreshSession() {
  try {
    const response = await fetch(API.AUTH.REFRESH_TOKEN, { method: "POST" });
    const json = await response.json();
    if (!response.ok) throw new Error(json.error || "Erro ao atualizar sessão");
    return json;
  } catch (error: unknown) {
    console.error(error);
    return null;
  }
}

export { SignIn, SignOut, GetSelfUser, PostUser, PatchUser, DeleteUser, RefreshSession };
