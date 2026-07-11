"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Scale } from "lucide-react";

export default function SignupPage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    setLoading(true);
    const { error: err } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    });
    setLoading(false);
    if (err) {
      setError(err.message);
      return;
    }
    setSent(true);
  };

  if (sent) {
    return (
      <div className="max-w-sm mx-auto px-5 py-24 text-center">
        <Scale className="mx-auto mb-4 text-chambers" size={40} />
        <h1 className="text-2xl font-display mb-2">Check your email</h1>
        <p className="text-[15px] font-body text-[#4a4335]">
          We sent a confirmation link to <strong>{email}</strong>. Click it to activate your account, then sign in.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-sm mx-auto px-5 py-16">
      <h1 className="text-2xl font-display mb-1 text-center">Create your account</h1>
      <p className="text-sm font-ui text-sage text-center mb-8">Real email/password authentication via Supabase.</p>
      <form onSubmit={submit} className="space-y-4">
        <input
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          placeholder="Full name"
          required
          className="w-full px-4 py-3 rounded-sm border border-parchment2 font-ui text-[15px]"
        />
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
          placeholder="Password (min. 8 characters)"
          required
          className="w-full px-4 py-3 rounded-sm border border-parchment2 font-ui text-[15px]"
        />
        {error && <p className="text-sm text-seal font-ui">{error}</p>}
        <button
          disabled={loading}
          className="w-full px-6 py-3 rounded-sm text-sm font-ui bg-chambers text-parchment disabled:opacity-50"
        >
          {loading ? "Creating account…" : "Sign up"}
        </button>
      </form>
      <p className="text-sm font-ui text-center mt-6 text-sage">
        Already have an account? <Link href="/login" className="text-chambers underline">Sign in</Link>
      </p>
    </div>
  );
}
