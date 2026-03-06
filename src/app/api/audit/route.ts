import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import * as cheerio from "cheerio";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
    try {
        const { userId } = auth();
        if (!userId) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const body = await req.json();
        const { url, tenantId } = body;

        if (!url || !tenantId) {
            return new NextResponse("Missing URL or TenantId", { status: 400 });
        }

        // --- Scraping with Cheerio ---
        const pageResponse = await fetch(url, { headers: { "User-Agent": "SEO-Bot (https://seo-audit.com)" } });
        const html = await pageResponse.text();

        const $ = cheerio.load(html);
        const title = $("title").text();
        const description = $("meta[name='description']").attr("content") || "";

        // Grab all headings
        const h1Count = $("h1").length;
        const h2s = $("h2").map((_, el) => $(el).text().trim()).get();

        // Evaluate word count in readable textual elements
        const bodyText = $("body").text().replace(/\s+/g, " ").trim();
        const wordCount = bodyText.split(" ").length;

        // Grab all anchor tags without hrefs or empty contents
        const emptyLinks = $("a").filter((_, el) => !$(el).attr("href") || $(el).text().trim() === "").length;

        const scrapedData = {
            title,
            description,
            h1Count,
            h2Count: h2s.length,
            sampleH2s: h2s.slice(0, 5),
            wordCount,
            emptyLinks
        };

        // --- AI Audit Generation ---
        const llm = new ChatGoogleGenerativeAI({
            model: "gemini-2.5-flash",
            temperature: 0.1,
            apiKey: process.env.GEMINI_API_KEY,
        });

        const prompt = `You are an expert technical SEO analyst. I have scraped the following metadata from a webpage at ${url}.
    
    Data:
    ${JSON.stringify(scrapedData, null, 2)}
    
    Analyze this data. Reply ONLY with a valid JSON document (no markdown formatting blocks, no backticks) with this exact schema:
    {
      "score": <integer from 0-100>,
      "issues": ["Issue 1 description", "Issue 2..."],
      "recommendations": ["Recommendation 1", "Recommendation 2..."]
    }`;

        // Note: To force standard JSON easily with older chain APIs, we can invoke LLM directly:
        const response = await llm.invoke(prompt);
        let parsedContent;
        try {
            parsedContent = JSON.parse(response.content as string);
        } catch {
            // Fallback cleaner if LLM sneaks in markdown
            const cleanedMessage = (response.content as string).replace(/```json/g, '').replace(/```/g, '').trim();
            parsedContent = JSON.parse(cleanedMessage);
        }

        // --- Store in Database ---
        const audit = await prisma.audit.create({
            data: {
                url,
                score: parsedContent.score,
                issues: parsedContent.issues,
                recommendations: parsedContent.recommendations,
                tenantId
            }
        });

        return NextResponse.json(audit);
    } catch (error) {
        console.error("[AUDIT_ERROR]", error);
        return new NextResponse("Internal server error", { status: 500 });
    }
}

