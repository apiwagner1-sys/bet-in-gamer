export async function handler(event) {
  try {
    const body = JSON.parse(event.body || "{}");

    const email = String(body.email || "").trim();
    const platformId = String(body.platformId || "").trim();
    const whatsapp = String(body.whatsapp || "").trim();
    const pix = String(body.pix || "").trim();
    const foundBy = String(body.foundBy || "").trim();

    if (!email || !platformId || !whatsapp || !pix) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          ok: false,
          message: "Preencha todos os campos obrigatórios."
        })
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        ok: true,
        message: "Cadastro salvo com sucesso!"
      })
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        ok: false,
        message: "Erro ao salvar cadastro."
      })
    };
  }
}
