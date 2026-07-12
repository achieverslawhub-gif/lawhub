"use client";
import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { error: err } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: ${window.location.origin}/update-password,
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
      <div className="max-w-sm mx-auto px-5 py-16 text-center">
        <h1 className="text-2xl font-display mb-2">Check your email</h1>
        <p className="text-sm font-ui text-sage">
          We've sent a password reset link to <strong>{email}</strong>. Click the link in that email to set a new password.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-sm mx-auto px-5 py-16">
      <h1 className="text-2xl font-display mb-1 text-center">Reset your password</h1>
      <p className="text-sm font-ui text-sage text-center mb-8">
        Enter your email and we'll send you a reset link.
      </p>
      <form onSubmit={submit} className="space-y-4">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          required
          className="w-full px-4 py-3 rounded-sm border border-parchment2 font-ui text-[15px]"
        />
        {error && <p className="text-sm text-seal font-ui">{error}</p>}
        <button
          disabled={loading}
          className="w-full px-6 py-3 rounded-sm text-sm font-ui bg-chambers text-parchment disabled:opacity-50"
        >
          {loading ? "Sending…" : "Send reset link"}
        </button>
      </form>
      <p className="text-sm font-ui text-center mt-6 text-sage">
        <Link href="/login" className="text-chambers underline">Back to sign in</Link>
      </p>
    </div>
  );
}