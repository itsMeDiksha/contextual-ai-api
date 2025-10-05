// src/routes/health.ts
import { ensureIndex } from "../server";
import { getIndex } from "../data/loader";

export async function handleHealth(req: any, res: any) {
  const t0 = Date.now();
  try {
    await ensureIndex();
    const count = getIndex().length;
    const ms = Date.now() - t0;
    res.status(200).json({
      ok: true,
      indexCount: count,
      timeMs: ms,
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    res.status(500).json({
      ok: false,
      error: err?.message || "unknown error",
    });
  }
}
