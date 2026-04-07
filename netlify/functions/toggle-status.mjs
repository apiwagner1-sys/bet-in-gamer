import { getStore } from "@netlify/blobs";

const jsonHeaders = {
  "Content-Type": "application/json; charset=utf-8",
  "Cache-Control": "no-store"
};

const ADMIN_USER = process.env.ADMIN_USER || "admin";
const ADMIN_PASS = process.env.ADMIN_PASS || "marcos7754";

function response(statusCode, body, extraHeaders = {}) {
  return {
    statusCode,
    headers: { ...jsonHeaders, ...extraHeaders },
    body: typeof body === "string" ? body : JSON.stringify(body)
  };
}

function methodNotAllowed() {
  return response(405, { ok: false, message: "Método não permitido." });
}

function unauthorized(message = "Login ou senha incorretos.") {
  return response(401, { ok: false, message });
}

function parseBody(event) {
  try {
    return JSON.parse(event.body || "{}");
  } catch {
    return {};
  }
}


export async function handler(event) {
  if ((event.httpMethod || "GET") !== "POST") return methodNotAllowed();

  const body = parseBody(event);
  const { login = "", pass = "", enabled, checkOnly = false } = body;

  if (login !== ADMIN_USER || pass !== ADMIN_PASS) {
    return unauthorized();
  }

  const configStore = getStore("bet-in-gamer-config");

  if (checkOnly) {
    const current = await configStore.get("form_enabled");
    const currentEnabled = current === null ? true : current === "1";

    return response(200, {
      ok: true,
      enabled: currentEnabled,
      message: "Área administrativa liberada."
    });
  }

  const nextEnabled = Boolean(enabled);
  await configStore.set("form_enabled", nextEnabled ? "1" : "0");

  return response(200, {
    ok: true,
    enabled: nextEnabled,
    message: nextEnabled ? "Formulário ativado." : "Formulário desativado."
  });
}
