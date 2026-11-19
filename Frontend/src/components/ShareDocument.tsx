
import { useState } from "react";
import axios from "axios";

interface Props {
    documentId: string;
}

export default function ShareDocument({ documentId }: Props) {
    const [email, setEmail] = useState("");
    const [role, setRole] = useState("viewer");
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);

    const token = localStorage.getItem("token");

    const shareDocument = async () => {
        if (!email.trim()) {
            setMessage("Please enter an email address.");
            return;
        }

        try {
            setLoading(true);
            setMessage("");

            await axios.post(
                "https://syncdoc.onrender.com/api/documents/share",
                {
                    documentId,
                    email: email.trim(),
                    role
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            setMessage("Document shared successfully!");
            setEmail("");

        } catch (error) {
            console.error("Share failed:", error);
            setMessage("Failed to share document. Please try again.");

        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex w-full min-w-0 flex-col gap-2">

            {/* Sharing Controls */}
            <div className="flex w-full min-w-0 items-center gap-2">

                {/* Email Input */}
                <input
                    type="email"
                    placeholder="Enter email address"
                    value={email}
                    onChange={(e) => {
                        setEmail(e.target.value);
                        setMessage("");
                    }}
                    onKeyDown={(e) => {
                        if (e.key === "Enter") {
                            shareDocument();
                        }
                    }}
                    className="h-10 min-w-0 flex-1 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                />

                {/* Permission */}
                <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="h-10 w-24 shrink-0 rounded-lg border border-slate-200 bg-white px-2 text-sm text-slate-700 outline-none focus:border-blue-400"
                >
                    <option value="viewer">Viewer</option>
                    <option value="editor">Editor</option>
                </select>

                {/* Share Button */}
                <button
                    type="button"
                    onClick={shareDocument}
                    disabled={loading || !email.trim()}
                    className="h-10 shrink-0 rounded-lg bg-blue-600 px-4 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                    {loading ? "Sharing..." : "Share"}
                </button>

            </div>

            {/* Feedback */}
            {message && (
                <p
                    className={`text-xs ${message.includes("successfully")
                            ? "text-green-600"
                            : "text-red-500"
                        }`}
                    role="status"
                >
                    {message}
                </p>
            )}

        </div>
    );
}
