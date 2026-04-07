export async function handler(event) {
  try {
    const body = JSON.parse(event.body || "{}");

    const login = body.login;
    const pass = body.pass;

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

    return {
      statusCode: 200,
      body: JSON.stringify({
        ok: true,
        message: "Acesso liberado"
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
