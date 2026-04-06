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

function csvEscape(value) {
  const text = String(value ?? "");
  return `"${text.replace(/"/g, '""')}"`;
}

async function handler(req) {
  if (req.method !== "POST") return methodNotAllowed();

  const body = await parseBody(req);
  const { login = "", pass = "" } = body;

  if (login !== ADMIN_USER || pass !== ADMIN_PASS) {
    return unauthorized();
  }

  const submissionsStore = getStore("bet-in-gamer-submissions");
  const { blobs } = await submissionsStore.list();
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

  return new Response(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="formularios_bet_in_gamer.csv"',
      "Cache-Control": "no-store"
    }
  });
}

export { handler };
