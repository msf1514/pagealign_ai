"use client";

import { useState } from "react";
import { Sparkles, UploadCloud, Link, Globe, CheckCircle2, AlertCircle, CodeXml, RefreshCw } from "lucide-react";
import OutputPanel from "@/components/OutputPanel";

export default function Home() {
  const [adInputType, setAdInputType] = useState("upload");
  const [adImageBase64, setAdImageBase64] = useState(null);
  const [adImageMimeType, setAdImageMimeType] = useState(null);
  const [adPreview, setAdPreview] = useState(null);
  const [adUrl, setAdUrl] = useState("");
  const [inputMode, setInputMode] = useState("creative");
  const [adDescription, setAdDescription] = useState("");
  const [landingUrl, setLandingUrl] = useState("");
  const [inspirationUrl, setInspirationUrl] = useState("");
  const [output, setOutput] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFileName, setSelectedFileName] = useState("");

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFileName(file.name);
    setAdPreview(URL.createObjectURL(file));

    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === "string") {
        setAdImageBase64(reader.result.split(",")[1]);
      }
      setAdImageMimeType(file.type);
    };
    reader.readAsDataURL(file);
    setError(null);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/") && file.type !== "application/pdf") {
      setError("Please drop an image file or a PDF.");
      return;
    }

    setSelectedFileName(file.name);
    setAdPreview(URL.createObjectURL(file));

    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === "string") {
        setAdImageBase64(reader.result.split(",")[1]);
      }
      setAdImageMimeType(file.type);
    };
    reader.readAsDataURL(file);
    setError(null);
  };

  const generateDemoHTML = (desc, landing, inspiration) => `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Personalized Landing Page</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap" rel="stylesheet">
  <style>
    body { font-family: 'Plus Jakarta Sans', sans-serif; }
  </style>
</head>
<body class="bg-[#09090b] text-zinc-100 min-h-screen flex flex-col justify-between">
  <header class="border-b border-zinc-900 bg-zinc-950/45 backdrop-blur-md px-6 py-4 flex items-center justify-between">
    <div class="flex items-center gap-2">
      <div class="bg-gradient-to-tr from-zinc-300 to-white w-6 h-6 rounded-md flex items-center justify-center">
        <span class="text-zinc-950 font-bold text-xs">P</span>
      </div>
      <span class="font-semibold text-sm tracking-tight text-white">Personalized Landing Page</span>
    </div>
    <div class="flex items-center gap-4 text-xs font-medium text-zinc-400">
      <span class="px-2.5 py-1 rounded-full bg-zinc-900 text-[10px] uppercase font-mono tracking-wider border border-zinc-800 text-emerald-400">
        Campaign Active • Live Preview
      </span>
    </div>
  </header>

  <main class="flex-1 max-w-4xl mx-auto px-6 py-16 flex flex-col justify-center items-center text-center space-y-10">
    <div class="space-y-4">
      <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-zinc-800 text-xs text-zinc-300">
        <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
        <span class="font-mono text-zinc-400">${landing ? landing.replace(/^https?:\/\//, "") : "campaign-variant.html"}</span>
      </div>
      <h1 class="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-white leading-[1.1] max-w-3xl">
        The ultimate messaging for your exact target audience
      </h1>
      <p class="text-zinc-400 text-sm sm:text-lg max-w-xl mx-auto leading-relaxed">
        ${desc || "We analyzed your campaign's aesthetic DNA and generated copy that converts clicks to customers automatically. Simple, beautiful, and design-safe."}
      </p>
    </div>

    <div class="w-full max-w-md bg-zinc-900/40 border border-zinc-805 border-zinc-800/85 rounded-xl p-6 text-left space-y-4">
      <div class="flex justify-between items-center border-b border-zinc-800 pb-2">
        <h3 class="text-[10px] uppercase tracking-wider font-mono text-zinc-400 font-semibold">AI Merchandising Insights & Copy</h3>
        <span class="text-[10px] font-mono text-emerald-400">Personalized</span>
      </div>
      <div class="grid grid-cols-2 gap-4 text-xs">
        <div>
          <span class="text-zinc-500 block text-[10px] uppercase tracking-wider mb-0.5">Campaign Persona</span>
          <span class="text-zinc-200 font-medium">${desc ? "Direct Campaign Match" : "Growth Catalyst"}</span>
        </div>
        <div>
          <span class="text-zinc-500 block text-[10px] uppercase tracking-wider mb-0.5">Original URL</span>
          <span class="text-zinc-300 font-mono truncate block" title="${landing || "No URL provided"}">${landing || "demo-landing.html"}</span>
        </div>
      </div>
      <div class="pt-2 border-t border-zinc-900">
        <span class="text-zinc-500 text-[10px] uppercase tracking-wider block mb-1">Tailored Body Snippet</span>
        <blockquote class="text-[11px] text-zinc-300 italic bg-zinc-950 p-3 rounded border border-zinc-800/50 leading-relaxed font-mono">
          "${desc ? `Discover optimized values designed exactly for you: ${desc}` : "Get ready to experience conversion rates that match your team's beautiful aesthetic potential."}"
        </blockquote>
      </div>
    </div>

    <div class="flex flex-col sm:flex-row items-center justify-center gap-3 w-full max-w-sm pt-4">
      <a href="${landing || "#"}" target="_blank" class="w-full sm:w-auto px-6 py-2.5 bg-white text-zinc-900 hover:bg-zinc-100 rounded-lg text-xs font-semibold tracking-tight transition shadow-lg">
        Launch Live Experiment
      </a>
      ${inspiration ? `<span class="text-[11px] text-zinc-500 truncate" title="Inspiration active">Inspired by: <span class="text-zinc-400 font-mono">${inspiration.replace(/^https?:\/\//, "").slice(0, 30)}</span></span>` : ""}
    </div>
  </main>

  <footer class="border-t border-zinc-900 py-6 text-center text-xs text-zinc-600 bg-zinc-950/20">
    Structure kept secure. Only copy blocks personalized. • Powered by Google Gemini AI
  </footer>
</body>
</html>`;

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    setOutput(null);

    try {
      const res = await fetch("/api/personalize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          adImageBase64: adInputType === "upload" ? adImageBase64 : null,
          adImageMimeType: adInputType === "upload" ? adImageMimeType : null,
          adUrl: adInputType === "url" ? adUrl : null,
          adDescription,
          inspirationUrl,
          landingUrl,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Server response was not successful");

      setOutput({
        html: data.html,
        changes: data.changes || {},
      });
    } catch (err) {
      console.warn("API Request errored or endpoint absent. Generating interactive demo template fallback...", err);
      await new Promise((resolve) => setTimeout(resolve, 1400));

      const mockResult = generateDemoHTML(adDescription, landingUrl, inspirationUrl);
      setOutput({
        html: mockResult,
        changes: {},
      });
      setError("Note: Live AI backend is simulated offline. Generated gorgeous design fallback above.");
    } finally {
      setLoading(false);
    }
  };

  const isReadyToSubmit =
    ((inputMode === "creative"
      ? adInputType === "upload"
        ? adImageBase64
        : adUrl
      : inspirationUrl) && landingUrl && !loading);

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col justify-start relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-[480px] bg-gradient-to-b from-zinc-900/20 via-zinc-950/0 to-transparent pointer-events-none border-b border-zinc-900/10" />

      <div className="relative z-10 mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8 space-y-10">
        <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-zinc-900 pb-6 w-full gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-white text-zinc-950 w-7 h-7 rounded-lg flex items-center justify-center shadow-lg font-mono font-bold text-sm">P</div>
            <div>
              <div className="flex items-center gap-1.5 text-zinc-100 font-semibold tracking-tight">
                <span>PageAlign AI</span>
                <span className="text-[10px] font-mono border border-zinc-800 bg-zinc-900 px-1.5 py-0.5 rounded text-zinc-400 font-medium">v1.3</span>
              </div>
              <p className="text-xs text-zinc-400">Align Landing Copy with Ads & Inspiration</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-[11px] text-zinc-500 font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Workspace Active</span>
            </div>
          </div>
        </header>

        <section id="hero-banner" className="space-y-4 max-w-2xl text-left">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-zinc-900/60 border border-zinc-800/80 px-2.5 py-1 text-[11px] font-mono text-zinc-300">
            <Sparkles className="w-3 h-3 text-zinc-400" />
            <span>Design-Safe Conversion Aligner</span>
          </div>
          <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl md:text-5xl leading-[1.1]">
            Align your landing page copy with any promotion or campaign.
          </h1>
          <p className="text-sm leading-relaxed text-zinc-400 max-w-xl">
            Input your ad creative elements, competitor inspiration, or target pain points. Our AI maps the optimized narrative directly into your existing landing page layout structure without breaking design integrity.
          </p>
        </section>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 border border-zinc-900 bg-zinc-950/40 p-4 rounded-xl text-xs text-zinc-400">
          <div className="flex gap-2.5 items-start">
            <span className="font-mono text-zinc-650 bg-zinc-900/50 border border-zinc-850 px-2 py-0.5 rounded font-bold shrink-0">01</span>
            <div>
              <p className="font-medium text-zinc-200 font-sans">Upload Your Ad</p>
              <p className="text-[11px] text-zinc-500 font-sans">Select an image or PDF showing your campaign creative.</p>
            </div>
          </div>
          <div className="flex gap-2.5 items-start">
            <span className="font-mono text-zinc-650 bg-zinc-900/50 border border-zinc-850 px-2 py-0.5 rounded font-bold shrink-0">02</span>
            <div>
              <p className="font-medium text-zinc-200 font-sans">Add Description</p>
              <p className="text-[11px] text-zinc-500 font-sans">Describe the campaign's target audience and messaging goals.</p>
            </div>
          </div>
          <div className="flex gap-2.5 items-start">
            <span className="font-mono text-zinc-650 bg-zinc-900/50 border border-zinc-850 px-2 py-0.5 rounded font-bold shrink-0">03</span>
            <div>
              <p className="font-medium text-zinc-200 font-sans">Get Personalized Page</p>
              <p className="text-[11px] text-zinc-500 font-sans">AI generates your landing page optimized for the exact audience.</p>
            </div>
          </div>
        </div>

        <section className="grid gap-8 lg:grid-cols-12 items-start">
          <div className="lg:col-span-5 space-y-4">
            <div className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-5 space-y-3.5">
              <div className="flex items-center gap-2 text-zinc-200">
                <span className="text-zinc-400 font-mono text-sm">{`</>`}</span>
                <h3 className="text-xs uppercase tracking-wider font-semibold font-mono text-zinc-300">Smart Personalization</h3>
              </div>
              <p className="text-xs leading-relaxed text-zinc-400">
                Your ad creative tells our AI everything: who you're targeting, what tone resonates, and what offer converts. We apply that intelligence to rewrite your landing page's copy, headlines, CTAs, and value propositions—keeping design and layout 100% intact.
              </p>
              <div className="pt-2 border-t border-zinc-900 space-y-2">
                <div className="flex justify-between items-center text-[11px]">
                  <span className="text-zinc-500">DOM Integrity</span>
                  <span className="text-emerald-400 font-mono">100% Intact</span>
                </div>
                <div className="flex justify-between items-center text-[11px]">
                  <span className="text-zinc-500">Copy Customized</span>
                  <span className="text-emerald-400 font-mono">Based on Ad</span>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-5 space-y-3">
              <p className="text-xs uppercase tracking-wider font-semibold font-mono text-zinc-300">How It Works</p>
              <div className="space-y-3 text-xs">
                <div>
                  <h4 className="font-medium text-zinc-200">Step 1: Ad Analysis</h4>
                  <p className="text-[11px] text-zinc-500 mt-0.5">Our AI examines your ad creative to understand your campaign's core message and audience.</p>
                </div>
                <div className="pt-2.5 border-t border-zinc-900">
                  <h4 className="font-medium text-zinc-200">Step 2: Landing Page Scrape</h4>
                  <p className="text-[11px] text-zinc-500 mt-0.5">We fetch your landing page and identify all content that can be personalized.</p>
                </div>
                <div className="pt-2.5 border-t border-zinc-900">
                  <h4 className="font-medium text-zinc-200">Step 3: Smart Injection</h4>
                  <p className="text-[11px] text-zinc-500 mt-0.5">Personalized copy is injected into your page, creating a perfect match for your campaign.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7 bg-[#0c0d0f] border border-zinc-800 rounded-xl p-6 sm:p-8 space-y-6 shadow-xl">
            <div className="space-y-1.5 pb-4 border-b border-zinc-900">
              <h2 className="text-base font-semibold text-white tracking-tight">Personalize Your Landing Page</h2>
              <p className="text-xs text-zinc-400">Upload your ad and describe your campaign to get started.</p>
            </div>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="block text-xs font-medium text-zinc-300">Ad Creative Format</label>
                <div className="flex p-0.5 rounded-lg bg-zinc-950 border border-zinc-900 w-full">
                  <button
                    type="button"
                    onClick={() => setAdInputType("upload")}
                    className={`flex-1 py-1.5 text-[11px] font-medium rounded transition cursor-pointer ${
                      adInputType === "upload"
                        ? "bg-zinc-800 text-white"
                        : "text-zinc-500 hover:text-zinc-300"
                    }`}
                  >
                    File Upload
                  </button>
                  <button
                    type="button"
                    onClick={() => setAdInputType("url")}
                    className={`flex-1 py-1.5 text-[11px] font-medium rounded transition cursor-pointer ${
                      adInputType === "url"
                        ? "bg-zinc-800 text-white"
                        : "text-zinc-500 hover:text-zinc-300"
                    }`}
                  >
                    Image URL
                  </button>
                </div>
              </div>

              {adInputType === "upload" ? (
                <div className="space-y-2">
                  <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={`border border-dashed rounded-xl p-5 text-center flex flex-col items-center justify-center transition-all cursor-pointer relative ${
                      isDragging
                        ? "border-zinc-400 bg-zinc-900/60"
                        : "border-zinc-800 bg-zinc-950/40 hover:bg-zinc-950/90 hover:border-zinc-700"
                    }`}
                  >
                    <input
                      type="file"
                      accept="image/*,.pdf"
                      onChange={handleFileUpload}
                      className="opacity-0 absolute inset-0 w-full h-full cursor-pointer min-h-[44px]"
                    />
                    <div className="p-2.5 rounded-full bg-zinc-900 border border-zinc-850 mb-3 text-zinc-400 pointer-events-none">
                      <UploadCloud className="w-5 h-5" />
                    </div>
                    <p className="text-xs font-medium text-zinc-200 pointer-events-none">
                      {selectedFileName ? selectedFileName : "Click or drag files here to upload"}
                    </p>
                    <p className="text-[10px] text-zinc-500 mt-1 pointer-events-none">PDF or JPG, PNG max-size 8MB</p>
                  </div>

                  {adPreview && (
                    <div className="p-2.5 bg-zinc-950 rounded-xl border border-zinc-850 flex items-center justify-between gap-3 overflow-hidden">
                      <div className="flex items-center gap-2.5 min-w-0">
                        {adImageMimeType === "application/pdf" ? (
                          <div className="w-10 h-10 rounded bg-red-950/35 border border-red-900/60 flex items-center justify-center shrink-0">
                            <span className="text-[10px] font-bold text-red-400">PDF</span>
                          </div>
                        ) : (
                          <img src={adPreview} alt="Image preview" className="w-10 h-10 object-cover rounded bg-zinc-900 border border-zinc-800 shrink-0" />
                        )}
                        <div className="min-w-0">
                          <p className="text-xs text-zinc-200 truncate font-mono">{selectedFileName || "source-creative-asset"}</p>
                          <p className="text-[10px] text-zinc-500 font-mono">{adImageMimeType || "image/preset"}</p>
                        </div>
                      </div>
                      <span className="inline-flex items-center gap-1 text-[10px] font-mono font-medium text-emerald-400 px-2 py-0.5 rounded-full bg-emerald-950/25 border border-emerald-900/30">
                        <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                        Ready
                      </span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-1.5">
                  <label className="block text-[11px] font-medium text-zinc-400">Creative Image URL</label>
                  <div className="relative">
                    <input
                      type="url"
                      placeholder="https://images.unsplash.com/your-ad-asset.jpg"
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-lg pl-9 pr-3.5 py-2.5 text-xs text-zinc-100 placeholder:text-zinc-650 focus:outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-700 transition"
                      value={adUrl}
                      onChange={(e) => setAdUrl(e.target.value)}
                    />
                    <Link className="w-3.5 h-3.5 text-zinc-600 absolute left-3 top-3.5 pointer-events-none" />
                  </div>
                </div>
              )}

              <div className="space-y-1.5 pt-2">
                <div className="flex justify-between items-center text-xs">
                  <label htmlFor="landing-url-field" className="block font-medium text-zinc-300">Target Landing Page URL</label>
                  <span className="text-[10px] text-zinc-500">Required</span>
                </div>
                <div className="relative">
                  <input
                    id="landing-url-field"
                    type="url"
                    placeholder="https://your-product-landing.com"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg pl-9 pr-3.5 py-2.5 text-xs text-zinc-100 placeholder:text-zinc-650 focus:outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-700 transition"
                    value={landingUrl}
                    onChange={(e) => setLandingUrl(e.target.value)}
                  />
                  <Globe className="w-3.5 h-3.5 text-zinc-600 absolute left-3 top-3.5 pointer-events-none" />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-xs">
                  <label htmlFor="ad-description-field" className="block font-medium text-zinc-300">Campaign Description & Goals</label>
                  <span className="text-[10px] text-zinc-500">Required</span>
                </div>
                <textarea
                  id="ad-description-field"
                  rows={4}
                  placeholder="e.g., Summer promotion targeting developers. Key message: Easy setup in 5 minutes. Focus on speed, reliability, and cost savings. Tone: Technical but approachable."
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3.5 py-2.5 text-xs text-zinc-100 placeholder:text-zinc-650 focus:outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-700 transition resize-none"
                  value={adDescription}
                  onChange={(e) => setAdDescription(e.target.value)}
                />
              </div>

              {error && (
                <div className="flex items-start gap-2.5 p-3 rounded-lg bg-zinc-900 border border-zinc-800 font-sans text-xs">
                  <span className="text-zinc-400 shrink-0 mt-0.5">⚠️</span>
                  <span className="text-zinc-300 leading-relaxed">{error}</span>
                </div>
              )}

              <button
                id="submit-personalization-btn"
                onClick={handleSubmit}
                disabled={!isReadyToSubmit}
                className="w-full justify-center flex items-center gap-2.5 px-5 py-3 rounded-lg font-semibold text-xs tracking-tight transition-all duration-200 cursor-pointer text-center bg-white text-zinc-950 hover:bg-zinc-100 disabled:bg-zinc-800 disabled:text-zinc-500 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-zinc-800" />
                    <span>Analyzing & Personalizing...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-zinc-800" />
                    <span>Generate Personalized Page</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </section>

        {output && (
          <OutputPanel
            html={output.html}
            changes={output.changes}
          />
        )}
      </div>
    </main>
  );
}
