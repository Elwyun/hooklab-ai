"use client";

import { useState } from "react";
import { useSession, signIn, signOut } from "next-auth/react";
import { registerUser } from "@/lib/auth-actions";
import { useRouter } from "next/navigation";

export default function AuthModal() {
  const { data: session, status, update } = useSession();
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [tab, setTab] = useState<"login" | "register">("login");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const updateField = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const resetForm = () => {
    setFormData({ name: "", email: "", password: "" });
    setError(null);
    setSuccess(false);
    setLoading(false);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const result = await signIn("credentials", {
        email: formData.email,
        password: formData.password,
        redirect: false,
      });

      if (result?.error) {
        setError("Email atau password salah");
      } else {
        setSuccess(true);
        await update();
        setTimeout(() => {
          setShowModal(false);
          resetForm();
          router.refresh();
        }, 1000);
      }
    } catch (err) {
      console.error("[Auth] SignIn error:", err);
      setError("Terjadi kesalahan. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const form = new FormData();
      form.append("name", formData.name);
      form.append("email", formData.email);
      form.append("password", formData.password);

      const result = await registerUser(form);

      if (result.error) {
        setError(result.error);
      } else {
        // Auto login after registration
        const signInResult = await signIn("credentials", {
          email: formData.email,
          password: formData.password,
          redirect: false,
        });

        if (signInResult?.error) {
          setError("Akun berhasil dibuat, tapi gagal login otomatis. Silakan login manual.");
        } else {
          setSuccess(true);
          await update();
          setTimeout(() => {
            setShowModal(false);
            resetForm();
            router.refresh();
          }, 1000);
        }
      }
    } catch (err) {
      console.error("[Auth] Register error:", err);
      setError("Terjadi kesalahan. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await signOut({ redirect: false });
    setShowUserMenu(false);
    router.refresh();
  };

  if (status === "loading") {
    return <div className="h-8 w-8 animate-pulse rounded-full bg-slate-200" />;
  }

  // Logged In — Show User Menu
  if (session?.user) {
    const initials = session.user.name
      ? session.user.name
          .split(" ")
          .map((n) => n[0])
          .join("")
          .toUpperCase()
          .slice(0, 2)
      : session.user.email?.slice(0, 2).toUpperCase() || "U";

    return (
      <div className="relative">
        <button
          onClick={() => setShowUserMenu(!showUserMenu)}
          className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-xs font-semibold text-white ring-2 ring-blue-200 transition-all hover:bg-blue-700"
          title={session.user.name || session.user.email || "User"}
        >
          {initials}
        </button>

        {showUserMenu && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setShowUserMenu(false)} />
            <div className="absolute right-0 top-10 z-50 w-56 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl">
              <div className="border-b border-slate-100 px-4 py-3">
                <p className="text-sm font-medium text-slate-900">
                  {session.user.name || "User"}
                </p>
                <p className="text-xs text-slate-500">{session.user.email}</p>
              </div>
              <div className="p-2">
                <a href="#" className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-700 transition-colors hover:bg-slate-100">
                  📊 Dashboard
                </a>
                <a href="#" className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-700 transition-colors hover:bg-slate-100">
                  ⚙️ Settings
                </a>
                <a href="#" className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-700 transition-colors hover:bg-slate-100">
                  🎯 My Projects
                </a>
              </div>
              <div className="border-t border-slate-100 p-2">
                <button
                  onClick={handleLogout}
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-red-600 transition-colors hover:bg-red-50"
                >
                  🚪 Logout
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    );
  }

  // Not Logged In — Show Login Button / Modal
  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-medium text-white transition-all hover:bg-blue-700"
      >
        <span>🔑</span>
        <span className="hidden sm:inline">Login</span>
      </button>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="absolute inset-0" onClick={() => { setShowModal(false); resetForm(); }} />
          <div className="relative w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
            <button
              onClick={() => { setShowModal(false); resetForm(); }}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-600"
            >
              ✕
            </button>

            <div className="mb-6 text-center">
              <span className="mb-2 inline-block text-3xl">🪝</span>
              <h2 className="text-lg font-bold text-slate-900">
                {tab === "login" ? "Welcome Back!" : "Join HookLab AI"}
              </h2>
              <p className="text-sm text-slate-500">
                {tab === "login" ? "Masuk ke akun Anda" : "Buat akun baru untuk memulai"}
              </p>
            </div>

            {/* Tabs */}
            <div className="mb-6 flex rounded-xl bg-slate-100 p-1">
              <button
                onClick={() => { setTab("login"); setError(null); }}
                className={`flex-1 rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                  tab === "login"
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                Login
              </button>
              <button
                onClick={() => { setTab("register"); setError(null); }}
                className={`flex-1 rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                  tab === "register"
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                Register
              </button>
            </div>

            {success && (
              <div className="mb-4 rounded-xl bg-emerald-50 px-4 py-3 text-center text-sm font-medium text-emerald-700 ring-1 ring-emerald-200">
                ✅ {tab === "login" ? "Login berhasil!" : "Akun berhasil dibuat!"}
              </div>
            )}

            {error && (
              <div className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700 ring-1 ring-red-200">
                {error}
              </div>
            )}

            <form onSubmit={tab === "login" ? handleLogin : handleRegister} className="space-y-4">
              {tab === "register" && (
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-slate-700">Nama Lengkap</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => updateField("name", e.target.value)}
                    placeholder="Nama Anda"
                    required
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                  />
                </div>
              )}

              <div>
                <label className="mb-1.5 block text-xs font-medium text-slate-700">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => updateField("email", e.target.value)}
                  placeholder="email@example.com"
                  required
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-medium text-slate-700">Password</label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => updateField("password", e.target.value)}
                  placeholder={tab === "register" ? "Min. 6 karakter" : "Password Anda"}
                  required
                  minLength={6}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/25 transition-all hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Loading...
                  </>
                ) : tab === "login" ? (
                  "Login"
                ) : (
                  "Buat Akun"
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
