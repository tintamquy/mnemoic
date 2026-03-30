"use client";

import { LANGUAGES } from "@/lib/types";

interface LanguageSelectorProps {
  value: string;
  onChange: (code: string) => void;
}

export default function LanguageSelector({ value, onChange }: LanguageSelectorProps) {
  return (
    <div className="flex flex-wrap gap-2 justify-center">
      {LANGUAGES.map((lang) => (
        <button
          key={lang.code}
          onClick={() => onChange(lang.code)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
            value === lang.code
              ? "bg-purple-500 text-white shadow-lg shadow-purple-500/30 scale-105"
              : "bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white border border-white/10"
          }`}
        >
          <span>{lang.flag}</span>
          <span>{lang.nativeName}</span>
        </button>
      ))}
    </div>
  );
}
