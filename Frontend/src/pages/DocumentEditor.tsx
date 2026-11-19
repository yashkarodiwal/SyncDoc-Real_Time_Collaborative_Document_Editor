
import { useParams } from "react-router-dom";
import { useState } from "react";

import Sidebar from "../components/Sidebar";
import Editor from "../components/Editor";
import Chat from "../components/Chat";
import AIPanel from "../components/AIPanel";
import ShareDocument from "../components/ShareDocument";
import DocumentTitle from "../components/DocumentTitle";

export default function DocumentEditor() {
    const { id } = useParams();
    const [content, setContent] = useState("");

    if (!id) return null;

    return (
        <div className="flex h-screen w-full overflow-hidden bg-slate-50">

            {/* Sidebar */}
            <div className="h-full shrink-0">
                <Sidebar />
            </div>

            {/* Main Workspace */}
            <main className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">

                {/* Top Header */}
                <header className="z-10 flex shrink-0 flex-col gap-3 border-b border-slate-200 bg-white px-4 py-3 shadow-sm lg:flex-row lg:items-center lg:justify-between lg:px-6">

                    {/* Document Title */}
                    <div className="min-w-0 flex-1">
                        <DocumentTitle documentId={id} />
                    </div>

                    {/* Sharing Controls */}
                    <div className="w-full min-w-0 lg:max-w-[440px]">
                        <ShareDocument documentId={id} />
                    </div>

                </header>

                {/* Workspace */}
                <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-y-auto 2xl:flex-row 2xl:overflow-hidden">

                    {/* Editor Section */}
                    <section className="flex min-h-[560px] min-w-0 flex-1 flex-col p-3 sm:p-5 2xl:min-h-0">

                        {/* Editor Heading */}
                        <div className="mb-3 flex shrink-0 items-center justify-between gap-3">

                            <div>
                                <h2 className="text-sm font-semibold text-slate-800">
                                    Document Editor
                                </h2>

                                <p className="mt-1 text-xs text-slate-400">
                                    Create and edit your document
                                </p>
                            </div>

                            <span className="shrink-0 rounded-full bg-green-50 px-3 py-1.5 text-xs font-medium text-green-700">
                                <span className="mr-1.5 inline-block h-2 w-2 rounded-full bg-green-500" />
                                Workspace
                            </span>

                        </div>

                        {/* Editor Container */}
                        <div className="min-h-0 min-w-0 flex-1 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">

                            <Editor
                                documentId={id}
                                onContentChange={setContent}
                            />

                        </div>

                    </section>

                    {/* Right Panels */}
                    <aside className="grid h-[760px] min-h-0 w-full shrink-0 grid-cols-1 border-t border-slate-200 bg-white md:h-[460px] md:grid-cols-2 2xl:h-full 2xl:w-[600px] 2xl:grid-cols-2 2xl:border-l 2xl:border-t-0">

                        {/* Team Chat */}
                        <section className="flex min-h-0 min-w-0 flex-col overflow-hidden border-b border-slate-200 md:border-b-0 md:border-r">

                            {/* Chat Heading */}
                            <div className="shrink-0 border-b border-slate-100 px-4 py-4">
                                <h2 className="text-sm font-semibold text-slate-800">
                                    Team Chat
                                </h2>

                                <p className="mt-1 text-xs text-slate-400">
                                    Communicate with collaborators
                                </p>
                            </div>

                            {/* Chat Content */}
                            <div className="min-h-0 min-w-0 flex-1 overflow-hidden">
                                <Chat documentId={id} />
                            </div>

                        </section>

                        {/* AI Assistant */}
                        <section className="flex min-h-0 min-w-0 flex-col overflow-hidden">

                            {/* AI Heading */}
                            <div className="shrink-0 border-b border-slate-100 px-4 py-4">
                                <h2 className="text-sm font-semibold text-slate-800">
                                    AI Assistant
                                </h2>

                                <p className="mt-1 text-xs text-slate-400">
                                    Get help with your document
                                </p>
                            </div>

                            {/* AI Content */}
                            <div className="min-h-0 min-w-0 flex-1 overflow-hidden">
                                <AIPanel content={content} />
                            </div>

                        </section>

                    </aside>

                </div>

            </main>
        </div>
    );
}
