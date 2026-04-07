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
    return req
      .text()
      .then((text) => Object.fromEntries(new URLSearchParams(text)))
      .catch(() => ({}));
  }

  return req.json().catch(() => ({}));
}

import { openStore } from "./_store.mjs";

function validateField(value) {
  return typeof value === "string" && value.trim().length > 0;
}

export default async function handler(req) {
  try {
    if (req.method !== "POST") return methodNotAllowed();

    const configStore = openStore("bet-in-gamer-config");
    const current = await configStore.get("form_enabled");
    const enabled = current === null ? true : current === "1";

    if (!enabled) {
      return new Response(JSON.stringify({
        ok: false,
        message: "O formulário está desativado no momento."
      }), {
        status: 403,
        headers: jsonHeaders
      });
    }

    const body = await parseBody(req);
    const payload = {
      platformId: body.platformId || "",
      whatsapp: body.whatsapp || "",
      pix: body.pix || "",
      foundBy: body.foundBy || "",
      data: body.data || new Date().toLocaleString("pt-BR")
    };

    if (![payload.platformId, payload.whatsapp, payload.pix].every(validateField)) {
      return new Response(JSON.stringify({
        ok: false,
        message: "Preencha todos os campos obrigatórios."
      }), {
        status: 400,
        headers: jsonHeaders
      });
    }

    const submissionsStore = openStore("bet-in-gamer-submissions");
    const key = `${Date.now()}-${crypto.randomUUID()}`;
    await submissionsStore.setJSON(key, payload);

    return new Response(JSON.stringify({
      ok: true,
      message: "Cadastro salvo com sucesso!"
    }), {
      status: 200,
      headers: jsonHeaders
    });
  } catch (error) {
    return new Response(JSON.stringify({
      ok: false,
      message: error?.message || "Erro interno."
    }), {
      status: 500,
      headers: jsonHeaders
    });
  }
}
