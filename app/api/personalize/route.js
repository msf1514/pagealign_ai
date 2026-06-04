import FirecrawlApp from "@mendable/firecrawl-js";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { SLOTS } from "../../lib/slots";
import { injectSlots } from "../../lib/injectSlots";
import { smartInject } from "../../lib/smartInject";
import { convertRelativeUrlsToAbsolute } from "../../lib/urlConverter";
import { trackChanges } from "../../lib/changeTracker";

const firecrawl = new FirecrawlApp({ apiKey: process.env.FIRECRAWL_API_KEY });
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

function extractGeminiJson(result) {
  const candidate = result?.response?.candidates?.[0];
  if (!candidate) {
    throw new Error("Gemini did not return any content candidates.");
  }

  const text = candidate.content?.parts
    ?.filter((part) => part && typeof part === "object" && "text" in part)
    .map((part) => part.text)
    .filter(Boolean)
    .join("")
    .trim();

  if (!text) {
    throw new Error("Gemini returned an empty response.");
  }

  const cleaned = text.replace(/```json|```/g, "").trim();
  try {
    return JSON.parse(cleaned);
  } catch (err) {
    throw new Error(`Unable to parse Gemini JSON response. Received: ${cleaned.slice(0, 512)}`);
  }
}

export async function POST(req) {
  try {
    const { adImageBase64, adImageMimeType, adUrl, adDescription, inspirationUrl, landingUrl } =
      await req.json();

    if ((!adImageBase64 && !adUrl && !inspirationUrl) || !landingUrl) {
      return Response.json(
        { error: "Ad creative or inspiration URL, and landing page URL are required" },
        { status: 400 }
      );
    }

    // Step 1: Resolve ad creative — use upload or fetch from URL
    let finalAdBase64 = adImageBase64;
    let finalAdMimeType = adImageMimeType;

    if (adUrl) {
      try {
        const adRes = await fetch(adUrl);
        if (!adRes.ok) throw new Error("Failed to fetch ad creative from URL");

        const arrayBuffer = await adRes.arrayBuffer();
        finalAdBase64 = Buffer.from(arrayBuffer).toString("base64");
        finalAdMimeType = adRes.headers.get("content-type") || "image/jpeg";
      } catch (adFetchErr) {
        console.error("Ad URL fetch error:", adFetchErr.message);
        return Response.json(
          { error: "Could not fetch ad creative from the provided URL" },
          { status: 500 }
        );
      }
    }

    // Step 2: Run Firecrawl + Gemini in parallel
    let scrapedHtml = "";
    let slotJson = {};

    const generationPrompt = `You are a conversion copywriter and brand strategist.

${adImageBase64 || adUrl ? "You will be given an ad creative (image or PDF) and an optional description of the ad." : "You will be given an inspiration page URL and an optional description of the campaign."}
${inspirationUrl ? `Use the inspiration page to match tone, style, and brand voice: ${inspirationUrl}
` : ""}
Your job is to generate personalized copy for a landing page that matches the creative direction.
- Target audience (who is this ad speaking to?)
- Tone and language style (bold, friendly, professional, urgent?)
- Core offer and value proposition (what is being promised?)
- Call to action intent (what action should the user take?)

Generate a value for each of the following landing page slots.
Return ONLY a valid JSON object with exactly these keys and nothing else.
No explanation, no markdown, no backticks.

${JSON.stringify(
  Object.fromEntries(SLOTS.map((slot) => [slot, "..."])),
  null,
  2
)}

${adDescription ? `Ad Description: ${adDescription}` : ""}`;

    const parts = [{ text: generationPrompt }];
    if (finalAdBase64) {
      parts.push({
        inlineData: {
          mimeType: finalAdMimeType,
          data: finalAdBase64,
        },
      });
    }

    try {
      const [fcResult, geminiResult] = await Promise.all([
        firecrawl.scrapeUrl(landingUrl, {
          formats: ["rawHtml"],
          onlyMainContent: false,
        }),
        genAI
          .getGenerativeModel({ model: "gemini-3.1-flash-lite-preview" })
          .generateContent(
            {
              contents: [{ role: "user", parts }],
              generationConfig: {
                responseMimeType: "application/json",
                maxOutputTokens: 1200,
                temperature: 0.7,
              },
            },
            {
              timeout: 120000,
            }
          ),
      ]);

      if (typeof fcResult?.rawHtml !== "string") {
        throw new Error("Firecrawl failed to scrape the page");
      }

      scrapedHtml = fcResult.rawHtml;
      slotJson = extractGeminiJson(geminiResult);
    } catch (parallelErr) {
      console.error("Parallel step error:", parallelErr);
      return Response.json(
        { error: parallelErr.message || "Failed to scrape or generate content" },
        { status: 500 }
      );
    }

    // Step 3: Fix relative URLs in scraped HTML
    scrapedHtml = convertRelativeUrlsToAbsolute(scrapedHtml, landingUrl);

    // Step 4: Inject Gemini JSON into scraped HTML
    // Use data-slot injection for pre-tagged pages, smart injection for arbitrary pages
    const hasDataSlots = /data-slot=/.test(scrapedHtml);
    const finalHtml = hasDataSlots
      ? injectSlots(scrapedHtml, slotJson)
      : smartInject(scrapedHtml, slotJson);

    // Step 5: Track changes for the UI
    const changes = hasDataSlots ? trackChanges(scrapedHtml, slotJson) : {};

    return Response.json(
      { 
        html: finalHtml,
        changes,
        original: scrapedHtml,
      },
      { status: 200 }
    );

  } catch (err) {
    console.error("PageAlign API error:", err);
    return Response.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
