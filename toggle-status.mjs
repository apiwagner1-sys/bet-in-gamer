export async function handler(req) {
  const ADMIN_PASSWORD = "marcos7754";

  return {
    statusCode: 200,
    body: JSON.stringify({ toggled: true })
  };
}
