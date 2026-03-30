"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Brain, Sparkles, ChevronDown } from "lucide-react";
import LanguageSelector from "@/components/LanguageSelector";
import CreditBadge from "@/components/CreditBadge";
import ResultCard from "@/components/ResultCard";
import PricingModal from "@/components/PricingModal";
import { getCredits, useCredit, addPaidCredits, hasCredits } from "@/lib/credits";
import { MnemonicResult, CreditState } from "@/lib/types";

const EXAMPLE_TOPICS = [
  "The 7 continents",
  "Mitosis vs Meiosis",
  "Newton's 3 laws of motion",
  "Colors of the rainbow",
  "Periodic table groups",
  "The water cycle",
  "Photosynthesis formula",
  "Historical dates (WWII)",
];

function HomeContent() {
  const searchParams = useSearchParams();
  const [topic, setTopic] = useState("");
  const [context, setContext] = useState("");
  const [language, setLanguage] = useState("en");
  const [showContext, setShowContext] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<MnemonicResult | null>(null);
  const [streamingResult, setStreamingResult] = useState<Partial<MnemonicResult> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [credits, setCredits] = useState<CreditState>({ free: 5, paid: 0, total: 5 });
  const [showPricing, setShowPricing] = useState(false);
  const [history, setHistory] = useState<MnemonicResult[]>([]);
  const resultRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setCredits(getCredits());

    // Handle successful Stripe payment
    const success = searchParams.get("success");
    const newCredits = searchParams.get("credits");
    if (success === "true" && newCredits) {
      addPaidCredits(parseInt(newCredits, 10));
      setCredits(getCredits());
      // Clean URL
      window.history.replaceState({}, "", "/");
    }
  }, [searchParams]);

  const generate = async () => {
    if (!topic.trim()) return;
    if (!hasCredits()) {
      setShowPricing(true);
      return;
    }

    const spent = useCredit();
    if (!spent) {
      setShowPricing(true);
      return;
    }

    setCredits(getCredits());
    setLoading(true);
    setError(null);
    setResult(null);
    setStreamingResult(null);

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: topic.trim(), language, context }),
      });

      if (!res.ok) throw new Error("Generation failed");

      const reader = res.body?.getReader();
      if (!reader) throw new Error("No response stream");

      const decoder = new TextDecoder();
      let rawJson = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = line.slice(6).trim();
            if (data === "[DONE]") break;
            try {
              const parsed = JSON.parse(data);
              if (parsed.chunk) {
                rawJson += parsed.chunk;
                // Try to parse partial JSON for live preview
                try {
                  const partial = JSON.parse(rawJson);
                  setStreamingResult({ ...partial, topic, language });
                } catch {
                  // Still streaming, not valid JSON yet
                }
              }
            } catch {
              // ignore parse errors on incomplete chunks
            }
          }
        }
      }

      // Final parse
      try {
        const final = JSON.parse(rawJson) as MnemonicResult;
        const fullResult = { ...final, topic, language };
        setResult(fullResult);
        setHistory((prev) => [fullResult, ...prev].slice(0, 10));
        setStreamingResult(null);
        setTimeout(() => resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 100);
      } catch {
        throw new Error("Invalid response format from AI");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      generate();
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Background gradients */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-3xl mx-auto px-4 py-8">
        {/* Header */}
        <header className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl flex items-center justify-center">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="font-bold text-white text-lg">MnemoAI</span>
              <span className="text-xs text-gray-500 block -mt-0.5">Remember Everything</span>
            </div>
          </div>
          <CreditBadge credits={credits} onBuyClick={() => setShowPricing(true)} />
        </header>

        {/* Hero */}
        <div className="text-center mb-10">
          <h1 className="text-4xl sm:text-5xl font-black mb-4 leading-tight">
            <span className="gradient-text">Never Forget</span>{" "}
            <span className="text-white">Anything</span>
          </h1>
          <p className="text-gray-400 text-lg max-w-xl mx-auto">
            AI creates vivid mnemonics, stories &amp; memory tricks — in your language, for anything you need to memorize.
          </p>

          {/* Social proof */}
          <div className="flex items-center justify-center gap-6 mt-6 text-sm text-gray-500">
            <span>🌍 10+ languages</span>
            <span>🧠 5 free uses</span>
            <span>⚡ Results in seconds</span>
          </div>
        </div>

        {/* Main Input Card */}
        <div className="glass-card p-6 mb-6">
          {/* Language Selection */}
          <div className="mb-5">
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
              Response Language
            </label>
            <LanguageSelector value={language} onChange={setLanguage} />
          </div>

          {/* Topic Input */}
          <div className="mb-4">
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
              What do you want to memorize?
            </label>
            <textarea
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="e.g. The 8 planets of the solar system, Pythagorean theorem, Key events of the French Revolution..."
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-purple-500/50 focus:bg-white/[0.07] transition-all resize-none text-sm"
              rows={3}
            />
          </div>

          {/* Optional context toggle */}
          <button
            onClick={() => setShowContext(!showContext)}
            className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-300 transition-colors mb-3"
          >
            <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showContext ? "rotate-180" : ""}`} />
            Add extra context (optional)
          </button>

          {showContext && (
            <div className="mb-4">
              <textarea
                value={context}
                onChange={(e) => setContext(e.target.value)}
                placeholder="e.g. I'm a high school student, I need this for my chemistry exam tomorrow..."
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-purple-500/50 transition-all resize-none text-sm"
                rows={2}
              />
            </div>
          )}

          {/* Generate Button */}
          <button
            onClick={generate}
            disabled={loading || !topic.trim()}
            className="w-full flex items-center justify-center gap-2 py-3.5 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 disabled:from-gray-700 disabled:to-gray-700 disabled:text-gray-500 text-white font-semibold rounded-xl transition-all hover:scale-[1.01] active:scale-[0.99] shadow-lg shadow-purple-500/20 disabled:shadow-none disabled:cursor-not-allowed text-sm"
          >
            {loading ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Generating your mnemonic...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Generate Mnemonic ({credits.total} credit{credits.total !== 1 ? "s" : ""} left)
              </>
            )}
          </button>
        </div>

        {/* Example Topics */}
        <div className="mb-8">
          <p className="text-xs text-gray-600 text-center mb-3">Try an example →</p>
          <div className="flex flex-wrap gap-2 justify-center">
            {EXAMPLE_TOPICS.map((ex) => (
              <button
                key={ex}
                onClick={() => setTopic(ex)}
                className="text-xs px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-white/10 transition-all"
              >
                {ex}
              </button>
            ))}
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm animate-fade-in">
            ❌ {error}
          </div>
        )}

        {/* Streaming Result */}
        {(streamingResult || result) && (
          <div ref={resultRef}>
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
              Your Mnemonic
            </h2>
            <ResultCard
              result={(result || streamingResult) as MnemonicResult}
              streaming={loading}
            />
          </div>
        )}

        {/* History */}
        {history.length > 1 && (
          <div className="mt-10">
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
              Recent Mnemonics
            </h2>
            <div className="space-y-4">
              {history.slice(1).map((item, i) => (
                <div key={i} className="opacity-70 hover:opacity-100 transition-opacity">
                  <ResultCard result={item} />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty state CTA */}
        {!result && !streamingResult && !loading && (
          <div className="mt-8 text-center">
            <div className="glass-card p-6 max-w-sm mx-auto">
              <div className="text-3xl mb-3">🧠</div>
              <h3 className="font-semibold text-white mb-2">How it works</h3>
              <div className="space-y-2 text-sm text-gray-400">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-purple-500/20 text-purple-400 text-xs flex items-center justify-center font-bold flex-shrink-0">1</span>
                  <span>Type what you want to memorize</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-blue-500/20 text-blue-400 text-xs flex items-center justify-center font-bold flex-shrink-0">2</span>
                  <span>Claude AI creates a vivid mnemonic + story</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-green-500/20 text-green-400 text-xs flex items-center justify-center font-bold flex-shrink-0">3</span>
                  <span>You remember it forever — in any language</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <footer className="mt-16 text-center text-xs text-gray-700">
          <p>MnemoAI · Powered by Claude · 5 free uses, then tiny per-use fees</p>
        </footer>
      </div>

      {/* Pricing Modal */}
      {showPricing && (
        <PricingModal
          onClose={() => {
            setShowPricing(false);
            setCredits(getCredits());
          }}
        />
      )}
    </div>
  );
}

export default function HomePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-950 flex items-center justify-center text-white">Loading...</div>}>
      <HomeContent />
    </Suspense>
  );
}
