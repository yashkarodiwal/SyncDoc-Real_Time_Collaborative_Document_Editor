import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { socket } from "../services/socket";

interface Message {
    _id?: string;
    message?: string;
    fileUrl?: string;
    sender?: {
        name: string;
    };
    timestamp?: string;
}

interface Props {
    documentId: string;
}

export default function Chat({ documentId }: Props) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [file, setFile] = useState<File | null>(null);
    const [sending, setSending] = useState(false);

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const token = localStorage.getItem("token");
    const user = localStorage.getItem("name") || "User";

    // Scroll to latest message
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({
            behavior: "smooth"
        });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Load chat history
    useEffect(() => {
        let cancelled = false;

        // Store messages received while history is loading.
        let incomingMessages: Message[] = [];

        const loadMessages = async () => {
            try {
                const res = await axios.get(
                    `https://syncdoc.onrender.com/api/chat/${documentId}`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                );

                if (!cancelled) {
                    setMessages((currentMessages) => {
                        const combined = [
                            ...res.data,
                            ...incomingMessages,
                            ...currentMessages
                        ];

                        // Avoid duplicates when messages have IDs.
                        const seen = new Set<string>();

                        return combined.filter((msg) => {
                            if (!msg._id) return true;

                            if (seen.has(msg._id)) return false;

                            seen.add(msg._id);
                            return true;
                        });
                    });
                }
            } catch (error) {
                console.error("Failed to load chat history", error);
            }
        };

        setMessages([]);
        loadMessages();

        // Receive messages for this document.
        const handleReceiveMessage = (data: Message) => {
            incomingMessages.push(data);

            if (!cancelled) {
                setMessages((prev) => {
                    if (
                        data._id &&
                        prev.some((msg) => msg._id === data._id)
                    ) {
                        return prev;
                    }

                    return [...prev, data];
                });
            }
        };

        socket.on("receive-message", handleReceiveMessage);

        return () => {
            cancelled = true;
            socket.off("receive-message", handleReceiveMessage);
        };
    }, [documentId, token]);

    // Send message
    const sendMessage = async () => {
        if ((!input.trim() && !file) || sending) return;

        try {
            setSending(true);

            const formData = new FormData();

            formData.append("documentId", documentId);

            if (input.trim()) {
                formData.append("message", input.trim());
            }

            if (file) {
                formData.append("file", file);
            }

            const res = await axios.post(
                "https://syncdoc.onrender.com/api/chat",
                formData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            socket.emit("send-message", {
                documentId,
                message: res.data.message,
                fileUrl: res.data.fileUrl,
                user
            });

            setInput("");
            setFile(null);

            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }

        } catch (error) {
            console.error("Failed to send message", error);
        } finally {
            setSending(false);
        }
    };

    // Handle Enter key
    const handleKeyDown = (
        e: React.KeyboardEvent<HTMLInputElement>
    ) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    return (
        <div className="flex h-full min-h-0 min-w-0 flex-col overflow-hidden bg-white">

            {/* Messages Area */}

            <div className="flex min-h-0 min-w-0 flex-1 flex-col gap-4 overflow-x-hidden overflow-y-auto p-3 sm:p-4">

                {messages.length === 0 ? (
                    <div className="flex flex-1 flex-col items-center justify-center px-3 text-center">

                        <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-2xl">
                            💬
                        </div>

                        <h3 className="text-sm font-semibold text-slate-700">
                            No messages yet
                        </h3>

                        <p className="mt-1 max-w-[200px] text-xs leading-relaxed text-slate-400">
                            Start a conversation with your collaborators.
                        </p>

                    </div>
                ) : (
                    messages.map((msg, index) => {
                        const senderName = msg.sender?.name || "User";
                        const isOwnMessage = senderName === user;

                        return (
                            <div
                                key={msg._id || index}
                                className={`flex w-full min-w-0 flex-col ${isOwnMessage
                                        ? "items-end"
                                        : "items-start"
                                    }`}
                            >

                                {/* Sender */}

                                <div className="mb-1 flex min-w-0 max-w-full items-center gap-2">
                                    {!isOwnMessage && (
                                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-semibold text-blue-700">
                                            {senderName.charAt(0).toUpperCase()}
                                        </span>
                                    )}

                                    <span className="max-w-full truncate text-xs font-semibold text-slate-600">
                                        {isOwnMessage ? "You" : senderName}
                                    </span>
                                </div>

                                {/* Message Bubble */}

                                <div
                                    className={`w-fit max-w-[95%] min-w-0 overflow-hidden rounded-2xl px-3 py-2 text-sm leading-relaxed ${isOwnMessage
                                            ? "rounded-tr-sm bg-blue-600 text-white"
                                            : "rounded-tl-sm bg-slate-100 text-slate-700"
                                        }`}
                                >
                                    {msg.message && (
                                        <p className="whitespace-pre-wrap break-words [overflow-wrap:anywhere]">
                                            {msg.message}
                                        </p>
                                    )}

                                    {msg.fileUrl && (
                                        <a
                                            href={msg.fileUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className={`mt-2 block break-all text-xs underline ${isOwnMessage
                                                    ? "text-blue-100"
                                                    : "text-blue-600"
                                                }`}
                                        >
                                            📎 View attachment
                                        </a>
                                    )}
                                </div>

                                {msg.timestamp && (
                                    <span className="mt-1 text-[10px] text-slate-400">
                                        {new Date(
                                            msg.timestamp
                                        ).toLocaleTimeString("en-IN", {
                                            hour: "2-digit",
                                            minute: "2-digit"
                                        })}
                                    </span>
                                )}

                            </div>
                        );
                    })
                )}

                <div ref={messagesEndRef} />

            </div>

            {/* Selected File */}

            {file && (
                <div className="flex min-w-0 shrink-0 items-center justify-between gap-2 border-t border-slate-100 bg-blue-50 px-3 py-2">

                    <span className="min-w-0 truncate text-xs text-blue-700">
                        📎 {file.name}
                    </span>

                    <button
                        type="button"
                        onClick={() => {
                            setFile(null);

                            if (fileInputRef.current) {
                                fileInputRef.current.value = "";
                            }
                        }}
                        className="shrink-0 text-xs font-semibold text-red-500 hover:text-red-700"
                    >
                        Remove
                    </button>

                </div>
            )}

            {/* Message Composer */}

            <div className="grid w-full min-w-0 shrink-0 grid-cols-[minmax(0,1fr)_40px_auto] items-center gap-2 border-t border-slate-200 bg-white p-2 sm:p-3">

                {/* Message Input */}

                <input
                    type="text"
                    placeholder="Type a message..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="h-10 w-full min-w-0 rounded-lg border border-slate-200 bg-slate-50 px-2 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100 sm:px-3"
                />

                {/* Attachment Button */}

                <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    title="Attach file"
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-slate-200 text-lg text-slate-500 transition hover:bg-blue-50 hover:text-blue-600"
                >
                    📎
                </button>

                <input
                    type="file"
                    ref={fileInputRef}
                    hidden
                    onChange={(e) => {
                        if (e.target.files?.[0]) {
                            setFile(e.target.files[0]);
                        }
                    }}
                />

                {/* Send Button */}

                <button
                    type="button"
                    onClick={sendMessage}
                    disabled={sending || (!input.trim() && !file)}
                    className="flex h-10 shrink-0 items-center justify-center rounded-lg bg-blue-600 px-3 text-xs font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50 sm:px-4 sm:text-sm"
                >
                    {sending ? "..." : "Send"}
                </button>

            </div>

        </div>
    );
}
