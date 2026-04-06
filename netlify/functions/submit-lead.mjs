export async function handler(req) {
  const data = JSON.parse(req.body);

  return {
    statusCode: 200,
    body: JSON.stringify({ success: true })
  };
}
