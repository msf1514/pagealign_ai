"use client";

import { useState } from "react";
import { Copy, Check, Download, Eye, Code2 } from "lucide-react";

export default function OutputPanel({ html, changes = {} }) {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState("preview"); // "preview" | "code"

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

  const changeCount = Object.keys(changes).length;

  return (
    <div id="output-preview-section" className="w-full mt-12 bg-zinc-900/40 border border-zinc-800 rounded-2xl overflow-hidden shadow-xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 px-6 py-5 border-b border-zinc-800 bg-zinc-950/60 backdrop-blur-md">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-xs font-mono tracking-wider text-emerald-400 uppercase font-semibold">Personalized Preview</span>
          </div>
          <h2 className="text-xl font-semibold text-white tracking-tight">
            Your Personalized Landing Page
          </h2>
          <p className="text-xs text-zinc-400">
            {changeCount > 0
              ? `${changeCount} content elements personalized based on your ad`
              : "Preview your personalized page"}
          </p>
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto flex-wrap">
          <button
            onClick={handleCopy}
            className="flex items-center justify-center gap-2 px-4 py-2 text-xs font-medium rounded-lg border border-zinc-800 bg-zinc-950 text-zinc-300 hover:text-white hover:bg-zinc-900 transition"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                Copy HTML
              </>
            )}
          </button>

          <button
            onClick={handleDownload}
            className="flex items-center justify-center gap-2 px-4 py-2 text-xs font-medium rounded-lg bg-white text-zinc-950 hover:bg-zinc-100 transition"
          >
            <Download className="w-3.5 h-3.5" />
            Download
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-0 px-4 py-3 border-b border-zinc-800 bg-zinc-950/40">
        {[
          { id: "preview", label: "Live Preview", icon: Eye },
          { id: "code", label: "View Code", icon: Code2 },
        ].map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`px-4 py-2 text-xs font-medium rounded-lg transition flex items-center gap-2 ${
              activeTab === id
                ? "bg-zinc-800 text-white border border-zinc-700"
                : "text-zinc-400 hover:text-zinc-300"
            }`}
          >
            {Icon && <Icon className="w-3.5 h-3.5" />}
            {label}
          </button>
        ))}
      </div>

      {/* Content Area */}
      <div className="p-4 bg-zinc-950/20">
        {activeTab === "preview" && (
          <div className="border border-zinc-800 rounded-xl overflow-hidden shadow-2xl bg-zinc-900/30">
            {/* Browser Frame */}
            <div className="flex items-center gap-4 px-4 py-3 bg-zinc-950/80 border-b border-zinc-900 select-none">
              <div className="flex gap-1.5 shrink-0">
                <span className="w-2.5 h-2.5 rounded-full bg-red-600/50"></span>
                <span className="w-2.5 h-2.5 rounded-full bg-yellow-600/50"></span>
                <span className="w-2.5 h-2.5 rounded-full bg-green-600/50"></span>
              </div>
              <div className="flex-1 flex justify-center max-w-sm sm:max-w-md mx-auto">
                <div className="w-full text-center py-1 px-3 bg-zinc-900 border border-zinc-800 rounded-md text-[11px] font-mono text-zinc-500 truncate">
                  personalized-landing-page.html
                </div>
              </div>
            </div>

            {/* Iframe - Full Page View */}
            <div className="w-full bg-white relative">
              <iframe
                srcDoc={html}
                title="Personalized Landing Page"
                className="w-full min-h-[720px] md:min-h-[900px] border-0 bg-white"
                sandbox="allow-scripts allow-same-origin"
              />
            </div>
          </div>
        )}

        {activeTab === "code" && (
          <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-4 max-h-[600px] overflow-auto font-mono text-xs">
            <pre className="text-zinc-400 whitespace-pre-wrap break-words">
              {html.slice(0, 3000)}
              {html.length > 3000 && "\n\n... (view full code by downloading HTML file)"}
            </pre>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-6 justify-between items-start sm:items-center px-6 py-4 border-t border-zinc-800 bg-zinc-950/40 text-xs text-zinc-500">
        <div className="space-y-1">
          <p className="font-medium text-zinc-400">✓ Ready to deploy</p>
          <p className="text-[11px]">Download the HTML file and publish to your server, or copy the code above</p>
        </div>
        {changeCount > 0 && (
          <div className="text-right">
            <p className="text-emerald-400 font-medium">{changeCount} elements optimized</p>
            <p className="text-[11px] text-zinc-500">Based on your ad creative and description</p>
          </div>
        )}
      </div>
    </div>
  );
}
