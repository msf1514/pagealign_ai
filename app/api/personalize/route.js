import FirecrawlApp from "@mendable/firecrawl-js";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { SLOTS } from "../../lib/slots";
import { injectSlots } from "../../lib/injectSlots";

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

function buildUniversalPrompt({ adImageBase64, adUrl, adDescription, inspirationUrl, elements }) {
  return `You are a conversion copywriter and landing page optimization expert.

${adImageBase64 || adUrl ? "You will be given an ad creative (image or PDF) and an optional description of the ad." : "You will be given an inspiration page URL and an optional description of the desired landing page."}
${inspirationUrl ? `Use the inspiration page to match tone, style, and brand voice: ${inspirationUrl}\n` : ""}
You will also be given a list of text elements extracted from a landing page, each identified by a unique ID.

Your job is to personalize the landing page copy to align with the ad creative's messaging, audience, and tone.

Analyze the ad creative to determine:
- Target audience (who is this ad speaking to?)
- Tone and language style (bold, friendly, professional, urgent?)
- Core offer and value proposition (what is being promised?)
- Call to action intent (what action should the user take?)

Then rewrite the relevant text elements to match.

Rules:
- ONLY replace elements that are personalizable content: headlines, subheadlines, hero text, descriptions, calls-to-action, benefit statements, feature descriptions, testimonials, pricing text, FAQ content, section headings.
- Do NOT replace: navigation menu labels, footer text, copyright notices, form field labels, technical text, brand names/logos, legal disclaimers, dates, image alt text, metadata.
- Keep replacement text SIMILAR in length to the original — do not make short text dramatically longer or vice versa.
- Match the ad creative's target audience, tone, and value proposition.
- Maintain the page's existing voice and intent where possible — personalize, don't rewrite from scratch.

Return ONLY a valid JSON object mapping element IDs to their new text values.
Only include elements you want to change — omit elements that should stay the same.
No explanation, no markdown, no backticks.

${adDescription ? `Ad Description: ${adDescription}\n` : ""}
Page elements:
${JSON.stringify(elements, null, 2)}`;
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

    // Step 2: Run Firecrawl + Gemini (slot-based) in parallel — identical to original flow
    let scrapedHtml = "";
    let slotJson = {};

    const generationPrompt = `You are a conversion copywriter and brand strategist.

${adImageBase64 || adUrl ? "You will be given an ad creative (image or PDF) and an optional description of the ad." : "You will be given an inspiration page URL and an optional description of the desired landing page."}
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

    const geminiInputs = [generationPrompt];
    if (finalAdBase64) {
      geminiInputs.push({
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
              contents: geminiInputs,
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

      if (!fcResult?.success || typeof fcResult.rawHtml !== "string") {
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

    // Step 3: Check if the page has data-slot attributes
    const hasDataSlots = /data-slot=/.test(scrapedHtml);

    if (hasDataSlots) {
      // ─── Slot-based flow (pre-tagged pages) — use the already-generated slot JSON ───
      const finalHtml = injectSlots(scrapedHtml, slotJson);
      return Response.json({ html: finalHtml }, { status: 200 });
    }

    // ─── Universal flow (arbitrary pages without data-slot) ───
    // Dynamically import cheerio-based modules to avoid bundling issues
    const { analyzePage } = await import("../../lib/analyzePage");
    const { injectDynamic } = await import("../../lib/injectDynamic");

    const { taggedHtml, elements } = analyzePage(scrapedHtml);

    if (elements.length === 0) {
      return Response.json({ html: scrapedHtml }, { status: 200 });
    }

    const universalPrompt = buildUniversalPrompt({
      adImageBase64: finalAdBase64,
      adUrl,
      adDescription,
      inspirationUrl,
      elements,
    });

    const universalGeminiInputs = [universalPrompt];
    if (finalAdBase64) {
      universalGeminiInputs.push({
        inlineData: { mimeType: finalAdMimeType, data: finalAdBase64 },
      });
    }

    try {
      const universalResult = await genAI
        .getGenerativeModel({ model: "gemini-3.1-flash-lite-preview" })
        .generateContent(
          {
            contents: universalGeminiInputs,
            generationConfig: {
              responseMimeType: "application/json",
              maxOutputTokens: 4096,
              temperature: 0.7,
            },
          },
          { timeout: 120000 }
        );
      const replacements = extractGeminiJson(universalResult);
      const finalHtml = injectDynamic(taggedHtml, replacements);
      return Response.json({ html: finalHtml }, { status: 200 });
    } catch (geminiErr) {
      console.error("Gemini universal error:", geminiErr);
      return Response.json(
        { error: geminiErr.message || "Failed to generate personalized content" },
        { status: 500 }
      );
    }
  } catch (err) {
    console.error("Troopod API error:", err);
    return Response.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
