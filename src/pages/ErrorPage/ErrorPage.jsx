// 📁 PATH: src/pages/ErrorPage/ErrorPage.jsx  (replace the whole file)
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { FaCapsules, FaHouse, FaTriangleExclamation } from "react-icons/fa6";

const ErrorPage = () => {
    return (
        <>
            <Helmet>
                <title>CureMedix | 404 - Page Not Found</title>
            </Helmet>

            <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-[#020617] px-4 py-10">
                {/* background glow (bottom-right, like the design) */}
                <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_92%_100%,rgba(16,185,129,0.13),transparent_55%),radial-gradient(ellipse_at_50%_55%,rgba(16,185,129,0.04),transparent_60%)]"
                />

                {/* ================= Card ================= */}
                <section className="relative w-full max-w-[460px] rounded-[28px] border border-slate-800/80 bg-[#0c1322] px-6 pb-10 pt-11 text-center shadow-[0_30px_80px_-20px_rgba(0,0,0,0.8)] sm:px-10">
                    {/* logo */}
                    <Link to="/" aria-label="CureMedix home" className="inline-flex items-center gap-2.5">
                        <span className="flex h-[34px] w-[34px] items-center justify-center rounded-[10px] bg-gradient-to-br from-emerald-500 to-teal-600 text-[15px] text-white shadow-lg shadow-emerald-500/30">
                            <FaCapsules />
                        </span>
                        <span className="text-xl font-extrabold tracking-tight text-white">
                            Cure<span className="text-teal-400">Medix</span>
                        </span>
                    </Link>

                    {/* 404 + badge */}
                    <div className="mt-5 flex justify-center">
                        <div className="relative inline-block">
                            <h1 className="bg-gradient-to-b from-white via-slate-100 to-slate-400 bg-clip-text text-[88px] font-extrabold leading-none tracking-tighter text-transparent drop-shadow-[0_6px_18px_rgba(0,0,0,0.5)] sm:text-[104px]">
                                404
                            </h1>
                            <span className="absolute -right-6 -top-2 flex items-center gap-1.5 whitespace-nowrap rounded-full border border-teal-500/30 bg-[#0b2a2e] px-2.5 py-1 text-[9px] font-extrabold uppercase tracking-[0.14em] text-teal-400 sm:-right-8 sm:-top-3">
                                <FaTriangleExclamation className="text-[9px]" />
                                Error
                            </span>
                        </div>
                    </div>

                    {/* text */}
                    <h2 className="mt-4 text-[28px] font-extrabold tracking-tight text-white sm:text-[30px]">
                        Page Not Found
                    </h2>
                    <p className="mx-auto mt-3 max-w-[320px] text-sm leading-[1.65] text-slate-400">
                        The prescription, product, or medical page you are looking for doesn&apos;t exist, has been
                        relocated, or is temporarily unavailable.
                    </p>

                    {/* button */}
                    <Link
                        to="/"
                        className="mt-8 inline-flex items-center justify-center gap-2.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 px-9 py-3.5 text-sm font-bold text-white shadow-[0_12px_28px_-8px_rgba(16,185,129,0.55)] transition hover:brightness-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-400/70 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0c1322]"
                    >
                        <FaHouse className="text-[15px]" />
                        Back to Home
                    </Link>
                </section>

                {/* footer */}
                <p className="relative mt-6 text-center text-xs text-slate-600">
                    &copy; {new Date().getFullYear()} CureMedix Company Ltd. All rights reserved.
                </p>
            </main>
        </>
    );
};

export default ErrorPage;