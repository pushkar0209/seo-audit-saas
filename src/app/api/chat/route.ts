/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
import { NextRequest, NextResponse } from "next/server";
import { ChatGoogleGenerativeAI, GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { PineconeStore } from "@langchain/pinecone";
import {
    ChatPromptTemplate,
    MessagesPlaceholder,
} from "@langchain/core/prompts";
import { pinecone } from "@/lib/pinecone";
import { auth } from "@clerk/nextjs/server";

export async function POST(req: NextRequest) {
    try {
        const { userId } = auth();
        if (!userId) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const body = await req.json();
        const { messages } = body;
        const currentMessageContent = messages[messages.length - 1].content;

        const pineconeIndex = pinecone.Index(process.env.PINECONE_INDEX || "seo-audit");

        // Initialize OpenAI Embeddings and Vector Store
        const embeddings = new GoogleGenerativeAIEmbeddings({
            model: "gemini-embedding-001",
            apiKey: process.env.GEMINI_API_KEY,
        });

        const vectorStore = await PineconeStore.fromExistingIndex(embeddings, {
            pineconeIndex,
        });

        const retriever = vectorStore.asRetriever({ k: 4 });

        // Initialize Language Model
        const llm = new ChatGoogleGenerativeAI({
            model: "gemini-2.5-flash",
            temperature: 0,
            apiKey: process.env.GEMINI_API_KEY,
        });

        // Create the QA Prompt
        const SYSTEM_TEMPLATE = `You are an expert SEO assistant grounded in real SEO documentation.
Use the following pieces of retrieved context to answer the user's question about their website or SEO best practices.
If you don't know the answer based on the context, just say that you don't know. Don't invent SEO rules.
Always give actionable, concrete advice tailored for an e-commerce context.

<context>
{context}
</context>`;

        const prompt = ChatPromptTemplate.fromMessages([
            ["system", SYSTEM_TEMPLATE],
            new MessagesPlaceholder("chat_history"),
            ["human", "{input}"],
        ]);

        const docs = await retriever.invoke(currentMessageContent);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const contextStr = docs.map((d: any) => d.pageContent).join("\n\n");

        const chain = prompt.pipe(llm);
        const result = await chain.invoke({
            context: contextStr,
            input: currentMessageContent,
            chat_history: messages.slice(0, -1).map((m: { role: string, content: string }) =>
                m.role === "user" ? ["human", m.content] : ["ai", m.content]
            ),
        });

        return NextResponse.json({ text: result.content });
    } catch (error) {
        console.error("[CHAT_ERROR]", error);
        return new NextResponse("Internal server error", { status: 500 });
    }
}
