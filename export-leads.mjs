export async function handler(req) {
  try {
    const ADMIN_PASSWORD = "marcos7754";

    const data = [];

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": "attachment; filename=leads.csv"
      },
      body: data.map(l => `${l.name},${l.phone}`).join("\n")
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: "Erro ao exportar"
    };
  }
}
