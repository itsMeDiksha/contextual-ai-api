// src/routes/query.ts
import { ensureIndex } from "../server";
import { retrieve, type Context } from "../search/index";

type QueryBody = {
  query?: string;
  context?: Context;
};

export async function runQuery(body: QueryBody) {
  const t0 = Date.now();
  await ensureIndex();

  const q = (body.query || "").trim();
  const ctx: Context = body.context || {};
  const { results, trace } = await retrieve(q, ctx, 8);

  // Build lightweight, grounded response without external model first
  // Recommend top 3 catalog items; include one help tip if query looks like assistance
  const isHelp = /how|help|tips?|volume|speed|source|traffic/i.test(q);
  const recs = results
    .filter(r => r.kind === "catalog")
    .slice(0, 3)
    .map(r => ({
      id: r.doc_id,
      title: r.title,
      reason: `Relevant for ${ctx.time_of_day || "current time"} on ${ctx.route_type || "any route"} based on tags ${r.tags.slice(0,2).join(", ") || "general"}`,
    }));

  const help = isHelp
    ? results.find(r => r.kind === "help")
    : null;

  const citations = results.slice(0, 4).map(r => ({ id: r.doc_id, title: r.title }));

  const answer = isHelp && help
    ? `Here’s a quick tip: ${help.text}`
    : `Recommended ${recs.length} options based on the trip context. Open a card to see source snippets.`;

  return {
    answer,
    recommendations: recs,
    citations,
    timings: {
      totalMs: Date.now() - t0,
    },
    trace,
  };
}
