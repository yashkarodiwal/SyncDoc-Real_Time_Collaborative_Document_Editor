
import { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";

export default function Register() {

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const navigate = useNavigate();

    const register = async (e: React.FormEvent) => {

        e.preventDefault();
        setError("");
        setLoading(true);

        try {

            const res = await axios.post(
                "https://syncdoc.onrender.com/api/auth/register",
                { name, email, password }
            );

            localStorage.setItem("token", res.data.token);
            localStorage.setItem("name", res.data.name);

            navigate("/dashboard");

        } catch (err: any) {

            setError(
                err.response?.data?.message ||
                "Registration failed. Please try again."
            );

        } finally {

            setLoading(false);

        }

    };

    return (

        <div className="min-h-screen bg-slate-50 text-slate-800 lg:grid lg:grid-cols-2">

            {/* LEFT BRANDING SECTION */}

            <div className="relative hidden min-h-screen flex-col justify-between overflow-hidden bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-100 p-12 lg:flex xl:p-16">

                <div className="absolute -right-32 -top-32 h-96 w-96 rounded-full bg-purple-200/60 blur-[100px]" />
                <div className="absolute -bottom-32 left-0 h-96 w-96 rounded-full bg-blue-200/70 blur-[100px]" />

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

                    <span className="mb-7 inline-block rounded-full border border-purple-200 bg-white/70 px-4 py-2 text-sm font-medium text-purple-700">
                        Start collaborating today
                    </span>

                    <h1 className="text-5xl font-extrabold leading-tight text-slate-900 xl:text-6xl">
                        Your ideas.
                        <span className="block bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                            Your team.
                        </span>
                        One workspace.
                    </h1>

                    <p className="mt-7 text-lg leading-8 text-slate-600">
                        Create your SyncDoc account and experience
                        a smarter way to write, collaborate and
                        bring your team's ideas to life.
                    </p>


                    {/* BENEFITS */}

                    <div className="mt-10 space-y-5">

                        <div className="flex items-center gap-4">

                            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-100 text-xl text-blue-700">
                                ✓
                            </div>

                            <div>
                                <p className="font-semibold text-slate-800">
                                    One collaborative workspace
                                </p>
                                <p className="text-sm text-slate-500">
                                    Keep your documents organized.
                                </p>
                            </div>

                        </div>


                        <div className="flex items-center gap-4">

                            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-100 text-xl text-purple-700">
                                ⚡
                            </div>

                            <div>
                                <p className="font-semibold text-slate-800">
                                    Instant synchronization
                                </p>
                                <p className="text-sm text-slate-500">
                                    See document changes in real time.
                                </p>
                            </div>

                        </div>


                        <div className="flex items-center gap-4">

                            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-pink-100 text-xl text-pink-700">
                                ✨
                            </div>

                            <div>
                                <p className="font-semibold text-slate-800">
                                    Smarter document creation
                                </p>
                                <p className="text-sm text-slate-500">
                                    Get assistance with AI-powered tools.
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


            {/* RIGHT REGISTRATION SECTION */}

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

                    <div className="mb-8">

                        <p className="mb-3 text-sm font-bold uppercase tracking-widest text-purple-600">
                            Get Started
                        </p>

                        <h2 className="text-3xl font-bold text-slate-900 sm:text-4xl">
                            Create your account
                        </h2>

                        <p className="mt-3 text-slate-500">
                            Join SyncDoc and start collaborating with your team.
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


                    {/* REGISTRATION FORM */}

                    <form onSubmit={register} className="space-y-5">

                        <div>

                            <label
                                htmlFor="name"
                                className="mb-2 block text-sm font-semibold text-slate-700"
                            >
                                Full Name
                            </label>

                            <input
                                id="name"
                                type="text"
                                placeholder="Enter your full name"
                                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-purple-500 focus:bg-white focus:ring-4 focus:ring-purple-500/10"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                autoComplete="name"
                                required
                            />

                        </div>


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
                                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-purple-500 focus:bg-white focus:ring-4 focus:ring-purple-500/10"
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
                                    placeholder="Create a password"
                                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 pr-20 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-purple-500 focus:bg-white focus:ring-4 focus:ring-purple-500/10"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    autoComplete="new-password"
                                    required
                                />

                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-purple-600 hover:text-purple-800"
                                >
                                    {showPassword ? "Hide" : "Show"}
                                </button>

                            </div>

                        </div>


                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 py-3.5 font-semibold text-white shadow-lg shadow-purple-600/20 transition hover:-translate-y-0.5 hover:from-purple-700 hover:to-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {loading ? "Creating account..." : "Create Account →"}
                        </button>

                    </form>


                    {/* LOGIN LINK */}

                    <p className="mt-8 text-center text-sm text-slate-500">

                        Already have an account?{" "}

                        <Link
                            to="/login"
                            className="font-semibold text-purple-600 hover:text-purple-800"
                        >
                            Sign in
                        </Link>

                    </p>


                    {/* HOME LINK */}

                    <div className="mt-8 border-t border-slate-100 pt-6 text-center">

                        <Link
                            to="/"
                            className="text-sm text-slate-500 transition hover:text-purple-600"
                        >
                            ← Back to Homepage
                        </Link>

                    </div>

                </div>

            </div>

        </div>

    );

}
