import { useParams } from "react-router-dom";
import { useState } from "react";

import Sidebar from "../components/Sidebar";
import Editor from "../components/Editor";
import Chat from "../components/Chat";
import AIPanel from "../components/AIPanel";
import ShareDocument from "../components/ShareDocument";
import DocumentTitle from "../components/DocumentTitle";

type ActivePanel = "chat" | "ai";

export default function DocumentEditor() {
    const { id } = useParams();
    const [content, setContent] = useState("");
    const [activePanel, setActivePanel] = useState<ActivePanel>("chat");

    if (!id) return null;

    return (
        <div className="flex min-h-screen w-full flex-col bg-slate-50 md:h-screen md:min-h-0 md:flex-row md:overflow-hidden">

            {/* SIDEBAR */}
            <Sidebar />

            {/* MAIN WORKSPACE */}
            <main className="flex min-h-0 min-w-0 flex-1 flex-col md:overflow-hidden">

                {/* TOP HEADER */}
                <header className="z-10 flex shrink-0 flex-col gap-3 border-b border-slate-200 bg-white px-4 py-4 shadow-sm sm:px-6 lg:flex-row lg:items-center lg:justify-between">

                    {/* DOCUMENT TITLE */}
                    <div className="min-w-0 flex-1">
                        <DocumentTitle documentId={id} />
                    </div>

                    {/* SHARING CONTROLS */}
                    <div className="w-full min-w-0 lg:w-auto lg:max-w-[440px] lg:flex-1">
                        <ShareDocument documentId={id} />
                    </div>

                </header>

                {/* WORKSPACE CONTENT */}
                <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-y-auto 2xl:flex-row 2xl:overflow-hidden">

                    {/* EDITOR SECTION */}
                    <section className="flex min-h-[65vh] min-w-0 flex-1 flex-col p-3 sm:min-h-[600px] sm:p-5 2xl:min-h-0">

                        {/* EDITOR HEADING */}
                        <div className="mb-3 flex shrink-0 items-center justify-between gap-2">

                            <div className="min-w-0">
                                <h2 className="text-sm font-semibold text-slate-800">
                                    Document Editor
                                </h2>

                                <p className="mt-1 text-xs text-slate-400">
                                    Create and edit your document
                                </p>
                            </div>

                            <span className="flex shrink-0 items-center rounded-full bg-green-50 px-2.5 py-1.5 text-xs font-medium text-green-700 sm:px-3">
                                <span className="mr-1.5 inline-block h-2 w-2 rounded-full bg-green-500" />
                                Workspace
                            </span>

                        </div>

                        {/* EDITOR CONTAINER */}
                        <div className="min-h-[500px] min-w-0 flex-1 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm sm:min-h-[550px] 2xl:min-h-0">

                            <Editor
                                documentId={id}
                                onContentChange={setContent}
                            />

                        </div>

                    </section>

                    {/* CHAT AND AI PANELS */}
                    <aside className="flex min-h-[500px] min-w-0 w-full shrink-0 flex-col border-t border-slate-200 bg-white 2xl:h-full 2xl:min-h-0 2xl:w-[600px] 2xl:border-l 2xl:border-t-0">

                        {/* PANEL TABS - MOBILE AND TABLET */}
                        <div className="grid shrink-0 grid-cols-2 gap-2 border-b border-slate-200 bg-white p-3 2xl:hidden">

                            <button
                                type="button"
                                onClick={() => setActivePanel("chat")}
                                className={`rounded-xl px-3 py-3 text-sm font-semibold transition ${activePanel === "chat"
                                        ? "bg-blue-50 text-blue-700"
                                        : "text-slate-500 hover:bg-slate-50"
                                    }`}
                            >
                                💬 Team Chat
                            </button>

                            <button
                                type="button"
                                onClick={() => setActivePanel("ai")}
                                className={`rounded-xl px-3 py-3 text-sm font-semibold transition ${activePanel === "ai"
                                        ? "bg-blue-50 text-blue-700"
                                        : "text-slate-500 hover:bg-slate-50"
                                    }`}
                            >
                                ✨ AI Assistant
                            </button>

                        </div>

                        {/* MOBILE AND TABLET: ACTIVE PANEL */}
                        <div className="flex min-h-[450px] min-w-0 flex-1 flex-col overflow-hidden 2xl:hidden">

                            {activePanel === "chat" ? (
                                <section className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">

                                    <div className="shrink-0 border-b border-slate-100 px-4 py-4">
                                        <h2 className="text-sm font-semibold text-slate-800">
                                            Team Chat
                                        </h2>

                                        <p className="mt-1 text-xs text-slate-400">
                                            Communicate with collaborators
                                        </p>
                                    </div>

                                    <div className="min-h-0 min-w-0 flex-1 overflow-hidden">
                                        <Chat documentId={id} />
                                    </div>

                                </section>
                            ) : (
                                <section className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">

                                    <div className="shrink-0 border-b border-slate-100 px-4 py-4">
                                        <h2 className="text-sm font-semibold text-slate-800">
                                            AI Assistant
                                        </h2>

                                        <p className="mt-1 text-xs text-slate-400">
                                            Get help with your document
                                        </p>
                                    </div>

                                    <div className="min-h-0 min-w-0 flex-1 overflow-hidden">
                                        <AIPanel content={content} />
                                    </div>

                                </section>
                            )}

                        </div>

                        {/* DESKTOP: BOTH PANELS SIDE BY SIDE */}
                        <div className="hidden min-h-0 min-w-0 flex-1 grid-cols-2 2xl:grid">

                            {/* TEAM CHAT */}
                            <section className="flex min-h-0 min-w-0 flex-col overflow-hidden border-r border-slate-200">

                                <div className="shrink-0 border-b border-slate-100 px-4 py-4">
                                    <h2 className="text-sm font-semibold text-slate-800">
                                        Team Chat
                                    </h2>

                                    <p className="mt-1 text-xs text-slate-400">
                                        Communicate with collaborators
                                    </p>
                                </div>

                                <div className="min-h-0 min-w-0 flex-1 overflow-hidden">
                                    <Chat documentId={id} />
                                </div>

                            </section>

                            {/* AI ASSISTANT */}
                            <section className="flex min-h-0 min-w-0 flex-col overflow-hidden">

                                <div className="shrink-0 border-b border-slate-100 px-4 py-4">
                                    <h2 className="text-sm font-semibold text-slate-800">
                                        AI Assistant
                                    </h2>

                                    <p className="mt-1 text-xs text-slate-400">
                                        Get help with your document
                                    </p>
                                </div>

                                <div className="min-h-0 min-w-0 flex-1 overflow-hidden">
                                    <AIPanel content={content} />
                                </div>

                            </section>

                        </div>

                    </aside>

                </div>

            </main>
        </div>
    );
}
