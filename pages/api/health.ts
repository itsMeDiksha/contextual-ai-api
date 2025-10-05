import type { NextApiRequest, NextApiResponse } from "next";
// adjust to real imports in your repo
import { ensureIndex } from "../../src/server";
import { getIndex } from "../../src/data/loader";

function setCors(res: NextApiResponse) {
  // add your deployed site origin too, e.g. https://itsmediksha.github.io
  res.setHeader("Access-Control-Allow-Origin", process.env.ALLOWED_ORIGIN ?? "http://localhost:3000");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Vary", "Origin");
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  setCors(res);
  if (req.method === "OPTIONS") return res.status(204).end();
  try {
    const t0 = Date.now();
    await ensureIndex();
    res.status(200).json({ ok: true, indexCount: getIndex().length, timeMs: Date.now() - t0, timestamp: new Date().toISOString() });
  } catch (e: any) {
    res.status(500).json({ ok: false, error: e?.message || "unknown error" });
  }
}
