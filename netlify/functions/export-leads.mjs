import * as XLSX from "xlsx";
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

function csvEscape(value) {
  const text = String(value ?? "");
  return `"${text.replace(/"/g, '""')}"`;
}

export default async function handler(req) {
  try {
  if (req.method !== "POST") return methodNotAllowed();

  const body = await parseBody(req);
  const { login = "", pass = "" } = body;

  if (login !== ADMIN_USER || pass !== ADMIN_PASS) {
    return unauthorized();
  }

  const submissionsStore = openStore("bet-in-gamer-submissions");
  const { blobs } = await submissionsStore.list();
  const sorted = [...blobs].sort((a, b) => b.key.localeCompare(a.key));

  const rows = [];

  for (const item of sorted) {
    const raw = await submissionsStore.get(item.key);
    if (!raw) continue;
    let data;
    try {
      data = JSON.parse(raw);
    } catch {
      continue;
    }
    rows.push({
      email: data.email || "",
      platformId: data.platformId || "",
      whatsapp: data.whatsapp || "",
      pix: data.pix || "",
      foundBy: data.foundBy || "",
      data: data.data || ""
    });
  }

  const worksheet = XLSX.utils.json_to_sheet(rows, {
    header: ["email", "platformId", "whatsapp", "pix", "foundBy", "data"]
  });
  worksheet["!cols"] = [
    { wch: 28 },
    { wch: 18 },
    { wch: 18 },
    { wch: 22 },
    { wch: 16 },
    { wch: 22 }
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Leads");

  const buffer = XLSX.write(workbook, {
    type: "buffer",
    bookType: "xlsx"
  });

  return new Response(buffer, {
    status: 200,
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": 'attachment; filename="formularios_bet_in_gamer.xlsx"',
      "Cache-Control": "no-store"
    }
  });
  } catch (error) {
    return new Response(JSON.stringify({ ok: false, message: error?.message || "Erro interno." }), {
      status: 500,
      headers: jsonHeaders
    });
  }
}