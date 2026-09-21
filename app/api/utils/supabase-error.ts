type TClassifiedError = {
  status: number;
  message: string;
};

type TSupabaseError = {
  message?: string;
  code?: string;
  status?: number;
  hint?: string;
  details?: string;
};

function isSupabaseError(error: unknown): error is TSupabaseError {
  return error !== null && typeof error === "object" && "message" in error;
}

export function classifyError(error: unknown): TClassifiedError {
  if (isSupabaseError(error)) {
    const code = error.code;
    const message = error.message ?? "";

    if (code === "23505") {
      return { status: 409, message: "Recurso já existe." };
    }
    if (code === "23503") {
      return { status: 409, message: "Referência inválida." };
    }
    if (code === "42501" || message.includes("permission denied")) {
      return { status: 403, message: "Sem permissão para esta operação." };
    }
    if (code === "PGRST116" || message.includes("Row not found")) {
      return { status: 404, message: "Recurso não encontrado." };
    }
    if (message.includes("Invalid login credentials")) {
      return { status: 401, message: "Credenciais inválidas." };
    }
    if (message.includes("Email not confirmed")) {
      return { status: 401, message: "E-mail não confirmado." };
    }
    if (message.includes("Token has expired")) {
      return { status: 401, message: "Sessão expirada. Faça login novamente." };
    }
    if (message.includes("Invalid token") || message.includes("JWT")) {
      return { status: 401, message: "Credenciais inválidas." };
    }
    if (message.includes("rate limit")) {
      return { status: 429, message: "Muitas requisições. Tente novamente mais tarde." };
    }
    if (message.includes("User not found")) {
      return { status: 404, message: "Usuário não encontrado." };
    }

    return { status: 500, message: message || "Erro interno no servidor." };
  }

  return { status: 500, message: "Erro interno no servidor." };
}
