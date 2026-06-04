"use client";

import { useState } from "react";
import { Copy, Check, Download, Eye, Zap, Code2, ArrowRight } from "lucide-react";

export default function OutputPanel({ html, changes = {}, original = null }) {
  const [copied, setCopied] = useState(false);
  const [showOriginal, setShowOriginal] = useState(false);
  const [activeTab, setActiveTab] = useState("preview"); // "preview" | "changes" | "code"

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
  const currentHtml = showOriginal ? original : html;

  return (
    <div id="output-preview-section" className="w-full mt-12 bg-zinc-900/40 border border-zinc-800 rounded-2xl overflow-hidden shadow-xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 px-6 py-5 border-b border-zinc-800 bg-zinc-950/60 backdrop-blur-md">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-xs font-mono tracking-wider text-emerald-400 uppercase font-semibold">Live Output Generated</span>
          </div>
          <h2 className="text-xl font-semibold text-white tracking-tight">
            {showOriginal ? "Original Landing Page" : "Personalized Preview"}
          </h2>
          <p className="text-xs text-zinc-400">
            {changeCount > 0 && !showOriginal
              ? `${changeCount} elements personalized`
              : showOriginal
                ? "View the original page before personalization"
                : "Review the personalized landing page"}
          </p>
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto flex-wrap">
          {original && (
            <button
              onClick={() => setShowOriginal(!showOriginal)}
              className="flex items-center justify-center gap-2 px-4 py-2 text-xs font-medium rounded-lg border border-zinc-700 bg-zinc-900 text-zinc-300 hover:bg-zinc-800 transition"
            >
              <Eye className="w-3.5 h-3.5" />
              {showOriginal ? "Show Personalized" : "Show Original"}
            </button>
          )}

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
          { id: "preview", label: "Preview", icon: Eye },
          { id: "changes", label: `Changes (${changeCount})`, icon: Zap, disabled: changeCount === 0 },
          { id: "code", label: "Code", icon: Code2 },
        ].map(({ id, label, icon: Icon, disabled }) => (
          <button
            key={id}
            onClick={() => !disabled && setActiveTab(id)}
            disabled={disabled}
            className={`px-4 py-2 text-xs font-medium rounded-lg transition flex items-center gap-2 ${
              activeTab === id
                ? "bg-zinc-800 text-white border border-zinc-700"
                : disabled
                  ? "text-zinc-600 cursor-not-allowed"
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
                  {showOriginal ? "original-landing-page.html" : "personalized-page.html"}
                </div>
              </div>
              <span className="text-[10px] text-zinc-600 font-mono">
                {showOriginal ? "Original" : "Personalized"}
              </span>
            </div>

            {/* Iframe */}
            <div className="w-full bg-white relative">
              <iframe
                srcDoc={currentHtml}
                title={showOriginal ? "Original Landing Page" : "Personalized Landing Page"}
                className="w-full min-h-[580px] md:min-h-[640px] border-0 bg-white"
                sandbox="allow-scripts allow-same-origin"
              />
            </div>
          </div>
        )}

        {activeTab === "changes" && (
          <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-6 space-y-4 max-h-[600px] overflow-y-auto">
            {changeCount === 0 ? (
              <div className="text-center py-8 text-zinc-500">
                <p className="text-sm">No changes detected</p>
              </div>
            ) : (
              Object.entries(changes).map(([slot, { from, to, category }]) => (
                <div
                  key={slot}
                  className="border border-zinc-800 rounded-lg p-4 bg-zinc-950/60 hover:bg-zinc-900/40 transition space-y-3"
                >
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-2">
                      <span className="inline-block px-2 py-1 bg-emerald-950 text-emerald-400 text-[10px] font-mono font-semibold rounded">
                        {slot}
                      </span>
                      <span className="inline-block px-2 py-1 bg-zinc-900 text-zinc-400 text-[10px] font-mono rounded">
                        {category}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                    {/* Original */}
                    <div className="space-y-2">
                      <span className="block text-zinc-500 text-[10px] font-mono uppercase tracking-wide">Original</span>
                      <div className="text-zinc-400 italic bg-zinc-900 p-3 rounded border border-zinc-800/50 line-clamp-3 text-[12px] leading-relaxed">
                        {from || "[empty]"}
                      </div>
                    </div>

                    {/* Arrow */}
                    <div className="hidden md:flex items-center justify-center">
                      <ArrowRight className="w-4 h-4 text-emerald-600" />
                    </div>

                    {/* Personalized */}
                    <div className="md:col-start-2 space-y-2">
                      <span className="block text-emerald-600 text-[10px] font-mono uppercase tracking-wide">Personalized</span>
                      <div className="text-emerald-300 font-medium bg-emerald-950/30 p-3 rounded border border-emerald-800/40 line-clamp-3 text-[12px] leading-relaxed">
                        {to}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === "code" && (
          <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-4 max-h-[600px] overflow-auto font-mono text-xs">
            <pre className="text-zinc-400 whitespace-pre-wrap break-words">
              {html.slice(0, 2000)}
              {html.length > 2000 && "\n\n... (truncated)"}
            </pre>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-6 justify-between items-start sm:items-center px-6 py-4 border-t border-zinc-800 bg-zinc-950/40 text-xs text-zinc-500">
        <div className="space-y-1">
          <p className="font-medium text-zinc-400">✓ Conversion-safe personalization</p>
          <p className="text-[11px]">Layout & DOM structure fully preserved • Only copy blocks changed • Relative URLs fixed</p>
        </div>
      </div>
    </div>
  );
}
