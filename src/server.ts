// src/server.ts
import { loadDataAndBuildIndex } from "./data/loader";

let indexReady: Promise<any> | null = null;

export async function ensureIndex() {
  if (!indexReady) {
    indexReady = loadDataAndBuildIndex(process.cwd());
  }
  return indexReady;
}
