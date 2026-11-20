
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

interface JoinResponse {
    success: boolean;
    role?: Role;
    message?: string;
    activeUsers?: string[];
}

export default function Editor({ documentId, onContentChange }: Props) {
    const editorRef = useRef<HTMLDivElement | null>(null);
    const quillRef = useRef<Quill | null>(null);

    const loadedRef = useRef(false);
    const dirtyRef = useRef(false);
    const savingRef = useRef(false);
    const joinedRef = useRef(false);

    const roleRef = useRef<Role>("viewer");
    const onContentChangeRef = useRef(onContentChange);

    const pendingRemoteContentRef = useRef<any>(null);

    const [users, setUsers] = useState<string[]>([]);
    const [saveStatus, setSaveStatus] = useState("Loading...");

    useEffect(() => {
        onContentChangeRef.current = onContentChange;
    }, [onContentChange]);

    // Update editor permissions
    const updateRole = (newRole: Role) => {
        roleRef.current = newRole;

        quillRef.current?.enable(
            newRole === "owner" || newRole === "editor"
        );
    };

    // Filter invalid collaborator names
    const getValidUsers = (activeUsers: unknown): string[] => {
        if (!Array.isArray(activeUsers)) {
            return [];
        }

        return activeUsers.filter(
            (user): user is string =>
                typeof user === "string" && user.trim().length > 0
        ).map((user) => user.trim());
    };

    // 1. INITIALIZE QUILL

    useEffect(() => {
        const editorElement = editorRef.current;

        if (!editorElement || quillRef.current) return;

        // Remove any previously generated toolbar
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

    // 2. SOCKET CONNECTION AND DOCUMENT ROOM

    useEffect(() => {
        const token = localStorage.getItem("token");

        joinedRef.current = false;
        setUsers([]);

        if (!token) {
            console.error("JWT token missing");
            setSaveStatus("Authentication failed");
            return;
        }

        // Set JWT for Socket.IO authentication
        socket.auth = { token };

        // JOIN DOCUMENT
        const joinDocument = () => {
            console.log("Joining document room:", documentId);

            socket.emit(
                "join-document",
                { documentId },
                (response: JoinResponse) => {
                    if (!response?.success) {
                        joinedRef.current = false;
                        setUsers([]);

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

                    // Get active users from server acknowledgement
                    setUsers(getValidUsers(response.activeUsers));

                    console.log("Successfully joined document:", documentId);
                    console.log("User role:", response.role);
                    console.log("Active users:", response.activeUsers);
                }
            );
        };

        // SOCKET CONNECTED
        const handleConnect = () => {
            console.log("Socket connected:", socket.id);
            joinDocument();
        };

        // SOCKET CONNECTION ERROR
        const handleConnectError = (error: Error) => {
            console.error("Socket connection error:", error.message);
            joinedRef.current = false;
            setUsers([]);
        };

        // RECEIVE DOCUMENT CHANGES
        const handleReceiveChanges = (snapshot: any) => {
            const quill = quillRef.current;

            if (!quill) return;

            if (!loadedRef.current) {
                pendingRemoteContentRef.current = snapshot;
                return;
            }

            quill.setContents(snapshot, "api");

            onContentChangeRef.current?.(quill.root.innerHTML);
        };

        // RECEIVE ACTIVE USERS
        const handleActiveUsers = (activeUsers: unknown) => {
            console.log("Active users updated:", activeUsers);

            setUsers(getValidUsers(activeUsers));
        };

        // PERMISSION DENIED
        const handlePermissionDenied = (data: { message: string }) => {
            console.error("Permission denied:", data.message);

            updateRole("viewer");
            dirtyRef.current = false;
            setSaveStatus("Permission denied");
        };

        // Register listeners
        socket.on("connect", handleConnect);
        socket.on("connect_error", handleConnectError);
        socket.on("receive-changes", handleReceiveChanges);
        socket.on("active-users", handleActiveUsers);
        socket.on("permission-denied", handlePermissionDenied);

        // Connect or join existing connection
        if (socket.connected) {
            joinDocument();
        } else {
            socket.connect();
        }

        return () => {
            socket.off("connect", handleConnect);
            socket.off("connect_error", handleConnectError);
            socket.off("receive-changes", handleReceiveChanges);
            socket.off("active-users", handleActiveUsers);
            socket.off("permission-denied", handlePermissionDenied);

            // Leave the document room
            if (joinedRef.current && socket.connected) {
                socket.emit("leave-document", { documentId });
            }

            joinedRef.current = false;
            setUsers([]);
        };
    }, [documentId]);

    // 3. LOAD DOCUMENT

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

                // Apply remote content received before document loading finished
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

    // 4. AUTO-SAVE TO MONGODB

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

    // 5. SAVE STATUS STYLING

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

    // 6. EDITOR UI

    return (
        <div className="syncdoc-editor-shell flex h-full min-h-0 min-w-0 flex-col overflow-hidden bg-white">

            {/* EDITOR HEADER */}

            <div className="flex shrink-0 flex-wrap items-center justify-between gap-2 border-b border-slate-100 px-3 py-3 sm:px-4">
                <div className="min-w-0">
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

            {/* ACTIVE COLLABORATORS */}

            <div className="flex shrink-0 flex-wrap items-center gap-2 border-b border-slate-100 px-3 py-3 sm:px-4">
                <span className="mr-1 text-xs font-medium text-slate-500">
                    Collaborators
                </span>

                {getValidUsers(users).length > 0 ? (
                    getValidUsers(users).map((activeUser, index) => (
                        <span
                            key={`${activeUser}-${index}`}
                            className="inline-flex max-w-full items-center gap-2 rounded-full bg-blue-50 px-3 py-1.5 text-xs font-medium text-blue-700"
                        >
                            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-100 text-[10px] font-bold">
                                {activeUser.charAt(0).toUpperCase()}
                            </span>

                            <span className="truncate">
                                {activeUser}
                            </span>
                        </span>
                    ))
                ) : (
                    <span className="text-xs text-slate-400">
                        No other active collaborators
                    </span>
                )}
            </div>

            {/* QUILL EDITOR */}

            <div
                ref={editorRef}
                className="syncdoc-quill min-h-0 min-w-0 flex-1 overflow-hidden"
            />
        </div>
    );
}
