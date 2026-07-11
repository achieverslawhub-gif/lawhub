"use client";
import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="max-w-sm mx-auto px-5 py-16 text-center font-body">Loading…</div>}>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const params = useSearchParams();
  const supabase = createClient();

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const { error: err } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (err) {
      setError(err.message);
      return;
    }
    router.push(params.get("next") || "/dashboard");
    router.refresh();
  };

  return (
    <div className="max-w-sm mx-auto px-5 py-16">
      <h1 className="text-2xl font-display mb-1 text-center">Sign in</h1>
      <p className="text-sm font-ui text-sage text-center mb-8">Welcome back to Achievers Law Hub.</p>
      <form onSubmit={submit} className="space-y-4">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          required
          className="w-full px-4 py-3 rounded-sm border border-parchment2 font-ui text-[15px]"
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          required
          className="w-full px-4 py-3 rounded-sm border border-parchment2 font-ui text-[15px]"
        />
        {error && <p className="text-sm text-seal font-ui">{error}</p>}
        <button
          disabled={loading}
          className="w-full px-6 py-3 rounded-sm text-sm font-ui bg-chambers text-parchment disabled:opacity-50"
        >
          {loading ? "Signing in…" : "Sign in"}
        </button>
      </form>
      <p className="text-sm font-ui text-center mt-6 text-sage">
        No account yet? <Link href="/signup" className="text-chambers underline">Create one</Link>
      </p>
    </div>
  );
}
