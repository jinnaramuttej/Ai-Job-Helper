"use client";

import { useState } from "react";
import { getAiJobSuggestions } from "@/app/actions/ai-suggestions";
import { Bot, Loader2, Sparkles } from "lucide-react";
import ReactMarkdown from "react-markdown";

export function AiSuggestionCard() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getAiJobSuggestions();
      if (response.error) {
        setError(response.error);
      } else if (response.result) {
        setResult(response.result);
      }
    } catch (err) {
      setError("An unexpected error occurred while fetching AI suggestions.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-xl border border-[#222] bg-gradient-to-b from-[#111] to-[#0a0a0a] p-6 shadow-xl relative overflow-hidden mt-6 mb-8">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 via-fuchsia-500 to-pink-500"></div>
      
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-purple-500/10 rounded-lg text-purple-400">
          <Bot size={24} />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-white flex items-center gap-2">
            AI Job Matchmaker
            <Sparkles size={16} className="text-fuchsia-400" />
          </h2>
          <p className="text-sm text-[#888]">Get personalized recommendations powered by Gemini</p>
        </div>
      </div>

      {!result && !error && (
        <button
          onClick={handleGenerate}
          disabled={loading}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-white px-4 py-3 text-sm font-medium text-black transition-colors hover:bg-[#ddd] disabled:opacity-50"
        >
          {loading ? (
            <>
              <Loader2 className="animate-spin" size={16} />
              Analyzing your profile...
            </>
          ) : (
            "Generate AI Suggestions"
          )}
        </button>
      )}

      {error && (
        <div className="mt-4 p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
          {error}
          <button 
            onClick={handleGenerate}
            className="block mt-3 underline hover:text-red-300"
          >
            Try Again
          </button>
        </div>
      )}

      {result && (
        <div className="mt-4 space-y-4">
          <div className="prose prose-invert prose-sm max-w-none text-[#ccc]">
            <ReactMarkdown>{result}</ReactMarkdown>
          </div>
          <button
            onClick={handleGenerate}
            disabled={loading}
            className="flex items-center gap-2 text-sm text-purple-400 hover:text-purple-300 transition-colors"
          >
            {loading ? <Loader2 className="animate-spin" size={14} /> : <Sparkles size={14} />}
            Regenerate
          </button>
        </div>
      )}
    </div>
  );
}
