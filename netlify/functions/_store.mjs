import { getStore } from "@netlify/blobs";

function pickEnv(...keys) {
  for (const key of keys) {
    const value = process.env[key];
    if (typeof value === "string" && value.trim()) return value.trim();
  }
  return "";
}

export function openStore(name) {
  const siteID = pickEnv("BLOBS_SITE_ID", "NETLIFY_BLOBS_SITE_ID", "NETLIFY_SITE_ID", "SITE_ID");
  const token = pickEnv("BLOBS_TOKEN", "NETLIFY_BLOBS_TOKEN", "NETLIFY_API_TOKEN", "NETLIFY_AUTH_TOKEN", "NETLIFY_TOKEN");

  try {
    if (siteID && token) {
      return getStore(name, { siteID, token });
    }
    return getStore(name);
  } catch (error) {
    const message = String(error?.message || error || "");
    if (message.includes("MissingBlobsEnvironmentError")) {
      const friendly = new Error("Netlify Blobs não está configurado. Defina BLOBS_SITE_ID e BLOBS_TOKEN nas variáveis do site.");
      friendly.cause = error;
      throw friendly;
    }
    throw error;
  }
}
