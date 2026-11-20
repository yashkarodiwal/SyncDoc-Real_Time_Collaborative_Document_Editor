import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

export default function Sidebar() {
    const navigate = useNavigate();
    const location = useLocation();

    const [menuOpen, setMenuOpen] = useState(false);

    const userName = localStorage.getItem("name") || "User";

    const logout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("name");
        setMenuOpen(false);
        navigate("/");
    };

    const navItems = [
        {
            label: "Dashboard",
            icon: "▦",
            path: "/dashboard"
        },
        {
            label: "Documents",
            icon: "▤",
            path: "/dashboard"
        },
        {
            label: "AI Tools",
            icon: "✧",
            path: "/dashboard"
        },
        {
            label: "Users",
            icon: "♙",
            path: "/dashboard"
        }
    ];

    const isDocumentPage = location.pathname.startsWith("/document/");

    const navigateTo = (path: string) => {
        navigate(path);
        setMenuOpen(false);
    };

    const renderNavigation = () => (
        <>
            <p className="mb-4 px-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
                Main Menu
            </p>

            <nav className="space-y-2">
                {navItems.map((item, index) => {
                    const active =
                        index === 0
                            ? location.pathname === "/dashboard"
                            : index === 1
                                ? isDocumentPage
                                : false;

                    return (
                        <button
                            key={item.label}
                            onClick={() => navigateTo(item.path)}
                            className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-medium transition ${active
                                    ? "bg-blue-50 text-blue-700"
                                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                                }`}
                        >
                            <span className="w-5 text-center text-lg">
                                {item.icon}
                            </span>

                            {item.label}

                            {active && (
                                <span className="ml-auto h-2 w-2 rounded-full bg-blue-600" />
                            )}
                        </button>
                    );
                })}
            </nav>
        </>
    );

    const renderWorkspaceCard = () => (
        <div className="mt-10 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 p-4">
            <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-white text-lg shadow-sm">
                ✨
            </div>

            <h3 className="text-sm font-semibold text-slate-800">
                Collaborate better
            </h3>

            <p className="mt-1 text-xs leading-relaxed text-slate-500">
                Create documents and work together with your team in real time.
            </p>

            <button
                onClick={() => navigateTo("/dashboard")}
                className="mt-4 text-xs font-semibold text-blue-600 hover:text-blue-800"
            >
                Go to dashboard →
            </button>
        </div>
    );

    const renderUserProfile = () => (
        <>
            <div className="mb-4 flex items-center gap-3 rounded-xl bg-slate-50 p-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100 font-bold text-blue-700">
                    {userName.charAt(0).toUpperCase()}
                </div>

                <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-slate-800">
                        {userName}
                    </p>

                    <p className="text-xs text-slate-400">
                        Workspace member
                    </p>
                </div>
            </div>

            <button
                onClick={logout}
                className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-slate-600 transition hover:bg-red-50 hover:text-red-600"
            >
                <span className="text-lg">↪</span>
                Logout
            </button>
        </>
    );

    return (
        <>
            {/* DESKTOP SIDEBAR */}
            <aside className="hidden h-screen w-64 min-w-64 shrink-0 flex-col border-r border-slate-200 bg-white md:sticky md:top-0 md:flex">

                {/* BRAND */}
                <div className="flex h-20 shrink-0 items-center gap-3 border-b border-slate-100 px-6">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-xl font-bold text-white shadow-md shadow-blue-200">
                        S
                    </div>

                    <div>
                        <h1 className="text-xl font-bold tracking-tight text-slate-900">
                            SyncDoc
                        </h1>

                        <p className="text-xs text-slate-400">
                            Workspace
                        </p>
                    </div>
                </div>

                {/* NAVIGATION */}
                <div className="min-h-0 flex-1 overflow-y-auto px-4 py-7">
                    {renderNavigation()}
                    {renderWorkspaceCard()}
                </div>

                {/* USER PROFILE */}
                <div className="shrink-0 border-t border-slate-100 p-4">
                    {renderUserProfile()}
                </div>
            </aside>

            {/* MOBILE HEADER */}
            <div className="relative z-40 flex h-16 w-full shrink-0 items-center justify-between border-b border-slate-200 bg-white px-4 md:hidden">

                {/* BRAND */}
                <button
                    onClick={() => navigateTo("/dashboard")}
                    className="flex items-center gap-2"
                >
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-lg font-bold text-white shadow-sm">
                        S
                    </div>

                    <div className="text-left">
                        <h1 className="text-lg font-bold tracking-tight text-slate-900">
                            SyncDoc
                        </h1>

                        <p className="text-[10px] text-slate-400">
                            Workspace
                        </p>
                    </div>
                </button>

                {/* HAMBURGER BUTTON */}
                <button
                    type="button"
                    onClick={(e) => {
                        e.stopPropagation();
                        setMenuOpen(!menuOpen);
                    }}
                    aria-label={menuOpen ? "Close menu" : "Open menu"}
                    aria-expanded={menuOpen}
                    className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-2xl text-slate-700 transition hover:bg-slate-50"
                >
                    {menuOpen ? "×" : "☰"}
                </button>
            </div>

            {/* MOBILE OVERLAY */}
            {menuOpen && (
                <div
                    className="fixed inset-0 z-40 bg-slate-900/40 md:hidden"
                    onClick={() => setMenuOpen(false)}
                />
            )}

            {/* MOBILE SLIDE-IN MENU */}
            <aside
                className={`fixed bottom-0 left-0 top-16 z-50 flex w-72 max-w-[85vw] flex-col border-r border-slate-200 bg-white transition-transform duration-300 ease-in-out md:hidden ${menuOpen
                        ? "translate-x-0 shadow-2xl"
                        : "-translate-x-full shadow-none"
                    }`}
            >
                {/* NAVIGATION */}
                <div className="min-h-0 flex-1 overflow-y-auto px-4 py-7">
                    {renderNavigation()}
                    {renderWorkspaceCard()}
                </div>

                {/* USER PROFILE */}
                <div className="shrink-0 border-t border-slate-100 p-4">
                    {renderUserProfile()}
                </div>
            </aside>
        </>
    );
}
