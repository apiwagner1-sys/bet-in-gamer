let enabled = true;

export async function handler(event) {
  try {
    const body = JSON.parse(event.body || "{}");

    const login = String(body.login || "").trim();
    const pass = String(body.pass || "").trim();

    const ADMIN_USER = "admin";
    const ADMIN_PASS = "marcos7754";

    if (login !== ADMIN_USER || pass !== ADMIN_PASS) {
      return {
        statusCode: 401,
        body: JSON.stringify({
          ok: false,
          message: "Login ou senha incorretos"
        })
      };
    }

    if (typeof body.enabled === "boolean") {
      enabled = body.enabled;
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        ok: true,
        enabled,
        message: enabled ? "Formulário ativado" : "Formulário desativado"
      })
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        ok: false,
        message: "Erro interno"
      })
    };
  }
}
