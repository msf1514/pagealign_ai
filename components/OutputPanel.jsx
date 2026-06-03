"use client";

import { useState } from "react";
import { Copy, Check, Download, Layers, ShieldCheck, Eye } from "lucide-react";

export default function OutputPanel({ html }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(html);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([html], { type: "text/html" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "personalized-landing-page.html";
    link.click();
  };

  return (
    <div id="output-preview-section" className="w-full mt-12 bg-zinc-900/40 border border-zinc-800 rounded-2xl overflow-hidden shadow-xl">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 px-6 py-5 border-b border-zinc-800 bg-zinc-950/60 backdrop-blur-md">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-xs font-mono tracking-wider text-emerald-400 uppercase font-semibold">Live Output Generated</span>
          </div>
          <h2 className="text-xl font-semibold text-white tracking-tight">Personalized Design Preview</h2>
          <p className="text-xs text-zinc-400">Review the modified landing copy inside the preserved structural container.</p>
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <button
            id="copy-html-btn"
            onClick={handleCopy}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2 text-xs font-medium rounded-lg border border-zinc-800 bg-zinc-950 text-zinc-300 hover:text-white hover:bg-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-700 active:scale-[0.98] transition-all cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400 font-medium">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy HTML</span>
              </>
            )}
          </button>
          <button
            id="download-html-btn"
            onClick={handleDownload}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2 text-xs font-medium rounded-lg bg-white text-zinc-950 hover:bg-zinc-100 focus:outline-none focus:ring-1 focus:ring-zinc-300 active:scale-[0.98] transition-all cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download HTML</span>
          </button>
        </div>
      </div>

      <div className="p-4 bg-zinc-950/20">
        <div className="border border-zinc-800 rounded-xl overflow-hidden shadow-2xl bg-zinc-900/30">
          <div className="flex items-center gap-4 px-4 py-3 bg-zinc-950/80 border-b border-zinc-900 select-none">
            <div className="flex gap-1.5 shrink-0">
              <span className="w-2.5 h-2.5 rounded-full bg-zinc-800"></span>
              <span className="w-2.5 h-2.5 rounded-full bg-zinc-800"></span>
              <span className="w-2.5 h-2.5 rounded-full bg-zinc-800"></span>
            </div>
            <div className="flex-1 flex justify-center max-w-sm sm:max-w-md mx-auto">
              <div className="w-full text-center py-1 px-3 bg-zinc-900 border border-zinc-800 rounded-md text-[11px] font-mono text-zinc-500 truncate flex items-center justify-center gap-1.5">
                <span className="text-zinc-600 font-sans">https://</span>
                <span>preview.local/personalized-output.html</span>
              </div>
            </div>
            <div className="w-12 shrink-0 flex justify-end text-zinc-600">
              <Eye className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="w-full bg-white relative">
            <iframe
              id="personalized-output-iframe"
              srcDoc={html}
              title="Personalized Landing Page Output Preview"
              className="w-full min-h-[580px] md:min-h-[640px] border-0 bg-white"
              sandbox="allow-scripts"
            />
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 sm:gap-6 justify-between items-start sm:items-center px-6 py-4 border-t border-zinc-800 bg-zinc-950/40 text-xs text-zinc-500">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-zinc-600" />
            DOM Layout Maintained
          </span>
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-zinc-600" />
            Safe Scripting Active
          </span>
        </div>
        <div>Code conforms to target landing architecture</div>
      </div>
    </div>
  );
}
