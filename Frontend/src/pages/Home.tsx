
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

function Home() {
    const [isDark, setIsDark] = useState(() => {
        return localStorage.getItem("syncdoc-theme") === "dark";
    });

    useEffect(() => {
        localStorage.setItem(
            "syncdoc-theme",
            isDark ? "dark" : "light"
        );
    }, [isDark]);

    const theme = {
        page: isDark ? "bg-slate-950 text-slate-100" : "bg-white text-slate-800",
        nav: isDark
            ? "border-slate-800 bg-slate-950/90"
            : "border-slate-200 bg-white/90",
        heading: isDark ? "text-white" : "text-slate-900",
        text: isDark ? "text-slate-400" : "text-slate-500",
        section: isDark ? "bg-slate-900" : "bg-slate-50",
        card: isDark
            ? "border-slate-700 bg-slate-900 shadow-black/20"
            : "border-slate-200 bg-white shadow-sm",
        preview: isDark
            ? "border-slate-700 bg-slate-900"
            : "border-slate-200 bg-white",
        previewLine: isDark ? "bg-slate-700" : "bg-slate-100",
        toggle: isDark
            ? "border-slate-700 bg-slate-800 text-yellow-300 hover:bg-slate-700"
            : "border-slate-200 bg-white text-slate-700 hover:bg-slate-100",
        footer: isDark
            ? "border-slate-800 bg-slate-900"
            : "border-slate-200 bg-slate-50",
    };

    const toggleTheme = () => {
        setIsDark((previous) => !previous);
    };

    return (
        <div className={`min-h-screen overflow-hidden transition-colors duration-300 ${theme.page}`}>

            {/* NAVBAR */}
            <nav className={`fixed top-0 z-50 w-full border-b backdrop-blur-xl transition-colors duration-300 ${theme.nav}`}>
                <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">

                    <Link to="/" className="flex items-center gap-2">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-xl font-bold text-white shadow-lg">
                            S
                        </div>

                        <span className={`text-2xl font-bold tracking-tight ${theme.heading}`}>
                            Sync<span className="text-blue-600">Doc</span>
                        </span>
                    </Link>

                    <div className={`hidden items-center gap-8 text-sm font-medium md:flex ${theme.text}`}>
                        <a href="#home" className="transition hover:text-blue-500">Home</a>
                        <a href="#features" className="transition hover:text-blue-500">Features</a>
                        <a href="#how-it-works" className="transition hover:text-blue-500">How It Works</a>
                        <a href="#about" className="transition hover:text-blue-500">About</a>
                    </div>

                    <div className="flex items-center gap-3">

                        {/* THEME TOGGLE */}
                        <button
                            onClick={toggleTheme}
                            type="button"
                            aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
                            className={`flex h-10 items-center gap-2 rounded-lg border px-3 text-sm font-semibold transition ${theme.toggle}`}
                        >
                            <span className="text-lg">
                                {isDark ? "☀️" : "🌙"}
                            </span>
                            <span className="hidden sm:inline">
                                {isDark ? "Light Mode" : "Dark Mode"}
                            </span>
                        </button>

                        <Link
                            to="/login"
                            className={`hidden rounded-lg px-4 py-2 text-sm font-semibold transition hover:text-blue-500 sm:block ${theme.heading}`}
                        >
                            Login
                        </Link>

                        <Link
                            to="/register"
                            className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md transition hover:bg-blue-700"
                        >
                            Get Started
                        </Link>
                    </div>

                </div>
            </nav>


            {/* HERO SECTION */}
            <section id="home" className="relative flex min-h-screen items-center px-6 pb-20 pt-32">

                <div className={`absolute -left-40 top-40 h-96 w-96 rounded-full blur-[110px] ${isDark ? "bg-blue-900/30" : "bg-blue-100"}`} />
                <div className={`absolute -right-40 bottom-20 h-96 w-96 rounded-full blur-[110px] ${isDark ? "bg-purple-900/30" : "bg-purple-100"}`} />

                <div className="relative mx-auto grid max-w-7xl items-center gap-16 lg:grid-cols-2">

                    <div className="text-center lg:text-left">

                        <div className={`mb-7 inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium ${isDark ? "border-blue-900 bg-blue-950 text-blue-300" : "border-blue-100 bg-blue-50 text-blue-700"}`}>
                            <span className="h-2 w-2 animate-pulse rounded-full bg-green-500" />
                            Real-time collaborative workspace
                        </div>

                        <h1 className={`text-5xl font-extrabold leading-tight tracking-tight sm:text-6xl lg:text-7xl ${theme.heading}`}>
                            Create.
                            <span className="block bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 bg-clip-text text-transparent">
                                Collaborate.
                            </span>
                            Sync.
                        </h1>

                        <p className={`mx-auto mt-7 max-w-xl text-lg leading-8 lg:mx-0 ${theme.text}`}>
                            Bring your team together with SyncDoc.
                            Create documents, collaborate in real time,
                            share ideas and boost productivity with
                            AI-powered assistance.
                        </p>

                        <div className="mt-10 flex flex-col justify-center gap-4 sm:flex-row lg:justify-start">

                            <Link
                                to="/register"
                                className="rounded-xl bg-blue-600 px-8 py-4 text-center font-semibold text-white shadow-xl transition hover:-translate-y-1 hover:bg-blue-700"
                            >
                                Get Started Free →
                            </Link>

                            <Link
                                to="/login"
                                className={`rounded-xl border px-8 py-4 text-center font-semibold shadow-sm transition hover:border-blue-400 ${isDark ? "border-slate-700 bg-slate-900 text-slate-200 hover:bg-slate-800" : "border-slate-200 bg-white text-slate-700 hover:bg-blue-50"}`}
                            >
                                Login to Workspace
                            </Link>

                        </div>

                        <p className={`mt-6 text-sm ${theme.text}`}>
                            Work smarter. Collaborate better. Stay in sync.
                        </p>

                    </div>


                    {/* DOCUMENT PREVIEW */}
                    <div className="relative">

                        <div className={`absolute inset-0 rounded-3xl blur-3xl ${isDark ? "bg-gradient-to-r from-blue-900/30 to-purple-900/30" : "bg-gradient-to-r from-blue-200/50 to-purple-200/50"}`} />

                        <div className={`relative overflow-hidden rounded-2xl border shadow-2xl ${theme.preview}`}>

                            <div className={`flex items-center justify-between border-b px-5 py-4 ${isDark ? "border-slate-700" : "border-slate-100"}`}>

                                <div className="flex items-center gap-2">
                                    <span className="h-3 w-3 rounded-full bg-red-400" />
                                    <span className="h-3 w-3 rounded-full bg-yellow-400" />
                                    <span className="h-3 w-3 rounded-full bg-green-400" />
                                </div>

                                <span className={`text-xs font-medium ${theme.text}`}>
                                    SyncDoc Workspace
                                </span>

                                <span className="rounded-full bg-green-500/10 px-3 py-1 text-xs font-medium text-green-500">
                                    ● Live
                                </span>

                            </div>

                            <div className="p-6 sm:p-8">

                                <div className="mb-6 flex items-center justify-between">

                                    <div>
                                        <p className={`text-xs font-semibold ${theme.text}`}>
                                            DOCUMENT
                                        </p>
                                        <h3 className={`mt-1 text-xl font-bold ${theme.heading}`}>
                                            Team Project Plan
                                        </h3>
                                    </div>

                                    <div className="flex -space-x-2">
                                        <div className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-white bg-blue-500 text-xs font-bold text-white">A</div>
                                        <div className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-white bg-purple-500 text-xs font-bold text-white">R</div>
                                        <div className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-white bg-pink-500 text-xs font-bold text-white">Y</div>
                                    </div>

                                </div>

                                <div className="space-y-6">

                                    <div>
                                        <h4 className="mb-3 text-lg font-semibold text-blue-500">
                                            Project Overview
                                        </h4>

                                        <div className="space-y-3">
                                            <div className={`h-2 w-full rounded-full ${theme.previewLine}`} />
                                            <div className={`h-2 w-5/6 rounded-full ${theme.previewLine}`} />
                                            <div className={`h-2 w-4/6 rounded-full ${theme.previewLine}`} />
                                        </div>
                                    </div>

                                    <div>
                                        <h4 className="mb-3 text-lg font-semibold text-purple-500">
                                            Project Objectives
                                        </h4>

                                        <div className="space-y-4">
                                            <div className="flex items-center gap-3">
                                                <span className="h-2 w-2 rounded-full bg-blue-500" />
                                                <div className={`h-2 w-4/5 rounded-full ${theme.previewLine}`} />
                                            </div>

                                            <div className="flex items-center gap-3">
                                                <span className="h-2 w-2 rounded-full bg-purple-500" />
                                                <div className={`h-2 w-3/5 rounded-full ${theme.previewLine}`} />
                                            </div>

                                            <div className="flex items-center gap-3">
                                                <span className="h-2 w-2 rounded-full bg-pink-500" />
                                                <div className={`h-2 w-4/6 rounded-full ${theme.previewLine}`} />
                                            </div>
                                        </div>
                                    </div>

                                    <div className={`rounded-xl border p-4 ${isDark ? "border-blue-900 bg-blue-950/50" : "border-blue-100 bg-blue-50"}`}>

                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-sm font-semibold text-blue-500">
                                                    Live Collaboration
                                                </p>
                                                <p className={`mt-1 text-xs ${theme.text}`}>
                                                    Your team is working together
                                                </p>
                                            </div>
                                            <span className="text-2xl">⚡</span>
                                        </div>

                                    </div>

                                </div>

                            </div>

                        </div>

                    </div>

                </div>

            </section>


            {/* FEATURES SECTION */}
            <section id="features" className={`border-t px-6 py-24 transition-colors duration-300 ${isDark ? "border-slate-800 bg-slate-900" : "border-slate-100 bg-slate-50"}`}>

                <div className="mx-auto max-w-7xl">

                    <div className="mx-auto mb-16 max-w-2xl text-center">

                        <p className="mb-4 text-sm font-bold uppercase tracking-widest text-blue-500">
                            Powerful Features
                        </p>

                        <h2 className={`text-3xl font-bold sm:text-5xl ${theme.heading}`}>
                            Everything your team needs
                        </h2>

                        <p className={`mt-5 leading-7 ${theme.text}`}>
                            A collaborative workspace designed to make
                            teamwork easier, faster and more productive.
                        </p>

                    </div>

                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">

                        {[
                            {
                                icon: "⚡",
                                title: "Real-time Editing",
                                description: "Edit documents together and see changes from collaborators in real time.",
                                color: "blue"
                            },
                            {
                                icon: "🤖",
                                title: "AI Assistance",
                                description: "Improve your writing and get AI-powered assistance while working on documents.",
                                color: "purple"
                            },
                            {
                                icon: "💬",
                                title: "Team Chat",
                                description: "Communicate with collaborators and exchange ideas within your workspace.",
                                color: "pink"
                            },
                            {
                                icon: "🔒",
                                title: "Document Sharing",
                                description: "Share documents with team members and manage access to your documents.",
                                color: "green"
                            }
                        ].map((feature) => (
                            <div
                                key={feature.title}
                                className={`rounded-2xl border p-7 shadow-sm transition hover:-translate-y-2 hover:shadow-xl ${theme.card}`}
                            >
                                <div className={`mb-6 flex h-14 w-14 items-center justify-center rounded-xl text-3xl ${isDark ? "bg-slate-800" : "bg-slate-50"}`}>
                                    {feature.icon}
                                </div>

                                <h3 className={`mb-3 text-xl font-bold ${theme.heading}`}>
                                    {feature.title}
                                </h3>

                                <p className={`text-sm leading-7 ${theme.text}`}>
                                    {feature.description}
                                </p>
                            </div>
                        ))}

                    </div>

                </div>

            </section>


            {/* HOW IT WORKS */}
            <section id="how-it-works" className="px-6 py-24">

                <div className="mx-auto max-w-7xl">

                    <div className="mb-16 text-center">
                        <p className="mb-4 text-sm font-bold uppercase tracking-widest text-purple-500">
                            Simple Workflow
                        </p>

                        <h2 className={`text-3xl font-bold sm:text-5xl ${theme.heading}`}>
                            How SyncDoc Works
                        </h2>

                        <p className={`mt-5 ${theme.text}`}>
                            Get started with collaborative document editing in three simple steps.
                        </p>
                    </div>

                    <div className="grid gap-10 md:grid-cols-3">

                        {[
                            {
                                number: "01",
                                title: "Create a Document",
                                description: "Create a new document in your SyncDoc workspace.",
                                color: "blue"
                            },
                            {
                                number: "02",
                                title: "Invite Collaborators",
                                description: "Share your document and invite teammates to collaborate.",
                                color: "purple"
                            },
                            {
                                number: "03",
                                title: "Collaborate in Real Time",
                                description: "Edit, communicate and work together from anywhere.",
                                color: "pink"
                            }
                        ].map((step, index) => (
                            <div key={step.number} className="text-center">

                                <div className={`mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl text-2xl font-bold ${isDark ? "bg-slate-800 text-blue-400" : index === 0 ? "bg-blue-50 text-blue-600" : index === 1 ? "bg-purple-50 text-purple-600" : "bg-pink-50 text-pink-600"}`}>
                                    {step.number}
                                </div>

                                <h3 className={`mb-3 text-xl font-bold ${theme.heading}`}>
                                    {step.title}
                                </h3>

                                <p className={`leading-7 ${theme.text}`}>
                                    {step.description}
                                </p>

                            </div>
                        ))}

                    </div>

                </div>

            </section>


            {/* CTA SECTION */}
            <section id="about" className="px-6 py-20">

                <div className={`relative mx-auto max-w-5xl overflow-hidden rounded-3xl border p-10 text-center sm:p-16 ${isDark ? "border-blue-900 bg-gradient-to-br from-slate-900 via-blue-950 to-purple-950" : "border-blue-100 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50"}`}>

                    <div className={`absolute -right-20 -top-20 h-64 w-64 rounded-full blur-3xl ${isDark ? "bg-purple-700/20" : "bg-purple-200/50"}`} />

                    <div className="relative">

                        <h2 className={`text-3xl font-bold sm:text-5xl ${theme.heading}`}>
                            Ready to transform the way you collaborate?
                        </h2>

                        <p className={`mx-auto mt-6 max-w-2xl leading-7 ${theme.text}`}>
                            Bring your ideas together, work with your team
                            and experience seamless document collaboration
                            with SyncDoc.
                        </p>

                        <Link
                            to="/register"
                            className="mt-9 inline-block rounded-xl bg-blue-600 px-9 py-4 font-semibold text-white shadow-lg transition hover:-translate-y-1 hover:bg-blue-700"
                        >
                            Start Collaborating →
                        </Link>

                    </div>

                </div>

            </section>


            {/* FOOTER */}
            <footer className={`border-t px-6 py-10 transition-colors duration-300 ${theme.footer}`}>

                <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 sm:flex-row">

                    <Link to="/" className={`text-2xl font-bold ${theme.heading}`}>
                        Sync<span className="text-blue-600">Doc</span>
                    </Link>

                    <p className={`text-center text-sm ${theme.text}`}>
                        © {new Date().getFullYear()} SyncDoc. All rights reserved.
                    </p>

                    <div className={`flex gap-6 text-sm ${theme.text}`}>
                        <Link to="/login" className="transition hover:text-blue-500">Login</Link>
                        <Link to="/register" className="transition hover:text-blue-500">Register</Link>
                    </div>

                </div>

            </footer>

        </div>
    );
}

export default Home;
