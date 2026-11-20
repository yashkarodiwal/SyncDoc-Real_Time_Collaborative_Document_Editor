import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";

interface Document {
    _id: string;
    title: string;
    updatedAt: string;
    role?: "owner" | "editor" | "viewer";
}

export default function Dashboard() {
    const [documents, setDocuments] = useState<Document[]>([]);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);

    const [creating, setCreating] = useState(false);
    const [renaming, setRenaming] = useState(false);

    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showRenameModal, setShowRenameModal] = useState(false);

    const [newDocumentName, setNewDocumentName] = useState("");
    const [renameValue, setRenameValue] = useState("");

    const [selectedDocument, setSelectedDocument] =
        useState<Document | null>(null);

    const [openMenuId, setOpenMenuId] = useState<string | null>(null);
    const [error, setError] = useState("");

    const navigate = useNavigate();

    const token = localStorage.getItem("token");
    const userName = localStorage.getItem("name") || "there";

    const headers = {
        Authorization: `Bearer ${token}`
    };

    // LOAD DOCUMENTS
    useEffect(() => {
        const fetchDocuments = async () => {
            try {
                const res = await axios.get(
                    "https://syncdoc.onrender.com/api/documents",
                    { headers }
                );

                setDocuments(res.data);
            } catch (error) {
                console.error("Failed to load documents", error);
            } finally {
                setLoading(false);
            }
        };

        fetchDocuments();
    }, [token]);

    // OPEN CREATE MODAL
    const openCreateModal = () => {
        setNewDocumentName("");
        setError("");
        setShowCreateModal(true);
    };

    // CREATE DOCUMENT
    const createDocument = async (e: React.FormEvent) => {
        e.preventDefault();

        const title = newDocumentName.trim();

        if (!title) {
            setError("Please enter a document name.");
            return;
        }

        try {
            setCreating(true);
            setError("");

            const res = await axios.post(
                "https://syncdoc.onrender.com/api/documents",
                { title },
                { headers }
            );

            navigate(`/document/${res.data._id}`);
        } catch (error) {
            console.error("Failed to create document", error);
            setError("Unable to create document. Please try again.");
        } finally {
            setCreating(false);
        }
    };

    // OPEN RENAME MODAL
    const openRenameModal = (doc: Document) => {
        setSelectedDocument(doc);
        setRenameValue(doc.title || "Untitled Document");
        setError("");
        setOpenMenuId(null);
        setShowRenameModal(true);
    };

    // RENAME DOCUMENT
    const renameDocument = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!selectedDocument) return;

        const title = renameValue.trim();

        if (!title) {
            setError("Document name cannot be empty.");
            return;
        }

        try {
            setRenaming(true);
            setError("");

            await axios.put(
                `https://syncdoc.onrender.com/api/documents/${selectedDocument._id}/title`,
                { title },
                { headers }
            );

            setDocuments((previousDocuments) =>
                previousDocuments.map((doc) =>
                    doc._id === selectedDocument._id
                        ? {
                            ...doc,
                            title,
                            updatedAt: new Date().toISOString()
                        }
                        : doc
                )
            );

            setShowRenameModal(false);
            setSelectedDocument(null);
        } catch (error) {
            console.error("Failed to rename document", error);

            if (axios.isAxiosError(error) && error.response?.status === 403) {
                setError("You do not have permission to rename this document.");
            } else {
                setError("Unable to rename document. Please try again.");
            }
        } finally {
            setRenaming(false);
        }
    };

    // SEARCH DOCUMENTS
    const filteredDocuments = documents.filter((doc) =>
        (doc.title || "Untitled Document")
            .toLowerCase()
            .includes(search.toLowerCase())
    );

    // FORMAT DATE
    const formatDate = (date: string) => {
        if (!date) return "Recently updated";

        return new Date(date).toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric"
        });
    };

    return (
        <div
            className="flex min-h-screen w-full flex-col bg-slate-50 md:flex-row"
            onClick={() => setOpenMenuId(null)}
        >
            <Sidebar />

            <main className="w-full min-w-0 flex-1 px-4 py-5 sm:px-6 sm:py-7 lg:px-10">

                {/* TOP HEADER */}
                <div className="mb-8 flex flex-col gap-5 sm:mb-10 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0">
                        <p className="mb-2 text-xs font-semibold tracking-wide text-blue-600 sm:text-sm">
                            WORKSPACE OVERVIEW
                        </p>

                        <h1 className="break-words text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                            Welcome back, {userName}!
                        </h1>

                        <p className="mt-2 text-sm leading-relaxed text-slate-500">
                            Manage your documents and collaborate with your team.
                        </p>
                    </div>

                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            openCreateModal();
                        }}
                        className="inline-flex w-full shrink-0 items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700 sm:w-auto"
                    >
                        <span className="text-lg">+</span>
                        Create Document
                    </button>
                </div>

                {/* STATISTICS */}
                <div className="mb-8 grid grid-cols-1 gap-4 sm:mb-9 sm:grid-cols-2 sm:gap-5 xl:grid-cols-3">

                    {/* TOTAL DOCUMENTS */}
                    <div className="min-w-0 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                        <div className="flex items-center justify-between gap-3">
                            <div>
                                <p className="text-sm font-medium text-slate-500">
                                    Total Documents
                                </p>

                                <h2 className="mt-3 text-3xl font-bold text-slate-900">
                                    {documents.length}
                                </h2>
                            </div>

                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-2xl sm:h-12 sm:w-12">
                                📄
                            </div>
                        </div>

                        <p className="mt-4 text-xs text-slate-400">
                            Documents in your workspace
                        </p>
                    </div>

                    {/* RECENTLY UPDATED */}
                    <div className="min-w-0 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                        <div className="flex items-center justify-between gap-3">
                            <div>
                                <p className="text-sm font-medium text-slate-500">
                                    Recently Updated
                                </p>

                                <h2 className="mt-3 text-3xl font-bold text-slate-900">
                                    {documents.filter((doc) => {
                                        const updated = new Date(doc.updatedAt);
                                        const now = new Date();

                                        return updated.toDateString() === now.toDateString();
                                    }).length}
                                </h2>
                            </div>

                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-purple-50 text-2xl sm:h-12 sm:w-12">
                                ⚡
                            </div>
                        </div>

                        <p className="mt-4 text-xs text-slate-400">
                            Updated today
                        </p>
                    </div>

                    {/* WORKSPACE STATUS */}
                    <div className="min-w-0 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:col-span-2 sm:p-6 xl:col-span-1">
                        <div className="flex items-center justify-between gap-3">
                            <div>
                                <p className="text-sm font-medium text-slate-500">
                                    Workspace Status
                                </p>

                                <h2 className="mt-3 text-2xl font-bold text-slate-900">
                                    Active
                                </h2>
                            </div>

                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-green-50 text-2xl sm:h-12 sm:w-12">
                                ✓
                            </div>
                        </div>

                        <p className="mt-4 text-xs text-slate-400">
                            Your workspace is ready
                        </p>
                    </div>
                </div>

                {/* DOCUMENTS SECTION */}
                <section className="min-w-0">
                    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h2 className="text-xl font-bold text-slate-900">
                                Your Documents
                            </h2>

                            <p className="mt-1 text-sm text-slate-500">
                                Access and manage your saved documents.
                            </p>
                        </div>

                        <div className="relative w-full sm:max-w-xs">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                                🔍
                            </span>

                            <input
                                type="text"
                                placeholder="Search documents..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
                            />
                        </div>
                    </div>

                    {/* LOADING */}
                    {loading ? (
                        <div className="rounded-2xl border border-slate-200 bg-white py-16 text-center">
                            <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-blue-100 border-t-blue-600" />

                            <p className="text-sm text-slate-500">
                                Loading your documents...
                            </p>
                        </div>
                    ) : filteredDocuments.length === 0 ? (

                        /* EMPTY STATE */
                        <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-5 py-12 text-center sm:px-6 sm:py-16">
                            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-3xl">
                                📁
                            </div>

                            <h3 className="text-lg font-semibold text-slate-900">
                                {search ? "No matching documents" : "No documents yet"}
                            </h3>

                            <p className="mx-auto mt-2 max-w-sm text-sm text-slate-500">
                                {search
                                    ? "Try searching with a different document title."
                                    : "Create your first document and start collaborating with your team."}
                            </p>

                            {!search && (
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        openCreateModal();
                                    }}
                                    className="mt-6 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
                                >
                                    + Create your first document
                                </button>
                            )}
                        </div>
                    ) : (

                        /* DOCUMENT CARDS */
                        <div className="grid min-w-0 grid-cols-1 gap-4 sm:gap-5 md:grid-cols-2 2xl:grid-cols-3">
                            {filteredDocuments.map((doc) => (
                                <div
                                    key={doc._id}
                                    onClick={() => navigate(`/document/${doc._id}`)}
                                    className="group relative min-w-0 cursor-pointer rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition duration-200 hover:border-blue-200 hover:shadow-lg sm:p-5 sm:hover:-translate-y-1"
                                >
                                    {/* DOCUMENT ICON AND MENU */}
                                    <div className="mb-5 flex items-center justify-between gap-2">
                                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-2xl sm:h-12 sm:w-12">
                                            📄
                                        </div>

                                        <div className="flex min-w-0 items-center gap-1 sm:gap-2">
                                            <span className="whitespace-nowrap rounded-full bg-green-50 px-2.5 py-1 text-[11px] font-medium text-green-700 sm:px-3 sm:text-xs">
                                                Available
                                            </span>

                                            {doc.role !== "viewer" && (
                                                <div className="relative shrink-0">
                                                    <button
                                                        type="button"
                                                        onClick={(e) => {
                                                            e.stopPropagation();

                                                            setOpenMenuId(
                                                                openMenuId === doc._id
                                                                    ? null
                                                                    : doc._id
                                                            );
                                                        }}
                                                        className="flex h-9 w-9 items-center justify-center rounded-lg text-xl text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
                                                        title="Document options"
                                                    >
                                                        ⋮
                                                    </button>

                                                    {openMenuId === doc._id && (
                                                        <div
                                                            onClick={(e) => e.stopPropagation()}
                                                            className="absolute right-0 top-10 z-20 w-40 rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl"
                                                        >
                                                            <button
                                                                onClick={() => openRenameModal(doc)}
                                                                className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-sm font-medium text-slate-700 transition hover:bg-blue-50 hover:text-blue-700"
                                                            >
                                                                <span>✏️</span>
                                                                Rename
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* DOCUMENT TITLE */}
                                    <h3 className="break-words text-base font-semibold text-slate-900 transition group-hover:text-blue-600 sm:text-lg">
                                        {doc.title || "Untitled Document"}
                                    </h3>

                                    <p className="mt-2 text-xs text-slate-500 sm:text-sm">
                                        Last updated: {formatDate(doc.updatedAt)}
                                    </p>

                                    {doc.role && (
                                        <span className="mt-3 inline-block rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium capitalize text-slate-600">
                                            {doc.role}
                                        </span>
                                    )}

                                    {/* CARD FOOTER */}
                                    <div className="mt-5 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-4 sm:mt-6">
                                        <span className="text-[11px] font-medium text-slate-400 sm:text-xs">
                                            SyncDoc Document
                                        </span>

                                        <span className="text-xs font-semibold text-blue-600 transition group-hover:translate-x-1 sm:text-sm">
                                            Open document →
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </section>

                {/* FOOTER */}
                <footer className="mt-10 border-t border-slate-200 py-6 text-center text-xs text-slate-400 sm:mt-12">
                    © {new Date().getFullYear()} SyncDoc. All rights reserved.
                </footer>
            </main>

            {/* CREATE DOCUMENT MODAL */}
            {showCreateModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-900/50 px-4 py-6 backdrop-blur-sm">
                    <form
                        onSubmit={createDocument}
                        onClick={(e) => e.stopPropagation()}
                        className="my-auto w-full max-w-md rounded-2xl bg-white p-5 shadow-2xl sm:p-6"
                    >
                        <div className="mb-5 flex items-start justify-between gap-3">
                            <div>
                                <h2 className="text-xl font-bold text-slate-900">
                                    Create Document
                                </h2>

                                <p className="mt-1 text-sm text-slate-500">
                                    Give your new document a name.
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={() => setShowCreateModal(false)}
                                className="shrink-0 text-2xl leading-none text-slate-400 hover:text-slate-700"
                            >
                                ×
                            </button>
                        </div>

                        <label className="mb-2 block text-sm font-medium text-slate-700">
                            Document Name
                        </label>

                        <input
                            autoFocus
                            type="text"
                            value={newDocumentName}
                            onChange={(e) => setNewDocumentName(e.target.value)}
                            placeholder="Enter document name"
                            maxLength={100}
                            className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                        />

                        {error && (
                            <p className="mt-2 text-sm text-red-600">
                                {error}
                            </p>
                        )}

                        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                            <button
                                type="button"
                                onClick={() => setShowCreateModal(false)}
                                className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 sm:w-auto"
                            >
                                Cancel
                            </button>

                            <button
                                type="submit"
                                disabled={creating}
                                className="w-full rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60 sm:w-auto"
                            >
                                {creating ? "Creating..." : "Create"}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* RENAME DOCUMENT MODAL */}
            {showRenameModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-900/50 px-4 py-6 backdrop-blur-sm">
                    <form
                        onSubmit={renameDocument}
                        onClick={(e) => e.stopPropagation()}
                        className="my-auto w-full max-w-md rounded-2xl bg-white p-5 shadow-2xl sm:p-6"
                    >
                        <div className="mb-5 flex items-start justify-between gap-3">
                            <div>
                                <h2 className="text-xl font-bold text-slate-900">
                                    Rename Document
                                </h2>

                                <p className="mt-1 text-sm text-slate-500">
                                    Enter a new name for this document.
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={() => setShowRenameModal(false)}
                                className="shrink-0 text-2xl leading-none text-slate-400 hover:text-slate-700"
                            >
                                ×
                            </button>
                        </div>

                        <label className="mb-2 block text-sm font-medium text-slate-700">
                            Document Name
                        </label>

                        <input
                            autoFocus
                            type="text"
                            value={renameValue}
                            onChange={(e) => setRenameValue(e.target.value)}
                            placeholder="Enter new document name"
                            maxLength={100}
                            className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                        />

                        {error && (
                            <p className="mt-2 text-sm text-red-600">
                                {error}
                            </p>
                        )}

                        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                            <button
                                type="button"
                                onClick={() => setShowRenameModal(false)}
                                className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 sm:w-auto"
                            >
                                Cancel
                            </button>

                            <button
                                type="submit"
                                disabled={renaming}
                                className="w-full rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60 sm:w-auto"
                            >
                                {renaming ? "Saving..." : "Save Changes"}
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
}
