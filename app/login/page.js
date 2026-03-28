"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to log in");
      }
      router.push("/chat");
      router.refresh(); // Ensure the layout/cookies catch the new session
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-surface font-body text-on-surface min-h-screen flex items-center justify-center relative overflow-hidden">
      <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-primary opacity-10 blur-[100px] rounded-full"></div>
      <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-96 h-96 bg-primary-container opacity-10 blur-[100px] rounded-full"></div>

      <div className="w-full max-w-md bg-surface-container-low border border-outline-variant/30 rounded-2xl shadow-2xl p-8 backdrop-blur-md relative z-10">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-primary flex items-center justify-center rounded-lg shadow-lg rotate-3 mx-auto mb-4">
            <span className="text-surface font-serif italic font-bold text-2xl">ET</span>
          </div>
          <h1 className="text-3xl font-serif italic font-bold text-on-surface tracking-tight">Access your Twin</h1>
          <p className="text-sm text-on-surface/60 mt-2">Resume your private digital office</p>
        </div>

        {error && (
          <div className="mb-6 p-3 bg-red-500/10 border border-red-500/20 rounded text-red-600 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wide text-on-surface/70 mb-2">Email</label>
            <input
              type="email"
              required
              disabled={isLoading}
              className="w-full bg-surface-container-lowest border border-outline-variant/50 rounded-lg px-4 py-3 text-on-surface focus:outline-none focus:border-primary transition-colors"
              placeholder="satoshi@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wide text-on-surface/70 mb-2">Password</label>
            <input
              type="password"
              required
              disabled={isLoading}
              className="w-full bg-surface-container-lowest border border-outline-variant/50 rounded-lg px-4 py-3 text-on-surface focus:outline-none focus:border-primary transition-colors"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-primary text-surface py-3 rounded-lg font-bold text-sm shadow-lg hover:bg-primary-container transition-colors disabled:opacity-50"
          >
            {isLoading ? "Authenticating..." : "Enter Office"}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-on-surface/60">
          Don&apos;t have a Twin yet?{" "}
          <a href="/signup" className="text-primary font-bold hover:underline">
            Initialize Now
          </a>
        </div>
      </div>
    </div>
  );
}
