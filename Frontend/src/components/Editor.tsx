
import { useEffect, useRef, useState } from "react";
import Quill from "quill";
import "quill/dist/quill.snow.css";
import axios from "axios";
import { socket } from "../services/socket";

interface Props {
    documentId: string;
    onContentChange?: (content: string) => void;
}

type Role = "owner" | "editor" | "viewer";

export default function Editor({ documentId, onContentChange }: Props) {
    const editorRef = useRef<HTMLDivElement | null>(null);
    const quillRef = useRef<Quill | null>(null);

    const loadedRef = useRef(false);
    const dirtyRef = useRef(false);
    const savingRef = useRef(false);
    const joinedRef = useRef(false);

    const roleRef = useRef<Role>("viewer");
    const onContentChangeRef = useRef(onContentChange);

    // Keep only the latest remote snapshot received during loading.
    const pendingRemoteContentRef = useRef<any>(null);

    const [users, setUsers] = useState<string[]>([]);
    const [saveStatus, setSaveStatus] = useState("Loading...");


    useEffect(() => {
        onContentChangeRef.current = onContentChange;
    }, [onContentChange]);

    const updateRole = (newRole: Role) => {
        roleRef.current = newRole;

        quillRef.current?.enable(
            newRole === "owner" || newRole === "editor"
        );
    };

    // --------------------------------------------------
    // 1. INITIALIZE QUILL
    // --------------------------------------------------


    useEffect(() => {
        const editorElement = editorRef.current;

        if (!editorElement || quillRef.current) return;

        // Remove any leftover Quill toolbars before initialization.
        while (
            editorElement.previousElementSibling?.classList.contains("ql-toolbar")
        ) {
            editorElement.previousElementSibling.remove();
        }

        const quill = new Quill(editorElement, {
            theme: "snow",
            placeholder: "Start writing your document...",
            modules: {
                toolbar: [
                    [{ header: [1, 2, 3, false] }],
                    ["bold", "italic", "underline", "strike"],
                    [{ list: "ordered" }, { list: "bullet" }],
                    ["blockquote", "code-block"],
                    ["link"],
                    ["clean"]
                ]
            }
        });

        quillRef.current = quill;
        quill.enable(false);

        const handleTextChange = (
            _delta: any,
            _oldDelta: any,
            source: string
        ) => {
            if (source !== "user" || !loadedRef.current) return;

            if (
                roleRef.current !== "owner" &&
                roleRef.current !== "editor"
            ) {
                return;
            }

            dirtyRef.current = true;
            setSaveStatus("Unsaved changes");

            const fullDocument = quill.getContents();

            onContentChangeRef.current?.(quill.root.innerHTML);

            if (joinedRef.current && socket.connected) {
                socket.emit("send-changes", {
                    documentId,
                    delta: fullDocument
                });
            }
        };

        quill.on("text-change", handleTextChange);

        return () => {
            quill.off("text-change", handleTextChange);

            // Remove all Quill toolbars created for this editor.
            let previousElement = editorElement.previousElementSibling;

            while (
                previousElement &&
                previousElement.classList.contains("ql-toolbar")
            ) {
                const toolbar = previousElement;
                previousElement = previousElement.previousElementSibling;
                toolbar.remove();
            }

            editorElement.innerHTML = "";
            editorElement.classList.remove("ql-container", "ql-snow");

            quillRef.current = null;
        };
    }, [documentId]);

    // --------------------------------------------------
    // 2. SOCKET CONNECTION AND DOCUMENT ROOM
    // --------------------------------------------------

    useEffect(() => {
        const token = localStorage.getItem("token");

        if (!token) {
            console.error("JWT token missing");
            setSaveStatus("Authentication failed");
            return;
        }

        socket.auth = { token };
        joinedRef.current = false;

        const joinDocument = () => {
            socket.emit(
                "join-document",
                { documentId },
                (response: {
                    success: boolean;
                    role?: Role;
                    message?: string;
                }) => {
                    if (!response?.success) {
                        joinedRef.current = false;
                        console.error(
                            "Failed to join document:",
                            response?.message
                        );
                        return;
                    }

                    joinedRef.current = true;

                    if (response.role) {
                        updateRole(response.role);
                    }

                    console.log(
                        "Joined document:",
                        documentId,
                        "Role:",
                        response.role
                    );
                }
            );
        };

        // Receive a complete document snapshot.
        const handleReceiveChanges = (snapshot: any) => {
            const quill = quillRef.current;

            if (!quill) return;

            // If initial document loading is not complete,
            // keep the latest received snapshot.
            if (!loadedRef.current) {
                pendingRemoteContentRef.current = snapshot;
                return;
            }

            // Replace the entire document instead of applying
            // an incremental delta.
            quill.setContents(snapshot, "api");

            onContentChangeRef.current?.(quill.root.innerHTML);
        };

        const handleActiveUsers = (activeUsers: string[]) => {
            setUsers(activeUsers);
        };

        const handlePermissionDenied = (data: { message: string }) => {
            console.error("Permission denied:", data.message);

            updateRole("viewer");
            setSaveStatus("Permission denied");
        };

        socket.on("connect", joinDocument);
        socket.on("receive-changes", handleReceiveChanges);
        socket.on("active-users", handleActiveUsers);
        socket.on("permission-denied", handlePermissionDenied);

        if (socket.connected) {
            joinDocument();
        } else {
            socket.connect();
        }

        return () => {
            socket.off("connect", joinDocument);
            socket.off("receive-changes", handleReceiveChanges);
            socket.off("active-users", handleActiveUsers);
            socket.off("permission-denied", handlePermissionDenied);

            if (joinedRef.current && socket.connected) {
                socket.emit("leave-document", { documentId });
            }

            joinedRef.current = false;
        };
    }, [documentId]);

    // --------------------------------------------------
    // 3. LOAD DOCUMENT
    // --------------------------------------------------

    useEffect(() => {
        let cancelled = false;

        const loadDocument = async () => {
            loadedRef.current = false;
            dirtyRef.current = false;
            pendingRemoteContentRef.current = null;

            updateRole("viewer");
            setSaveStatus("Loading...");

            const quill = quillRef.current;

            if (quill) {
                quill.setText("", "silent");
            }

            try {
                const token = localStorage.getItem("token");

                const response = await axios.get(
                    `https://syncdoc.onrender.com/api/documents/${documentId}`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                );

                if (cancelled || !quillRef.current) return;

                const currentQuill = quillRef.current;

                const content = response.data.content || "";
                const userRole: Role = response.data.role;

                updateRole(userRole);

                currentQuill.clipboard.dangerouslyPasteHTML(
                    content,
                    "silent"
                );

                loadedRef.current = true;
                dirtyRef.current = false;

                // Apply the latest snapshot received while loading.
                const pendingSnapshot =
                    pendingRemoteContentRef.current;

                pendingRemoteContentRef.current = null;

                if (pendingSnapshot) {
                    currentQuill.setContents(
                        pendingSnapshot,
                        "api"
                    );
                }

                onContentChangeRef.current?.(
                    currentQuill.root.innerHTML
                );

                setSaveStatus("Saved");

                console.log("Document loaded:", documentId);
                console.log("User role:", userRole);

            } catch (error) {
                if (cancelled) return;

                console.error("Document loading failed:", error);
                setSaveStatus("Load failed");
            }
        };

        loadDocument();

        return () => {
            cancelled = true;
            loadedRef.current = false;
        };
    }, [documentId]);

    // --------------------------------------------------
    // 4. AUTO-SAVE TO MONGODB
    // --------------------------------------------------

    useEffect(() => {
        const saveDocument = async () => {
            const quill = quillRef.current;

            if (
                !quill ||
                !loadedRef.current ||
                !dirtyRef.current ||
                savingRef.current
            ) {
                return;
            }

            if (
                roleRef.current !== "owner" &&
                roleRef.current !== "editor"
            ) {
                return;
            }

            savingRef.current = true;

            const contentToSave = quill.root.innerHTML;

            try {
                const token = localStorage.getItem("token");

                setSaveStatus("Saving...");

                await axios.put(
                    `https://syncdoc.onrender.com/api/documents/${documentId}`,
                    { content: contentToSave },
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                );

                // Only mark as saved if no new typing occurred
                // while this request was in progress.
                if (quill.root.innerHTML === contentToSave) {
                    dirtyRef.current = false;
                    setSaveStatus("Saved");
                } else {
                    setSaveStatus("Unsaved changes");
                }

            } catch (error) {
                console.error("Auto-save failed:", error);

                if (axios.isAxiosError(error)) {
                    console.error(
                        "HTTP status:",
                        error.response?.status,
                        "Response:",
                        error.response?.data
                    );

                    if (error.response?.status === 403) {
                        updateRole("viewer");
                        dirtyRef.current = false;
                        setSaveStatus("Permission denied");
                    } else {
                        setSaveStatus("Save failed");
                    }
                } else {
                    setSaveStatus("Save failed");
                }

            } finally {
                savingRef.current = false;
            }
        };

        const interval = setInterval(saveDocument, 1000);

        return () => clearInterval(interval);
    }, [documentId]);

    // --------------------------------------------------
    // 5. SAVE STATUS STYLING
    // --------------------------------------------------

    const statusColor =
        saveStatus === "Saved"
            ? "bg-green-500"
            : saveStatus === "Save failed" ||
                saveStatus === "Load failed" ||
                saveStatus === "Permission denied" ||
                saveStatus === "Authentication failed"
                ? "bg-red-500"
                : "bg-amber-500";

    const statusTextColor =
        saveStatus === "Saved"
            ? "text-green-700"
            : saveStatus === "Save failed" ||
                saveStatus === "Load failed" ||
                saveStatus === "Permission denied" ||
                saveStatus === "Authentication failed"
                ? "text-red-600"
                : "text-amber-700";

    // --------------------------------------------------
    // 6. EDITOR UI
    // --------------------------------------------------

    return (
        <div className="flex h-full min-h-0 min-w-0 flex-col overflow-hidden bg-white">

            {/* Editor Header */}

            <div className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-4 py-3">
                <div>
                    <h3 className="text-sm font-semibold text-slate-800">
                        Writing Area
                    </h3>

                    <p className="mt-1 text-xs text-slate-400">
                        Your ideas, organized in one place
                    </p>
                </div>

                <div className="flex shrink-0 items-center gap-2 text-xs">
                    <span
                        className={`h-2 w-2 rounded-full ${statusColor}`}
                    />

                    <span className={`font-medium ${statusTextColor}`}>
                        {saveStatus}
                    </span>
                </div>
            </div>

            {/* Active Collaborators */}

            <div className="flex shrink-0 flex-wrap items-center gap-2 border-b border-slate-100 px-4 py-3">
                <span className="mr-1 text-xs font-medium text-slate-500">
                    Collaborators
                </span>

                {users.length > 0 ? (
                    users.map((activeUser, index) => (
                        <span
                            key={`${activeUser}-${index}`}
                            className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1.5 text-xs font-medium text-blue-700"
                        >
                            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-100 text-[10px] font-bold">
                                {activeUser.charAt(0).toUpperCase()}
                            </span>

                            {activeUser}
                        </span>
                    ))
                ) : (
                    <span className="text-xs text-slate-400">
                        No other active collaborators
                    </span>
                )}
            </div>

            {/* Quill Editor */}

            <div
                ref={editorRef}
                className="syncdoc-quill min-h-0 min-w-0 flex-1 overflow-hidden"
            />
        </div>
    );
}
