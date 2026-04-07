import { getStore } from "@netlify/blobs";

const jsonHeaders = {
  "Content-Type": "application/json; charset=utf-8",
  "Cache-Control": "no-store"
};

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
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      headers: jsonHeaders,
      body: JSON.stringify({ ok: false, message: "Método não permitido." })
    };
  }

  try {
    const configStore = getStore("bet-in-gamer-config");
    const current = await configStore.get("form_enabled");
    const enabled = current === null ? true : current === "1";

    if (!enabled) {
      return {
        statusCode: 403,
        headers: jsonHeaders,
        body: JSON.stringify({
          ok: false,
          message: "O formulário está desativado no momento."
        })
      };
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
      return {
        statusCode: 400,
        headers: jsonHeaders,
        body: JSON.stringify({
          ok: false,
          message: "Preencha todos os campos obrigatórios."
        })
      };
    }

    const submissionsStore = getStore("bet-in-gamer-submissions");
    const key = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
    await submissionsStore.setJSON(key, payload);

    return {
      statusCode: 200,
      headers: jsonHeaders,
      body: JSON.stringify({
        ok: true,
        message: "Cadastro salvo com sucesso! Te aguardo na minha live às 22hs 🎯"
      })
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers: jsonHeaders,
      body: JSON.stringify({ ok: false, message: "Erro ao salvar cadastro." })
    };
  }
}
