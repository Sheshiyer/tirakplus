import type { AppConfig, Env } from "./config";
import { createEmbeddings } from "./nvidia";
import type { ChunkRecord, CorpusFile, MuseRoleIntent, SearchResult } from "./types";

const CHUNK_SIZE = 1200;
const CHUNK_OVERLAP = 180;
const DEFAULT_MIN_SCORE = 0.12;

export type SearchOptions = {
  topK?: number;
  minScore?: number;
  roleIntent?: MuseRoleIntent;
  categories?: string[];
};

export async function ingestCorpus(env: Env, appConfig: AppConfig, corpus: CorpusFile): Promise<{ count: number }> {
  const chunks = corpus.docs.flatMap((doc) => splitIntoChunks(normalizeText(doc.content)).map((text, chunkIndex) => ({
    id: `${doc.slug}#${chunkIndex}`,
    slug: doc.slug,
    title: doc.title,
    category: doc.category,
    sourcePath: doc.sourcePath,
    audience: doc.audience,
    tags: doc.tags,
    sensitivity: doc.sensitivity,
    chunkIndex,
    text,
  })));

  const embeddings = await createEmbeddings(env, chunks.map((chunk) => chunk.text), appConfig.embeddingModel, "passage");
  const records: ChunkRecord[] = chunks.map((chunk, index) => ({
    ...chunk,
    ...(embeddings?.[index] ? { embedding: embeddings[index] } : {}),
  }));

  await env.APP_INDEX.put(indexKey(appConfig.appId), JSON.stringify(records));
  return { count: records.length };
}

export async function searchCorpus(
  env: Env,
  appConfig: AppConfig,
  query: string,
  optionsOrTopK?: SearchOptions | number,
): Promise<SearchResult[]> {
  const stored = await env.APP_INDEX.get<ChunkRecord[]>(indexKey(appConfig.appId), "json");
  if (!stored?.length) return [];

  const options = typeof optionsOrTopK === "number" ? { topK: optionsOrTopK } : optionsOrTopK ?? {};
  const queryEmbedding = await createEmbeddings(env, [query], appConfig.embeddingModel, "query");
  const scoped = stored.filter((chunk) => matchesScope(chunk, options));
  const scored = scoped.map((chunk) => ({
    id: chunk.id,
    score: queryEmbedding?.[0] && chunk.embedding
      ? cosineSimilarity(queryEmbedding[0], chunk.embedding)
      : lexicalScore(query, chunk.text, chunk.title),
    text: chunk.text,
    metadata: {
      slug: chunk.slug,
      title: chunk.title,
      category: chunk.category,
      sourcePath: chunk.sourcePath,
      audience: chunk.audience,
      tags: chunk.tags,
      sensitivity: chunk.sensitivity,
      chunkIndex: chunk.chunkIndex,
    },
  }));

  const minScore = options.minScore ?? DEFAULT_MIN_SCORE;
  return scored
    .filter((result) => result.score >= minScore)
    .sort((a, b) => b.score - a.score)
    .slice(0, options.topK ?? appConfig.searchTopK);
}

export function formatContext(results: SearchResult[]): string {
  return results.map((result, index) => {
    return `[${index + 1}] ${result.metadata.title} (${result.metadata.slug})\n${result.text}`;
  }).join("\n\n");
}

function indexKey(appId: string): string {
  return `index:${appId}`;
}

function splitIntoChunks(text: string): string[] {
  const chunks: string[] = [];
  let start = 0;
  while (start < text.length) {
    const end = Math.min(start + CHUNK_SIZE, text.length);
    const chunk = text.slice(start, end).trim();
    if (chunk) chunks.push(chunk);
    if (end === text.length) break;
    start = Math.max(end - CHUNK_OVERLAP, start + 1);
  }
  return chunks;
}

function normalizeText(text: string): string {
  return text.replace(/\r\n/g, "\n").replace(/\n{3,}/g, "\n\n").trim();
}

function matchesScope(chunk: ChunkRecord, options: SearchOptions): boolean {
  if (options.categories?.length && !options.categories.includes(chunk.category)) return false;
  if (!options.roleIntent || options.roleIntent === "unknown") return true;
  return !chunk.audience?.length || chunk.audience.includes(options.roleIntent) || chunk.audience.includes("unknown");
}

function lexicalScore(query: string, text: string, title: string): number {
  const terms = new Set(query.toLowerCase().split(/[^a-z0-9]+/).filter((term) => term.length > 2));
  const haystack = `${title}\n${text}`.toLowerCase();
  let score = 0;
  for (const term of terms) {
    if (haystack.includes(term)) score += 1;
  }
  return score / Math.max(terms.size, 1);
}

function cosineSimilarity(a: number[], b: number[]): number {
  let dot = 0;
  let normA = 0;
  let normB = 0;
  const length = Math.min(a.length, b.length);
  for (let index = 0; index < length; index += 1) {
    dot += a[index] * b[index];
    normA += a[index] * a[index];
    normB += b[index] * b[index];
  }
  return normA && normB ? dot / (Math.sqrt(normA) * Math.sqrt(normB)) : 0;
}
