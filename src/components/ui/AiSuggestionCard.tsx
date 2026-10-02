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
    <div className="mt-6 mb-8 rounded-[10px] border border-line bg-surface p-6">
      <div className="mb-4 flex items-center gap-3">
        <div className="rounded-lg bg-accent-soft p-2 text-accent">
          <Bot size={24} />
        </div>
        <div>
          <h2 className="flex items-center gap-2 text-xl font-semibold text-ink">
            AI Job Matchmaker
            <Sparkles size={16} className="text-accent" />
          </h2>
          <p className="text-sm text-muted">Get personalized recommendations powered by Gemini</p>
        </div>
      </div>

      {!result && !error && (
        <button
          onClick={handleGenerate}
          disabled={loading}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-accent px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-accent-strong disabled:opacity-50"
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
        <div className="mt-4 rounded-lg border border-danger bg-danger/10 p-4 text-sm text-danger">
          {error}
          <button 
            onClick={handleGenerate}
            className="mt-3 block font-medium underline"
          >
            Try Again
          </button>
        </div>
      )}

      {result && (
        <div className="mt-4 space-y-4">
          <div className="prose prose-sm max-w-none text-ink">
            <ReactMarkdown>{result}</ReactMarkdown>
          </div>
          <button
            onClick={handleGenerate}
            disabled={loading}
            className="flex items-center gap-2 text-sm font-medium text-accent transition-colors hover:text-accent-strong"
          >
            {loading ? <Loader2 className="animate-spin" size={14} /> : <Sparkles size={14} />}
            Regenerate
          </button>
        </div>
      )}
    </div>
  );
}
