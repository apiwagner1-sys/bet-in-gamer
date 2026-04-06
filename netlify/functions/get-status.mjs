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
  if (req.method !== "GET") return methodNotAllowed();

  const configStore = getStore("bet-in-gamer-config");
  const value = await configStore.get("form_enabled");
  const enabled = value === null ? true : value === "1";

  return new Response(JSON.stringify({ ok: true, enabled }), {
    status: 200,
    headers: jsonHeaders
  });
}

export { handler };
