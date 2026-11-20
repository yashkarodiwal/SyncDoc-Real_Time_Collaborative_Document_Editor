
import { useState } from "react";
import axios from "axios";
import { marked } from "marked";
import DOMPurify from "dompurify";

interface Props {
    content: string;
}

export default function AIPanel({ content }: Props) {
    const [result, setResult] = useState("");
    const [loading, setLoading] = useState(false);
    const [activeAction, setActiveAction] = useState("");

    const token = localStorage.getItem("token");

    const callAI = async (endpoint: string) => {
        if (!content || content.trim() === "") {
            setResult(
                "Your document is empty. Add some content before using AI tools."
            );
            return;
        }

        try {
            setLoading(true);
            setActiveAction(endpoint);
            setResult("");

            const res = await axios.post(
                `https://syncdoc.onrender.com/api/ai/${endpoint}`,
                { content },
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            setResult(
                res.data.result || "No response received from AI."
            );

        } catch (error) {
            console.error("AI request failed:", error);

            setResult(
                "Unable to generate a response. Please try again."
            );

        } finally {
            setLoading(false);
            setActiveAction("");
        }
    };

    // Convert AI HTML/Markdown response into safe HTML
    const formattedResult = DOMPurify.sanitize(
        marked.parse(result) as string
    );

    return (
        <div className="flex h-full min-h-0 min-w-0 flex-col overflow-hidden bg-white">

            {/* AI Actions */}

            <div className="shrink-0 space-y-3 border-b border-slate-100 p-3 sm:p-4">

                <div className="min-w-0">
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                        Writing tools
                    </p>

                    <p className="mt-1 text-xs leading-relaxed text-slate-500">
                        Improve your document with AI assistance.
                    </p>
                </div>

                {/* Summarize */}

                <button
                    type="button"
                    onClick={() => callAI("summarize")}
                    disabled={loading}
                    className="flex min-h-11 w-full min-w-0 items-center justify-center gap-2 rounded-lg bg-blue-600 px-3 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                    <span>✦</span>

                    <span className="truncate">
                        {activeAction === "summarize"
                            ? "Summarizing..."
                            : "Summarize"}
                    </span>
                </button>

                {/* Fix Grammar */}

                <button
                    type="button"
                    onClick={() => callAI("grammar")}
                    disabled={loading}
                    className="flex min-h-11 w-full min-w-0 items-center justify-center gap-2 rounded-lg bg-emerald-600 px-3 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                    <span>✓</span>

                    <span className="truncate">
                        {activeAction === "grammar"
                            ? "Fixing grammar..."
                            : "Fix Grammar"}
                    </span>
                </button>

                {/* Rewrite */}

                <button
                    type="button"
                    onClick={() => callAI("rewrite")}
                    disabled={loading}
                    className="flex min-h-11 w-full min-w-0 items-center justify-center gap-2 rounded-lg bg-violet-600 px-3 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                    <span>✎</span>

                    <span className="truncate">
                        {activeAction === "rewrite"
                            ? "Rewriting..."
                            : "Rewrite"}
                    </span>
                </button>

            </div>

            {/* AI Response */}

            <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">

                <div className="shrink-0 border-b border-slate-100 px-3 py-3 sm:px-4">
                    <h3 className="text-sm font-semibold text-slate-800">
                        AI Response
                    </h3>

                    <p className="mt-1 text-xs text-slate-400">
                        Your generated content will appear here.
                    </p>
                </div>

                <div
                    className="min-h-0 min-w-0 flex-1 overflow-x-hidden overflow-y-auto p-3 sm:p-4"
                    aria-live="polite"
                    aria-busy={loading}
                >

                    {loading ? (
                        <div className="flex flex-col items-center justify-center gap-3 py-8 text-center">

                            <div className="h-7 w-7 animate-spin rounded-full border-2 border-slate-200 border-t-blue-600" />

                            <p className="text-sm font-medium text-slate-600">
                                AI is generating your response...
                            </p>

                            <p className="text-xs text-slate-400">
                                Please wait a moment.
                            </p>

                        </div>
                    ) : result ? (
                        <div
                            className="ai-response w-full min-w-0 rounded-xl border border-slate-100 bg-slate-50 p-3 text-sm leading-7 text-slate-700 sm:p-4"
                            dangerouslySetInnerHTML={{
                                __html: formattedResult
                            }}
                        />
                    ) : (
                        <div className="flex flex-col items-center justify-center px-2 py-10 text-center">

                            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-50 text-2xl">
                                ✨
                            </div>

                            <h4 className="text-sm font-semibold text-slate-700">
                                Your AI assistant
                            </h4>

                            <p className="mt-2 max-w-[220px] text-xs leading-relaxed text-slate-400">
                                Choose Summarize, Fix Grammar, or Rewrite to get help with your document.
                            </p>

                        </div>
                    )}

                </div>

            </div>

        </div>
    );
}
