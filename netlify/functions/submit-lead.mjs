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


function validateField(value) {
  return typeof value === "string" && value.trim().length > 0;
}

export async function handler(event) {
  if ((event.httpMethod || "GET") !== "POST") return methodNotAllowed();

  const configStore = getStore("bet-in-gamer-config");
  const current = await configStore.get("form_enabled");
  const enabled = current === null ? true : current === "1";

  if (!enabled) {
    return response(403, {
      ok: false,
      message: "O formulário está desativado no momento."
    });
  }

  const body = parseBody(event);
  const payload = {
    email: body.email || "",
    platformId: body.platformId || "",
    whatsapp: body.whatsapp || "",
    pix: body.pix || "",
    foundBy: body.foundBy || "",
    data: body.data || new Date().toLocaleString("pt-BR")
  };

  if (![payload.email, payload.platformId, payload.whatsapp, payload.pix].every(validateField)) {
    return response(400, {
      ok: false,
      message: "Preencha todos os campos obrigatórios."
    });
  }

  const submissionsStore = getStore("bet-in-gamer-submissions");
  const key = `${Date.now()}-${crypto.randomUUID()}`;
  await submissionsStore.setJSON(key, payload);

  return response(200, {
    ok: true,
    message: "Cadastro salvo com sucesso!"
  });
}
