// src/search/index.ts
import type { IndexedDoc } from "../data/loader";
import { getIndex } from "../data/loader";

function cosine(a: number[], b: number[]) {
  let s = 0;
  for (let i = 0; i < a.length; i++) s += a[i] * b[i];
  return s; // vectors already normalized in loader
}

// tiny text embed must match loader; in production import the same function/provider
async function embed(text: string): Promise<number[]> {
  const dim = 128;
  const v = new Array(dim).fill(0);
  let h = 2166136261 >>> 0;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 16777619) >>> 0;
    v[h % dim] += 1;
  }
  const norm = Math.sqrt(v.reduce((s, x) => s + x * x, 0)) || 1;
  return v.map(x => x / norm);
}

export type Context = {
  time_of_day?: string;
  route_type?: string;
  trip_duration?: number;
  last_played?: string;
};

export async function retrieve(query: string, ctx: Context, k = 8) {
  const qvec = await embed(query && query.trim().length ? query : "recommendations");
  const idx: IndexedDoc[] = getIndex();

  // Basic filter by context
  const filtered = idx.filter(d => {
    const tod = ctx.time_of_day ? (d.time_of_day || []).includes(ctx.time_of_day) : true;
    const rt = ctx.route_type ? (d.route_type || []).includes(ctx.route_type) : true;
    return tod && rt;
  });

  // Score by cosine, light bonuses
  const scored = filtered.map(d => {
    const score = cosine(qvec, d.vector)
      + ((ctx.last_played && d.id === ctx.last_played) ? -0.2 : 0) // avoid repeats
      + ((d.kind === "catalog" && (d.duration_min || 0) <= 15 && (ctx.trip_duration || 0) <= 25 ? 0.05 : 0));
    return { doc: d, score };
  });

  scored.sort((a, b) => b.score - a.score);
  const top = scored.slice(0, k).map(({ doc, score }) => ({
    doc_id: doc.id,
    title: doc.title,
    text: doc.snippet,
    tags: doc.tags || [],
    kind: doc.kind,
    score,
  }));

  return {
    results: top,
    trace: {
      query,
      ctx,
      total: idx.length,
      filtered: filtered.length,
      topScores: top.map(t => Number(t.score.toFixed(4))),
    },
  };
}
