
import { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";

export default function Login() {

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const navigate = useNavigate();

    const login = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const res = await axios.post(
                "https://syncdoc.onrender.com/api/auth/login",
                { email, password }
            );

            localStorage.setItem("token", res.data.token);
            localStorage.setItem("name", res.data.name);

            navigate("/dashboard");

        } catch (err: any) {
            setError(
                err.response?.data?.message || "Login failed. Please try again."
            );
        } finally {
            setLoading(false);
        }
    };

    return (

        <div className="min-h-screen bg-slate-50 text-slate-800 lg:grid lg:grid-cols-2">

            {/* LEFT BRANDING SECTION */}

            <div className="relative hidden min-h-screen flex-col justify-between overflow-hidden bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-100 p-12 lg:flex xl:p-16">

                <div className="absolute -left-32 top-32 h-96 w-96 rounded-full bg-blue-200/60 blur-[100px]" />
                <div className="absolute -bottom-32 right-0 h-96 w-96 rounded-full bg-purple-200/70 blur-[100px]" />

                {/* LOGO */}

                <div className="relative z-10">

                    <Link to="/" className="flex w-fit items-center gap-3">

                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-2xl font-bold text-white shadow-lg">
                            S
                        </div>

                        <span className="text-2xl font-bold text-slate-900">
                            Sync<span className="text-blue-600">Doc</span>
                        </span>

                    </Link>

                </div>


                {/* BRANDING CONTENT */}

                <div className="relative z-10 mt-4 max-w-lg">

                    <span className="mb-7 inline-block rounded-full border border-blue-200 bg-white/70 px-4 py-2 text-sm font-medium text-blue-700">
                        Your workspace, connected
                    </span>

                    <h1 className="text-5xl font-extrabold leading-tight text-slate-900 xl:text-6xl">
                        Great ideas
                        <span className="block bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                            work better
                        </span>
                        together.
                    </h1>

                    <p className="mt-7 text-lg leading-8 text-slate-600">
                        Sign in to your SyncDoc workspace and continue
                        creating, sharing and collaborating with your
                        team in real time.
                    </p>


                    {/* FEATURES */}

                    <div className="mt-10 space-y-5">

                        <div className="flex items-center gap-4">
                            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-100 text-xl text-blue-700">
                                ⚡
                            </div>
                            <div>
                                <p className="font-semibold text-slate-800">
                                    Real-time collaboration
                                </p>
                                <p className="text-sm text-slate-500">
                                    Work together without delays.
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-100 text-xl text-purple-700">
                                ✨
                            </div>
                            <div>
                                <p className="font-semibold text-slate-800">
                                    AI-powered assistance
                                </p>
                                <p className="text-sm text-slate-500">
                                    Make your writing more productive.
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-pink-100 text-xl text-pink-700">
                                💬
                            </div>
                            <div>
                                <p className="font-semibold text-slate-800">
                                    Seamless communication
                                </p>
                                <p className="text-sm text-slate-500">
                                    Keep your team connected.
                                </p>
                            </div>
                        </div>

                    </div>

                </div>


                {/* COPYRIGHT */}

                <p className="relative z-10 mt-8 text-sm text-slate-500">
                    © {new Date().getFullYear()} SyncDoc. All rights reserved.
                </p>

            </div>


            {/* RIGHT LOGIN SECTION */}

            <div className="flex min-h-screen items-center justify-center bg-white px-6 py-12 sm:px-10">

                <div className="w-full max-w-md">

                    {/* MOBILE LOGO */}

                    <div className="mb-10 flex justify-center lg:hidden">

                        <Link to="/" className="flex items-center gap-3">

                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-xl font-bold text-white">
                                S
                            </div>

                            <span className="text-2xl font-bold text-slate-900">
                                Sync<span className="text-blue-600">Doc</span>
                            </span>

                        </Link>

                    </div>


                    {/* HEADING */}

                    <div className="mb-9">

                        <p className="mb-3 text-sm font-bold uppercase tracking-widest text-blue-600">
                            Welcome Back
                        </p>

                        <h2 className="text-3xl font-bold text-slate-900 sm:text-4xl">
                            Sign in to your account
                        </h2>

                        <p className="mt-3 text-slate-500">
                            Enter your credentials to access your workspace.
                        </p>

                    </div>


                    {/* ERROR MESSAGE */}

                    {error && (
                        <div
                            role="alert"
                            className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600"
                        >
                            {error}
                        </div>
                    )}


                    {/* LOGIN FORM */}

                    <form onSubmit={login} className="space-y-6">

                        <div>

                            <label
                                htmlFor="email"
                                className="mb-2 block text-sm font-semibold text-slate-700"
                            >
                                Email Address
                            </label>

                            <input
                                id="email"
                                type="email"
                                placeholder="you@example.com"
                                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                autoComplete="email"
                                required
                            />

                        </div>


                        <div>

                            <label
                                htmlFor="password"
                                className="mb-2 block text-sm font-semibold text-slate-700"
                            >
                                Password
                            </label>

                            <div className="relative">

                                <input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Enter your password"
                                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 pr-20 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    autoComplete="current-password"
                                    required
                                />

                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-blue-600 hover:text-blue-800"
                                >
                                    {showPassword ? "Hide" : "Show"}
                                </button>

                            </div>

                        </div>


                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full rounded-xl bg-blue-600 py-3.5 font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:-translate-y-0.5 hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {loading ? "Signing in..." : "Sign In →"}
                        </button>

                    </form>


                    {/* REGISTER LINK */}

                    <p className="mt-8 text-center text-sm text-slate-500">

                        Don't have an account?{" "}

                        <Link
                            to="/register"
                            className="font-semibold text-blue-600 hover:text-blue-800"
                        >
                            Create an account
                        </Link>

                    </p>


                    {/* HOME LINK */}

                    <div className="mt-8 border-t border-slate-100 pt-6 text-center">

                        <Link
                            to="/"
                            className="text-sm text-slate-500 transition hover:text-blue-600"
                        >
                            ← Back to Homepage
                        </Link>

                    </div>

                </div>

            </div>

        </div>

    );
}
