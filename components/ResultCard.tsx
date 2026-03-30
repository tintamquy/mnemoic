"use client";

import { MnemonicResult } from "@/lib/types";
import { Brain, BookOpen, Star, MessageCircle, Copy, Check } from "lucide-react";
import { useState } from "react";

interface ResultCardProps {
  result: MnemonicResult;
  streaming?: boolean;
}

export default function ResultCard({ result, streaming }: ResultCardProps) {
  const [copied, setCopied] = useState(false);

  const copyAll = () => {
    const text = `🧠 Mnemonic for: ${result.topic}
Technique: ${result.technique}

📌 Mnemonic: ${result.mnemonic}

📖 Story: ${result.story}

✅ Key Points:
${result.keyPoints.map((p, i) => `${i + 1}. ${p}`).join("\n")}

❓ Practice: ${result.practicePrompt}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="glass-card p-6 space-y-5 animate-slide-up glow-purple">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
              {result.technique}
            </span>
            {streaming && (
              <span className="flex items-center gap-1 text-xs text-blue-400">
                <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse" />
                Generating...
              </span>
            )}
          </div>
          <h3 className="text-lg font-semibold text-white">{result.topic}</h3>
        </div>
        <button
          onClick={copyAll}
          className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-white px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 transition-all"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
          {copied ? "Copied!" : "Copy"}
        </button>
      </div>

      {/* Core Mnemonic */}
      <div className="bg-gradient-to-r from-purple-900/40 to-blue-900/40 border border-purple-500/20 rounded-xl p-4">
        <div className="flex items-center gap-2 mb-2">
          <Brain className="w-4 h-4 text-purple-400" />
          <span className="text-xs font-semibold text-purple-300 uppercase tracking-wider">
            Your Mnemonic
          </span>
        </div>
        <p className="text-white font-semibold text-lg leading-relaxed">
          {result.mnemonic}
        </p>
      </div>

      {/* Story */}
      {result.story && (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-blue-400" />
            <span className="text-xs font-semibold text-blue-300 uppercase tracking-wider">
              Memory Story
            </span>
          </div>
          <p className="text-gray-300 leading-relaxed text-sm">{result.story}</p>
        </div>
      )}

      {/* Key Points */}
      {result.keyPoints && result.keyPoints.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Star className="w-4 h-4 text-yellow-400" />
            <span className="text-xs font-semibold text-yellow-300 uppercase tracking-wider">
              Key Points to Remember
            </span>
          </div>
          <ul className="space-y-1.5">
            {result.keyPoints.map((point, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
                <span className="mt-0.5 w-5 h-5 flex-shrink-0 rounded-full bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 text-xs flex items-center justify-center font-bold">
                  {i + 1}
                </span>
                {point}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Practice Prompt */}
      {result.practicePrompt && (
        <div className="bg-green-900/20 border border-green-500/20 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <MessageCircle className="w-4 h-4 text-green-400" />
            <span className="text-xs font-semibold text-green-300 uppercase tracking-wider">
              Test Yourself
            </span>
          </div>
          <p className="text-gray-300 text-sm">{result.practicePrompt}</p>
        </div>
      )}
    </div>
  );
}
