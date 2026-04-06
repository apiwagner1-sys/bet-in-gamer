const jsonHeaders = {
  "Content-Type": "application/json; charset=utf-8",
  "Cache-Control": "no-store"
};

const ADMIN_USER = process.env.ADMIN_USER || "admin";
const ADMIN_PASS = process.env.ADMIN_PASS || "marcos7754";

function unauthorized(message = "Login ou senha incorretos.") {
  return new Response(JSON.stringify({ ok: false, message }), {
    status: 401,
    headers: jsonHeaders
  });
}

function methodNotAllowed() {
  return new Response(JSON.stringify({ ok: false, message: "Método não permitido." }), {
    status: 405,
    headers: jsonHeaders
  });
}

function parseBody(req) {
  return req.json().catch(() => ({}));
}

import { getStore } from "@netlify/blobs";

async function handler(req) {
  if (req.method !== "POST") return methodNotAllowed();

  const body = await parseBody(req);
  const { login = "", pass = "", enabled, checkOnly = false } = body;

  if (login !== ADMIN_USER || pass !== ADMIN_PASS) {
    return unauthorized();
  }

  const configStore = getStore("bet-in-gamer-config");

  if (checkOnly) {
    const current = await configStore.get("form_enabled");
    const currentEnabled = current === null ? true : current === "1";
    return new Response(JSON.stringify({
      ok: true,
      enabled: currentEnabled,
      message: "Área administrativa liberada."
    }), {
      status: 200,
      headers: jsonHeaders
    });
  }

  const nextEnabled = Boolean(enabled);
  await configStore.set("form_enabled", nextEnabled ? "1" : "0");

  return new Response(JSON.stringify({
    ok: true,
    enabled: nextEnabled,
    message: nextEnabled ? "Formulário ativado." : "Formulário desativado."
  }), {
    status: 200,
    headers: jsonHeaders
  });
}

export { handler };
