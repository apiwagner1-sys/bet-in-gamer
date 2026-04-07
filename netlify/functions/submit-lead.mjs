export async function handler(event) {
  try {
    const data = JSON.parse(event.body || "{}");

    if (!data.email || !data.whatsapp || !data.pix) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          ok: false,
          message: "Preencha todos os campos"
        })
      };
    }

    console.log("Novo lead:", data);

    return {
      statusCode: 200,
      body: JSON.stringify({
        ok: true,
        message: "Salvo com sucesso!"
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
