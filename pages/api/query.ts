import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method Not Allowed" });
  }
  const { query = "" } = (req.body ?? {}) as { query?: string };
  const reply = query
    ? `Live API mock: "${query}" — RAG coming soon.`
    : "Send JSON { query: '...' }";
  return res.status(200).json({ reply, citations: [] });
}
