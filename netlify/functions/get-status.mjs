import { getStore } from "@netlify/blobs";

const jsonHeaders = {
  "Content-Type": "application/json; charset=utf-8",
  "Cache-Control": "no-store"
};

export async function handler(event) {
  if (event.httpMethod !== "GET") {
    return {
      statusCode: 405,
      headers: jsonHeaders,
      body: JSON.stringify({ ok: false, message: "Método não permitido." })
    };
  }

  try {
    const configStore = getStore("bet-in-gamer-config");
    const value = await configStore.get("form_enabled");
    const enabled = value === null ? true : value === "1";

    return {
      statusCode: 200,
      headers: jsonHeaders,
      body: JSON.stringify({ ok: true, enabled })
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers: jsonHeaders,
      body: JSON.stringify({ ok: false, message: "Falha ao consultar status do formulário." })
    };
  }
}
