import { getStore } from "@netlify/blobs";

const jsonHeaders = {
  "Content-Type": "application/json; charset=utf-8",
  "Cache-Control": "no-store"
};

const ADMIN_USER = process.env.ADMIN_USER || "admin";
const ADMIN_PASS = process.env.ADMIN_PASS || "marcos7754";

function parseBody(event) {
  try {
    return JSON.parse(event.body || "{}");
  } catch {
    return {};
  }
}

export async function handler(event) {
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      headers: jsonHeaders,
      body: JSON.stringify({ ok: false, message: "Método não permitido." })
    };
  }

  try {
    const body = parseBody(event);
    const { login = "", pass = "", enabled, checkOnly = false } = body;

    if (login !== ADMIN_USER || pass !== ADMIN_PASS) {
      return {
        statusCode: 401,
        headers: jsonHeaders,
        body: JSON.stringify({ ok: false, message: "Login ou senha incorretos." })
      };
    }

    const configStore = getStore("bet-in-gamer-config");

    if (checkOnly) {
      const current = await configStore.get("form_enabled");
      const currentEnabled = current === null ? true : current === "1";

      return {
        statusCode: 200,
        headers: jsonHeaders,
        body: JSON.stringify({
          ok: true,
          enabled: currentEnabled,
          message: "Área administrativa liberada."
        })
      };
    }

    const nextEnabled = Boolean(enabled);
    await configStore.set("form_enabled", nextEnabled ? "1" : "0");

    return {
      statusCode: 200,
      headers: jsonHeaders,
      body: JSON.stringify({
        ok: true,
        enabled: nextEnabled,
        message: nextEnabled ? "Formulário ativado." : "Formulário desativado."
      })
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers: jsonHeaders,
      body: JSON.stringify({ ok: false, message: "Falha ao atualizar status do formulário." })
    };
  }
}
