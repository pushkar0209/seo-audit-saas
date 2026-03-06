import { config } from "dotenv";
config({ path: ".env.local" });

// @ts-nocheck
import { Pinecone } from "@pinecone-database/pinecone";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { Document } from "@langchain/core/documents";
import { PineconeStore } from "@langchain/pinecone";

// Some extremely basic SEO principles to ground the AI
const SEO_DOCS = [
    "Document 1: Meta Descriptions must be between 120 and 156 characters. Over 156 characters is truncated by Google. Under 120 means you are missing real estate.",
    "Document 2: H1 tags must exist exactly once per page. Having zero H1 tags harms accessibility and SEO. Having multiple H1 tags dilutes your primary topical relevance.",
    "Document 3: Keywords in the URL path provide a slight ranking factor. Hyphens should be used to separate words instead of underscores.",
    "Document 4: Image Alt Text is crucial for accessibility and image search rankings. Missing alt text will negatively affect your overall accessibility score.",
    "Document 5: A good word count for an average blog post is generally around 1500 to 2000 words. For e-commerce product pages, aim for at least 300 words of unique descriptive content."
];

async function main() {
    console.log("Seeding Pinecone with SEO Best Practices...");

    const pinecone = new Pinecone({
        apiKey: process.env.PINECONE_API_KEY as string,
    });

    const pineconeIndex = pinecone.Index(process.env.PINECONE_INDEX || "seo-audit");

    const embeddings = new GoogleGenerativeAIEmbeddings({
        model: "gemini-embedding-001",
        apiKey: process.env.GEMINI_API_KEY,
    });

    const docs = SEO_DOCS.map((text) => new Document({ pageContent: text }));

    try {
        console.log("Generating embeddings manually...");
        const vectors = await embeddings.embedDocuments(SEO_DOCS);

        console.log(`Generated ${vectors.length} embeddings.`);

        const records = SEO_DOCS.map((docText, i) => ({
            id: `seo-doc-${i}`,
            values: vectors[i],
            metadata: { text: docText }
        }));

        console.log("Upserting to Pinecone. Records length:", records.length);
        if (records.length > 0) {
            console.log("First record ID:", records[0].id, "Dims:", records[0].values.length);
        }
        await pineconeIndex.upsert({ records });

        console.log("Documents successfully loaded into Pinecone!");
    } catch (err) {
        console.error("Failed to seed Pinecone:", err);
    }
}

main().then(() => console.log('Done')).catch(console.error);
