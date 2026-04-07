const jsonHeaders = {
  "Content-Type": "application/json; charset=utf-8",
  "Cache-Control": "no-store"
};

const ADMIN_USER = process.env.ADMIN_USER || "admin";
const ADMIN_PASS = process.env.ADMIN_PASS || "1234";

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
  const contentType = req.headers.get("content-type") || "";

  if (contentType.includes("application/json")) {
    return req.json().catch(() => ({}));
  }

  if (contentType.includes("application/x-www-form-urlencoded")) {
    return req.text().then((text) => Object.fromEntries(new URLSearchParams(text))).catch(() => ({}));
  }

  return req.json().catch(() => ({}));
}

import { openStore } from "./_store.mjs";

export default async function handler(req) {
  try {
  if (req.method !== "GET") return methodNotAllowed();

  const configStore = openStore("bet-in-gamer-config");
  const value = await configStore.get("form_enabled");
  const enabled = value === null ? true : value === "1";

  return new Response(JSON.stringify({ ok: true, enabled }), {
    status: 200,
    headers: jsonHeaders
  });
  } catch (error) {
    return new Response(JSON.stringify({ ok: false, message: error?.message || "Erro interno." }), {
      status: 500,
      headers: jsonHeaders
    });
  }
}