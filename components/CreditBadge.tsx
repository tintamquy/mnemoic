"use client";

import { CreditState, FREE_CREDITS } from "@/lib/types";
import { Zap } from "lucide-react";

interface CreditBadgeProps {
  credits: CreditState;
  onBuyClick: () => void;
}

export default function CreditBadge({ credits, onBuyClick }: CreditBadgeProps) {
  const isLow = credits.total <= 1;
  const isEmpty = credits.total === 0;

  return (
    <div className="flex items-center gap-3">
      <div
        className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium border transition-all ${
          isEmpty
            ? "bg-red-500/10 border-red-500/30 text-red-400"
            : isLow
            ? "bg-yellow-500/10 border-yellow-500/30 text-yellow-400"
            : "bg-green-500/10 border-green-500/30 text-green-400"
        }`}
      >
        <Zap className="w-3.5 h-3.5" />
        <span>
          {credits.total} {credits.total === 1 ? "credit" : "credits"}
          {credits.free > 0 && credits.paid === 0 && (
            <span className="ml-1 text-xs opacity-70">free</span>
          )}
        </span>
      </div>

      {(isLow || isEmpty) && (
        <button
          onClick={onBuyClick}
          className="px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white text-sm font-medium rounded-full transition-all hover:scale-105 shadow-lg shadow-purple-500/25"
        >
          Get more →
        </button>
      )}

      {!isLow && credits.free > 0 && (
        <span className="text-xs text-gray-500">
          {FREE_CREDITS - credits.free}/{FREE_CREDITS} free used
        </span>
      )}
    </div>
  );
}
