// src/data/loader.ts
import fs from "fs";
import path from "path";

// Minimal embedding stub: replace with real provider later
async function embed(text: string): Promise<number[]> {
  // Simple hash → vector mock for now (same length each time)
  const dim = 128;
  const v = new Array(dim).fill(0);
  let h = 2166136261 >>> 0;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 16777619) >>> 0;
    v[h % dim] += 1;
  }
  // L2 normalize
  const norm = Math.sqrt(v.reduce((s, x) => s + x * x, 0)) || 1;
  return v.map(x => x / norm);
}

export type Doc = {
  id: string;
  title: string;
  creator?: string;
  duration_min?: number;
  tags?: string[];
  time_of_day?: string[];
  route_type?: string[];
  popularity?: number;
  snippet: string;
  kind: "catalog" | "help";
};

export type IndexedDoc = Doc & { vector: number[] };

let INDEX: IndexedDoc[] = [];

export function getIndex(): IndexedDoc[] {
  return INDEX;
}

export async function loadDataAndBuildIndex(baseDir = process.cwd()) {
  const catalogPath = path.join(baseDir, "data", "catalog.json");
  const helpPath = path.join(baseDir, "data", "help.json");

  const catalog: Omit<Doc, "kind">[] = JSON.parse(fs.readFileSync(catalogPath, "utf8"));
  const help: Omit<Doc, "kind">[] = JSON.parse(fs.readFileSync(helpPath, "utf8"));

  const docs: Doc[] = [
    ...catalog.map(d => ({ ...d, kind: "catalog" as const })),
    ...help.map(d => ({ ...d, kind: "help" as const })),
  ];

  const out: IndexedDoc[] = [];
  for (const d of docs) {
    const vec = await embed(`${d.title}. ${d.snippet}`);
    out.push({ ...d, vector: vec });
  }
  INDEX = out;
  return { count: INDEX.length, catalog: catalog.length, help: help.length };
}
