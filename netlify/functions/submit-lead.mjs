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

function validateField(value) {
  return typeof value === "string" && value.trim().length > 0;
}

async function handler(req) {
  if (req.method !== "POST") return methodNotAllowed();

  const configStore = getStore("bet-in-gamer-config");
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
    email: body.email || "",
    platformId: body.platformId || "",
    whatsapp: body.whatsapp || "",
    pix: body.pix || "",
    foundBy: body.foundBy || "",
    data: body.data || new Date().toLocaleString("pt-BR")
  };

  if (![payload.email, payload.platformId, payload.whatsapp, payload.pix].every(validateField)) {
    return new Response(JSON.stringify({
      ok: false,
      message: "Preencha todos os campos obrigatórios."
    }), {
      status: 400,
      headers: jsonHeaders
    });
  }

  const submissionsStore = getStore("bet-in-gamer-submissions");
  const key = `${Date.now()}-${crypto.randomUUID()}`;
  await submissionsStore.setJSON(key, payload);

  return new Response(JSON.stringify({
    ok: true,
    message: "Cadastro salvo com sucesso!"
  }), {
    status: 200,
    headers: jsonHeaders
  });
}

export { handler };
