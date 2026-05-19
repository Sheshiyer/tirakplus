import type { AppConfig, Env } from "./config";
import { createEmbeddings } from "./nvidia";
import type { ChunkRecord, CorpusFile, SearchResult } from "./types";

const CHUNK_SIZE = 1200;
const CHUNK_OVERLAP = 180;

export async function ingestCorpus(env: Env, appConfig: AppConfig, corpus: CorpusFile): Promise<{ count: number }> {
  const chunks = corpus.docs.flatMap((doc) => splitIntoChunks(normalizeText(doc.content)).map((text, chunkIndex) => ({
    id: `${doc.slug}#${chunkIndex}`,
    slug: doc.slug,
    title: doc.title,
    category: doc.category,
    sourcePath: doc.sourcePath,
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

export async function searchCorpus(env: Env, appConfig: AppConfig, query: string, topK?: number): Promise<SearchResult[]> {
  const stored = await env.APP_INDEX.get<ChunkRecord[]>(indexKey(appConfig.appId), "json");
  if (!stored?.length) return [];

  const queryEmbedding = await createEmbeddings(env, [query], appConfig.embeddingModel, "query");
  const scored = stored.map((chunk) => ({
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
      chunkIndex: chunk.chunkIndex,
    },
  }));

  return scored.sort((a, b) => b.score - a.score).slice(0, topK ?? appConfig.searchTopK);
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
