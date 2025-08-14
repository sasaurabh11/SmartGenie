import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { PineconeStore } from "@langchain/pinecone";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { Document } from "@langchain/core/documents";
import { Pinecone } from "@pinecone-database/pinecone";

const GEMINI_API_KEY = process.env.GOOGLE_API_KEY;
const PINECONE_API_KEY = process.env.PINECONE_API_KEY;
const PINECONE_INDEX_NAME = process.env.PINECONE_INDEX_NAME || "rag-index";

class RAGSystem {
    constructor() {
        console.log("Initializing RAG system with Pinecone...");
    }

    async init() {
        this.embeddings = new GoogleGenerativeAIEmbeddings({
            apiKey: GEMINI_API_KEY,
            model: "text-embedding-004",
        });

        this.textSplitter = new RecursiveCharacterTextSplitter({
            chunkSize: 1000,
            chunkOverlap: 200,
        });

        this.pinecone = new Pinecone({
            apiKey: PINECONE_API_KEY,
        });

        this.index = this.pinecone.index(PINECONE_INDEX_NAME);

        this.vectorStore = new PineconeStore(this.embeddings, {
            pineconeIndex: this.index,
            namespace: "default", 
        });

        console.log("RAG system initialized successfully with Pinecone");
    }

    async addDocument(docId, text, metadata = {}) {
        try {
            await this.deleteDocument(docId, { silent: true });

            const chunks = await this.textSplitter.splitText(text);

            if (chunks.length === 0) {
                console.log(`No chunks created for document ${docId}`);
                return 0;
            }

            const documents = chunks.map(
                (chunk, i) =>
                    new Document({
                        pageContent: chunk,
                        metadata: {
                            docId,
                            chunkIndex: i,
                            createdAt: new Date().toISOString(),
                            ...metadata,
                        },
                    })
            );

            // Generate unique IDs for each chunk
            const ids = documents.map((_, i) => `${docId}_chunk_${i}`);

            await this.vectorStore.addDocuments(documents, { ids });

            console.log(`Added ${documents.length} chunks for document ${docId}`);
            return documents.length;
        } catch (error) {
            console.error(`Error adding document ${docId}:`, error);
            throw error;
        }
    }

    async deleteDocument(docId, options = {}) {
        const { silent = false } = options;
        try {
            // Query for all vectors with the docId in metadata
            const queryResponse = await this.index.query({
                vector: new Array(768).fill(0), // Dummy vector for metadata filtering
                topK: 10000, // Large number to get all matches
                includeMetadata: true,
                filter: {
                    docId: { $eq: docId }
                }
            });

            if (queryResponse.matches && queryResponse.matches.length > 0) {
                const idsToDelete = queryResponse.matches.map(match => match.id);
                
                // Delete vectors in batches (Pinecone has limits)
                const batchSize = 100;
                for (let i = 0; i < idsToDelete.length; i += batchSize) {
                    const batch = idsToDelete.slice(i, i + batchSize);
                    await this.index.deleteMany(batch);
                }

                if (!silent) {
                    console.log(`Deleted ${idsToDelete.length} chunks for document ${docId}`);
                }
                return idsToDelete.length;
            } else {
                if (!silent) {
                    console.log(`No chunks found for document ${docId}`);
                }
                return 0;
            }
        } catch (error) {
            console.error(`Error deleting document ${docId}:`, error);
            if (!silent) throw error;
            return 0;
        }
    }

    async search(query, nResults = 5, docId = null) {
        try {
            let filter = undefined;
            if (docId) {
                filter = { docId: { $eq: docId } };
            }

            const results = await this.vectorStore.similaritySearchWithScore(
                query,
                nResults,
                filter
            );

            return results.map(([doc, score]) => ({
                content: doc.pageContent,
                score: score,
                metadata: doc.metadata,
            }));
        } catch (error) {
            console.error(`Search error: ${error.message}`);
            return [];
        }
    }

    async getRelevantContent(query, maxTokens = 120000, docId = null) {
        try {
            const allResults = [];
            let tokenCount = 0;
            const nResults = 20;

            if (docId) {
                const results = await this.search(query, nResults, docId);
                for (const result of results) {
                    const content = result.content;
                    const estimatedTokens = content.split(/\s+/).length * 1.33;
                    if (tokenCount + estimatedTokens <= maxTokens) {
                        allResults.push(result);
                        tokenCount += estimatedTokens;
                    }
                }
                // If we have enough content, return early
                if (tokenCount >= maxTokens * 0.8) {
                    return allResults.sort((a, b) => b.score - a.score);
                }
            }

            // Search globally for additional results if space remains
            if (maxTokens - tokenCount > 10000) {
                const results = await this.search(query, nResults, null);
                for (const result of results) {
                    // Skip if we already have this from docId-specific search
                    if (docId && result.metadata?.docId === docId) continue;
                    
                    const content = result.content;
                    const estimatedTokens = content.split(/\s+/).length * 1.33;
                    if (tokenCount + estimatedTokens <= maxTokens) {
                        allResults.push(result);
                        tokenCount += estimatedTokens;
                    } else {
                        break;
                    }
                }
            }

            // Sort by descending score
            allResults.sort((a, b) => b.score - a.score);
            return allResults;

        } catch (error) {
            console.error(`Error in getRelevantContent: ${error.message}`);
            return [];
        }
    }

    async listDocuments() {
        try {
            // Query all vectors to get document information
            const queryResponse = await this.index.query({
                vector: new Array(768).fill(0), // Dummy vector
                topK: 10000, // Large number to get all documents
                includeMetadata: true,
            });

            const docGroups = {};
            
            if (queryResponse.matches) {
                queryResponse.matches.forEach((match) => {
                    const docId = match.metadata?.docId;
                    if (docId && !docGroups[docId]) {
                        docGroups[docId] = {
                            docId: docId,
                            chunks: 0,
                            createdAt: match.metadata?.createdAt,
                            metadata: { ...match.metadata },
                        };
                        // Clean up metadata
                        delete docGroups[docId].metadata.docId;
                        delete docGroups[docId].metadata.chunkIndex;
                        delete docGroups[docId].metadata.createdAt;
                    }
                    if (docId) {
                        docGroups[docId].chunks++;
                    }
                });
            }

            return Object.values(docGroups);
        } catch (error) {
            console.error(`Error listing documents: ${error.message}`);
            return [];
        }
    }

    // Additional utility method to get index stats
    async getIndexStats() {
        try {
            const stats = await this.index.describeIndexStats();
            return stats;
        } catch (error) {
            console.error(`Error getting index stats: ${error.message}`);
            return null;
        }
    }

    // Method to clear all data 
    async clearIndex() {
        try {
            await this.index.deleteAll();
            console.log("Index cleared successfully");
        } catch (error) {
            console.error("Error clearing index:", error);
            throw error;
        }
    }
}

export { RAGSystem };