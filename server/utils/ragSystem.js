import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { Document } from "@langchain/core/documents";
import { Pinecone } from "@pinecone-database/pinecone";
import pLimit from "p-limit";

const GEMINI_API_KEY = process.env.GOOGLE_API_KEY;
const PINECONE_API_KEY = process.env.PINECONE_API_KEY;
const PINECONE_INDEX_NAME = process.env.PINECONE_INDEX_NAME || "rag-index";

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

class RAGSystem {
    constructor() {
        console.log("Initializing RAG system...");
    }

    async init() {
        const model = genAI.getGenerativeModel({
            model: "gemini-embedding-001",
        });

        async function retryWithBackoff(fn, retries = 5) {
            try {
                return await fn();
            } catch (err) {
                if (err.status === 429 && retries > 0) {
                    const delay = 25000;
                    console.log(`Rate limited. Retrying in ${delay / 1000}s...`);
                    await new Promise(res => setTimeout(res, delay));
                    return retryWithBackoff(fn, retries - 1);
                }
                throw err;
            }
        }

        const limit = pLimit(5);

        this.embedDocumentsSafe = async (texts) => {
            const BATCH_SIZE = 10;

            const batches = [];
            for (let i = 0; i < texts.length; i += BATCH_SIZE) {
                batches.push(texts.slice(i, i + BATCH_SIZE));
            }

            const results = [];

            for (const batch of batches) {
                const batchResults = await Promise.all(
                    batch.map(text =>
                        limit(() =>
                            retryWithBackoff(() =>
                                model.embedContent(text)
                            )
                        )
                    )
                );

                results.push(...batchResults);
            }

            return results.map(r => r.embedding.values);
        };

        const test = await this.embedDocumentsSafe(["test"]);
        this.dimension = test[0].length;

        console.log("Embedding dimension:", this.dimension);

        this.textSplitter = new RecursiveCharacterTextSplitter({
            chunkSize: 2000,
            chunkOverlap: 100,
        });

        this.pinecone = new Pinecone({
            apiKey: PINECONE_API_KEY,
        });

        this.index = this.pinecone.index(PINECONE_INDEX_NAME);

        console.log("RAG system initialized successfully");
    }

    async addDocument(docId, text, metadata = {}) {
        try {
            await this.deleteDocument(docId, { silent: true });

            const chunks = await this.textSplitter.splitText(text);

            if (chunks.length === 0) {
                console.log(`No chunks for ${docId}`);
                return 0;
            }

            const documents = chunks.map(
                (chunk, i) =>
                    new Document({
                        pageContent: chunk,
                        metadata: {
                            docId,
                            chunkIndex: i,
                            text: chunk,
                            createdAt: new Date().toISOString(),
                            ...metadata,
                        },
                    })
            );

            const ids = documents.map((_, i) => `${docId}_chunk_${i}`);

            const texts = documents.map(doc => doc.pageContent);
            const vectors = await this.embedDocumentsSafe(texts);

            const upserts = vectors.map((vec, i) => ({
                id: ids[i],
                values: vec,
                metadata: documents[i].metadata
            }));

            const batchSize = 100;
            for (let i = 0; i < upserts.length; i += batchSize) {
                const batch = upserts.slice(i, i + batchSize);
                await this.index.upsert(batch);
            }

            console.log(`Added ${documents.length} chunks for ${docId}`);
            return documents.length;

        } catch (error) {
            console.error(`Error adding document ${docId}:`, error);
            throw error;
        }
    }

    async deleteDocument(docId, options = {}) {
        const { silent = false } = options;

        try {
            const queryResponse = await this.index.query({
                vector: new Array(this.dimension).fill(0),
                topK: 10000,
                includeMetadata: true,
                filter: { docId: { $eq: docId } }
            });

            if (queryResponse.matches?.length > 0) {
                const idsToDelete = queryResponse.matches.map(m => m.id);

                const batchSize = 100;
                for (let i = 0; i < idsToDelete.length; i += batchSize) {
                    await this.index.deleteMany(idsToDelete.slice(i, i + batchSize));
                }

                if (!silent) {
                    console.log(`Deleted ${idsToDelete.length} chunks for ${docId}`);
                }

                return idsToDelete.length;
            }

            return 0;

        } catch (error) {
            console.error(`Delete error:`, error);
            if (!silent) throw error;
            return 0;
        }
    }

    async search(query, nResults = 5, docId = null) {
        try {
            const queryEmbedding = await this.embedDocumentsSafe([query]);

            const results = await this.index.query({
                vector: queryEmbedding[0],
                topK: nResults,
                includeMetadata: true,
                filter: docId ? { docId: { $eq: docId } } : undefined
            });

            return results.matches.map(match => ({
                content: match.metadata?.text || "",
                score: match.score,
                metadata: match.metadata
            }));

        } catch (error) {
            console.error("Search error:", error.message);
            return [];
        }
    }

    async getRelevantContent(query, maxTokens = 120000, docId = null) {
        try {
            let tokenCount = 0;
            const results = [];

            const nResults = 20;

            const primaryResults = await this.search(query, nResults, docId);

            for (const res of primaryResults) {
                const content = res.content || "";
                const estimatedTokens = content.split(/\s+/).length * 1.3;

                if (tokenCount + estimatedTokens <= maxTokens) {
                    results.push(res);
                    tokenCount += estimatedTokens;
                }
            }

            if (tokenCount < maxTokens * 0.8) {
                const globalResults = await this.search(query, nResults, null);

                for (const res of globalResults) {
                    if (docId && res.metadata?.docId === docId) continue;

                    const content = res.content || "";
                    const estimatedTokens = content.split(/\s+/).length * 1.3;

                    if (tokenCount + estimatedTokens <= maxTokens) {
                        results.push(res);
                        tokenCount += estimatedTokens;
                    } else {
                        break;
                    }
                }
            }

            results.sort((a, b) => b.score - a.score);

            return results;

        } catch (error) {
            console.error("getRelevantContent error:", error);
            return [];
        }
    }

    async getIndexStats() {
        try {
            return await this.index.describeIndexStats();
        } catch (error) {
            console.error("Stats error:", error);
            return null;
        }
    }

    async clearIndex() {
        try {
            await this.index.deleteAll();
            console.log("Index cleared");
        } catch (error) {
            console.error("Clear error:", error);
            throw error;
        }
    }
}

export { RAGSystem };