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


function csvEscape(value) {
  const text = String(value ?? "");
  return `"${text.replace(/"/g, '""')}"`;
}

export async function handler(event) {
  if ((event.httpMethod || "GET") !== "POST") return methodNotAllowed();

  const body = parseBody(event);
  const { login = "", pass = "" } = body;

  if (login !== ADMIN_USER || pass !== ADMIN_PASS) {
    return unauthorized();
  }

  const submissionsStore = getStore("bet-in-gamer-submissions");
  const { blobs = [] } = await submissionsStore.list();
  const sorted = [...blobs].sort((a, b) => b.key.localeCompare(a.key));

  const rows = [
    ["email", "platformId", "whatsapp", "pix", "foundBy", "data"]
  ];

  for (const item of sorted) {
    const raw = await submissionsStore.get(item.key);
    if (!raw) continue;

    let data;
    try {
      data = JSON.parse(raw);
    } catch {
      continue;
    }

    rows.push([
      data.email || "",
      data.platformId || "",
      data.whatsapp || "",
      data.pix || "",
      data.foundBy || "",
      data.data || ""
    ]);
  }

  const csv = rows.map((row) => row.map(csvEscape).join(",")).join("\n");

  return {
    statusCode: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="formularios_bet_in_gamer.csv"',
      "Cache-Control": "no-store"
    },
    body: csv
  };
}
